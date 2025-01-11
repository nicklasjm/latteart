import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      console.log('No file received')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('File received:', file.name, 'Size:', file.size)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), 'public/uploads')
    console.log('Uploads directory:', uploadsDir)

    try {
      await mkdir(uploadsDir, { recursive: true })
      console.log('Directory created/verified')
    } catch (mkdirError) {
      console.error('mkdir error:', mkdirError)
      throw mkdirError
    }

    const uniqueName = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadsDir, uniqueName)
    console.log('Attempting to save to:', filePath)

    try {
      await writeFile(filePath, buffer)
      console.log('File written successfully')
    } catch (writeError) {
      console.error('writeFile error:', writeError)
      throw writeError
    }

    // Add error handling for OpenAI
    let description = ''
    try {
      const openai = new OpenAI()
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this image in detail" },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${buffer.toString('base64')}`
                }
              }
            ],
          },
        ],
        max_tokens: 500,
      })
      description = response.choices[0].message.content || ''
      console.log('OpenAI response received')
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError)
      // Continue without description if OpenAI fails
      description = 'Image description unavailable'
    }

    return NextResponse.json({ 
      success: true, 
      imagePath: `/uploads/${uniqueName}`,
      description 
    })
  } catch (error) {
    // Log the full error
    console.error('Upload error details:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


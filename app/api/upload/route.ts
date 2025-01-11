import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      console.log('No file received')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public/uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Save file with unique name
    const uniqueName = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadsDir, uniqueName)
    await writeFile(filePath, buffer)
    
    console.log('File saved:', uniqueName)  // Log the saved file

    // Get ChatGPT analysis
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

    const description = response.choices[0].message.content

    // Save to Redis or your database
    // ... your storage logic here ...

    return NextResponse.json({ 
      success: true, 
      imagePath: `/uploads/${uniqueName}`,
      description 
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}


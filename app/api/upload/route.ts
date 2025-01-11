import cloudinary from '@/utils/cloudinary'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(base64File, {
        folder: 'uploads'
      }, (error, result) => {
        if (error) reject(error)
        else resolve(result)
      })
    })

    // Get image analysis from OpenAI
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
                  url: base64File
                }
              }
            ],
          },
        ],
        max_tokens: 500,
      })
      description = response.choices[0].message.content || ''
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError)
      description = 'Image description unavailable'
    }

    return NextResponse.json({ 
      success: true, 
      imagePath: (uploadResponse as any).secure_url,
      description 
    })
  } catch (error) {
    console.error('Upload error details:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


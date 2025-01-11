import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
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
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${uuidv4()}.webp`

    // Compress and convert image to WebP
    const compressedImageBuffer = await sharp(buffer)
      .resize(800) // Resize to max width of 800px
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toBuffer()

    // Save the compressed image
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    await writeFile(path.join(uploadDir, filename), compressedImageBuffer)

    // Analyze image with ChatGPT
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image in a concise manner." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/webp;base64,${compressedImageBuffer.toString('base64')}`,
              },
            },
          ],
        },
      ],
    })

    const description = response.choices[0]?.message?.content || 'No description available'

    // In a real application, you would save this data to a database
    // For now, we'll just return the data
    const imageData = {
      id: uuidv4(),
      url: `/uploads/${filename}`,
      description,
    }

    return NextResponse.json(imageData)
  } catch (error) {
    console.error('Error processing upload:', error)
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 })
  }
}


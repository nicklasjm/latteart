import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()
    
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
              image_url: { url: imageUrl }
            }
          ],
        },
      ],
      max_tokens: 500,
    })

    const description = response.choices[0].message.content

    return NextResponse.json({ 
      success: true,
      imagePath: imageUrl,
      description 
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ 
      error: 'Analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 
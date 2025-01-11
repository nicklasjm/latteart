import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey) {
    // Don't return the actual key, just confirm it's set
    return NextResponse.json({ status: 'OpenAI API key is set' }, { status: 200 })
  } else {
    return NextResponse.json({ status: 'OpenAI API key is not set' }, { status: 500 })
  }
}


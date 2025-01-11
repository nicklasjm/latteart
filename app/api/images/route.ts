import { readdir, mkdir } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public/uploads')
    
    await mkdir(uploadsDir, { recursive: true })
    
    const files = await readdir(uploadsDir)
    
    const images = files.map(file => ({
      path: `/uploads/${file}`,
      description: 'Your stored description here'
    }))

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error reading images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}


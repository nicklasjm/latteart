import { readdir } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public/uploads')
    
    // Create directory if it doesn't exist
    await fs.promises.mkdir(uploadsDir, { recursive: true })
    
    const files = await readdir(uploadsDir)
    
    // Get image data from your Redis or database
    // This is where you'd match up images with their descriptions
    const images = files.map(file => ({
      path: `/uploads/${file}`,
      description: 'Your stored description here' // Get this from your database
    }))

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error reading images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}


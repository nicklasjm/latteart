import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  const files = fs.readdirSync(uploadDir)

  const images = files
    .filter(file => file !== '.gitkeep') // Exclude the .gitkeep file
    .map(file => ({
      id: path.parse(file).name,
      url: `/uploads/${file}`,
      description: 'A generated description would go here.' // In a real app, this would be fetched from a database
    }))

  return NextResponse.json(images)
}


import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// This is a mock implementation. In a real application, you would fetch this data from a database.
export async function GET() {
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  const files = fs.readdirSync(uploadDir)

  const images = files.map(file => ({
    id: path.parse(file).name,
    url: `/uploads/${file}`,
    description: 'A generated description would go here.' // In a real app, this would be fetched from a database
  }))

  return NextResponse.json(images)
}


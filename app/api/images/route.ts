import cloudinary from '@/utils/cloudinary'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { resources } = await cloudinary.search
      .expression('folder:uploads')
      .sort_by('created_at', 'desc')
      .execute()

    const images = resources.map((resource: any) => ({
      path: resource.secure_url,
      description: 'Image description'
    }))

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}


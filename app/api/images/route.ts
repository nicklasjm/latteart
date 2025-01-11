import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function GET() {
  try {
    const { resources } = await cloudinary.search
      .expression('folder:uploads')
      .sort_by('created_at', 'desc')
      .execute()

    const images = resources.map((resource: any) => ({
      path: resource.secure_url,
      description: 'Image description' // You'll need to store descriptions separately
    }))

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
  }
}


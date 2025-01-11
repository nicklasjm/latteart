'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ImageItem {
  path: string
  description: string
}

export default function ImagesList() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/images')
        if (!response.ok) throw new Error('Failed to fetch images')
        const data = await response.json()
        setImages(data)
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={index} className="border rounded-lg p-4">
          <Image
            src={image.path}
            alt={image.description}
            width={300}
            height={300}
            className="object-cover w-full h-64"
          />
          <p className="mt-2 text-sm text-gray-600">{image.description}</p>
        </div>
      ))}
    </div>
  )
} 
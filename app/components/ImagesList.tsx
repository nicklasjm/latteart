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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/images')
        if (!response.ok) throw new Error('Failed to fetch images')
        const data = await response.json()
        console.log('Fetched images:', data)
        setImages(data)
      } catch (error) {
        console.error('Fetch error:', error)
        setError(error instanceof Error ? error.message : 'Failed to load images')
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  if (loading) return <div>Loading images...</div>
  if (error) return <div>Error: {error}</div>
  if (images.length === 0) return <div>No images found</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {images.map((image, index) => (
        <div key={index} className="border rounded-lg overflow-hidden shadow-lg">
          <div className="relative w-full h-64">
            <Image
              src={image.path}
              alt={image.description || 'Uploaded image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">{image.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
} 
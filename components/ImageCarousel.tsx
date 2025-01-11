'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import Slider from 'react-slick'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { Card, CardContent } from "@/components/ui/card"

interface ImageData {
  id: string
  url: string
  description: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ImageCarousel() {
  const { data: images, error } = useSWR<ImageData[]>('/api/images', fetcher, { refreshInterval: 5000 })
  const [slidesToShow, setSlidesToShow] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1)
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2)
      } else {
        setSlidesToShow(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (error) return <div className="text-center text-red-500">Failed to load images</div>
  if (!images) return <div className="text-center">Loading...</div>

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {images && images.length > 0 ? (
        <Slider {...settings}>
          {images.map((image) => (
            <div key={image.id} className="px-2">
              <Card>
                <CardContent className="p-4">
                  <div className="relative w-full h-48 mb-4">
                    <Image 
                      src={image.url} 
                      alt={image.description} 
                      layout="fill" 
                      objectFit="cover"
                      className="rounded"
                    />
                  </div>
                  <p className="text-sm">{image.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-center text-gray-500">No images uploaded yet.</p>
      )}
    </div>
  )
}


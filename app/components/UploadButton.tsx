'use client'

import { useEffect, useCallback } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    cloudinary: any
  }
}

export default function UploadButton() {
  const handleUpload = useCallback(() => {
    // Create and open the upload widget
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'my_uploads', // Create this in your Cloudinary dashboard
        folder: 'uploads',
      },
      async (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          // Image was uploaded to Cloudinary successfully
          const imageUrl = result.info.secure_url

          // Now send the URL to your API for OpenAI analysis
          try {
            const response = await fetch('/api/analyze', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ imageUrl }),
            })

            if (!response.ok) throw new Error('Failed to analyze image')
            
            // Refresh the images list or handle the response as needed
            window.location.reload()
          } catch (error) {
            console.error('Analysis error:', error)
          }
        }
      }
    )
    widget.open()
  }, [])

  return (
    <>
      <Script src="https://upload-widget.cloudinary.com/global/all.js" />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Upload Image
      </button>
    </>
  )
} 
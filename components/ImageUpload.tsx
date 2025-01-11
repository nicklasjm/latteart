'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { mutate } from 'swr';

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [remainingUploads, setRemainingUploads] = useState(5)
  const { toast } = useToast()

  useEffect(() => {
    fetchRemainingUploads()
  }, [])

  const fetchRemainingUploads = async () => {
    const response = await fetch('/api/upload-limit')
    const data = await response.json()
    setRemainingUploads(data.remainingUploads)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const limitResponse = await fetch('/api/upload-limit', { method: 'POST' });
      const limitData = await limitResponse.json();

      if (limitResponse.status === 429) {
        throw new Error(limitData.error);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: `Image uploaded and analyzed: ${data.description}`,
      });
      setFile(null);
      setRemainingUploads(limitData.remainingUploads);
      
      // Trigger a refresh of the ImageCarousel
      mutate('/api/images');
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <p className="text-center">Remaining uploads today: {remainingUploads}</p>
      <Input type="file" accept="image/*" onChange={handleFileChange} disabled={remainingUploads === 0} />
      <Button 
        onClick={handleUpload} 
        disabled={!file || uploading || remainingUploads === 0}
        className="w-full"
      >
        {uploading ? 'Uploading...' : 'Upload and Analyze'}
      </Button>
    </div>
  )
}


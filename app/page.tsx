import ImageUpload from "@/components/ImageUpload"
import ImageCarousel from "@/components/ImageCarousel"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Image Analysis App</h1>
      <ImageUpload />
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-center">Analyzed Images</h2>
        <ImageCarousel />
      </div>
    </main>
  )
}


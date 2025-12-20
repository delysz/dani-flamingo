import { client } from '@/lib/sanity'

async function getPhotos() {
  // Esta es la consulta (query) que le pide a Sanity tus fotos
  const query = `*[_type == "photo"] {
    _id,
    title,
    "imageUrl": image.asset->url,
    category
  }`
  const data = await client.fetch(query)
  return data
}

export default async function Home() {
  const photos = await getPhotos()

  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold mb-8">My Photography Gallery</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {photos.map((photo: any) => (
          <div key={photo._id} className="border rounded-lg overflow-hidden shadow-lg">
            <img 
              src={photo.imageUrl} 
              alt={photo.title} 
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{photo.title}</h2>
              <p className="text-gray-500 uppercase text-sm">{photo.category}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
import { client } from '@/lib/sanity'

export default async function Home() {
  const query = `*[_type == "photo"] | order(_createdAt desc) { _id, title, "imageUrl": image.asset->url, category }`
  const photos = await client.fetch(query)

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-12">
      {/* Header con Logo y Título Neón */}
      <header className="flex flex-col items-center mb-16 text-center">
        <img 
          src="/flamingo-logo.png" // Asegúrate de subir el logo a la carpeta public
          alt="Dani Flamingo Logo" 
          className="w-24 h-24 mb-4"
        />
        <h1 className="text-5xl md:text-7xl font-bold text-neon-pink mb-2">
          DANI FLAMINGO
        </h1>
        <p className="text-neon-turquoise text-xl tracking-widest uppercase">
          Photography
        </p>
      </header>

      {/* Galería con el "Colorful Margin" */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {photos.map((photo: any) => (
          <div key={photo._id} className="flex flex-col group">
            <div className="colorful-margin overflow-hidden transition-transform duration-500 group-hover:scale-105">
              <img 
                src={photo.imageUrl} 
                alt={photo.title} 
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-light tracking-tight">{photo.title}</h2>
              <span className="text-xs text-neon-turquoise uppercase tracking-widest">
                {photo.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
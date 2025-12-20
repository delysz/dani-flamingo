"use client" // Necesario para las animaciones
import { motion } from 'framer-motion'
import { client } from '@/lib/sanity'
import { useEffect, useState } from 'react'

export default function Home() {
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    const query = `*[_type == "photo"] { _id, title, "imageUrl": image.asset->url, category }`
    client.fetch(query).then(setPhotos)
  }, [])

  return (
    <main className="min-h-screen p-8 md:p-20 relative">
      <div className="global-frame" /> {/* El margen que recorre toda la web */}

      {/* Header Animado */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-20"
      >
        <motion.img 
          animate={{ filter: ["drop-shadow(0 0 5px #ff1493)", "drop-shadow(0 0 20px #ff1493)", "drop-shadow(0 0 5px #ff1493)"] }}
          transition={{ repeat: Infinity, duration: 2 }}
          src="/logo.png" 
          className="w-24 mx-auto mb-6" 
          alt="Flamingo Logo"
        />
        <h1 className="text-6xl md:text-8xl font-black text-neon-pink text-glow-pink italic uppercase">
          Dani Flamingo
        </h1>
        <p className="text-neon-turquoise tracking-[0.5em] text-xl font-light mt-2">
          PHOTOGRAPHY
        </p>
      </motion.header>

      {/* Galería con entrada en cascada */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {photos.map((photo: any, index: number) => (
          <motion.div
            key={photo._id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className="group relative"
          >
            {/* Margen individual de cada foto al estilo PowerPoint */}
            <div className="p-2 bg-gradient-to-br from-neon-pink via-neon-turquoise to-orange-500 rounded-sm">
              <div className="bg-black overflow-hidden">
                <img 
                  src={photo.imageUrl} 
                  className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700"
                  alt={photo.title} 
                />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold tracking-tighter">{photo.title}</h2>
              <p className="text-neon-turquoise text-xs tracking-widest uppercase">{photo.category}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  )
}
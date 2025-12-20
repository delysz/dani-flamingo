"use client"
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { client } from '@/lib/sanity'

// Definimos el "molde" de la foto para evitar el error de TypeScript
interface Photo {
  _id: string;
  title: string;
  country?: string; 
  imageUrl: string;
  category: string;
}

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [activeCat, setActiveCat] = useState("All")
  const [selectedImg, setSelectedImg] = useState<Photo | null>(null)

  useEffect(() => {
    const query = `*[_type == "photo"] { 
      _id, 
      title, 
      country, 
      "imageUrl": image.asset->url, 
      category 
    }`
    client.fetch(query).then((data: Photo[]) => setPhotos(data))
  }, [])

  // Generamos las categorías dinámicamente según lo que subas a Sanity
  const categories = useMemo(() => ["All", ...new Set(photos.map(p => p.category))], [photos])

  const filteredPhotos = activeCat === "All" 
    ? photos 
    : photos.filter(p => p.category === activeCat)

  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* El Marco Global que pedía el cliente en el PowerPoint */}
      <div className="global-frame" />

      {/* Cabecera Neon para una viajera experta */}
      <header className="pt-32 pb-10 text-center relative z-10 px-6">
        <motion.img 
          animate={{ filter: ["drop-shadow(0 0 5px #ff1493)", "drop-shadow(0 0 20px #ff1493)", "drop-shadow(0 0 5px #ff1493)"] }}
          transition={{ repeat: Infinity, duration: 3 }}
          src="/logo.jpeg" // Nombre corregido a .jpeg
          className="w-24 mx-auto mb-6" 
          alt="Logo Dani Flamingo" 
        />
        <h1 className="text-5xl md:text-8xl font-black italic text-neon-pink drop-shadow-[0_0_10px_#ff1493] uppercase tracking-tighter">
          Dani Flamingo
        </h1>
        <p className="text-neon-turquoise tracking-[0.6em] text-sm md:text-xl font-light mt-4">
          EXPLORING 50+ COUNTRIES
        </p>
      </header>

      {/* Menú de Categorías Interactivo */}
      <nav className="sticky top-0 z-[60] flex justify-center gap-4 py-8 bg-black/90 backdrop-blur-sm border-b border-white/5 mb-16 overflow-x-auto px-4">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCat(cat)}
            className={`text-xs tracking-[0.2em] uppercase transition-all px-4 py-2 whitespace-nowrap ${
              activeCat === cat ? "text-neon-pink border-b-2 border-neon-pink" : "text-white/40 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Galería Dinámica con Márgenes Coloridos */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 px-10 md:px-32 pb-20">
        <AnimatePresence mode="popLayout">
          {filteredPhotos.map((photo) => (
            <motion.div
              layout
              key={photo._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedImg(photo)}
              className="mb-8 break-inside-avoid relative group cursor-pointer"
            >
              {/* Margen individual colorido para cada foto (estilo PowerPoint) */}
              <div className="p-1 bg-gradient-to-tr from-neon-pink via-neon-turquoise to-orange-400">
                <div className="bg-black overflow-hidden relative">
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title}
                    className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold italic uppercase leading-none">{photo.title}</h3>
                  <p className="text-neon-turquoise text-[10px] tracking-widest mt-1">{photo.country || "WORLD"}</p>
                </div>
                <span className="text-white/10 font-black text-2xl uppercase">{photo.category}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modo Presentación (Lightbox) al hacer clic */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-[1000] bg-black/98 flex flex-col items-center justify-center p-6"
          >
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              src={selectedImg.imageUrl} 
              className="max-w-full max-h-[80vh] border-2 border-neon-pink shadow-[0_0_40px_rgba(255,20,147,0.5)] mb-4"
              alt={selectedImg.title}
            />
            <h2 className="text-neon-pink text-3xl font-black italic uppercase">{selectedImg.title}</h2>
            <p className="text-neon-turquoise tracking-widest uppercase text-sm">{selectedImg.country}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
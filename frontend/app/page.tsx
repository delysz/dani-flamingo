"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { client } from '@/lib/sanity'

// Definimos las categorías exactas del PPT del cliente
const CATEGORIES = [
  "All", "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", "Art"
]

export default function Home() {
  const [photos, setPhotos] = useState([])
  const [filteredPhotos, setFilteredPhotos] = useState([])
  const [activeCat, setActiveCat] = useState("All")

  useEffect(() => {
    const query = `*[_type == "photo"] { _id, title, "imageUrl": image.asset->url, category }`
    client.fetch(query).then(data => {
      setPhotos(data)
      setFilteredPhotos(data)
    })
  }, [])

  const filterContent = (category: string) => {
    setActiveCat(category)
    if (category === "All") {
      setFilteredPhotos(photos)
    } else {
      setFilteredPhotos(photos.filter((p: any) => p.category?.toLowerCase() === category.toLowerCase()))
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-10 md:p-24 overflow-x-hidden">
      <div className="global-frame" /> {/* El margen global que pedías */}

      {/* HEADER & LOGO */}
      <header className="flex flex-col items-center mb-16">
        <motion.img 
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.8 }}
          src="/logo.png" className="w-20 mb-6 drop-shadow-[0_0_15px_#ff1493]" alt="Logo" 
        />
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-neon-pink text-neon-glow">
          DANI FLAMINGO
        </h1>
      </header>

      {/* NAVEGACIÓN DE CATEGORÍAS (Clicables) */}
      <nav className="flex flex-wrap justify-center gap-4 mb-20 max-w-4xl mx-auto">
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat}
            onClick={() => filterContent(cat)}
            className={`nav-item ${activeCat === cat ? "text-neon-turquoise border-neon-turquoise scale-110" : "text-white/60"}`}
            whileHover={{ scale: 1.1, color: "#ff1493" }}
            whileTap={{ scale: 0.95 }}
          >
            {cat}
          </motion.button>
        ))}
      </nav>

      {/* GALERÍA ANIMADA */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        <AnimatePresence mode="popLayout">
          {filteredPhotos.map((photo: any) => (
            <motion.div
              layout
              key={photo._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="group"
            >
              {/* Margen individual colorido para cada foto */}
              <div className="p-1 bg-gradient-to-tr from-neon-pink via-neon-turquoise to-orange-400">
                <div className="bg-black overflow-hidden relative">
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    src={photo.imageUrl} 
                    alt={photo.title}
                    className="w-full aspect-[4/5] object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold uppercase italic">{photo.title}</h3>
                  <p className="text-neon-turquoise text-xs tracking-widest">{photo.category}</p>
                </div>
                <span className="text-white/20 text-4xl font-black">#01</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
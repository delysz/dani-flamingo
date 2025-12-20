"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { client } from '@/lib/sanity'

interface Photo {
  _id: string; title: string; country?: string; imageUrl: string; category: string;
}

// Configuración de colores por categoría
const themeMap: Record<string, {p: string, s: string}> = {
  All: { p: "#ff1493", s: "#40e0d0" },
  Beach: { p: "#40e0d0", s: "#0000ff" },
  Street: { p: "#ff8c00", s: "#ffd700" },
  Plants: { p: "#39ff14", s: "#006400" },
  People: { p: "#ff00ff", s: "#4b0082" },
  Animals: { p: "#ffd700", s: "#8b4513" },
  Abstract: { p: "#9400d3", s: "#ff00ff" },
};

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState("All");
  const [selectedImg, setSelectedImg] = useState<Photo | null>(null);

  useEffect(() => {
    const query = `*[_type == "photo"] { _id, title, country, "imageUrl": image.asset->url, category }`;
    client.fetch(query).then(setPhotos);
  }, []);

  // Función para cambiar los colores de la web
  useEffect(() => {
    const colors = themeMap[activeCat] || themeMap.All;
    document.documentElement.style.setProperty('--neon-primary', colors.p);
    document.documentElement.style.setProperty('--neon-secondary', colors.s);
  }, [activeCat]);

  const categories = ["All", ...new Set(photos.map(p => p.category))];
  const filtered = activeCat === "All" ? photos : photos.filter(p => p.category === activeCat);

  return (
    <main className="min-h-screen bg-black text-white p-6 relative">
      <div className="global-frame" /> {/* El margen que cambia de color */}

      <header className="pt-24 pb-12 text-center">
        <motion.img 
          key={activeCat} // Re-anima el logo al cambiar de color
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          src="/logo.jpeg" className="w-20 mx-auto mb-6" style={{ filter: `drop-shadow(0 0 15px var(--neon-primary))` }} 
        />
        <h1 className="text-6xl md:text-9xl font-black italic uppercase text-dynamic-neon italic">
          Dani Flamingo
        </h1>
        <p className="tracking-[0.8em] text-sm md:text-xl font-light mt-4" style={{ color: 'var(--neon-secondary)' }}>
          {activeCat === "All" ? "50+ COUNTRIES VISITED" : `EXPLORING ${activeCat.toUpperCase()}`}
        </p>
      </header>

      {/* Menú de Navegación Dinámico */}
      <nav className="sticky top-0 z-[110] flex justify-center gap-2 md:gap-6 py-6 bg-black/80 backdrop-blur-xl mb-16 overflow-x-auto">
        {categories.map(cat => (
          <button 
            key={cat} onClick={() => setActiveCat(cat)}
            className={`px-4 py-2 text-[10px] tracking-widest uppercase transition-all duration-500 ${
              activeCat === cat ? "bg-white text-black font-bold" : "text-white/40 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Galería con entrada de fotos "Explosiva" */}
      <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-8 px-4 md:px-20">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo) => (
            <motion.div
              layout key={photo._id}
              initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedImg(photo)}
              className="mb-10 break-inside-avoid relative group cursor-pointer"
            >
              {/* Margen individual que hereda el color de la categoría */}
              <div className="p-1.5" style={{ background: `linear-gradient(to bottom right, var(--neon-primary), var(--neon-secondary))` }}>
                <div className="bg-black p-1">
                  <img src={photo.imageUrl} alt={photo.title} className="w-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
              </div>
              <div className="mt-4 border-l-2 pl-4" style={{ borderColor: 'var(--neon-primary)' }}>
                <h3 className="text-xl font-black italic uppercase leading-none">{photo.title}</h3>
                <p className="text-[10px] tracking-[3px] mt-2" style={{ color: 'var(--neon-secondary)' }}>{photo.country || "GLOBAL TRAVELER"}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox con Aura de Color Dinámico */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4"
          >
            <img 
              src={selectedImg.imageUrl} 
              className="max-w-full max-h-[75vh] border-4" 
              style={{ borderColor: 'var(--neon-primary)', boxShadow: `0 0 60px var(--neon-primary)` }}
            />
            <h2 className="mt-8 text-4xl font-black italic uppercase" style={{ color: 'var(--neon-primary)' }}>{selectedImg.title}</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
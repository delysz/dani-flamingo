"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { client } from '@/lib/sanity'

interface Photo { _id: string; title: string; country?: string; imageUrl: string; category: string; }

// Mapeo de colores potente para cada categoría
const THEMES: Record<string, {p: string, s: string}> = {
  All: { p: "#ff1493", s: "#00f2ff" },
  Beach: { p: "#00f2ff", s: "#0066ff" },
  Street: { p: "#ff8c00", s: "#ffcc00" },
  Plants: { p: "#39ff14", s: "#004400" },
  People: { p: "#ff00ff", s: "#4b0082" },
  Animals: { p: "#ffd700", s: "#8b4513" },
  Food: { p: "#ff4500", s: "#ff0000" },
  Abstract: { p: "#9400d3", s: "#ff00ff" },
  Sofia: { p: "#00ffff", s: "#ffffff" },
  "Sofia's Artwork": { p: "#ff0066", s: "#ffcc00" },
  "Travel Photography": { p: "#ffffff", s: "#00f2ff" },
  Art: { p: "#e60073", s: "#ffffff" },
};

const CATEGORIES = ["All", "Travel Photography", "Art", "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", "Sofia", "Sofia's Artwork"];

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState("All");
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    client.fetch(`*[_type == "photo"] { _id, title, country, "imageUrl": image.asset->url, category }`).then(setPhotos);
  }, []);

  useEffect(() => {
    const colors = THEMES[activeCat] || THEMES.All;
    document.documentElement.style.setProperty('--neon-primary', colors.p);
    document.documentElement.style.setProperty('--neon-secondary', colors.s);
    
    // Efecto de Flash de cámara al cambiar de categoría
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
  }, [activeCat]);

  const filtered = activeCat === "All" ? photos : photos.filter(p => p.category === activeCat);

  return (
    <main className="min-h-screen p-4 md:p-12 relative">
      <div className="global-frame" />
      <AnimatePresence>{isFlashing && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flash-effect" />}</AnimatePresence>

      <header className="pt-20 text-center relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center gap-10 mb-6">
          <img src="/logo.jpeg" className="w-20 h-20 drop-shadow-[0_0_15px_var(--neon-primary)]" alt="logo" />
        </motion.div>
        <h1 className="text-6xl md:text-9xl font-black italic uppercase text-neon tracking-tighter">Dani Flamingo</h1>
        <div className="flex justify-center items-center gap-4 mt-4">
          <span className="h-[2px] w-20 bg-neon-primary" />
          <p className="text-xl md:text-3xl font-light tracking-[0.4em]" style={{ color: 'var(--neon-secondary)' }}>50+ COUNTRIES EXPLORED</p>
          <span className="h-[2px] w-20 bg-neon-primary" />
        </div>
      </header>

      {/* Navegación con todas las categorías de la imagen */}
      <nav className="sticky top-0 z-[110] py-10 bg-black/80 backdrop-blur-md mt-10">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-5xl mx-auto px-6">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} onClick={() => setActiveCat(cat)}
              className={`text-sm md:text-base uppercase tracking-widest transition-all duration-300 ${activeCat === cat ? "text-neon scale-125 font-bold" : "text-white/40 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Grid de Fotos "Potente" */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-10 px-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, i) => (
            <motion.div
              layout key={photo._id}
              initial={{ opacity: 0, y: 50, rotate: i % 2 === 0 ? 2 : -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05, zIndex: 50 }}
              className="relative group"
            >
              <div className="p-2" style={{ background: `linear-gradient(45deg, var(--neon-primary), var(--neon-secondary))` }}>
                <div className="bg-black p-1 overflow-hidden">
                  <img src={photo.imageUrl} alt={photo.title} className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000" />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-end border-l-4 pl-4" style={{ borderColor: 'var(--neon-primary)' }}>
                <div>
                  <h3 className="text-2xl font-black italic uppercase">{photo.title}</h3>
                  <p className="text-sm tracking-widest" style={{ color: 'var(--neon-secondary)' }}>{photo.country || 'ADVENTURE'}</p>
                </div>
                <span className="text-white/10 text-6xl font-black leading-none">{i + 1}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { client } from '@/lib/sanity'

interface Photo { _id: string; title: string; country?: string; imageUrl: string; category: string; }

// Mapeo de colores potente: cada categoría tiene su propio "mood"
const CATEGORY_THEMES: Record<string, {p: string, s: string}> = {
  All: { p: "#ff1493", s: "#00f2ff" },
  "Travel Photography": { p: "#ffffff", s: "#00f2ff" },
  Art: { p: "#e60073", s: "#ffd700" },
  Beach: { p: "#00f2ff", s: "#0066ff" },
  Street: { p: "#ff8c00", s: "#ffcc00" },
  Plants: { p: "#39ff14", s: "#004400" },
  People: { p: "#ff00ff", s: "#4b0082" },
  Animals: { p: "#ffd700", s: "#8b4513" },
  Food: { p: "#ff4500", s: "#ff0000" },
  Abstract: { p: "#9400d3", s: "#ff00ff" },
  Sofia: { p: "#00ffff", s: "#ffffff" },
  "Sofia's Artwork": { p: "#ff0066", s: "#ffcc00" },
};

const NAV_ITEMS = ["All", "Travel Photography", "Art", "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", "Sofia", "Sofia's Artwork"];

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState("All");
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    client.fetch(`*[_type == "photo"] { _id, title, country, "imageUrl": image.asset->url, category }`).then(setPhotos);
  }, []);

  // Efecto de cambio de atmósfera
  useEffect(() => {
    const theme = CATEGORY_THEMES[activeCat] || CATEGORY_THEMES.All;
    document.documentElement.style.setProperty('--neon-primary', theme.p);
    document.documentElement.style.setProperty('--neon-secondary', theme.s);
    
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
  }, [activeCat]);

  const filtered = activeCat === "All" ? photos : photos.filter(p => p.category === activeCat);

  return (
    <main className="min-h-screen relative p-4 md:p-12 overflow-x-hidden">
      <div className="global-frame" />
      
      {/* Efecto Flash al cambiar de categoría */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flash-overlay" />
        )}
      </AnimatePresence>

      <header className="pt-20 text-center relative z-10">
        <motion.img 
          key={activeCat}
          initial={{ scale: 0.5, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          src="/logo.jpeg" className="w-24 mx-auto mb-8 drop-shadow-[0_0_20px_var(--neon-primary)]" 
          alt="logo" 
        />
        <h1 className="text-6xl md:text-[10rem] font-black italic uppercase text-neon tracking-tighter leading-none">
          Dani Flamingo
        </h1>
        <p className="text-xl md:text-3xl font-light tracking-[0.5em] mt-6" style={{ color: 'var(--neon-secondary)' }}>
          50+ COUNTRIES EXPLORED
        </p>
      </header>

      {/* Menú de Categorías (Todas visibles) */}
      <nav className="sticky top-0 z-[110] py-12 bg-black/80 backdrop-blur-md mt-10">
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 max-w-6xl mx-auto px-6">
          {NAV_ITEMS.map(cat => (
            <button 
              key={cat} onClick={() => setActiveCat(cat)}
              className={`text-sm md:text-base uppercase tracking-widest transition-all duration-300 ${
                activeCat === cat ? "text-neon scale-125 font-bold underline underline-offset-8" : "text-white/30 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Galería "Potente" */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mt-10 px-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, i) => (
            <motion.div
              layout key={photo._id}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.03, zIndex: 50 }}
              className="relative"
            >
              {/* Margen individual que hereda el color de la categoría */}
              <div className="p-2 transition-all duration-500" style={{ background: `linear-gradient(45deg, var(--neon-primary), var(--neon-secondary))` }}>
                <div className="bg-black p-1">
                  <img src={photo.imageUrl} alt={photo.title} className="w-full grayscale hover:grayscale-0 transition-all duration-1000" />
                </div>
              </div>
              <div className="mt-6 flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-black italic uppercase leading-none">{photo.title}</h3>
                  <p className="text-sm tracking-widest mt-2" style={{ color: 'var(--neon-secondary)' }}>
                    {photo.country || 'ADVENTURE'}
                  </p>
                </div>
                <span className="text-white/10 text-7xl font-black leading-none">{i + 1}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
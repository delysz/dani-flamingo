"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { client } from '@/lib/sanity'

interface Photo { _id: string; title: string; country?: string; imageUrl: string; category: string; }

// Colores únicos para que cada margen sea potente y distinto
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
  Art: { p: "#e60073", s: "#ffffff" },
};

const CATEGORIES = ["All", "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", "Sofia", "Sofia's Artwork", "Art"];

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState("All");
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    // Protección: solo intentamos el fetch si el cliente está bien configurado
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return; 
    
    client.fetch(`*[_type == "photo"] { _id, title, country, "imageUrl": image.asset->url, category }`)
      .then(setPhotos)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const theme = THEMES[activeCat] || THEMES.All;
    document.documentElement.style.setProperty('--neon-primary', theme.p);
    document.documentElement.style.setProperty('--neon-secondary', theme.s);
    
    setIsFlashing(true); // Efecto Flash de cámara
    setTimeout(() => setIsFlashing(false), 150);
  }, [activeCat]);

  const filtered = activeCat === "All" ? photos : photos.filter(p => p.category === activeCat);

  return (
    <main className="min-h-screen p-4 md:p-12 relative overflow-x-hidden">
      <div className="global-frame" /> {/* El margen que recorre toda la web */}
      
      <AnimatePresence>{isFlashing && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flash-overlay" />}</AnimatePresence>

      <header className="pt-24 text-center z-10 relative">
        <motion.img 
          key={activeCat} initial={{ scale: 0.5 }} animate={{ scale: 1 }}
          src="/logo.jpeg" className="w-24 mx-auto mb-6 drop-shadow-[0_0_15px_var(--neon-primary)]" alt="logo" 
        />
        <h1 className="text-6xl md:text-[9rem] font-black italic uppercase text-neon leading-none tracking-tighter">
          Dani Flamingo
        </h1>
        <p className="text-xl md:text-2xl mt-6 tracking-[0.5em] font-light" style={{ color: 'var(--neon-secondary)' }}>
          EXPLORING 50+ COUNTRIES
        </p>
      </header>

      {/* Menú de categorías con todas las opciones visibles */}
      <nav className="sticky top-0 z-[110] py-12 bg-black/80 backdrop-blur-md mt-16">
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 max-w-6xl mx-auto px-6">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} onClick={() => setActiveCat(cat)}
              className={`text-sm md:text-base uppercase tracking-widest transition-all duration-300 ${activeCat === cat ? "text-neon scale-125 font-bold" : "text-white/30 hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Galería dinámica con efectos de entrada */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 px-4 pb-20">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, i) => (
            <motion.div
              layout key={photo._id}
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="p-1.5 transition-all duration-700" style={{ background: `linear-gradient(45deg, var(--neon-primary), var(--neon-secondary))` }}>
                <div className="bg-black p-1 overflow-hidden">
                  <img src={photo.imageUrl} alt={photo.title} className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000" />
                </div>
              </div>
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black italic uppercase leading-none">{photo.title}</h3>
                  <p className="text-sm tracking-widest mt-2" style={{ color: 'var(--neon-secondary)' }}>{photo.country || 'ADVENTURE'}</p>
                </div>
                <span className="text-white/10 text-7xl font-black">{i + 1}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
"use client"
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { client } from '@/lib/sanity'

interface Photo { _id: string; title: string; country?: string; imageUrl: string; category: string; }

const THEMES: Record<string, {p: string, s: string}> = {
  All: { p: "#ff1493", s: "#00f2ff" },
  Beach: { p: "#00f2ff", s: "#0066ff" },
  Street: { p: "#ff8c00", s: "#ffd700" },
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

// Componente de Contador Animado
const Counter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    const duration = 2000;
    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, duration / end);
  }, [target]);
  return <span>{count}</span>;
};

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState("All");
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return; //
    client.fetch(`*[_type == "photo"] { _id, title, country, "imageUrl": image.asset->url, category }`).then(setPhotos);
  }, []);

  useEffect(() => {
    const theme = THEMES[activeCat] || THEMES.All;
    document.documentElement.style.setProperty('--neon-primary', theme.p);
    document.documentElement.style.setProperty('--neon-secondary', theme.s);
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);
  }, [activeCat]);

  const filtered = activeCat === "All" ? photos : photos.filter(p => p.category === activeCat);

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-12 relative overflow-x-hidden">
      <div className="global-frame" />
      <AnimatePresence>{isFlashing && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white z-[200] pointer-events-none" />}</AnimatePresence>

      <header className="pt-24 text-center z-10 relative">
        <motion.img src="/logo.jpeg" className="w-20 mx-auto mb-6 drop-shadow-[0_0_15px_var(--neon-primary)]" />
        <h1 className="text-5xl md:text-7xl font-black italic uppercase text-neon tracking-tighter transition-all duration-500">
          Dani Flamingo
        </h1>
        <div className="text-xl md:text-4xl mt-6 font-black italic" style={{ color: 'var(--neon-secondary)' }}>
          <Counter target={50} />+ COUNTRIES EXPLORED
        </div>
      </header>

      {/* MAPA MUNDI INTERACTIVO (SIMPLIFICADO) */}
      <section className="my-20 flex justify-center opacity-40 hover:opacity-100 transition-opacity duration-1000">
        <svg viewBox="0 0 1000 500" className="w-full max-w-4xl fill-transparent stroke-[1px]" style={{ stroke: 'var(--neon-primary)', filter: 'drop-shadow(0 0 10px var(--neon-primary))' }}>
          <path d="M150,150 L180,140 L200,160 L220,150 L250,180 L230,220 L200,210 Z M450,100 L500,80 L550,120 L530,180 L480,200 Z M700,250 L750,230 L800,280 L780,350 L720,330 Z" />
          <motion.circle cx="500" cy="250" r="150" strokeWidth="0.5" strokeDasharray="5,5" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} />
        </svg>
      </section>

      <nav className="sticky top-0 z-[110] py-10 bg-black/80 backdrop-blur-md mt-12">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-6xl mx-auto px-6">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)} className={`text-xs md:text-sm uppercase tracking-widest transition-all duration-300 ${activeCat === cat ? "text-neon scale-110 font-bold" : "text-white/30 hover:text-white"}`}>
              {cat}
            </button>
          ))}
        </div>
      </nav>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4 pb-20 mt-20">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, i) => (
            <motion.div layout key={photo._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="group relative">
              <div className="scan-line" /> {/* Efecto de escáner al hover */}
              <div className="p-1.5 transition-all duration-700" style={{ background: `linear-gradient(45deg, var(--neon-primary), var(--neon-secondary))` }}>
                <div className="bg-black p-1 overflow-hidden relative">
                  <img src={photo.imageUrl} alt={photo.title} className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                </div>
              </div>
              <div className="mt-6 border-l-2 pl-4" style={{ borderColor: 'var(--neon-primary)' }}>
                <h3 className="text-2xl font-black italic uppercase">{photo.title}</h3>
                <p className="text-xs tracking-[5px] mt-2 uppercase" style={{ color: 'var(--neon-secondary)' }}>{photo.country || 'Exploration'}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
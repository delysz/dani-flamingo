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

// --- SUB-COMPONENTE: RELOJ MUNDIAL ---
const WorldClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (offset: number) => {
    const d = new Date(time.getTime() + offset * 3600000);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed top-8 right-10 z-[120] text-[10px] font-mono tracking-tighter bg-black/40 backdrop-blur-md p-3 border border-white/10">
      <div className="flex flex-col gap-1 uppercase">
        <p style={{ color: 'var(--neon-primary)' }}>LDN {formatTime(0)}</p>
        <p style={{ color: 'var(--neon-secondary)' }}>NYC {formatTime(-5)}</p>
        <p className="text-white">TKO {formatTime(9)}</p>
      </div>
    </div>
  );
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
      <WorldClock />
      
      <AnimatePresence>{isFlashing && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white z-[200] pointer-events-none" />}</AnimatePresence>

      <header className="pt-24 text-center z-10 relative">
        <motion.img src="/logo.jpeg" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-16 mx-auto mb-6 drop-shadow-[0_0_15px_var(--neon-primary)]" />
        <h1 className="text-5xl md:text-7xl font-black italic uppercase text-neon tracking-tighter transition-all duration-500">
          Dani Flamingo
        </h1>
        <p className="text-sm md:text-xl mt-4 tracking-[0.6em] font-light" style={{ color: 'var(--neon-secondary)' }}>
          WORLD WALKER · 50+ COUNTRIES
        </p>
      </header>

      {/* MAPA MUNDI ORBITAL */}
      <div className="mt-16 flex justify-center opacity-30">
        <svg viewBox="0 0 1000 400" className="w-full max-w-2xl stroke-[0.5px]" style={{ stroke: 'var(--neon-primary)' }}>
          <motion.circle cx="500" cy="200" r="180" fill="none" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }} strokeDasharray="10 20" />
          <path d="M200,200 Q500,50 800,200" fill="none" opacity="0.5" />
          <text x="500" y="210" textAnchor="middle" className="text-[120px] font-black italic opacity-20" fill="white">MAP</text>
        </svg>
      </div>

      <nav className="sticky top-0 z-[110] py-8 bg-black/80 backdrop-blur-md mt-10 border-b border-white/5">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 max-w-6xl mx-auto px-6">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)} className={`text-[10px] md:text-xs uppercase tracking-[0.3em] transition-all duration-300 ${activeCat === cat ? "text-neon scale-110 font-bold" : "text-white/40 hover:text-white"}`}>
              {cat}
            </button>
          ))}
        </div>
      </nav>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 px-4 pb-32 mt-20">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, i) => (
            <motion.div layout key={photo._id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="group relative">
              <div className="scan-line" />
              <div className="p-1 transition-all duration-700" style={{ background: `linear-gradient(45deg, var(--neon-primary), var(--neon-secondary))` }}>
                <div className="bg-black p-1 overflow-hidden relative">
                  <img src={photo.imageUrl} alt={photo.title} className="w-full grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" />
                </div>
              </div>
              <div className="mt-6 flex justify-between items-start border-l-2 pl-4" style={{ borderColor: 'var(--neon-primary)' }}>
                <div>
                  <h3 className="text-2xl font-black italic uppercase leading-none">{photo.title}</h3>
                  <p className="text-[10px] tracking-[4px] mt-2 uppercase font-mono" style={{ color: 'var(--neon-secondary)' }}>{photo.country || 'OVERSEAS'}</p>
                </div>
                <span className="text-white/5 text-6xl font-black italic">{(i + 1).toString().padStart(2, '0')}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { client } from '@/lib/sanity'

// 1. INTERFAZ ACTUALIZADA: Incluye 'location' para el mapa
interface Photo { 
  _id: string; 
  title: string; 
  country?: string; 
  imageUrl: string; 
  category: string;
  location?: { lat: number; lng: number }; // Coordenadas GPS
}

// Configuración de colores
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

// Reloj Mundial
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
    <div className="fixed top-10 right-10 z-[120] text-[10px] font-mono tracking-tighter bg-black/60 backdrop-blur-md p-4 border border-white/20 rounded-sm hidden md:block">
      <div className="flex flex-col gap-2 uppercase">
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

  // 2. QUERY IMPLEMENTADA: Aquí es donde pedimos los datos nuevos
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return;

    // La query pide explícitamente el campo 'location'
    const query = `*[_type == "photo"] | order(_createdAt desc) { 
      _id, 
      title, 
      country, 
      category, 
      location, 
      "imageUrl": image.asset->url 
    }`;

    client.fetch(query).then(setPhotos);
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
    // CAMBIO IMPORTANTE: Aumenté el padding a 'p-8 md:p-24' para respetar los márgenes globales
    <main className="min-h-screen bg-black text-white p-8 md:p-24 relative overflow-x-hidden">
      
      {/* Marco Global Visible */}
      <div className="global-frame" />
      
      <WorldClock />
      <AnimatePresence>{isFlashing && <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white z-[200] pointer-events-none" />}</AnimatePresence>

      <header className="pt-10 text-center z-10 relative">
        <motion.img 
          src="/logo.jpeg" 
          animate={{ rotate: 360 }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }} 
          className="w-20 mx-auto mb-8 drop-shadow-[0_0_20px_var(--neon-primary)]" 
        />
        <h1 className="text-5xl md:text-8xl font-black italic uppercase text-neon tracking-tighter transition-all duration-500">
          Dani Flamingo
        </h1>
        <p className="text-sm md:text-xl mt-6 tracking-[0.6em] font-light uppercase" style={{ color: 'var(--neon-secondary)' }}>
          World Walker · 50+ Countries
        </p>
      </header>

      {/* Mapa Decorativo */}
      <div className="mt-20 flex justify-center opacity-40 hover:opacity-100 transition-opacity duration-700">
        <svg viewBox="0 0 1000 350" className="w-full max-w-4xl stroke-[1px]" style={{ stroke: 'var(--neon-primary)' }}>
          <motion.circle cx="500" cy="175" r="140" fill="none" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} strokeDasharray="5 15" />
          <path d="M200,175 Q500,50 800,175" fill="none" opacity="0.3" />
          <text x="500" y="190" textAnchor="middle" className="text-[80px] font-black italic opacity-20" fill="white">EXPLORE</text>
        </svg>
      </div>

      <nav className="sticky top-0 z-[110] py-8 bg-black/90 backdrop-blur-xl mt-16 border-y border-white/10">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-7xl mx-auto">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)} className={`text-[11px] md:text-xs uppercase tracking-[0.25em] transition-all duration-300 ${activeCat === cat ? "text-neon scale-110 font-bold border-b-2 border-[var(--neon-primary)]" : "text-white/40 hover:text-white"}`}>
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Galería con márgenes de foto más gruesos */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 pb-20 mt-20">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, i) => (
            <motion.div layout key={photo._id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="group relative">
              <div className="scan-line" />
              
              {/* MARGEN DE FOTO: Aumentado a p-2 para que se vea bien el color */}
              <div className="p-2 transition-all duration-700 hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, var(--neon-primary), var(--neon-secondary))` }}>
                <div className="bg-black p-1 overflow-hidden relative h-full">
                  <img src={photo.imageUrl} alt={photo.title} className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110 object-cover aspect-[3/4]" />
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-start border-l-4 pl-4 transition-colors duration-500" style={{ borderColor: 'var(--neon-primary)' }}>
                <div>
                  <h3 className="text-2xl font-black italic uppercase leading-none">{photo.title}</h3>
                  <p className="text-[10px] tracking-[4px] mt-2 uppercase font-mono" style={{ color: 'var(--neon-secondary)' }}>
                    {photo.country || 'PLANET EARTH'}
                  </p>
                </div>
                <span className="text-white/10 text-6xl font-black italic absolute -right-4 -bottom-4 z-[-1]">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
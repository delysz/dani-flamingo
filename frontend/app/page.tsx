"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { client } from '@/lib/sanity'

// Interfaz de datos
interface Photo { 
  _id: string; title: string; country?: string; imageUrl: string; category: string;
  location?: { lat: number; lng: number };
}

// 1. CATEGORÍAS FILTRADAS (Sin 'Art' ni 'Travel Photography')
const CATEGORIES = [
  "All", 
  "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", // Grupo AZUL
  "Sofia", "Sofia's Artwork" // Grupo ROSA
];

// Función para saber si una categoría es ROSA (Sofia) o AZUL (Resto)
const isPinkCategory = (cat: string) => ["Sofia", "Sofia's Artwork"].includes(cat);

// --- COMPONENTE: CONTADOR ARREGLADO ---
const Counter = ({ from, to }: { from: number; to: number }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration: 2.5, ease: "circOut" });
    return controls.stop;
  }, [count, to]);

  return <motion.span>{rounded}</motion.span>;
};

// --- COMPONENTE: RELOJ MUNDIAL ---
const WorldClock = () => {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => setTime(new Date()), []); // Evita error de hidratación
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  const format = (offset: number) => {
    const d = new Date(time.getTime() + offset * 3600000);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed top-8 right-8 z-[120] text-[10px] font-mono bg-black/80 backdrop-blur border border-white/10 p-3 rounded hidden md:block">
      <div className="flex flex-col gap-1">
        <span className="text-[var(--neon-blue)]">LDN {format(0)}</span>
        <span className="text-[var(--neon-pink)]">NYC {format(-5)}</span>
        <span className="text-white">TKO {format(9)}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState("All");

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return;
    const query = `*[_type == "photo"] | order(_createdAt desc) { 
      _id, title, country, category, location, "imageUrl": image.asset->url 
    }`;
    client.fetch(query).then(setPhotos).catch(console.error);
  }, []);

  // Filtrado
  const filtered = activeCat === "All" ? photos : photos.filter(p => p.category === activeCat);

  // Color dinámico actual (para el título y bordes)
  const activeColor = isPinkCategory(activeCat) ? "var(--neon-pink)" : "var(--neon-blue)";

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-20 relative overflow-x-hidden selection:bg-white/20">
      <div className="global-frame" />
      <WorldClock />

      {/* HEADER */}
      <header className="pt-16 pb-10 text-center relative z-10">
        <motion.div 
          animate={{ filter: [`drop-shadow(0 0 10px ${activeColor})`, `drop-shadow(0 0 25px ${activeColor})`, `drop-shadow(0 0 10px ${activeColor})`] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <img src="/logo.jpeg" className="w-24 mx-auto mb-6 rounded-full" alt="logo" />
        </motion.div>

        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter transition-colors duration-500"
            style={{ color: activeColor, textShadow: `0 0 30px ${activeColor}` }}>
          Dani Flamingo
        </h1>
        
        {/* CONTADOR ARREGLADO */}
        <div className="text-xl md:text-3xl mt-6 font-light tracking-[0.3em] flex justify-center items-center gap-2">
          <span style={{ color: activeColor }} className="font-bold flex">
            <Counter from={0} to={50} />+
          </span>
          <span className="text-white/80">COUNTRIES EXPLORED</span>
        </div>
      </header>

      {/* MAPA DE PUNTOS (Estético y Tecnológico) */}
      <div className="relative w-full max-w-5xl mx-auto h-[200px] md:h-[400px] opacity-60 mb-12 flex justify-center items-center overflow-hidden">
        {/* Mapa SVG de Puntos */}
        <svg viewBox="0 0 1000 450" className="w-full h-full" style={{ fill: activeColor }}>
          <circle cx="500" cy="225" r="2" className="animate-ping" />
          {/* Representación estilizada de continentes con puntos */}
          <g transform="translate(50,50) scale(0.9)">
             {/* America */}
             <path d="M150,50 h10 v10 h-10 z M170,60 h10 v10 h-10 z M160,80 h10 v10 h-10 z M180,100 h10 v10 h-10 z M200,150 h10 v10 h-10 z M220,200 h10 v10 h-10 z M250,250 h10 v10 h-10 z" opacity="0.5"/>
             {/* Europe/Africa */}
             <path d="M450,60 h10 v10 h-10 z M470,70 h10 v10 h-10 z M460,90 h10 v10 h-10 z M480,150 h10 v10 h-10 z M500,200 h10 v10 h-10 z M520,250 h10 v10 h-10 z" opacity="0.5"/>
             {/* Asia */}
             <path d="M650,60 h10 v10 h-10 z M680,70 h10 v10 h-10 z M700,90 h10 v10 h-10 z M720,120 h10 v10 h-10 z" opacity="0.5"/>
          </g>
          {/* Líneas orbitales decorativas */}
          <motion.circle cx="500" cy="225" r="180" fill="none" stroke={activeColor} strokeWidth="0.5" strokeDasharray="10 20" 
            animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} />
           <motion.circle cx="500" cy="225" r="120" fill="none" stroke={activeColor} strokeWidth="0.2" 
            animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />
        </svg>
      </div>

      {/* MENÚ DE CATEGORÍAS (Colores exactos de tu imagen) */}
      <nav className="sticky top-0 z-50 py-6 bg-black/90 backdrop-blur-md mb-16 border-y border-white/5">
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 max-w-6xl mx-auto px-4">
          {CATEGORIES.map(cat => {
            const isPink = isPinkCategory(cat);
            const isActive = activeCat === cat;
            const baseColor = isPink ? "var(--neon-pink)" : "var(--neon-blue)";
            
            return (
              <button 
                key={cat} 
                onClick={() => setActiveCat(cat)}
                className={`uppercase tracking-widest text-xs md:text-sm transition-all duration-300 relative group px-2 py-1
                  ${isActive ? "font-bold scale-110" : "opacity-70 hover:opacity-100"}`}
                style={{ 
                  color: baseColor,
                  textShadow: isActive ? `0 0 15px ${baseColor}` : "none"
                }}
              >
                {cat}
                {/* Línea inferior al hacer hover o activo */}
                <span className={`absolute -bottom-1 left-0 h-[1px] bg-current transition-all duration-300
                  ${isActive ? "w-full" : "w-0 group-hover:w-full"}`} />
              </button>
            )
          })}
        </div>
      </nav>

      {/* GALERÍA */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-20">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, i) => (
            <motion.div
              layout key={photo._id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="group relative cursor-pointer"
            >
              {/* Borde Neón de la Foto */}
              <div className="p-1 transition-all duration-500 group-hover:p-1.5" 
                   style={{ background: `linear-gradient(45deg, ${activeColor}, transparent)` }}>
                <div className="bg-black relative overflow-hidden aspect-[4/5]">
                   {/* Imagen */}
                  <img src={photo.imageUrl} alt={photo.title} 
                       className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                  
                  {/* Overlay de País al Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-[10px] tracking-[4px] uppercase font-mono" style={{ color: activeColor }}>
                      GPS: {photo.location ? `${photo.location.lat.toFixed(2)}, ${photo.location.lng.toFixed(2)}` : "Unknown"}
                    </p>
                    <p className="text-white text-lg font-bold">{photo.country || "Earth"}</p>
                  </div>
                </div>
              </div>

              {/* Título e índice */}
              <div className="mt-4 flex justify-between items-end px-2">
                <h3 className="text-xl font-black italic uppercase leading-none text-white">{photo.title}</h3>
                <span className="text-4xl font-black opacity-10" style={{ color: activeColor }}>
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
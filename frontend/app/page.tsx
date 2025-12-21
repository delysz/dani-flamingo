"use client"
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { client } from '@/lib/sanity'
import Image from 'next/image'

// --- TIPOS ---
interface Photo { 
  _id: string; 
  title: string; 
  country?: string; 
  imageUrl: string; 
  category: string;
}

const CATEGORIES = [
  "All", "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", "Sofia", "Sofia's Artwork"
];

// --- PALETA DE COLORES ---
const getThemeColor = (cat: string): string => {
  switch (cat) {
    case "Sofia": case "Sofia's Artwork": return "#ff0099"; 
    case "Beach": return "#00f2ff"; 
    case "Street": return "#ff4d00"; 
    case "Plants": return "#00ff41"; 
    case "People": return "#bd00ff"; 
    case "Animals": return "#ffc400"; 
    case "Food": return "#ff0040"; 
    case "Abstract": return "#e0e0e0"; 
    default: return "#00f2ff"; 
  }
};

// --- COMPONENTES AUXILIARES ---

const Counter = ({ to }: { to: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => { animate(count, to, { duration: 3, ease: "circOut" }); }, [to, count]);
  return <motion.span>{rounded}</motion.span>;
};

// --- NUEVO MAPA: SILUETA REAL ---
const WorldMap = ({ color }: { color: string }) => {
  return (
    <div className="relative w-full h-[300px] md:h-[450px] flex items-center justify-center opacity-70">
      {/* Fondo de rejilla sutil para efecto tecnológico */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundImage: `radial-gradient(${color}30 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.1 
        }}
      />
      
      <svg viewBox="0 0 1000 500" className="w-full h-full" style={{ filter: `drop-shadow(0 0 10px ${color}30)` }}>
        {/* GRUPO DE CONTINENTES REALES (Simplificados pero reconocibles) */}
        <g fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-1000">
           {/* América */}
           <path d="M250,80 L290,80 L320,150 L280,180 L260,150 L200,120 Z M280,180 L300,350 L250,420 L230,250 Z" />
           
           {/* Europa & Asia */}
           <path d="M420,80 L550,80 L600,150 L550,200 L480,180 L450,150 Z M550,80 L850,80 L900,180 L800,250 L700,220 L600,150 Z" />
           
           {/* África */}
           <path d="M450,200 L550,200 L580,300 L500,400 L450,300 Z" />
           
           {/* Australia */}
           <path d="M780,320 L880,320 L880,400 L780,380 Z" />
           
           {/* Islas (Japón, UK, etc) */}
           <circle cx="410" cy="110" r="5" /> {/* UK */}
           <circle cx="920" cy="150" r="5" /> {/* Japon */}
           <circle cx="580" cy="350" r="3" /> {/* Madagascar */}
        </g>
        
        {/* Círculos de Radar / Conexiones */}
        <circle cx="500" cy="250" r="150" fill="none" stroke={color} strokeWidth="0.5" opacity="0.1" />
        <motion.circle 
          cx="500" cy="250" r="150" fill="none" stroke={color} strokeWidth="1" opacity="0.2" 
          strokeDasharray="20,40"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Puntos pulsantes en ubicaciones clave */}
        <g fill={color}>
           {[
             {cx: 260, cy: 130}, // North America
             {cx: 480, cy: 110}, // Europe
             {cx: 780, cy: 140}, // Asia
           ].map((point, i) => (
             <motion.circle 
               key={i} cx={point.cx} cy={point.cy} r="3"
               animate={{ r: [3, 6, 3], opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
             />
           ))}
        </g>
      </svg>
    </div>
  );
};

const EmptyState = ({ activeCat, availableCategories, themeColor, onSelectCategory, getThemeColor }: any) => {
  const otherCategories = useMemo(() => 
    availableCategories.filter((cat: string) => cat !== activeCat && cat !== "All").slice(0, 4)
  , [availableCategories, activeCat]);
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 px-6 relative z-10">
      <h3 className="text-2xl font-light tracking-[0.2em] mb-6 uppercase" style={{ color: themeColor }}>
        {activeCat === "All" ? "Collection Empty" : `No photos in "${activeCat}"`}
      </h3>
      <div className="flex flex-wrap gap-4 justify-center mb-10">
        {otherCategories.map((cat: string) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className="px-6 py-2 text-xs uppercase tracking-widest border transition-all hover:bg-white/5"
            style={{ borderColor: getThemeColor(cat), color: getThemeColor(cat) }}
          >
            Explore {cat}
          </button>
        ))}
      </div>
      <button
        onClick={() => onSelectCategory("All")}
        className="px-8 py-3 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors"
      >
        View All Photos
      </button>
    </motion.div>
  );
};

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState<string>("All");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const query = `*[_type == "photo"] | order(order asc, _createdAt desc) { 
      _id, title, country, 
      "category": coalesce(category, "Uncategorized"), 
      "imageUrl": image.asset->url
    }`;
    
    console.log("Fetching Sanity data...");

    client.fetch(query)
      .then((data: Photo[]) => {
        if (data && data.length > 0) {
          setPhotos(data);
          setAvailableCategories(Array.from(new Set(data.map((p: Photo) => p.category))));
        } else {
          console.warn("No photos found.");
        }
      })
      .catch((err) => console.error("Sanity Error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => activeCat === "All" ? photos : photos.filter(p => p.category === activeCat), [activeCat, photos]);
  const themeColor = useMemo(() => getThemeColor(activeCat), [activeCat]);
  const handleSelectCategory = useCallback((cat: string) => setActiveCat(cat), []);

  return (
    <main 
      className="min-h-screen bg-[#050505] text-white p-4 md:p-12 relative overflow-x-hidden"
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      <div className="fixed inset-0 scanlines opacity-[0.15] pointer-events-none z-0" />

      <div className="fixed inset-0 border-[8px] md:border-[12px] border-transparent pointer-events-none z-50 transition-all duration-1000" 
           style={{ borderImage: `linear-gradient(to bottom, ${themeColor}, transparent) 1`, opacity: 0.5 }} />

      {/* --- HEADER --- */}
      <header className="pt-16 pb-12 text-center relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Contenedor Flex para Título + Flamencos */}
        <div className="flex items-center justify-center w-full gap-4 md:gap-12 lg:gap-20 mb-2">
          
          {/* FLAMENCO IZQUIERDO: flamin.png (mira derecha) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="hidden md:block relative w-20 h-20 lg:w-28 lg:h-28 transition-all duration-1000"
            // GLOW PINK SIEMPRE FIJO
            style={{ filter: `drop-shadow(0 0 20px #ff0099) brightness(1.1)` }} 
          >
            <Image 
              src="/flamin.png" 
              alt="Flamingo Left" 
              fill 
              className="object-contain"
              sizes="(max-width: 768px) 0vw, 20vw"
            />
          </motion.div>

          {/* GRUPO DE TEXTO CENTRAL */}
          <div className="flex flex-col items-center">
            {/* Título más elegante y pequeño */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tighter text-white drop-shadow-2xl mix-blend-overlay opacity-90 leading-tight">
              DANI<br className="md:hidden" /> FLAMINGO
            </h1>
            
            <p className="text-[10px] md:text-xs font-light tracking-[0.6em] md:tracking-[1em] text-white/60 uppercase mt-4 ml-1">
              Travel Photography
            </p>
          </div>

          {/* FLAMENCO DERECHO: flamin-reverse.png (mira izquierda) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="hidden md:block relative w-20 h-20 lg:w-28 lg:h-28 transition-all duration-1000"
            // GLOW PINK SIEMPRE FIJO
            style={{ filter: `drop-shadow(0 0 20px #ff0099) brightness(1.1)` }} 
          >
            <Image 
              src="/flamin-reverse.png" 
              alt="Flamingo Right" 
              fill 
              className="object-contain"
              sizes="(max-width: 768px) 0vw, 20vw"
            />
          </motion.div>

        </div>

        <div className="flex justify-center items-center gap-3 text-sm md:text-xl tracking-[0.3em] font-light transition-colors duration-1000 opacity-80 mt-6" 
             style={{ color: themeColor }}>
          <span className="font-bold"><Counter to={50} />+</span> COUNTRIES EXPLORED
        </div>
      </header>
      {/* --- FIN HEADER --- */}

      <div className="relative w-full mb-12 z-0 pointer-events-none">
        <WorldMap color={themeColor} />
      </div>

      <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-24 max-w-6xl mx-auto px-4 relative z-20">
        {CATEGORIES.map((cat) => {
          const isActive = activeCat === cat;
          const catColor = getThemeColor(cat);
          return (
            <button 
              key={cat} onClick={() => handleSelectCategory(cat)}
              className="text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-500 relative group py-2"
              style={{ 
                color: isActive ? catColor : "#666", 
                textShadow: isActive ? `0 0 15px ${catColor}` : 'none',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {cat}
              {isActive && (
                <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[1px] bg-current shadow-[0_0_10px_currentColor]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="relative z-20 px-2 md:px-0">
        {isLoading ? (
          <div className="text-center p-24">
            <div className="inline-block w-8 h-8 border-t-2 border-l-2 rounded-full animate-spin" 
                style={{ borderColor: themeColor }}></div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState activeCat={activeCat} availableCategories={availableCategories} themeColor={themeColor} onSelectCategory={handleSelectCategory} getThemeColor={getThemeColor} />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16 max-w-[1400px] mx-auto pb-32">
            <AnimatePresence mode="popLayout">
              {filtered.map((photo, i) => (
                <motion.div
                  layout key={photo._id}
                  initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group cursor-pointer relative"
                >
                  <div className="relative aspect-[4/5] bg-[#0a0a0a] overflow-hidden transition-all duration-700 ease-out border border-white/5 group-hover:border-white/20">
                    <Image 
                      src={photo.imageUrl} alt={photo.title} fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-all duration-700 ease-out grayscale brightness-[0.8] contrast-[1.1] group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-start opacity-0 group-hover:opacity-100">
                       <span className="text-[10px] uppercase tracking-[0.3em] mb-2 pl-1 border-l-2" style={{ borderColor: themeColor, color: themeColor }}>
                         {photo.country || "Worldwide"}
                       </span>
                       <h2 className="text-2xl font-bold uppercase text-white tracking-wide">{photo.title}</h2>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-4 px-1 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[10px] uppercase tracking-widest">{photo.category}</span>
                    <span className="text-xs font-mono" style={{ color: themeColor }}>
                      {(i + 1).toString().padStart(2, '0')} / {filtered.length}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}
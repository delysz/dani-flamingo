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

// --- NUEVO MAPA MUNDIAL SVG ---
const WorldMapSVG = ({ color }: { color: string }) => {
  return (
    <div className="relative w-full h-[350px] md:h-[500px] flex items-center justify-center perspective-[1000px]">
      
      {/* Brillo central */}
      <div 
        className="absolute w-[180px] h-[180px] rounded-full opacity-15 blur-[50px] transition-colors duration-1000"
        style={{ background: color }}
      />
      
      {/* Contenedor del globo que gira */}
      <motion.div 
        className="relative w-[250px] h-[250px] md:w-[350px] md:h-[350px]"
        animate={{ rotateY: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {/* Círculo base del planeta */}
        <div className="absolute inset-0 rounded-full border border-white/10" 
             style={{ boxShadow: `0 0 30px ${color}20, inset 0 0 20px ${color}10` }} />
        
        {/* SVG del mapa mundial */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0a192f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#050505" stopOpacity="0.9" />
            </radialGradient>
          </defs>
          
          {/* Océanos */}
          <circle cx="50" cy="50" r="48" fill="url(#oceanGradient)" stroke={color} strokeWidth="0.3" strokeOpacity="0.3" />
          
          {/* Continentes (formas simplificadas) */}
          <g filter="url(#glow)" stroke={color} strokeWidth="0.25" fill="none" strokeLinejoin="round">
            {/* América del Norte */}
            <path d="M20,25 L25,20 L30,25 L28,35 L25,40 L22,45 L18,40 L15,35 L12,30 Z" 
                  fill="rgba(255,255,255,0.05)" strokeOpacity="0.8" />
            
            {/* América del Sur */}
            <path d="M22,48 L25,55 L23,65 L20,70 L16,68 L14,60 L18,55 Z" 
                  fill="rgba(255,255,255,0.05)" strokeOpacity="0.8" />
            
            {/* Europa */}
            <path d="M45,25 L50,28 L55,25 L58,30 L55,35 L52,38 L48,35 L45,32 Z" 
                  fill="rgba(255,255,255,0.05)" strokeOpacity="0.8" />
            
            {/* África */}
            <path d="M48,35 L52,38 L50,45 L48,50 L45,52 L42,48 L43,42 Z" 
                  fill="rgba(255,255,255,0.05)" strokeOpacity="0.8" />
            
            {/* Asia */}
            <path d="M55,22 L65,25 L70,30 L68,40 L65,45 L60,48 L55,45 L52,40 L50,35 Z" 
                  fill="rgba(255,255,255,0.05)" strokeOpacity="0.8" />
            
            {/* Australia */}
            <path d="M70,55 L75,58 L73,65 L68,68 L65,62 L67,58 Z" 
                  fill="rgba(255,255,255,0.05)" strokeOpacity="0.8" />
            
            {/* Antártida (base) */}
            <path d="M30,78 L45,80 L60,78 L70,82 L65,85 L50,88 L35,85 L25,82 Z" 
                  fill="rgba(255,255,255,0.05)" strokeOpacity="0.6" strokeDasharray="2 1" />
          </g>
          
          {/* Líneas de latitud/longitud */}
          <g stroke={color} strokeWidth="0.1" strokeOpacity="0.2" fill="none">
            <circle cx="50" cy="50" r="48" strokeDasharray="3 2" />
            <circle cx="50" cy="50" r="35" strokeDasharray="3 2" />
            <circle cx="50" cy="50" r="22" strokeDasharray="3 2" />
            {/* Meridianos */}
            <path d="M50,2 L50,98" />
            <path d="M20,20 L80,80" transform="rotate(45 50 50)" />
            <path d="M20,80 L80,20" transform="rotate(-45 50 50)" />
          </g>
          
          {/* Puntos de ubicación (simulando países visitados) */}
          <g>
            <circle cx="25" cy="30" r="1" fill={color} opacity="0.9">
              <animate attributeName="r" values="1;1.5;1" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="28" r="1" fill={color} opacity="0.9">
              <animate attributeName="r" values="1;1.5;1" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
            </circle>
            <circle cx="65" cy="35" r="1" fill={color} opacity="0.9">
              <animate attributeName="r" values="1;1.5;1" dur="3.2s" repeatCount="indefinite" begin="1s" />
            </circle>
            <circle cx="45" cy="45" r="1" fill={color} opacity="0.9">
              <animate attributeName="r" values="1;1.5;1" dur="2.8s" repeatCount="indefinite" begin="0.2s" />
            </circle>
            <circle cx="23" cy="55" r="1" fill={color} opacity="0.9">
              <animate attributeName="r" values="1;1.5;1" dur="3.5s" repeatCount="indefinite" begin="1.5s" />
            </circle>
          </g>
        </svg>
        
        {/* Anillos decorativos externos */}
        <motion.div 
          className="absolute inset-[-20px] border border-dashed rounded-full border-white/10 opacity-40"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-[-35px] border border-dotted rounded-full opacity-30"
          style={{ borderColor: color }}
          animate={{ rotate: 360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      
      {/* Texto descriptivo */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] opacity-70" style={{ color: color }}>
          <span className="font-bold">50+</span> COUNTRIES VISITED
        </p>
      </div>
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
            key={cat} onClick={() => onSelectCategory(cat)}
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

  // Estilo de las esquinas del marco
  const cornerStyle = {
    borderColor: themeColor,
    boxShadow: `0 0 15px ${themeColor}, inset 0 0 10px ${themeColor}40`
  };

  return (
    <main 
      className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden"
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      <div className="fixed inset-0 scanlines opacity-[0.15] pointer-events-none z-0" />

      {/* --- MARCOS ATREVIDOS (FIXED & INSIDE) --- */}
      {/* Estos marcos están fijos a la pantalla, pero el contenido tendrá padding para no tocarlos */}
      <div className="fixed inset-4 md:inset-8 pointer-events-none z-50">
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-12 h-12 md:w-24 md:h-24 lg:w-32 lg:h-32 border-t-[6px] md:border-t-[8px] border-l-[6px] md:border-l-[8px] transition-all duration-1000" style={cornerStyle} />
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-12 h-12 md:w-24 md:h-24 lg:w-32 lg:h-32 border-t-[6px] md:border-t-[8px] border-r-[6px] md:border-r-[8px] transition-all duration-1000" style={cornerStyle} />
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-12 h-12 md:w-24 md:h-24 lg:w-32 lg:h-32 border-b-[6px] md:border-b-[8px] border-l-[6px] md:border-l-[8px] transition-all duration-1000" style={cornerStyle} />
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-12 h-12 md:w-24 md:h-24 lg:w-32 lg:h-32 border-b-[6px] md:border-b-[8px] border-r-[6px] md:border-r-[8px] transition-all duration-1000" style={cornerStyle} />
      </div>

      {/* --- CONTENEDOR PRINCIPAL CON PADDING INTELIGENTE --- */}
      <div className="relative z-10 w-full min-h-screen pt-20 pb-20 px-4 sm:px-8 md:pt-28 md:pb-24 md:px-12 lg:px-20 xl:px-28 flex flex-col items-center">

        {/* --- HEADER --- */}
        <header className="w-full max-w-7xl mx-auto flex flex-col items-center mb-8 md:mb-12">
          
          <div className="flex items-center justify-center w-full gap-4 md:gap-12 lg:gap-16 mb-2">
            
            {/* FLAMENCO IZQUIERDO */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5, ease: "easeOut" }}
              className="hidden md:block relative w-16 h-16 lg:w-24 lg:h-24 xl:w-28 xl:h-28 transition-all duration-1000"
              style={{ filter: `drop-shadow(0 0 20px #ff0099) brightness(1.1)` }} 
            >
              <Image src="/flamin.png" alt="Flamingo Left" fill className="object-contain" sizes="(max-width: 768px) 0vw, 20vw" />
            </motion.div>

            {/* GRUPO DE TEXTO CENTRAL */}
            <div className="flex flex-col items-center">
              {/* TÍTULO CON GLOW ROSA PERMANENTE */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-sans font-bold tracking-tighter text-white leading-tight text-center"
                  style={{ textShadow: "0 0 10px #ff0099, 0 0 20px #ff0099, 0 0 40px #ff0099" }}>
                DANI<br className="md:hidden" /> FLAMINGO
              </h1>
              
              <p className="text-[10px] sm:text-xs md:text-sm font-light tracking-[0.4em] md:tracking-[0.6em] lg:tracking-[0.8em] text-white/70 uppercase mt-2 md:mt-4 text-center">
                Travel Photography
              </p>
            </div>

            {/* FLAMENCO DERECHO */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5, ease: "easeOut" }}
              className="hidden md:block relative w-16 h-16 lg:w-24 lg:h-24 xl:w-28 xl:h-28 transition-all duration-1000"
              style={{ filter: `drop-shadow(0 0 20px #ff0099) brightness(1.1)` }} 
            >
              <Image src="/flamin-reverse.png" alt="Flamingo Right" fill className="object-contain" sizes="(max-width: 768px) 0vw, 20vw" />
            </motion.div>

          </div>

          <div className="flex justify-center items-center gap-2 md:gap-3 text-sm md:text-lg lg:text-xl tracking-[0.2em] md:tracking-[0.3em] font-light transition-colors duration-1000 opacity-80 mt-6 md:mt-8" 
              style={{ color: themeColor }}>
            <span className="font-bold"><Counter to={50} />+</span> COUNTRIES EXPLORED
          </div>
        </header>

        {/* --- MAPA MUNDIAL --- */}
        <div className="w-full max-w-4xl mb-12 md:mb-16">
          <WorldMapSVG color={themeColor} />
        </div>

        {/* --- NAVEGACIÓN --- */}
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-3 md:gap-x-6 md:gap-y-4 mb-16 md:mb-24 max-w-5xl px-4">
          {CATEGORIES.map((cat) => {
            const isActive = activeCat === cat;
            const catColor = getThemeColor(cat);
            return (
              <button 
                key={cat} onClick={() => handleSelectCategory(cat)}
                className="text-xs md:text-sm tracking-[0.15em] md:tracking-[0.2em] uppercase transition-all duration-500 relative group py-1.5 md:py-2 px-1.5 md:px-2"
                style={{ 
                  color: isActive ? catColor : "#888", 
                  textShadow: isActive ? `0 0 15px ${catColor}` : 'none',
                  fontWeight: isActive ? 700 : 400,
                  transform: isActive ? "scale(1.05)" : "scale(1)"
                }}
              >
                {cat}
                {isActive && (
                  <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[1px] md:h-[2px] bg-current shadow-[0_0_8px_currentColor]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* --- GRID DE FOTOS --- */}
        <div className="w-full max-w-[1600px] px-4 sm:px-6 md:px-8">
          {isLoading ? (
            <div className="text-center p-20 md:p-24">
              <div className="inline-block w-8 h-8 border-t-2 border-l-2 rounded-full animate-spin" 
                  style={{ borderColor: themeColor }}></div>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState activeCat={activeCat} availableCategories={availableCategories} themeColor={themeColor} onSelectCategory={handleSelectCategory} getThemeColor={getThemeColor} />
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 lg:gap-14">
              <AnimatePresence mode="popLayout">
                {filtered.map((photo, i) => (
                  <motion.div
                    layout key={photo._id}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="group cursor-pointer relative"
                  >
                    <div className="relative aspect-[4/5] bg-[#0a0a0a] overflow-hidden transition-all duration-700 ease-out border border-white/10 group-hover:border-white/40">
                      <Image 
                        src={photo.imageUrl} alt={photo.title} fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-all duration-700 ease-out grayscale brightness-[0.8] contrast-[1.1] group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex flex-col items-start opacity-0 group-hover:opacity-100">
                        <span className="text-[10px] uppercase tracking-[0.3em] mb-2 pl-1 border-l-2" style={{ borderColor: themeColor, color: themeColor }}>
                          {photo.country || "Worldwide"}
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold uppercase text-white tracking-wide">{photo.title}</h2>
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-3 md:mt-4 px-1 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
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

        {/* Footer opcional */}
        <footer className="mt-20 md:mt-24 mb-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-white/30">
            DANI FLAMINGO © {new Date().getFullYear()}
          </p>
        </footer>

      </div>
    </main>
  );
}
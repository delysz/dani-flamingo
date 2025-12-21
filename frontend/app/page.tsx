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

// --- NUEVO MAPA: GLOBO HOLOGRÁFICO 3D (ROTATING WIREFRAME) ---
const HolographicGlobe = ({ color }: { color: string }) => {
  return (
    <div className="relative w-full h-[350px] md:h-[500px] flex items-center justify-center perspective-[1000px]">
      
      {/* Brillo central difuso */}
      <div 
        className="absolute w-[200px] h-[200px] rounded-full opacity-20 blur-[50px] transition-colors duration-1000"
        style={{ background: color }}
      />

      <div className="relative w-[280px] h-[280px] md:w-[350px] md:h-[350px]">
        {/* Esfera Base (Círculo exterior) */}
        <div className="absolute inset-0 rounded-full border border-white/10" style={{ boxShadow: `0 0 30px ${color}20` }} />
        
        {/* Anillos de Latitud (Horizontales) */}
        <svg className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100" style={{ opacity: 0.6 }}>
           <g stroke={color} strokeWidth="0.3" fill="none" className="transition-colors duration-1000">
             {/* Líneas orbitales abstractas que simulan el mundo girando */}
             <ellipse cx="50" cy="50" rx="48" ry="15" transform="rotate(20 50 50)" />
             <ellipse cx="50" cy="50" rx="48" ry="15" transform="rotate(50 50 50)" />
             <ellipse cx="50" cy="50" rx="48" ry="15" transform="rotate(80 50 50)" />
             <ellipse cx="50" cy="50" rx="48" ry="15" transform="rotate(110 50 50)" />
             <ellipse cx="50" cy="50" rx="48" ry="15" transform="rotate(140 50 50)" />
             <ellipse cx="50" cy="50" rx="48" ry="15" transform="rotate(170 50 50)" />
             
             {/* Ecuador */}
             <circle cx="50" cy="50" r="48" strokeOpacity="0.8" strokeWidth="0.5" strokeDasharray="4 2" />
           </g>
        </svg>

        {/* Anillos externos decorativos (Radar) */}
        <motion.div 
          className="absolute inset-[-40px] border border-dashed rounded-full border-white/20 opacity-30"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-[-20px] border border-dotted rounded-full"
          style={{ borderColor: color, opacity: 0.2 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
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
        <div className="absolute top-0 left-0 w-16 h-16 md:w-32 md:h-32 border-t-[8px] border-l-[8px] transition-all duration-1000" style={cornerStyle} />
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 border-t-[8px] border-r-[8px] transition-all duration-1000" style={cornerStyle} />
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-32 md:h-32 border-b-[8px] border-l-[8px] transition-all duration-1000" style={cornerStyle} />
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-16 h-16 md:w-32 md:h-32 border-b-[8px] border-r-[8px] transition-all duration-1000" style={cornerStyle} />
      </div>


      {/* --- CONTENEDOR PRINCIPAL CON PADDING MASIVO --- */}
      {/* Esto asegura que el contenido NUNCA toque los marcos */}
      <div className="relative z-10 w-full min-h-screen pt-32 pb-32 px-10 md:px-32 flex flex-col items-center">

        {/* --- HEADER --- */}
        <header className="w-full max-w-7xl mx-auto flex flex-col items-center mb-12">
          
          <div className="flex items-center justify-center w-full gap-4 md:gap-12 lg:gap-20 mb-2">
            
            {/* FLAMENCO IZQUIERDO */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5, ease: "easeOut" }}
              className="hidden md:block relative w-20 h-20 lg:w-28 lg:h-28 transition-all duration-1000"
              style={{ filter: `drop-shadow(0 0 20px #ff0099) brightness(1.1)` }} 
            >
              <Image src="/flamin.png" alt="Flamingo Left" fill className="object-contain" sizes="(max-width: 768px) 0vw, 20vw" />
            </motion.div>

            {/* GRUPO DE TEXTO CENTRAL */}
            <div className="flex flex-col items-center">
              {/* TÍTULO CON GLOW ROSA PERMANENTE */}
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-sans font-bold tracking-tighter text-white leading-tight text-center"
                  style={{ textShadow: "0 0 10px #ff0099, 0 0 20px #ff0099, 0 0 40px #ff0099" }}>
                DANI<br className="md:hidden" /> FLAMINGO
              </h1>
              
              <p className="text-[10px] md:text-xs font-light tracking-[0.5em] md:tracking-[0.8em] text-white/70 uppercase mt-4 text-center">
                Travel Photography
              </p>
            </div>

            {/* FLAMENCO DERECHO */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5, ease: "easeOut" }}
              className="hidden md:block relative w-20 h-20 lg:w-28 lg:h-28 transition-all duration-1000"
              style={{ filter: `drop-shadow(0 0 20px #ff0099) brightness(1.1)` }} 
            >
              <Image src="/flamin-reverse.png" alt="Flamingo Right" fill className="object-contain" sizes="(max-width: 768px) 0vw, 20vw" />
            </motion.div>

          </div>

          <div className="flex justify-center items-center gap-3 text-sm md:text-xl tracking-[0.3em] font-light transition-colors duration-1000 opacity-80 mt-8" 
              style={{ color: themeColor }}>
            <span className="font-bold"><Counter to={50} />+</span> COUNTRIES EXPLORED
          </div>
        </header>


        {/* --- MAPA HOLOGRÁFICO --- */}
        <div className="w-full max-w-4xl mb-16 pointer-events-none">
          <HolographicGlobe color={themeColor} />
        </div>


        {/* --- NAVEGACIÓN --- */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-24 max-w-5xl px-4">
          {CATEGORIES.map((cat) => {
            const isActive = activeCat === cat;
            const catColor = getThemeColor(cat);
            return (
              <button 
                key={cat} onClick={() => handleSelectCategory(cat)}
                className="text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-500 relative group py-2 px-2"
                style={{ 
                  color: isActive ? catColor : "#888", 
                  textShadow: isActive ? `0 0 15px ${catColor}` : 'none',
                  fontWeight: isActive ? 700 : 400,
                  transform: isActive ? "scale(1.1)" : "scale(1)"
                }}
              >
                {cat}
                {isActive && (
                  <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-current shadow-[0_0_10px_currentColor]" />
                )}
              </button>
            );
          })}
        </nav>


        {/* --- GRID DE FOTOS --- */}
        <div className="w-full max-w-[1600px]">
          {isLoading ? (
            <div className="text-center p-24">
              <div className="inline-block w-8 h-8 border-t-2 border-l-2 rounded-full animate-spin" 
                  style={{ borderColor: themeColor }}></div>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState activeCat={activeCat} availableCategories={availableCategories} themeColor={themeColor} onSelectCategory={handleSelectCategory} getThemeColor={getThemeColor} />
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
              <AnimatePresence mode="popLayout">
                {filtered.map((photo, i) => (
                  <motion.div
                    layout key={photo._id}
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="group cursor-pointer relative"
                  >
                    <div className="relative aspect-[4/5] bg-[#0a0a0a] overflow-hidden transition-all duration-700 ease-out border border-white/10 group-hover:border-white/40">
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

      </div>
    </main>
  );
}
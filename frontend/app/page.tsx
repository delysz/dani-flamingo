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

// --- MAPA REALISTA (SVG COORDINATES) ---
const WorldMap = ({ color }: { color: string }) => {
  return (
    <div className="relative w-full h-[300px] md:h-[450px] flex items-center justify-center opacity-70">
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundImage: `linear-gradient(${color}15 1px, transparent 1px), linear-gradient(90deg, ${color}15 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.3,
          maskImage: 'radial-gradient(circle, black 40%, transparent 80%)'
        }}
      />
      
      <svg viewBox="0 0 1000 500" className="w-full h-full" style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}>
        <g fill={color} fillOpacity="0.1" stroke={color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000">
           <path d="M150,80 L200,60 L280,50 L320,80 L300,150 L250,220 L220,180 L180,150 L140,120 Z M280,50 L350,40 L380,80 L340,120 Z" />
           <path d="M260,220 L320,230 L350,280 L320,380 L290,420 L270,350 L250,280 Z" />
           <path d="M430,80 L460,60 L500,60 L520,100 L500,130 L470,140 L440,120 Z" />
           <path d="M440,150 L500,140 L540,160 L560,250 L520,320 L480,300 L450,220 Z" />
           <path d="M520,60 L600,50 L750,50 L850,80 L880,150 L820,220 L750,250 L650,200 L580,150 Z" />
           <path d="M780,300 L850,290 L880,330 L850,380 L790,360 Z" />
           <path d="M415,95 L425,90 L425,105 L415,100 Z" />
           <path d="M860,120 L870,110 L875,130 L865,140 Z" />
           <circle cx="560" cy="300" r="4" />
           <path d="M720,260 L760,260 L750,270 L730,270 Z" />
        </g>
        
        <circle cx="500" cy="250" r="200" fill="none" stroke={color} strokeWidth="0.3" opacity="0.2" />
        <circle cx="500" cy="250" r="120" fill="none" stroke={color} strokeWidth="0.3" opacity="0.2" />
        
        <motion.line 
          x1="500" y1="250" x2="500" y2="50"
          stroke={`url(#scanGradient-${color})`} strokeWidth="2" strokeLinecap="round"
          animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ originX: "500px", originY: "250px" }}
        />
        <defs>
          <linearGradient id={`scanGradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <g fill={color}>
           {[{cx: 240, cy: 110},{cx: 290, cy: 100},{cx: 450, cy: 100},{cx: 860, cy: 125},{cx: 310, cy: 300},{cx: 820, cy: 330}].map((point, i) => (
             <motion.circle 
               key={i} cx={point.cx} cy={point.cy} r="2"
               animate={{ r: [2, 5, 2], opacity: [0.4, 1, 0.4] }}
               transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
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

  // Estilo común para las esquinas
  const cornerStyle = {
    borderColor: themeColor,
    filter: `drop-shadow(0 0 8px ${themeColor})`
  };

  return (
    <main 
      className="min-h-screen bg-[#050505] text-white p-4 md:p-12 relative overflow-x-hidden"
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      <div className="fixed inset-0 scanlines opacity-[0.15] pointer-events-none z-0" />

      {/* --- NUEVOS MARCOS "ATREVIDOS" (Cyber Corners) --- */}
      <div className="fixed inset-0 pointer-events-none z-50 p-4 md:p-8">
        {/* Esquina Superior Izquierda */}
        <div className="absolute top-4 left-4 w-24 h-24 border-t-[6px] border-l-[6px] rounded-tl-sm transition-all duration-1000" style={cornerStyle} />
        {/* Esquina Superior Derecha */}
        <div className="absolute top-4 right-4 w-24 h-24 border-t-[6px] border-r-[6px] rounded-tr-sm transition-all duration-1000" style={cornerStyle} />
        {/* Esquina Inferior Izquierda */}
        <div className="absolute bottom-4 left-4 w-24 h-24 border-b-[6px] border-l-[6px] rounded-bl-sm transition-all duration-1000" style={cornerStyle} />
        {/* Esquina Inferior Derecha */}
        <div className="absolute bottom-4 right-4 w-24 h-24 border-b-[6px] border-r-[6px] rounded-br-sm transition-all duration-1000" style={cornerStyle} />
      </div>
      {/* --- FIN MARCOS --- */}


      {/* --- HEADER --- */}
      <header className="pt-20 pb-12 text-center relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        
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
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tighter text-white leading-tight"
                style={{ textShadow: "0 0 15px #ff0099, 0 0 30px #ff0099, 0 0 50px #ff0099" }}>
              DANI<br className="md:hidden" /> FLAMINGO
            </h1>
            
            <p className="text-[10px] md:text-xs font-light tracking-[0.6em] md:tracking-[1em] text-white/60 uppercase mt-4 ml-1">
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
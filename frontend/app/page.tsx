"use client"
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { client } from '@/lib/sanity'
import Image from 'next/image'

interface Photo { 
  _id: string; 
  title: string; 
  country?: string; 
  imageUrl: string; 
  category: string;
}

const CATEGORIES = [
  "All",
  "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract",
  "Sofia", "Sofia's Artwork"
];

// 🎨 PALETA DE COLORES NEÓN IMPRESIONANTE
const getThemeColor = (cat: string): string => {
  switch (cat) {
    // Categorías de Sofía (MANDATORIO: Neon Pink)
    case "Sofia":
    case "Sofia's Artwork":
      return "#ff0099"; 

    // Categorías Generales
    case "Beach":
      return "#00f2ff"; // Cyan Eléctrico
    case "Street":
      return "#ff5e00"; // Naranja Fuego
    case "Plants":
      return "#0aff0a"; // Verde Matrix
    case "People":
      return "#9d00ff"; // Púrpura Real
    case "Animals":
      return "#ffd700"; // Oro Cyber
    case "Food":
      return "#ff0055"; // Rojo Carmesí
    case "Abstract":
      return "#ffffff"; // Blanco Puro

    // Default
    default:
      return "#00f2ff"; 
  }
};

const Counter = ({ to }: { to: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => { animate(count, to, { duration: 2.5, ease: "circOut" }); }, [to, count]);
  return <motion.span>{rounded}</motion.span>;
};

const WorldMap = ({ color }: { color: string }) => {
  const [particles, setParticles] = useState<Array<{
    id: number; size: number; left: string; top: string; duration: number; delay: number;
  }> | null>(null);

  useEffect(() => {
    const clientParticles = Array.from({ length: 20 }).map((_, index: number) => ({
      id: index,
      size: Math.random() * 4 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 2,
      delay: index * 0.2
    }));
    setParticles(clientParticles);
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[500px]">
      <div 
        className="absolute inset-0 opacity-20 blur-3xl transition-colors duration-1000"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}40 0%, transparent 70%)` }}
      />
      
      <svg 
        viewBox="0 0 1200 600" 
        className="w-full h-full opacity-90 transition-all duration-1000"
        style={{ filter: `drop-shadow(0 0 30px ${color}30)` }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        
        {/* Map Outlines */}
        <g fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" className="transition-colors duration-1000">
          <path d="M550,250 Q600,200 650,220 Q680,240 700,260 Q720,280 730,300 Q700,320 650,300 Q600,290 550,270 Z" />
          <path d="M550,350 Q600,320 650,330 Q700,340 720,380 Q680,400 630,390 Q580,380 550,360 Z" />
          <path d="M200,250 Q250,200 300,220 Q350,240 380,280 Q350,320 300,340 Q250,350 200,330 Z" />
          <path d="M750,200 Q800,180 850,200 Q900,220 920,260 Q880,280 830,270 Q780,260 750,240 Z" />
          <path d="M900,380 Q930,360 950,380 Q970,400 940,420 Q910,440 890,420 Z" />
        </g>
        
        <g fill={color} filter="url(#glow)" className="transition-colors duration-1000">
          {[0, 0.5, 1, 1.5, 2].map((delay, index) => {
            const points = [{cx:300,cy:280},{cx:550,cy:260},{cx:650,cy:340},{cx:750,cy:230},{cx:850,cy:260}];
            return (
              <motion.circle 
                key={index} cx={points[index]?.cx} cy={points[index]?.cy} r="6"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay }}
              />
            );
          })}
        </g>
        
        <motion.line 
          x1="0" y1="0" x2="1200" y2="600"
          stroke={color} strokeWidth="2" strokeOpacity="0.1"
          className="transition-colors duration-1000"
          initial={{ x1: -200, y1: -200, x2: 0, y2: 0 }}
          animate={{ x1: [-200, 1400], y1: [-200, 800], x2: [0, 1600], y2: [0, 1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </svg>
      
      {particles?.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full transition-colors duration-1000"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            width: particle.size, height: particle.size, left: particle.left, top: particle.top,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay }}
        />
      ))}
    </div>
  );
};

const EmptyState = ({ activeCat, availableCategories, themeColor, onSelectCategory, getThemeColor }: any) => {
  const otherCategories = useMemo(() => 
    availableCategories.filter((cat: string) => cat !== activeCat && cat !== "All").slice(0, 4)
  , [availableCategories, activeCat]);
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 px-6">
      <motion.div
        animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 mx-auto mb-8 opacity-20 transition-colors duration-1000"
        style={{ color: themeColor }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
          <path d="M30,50 L70,50 M50,30 L50,70" stroke="currentColor" strokeWidth="2" />
        </svg>
      </motion.div>
      <h3 className="text-3xl font-bold mb-4 transition-colors duration-1000" style={{ color: themeColor }}>
        {activeCat === "All" ? "GALERÍA VACÍA" : `0 FOTOS EN "${activeCat.toUpperCase()}"`}
      </h3>
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {otherCategories.map((cat: string) => (
          <motion.button
            key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(cat)}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: `${getThemeColor(cat)}20`,
              border: `1px solid ${getThemeColor(cat)}`,
              color: getThemeColor(cat)
            }}
          >
            {cat}
          </motion.button>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => onSelectCategory("All")}
        className="px-8 py-3 rounded-lg font-bold text-black transition-colors duration-1000"
        style={{ backgroundColor: themeColor, boxShadow: `0 0 20px ${themeColor}60` }}
      >
        VER TODAS
      </motion.button>
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
      _id, title, country, "category": coalesce(category, "Uncategorized"), "imageUrl": image.asset->url
    }`;
    
    client.fetch(query)
      .then((data: Photo[]) => {
        setPhotos(data);
        setAvailableCategories(Array.from(new Set(data.map((p: Photo) => p.category))));
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => activeCat === "All" ? photos : photos.filter(p => p.category === activeCat), [activeCat, photos]);
  const themeColor = useMemo(() => getThemeColor(activeCat), [activeCat]);
  const handleSelectCategory = useCallback((cat: string) => setActiveCat(cat), []);

  return (
    // INYECTAMOS LA VARIABLE CSS AQUÍ PARA QUE GLOBALS.CSS LA LEA
    <main 
      className="min-h-screen bg-[#050505] text-white p-6 md:p-16 relative overflow-x-hidden"
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      {/* Texture Overlay (Scanlines) */}
      <div className="fixed inset-0 scanlines opacity-30 pointer-events-none z-[60]" />

      {/* Dynamic Border Frame */}
      <div className="fixed inset-0 border-[15px] md:border-[20px] border-transparent pointer-events-none z-50 transition-all duration-1000" 
           style={{ borderImage: `linear-gradient(to bottom, ${themeColor}, transparent) 1`, opacity: 0.6 }} />

      <header className="pt-12 pb-8 text-center relative z-10 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-8xl font-sans tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-6 drop-shadow-2xl">
          Dani Flamingo
        </h1>
        <div className="flex justify-center items-center gap-4 text-xl md:text-2xl tracking-[0.4em] font-light transition-colors duration-1000" 
             style={{ color: themeColor, textShadow: `0 0 25px ${themeColor}` }}>
          <span className="font-bold text-4xl"><Counter to={50} />+</span> COUNTRIES
        </div>
      </header>

      <div className="relative w-full h-[250px] md:h-[500px] mb-16 grayscale hover:grayscale-0 transition-all duration-1000">
        <WorldMap color={themeColor} />
      </div>

      <nav className="flex flex-wrap justify-center gap-6 md:gap-10 mb-20 max-w-6xl mx-auto px-4">
        {CATEGORIES.map((cat) => {
          const isActive = activeCat === cat;
          const catColor = getThemeColor(cat);
          return (
            <button 
              key={cat} onClick={() => handleSelectCategory(cat)}
              className="text-sm md:text-lg tracking-widest uppercase transition-all duration-500 relative group py-2"
              style={{ 
                color: isActive ? catColor : "rgba(255,255,255,0.4)", 
                textShadow: isActive ? `0 0 20px ${catColor}` : 'none',
                fontWeight: isActive ? 700 : 300,
                transform: isActive ? "scale(1.1)" : "scale(1)"
              }}
            >
              {cat}
              <span className={`absolute bottom-0 left-0 h-[2px] bg-current transition-all duration-500 ${isActive ? 'w-full shadow-[0_0_10px_currentColor]' : 'w-0 group-hover:w-full'}`} />
            </button>
          );
        })}
      </nav>

      {isLoading ? (
        <div className="text-center p-16">
          <div className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin transition-colors duration-1000" 
               style={{ borderColor: `${themeColor} transparent transparent transparent` }}></div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState activeCat={activeCat} availableCategories={availableCategories} themeColor={themeColor} onSelectCategory={handleSelectCategory} getThemeColor={getThemeColor} />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto pb-24">
          <AnimatePresence mode="popLayout">
            {filtered.map((photo, i) => (
              <motion.div
                layout key={photo._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] bg-[#111] overflow-hidden border border-white/5 transition-all duration-500 hover:border-[color:var(--theme-color)] hover:shadow-[0_0_30px_var(--theme-color)] hover:z-10"
                     style={{ '--theme-color': themeColor } as React.CSSProperties}>
                  <Image 
                    src={photo.imageUrl} alt={photo.title} fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-[10px] tracking-[4px] uppercase mb-2 font-bold" style={{ color: themeColor }}>
                      {photo.country || "WORLDWIDE"}
                    </p>
                    <h3 className="text-2xl font-bold uppercase text-white leading-none drop-shadow-lg">{photo.title}</h3>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 px-2 opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs tracking-widest uppercase">{photo.category}</span>
                  <span className="text-lg font-bold" style={{ color: themeColor }}>{(i + 1).toString().padStart(2, '0')}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </main>
  );
}
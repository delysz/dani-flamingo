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

const getThemeColor = (cat: string): string => {
  if (["Sofia", "Sofia's Artwork"].includes(cat)) return "#ff0099";
  return "#00f2ff";
};

const Counter = ({ to }: { to: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => { animate(count, to, { duration: 2.5, ease: "circOut" }); }, [to, count]);
  return <motion.span>{rounded}</motion.span>;
};

const WorldMap = ({ color }: { color: string }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    size: number;
    left: string;
    top: string;
    duration: number;
    delay: number;
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
        className="absolute inset-0 opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}40 0%, transparent 70%)` }}
      />
      
      <svg 
        viewBox="0 0 1200 600" 
        className="w-full h-full opacity-90"
        style={{ filter: `drop-shadow(0 0 30px ${color}30)` }}
      >
        <defs>
          <linearGradient id="continentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <g fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.4">
          <path d="M550,250 Q600,200 650,220 Q680,240 700,260 Q720,280 730,300 Q700,320 650,300 Q600,290 550,270 Z" />
          <path d="M550,350 Q600,320 650,330 Q700,340 720,380 Q680,400 630,390 Q580,380 550,360 Z" />
          <path d="M200,250 Q250,200 300,220 Q350,240 380,280 Q350,320 300,340 Q250,350 200,330 Z" />
          <path d="M750,200 Q800,180 850,200 Q900,220 920,260 Q880,280 830,270 Q780,260 750,240 Z" />
          <path d="M900,380 Q930,360 950,380 Q970,400 940,420 Q910,440 890,420 Z" />
        </g>
        
        <g stroke={color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="8,8">
          <line x1="300" y1="280" x2="550" y2="260" />
          <line x1="650" y1="260" x2="750" y2="230" />
          <line x1="550" y1="320" x2="650" y2="340" />
          <line x1="700" y1="280" x2="850" y2="260" />
        </g>
        
        <g fill={color} filter="url(#glow)">
          {[0, 0.5, 1, 1.5, 2].map((delay: number, index: number) => {
            const points = [
              { cx: 300, cy: 280 },
              { cx: 550, cy: 260 },
              { cx: 650, cy: 340 },
              { cx: 750, cy: 230 },
              { cx: 850, cy: 260 }
            ];
            
            return (
              <motion.circle 
                key={index}
                cx={points[index]?.cx}
                cy={points[index]?.cy}
                r="6"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay }}
              />
            );
          })}
        </g>
        
        <motion.line 
          x1="0" y1="0" x2="1200" y2="600"
          stroke={color} 
          strokeWidth="2" 
          strokeOpacity="0.1"
          initial={{ x1: -200, y1: -200, x2: 0, y2: 0 }}
          animate={{ 
            x1: [-200, 1400] as [number, number],
            y1: [-200, 800] as [number, number],
            x2: [0, 1600] as [number, number],
            y2: [0, 1000] as [number, number]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        <circle 
          cx="600" cy="300" r="150" 
          fill="none" 
          stroke={color} 
          strokeWidth="1" 
          strokeOpacity="0.1"
          strokeDasharray="5,15"
        />
        <circle 
          cx="600" cy="300" r="250" 
          fill="none" 
          stroke={color} 
          strokeWidth="0.5" 
          strokeOpacity="0.05"
          strokeDasharray="10,30"
        />
      </svg>
      
      {particles ? particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay
          }}
        />
      )) : null}
    </div>
  );
};

const EmptyState = ({ 
  activeCat, 
  availableCategories, 
  themeColor, 
  onSelectCategory,
  getThemeColor 
}: { 
  activeCat: string; 
  availableCategories: string[]; 
  themeColor: string; 
  onSelectCategory: (cat: string) => void;
  getThemeColor: (cat: string) => string;
}) => {
  
  const otherCategories = useMemo(() => 
    availableCategories.filter((cat: string) => 
      cat !== activeCat && cat !== "All"
    ).slice(0, 4)
  , [availableCategories, activeCat]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 px-6"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 mx-auto mb-8 opacity-20"
        style={{ color: themeColor }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          <path d="M30,50 L70,50 M50,30 L50,70" stroke="currentColor" strokeWidth="2" />
        </svg>
      </motion.div>
      
      <h3 className="text-3xl font-bold mb-4" style={{ color: themeColor }}>
        {activeCat === "All" ? "GALERÍA VACÍA" : `0 FOTOS EN "${activeCat.toUpperCase()}"`}
      </h3>
      
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        {activeCat === "All" 
          ? "Añade fotos desde Sanity Studio para comenzar"
          : "Esta categoría está vacía. Prueba con alguna de estas:"}
      </p>
      
      {otherCategories.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {otherCategories.map((cat: string) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
      )}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectCategory("All")}
        className="px-8 py-3 rounded-lg font-bold text-white transition-colors"
        style={{ backgroundColor: themeColor }}
      >
        VER TODAS LAS FOTOS ({availableCategories.filter((c: string) => c !== "All").length} categorías)
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
      _id, 
      title, 
      country, 
      "category": coalesce(category, "Uncategorized"),
      "imageUrl": image.asset->url
    }`;
    
    client.fetch(query)
      .then((data: Photo[]) => {
        console.log("📸 Fotos cargadas:", data.length);
        console.log("🏷️ Categorías únicas:", [...new Set(data.map(p => p.category))]);
        
        setPhotos(data);
        const realCategories = Array.from(new Set(data.map((p: Photo) => p.category)));
        setAvailableCategories(realCategories);
      })
      .catch((error: Error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => 
    activeCat === "All" ? photos : photos.filter(p => p.category === activeCat)
  , [activeCat, photos]);
  
  const themeColor = useMemo(() => getThemeColor(activeCat), [activeCat]);

  const handleSelectCategory = useCallback((cat: string) => {
    setActiveCat(cat);
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-16 relative overflow-x-hidden selection:bg-white/20 selection:text-black">
      
      <div className="fixed inset-0 border-[20px] border-transparent pointer-events-none z-50 transition-colors duration-1000" 
           style={{ borderImage: `linear-gradient(to bottom, ${themeColor}, transparent) 1`, opacity: 0.5 }} />

      <header className="pt-12 pb-8 text-center relative z-10 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-8xl font-sans tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-6 drop-shadow-2xl">
          Dani Flamingo
        </h1>
        
        <div className="flex justify-center items-center gap-4 text-xl md:text-2xl tracking-[0.4em] font-light" 
             style={{ color: themeColor, textShadow: `0 0 20px ${themeColor}` }}>
          <span className="font-bold text-4xl"><Counter to={50} />+</span> COUNTRIES
        </div>
      </header>

      <div className="relative w-full h-[250px] md:h-[500px] mb-16 grayscale hover:grayscale-0 transition-all duration-1000">
        <WorldMap color={themeColor} />
      </div>

      <nav className="flex flex-wrap justify-center gap-6 md:gap-10 mb-20 max-w-6xl mx-auto px-4">
        {CATEGORIES.map((cat: string) => {
          const isActive = activeCat === cat;
          const catColor = getThemeColor(cat);
          
          return (
            <button 
              key={cat} 
              onClick={() => handleSelectCategory(cat)}
              className="text-sm md:text-lg tracking-widest uppercase transition-all duration-300 relative group py-2"
              style={{ 
                color: isActive ? catColor : "rgba(255,255,255,0.4)", 
                textShadow: isActive ? `0 0 15px ${catColor}` : 'none',
                fontWeight: isActive ? 700 : 300
              }}
            >
              {cat}
              <span className={`absolute bottom-0 left-0 h-[1px] bg-current transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
          );
        })}
      </nav>

      {isLoading ? (
        <div className="text-center p-16">
          <div className="inline-block w-12 h-12 border-4 border-t-transparent border-[color:var(--theme-color)] rounded-full animate-spin" 
               style={{ '--theme-color': themeColor } as React.CSSProperties}></div>
          <p className="mt-4 text-gray-400">Cargando fotos desde Sanity...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center p-8 border border-red-500 text-red-500 mb-10 max-w-2xl mx-auto bg-red-900/10">
          <p className="font-bold mb-2">⚠ NO HAY FOTOS EN LA BASE DE DATOS</p>
          <p className="mb-4">Añade fotos desde tu Sanity Studio.</p>
          <a 
            href="https://daniela-flamingo.sanity.studio" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Ir a Sanity Studio
          </a>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          activeCat={activeCat}
          availableCategories={availableCategories}
          themeColor={themeColor}
          onSelectCategory={handleSelectCategory}
          getThemeColor={getThemeColor}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto pb-24">
          <AnimatePresence mode="popLayout">
            {filtered.map((photo: Photo, i: number) => (
              <motion.div
                layout key={photo._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] bg-[#111] overflow-hidden border border-white/5 transition-all duration-500 group-hover:border-[color:var(--neon)]"
                     style={{ '--neon': themeColor } as React.CSSProperties}>
                  
                  <Image 
                    src={photo.imageUrl} 
                    alt={photo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-[10px] tracking-[4px] uppercase mb-2" style={{ color: themeColor }}>
                      {photo.country || "WORLDWIDE"}
                    </p>
                    <h3 className="text-2xl font-bold uppercase text-white leading-none">{photo.title}</h3>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3 px-2 opacity-40 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs tracking-widest">{photo.category}</span>
                  <span className="text-lg font-bold" style={{ color: themeColor }}>{(i + 1).toString().padStart(2, '0')}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {process.env.NODE_ENV === 'development' && photos.length > 0 && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-xs p-3 rounded-lg opacity-70 hover:opacity-100 transition-opacity z-50">
          <p>Total fotos: {photos.length}</p>
          <p>Fotos filtradas: {filtered.length}</p>
          <p>Categorías en Sanity: {availableCategories.join(", ")}</p>
        </div>
      )}
    </main>
  );
}
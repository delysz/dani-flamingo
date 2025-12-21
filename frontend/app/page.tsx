"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { client } from '@/lib/sanity'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// --- IMPORTACIÓN DINÁMICA DE GLOBE (Evita errores de servidor) ---
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center opacity-50 text-xs tracking-widest">INITIALIZING SYSTEMS...</div>
});

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
    case "Abstract": return "#ffffff"; 
    default: return "#00f2ff"; 
  }
};

const Counter = ({ to }: { to: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => { animate(count, to, { duration: 3, ease: "circOut" }); }, [to, count]);
  return <motion.span>{rounded}</motion.span>;
};

// --- COMPONENTE GLOBO 3D (REACT-GLOBE.GL) ---
const HolographicGlobe = ({ color }: { color: string }) => {
  // CORRECCIÓN AQUÍ: Inicializamos con null
  const globeEl = useRef<any>(null); 
  
  const [countries, setCountries] = useState({ features: [] });
  const [arcs, setArcs] = useState<any[]>([]);

  useEffect(() => {
    // Cargar mapa
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => setCountries(data));

    // Generar arcos aleatorios
    const N_ARCS = 20;
    const prevCoords = [...Array(N_ARCS).keys()].map(() => ({
      lat: (Math.random() - 0.5) * 160,
      lng: (Math.random() - 0.5) * 360,
    }));
    
    setArcs(prevCoords.map(start => {
      const end = {
        lat: (Math.random() - 0.5) * 160,
        lng: (Math.random() - 0.5) * 360
      };
      return {
        startLat: start.lat, startLng: start.lng, endLat: end.lat, endLng: end.lng,
        color: ['rgba(0,0,0,0)', color]
      };
    }));
  }, [color]);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.6;
      globeEl.current.controls().enableZoom = false; 
    }
  }, []);

  return (
    <div className="w-full h-[450px] md:h-[600px] flex items-center justify-center relative z-0 cursor-move transition-opacity duration-1000 ease-in-out opacity-70 hover:opacity-100">
      <Globe
        ref={globeEl}
        width={1000} // Ancho fijo amplio para evitar cortes
        height={600}
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor={color}
        atmosphereAltitude={0.2}
        polygonsData={countries.features}
        polygonCapColor={() => 'rgba(0,0,0,0)'}
        polygonSideColor={() => 'rgba(0,0,0,0)'}
        polygonStrokeColor={() => color}
        polygonAltitude={0.005}
        arcsData={arcs}
        arcColor={() => color}
        arcDashLength={0.4}
        arcDashGap={2}
        arcDashAnimateTime={1500}
        arcStroke={0.5}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#050505_60%)]" />
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

  return (
    <main 
      className="min-h-screen bg-[#050505] text-white relative overflow-x-hidden selection:bg-white/20"
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      <div className="fixed inset-0 scanlines opacity-[0.15] pointer-events-none z-0" />

      {/* --- MARCO "TECH-CHAMFER" --- */}
      <div 
        className="fixed inset-4 md:inset-8 z-50 pointer-events-none transition-all duration-1000"
        style={{ 
          border: `1px solid ${themeColor}`,
          clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
          boxShadow: `inset 0 0 20px ${themeColor}20` 
        }}
      />
      
      {/* Decoración extra del marco */}
      <div className="fixed top-4 left-[24px] w-12 h-[1px] bg-white/50 z-50 pointer-events-none md:top-8 md:left-[32px]" />
      <div className="fixed top-[24px] left-4 w-[1px] h-12 bg-white/50 z-50 pointer-events-none md:left-8 md:top-[32px]" />
      <div className="fixed bottom-4 right-[24px] w-12 h-[1px] bg-white/50 z-50 pointer-events-none md:bottom-8 md:right-[32px]" />
      <div className="fixed bottom-[24px] right-4 w-[1px] h-12 bg-white/50 z-50 pointer-events-none md:right-8 md:bottom-[32px]" />

      {/* --- CONTENEDOR PRINCIPAL CON MÁRGENES CORREGIDOS --- */}
      {/* pt-32 y pb-32 aseguran que el contenido no toque los bordes superior e inferior */}
      <div className="relative z-10 w-full min-h-screen pt-32 pb-16 px-8 md:px-24 flex flex-col items-center">

        {/* HEADER */}
        <header className="w-full max-w-7xl mx-auto flex flex-col items-center mb-12">
          <div className="flex items-center justify-center w-full gap-6 md:gap-16 mb-4">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2 }}
              className="hidden md:block relative w-20 h-20 md:w-28 md:h-28"
              style={{ filter: `drop-shadow(0 0 25px #ff0099)` }}
            >
              <Image src="/flamin.png" alt="Left" fill className="object-contain" />
            </motion.div>

            <div className="flex flex-col items-center text-center">
              <h1 className="text-5xl md:text-8xl font-sans font-bold tracking-tighter text-white leading-none"
                  style={{ textShadow: "0 0 10px #ff0099, 0 0 30px #ff0099" }}>
                DANI<br className="md:hidden" /> FLAMINGO
              </h1>
              <div className="h-[1px] w-24 bg-white/30 my-4" />
              <p className="text-[10px] md:text-xs font-medium tracking-[0.6em] text-white/60 uppercase">
                Travel Photography
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.2 }}
              className="hidden md:block relative w-20 h-20 md:w-28 md:h-28"
              style={{ filter: `drop-shadow(0 0 25px #ff0099)` }}
            >
              <Image src="/flamin-reverse.png" alt="Right" fill className="object-contain" />
            </motion.div>

          </div>

          <div className="flex items-center gap-3 text-sm tracking-[0.3em] font-light mt-2" style={{ color: themeColor }}>
            <span className="font-bold text-xl"><Counter to={50} />+</span> COUNTRIES
          </div>
        </header>

        {/* --- GLOBO 3D --- */}
        <div className="w-full max-w-6xl mb-16 flex justify-center overflow-hidden">
          <HolographicGlobe color={themeColor} />
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-24 max-w-6xl">
          {CATEGORIES.map((cat) => {
            const isActive = activeCat === cat;
            const catColor = getThemeColor(cat);
            return (
              <button 
                key={cat} onClick={() => handleSelectCategory(cat)}
                className="text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-300 relative py-1"
                style={{ 
                  color: isActive ? catColor : "#666", 
                  textShadow: isActive ? `0 0 10px ${catColor}` : 'none',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {cat}
                <span className={`absolute -bottom-1 left-0 h-[1px] bg-current transition-all duration-300 ${isActive ? 'w-full' : 'w-0'}`} />
              </button>
            );
          })}
        </nav>

        {/* GRID DE FOTOS */}
        <div className="w-full max-w-[1600px] mb-24">
          {isLoading ? (
            <div className="text-center p-20">
              <div className="inline-block w-8 h-8 border-t-2 border-r-2 rounded-full animate-spin" 
                  style={{ borderColor: themeColor }}></div>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState activeCat={activeCat} availableCategories={availableCategories} themeColor={themeColor} onSelectCategory={handleSelectCategory} getThemeColor={getThemeColor} />
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              <AnimatePresence mode="popLayout">
                {filtered.map((photo, i) => (
                  <motion.div
                    layout key={photo._id}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group cursor-pointer relative"
                  >
                    <div className="relative aspect-[4/5] bg-[#0a0a0a] overflow-hidden border border-white/5 transition-all duration-500 hover:border-white/30">
                      <Image 
                        src={photo.imageUrl} alt={photo.title} fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-all duration-700 ease-out grayscale brightness-75 contrast-125 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                      
                      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-start translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="text-[9px] uppercase tracking-[0.3em] mb-2 px-2 py-1 border border-current" style={{ color: themeColor, borderColor: themeColor }}>
                          {photo.country || "Worldwide"}
                        </span>
                        <h2 className="text-2xl font-bold uppercase text-white tracking-wider">{photo.title}</h2>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1">
                       <div className="h-[1px] w-4 bg-white/20" />
                       <span className="text-[10px] font-mono opacity-30">{(i + 1).toString().padStart(2, '0')}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* --- FOOTER --- */}
        <footer className="w-full border-t border-white/5 pt-12 pb-8 flex flex-col items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] text-white/30">
           <p>© {new Date().getFullYear()} Dani Flamingo. All rights reserved.</p>
           <p className="flex items-center gap-2">
             Design by 
             <a 
               href="https://github.com/delysz" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-white/60 hover:text-white hover:underline transition-all"
               style={{ color: themeColor }}
             >
               DELYSZ
             </a>
           </p>
        </footer>

      </div>
    </main>
  );
}
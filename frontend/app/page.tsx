"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { client } from '@/lib/sanity'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { 
  Globe2, MapPin, Pause, Play, RotateCcw, 
  Instagram, Mail, ShoppingBag, ArrowRight 
} from 'lucide-react'
import { useSpring, animated, to } from '@react-spring/web' 
import { useInView } from 'react-intersection-observer' 

// --- IMPORTACIÓN DINÁMICA DEL GLOBO ---
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-[10px] tracking-widest text-white/30 uppercase">INITIALIZING SATELLITE...</div>
});

// --- TIPOS ---
interface Photo { 
  _id: string; 
  title: string; 
  country?: string; 
  imageUrl: string; 
  category: string;
}

// --- DICCIONARIO DE COORDENADAS (INTEGRADO AQUÍ MISMO) ---
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  // AMÉRICA
  "United States": { lat: 37.0902, lng: -95.7129 }, "USA": { lat: 37.0902, lng: -95.7129 },
  "Canada": { lat: 56.1304, lng: -106.3468 }, "Mexico": { lat: 23.6345, lng: -102.5528 },
  "Brazil": { lat: -14.2350, lng: -51.9253 }, "Argentina": { lat: -38.4161, lng: -63.6167 },
  "Chile": { lat: -35.6751, lng: -71.5430 }, "Colombia": { lat: 4.5709, lng: -74.2973 },
  "Peru": { lat: -9.1900, lng: -75.0152 }, "Cuba": { lat: 21.5218, lng: -77.7812 },
  // EUROPA
  "Spain": { lat: 40.4637, lng: -3.7492 }, "France": { lat: 46.2276, lng: 2.2137 },
  "Germany": { lat: 51.1657, lng: 10.4515 }, "Italy": { lat: 41.8719, lng: 12.5674 },
  "United Kingdom": { lat: 55.3781, lng: -3.4360 }, "UK": { lat: 55.3781, lng: -3.4360 },
  "Portugal": { lat: 39.3999, lng: -8.2245 }, "Netherlands": { lat: 52.1326, lng: 5.2913 },
  "Belgium": { lat: 50.5039, lng: 4.4699 }, "Switzerland": { lat: 46.8182, lng: 8.2275 },
  "Greece": { lat: 39.0742, lng: 21.8243 }, "Sweden": { lat: 60.1282, lng: 18.6435 },
  // ASIA
  "Japan": { lat: 36.2048, lng: 138.2529 }, "China": { lat: 35.8617, lng: 104.1954 },
  "India": { lat: 20.5937, lng: 78.9629 }, "Thailand": { lat: 15.8700, lng: 100.9925 },
  "Indonesia": { lat: -0.7893, lng: 113.9213 }, "South Korea": { lat: 35.9078, lng: 127.7669 },
  "Singapore": { lat: 1.3521, lng: 103.8198 },
  // ÁFRICA & OCEANÍA
  "Morocco": { lat: 31.7917, lng: -7.0926 }, "South Africa": { lat: -30.5595, lng: 22.9375 },
  "Egypt": { lat: 26.8206, lng: 30.8025 }, "Australia": { lat: -25.2744, lng: 133.7751 },
  "New Zealand": { lat: -40.9006, lng: 174.8860 },
};

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

// --- COMPONENTE: CONTADOR FÍSICAS ---
const PhysicsCounter = ({ n }: { n: number }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: n,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });
  return <animated.span>{number.to((n) => n.toFixed(0))}</animated.span>;
};

// --- COMPONENTE: TARJETA 3D TILT ---
const calc = (x: number, y: number) => [-(y - window.innerHeight / 2) / 20, (x - window.innerWidth / 2) / 20, 1.1];
const trans = (x: number, y: number, s: number) => `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

const PhotoCard3D = ({ photo, index, themeColor, delay }: any) => {
  const [props, set] = useSpring(() => ({ xys: [0, 0, 1], config: { mass: 5, tension: 350, friction: 40 } }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: delay * 0.05 }}
      className="relative group z-10 cursor-pointer"
    >
      <animated.div
        onMouseMove={({ clientX: x, clientY: y }) => set({ xys: calc(x, y) })}
        onMouseLeave={() => set({ xys: [0, 0, 1] })}
        style={{ transform: to(props.xys, trans) }}
        className="relative aspect-[4/5] bg-[#0a0a0a] overflow-hidden border border-white/10 transition-colors duration-500 hover:border-white/40"
      >
        <Image 
          src={photo.imageUrl} alt={photo.title} fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-all duration-700 ease-out grayscale brightness-[0.8] contrast-[1.1] group-hover:grayscale-0 group-hover:brightness-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-start pointer-events-none">
           <div className="flex items-center gap-2 mb-2">
             <MapPin className="w-3 h-3" style={{ color: themeColor }} />
             <span className="text-[10px] uppercase tracking-[0.2em] text-white/80">{photo.country || "Worldwide"}</span>
           </div>
           <h3 className="text-xl font-bold uppercase text-white tracking-wide leading-none">{photo.title}</h3>
        </div>

        <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-widest text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {photo.category}
        </div>
      </animated.div>
      
      <div className="flex justify-between items-center mt-3 px-1 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
         <div className="h-[1px] w-8 bg-current" style={{ color: themeColor }} />
         <span className="text-[10px] font-mono text-white/50">{(index + 1).toString().padStart(2, '0')}</span>
      </div>
    </motion.div>
  );
};

// --- GLOBO 3D INTELIGENTE (RESPONSIVE & CHINCHETAS REALES) ---
const GlobeSection = ({ color, photos }: { color: string, photos: Photo[] }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const [isRotating, setIsRotating] = useState(true);

  // Ajuste de tamaño responsive
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    updateSize(); 
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // GENERADOR DE CHINCHETAS (PUNTOS)
  const locationsData = useMemo(() => {
    const uniqueCountries = Array.from(new Set(photos.map(p => p.country).filter(Boolean)));
    // Usamos reduce para limpiar nulos y contentar a TypeScript
    return uniqueCountries.reduce((acc: any[], countryName) => {
      const coords = COUNTRY_COORDS[countryName as string];
      if (coords) {
        acc.push({
          lat: coords.lat, lng: coords.lng,
          label: countryName, color: color, size: 0.5
        });
      }
      return acc;
    }, []);
  }, [photos, color]);

  // Arcos decorativos
  const arcsData = useMemo(() => Array.from({ length: 15 }, () => ({
    startLat: (Math.random() - 0.5) * 160, startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 160, endLng: (Math.random() - 0.5) * 360,
    color: [color, 'rgba(255,255,255,0)']
  })), [color]);

  useEffect(() => {
    if (globeRef.current && inView) {
      globeRef.current.controls().autoRotate = isRotating;
      globeRef.current.controls().autoRotateSpeed = 0.6;
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }
  }, [isRotating, inView]);

  return (
    <section ref={ref} className="w-full mb-24 flex flex-col items-center px-4">
       <div className="flex items-center gap-4 mb-8 w-full max-w-4xl">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-white/90 flex items-center gap-3">
             <Globe2 className="w-5 h-5 opacity-50" /> Global Locations
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
       </div>
       
       <div ref={containerRef} className="relative w-full max-w-4xl h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-white/10 bg-[#080808] shadow-2xl mx-auto flex justify-center items-center">
         
         {inView && (
            <>
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button onClick={() => setIsRotating(!isRotating)} className="p-2 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
                  {isRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button onClick={() => globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000)} className="p-2 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all">
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {dimensions.width > 1 && (
                <Globe
                  ref={globeRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                  backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                  pointsData={locationsData} 
                  pointColor="color" pointAltitude={0.07} pointRadius={0.6} pointResolution={2}
                  labelsData={locationsData}
                  labelLat="lat" labelLng="lng" labelText="label"
                  labelSize={1.5} labelDotRadius={0.5} labelColor={() => "rgba(255,255,255,0.75)"}
                  labelResolution={2}
                  ringsData={locationsData}
                  ringColor={() => color} ringMaxRadius={3} ringPropagationSpeed={2} ringRepeatPeriod={800}
                  arcsData={arcsData}
                  arcColor="color" arcDashLength={0.4} arcDashGap={2} arcDashAnimateTime={2000} arcStroke={0.3}
                  atmosphereColor={color} atmosphereAltitude={0.15}
                  backgroundColor="rgba(0,0,0,0)"
                />
              )}
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
            </>
         )}
         
         {!inView && (
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: color }} />
         )}
       </div>
    </section>
  );
};

// --- MAIN COMPONENT ---
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
    
    client.fetch(query)
      .then((data: Photo[]) => {
        if (data && data.length > 0) {
          setPhotos(data);
          setAvailableCategories(['All', ...Array.from(new Set(data.map((p: Photo) => p.category)))]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => activeCat === "All" ? photos : photos.filter(p => p.category === activeCat), [activeCat, photos]);
  const themeColor = useMemo(() => getThemeColor(activeCat), [activeCat]);
  const handleSelectCategory = useCallback((cat: string) => setActiveCat(cat), []);

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-white/20 relative">
      
      {/* FONDO FIJO */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#000000_100%)]" />
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
         <div className="absolute inset-0 transition-colors duration-1000 opacity-20" 
              style={{ background: `radial-gradient(circle at 50% -20%, ${themeColor}, transparent 60%)` }} />
      </div>

      {/* --- MARCO INTEGRADO (OPEN FRAME) --- */}
      {/* Marco que respira, no corta el contenido */}
      <div className="fixed inset-4 md:inset-8 z-40 pointer-events-none transition-colors duration-1000">
        {/* Esquinas */}
        <div className="absolute top-0 left-0 w-24 md:w-48 h-24 md:h-48 rounded-tl-3xl border-t border-l opacity-60 transition-all duration-1000" style={{ borderColor: themeColor }} />
        <div className="absolute top-0 right-0 w-24 md:w-48 h-24 md:h-48 rounded-tr-3xl border-t border-r opacity-60 transition-all duration-1000" style={{ borderColor: themeColor }} />
        <div className="absolute bottom-0 left-0 w-24 md:w-48 h-24 md:h-48 rounded-bl-3xl border-b border-l opacity-60 transition-all duration-1000" style={{ borderColor: themeColor }} />
        <div className="absolute bottom-0 right-0 w-24 md:w-48 h-24 md:h-48 rounded-br-3xl border-b border-r opacity-60 transition-all duration-1000" style={{ borderColor: themeColor }} />
        {/* Líneas sutiles laterales */}
        <div className="absolute top-24 bottom-24 left-0 w-[1px] opacity-10" style={{ background: themeColor }} />
        <div className="absolute top-24 bottom-24 right-0 w-[1px] opacity-10" style={{ background: themeColor }} />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 w-full min-h-screen px-8 md:px-20 lg:px-32 flex flex-col items-center">

        {/* HERO */}
        <header className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] relative mb-12 mt-12">
          <div className="flex items-center justify-center w-full gap-4 md:gap-12 lg:gap-20 mb-8 scale-90 md:scale-100">
            <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.5, ease: "circOut" }} className="relative w-24 h-24 md:w-32 md:h-32">
              <Image src="/flamin.png" alt="Flamingo" fill className="object-contain" style={{ filter: `drop-shadow(0 0 30px ${themeColor})` }} />
            </motion.div>
            <div className="text-center z-10">
              <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }} className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-[0.9]">
                DANI<br className="md:hidden" /> FLAMINGO
              </motion.h1>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 1 }} className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/50 to-transparent my-6" />
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-xs md:text-sm font-medium tracking-[0.8em] text-white/70 uppercase">
                Visual Explorer • Global Artist
              </motion.p>
            </div>
            <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.5, ease: "circOut" }} className="relative w-24 h-24 md:w-32 md:h-32">
              <Image src="/flamin-reverse.png" alt="Flamingo" fill className="object-contain" style={{ filter: `drop-shadow(0 0 30px ${themeColor})` }} />
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex gap-12 text-center">
             <div><div className="text-3xl font-bold text-white"><PhysicsCounter n={50} />+</div><div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Countries</div></div>
             <div className="w-[1px] h-10 bg-white/10" />
             <div><div className="text-3xl font-bold text-white"><PhysicsCounter n={filtered.length} /></div><div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Photos</div></div>
          </motion.div>
          <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
             <ArrowRight className="w-6 h-6 rotate-90 text-white/50" />
          </motion.div>
        </header>

        {/* NAV */}
        <nav className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl w-full py-6 mb-16 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4 md:gap-8">
            {CATEGORIES.map((cat) => {
              const isActive = activeCat === cat;
              const catColor = getThemeColor(cat);
              return (
                <button key={cat} onClick={() => handleSelectCategory(cat)} className="relative text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-300 py-2 group" style={{ color: isActive ? catColor : "#666", fontWeight: isActive ? 700 : 400 }}>
                  {cat}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-current transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-1/2'}`} style={{ boxShadow: isActive ? `0 0 10px ${catColor}` : 'none' }} />
                </button>
              );
            })}
          </div>
        </nav>

        {/* GRID */}
        <div className="w-full max-w-[1600px] mb-32 min-h-[50vh]">
          {isLoading ? (
             <div className="flex justify-center items-center h-40"><div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: themeColor }}></div></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl"><h3 className="text-2xl text-white/50 font-light mb-4">Void Sector</h3><p className="text-white/30 text-sm">No visual data found for {activeCat}</p></div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
              <AnimatePresence mode="popLayout">
                {filtered.map((photo, i) => (
                  <PhotoCard3D key={photo._id} photo={photo} index={i} themeColor={themeColor} delay={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* MAPA */}
        <GlobeSection color={themeColor} photos={photos} />

        {/* FOOTER */}
        <footer className="w-full border-t border-white/5 pt-16 pb-12 flex flex-col items-center gap-8 text-[10px] uppercase tracking-[0.2em] text-white/30 mb-8">
           <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</a>
              <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Mail className="w-4 h-4" /> Email</a>
              <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Prints</a>
           </div>
           <div className="text-center space-y-2">
             <p>© {new Date().getFullYear()} Dani Flamingo. All rights reserved.</p>
             <p className="flex items-center justify-center gap-2">Design by <a href="https://github.com/delysz" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white hover:underline transition-all flex items-center gap-1" style={{ color: themeColor }}>DELYSZ</a></p>
           </div>
        </footer>

      </div>
    </main>
  );
}
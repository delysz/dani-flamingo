"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpring, animated, to } from '@react-spring/web' // FÍSICAS
import { useInView } from 'react-intersection-observer' // PERFORMANCE
import { client } from '@/lib/sanity'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { 
  Globe2, MapPin, Pause, Play, RotateCcw, 
  Instagram, Mail, ShoppingBag, ArrowRight 
} from 'lucide-react'

// --- IMPORTACIÓN DINÁMICA DEL GLOBO ---
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="text-xs tracking-widest text-white/30">INITIALIZING PHYSICS...</div>
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

// --- PALETA ---
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

// --- COMPONENTE: CONTADOR CON FÍSICAS (REACT-SPRING) ---
const PhysicsCounter = ({ n }: { n: number }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: n,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 }, // Configuración de "peso" y "roce"
  });
  return <animated.span>{number.to((n) => n.toFixed(0))}</animated.span>;
};

// --- COMPONENTE: TARJETA CON TILT 3D (REACT-SPRING) ---
const calc = (x: number, y: number) => [-(y - window.innerHeight / 2) / 20, (x - window.innerWidth / 2) / 20, 1.1]
const trans = (x: number, y: number, s: number) => `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`

const PhotoCard3D = ({ photo, index, themeColor, delay }: any) => {
  // Hook de físicas para el efecto Tilt
  const [props, set] = useSpring(() => ({ xys: [0, 0, 1], config: { mass: 5, tension: 350, friction: 40 } }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: delay * 0.05 }}
      className="relative group z-10"
    >
      <animated.div
        onMouseMove={({ clientX: x, clientY: y }) => set({ xys: calc(x, y) })}
        onMouseLeave={() => set({ xys: [0, 0, 1] })}
        style={{ transform: to(props.xys, trans) }}
        className="relative aspect-[4/5] bg-[#0a0a0a] overflow-hidden border border-white/10"
      >
        <Image 
          src={photo.imageUrl} alt={photo.title} fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-all duration-700 ease-out grayscale brightness-[0.8] contrast-[1.1] group-hover:grayscale-0 group-hover:brightness-100" 
        />
        
        {/* Overlay Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        {/* Info al Hover */}
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-start pointer-events-none">
           <div className="flex items-center gap-2 mb-2">
             <MapPin className="w-3 h-3" style={{ color: themeColor }} />
             <span className="text-[10px] uppercase tracking-[0.2em] text-white/80">{photo.country || "Worldwide"}</span>
           </div>
           <h3 className="text-xl font-bold uppercase text-white tracking-wide leading-none">{photo.title}</h3>
        </div>

        {/* Badge Categoría */}
        <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-widest text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {photo.category}
        </div>
      </animated.div>
      
      {/* Index fuera del tilt para legibilidad */}
      <div className="flex justify-between items-center mt-3 px-1 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
         <div className="h-[1px] w-8 bg-current" style={{ color: themeColor }} />
         <span className="text-[10px] font-mono text-white/50">{(index + 1).toString().padStart(2, '0')}</span>
      </div>
    </motion.div>
  );
};

// --- GLOBO 3D OPTIMIZADO CON INTERSECTION OBSERVER ---
const GlobeSection = ({ color }: { color: string }) => {
  // Solo cargamos el globo cuando esta sección es visible en pantalla
  const { ref, inView } = useInView({
    triggerOnce: true, // Cargar una vez y listo
    threshold: 0.1,    // Cargar cuando se vea el 10% del componente
  });

  const globeRef = useRef<any>(null);
  const [isRotating, setIsRotating] = useState(true);
  
  // Datos y Arcos (Memoizados)
  const cities = [
    { lat: 40.7128, lng: -74.0060, size: 0.8, color: '#ff0099' },
    { lat: 51.5074, lng: -0.1278, size: 0.7, color: '#00f2ff' },
    { lat: 35.6762, lng: 139.6503, size: 0.7, color: '#00ff41' },
    { lat: -33.8688, lng: 151.2093, size: 0.6, color: '#ff4d00' },
    { lat: 48.8566, lng: 2.3522, size: 0.6, color: '#bd00ff' },
  ];

  const arcsData = useMemo(() => Array.from({ length: 15 }, () => ({
    startLat: (Math.random() - 0.5) * 160,
    startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 160,
    endLng: (Math.random() - 0.5) * 360,
    color: [color, 'rgba(255,255,255,0)']
  })), [color]);

  useEffect(() => {
    if (globeRef.current && inView) {
      globeRef.current.controls().autoRotate = isRotating;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }
  }, [isRotating, inView]);

  return (
    <section ref={ref} className="w-full max-w-7xl mb-24 min-h-[600px] flex flex-col justify-center">
       <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-white/90 flex items-center gap-3">
             <Globe2 className="w-6 h-6 opacity-50" /> World Map
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
       </div>
       
       <div className="relative w-full h-[500px] md:h-[700px] rounded-3xl overflow-hidden border border-white/10 bg-[#080808] shadow-2xl">
         {/* Renderizado condicional para performance */}
         {inView ? (
            <>
              <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                <button 
                  onClick={() => setIsRotating(!isRotating)}
                  className="p-3 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white transition-all hover:scale-110"
                >
                  {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000)}
                  className="p-3 rounded-full bg-black/50 border border-white/10 text-white/70 hover:text-white transition-all hover:scale-110"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <Globe
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                pointsData={cities}
                pointColor="color"
                pointAltitude={0.05}
                pointRadius={0.5}
                pointResolution={2}
                ringsData={cities}
                ringColor={(d: any) => (d as any).color}
                ringMaxRadius={2}
                ringPropagationSpeed={2}
                ringRepeatPeriod={800}
                arcsData={arcsData}
                arcColor="color"
                arcDashLength={0.4}
                arcDashGap={2}
                arcDashAnimateTime={2000}
                arcStroke={0.3}
                atmosphereColor={color}
                atmosphereAltitude={0.2}
                width={1400} 
                backgroundColor="rgba(0,0,0,0)"
              />
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
            </>
         ) : (
           <div className="w-full h-full flex items-center justify-center">
             <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: color }} />
           </div>
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
    <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-white/20">
      
      {/* Fondo Fijo */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#000000_100%)]" />
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
         <div className="absolute inset-0 transition-colors duration-1000 opacity-20" 
              style={{ background: `radial-gradient(circle at 50% -20%, ${themeColor}, transparent 60%)` }} />
      </div>

      <div className="relative z-10 w-full min-h-screen px-6 md:px-16 lg:px-24 flex flex-col items-center">

        {/* HERO SECTION */}
        <header className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[70vh] relative mb-12">
          
          <div className="flex items-center justify-center w-full gap-4 md:gap-12 lg:gap-20 mb-8 scale-90 md:scale-100">
            {/* Flamenco Izquierda */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.5, ease: "circOut" }}
              className="relative w-24 h-24 md:w-32 md:h-32"
            >
              <Image src="/flamin.png" alt="Flamingo" fill className="object-contain" 
                     style={{ filter: `drop-shadow(0 0 30px ${themeColor})` }} />
            </motion.div>

            {/* Título */}
            <div className="text-center z-10">
              <motion.h1 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 leading-[0.9]"
              >
                DANI<br className="md:hidden" /> FLAMINGO
              </motion.h1>
              
              <motion.div 
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 1 }}
                className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/50 to-transparent my-6"
              />
              
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="text-xs md:text-sm font-medium tracking-[0.8em] text-white/70 uppercase"
              >
                Visual Explorer • Global Artist
              </motion.p>
            </div>

            {/* Flamenco Derecha */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.5, ease: "circOut" }}
              className="relative w-24 h-24 md:w-32 md:h-32"
            >
              <Image src="/flamin-reverse.png" alt="Flamingo" fill className="object-contain"
                     style={{ filter: `drop-shadow(0 0 30px ${themeColor})` }} />
            </motion.div>
          </div>

          {/* Estadísticas con React Spring */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="flex gap-12 text-center"
          >
             <div>
                <div className="text-3xl font-bold text-white"><PhysicsCounter n={50} />+</div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Countries</div>
             </div>
             <div className="w-[1px] h-10 bg-white/10" />
             <div>
                <div className="text-3xl font-bold text-white"><PhysicsCounter n={filtered.length} /></div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">Photos</div>
             </div>
          </motion.div>

          <motion.div 
             className="absolute bottom-10 left-1/2 -translate-x-1/2"
             animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
             transition={{ duration: 2, repeat: Infinity }}
          >
             <ArrowRight className="w-6 h-6 rotate-90 text-white/50" />
          </motion.div>
        </header>

        {/* NAVEGACIÓN */}
        <nav className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl w-full py-6 mb-16 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4 md:gap-8">
            {CATEGORIES.map((cat) => {
              const isActive = activeCat === cat;
              const catColor = getThemeColor(cat);
              return (
                <button 
                  key={cat} onClick={() => handleSelectCategory(cat)}
                  className="relative text-xs md:text-sm tracking-[0.2em] uppercase transition-all duration-300 py-2 group"
                  style={{ color: isActive ? catColor : "#666", fontWeight: isActive ? 700 : 400 }}
                >
                  {cat}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-current transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-1/2'}`} 
                        style={{ boxShadow: isActive ? `0 0 10px ${catColor}` : 'none' }} />
                </button>
              );
            })}
          </div>
        </nav>

        {/* GRID DE FOTOS (CON 3D TILT) */}
        <div className="w-full max-w-[1600px] mb-32 min-h-[50vh]">
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: themeColor }}></div>
             </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
              <h3 className="text-2xl text-white/50 font-light mb-4">Void Sector</h3>
              <p className="text-white/30 text-sm">No visual data found for {activeCat}</p>
            </div>
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

        {/* MAPA (AL FINAL & LAZY LOADED) */}
        <GlobeSection color={themeColor} />

        {/* FOOTER */}
        <footer className="w-full border-t border-white/5 pt-16 pb-12 flex flex-col items-center gap-8 text-[10px] uppercase tracking-[0.2em] text-white/30">
           <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</a>
              <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Mail className="w-4 h-4" /> Email</a>
              <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Prints</a>
           </div>
           
           <div className="text-center space-y-2">
             <p>© {new Date().getFullYear()} Dani Flamingo. All rights reserved.</p>
             <p className="flex items-center justify-center gap-2">
               Design by 
               <a 
                 href="https://github.com/delysz" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-white/60 hover:text-white hover:underline transition-all flex items-center gap-1"
                 style={{ color: themeColor }}
               >
                 DELYSZ
               </a>
             </p>
           </div>
        </footer>

      </div>
    </main>
  );
}
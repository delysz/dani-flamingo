"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { client } from '@/lib/sanity'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Importación dinámica del globo para evitar problemas SSR
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="w-full h-[600px] flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-t-transparent border-[#ff0099] rounded-full animate-spin"></div>
  </div>
});

// --- TIPOS ---
interface Photo { 
  _id: string; 
  title: string; 
  country?: string; 
  imageUrl: string; 
  category: string;
  latitude?: number;
  longitude?: number;
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

// --- GLOBO 3D ESPECTACULAR ---
const EpicGlobe3D = ({ color, photos }: { color: string, photos: Photo[] }) => {
  const globeRef = useRef<any>(null);
  
  // Coordenadas de ciudades icónicas
  const cities = [
    { lat: 40.7128, lng: -74.0060, size: 0.8, label: 'New York', color: '#ff0099' },
    { lat: 51.5074, lng: -0.1278, size: 0.7, label: 'London', color: '#00f2ff' },
    { lat: 35.6762, lng: 139.6503, size: 0.7, label: 'Tokyo', color: '#00ff41' },
    { lat: -33.8688, lng: 151.2093, size: 0.6, label: 'Sydney', color: '#ff4d00' },
    { lat: 48.8566, lng: 2.3522, size: 0.6, label: 'Paris', color: '#bd00ff' },
    { lat: 41.9028, lng: 12.4964, size: 0.6, label: 'Rome', color: '#ffc400' },
    { lat: 19.4326, lng: -99.1332, size: 0.6, label: 'Mexico City', color: '#ff0040' },
    { lat: -22.9068, lng: -43.1729, size: 0.6, label: 'Rio', color: '#e0e0e0' },
    { lat: 55.7558, lng: 37.6173, size: 0.6, label: 'Moscow', color: '#ff0099' },
    { lat: 39.9042, lng: 116.4074, size: 0.6, label: 'Beijing', color: '#00f2ff' },
    { lat: 40.4168, lng: -3.7038, size: 0.5, label: 'Madrid', color: '#00ff41' },
    { lat: 52.5200, lng: 13.4050, size: 0.5, label: 'Berlin', color: '#ff4d00' },
    { lat: 34.0522, lng: -118.2437, size: 0.5, label: 'Los Angeles', color: '#bd00ff' },
    { lat: 1.3521, lng: 103.8198, size: 0.5, label: 'Singapore', color: '#ffc400' },
  ];

  useEffect(() => {
    if (globeRef.current) {
      // Auto-rotación del globo
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      
      // Configuración de la cámara
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }
  }, []);

  // Efecto de partículas volando hacia el globo
  const arcsData = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      startLat: (Math.random() - 0.5) * 180,
      startLng: (Math.random() - 0.5) * 360,
      endLat: cities[i % cities.length]?.lat || 0,
      endLng: cities[i % cities.length]?.lng || 0,
      color: [color, '#ffffff'],
    }));
  }, [color]);

  return (
    <div className="relative w-full h-[400px] md:h-[600px] lg:h-[700px] overflow-hidden rounded-2xl">
      {/* Fondo de partículas */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full"
            style={{
              background: color,
              opacity: Math.random() * 0.5 + 0.2,
              filter: `blur(${Math.random() * 2 + 1}px)`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Globo 3D */}
      <div className="relative w-full h-full">
        <Globe
          ref={globeRef}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
          
          pointsData={cities}
          pointColor={(d: any) => d.color || color}
          pointAltitude={0.1}
          pointRadius={0.5}
          pointLabel={(d: any) => `
            <div class="p-3 bg-black/90 backdrop-blur-sm rounded-xl border" 
                 style="border-color: ${color}; color: ${color}; max-width: 200px;">
              <div class="font-bold text-sm">📍 ${d.label}</div>
              <div class="text-xs opacity-80 mt-1">Click to explore photos</div>
            </div>
          `}
          
          arcsData={arcsData}
          arcColor={"color"}
          arcDashLength={() => Math.random() * 0.8 + 0.2}
          arcDashGap={() => Math.random() * 0.5}
          arcDashAnimateTime={() => Math.random() * 4000 + 2000}
          arcStroke={0.3}
          
          ringsData={cities.filter((_, i) => i % 2 === 0)}
          ringColor={() => color}
          ringMaxRadius={1.5}
          ringPropagationSpeed={2}
          ringRepeatPeriod={3000}
          
          atmosphereColor={color}
          atmosphereAltitude={0.3}
          
          width={800}
          height={800}
          
          backgroundColor="rgba(0,0,0,0)"
          onGlobeReady={() => {
            if (globeRef.current) {
              globeRef.current.controls().enableZoom = true;
              globeRef.current.controls().zoomSpeed = 0.8;
              globeRef.current.controls().enableRotate = true;
              globeRef.current.controls().rotateSpeed = 0.5;
            }
          }}
        />
        
        {/* Efectos de neón alrededor del globo */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ borderColor: color, width: '105%', height: '105%' }}
            animate={{ 
              boxShadow: [
                `0 0 30px ${color}40`,
                `0 0 60px ${color}60`,
                `0 0 30px ${color}40`
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ 
              background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`, 
              width: '115%', 
              height: '115%' 
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Overlay de información */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="bg-black/70 backdrop-blur-md p-4 rounded-2xl border" style={{ borderColor: color }}>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color }}>
            🌎 GLOBAL EXPLORER
          </h3>
          <p className="text-xs text-white/80">
            <span className="font-bold" style={{ color }}>{cities.length}</span> iconic cities • 
            <span className="font-bold ml-2" style={{ color }}>78</span> countries visited
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 text-xs uppercase tracking-widest bg-black/70 backdrop-blur-md rounded-lg border hover:bg-black/90 transition-all"
            style={{ borderColor: color, color }}
            onClick={() => {
              if (globeRef.current) {
                globeRef.current.controls().autoRotate = !globeRef.current.controls().autoRotate;
              }
            }}
          >
            ⏸️ Pause Rotation
          </button>
          <button 
            className="px-4 py-2 text-xs uppercase tracking-widest bg-black/70 backdrop-blur-md rounded-lg border hover:bg-black/90 transition-all"
            style={{ borderColor: color, color }}
            onClick={() => {
              if (globeRef.current) {
                globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
              }
            }}
          >
            🌍 Reset View
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE DE FOTO MEJORADO ---
const PhotoCard = ({ photo, index, total, themeColor, delay }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: delay * 0.1, ease: "backOut" }}
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Efecto de neón alrededor de la tarjeta */}
      <motion.div 
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
        style={{ background: themeColor }}
        animate={isHovered ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div className="relative bg-gradient-to-br from-black to-gray-900 rounded-2xl overflow-hidden border transition-all duration-500 group-hover:scale-[1.02]"
           style={{ 
             borderColor: isHovered ? themeColor : 'rgba(255,255,255,0.1)',
             boxShadow: isHovered ? `0 0 40px ${themeColor}30` : 'none'
           }}>
        
        {/* Imagen con efecto de parallax */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.div 
            className="absolute inset-0"
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <Image 
              src={photo.imageUrl} 
              alt={photo.title} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-all duration-700"
              style={{ 
                filter: isHovered ? 
                  'grayscale(0) brightness(1.1) contrast(1.05)' : 
                  'grayscale(0.3) brightness(0.9) contrast(1.1)' 
              }}
            />
          </motion.div>
          
          {/* Overlay de gradiente animado */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          {/* Efecto de luz que se mueve */}
          <motion.div 
            className="absolute inset-0 opacity-0 group-hover:opacity-30"
            style={{ background: `linear-gradient(45deg, transparent 30%, ${themeColor} 50%, transparent 70%)` }}
            animate={isHovered ? { x: ['0%', '200%'] } : {}}
            transition={isHovered ? { duration: 1.5, repeat: Infinity } : {}}
          />
          
          {/* Badge de categoría */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-[10px] uppercase tracking-widest rounded-full font-bold"
                  style={{ 
                    background: `${themeColor}20`, 
                    color: themeColor, 
                    border: `1px solid ${themeColor}40`,
                    backdropFilter: 'blur(10px)'
                  }}>
              {photo.category}
            </span>
          </div>
          
          {/* Número de secuencia */}
          <div className="absolute top-4 right-4">
            <span className="text-sm font-mono px-2 py-1 rounded bg-black/60 backdrop-blur-sm"
                  style={{ color: themeColor }}>
              #{String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-6 relative">
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/60 mb-2">
              <span className="w-1 h-1 rounded-full" style={{ background: themeColor }}></span>
              {photo.country || "WORLDWIDE"}
            </span>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:tracking-wide transition-all duration-300">{photo.title}</h3>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: themeColor }}></div>
              <span className="text-xs uppercase tracking-widest text-white/60">Click to explore</span>
            </div>
            <motion.div 
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: themeColor }}
              whileHover={{ scale: 1.2, rotate: 90 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-black font-bold">→</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- HEADER CON EFECTOS ESPECTACULARES ---
const EpicHeader = ({ themeColor }: { themeColor: string }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <header className="relative w-full max-w-7xl mx-auto flex flex-col items-center mb-8 md:mb-12 px-4">
      {/* Efecto de partículas que siguen el cursor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute w-[300px] h-[300px] rounded-full blur-3xl opacity-10 transition-all duration-300"
          style={{ 
            background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)`,
            left: `${mousePos.x - 150}px`,
            top: `${mousePos.y - 150}px`,
          }}
        />
      </div>
      
      {/* Líneas de conexión animadas */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={themeColor} stopOpacity="0" />
            <stop offset="50%" stopColor={themeColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={themeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.path
            key={i}
            d={`M ${i * 30} 0 Q ${window.innerWidth / 2} ${80 + i * 40}, ${window.innerWidth - i * 30} 0`}
            stroke="url(#lineGradient)"
            strokeWidth="0.3"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ duration: 2, delay: i * 0.2 }}
          />
        ))}
      </svg>

      <div className="relative z-10 flex flex-col items-center">
        {/* Flamingos con animación */}
        <div className="flex items-center justify-center w-full gap-4 md:gap-12 lg:gap-24 mb-6">
          <motion.div 
            initial={{ x: -100, opacity: 0, rotate: -10 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
            className="relative w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32"
            whileHover={{ scale: 1.1, rotate: -5 }}
          >
            <Image 
              src="/flamin.png" 
              alt="Flamingo" 
              fill 
              className="object-contain"
              style={{ filter: `drop-shadow(0 0 20px ${themeColor}) brightness(1.1)` }}
            />
          </motion.div>
          
          <div className="text-center">
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-white mb-2 md:mb-4"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              style={{
                textShadow: `
                  0 0 10px ${themeColor},
                  0 0 30px ${themeColor},
                  0 0 60px ${themeColor}
                `
              }}
            >
              DANI
              <motion.span 
                className="block"
                animate={{ 
                  textShadow: [
                    `0 0 10px ${themeColor}`,
                    `0 0 30px ${themeColor}`,
                    `0 0 50px ${themeColor}`,
                    `0 0 10px ${themeColor}`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                FLAMINGO
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xs sm:text-sm md:text-base tracking-[0.3em] md:tracking-[0.5em] uppercase text-white/80 mb-4 md:mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              VISUAL EXPLORER • GLOBAL ARTIST
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ x: 100, opacity: 0, rotate: 10 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
            className="relative w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Image 
              src="/flamin-reverse.png" 
              alt="Flamingo" 
              fill 
              className="object-contain"
              style={{ filter: `drop-shadow(0 0 20px ${themeColor}) brightness(1.1)` }}
            />
          </motion.div>
        </div>
        
        {/* Contador espectacular */}
        <motion.div 
          className="flex flex-col items-center gap-4 md:gap-6 mt-4 md:mt-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1, type: "spring" }}
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-1 md:mb-2" style={{ color: themeColor }}>
              <Counter to={78} />
            </div>
            <div className="text-xs sm:text-sm uppercase tracking-[0.3em] text-white/60">COUNTRIES EXPLORED</div>
          </div>
          
          <div className="flex gap-4 md:gap-6 lg:gap-8">
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">1.2K+</div>
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40">PHOTOS</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">24</div>
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40">CONTINENTS</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">7</div>
              <div className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40">YEARS</div>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
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
          const uniqueCategories = Array.from(new Set(data.map((p: Photo) => p.category)));
          setAvailableCategories(['All', ...uniqueCategories]);
        } else {
          console.warn("No photos found.");
          setAvailableCategories(['All']);
        }
      })
      .catch((err) => console.error("Sanity Error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (activeCat === "All") return photos;
    return photos.filter(p => p.category === activeCat);
  }, [activeCat, photos]);
  
  const themeColor = useMemo(() => getThemeColor(activeCat), [activeCat]);
  
  const handleSelectCategory = useCallback((cat: string) => {
    setActiveCat(cat);
    // Scroll suave al grid de fotos
    document.getElementById('photo-grid')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Efecto de fondo futurista */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/5 to-black" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${themeColor}05 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, ${themeColor}03 0%, transparent 50%)`,
        }} />
        
        {/* Grid de líneas */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke={themeColor} strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        
        {/* Partículas flotantes */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[1px] h-[1px] rounded-full"
            style={{
              background: themeColor,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 50 - 25],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="relative z-10">
        <EpicHeader themeColor={themeColor} />
        
        {/* Globo 3D */}
        <section className="px-4 md:px-8 lg:px-12 mb-16 md:mb-20 lg:mb-24">
          <div className="max-w-7xl mx-auto">
            <EpicGlobe3D color={themeColor} photos={photos} />
          </div>
        </section>
        
        {/* Navegación mejorada */}
        <nav className="sticky top-0 z-40 py-4 md:py-6 bg-black/80 backdrop-blur-xl border-b border-white/10 mb-12 md:mb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 lg:gap-4">
              {CATEGORIES.map((cat) => {
                const isActive = activeCat === cat;
                const catColor = getThemeColor(cat);
                
                return (
                  <motion.button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className="relative px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl overflow-hidden transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: isActive 
                        ? `linear-gradient(135deg, ${catColor}20, ${catColor}40)` 
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isActive ? catColor : 'rgba(255,255,255,0.1)'}`,
                      color: isActive ? catColor : '#888',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: `radial-gradient(circle at center, ${catColor}20, transparent 70%)` }}
                        layoutId="activeBackground"
                      />
                    )}
                    
                    <span className="relative z-10 text-xs md:text-sm font-medium tracking-wider uppercase">
                      {cat}
                    </span>
                    
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 w-6 md:w-8 h-0.5 md:h-1 rounded-full"
                        style={{ background: catColor }}
                        layoutId="activeIndicator"
                        initial={{ x: "-50%", scale: 0 }}
                        animate={{ x: "-50%", scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </nav>
        
        {/* Galería de fotos */}
        <section id="photo-grid" className="px-4 md:px-8 lg:px-12 pb-20 md:pb-32">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <motion.div
                  className="w-16 h-16 rounded-full border-4 border-t-transparent"
                  style={{ borderColor: themeColor }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.p 
                  className="mt-6 text-white/60 uppercase tracking-widest text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Loading Visual Journey...
                </motion.p>
              </div>
            ) : filtered.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-32"
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{ color: themeColor }}>
                  No photos in this dimension
                </h3>
                <p className="text-white/60 mb-8 max-w-md mx-auto px-4">
                  The universe of {activeCat} is waiting to be captured. Explore other categories to discover visual masterpieces from around the globe.
                </p>
                <motion.button
                  onClick={() => handleSelectCategory("All")}
                  className="px-6 md:px-8 py-3 md:py-4 rounded-xl uppercase tracking-widest font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor}80)`,
                    boxShadow: `0 0 40px ${themeColor}40`
                  }}
                  whileHover={{ boxShadow: `0 0 60px ${themeColor}60` }}
                >
                  Explore All Dimensions
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mb-8 md:mb-12"
                >
                  <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: themeColor }}>
                    {activeCat === "All" ? "Visual Universe" : `${activeCat} Collection`}
                  </h2>
                  <p className="text-white/60 text-sm md:text-base">
                    {filtered.length} masterpiece{filtered.length !== 1 ? 's' : ''} • Curated with passion
                  </p>
                </motion.div>
                
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
                >
                  <AnimatePresence mode="popLayout">
                    {filtered.map((photo, i) => (
                      <PhotoCard
                        key={photo._id}
                        photo={photo}
                        index={i}
                        total={filtered.length}
                        themeColor={themeColor}
                        delay={i % 12} // Para evitar demasiadas animaciones simultáneas
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
                
                {/* Contador de fotos */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-12 md:mt-16 pt-8 border-t border-white/10"
                >
                  <p className="text-white/40 text-sm">
                    Showing <span className="font-bold text-white">{filtered.length}</span> of{" "}
                    <span className="font-bold text-white">{photos.length}</span> total photographs
                  </p>
                </motion.div>
              </>
            )}
          </div>
        </section>
        
        {/* Footer futurista */}
        <footer className="relative border-t border-white/10 py-8 md:py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4" style={{ color: themeColor }}>
                  Keep Exploring
                </h3>
                <p className="text-white/60 max-w-md text-sm md:text-base">
                  Every journey tells a story. Every photo captures a moment. 
                  The world is waiting for your perspective.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <motion.button 
                  className="px-5 md:px-6 py-2.5 md:py-3 rounded-lg border border-white/20 hover:border-white/40 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xs md:text-sm uppercase tracking-widest">📸 Instagram</span>
                </motion.button>
                <motion.button 
                  className="px-5 md:px-6 py-2.5 md:py-3 rounded-lg transition-all"
                  style={{ 
                    background: themeColor,
                    boxShadow: `0 0 30px ${themeColor}40`
                  }}
                  whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${themeColor}60` }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xs md:text-sm uppercase tracking-widest font-bold text-black">🎯 Book Adventure</span>
                </motion.button>
              </div>
            </div>
            
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/10 text-center text-white/40 text-xs md:text-sm">
              <p>© {new Date().getFullYear()} Dani Flamingo Visuals • Made with passion across continents</p>
              <p className="mt-1 md:mt-2 text-xs opacity-60">Interactive 3D Globe powered by Three.js • Real-time data visualization</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
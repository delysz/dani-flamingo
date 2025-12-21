"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { client } from '@/lib/sanity'
import { COUNTRY_COORDS } from '@/lib/countries'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { 
  Globe2, MapPin, Pause, Play, RotateCcw, 
  Instagram, Mail, ShoppingBag, ArrowRight,
  Zap, Sparkles, Camera, Navigation
} from 'lucide-react'

// Importación dinámica del globo
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-8 h-8 border-2 border-dashed border-white/20 rounded-full" />
        <div className="absolute inset-0 w-8 h-8 border-t-2 border-[#ff0099] rounded-full" />
      </motion.div>
    </div>
  )
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

// --- PALETA DE COLORES MEJORADA ---
const getThemeColor = (cat: string): { main: string; light: string; dark: string; glow: string } => {
  const colors = {
    "Sofia": { main: "#ff0099", light: "#ff66cc", dark: "#cc0077", glow: "#ff0099" },
    "Sofia's Artwork": { main: "#ff0099", light: "#ff66cc", dark: "#cc0077", glow: "#ff0099" },
    "Beach": { main: "#00f2ff", light: "#66f7ff", dark: "#00c2cc", glow: "#00f2ff" },
    "Street": { main: "#ff4d00", light: "#ff8040", dark: "#cc3e00", glow: "#ff4d00" },
    "Plants": { main: "#00ff41", light: "#66ff80", dark: "#00cc34", glow: "#00ff41" },
    "People": { main: "#bd00ff", light: "#d366ff", dark: "#9400cc", glow: "#bd00ff" },
    "Animals": { main: "#ffc400", light: "#ffd966", dark: "#cc9d00", glow: "#ffc400" },
    "Food": { main: "#ff0040", light: "#ff6699", dark: "#cc0033", glow: "#ff0040" },
    "Abstract": { main: "#ffffff", light: "#ffffff", dark: "#cccccc", glow: "#ffffff" },
    "All": { main: "#00f2ff", light: "#66f7ff", dark: "#00c2cc", glow: "#00f2ff" }
  };
  return colors[cat as keyof typeof colors] || colors.All;
};

// --- CONTADOR FÍSICO MEJORADO ---
const PhysicsCounter = ({ n, label, color }: { n: number, label: string, color: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  
  useEffect(() => {
    const controls = animate(count, n, { 
      duration: 2.5, 
      ease: "circOut",
      onComplete: () => {
        // Efecto sutil al completar
        if (n > 10) {
          // Podríamos agregar un efecto de partículas aquí
        }
      }
    });
    return controls.stop;
  }, [n, count]);

  return (
    <div className="text-center">
      <motion.div 
        className="text-4xl md:text-5xl font-bold mb-2 relative"
        style={{ color }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.span>{rounded}</motion.span>+
        <motion.div 
          className="absolute -inset-4 rounded-full opacity-0 hover:opacity-20 transition-opacity"
          style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
        />
      </motion.div>
      <div className="text-xs uppercase tracking-widest text-white/60">{label}</div>
    </div>
  );
};

// --- MARCO ESPECTACULAR ---
const AnimatedFrame = ({ color }: { color: string }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Marco exterior con efecto de neón */}
      <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
        {/* Esquina superior izquierda - Diseño angular */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-transparent to-white/30" />
          <div className="absolute top-0 left-0 w-1 h-24 bg-gradient-to-b from-transparent to-white/30" />
          
          {/* Decoración angular */}
          <motion.div 
            className="absolute top-6 left-6 w-12 h-12"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full border border-dashed border-white/10 rounded-full" />
          </motion.div>
          
          {/* Punto brillante */}
          <motion.div 
            className="absolute top-8 left-8 w-2 h-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        {/* Esquina superior derecha */}
        <div className="absolute top-0 right-0 w-32 h-32">
          <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-l from-transparent to-white/30" />
          <div className="absolute top-0 right-0 w-1 h-24 bg-gradient-to-b from-transparent to-white/30" />
          
          <motion.div 
            className="absolute top-6 right-6 w-12 h-12"
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full border border-dashed border-white/10 rounded-full" />
          </motion.div>
          
          <motion.div 
            className="absolute top-8 right-8 w-2 h-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>
        
        {/* Esquina inferior izquierda */}
        <div className="absolute bottom-0 left-0 w-32 h-32">
          <div className="absolute bottom-0 left-0 w-24 h-1 bg-gradient-to-r from-transparent to-white/30" />
          <div className="absolute bottom-0 left-0 w-1 h-24 bg-gradient-to-t from-transparent to-white/30" />
          
          <motion.div 
            className="absolute bottom-6 left-6 w-12 h-12"
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full border border-dotted border-white/5 rounded-full" />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-8 left-8 w-2 h-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </div>
        
        {/* Esquina inferior derecha */}
        <div className="absolute bottom-0 right-0 w-32 h-32">
          <div className="absolute bottom-0 right-0 w-24 h-1 bg-gradient-to-l from-transparent to-white/30" />
          <div className="absolute bottom-0 right-0 w-1 h-24 bg-gradient-to-t from-transparent to-white/30" />
          
          <motion.div 
            className="absolute bottom-6 right-6 w-12 h-12"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full border border-dotted border-white/5 rounded-full" />
          </motion.div>
          
          <motion.div 
            className="absolute bottom-8 right-8 w-2 h-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
          />
        </div>
        
        {/* Líneas horizontales con efecto de escaneo */}
        <motion.div 
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"
          style={{ top: `${mousePosition.y}%` }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Líneas verticales con efecto de escaneo */}
        <motion.div 
          className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"
          style={{ left: `${mousePosition.x}%` }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        
        {/* Partículas flotantes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full bg-white/20"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i * 8)}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
      
      {/* Efecto de brillo en las esquinas */}
      <div className="fixed inset-0 z-30 pointer-events-none">
        <div 
          className="absolute top-0 left-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${color}, transparent 50%)` }}
        />
        <div 
          className="absolute top-0 right-0 w-64 h-64 translate-x-1/2 -translate-y-1/2 opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${color}, transparent 50%)` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-64 h-64 -translate-x-1/2 translate-y-1/2 opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${color}, transparent 50%)` }}
        />
        <div 
          className="absolute bottom-0 right-0 w-64 h-64 translate-x-1/2 translatey-1/2 opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${color}, transparent 50%)` }}
        />
      </div>
    </>
  );
};

// --- PHOTO CARD 3D MEJORADA ---
const PhotoCard3D = ({ photo, index, themeColor, delay }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6, delay: delay * 0.05, type: "spring", stiffness: 100 }}
      className="relative group cursor-pointer perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Efecto de neón alrededor */}
      <motion.div 
        className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
        style={{ background: themeColor.main }}
        animate={isHovered ? { 
          scale: [1, 1.02, 1],
          opacity: [0, 0.3, 0]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Contenedor principal con efecto 3D */}
      <div className="relative bg-gradient-to-br from-black/80 to-gray-900/80 rounded-xl overflow-hidden border transition-all duration-500 group-hover:scale-[1.02]"
           style={{ 
             borderColor: isHovered ? themeColor.main : 'rgba(255,255,255,0.1)',
             transform: isHovered ? 'translateZ(20px)' : 'translateZ(0)',
             boxShadow: isHovered ? 
               `0 20px 40px ${themeColor.main}30, inset 0 1px 0 ${themeColor.main}20` : 
               '0 4px 20px rgba(0,0,0,0.5)'
           }}>
        
        {/* Imagen con efecto de parallax */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.div 
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
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
          
          {/* Overlay de gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
          
          {/* Efecto de luz */}
          <motion.div 
            className="absolute inset-0 opacity-0 group-hover:opacity-30"
            style={{ 
              background: `linear-gradient(45deg, transparent 30%, ${themeColor.main} 50%, transparent 70%)` 
            }}
            animate={isHovered ? { x: ['0%', '200%'] } : {}}
            transition={isHovered ? { duration: 1.5, repeat: Infinity } : {}}
          />
          
          {/* Badge de categoría */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 text-[10px] uppercase tracking-widest rounded-full font-bold backdrop-blur-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColor.main}20, ${themeColor.main}40)`, 
                    color: themeColor.main, 
                    border: `1px solid ${themeColor.main}60`,
                    boxShadow: `0 0 20px ${themeColor.main}30`
                  }}>
              {photo.category}
            </span>
          </div>
          
          {/* Contador */}
          <div className="absolute top-4 right-4">
            <span className="text-sm font-mono px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md"
                  style={{ color: themeColor.main }}>
              #{String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-6">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60 mb-3">
            <MapPin className="w-3 h-3" style={{ color: themeColor.main }} />
            <span>{photo.country || "WORLDWIDE"}</span>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:tracking-wide transition-all duration-300">
            {photo.title}
          </h3>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <motion.div 
                className="w-2 h-2 rounded-full"
                style={{ background: themeColor.main }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  boxShadow: [`0 0 5px ${themeColor.main}`, `0 0 15px ${themeColor.main}`, `0 0 5px ${themeColor.main}`]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs uppercase tracking-widest text-white/60">Hover to explore</span>
            </div>
            
            <motion.div 
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: themeColor.main }}
              whileHover={{ scale: 1.2, rotate: 90 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ArrowRight className="w-4 h-4 text-black" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- GLOBO 3D MEJORADO ---
const GlobeSection = ({ color, photos }: { color: any, photos: Photo[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const [isRotating, setIsRotating] = useState(true);
  const [globeLoaded, setGlobeLoaded] = useState(false);

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

  const locationsData = useMemo(() => {
    const uniqueCountries = Array.from(new Set(photos.map(p => p.country).filter(Boolean)));
    return uniqueCountries.reduce((acc: any[], countryName) => {
      const coords = COUNTRY_COORDS[countryName as string];
      if (coords) {
        acc.push({
          lat: coords.lat,
          lng: coords.lng,
          label: countryName,
          color: color.main,
          size: 0.5,
          photos: photos.filter(p => p.country === countryName).length
        });
      }
      return acc;
    }, []);
  }, [photos, color]);

  const arcsData = useMemo(() => 
    Array.from({ length: 20 }, () => ({
      startLat: (Math.random() - 0.5) * 160,
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 160,
      endLng: (Math.random() - 0.5) * 360,
      color: [color.main, 'rgba(255,255,255,0)']
    })), [color]
  );

  useEffect(() => {
    if (globeRef.current && globeLoaded) {
      globeRef.current.controls().autoRotate = isRotating;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
    }
  }, [isRotating, globeLoaded]);

  return (
    <section className="w-full mb-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado de la sección */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Globe2 className="w-8 h-8" style={{ color: color.main }} />
            <span>Global Visual Journey</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Interactive 3D visualization showing the geographical distribution of photographic work
          </p>
        </motion.div>

        {/* Contenedor del globo */}
        <div ref={containerRef} className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-black/50 to-gray-900/30">
          
          {/* Efectos de fondo */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50" />
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-[1px] h-[1px] rounded-full bg-white/10"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, Math.random() * 50 - 25],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>

          {/* Controles */}
          <div className="absolute top-6 right-6 z-10 flex gap-2">
            <motion.button
              onClick={() => setIsRotating(!isRotating)}
              className="px-4 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-sm flex items-center gap-2"
              style={{ color: color.main }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRotating ? 'Pause' : 'Play'}
            </motion.button>
            <motion.button
              onClick={() => globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000)}
              className="px-4 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-sm flex items-center gap-2"
              style={{ color: color.main }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </motion.button>
          </div>

          {/* Globo */}
          {dimensions.width > 1 && (
            <Globe
              ref={globeRef}
              width={dimensions.width}
              height={dimensions.height}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              
              pointsData={locationsData}
              pointColor="color"
              pointAltitude={0.1}
              pointRadius={0.8}
              
              labelsData={locationsData}
              labelLat="lat"
              labelLng="lng"
              labelText={(d: any) => `${d.label} (${d.photos} photos)`}
              labelSize={1.2}
              labelColor={() => "rgba(255,255,255,0.8)"}
              labelDotRadius={0.4}
              labelAltitude={0.1}
              
              ringsData={locationsData}
              ringColor={() => color.main}
              ringMaxRadius={2.5}
              ringPropagationSpeed={1.5}
              ringRepeatPeriod={2000}
              
              arcsData={arcsData}
              arcColor="color"
              arcDashLength={0.3}
              arcDashGap={1.5}
              arcDashAnimateTime={3000}
              arcStroke={0.4}
              
              atmosphereColor={color.main}
              atmosphereAltitude={0.2}
              
              onGlobeReady={() => setGlobeLoaded(true)}
            />
          )}

          {/* Información inferior */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-md">
              <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: color.main }} />
                Visual Coverage
              </h4>
              <p className="text-xs text-white/60">
                {locationsData.length} countries documented with {photos.length} photographs
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="text-center px-4 py-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10">
                <div className="text-lg font-bold" style={{ color: color.main }}>
                  {locationsData.length}
                </div>
                <div className="text-xs text-white/60">Countries</div>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10">
                <div className="text-lg font-bold" style={{ color: color.main }}>
                  {photos.length}
                </div>
                <div className="text-xs text-white/60">Photos</div>
              </div>
            </div>
          </div>
        </div>
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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => 
    activeCat === "All" ? photos : photos.filter(p => p.category === activeCat), 
    [activeCat, photos]
  );
  
  const themeColor = useMemo(() => getThemeColor(activeCat), [activeCat]);
  const handleSelectCategory = useCallback((cat: string) => {
    setActiveCat(cat);
    // Scroll suave a la galería
    setTimeout(() => {
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Marco animado */}
      <AnimatedFrame color={themeColor.main} />
      
      {/* Barra de progreso */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 z-50 origin-left bg-gradient-to-r from-[#ff0099] via-[#00f2ff] to-[#ff0099]"
        style={{ scaleX: scrollProgress / 100 }}
      />
      
      {/* Fondo con efectos */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/10 to-black" />
        <div className="absolute inset-0 opacity-5"
             style={{ 
               backgroundImage: `radial-gradient(circle at 20% 30%, ${themeColor.main} 0%, transparent 40%),
                                radial-gradient(circle at 80% 70%, ${themeColor.main} 0%, transparent 40%)`
             }} />
        
        {/* Patrón sutil */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" style={{ color: themeColor.main }} />
        </svg>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Hero Section */}
        <header className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 relative">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center mb-16"
            >
              <div className="flex items-center justify-center gap-4 md:gap-12 mb-12">
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  className="relative w-32 h-32 md:w-48 md:h-48"
                >
                  <Image 
                    src="/flamin.png" 
                    alt="Flamingo" 
                    fill 
                    className="object-contain"
                    style={{ 
                      filter: `drop-shadow(0 0 40px ${themeColor.main})`,
                      animation: 'float 6s ease-in-out infinite'
                    }}
                  />
                </motion.div>
                
                <div className="text-center">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                      DANI
                    </span>
                    <br />
                    <motion.span 
                      className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0099] via-[#00f2ff] to-[#ff0099]"
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{ 
                        backgroundSize: '200% 100%',
                        display: 'inline-block'
                      }}
                    >
                      FLAMINGO
                    </motion.span>
                  </h1>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-sm md:text-lg tracking-[0.3em] uppercase text-white/60 mb-8"
                  >
                    VISUAL EXPLORER • GLOBAL ARTIST
                  </motion.p>
                </div>
                
                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  className="relative w-32 h-32 md:w-48 md:h-48"
                >
                  <Image 
                    src="/flamin-reverse.png" 
                    alt="Flamingo" 
                    fill 
                    className="object-contain"
                    style={{ 
                      filter: `drop-shadow(0 0 40px ${themeColor.main})`,
                      animation: 'float 6s ease-in-out infinite 0.5s'
                    }}
                  />
                </motion.div>
              </div>
              
              {/* Estadísticas */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12"
              >
                <PhysicsCounter n={78} label="COUNTRIES" color={themeColor.main} />
                <PhysicsCounter n={1240} label="PHOTOS" color={themeColor.main} />
                <PhysicsCounter n={24} label="CONTINENTS" color={themeColor.main} />
                <PhysicsCounter n={7} label="YEARS" color={themeColor.main} />
              </motion.div>
              
              {/* Scroll indicator */}
              <motion.div 
                animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-xs uppercase tracking-widest text-white/40">Scroll to explore</span>
                <ArrowRight className="w-5 h-5 rotate-90 text-white/40" />
              </motion.div>
            </motion.div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="sticky top-0 z-40 py-6 bg-black/80 backdrop-blur-xl border-b border-white/10 mb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {CATEGORIES.map((cat) => {
                const isActive = activeCat === cat;
                const catColor = getThemeColor(cat);
                
                return (
                  <motion.button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className="relative px-4 py-2.5 rounded-lg overflow-hidden transition-all duration-300 group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: isActive 
                        ? `linear-gradient(135deg, ${catColor.main}20, ${catColor.main}40)` 
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isActive ? catColor.main : 'rgba(255,255,255,0.1)'}`,
                      color: isActive ? catColor.main : '#888',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0"
                        style={{ 
                          background: `radial-gradient(circle at center, ${catColor.main}20, transparent 70%)` 
                        }}
                        layoutId="activeBg"
                      />
                    )}
                    
                    <span className="relative z-10 text-sm font-medium tracking-wider uppercase">
                      {cat}
                    </span>
                    
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 w-8 h-1 rounded-full"
                        style={{ background: catColor.main }}
                        layoutId="activeLine"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Gallery Section */}
        <section id="gallery" className="px-4 md:px-8 mb-32">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <motion.div
                  className="w-16 h-16 rounded-full border-4 border-t-transparent"
                  style={{ borderColor: themeColor.main }}
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
                className="text-center py-32 rounded-2xl border border-dashed border-white/10"
              >
                <h3 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: themeColor.main }}>
                  No Visuals in This Dimension
                </h3>
                <p className="text-white/60 mb-8 max-w-md mx-auto">
                  The {activeCat.toLowerCase()} universe awaits exploration. 
                  Discover other categories to reveal photographic masterpieces.
                </p>
                <motion.button
                  onClick={() => handleSelectCategory("All")}
                  className="px-8 py-4 rounded-xl uppercase tracking-widest font-bold transition-all"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColor.main}, ${themeColor.light})`,
                    boxShadow: `0 0 40px ${themeColor.main}40`
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: `0 0 60px ${themeColor.main}60`
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore All Dimensions
                </motion.button>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: themeColor.main }}>
                    {activeCat === "All" ? "Visual Universe" : activeCat}
                  </h2>
                  <p className="text-white/60">
                    {filtered.length} masterpiece{filtered.length !== 1 ? 's' : ''} • Curated Collection
                  </p>
                </motion.div>
                
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <AnimatePresence mode="popLayout">
                    {filtered.map((photo, i) => (
                      <PhotoCard3D
                        key={photo._id}
                        photo={photo}
                        index={i}
                        themeColor={themeColor}
                        delay={i}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
                
                {/* Gallery Info */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-12 pt-8 border-t border-white/10"
                >
                  <p className="text-white/40 text-sm">
                    Showing <span className="font-bold text-white">{filtered.length}</span> of{" "}
                    <span className="font-bold text-white">{photos.length}</span> visual masterpieces
                  </p>
                </motion.div>
              </>
            )}
          </div>
        </section>

        {/* Globe Section */}
        <GlobeSection color={themeColor} photos={photos} />

        {/* Footer */}
        <footer className="border-t border-white/10 pt-12 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: themeColor.main }}>
                  Continue the Journey
                </h3>
                <p className="text-white/60 max-w-md">
                  Every photograph tells a story. Every location holds a memory. 
                  The visual journey continues across continents.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button 
                  className="px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm uppercase tracking-widest">Instagram</span>
                </motion.button>
                <motion.button 
                  className="px-6 py-3 rounded-lg transition-all flex items-center gap-2"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColor.main}, ${themeColor.light})`,
                    boxShadow: `0 0 30px ${themeColor.main}40`
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: `0 0 40px ${themeColor.main}60` 
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm uppercase tracking-widest font-bold text-black">View Portfolio</span>
                </motion.button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pt-8 border-t border-white/10">
              <div className="text-center md:text-left">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Collaborate
                </h4>
                <p className="text-white/60 text-sm">Work with Dani Flamingo on visual projects worldwide.</p>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Exhibitions
                </h4>
                <p className="text-white/60 text-sm">Current and upcoming gallery exhibitions.</p>
              </div>
              <div className="text-center md:text-right">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Newsletter
                </h4>
                <p className="text-white/60 text-sm">Join for exclusive content and early access.</p>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center pt-8 border-t border-white/10 text-white/40 text-sm">
              <p>© {new Date().getFullYear()} Dani Flamingo Visuals • Created with passion across continents</p>
              <p className="mt-2 text-xs opacity-60">
                Interactive 3D Globe powered by Three.js • Real-time visualizations • Dynamic effects
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #ff0099, #00f2ff);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #ff66cc, #66f7ff);
        }
        
        /* Selection color */
        ::selection {
          background: rgba(255, 0, 153, 0.3);
          color: white;
        }
        
        ::-moz-selection {
          background: rgba(255, 0, 153, 0.3);
          color: white;
        }
      `}</style>
    </main>
  );
}
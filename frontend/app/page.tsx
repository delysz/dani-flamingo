"use client";

import React, { 
  useState, 
  useEffect, 
  useMemo, 
  useRef, 
  ReactNode 
} from 'react';

import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useTransform, 
  animate, 
  useSpring, 
  MotionConfig, 
  useScroll
} from 'framer-motion';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { client } from '@/lib/sanity';

// Iconography
import { 
  Globe2, MapPin, Pause, Play, RotateCcw, 
  Camera, ShoppingBag, ArrowRight, X, 
  Search, Filter, Clock, Eye, Sparkles
} from 'lucide-react';

// -----------------------------------------------------------------------------
// 2. TYPESCRIPT INTERFACES
// -----------------------------------------------------------------------------

type Category = 
  | "All" | "Beach" | "Street" | "Plants" | "People" 
  | "Animals" | "Food" | "Abstract" | "Sofia" | "Sofia's Artwork";

interface Coordinates {
  lat: number;
  lng: number;
}

interface Photo {
  _id: string;
  title: string;
  slug?: { current: string };
  country?: string;
  city?: string;
  imageUrl: string;
  category: Category;
  description?: string;
  year?: number;
  featured?: boolean;
  exif?: {
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
  };
}

interface ThemeColor {
  main: string;
  secondary: string;
  gradient: string;
  glow: string;
  text: string;
}

interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
  size: number;
  color: string;
  photoCount: number;
  altitude: number;
}

/**
 * Dynamic import for the Globe component.
 */
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] text-white">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-t-2 border-[#ff0099] rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-2 border-[#00f2ff] rounded-full animate-spin-reverse"></div>
        <div className="absolute inset-4 border-b-2 border-[#00ff41] rounded-full animate-pulse"></div>
      </div>
      <span className="mt-4 text-[10px] tracking-[0.5em] uppercase opacity-50 animate-pulse font-mono">
        Loading World...
      </span>
    </div>
  )
});

// -----------------------------------------------------------------------------
// 3. CONSTANTS & CONFIGURATION
// -----------------------------------------------------------------------------

const APP_CONFIG = {
  title: "DANI FLAMINGO",
  subtitle: "Visual Director & Global Nomad",
  contactEmail: "hello@daniflamingo.com",
  anim: {
    stiffness: 200,
    damping: 20,
    mass: 0.5
  }
};

const CATEGORIES: Category[] = [
  "All", "Beach", "Street", "Plants", "People", 
  "Animals", "Food", "Abstract", "Sofia", "Sofia's Artwork"
];

const COUNTRY_COORDS: Record<string, Coordinates> = {
  "USA": { lat: 37.09, lng: -95.71 },
  "United States": { lat: 37.09, lng: -95.71 },
  "Canada": { lat: 56.13, lng: -106.34 },
  "Mexico": { lat: 23.63, lng: -102.55 },
  "Brazil": { lat: -14.23, lng: -51.92 },
  "Argentina": { lat: -38.41, lng: -63.61 },
  "Peru": { lat: -9.19, lng: -75.01 },
  "Chile": { lat: -35.67, lng: -71.54 },
  "Colombia": { lat: 4.57, lng: -74.29 },
  "Spain": { lat: 40.46, lng: -3.74 },
  "France": { lat: 46.22, lng: 2.21 },
  "Germany": { lat: 51.16, lng: 10.45 },
  "Italy": { lat: 41.87, lng: 12.56 },
  "UK": { lat: 55.37, lng: -3.43 },
  "United Kingdom": { lat: 55.37, lng: -3.43 },
  "Portugal": { lat: 39.39, lng: -8.22 },
  "Greece": { lat: 39.07, lng: 21.82 },
  "Iceland": { lat: 64.96, lng: -19.02 },
  "Norway": { lat: 60.47, lng: 8.46 },
  "Sweden": { lat: 60.12, lng: 18.64 },
  "Japan": { lat: 36.20, lng: 138.25 },
  "China": { lat: 35.86, lng: 104.19 },
  "India": { lat: 20.59, lng: 78.96 },
  "Indonesia": { lat: -0.78, lng: 113.92 },
  "Thailand": { lat: 15.87, lng: 100.99 },
  "Vietnam": { lat: 14.05, lng: 108.27 },
  "South Korea": { lat: 35.90, lng: 127.76 },
  "Morocco": { lat: 31.79, lng: -7.09 },
  "South Africa": { lat: -30.55, lng: 22.93 },
  "Egypt": { lat: 26.82, lng: 30.80 },
  "Kenya": { lat: -0.02, lng: 37.90 },
  "Australia": { lat: -25.27, lng: 133.77 },
  "New Zealand": { lat: -40.90, lng: 174.88 }
};

// -----------------------------------------------------------------------------
// 4. UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

const getThemeColor = (cat: string): ThemeColor => {
  const colors: Record<string, string> = {
    "Sofia's Artwork": "#ff0099",
    "Sofia": "#ff66cc",
    "Beach": "#00f2ff",
    "Street": "#ff4d00",
    "Plants": "#00ff41",
    "People": "#bd00ff",
    "Animals": "#ffc400",
    "Food": "#ff6b35",
    "Abstract": "#ffffff",
    "All": "#00f2ff"
  };
  
  const main = colors[cat] || colors.All;
  
  return { 
    main, 
    secondary: `${main}40`,
    gradient: `linear-gradient(135deg, ${main}, transparent)`,
    glow: `0 0 30px ${main}40`,
    text: main === "#ffffff" ? "#000000" : "#ffffff"
  };
};

const generateDummyData = (count: number): Photo[] => {
  const countries = Object.keys(COUNTRY_COORDS);
  const categoriesWithoutAll = CATEGORIES.filter(cat => cat !== "All");
  
  return Array.from({ length: count }).map((_, i) => ({
    _id: `mock-${i}-${Date.now()}`,
    title: `Visual Study No. ${100 + i}`,
    category: categoriesWithoutAll[Math.floor(Math.random() * categoriesWithoutAll.length)],
    imageUrl: `https://picsum.photos/seed/${i * 123 + 55}/800/1000`,
    country: countries[Math.floor(Math.random() * countries.length)],
    year: 2019 + Math.floor(Math.random() * 5),
    description: "A moment captured in time, exploring the interplay of light, shadow, and human emotion. This piece represents a journey through both physical space and artistic expression.",
    featured: Math.random() > 0.7,
    exif: {
      camera: "Sony A7R IV",
      lens: "35mm f/1.4 GM",
      iso: 100,
      aperture: "f/2.8"
    }
  }));
};

// -----------------------------------------------------------------------------
// 5. CUSTOM HOOKS
// -----------------------------------------------------------------------------

const useWorldTime = (timezone: string) => {
  const [time, setTime] = useState("00:00");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { 
        timeZone: timezone, 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

  return mounted ? time : "--:--";
};

// -----------------------------------------------------------------------------
// 6. UI ATOMS
// -----------------------------------------------------------------------------

const Magnetic = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const position = { x: useMotionValue(0), y: useMotionValue(0) };

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    position.x.set(middleX * 0.2);
    position.y.set(middleY * 0.2);
  };

  const reset = () => {
    position.x.set(0);
    position.y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: position.x, y: position.y }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

const MagneticButton = ({ 
  children, 
  onClick, 
  active = false, 
  color 
}: { 
  children: ReactNode, 
  onClick?: () => void, 
  active?: boolean, 
  color: string 
}) => {
  return (
    <Magnetic>
      <button 
        onClick={onClick}
        className={`relative px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 font-mono overflow-hidden group whitespace-nowrap
          ${active ? 'text-black' : 'text-white/80 hover:text-white'}`}
        style={{ 
          border: `2px solid ${active ? color : 'rgba(255,255,255,0.2)'}`,
          background: active ? color : 'rgba(0,0,0,0.3)'
        }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at center, ${color}40 0%, transparent 70%)`
          }}
        />
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}40, transparent)`
          }}
        />
        {active && (
          <motion.div 
            layoutId="nav-pill" 
            className="absolute inset-0 rounded-full -z-10" 
            style={{ backgroundColor: color }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} 
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {children}
          {!active && (
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          )}
        </span>
      </button>
    </Magnetic>
  );
};

// -----------------------------------------------------------------------------
// 7. VISUAL COMPONENTS
// -----------------------------------------------------------------------------

const NoiseOverlay = () => (
  <div 
    className="fixed inset-0 z-[1] opacity-[0.035] pointer-events-none mix-blend-overlay" 
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
  />
);

const PhysicsCounter = ({ n, label, color }: { n: number, label: string, color: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, n, { duration: 3, ease: "circOut" });
    return controls.stop;
  }, [n, count]);

  return (
    <div className="text-center group cursor-default">
      <motion.div className="text-4xl md:text-6xl font-bold mb-1 tracking-tighter font-mono" style={{ color }}>
        <motion.span>{rounded}</motion.span>+
      </motion.div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 group-hover:text-white/80 transition-colors">
        {label}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 8. FEATURE COMPONENTS - TARJETAS CON MARCO NEON MEJORADO
// -----------------------------------------------------------------------------

const PhotoCardPro = ({ photo, themeColor, onClick, priority = false }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group perspective-1000"
      layoutId={`card-container-${photo._id}`}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* MARCO NEON MEJORADO */}
      <div className="absolute inset-0 rounded-xl z-30 pointer-events-none"
        style={{
          border: `3px solid ${themeColor.main}`,
          boxShadow: `
            inset 0 0 30px ${themeColor.main}40,
            0 0 30px ${themeColor.main}40,
            0 0 60px ${themeColor.main}20,
            inset 0 0 60px ${themeColor.main}20
          `,
          animation: 'pulse 3s infinite alternate'
        }}
      />
      
      <div className="absolute top-0 left-0 w-6 h-6 z-30">
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2" style={{borderColor: themeColor.main}} />
        <div className="absolute top-0.5 left-0.5 w-3 h-3 border-l border-t" style={{borderColor: themeColor.main, filter: `blur(1px)`}} />
      </div>
      <div className="absolute top-0 right-0 w-6 h-6 z-30">
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2" style={{borderColor: themeColor.main}} />
        <div className="absolute top-0.5 right-0.5 w-3 h-3 border-r border-t" style={{borderColor: themeColor.main, filter: `blur(1px)`}} />
      </div>
      <div className="absolute bottom-0 left-0 w-6 h-6 z-30">
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2" style={{borderColor: themeColor.main}} />
        <div className="absolute bottom-0.5 left-0.5 w-3 h-3 border-l border-b" style={{borderColor: themeColor.main, filter: `blur(1px)`}} />
      </div>
      <div className="absolute bottom-0 right-0 w-6 h-6 z-30">
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2" style={{borderColor: themeColor.main}} />
        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-r border-b" style={{borderColor: themeColor.main, filter: `blur(1px)`}} />
      </div>

      {/* Image Layer - PROTEGIDO CON ?.includes */}
      <motion.div className="absolute inset-0 z-0 m-1.5 rounded-lg overflow-hidden" layoutId={`image-${photo._id}`}>
         <Image 
           src={photo.imageUrl} 
           alt={photo.title || "Photo"} 
           fill 
           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
           className="object-cover transition-transform duration-700 group-hover:scale-110" 
           priority={priority}
           unoptimized={photo.imageUrl?.includes('picsum')} 
         />
      </motion.div>

      <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 holographic rounded-xl" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-20 opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
      
      <motion.div 
        className="absolute bottom-0 left-0 p-6 z-30 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest backdrop-blur-md rounded-full border flex items-center gap-1"
            style={{
              backgroundColor: `${themeColor.main}20`,
              borderColor: themeColor.main,
              color: themeColor.main,
              textShadow: `0 0 10px ${themeColor.main}`,
              boxShadow: `0 0 15px ${themeColor.main}40`
            }}
          >
            <Sparkles className="w-3 h-3" />
            {photo.category}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-white uppercase tracking-tight leading-none mb-2 font-mono">
          {photo.title}
        </h3>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/80 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
          <MapPin className="w-3 h-3 animate-pulse" style={{ color: themeColor.main }} /> 
          <span>{photo.country || "Unknown Location"}</span>
          <span className="text-white/40">|</span>
          <Clock className="w-3 h-3" style={{ color: themeColor.main }} />
          <span>{photo.year || "2024"}</span>
        </div>
      </motion.div>

      <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-[9px] font-mono uppercase tracking-wider border"
          style={{
            borderColor: themeColor.main,
            color: themeColor.main,
            boxShadow: `0 0 15px ${themeColor.main}40`
          }}
        >
          <Eye className="inline w-3 h-3 mr-1.5" /> VIEW
        </div>
      </div>
    </motion.div>
  );
};

const PhotoModalPro = ({ photo, onClose, themeColor }: any) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => { 
      document.body.style.overflow = 'unset'; 
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-2xl"
      onClick={onClose}
    >
      <motion.div 
        layoutId={`card-container-${photo._id}`}
        className="relative w-full max-w-7xl h-[85vh] bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 0 50px ${themeColor.main}20`
        }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-50 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all duration-300 border border-white/10 group"
          style={{
            borderColor: themeColor.main,
            boxShadow: `0 0 20px ${themeColor.main}40`
          }}
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"/>
        </button>

        <div className="relative w-full md:w-2/3 h-1/2 md:h-full bg-[#050505] overflow-hidden group">
           {/* PROTEGIDO CON ?.includes */}
           <motion.div className="absolute inset-0" layoutId={`image-${photo._id}`}>
             <Image 
               src={photo.imageUrl} 
               alt={photo.title || "Photo"} 
               fill 
               className="object-contain p-4 md:p-0" 
               priority 
               unoptimized={photo.imageUrl?.includes('picsum')} 
             />
           </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full md:w-1/3 p-8 md:p-12 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 bg-[#080808]"
          style={{
            borderColor: `${themeColor.main}20`
          }}
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-white/30" />
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Details</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-[0.9] font-mono" style={{color: themeColor.main}}>
              {photo.title}
            </h2>
            
            <p className="text-white/60 mb-8 leading-relaxed text-sm md:text-base font-light">
              {photo.description || "Every picture tells a story. This moment was captured to freeze time and emotion forever in a digital canvas."}
            </p>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5"
                style={{
                  borderColor: `${themeColor.main}20`,
                  boxShadow: `0 0 15px ${themeColor.main}10`
                }}
              >
                <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-1">Location</span>
                <div className="flex items-center gap-2 text-white/90 font-medium">
                  <MapPin className="w-3 h-3" style={{color: themeColor.main}} /> {photo.country || "Earth"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5"
                style={{
                  borderColor: `${themeColor.main}20`,
                  boxShadow: `0 0 15px ${themeColor.main}10`
                }}
              >
                <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-1">Date</span>
                <div className="text-white/90 font-medium">{photo.year || "2024"}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5"
                style={{
                  borderColor: `${themeColor.main}20`,
                  boxShadow: `0 0 15px ${themeColor.main}10`
                }}
              >
                <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-1">Category</span>
                <div className="text-white/90 font-medium">{photo.category}</div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5"
                style={{
                  borderColor: `${themeColor.main}20`,
                  boxShadow: `0 0 15px ${themeColor.main}10`
                }}
              >
                <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-1">Gear</span>
                <div className="text-white/90 font-medium flex items-center gap-2"><Camera className="w-3 h-3"/> Sony A7R</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
              <button className="flex-1 py-4 border rounded-lg text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all font-bold font-mono"
                style={{
                  borderColor: themeColor.main,
                  color: themeColor.main,
                  background: `${themeColor.main}10`,
                  boxShadow: `0 0 20px ${themeColor.main}20`
                }}
              >
                Download Hi-Res
              </button>
              <button className="flex-1 py-4 rounded-lg text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all font-bold font-mono flex items-center justify-center gap-2" 
                style={{ 
                  backgroundColor: `${themeColor.main}20`, 
                  color: themeColor.main,
                  border: `1px solid ${themeColor.main}40`,
                  boxShadow: `0 0 25px ${themeColor.main}30`
                }}
              >
                <ShoppingBag className="w-3 h-3" /> Acquire Print
              </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// 9. LAYOUT SECTIONS
// -----------------------------------------------------------------------------

const Header = ({ themeColor, scrollY }: { themeColor: ThemeColor, scrollY: any }) => {
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const text = "DANI FLAMINGO";
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="min-h-screen flex flex-col items-center justify-center relative px-4 overflow-hidden crt-effect grid-dots">
      
      {/* Fondo de líneas de circuitos */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-px bg-gradient-to-r from-transparent via-[#00f2ff] to-transparent"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-px bg-gradient-to-r from-transparent via-[#ff0099] to-transparent"></div>
        <div className="absolute bottom-1/3 left-1/3 w-48 h-px bg-gradient-to-r from-transparent via-[#00ff41] to-transparent"></div>
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/30" />
          <span className="text-xs uppercase tracking-[0.4em] text-white/60 font-mono neon-text" style={{color: themeColor.main}}>
            <span className="animate-pulse">⚡</span> Travel Photography <span className="animate-pulse">⚡</span>
          </span>
          <span className="w-12 h-[1px] bg-gradient-to-r from-white/30 to-transparent" />
        </div>
        
        {/* Contenedor del título con flamingos */}
        <div className="relative flex items-center justify-center">
          {/* Flamingo izquierdo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -left-24 md:-left-48"
          >
            <Image 
              src="/flamin.png" 
              alt="Flamingo" 
              width={100} 
              height={100} 
              className="w-16 md:w-24 filter drop-shadow-[0_0_15px_rgba(0,242,255,0.7)] hover:scale-110 transition-transform duration-300"
            />
          </motion.div>

          {/* Título */}
          <div className="flex justify-center gap-1 mb-4 flex-wrap relative">
            {text.split("").map((char, i) => (
              <motion.span 
                key={i} 
                initial={{opacity: 0, y: 20, scale: 0.5}} 
                animate={{
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  textShadow: [
                    `0 0 5px ${themeColor.main}`,
                    `0 0 20px ${themeColor.main}`,
                    `0 0 5px ${themeColor.main}`
                  ]
                }} 
                transition={{
                  delay: i * 0.05, 
                  duration: 0.5,
                  textShadow: {
                    repeat: Infinity,
                    duration: 2,
                    repeatType: "reverse"
                  }
                }}
                className={`text-6xl md:text-9xl font-black tracking-tighter inline-block font-mono
                  ${glitch ? 'animate-glitch' : ''}`}
                style={{ 
                  color: i > 4 ? themeColor.main : '#ffffff',
                  WebkitTextStroke: i > 4 ? `1px ${themeColor.main}` : '1px #fff',
                  filter: `drop-shadow(0 0 15px ${themeColor.main}60)`
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Flamingo derecho */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -right-24 md:-right-48"
          >
            <Image 
              src="/flamin-reverse.png" 
              alt="Flamingo" 
              width={100} 
              height={100} 
              className="w-16 md:w-24 filter drop-shadow-[0_0_15px_rgba(0,242,255,0.7)] hover:scale-110 transition-transform duration-300"
            />
          </motion.div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ 
            opacity: 1,
            textShadow: [
              `0 0 5px ${themeColor.main}`,
              `0 0 10px ${themeColor.main}`,
              `0 0 5px ${themeColor.main}`
            ]
          }}
          transition={{ 
            delay: 1,
            textShadow: {
              repeat: Infinity,
              duration: 3,
              repeatType: "reverse"
            }
          }}
          className="text-sm md:text-base font-light tracking-[0.3em] max-w-lg mx-auto mt-8 uppercase font-mono"
          style={{ color: themeColor.main }}
        >
          Photography, Travel & Observation
        </motion.p>

        {/* Tags flotantes */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {['50+ Countries', '10+ Years', 'Digital & Film', 'Exhibitions'].map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              className="px-3 py-1 text-xs font-mono uppercase tracking-wider border rounded-full bg-black/50 backdrop-blur-sm"
              style={{
                borderColor: `${themeColor.main}40`,
                color: themeColor.main,
                boxShadow: `0 0 15px ${themeColor.main}30`
              }}
            >
              <Sparkles className="inline w-3 h-3 mr-1" /> {tech}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Elementos decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Círculos concéntricos */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: 360,
            opacity: [0.1, 0.3, 0.1]
          }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border"
          style={{
            borderColor: `${themeColor.main}30`,
            boxShadow: `0 0 50px ${themeColor.main}20`
          }}
        />
        
        {/* Puntos de conexión */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${50 + 40 * Math.cos((i / 8) * Math.PI * 2)}%`,
              top: `${50 + 40 * Math.sin((i / 8) * Math.PI * 2)}%`,
              backgroundColor: themeColor.main,
              boxShadow: `0 0 20px ${themeColor.main}`
            }}
          />
        ))}
      </div>

      {/* Scroll indicator mejorado */}
      <motion.div 
        animate={{ y: [0, 10, 0] }} 
        transition={{ duration: 2, repeat: Infinity }} 
        className="absolute bottom-12"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-[#00f2ff] to-transparent"></div>
          <span className="text-xs font-mono uppercase tracking-widest text-white/50 animate-pulse">
            EXPLORE
          </span>
        </div>
      </motion.div>
    </header>
  );
};

const GlobeSection = ({ color, photos }: { color: ThemeColor, photos: Photo[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [width, setWidth] = useState(1000);
  const [isRotating, setIsRotating] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if(entry.contentRect.width > 0) setWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 1 CHINCHETA POR PAÍS - Contamos cuántas fotos tiene cada país
  const countryPhotoCount = useMemo(() => {
    const counts: Record<string, number> = {};
    photos.forEach(photo => {
      if (photo.country) {
        counts[photo.country] = (counts[photo.country] || 0) + 1;
      }
    });
    return counts;
  }, [photos]);

  const pointsData = useMemo(() => {
    const uniqueCountries = Array.from(new Set(photos.map(p => p.country).filter(Boolean)));
    
    return uniqueCountries.reduce((acc: GlobePoint[], country) => {
      const coords = COUNTRY_COORDS[country as string];
      if (coords) {
        const count = countryPhotoCount[country as string] || 1;
        const size = Math.min(0.3 + (count * 0.05), 1.0); // Tamaño basado en cantidad de fotos
        
        acc.push({ 
          lat: coords.lat, 
          lng: coords.lng, 
          label: `${country} (${count} ${count === 1 ? 'photo' : 'photos'})`, 
          color: color.main, 
          size: size,
          photoCount: count,
          altitude: 0.05 + (count * 0.01)
        });
      }
      return acc;
    }, []);
  }, [photos, color, countryPhotoCount]);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = isRotating;
      globeRef.current.controls().autoRotateSpeed = 0.6;
      globeRef.current.controls().enableZoom = false; 
    }
  }, [isRotating]);

  return (
    <section className="w-full max-w-[1400px] mx-auto mb-32 relative px-4">
      <div className="flex items-center gap-6 mb-12">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
        <h2 className="text-3xl font-bold uppercase tracking-widest flex items-center gap-3 font-mono">
           <Globe2 className="w-6 h-6" style={{ color: color.main }} /> Global Coverage
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
      </div>
      
      <div ref={containerRef} className="relative w-full h-[600px] rounded-[2rem] overflow-hidden border border-white/10 bg-[#080808] shadow-2xl group"
        style={{
          boxShadow: `0 0 40px ${color.main}20`
        }}
      >
         
         {/* UI Controls Overlay */}
         <div className="absolute top-8 right-8 z-10 flex flex-col gap-3">
            <button onClick={() => setIsRotating(!isRotating)} className="p-3 bg-black/40 backdrop-blur-md border rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all"
              style={{
                borderColor: `${color.main}40`,
                boxShadow: `0 0 15px ${color.main}30`
              }}
            >
              {isRotating ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
            </button>
            <button onClick={() => globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 1500)} className="p-3 bg-black/40 backdrop-blur-md border rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all"
              style={{
                borderColor: `${color.main}40`,
                boxShadow: `0 0 15px ${color.main}30`
              }}
            >
              <RotateCcw className="w-5 h-5"/>
            </button>
         </div>

         {/* Stats Overlay */}
         <div className="absolute bottom-8 left-8 z-10 p-6 bg-black/40 backdrop-blur-md rounded-2xl border max-w-xs pointer-events-none select-none"
           style={{
             borderColor: `${color.main}20`,
             boxShadow: `0 0 30px ${color.main}20`
           }}
         >
            <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2 font-mono">Active Regions</h4>
            <div className="text-2xl font-bold text-white mb-1 font-mono" style={{ color: color.main }}>{pointsData.length} Countries</div>
            <div className="text-xs text-white/70">{photos.length} visual captures across the globe</div>
         </div>
         
         <Globe
           ref={globeRef} 
           width={width} 
           height={600}
           globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
           backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
           pointsData={pointsData} 
           pointColor="color" 
           pointAltitude="altitude" 
           pointRadius="size"
           onPointHover={({ label }: any) => setHoveredCountry(label)}
           ringsData={pointsData} 
           ringColor={() => color.main} 
           ringMaxRadius={2} 
           ringPropagationSpeed={2} 
           ringRepeatPeriod={1000}
           atmosphereColor={color.main} 
           atmosphereAltitude={0.15}
           backgroundColor="rgba(0,0,0,0)"
         />
         
         {/* Tooltip para países */}
         {hoveredCountry && (
           <div className="absolute top-24 left-8 z-10 p-4 bg-black/60 backdrop-blur-md rounded-lg border max-w-xs pointer-events-none"
             style={{
               borderColor: color.main,
               boxShadow: `0 0 20px ${color.main}40`
             }}
           >
             <div className="text-xs text-white/70">{hoveredCountry}</div>
           </div>
         )}
         
         <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
      </div>
    </section>
  );
};

const Footer = ({ themeColor }: { themeColor: ThemeColor }) => {
  return (
    <footer className="pt-8 pb-4 bg-[#050505] relative z-10">
      <div className="max-w-[1400px] mx-auto px-4">
        
        {/* Línea decorativa con efecto neon */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"
          style={{
            boxShadow: `0 0 10px ${themeColor.main}30`
          }}
        />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Nombre de Dani */}
          <div className="text-center md:text-left">
            <p className="text-white/60 text-sm font-mono">
              Dani Flamingo • Visual Artist
            </p>
          </div>
          
          {/* Enlaces sociales */}
          <div className="flex gap-4">
            <a 
              href="https://instagram.com" 
              className="text-white/40 hover:text-white/80 transition-colors text-sm"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textShadow: `0 0 10px ${themeColor.main}`
              }}
            >
              Instagram
            </a>
            <a 
              href="mailto:hello@daniflamingo.com" 
              className="text-white/40 hover:text-white/80 transition-colors text-sm"
              style={{
                textShadow: `0 0 10px ${themeColor.main}`
              }}
            >
              Contact
            </a>
          </div>
          
          {/* Tu crédito de GitHub */}
          <div className="text-center md:text-right">
            <p className="text-white/30 text-xs">
              © 2025 Dani Flamingo • 
              <a 
                href="https://github.com/delysz/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ml-1 hover:text-white/60 transition-colors font-mono"
                style={{ 
                  color: themeColor.main,
                  textShadow: `0 0 10px ${themeColor.main}`
                }}
              >
                Design by Delysz
              </a>
            </p>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

// -----------------------------------------------------------------------------
// 10. MAIN PAGE CONTROLLER
// -----------------------------------------------------------------------------

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState<Category>("All");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const themeColor = useMemo(() => getThemeColor(activeCat), [activeCat]);
  const { scrollY } = useScroll();

  useEffect(() => {
    const dummy = generateDummyData(12);
    setPhotos(dummy);

    const fetchSanity = async () => {
      try {
        const query = `*[_type == "photo"] | order(_createdAt desc) {
          _id, title, country, category,
          "imageUrl": image.asset->url, description, year, "featured": isFeatured
        }`;
        const data = await client.fetch(query);
        if (data.length > 0) {
          const filteredData = data.map((photo: any) => ({
            ...photo,
            category: (CATEGORIES.includes(photo.category as Category) 
              ? photo.category 
              : "All") as Category
          }));
          setPhotos(filteredData);
        }
      } catch (err) {
        console.warn("Sanity fetch failed, utilizing mock data pipeline.", err);
      }
    };
    fetchSanity();
  }, []);

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const matchCat = activeCat === "All" || p.category === activeCat;
      const matchSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.country && p.country.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [activeCat, photos, searchTerm]);

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 300, damping: 30 }}>
      <main className="min-h-screen bg-[#050505] text-white selection:bg-white/20 selection:text-black font-sans relative cursor-default">
        
        {/* Global Visual Layers */}
        <NoiseOverlay />
        
        {/* Header Section */}
        <Header themeColor={themeColor} scrollY={scrollY} />

        {/* Sticky Control Bar - VERSION MODIFICADA PARA MOVIL */}
        <div className="sticky top-4 z-40 w-full px-4 mb-20 pointer-events-none">
          <div 
            className={`max-w-[1400px] mx-auto bg-black/40 backdrop-blur-xl border transition-all duration-300 pointer-events-auto shadow-2xl overflow-hidden
              ${showMobileMenu ? 'rounded-[2rem]' : 'rounded-full'} 
            `}
            style={{
              borderColor: `${themeColor.main}20`,
              boxShadow: `0 0 40px ${themeColor.main}30`
            }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2">
            
              {/* CABECERA MÓVIL: Muestra categoría actual y botón de abrir/cerrar */}
              <div className="md:hidden flex items-center justify-between w-full px-4 py-1">
                <span className="text-xs font-bold uppercase tracking-widest text-white/80 font-mono">
                   Viewing: <span style={{ color: themeColor.main }}>{activeCat}</span>
                </span>
                <button 
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 rounded-full border bg-white/5 active:scale-95 transition-transform"
                  style={{ borderColor: themeColor.main, color: themeColor.main }}
                >
                  {showMobileMenu ? <X className="w-4 h-4"/> : <Filter className="w-4 h-4"/>}
                </button>
              </div>

              {/* LISTA DE CATEGORÍAS (Oculta en móvil salvo que se abra) */}
              <div className={`
                ${showMobileMenu ? 'flex max-h-96 opacity-100 mt-4 pb-2' : 'hidden max-h-0 opacity-0'} 
                md:flex md:max-h-full md:opacity-100 md:mt-0 md:pb-0
                flex-wrap justify-center gap-1 px-2 overflow-x-auto no-scrollbar max-w-full w-full md:w-auto transition-all duration-500 ease-in-out
              `}>
                {CATEGORIES.map((cat) => (
                  <MagneticButton 
                    key={cat} 
                    active={activeCat === cat} 
                    color={themeColor.main}
                    onClick={() => {
                      setActiveCat(cat as Category);
                      setShowMobileMenu(false); // Cierra el menú al seleccionar
                    }}
                  >
                    {cat}
                  </MagneticButton>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative group mr-2 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                  style={{ color: themeColor.main }}
                />
                <input 
                  type="text" 
                  placeholder="Search visuals..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border rounded-full py-2 pl-10 pr-4 text-xs uppercase tracking-wider focus:outline-none w-40 focus:w-64 transition-all duration-300 placeholder:text-white/20 font-mono"
                  style={{
                    borderColor: `${themeColor.main}30`,
                    color: themeColor.main,
                    boxShadow: `0 0 15px ${themeColor.main}20`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-12 md:gap-24 mb-24"
        >
          <PhysicsCounter n={78} label="Countries Visited" color={themeColor.main} />
          <PhysicsCounter n={photos.length} label="Visual Captures" color={themeColor.main} />
          <PhysicsCounter n={12} label="Exhibitions" color={themeColor.main} />
        </motion.div>

        {/* Gallery Grid */}
        <section className="max-w-[1600px] mx-auto px-4 md:px-12 mb-48 z-10 relative min-h-[50vh]">
           <AnimatePresence mode="popLayout">
             <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredPhotos.map((photo, i) => (
                 <PhotoCardPro 
                   key={photo._id} 
                   photo={photo} 
                   themeColor={themeColor} 
                   onClick={() => setSelectedPhoto(photo)} 
                   priority={i < 4}
                 />
               ))}
             </motion.div>
           </AnimatePresence>
           
           {filteredPhotos.length === 0 && (
             <div className="flex flex-col items-center justify-center py-32 opacity-50">
               <Filter className="w-12 h-12 mb-4" style={{ color: themeColor.main }} />
               <p className="uppercase tracking-widest text-sm text-white/40 font-mono"
                  style={{ textShadow: `0 0 10px ${themeColor.main}` }}
               >
                 No visuals found matching your criteria
               </p>
             </div>
           )}
        </section>

        {/* 3D Map Visualization */}
        <GlobeSection color={themeColor} photos={photos} />

        {/* Page Footer */}
        <Footer themeColor={themeColor} />

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <PhotoModalPro 
              photo={selectedPhoto} 
              themeColor={themeColor} 
              onClose={() => setSelectedPhoto(null)} 
            />
          )}
        </AnimatePresence>

      </main>
    </MotionConfig>
  );
}
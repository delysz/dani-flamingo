"use client"
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { client } from '@/lib/sanity'
import Image from 'next/image'
import { 
  Globe2, MapPin, Pause, Play, RotateCcw, 
  Instagram, Mail, ShoppingBag, ArrowRight,
  Zap, Sparkles, Camera, X,
  Maximize2, Minimize2, Volume2, VolumeX,
  Download, Heart, Share2, ChevronLeft, ChevronRight,
  Filter, Grid, List,
  Sparkle, EyeIcon,
  Music2
} from 'lucide-react'

// --- TIPOS ---
interface Photo { 
  _id: string; 
  title: string; 
  country?: string; 
  imageUrl: string; 
  category: string;
  description?: string;
  year?: number;
  featured?: boolean;
}

const CATEGORIES = [
  "All", "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", "Sofia", "Sofia's Artwork"
];

// --- PALETA DE COLORES MEJORADA ---
const getThemeColor = (cat: string): { 
  main: string; 
  light: string; 
  dark: string; 
  glow: string;
  gradient: string;
  rgb: string;
  particles: string[];
} => {
  const colors = {
    "Sofia": { 
      main: "#ff0099", 
      light: "#ff66cc", 
      dark: "#cc0077", 
      glow: "#ff0099",
      gradient: "linear-gradient(135deg, #ff0099, #ff66cc, #ff0099)",
      rgb: "255, 0, 153",
      particles: ["#ff0099", "#ff66cc", "#ff0099"]
    },
    "Sofia's Artwork": { 
      main: "#ff0099", 
      light: "#ff66cc", 
      dark: "#cc0077", 
      glow: "#ff0099",
      gradient: "linear-gradient(135deg, #ff0099, #ff66cc, #ff0099)",
      rgb: "255, 0, 153",
      particles: ["#ff0099", "#ff66cc", "#ff0099"]
    },
    "Beach": { 
      main: "#00f2ff", 
      light: "#66f7ff", 
      dark: "#00c2cc", 
      glow: "#00f2ff",
      gradient: "linear-gradient(135deg, #00f2ff, #66f7ff, #00f2ff)",
      rgb: "0, 242, 255",
      particles: ["#00f2ff", "#66f7ff", "#00c2cc"]
    },
    "Street": { 
      main: "#ff4d00", 
      light: "#ff8040", 
      dark: "#cc3e00", 
      glow: "#ff4d00",
      gradient: "linear-gradient(135deg, #ff4d00, #ff8040, #ff4d00)",
      rgb: "255, 77, 0",
      particles: ["#ff4d00", "#ff8040", "#ff6600"]
    },
    "Plants": { 
      main: "#00ff41", 
      light: "#66ff80", 
      dark: "#00cc34", 
      glow: "#00ff41",
      gradient: "linear-gradient(135deg, #00ff41, #66ff80, #00ff41)",
      rgb: "0, 255, 65",
      particles: ["#00ff41", "#66ff80", "#00cc34"]
    },
    "People": { 
      main: "#bd00ff", 
      light: "#d366ff", 
      dark: "#9400cc", 
      glow: "#bd00ff",
      gradient: "linear-gradient(135deg, #bd00ff, #d366ff, #bd00ff)",
      rgb: "189, 0, 255",
      particles: ["#bd00ff", "#d366ff", "#9400cc"]
    },
    "Animals": { 
      main: "#ffc400", 
      light: "#ffd966", 
      dark: "#cc9d00", 
      glow: "#ffc400",
      gradient: "linear-gradient(135deg, #ffc400, #ffd966, #ffc400)",
      rgb: "255, 196, 0",
      particles: ["#ffc400", "#ffd966", "#ffaa00"]
    },
    "Food": { 
      main: "#ff0040", 
      light: "#ff6699", 
      dark: "#cc0033", 
      glow: "#ff0040",
      gradient: "linear-gradient(135deg, #ff0040, #ff6699, #ff0040)",
      rgb: "255, 0, 64",
      particles: ["#ff0040", "#ff6699", "#cc0033"]
    },
    "Abstract": { 
      main: "#ffffff", 
      light: "#ffffff", 
      dark: "#cccccc", 
      glow: "#ffffff",
      gradient: "linear-gradient(135deg, #ffffff, #e0e0e0, #ffffff)",
      rgb: "255, 255, 255",
      particles: ["#ffffff", "#e0e0e0", "#cccccc"]
    },
    "All": { 
      main: "#00f2ff", 
      light: "#66f7ff", 
      dark: "#00c2cc", 
      glow: "#00f2ff",
      gradient: "linear-gradient(135deg, #00f2ff, #ff0099, #00f2ff)",
      rgb: "0, 242, 255",
      particles: ["#00f2ff", "#ff0099", "#00ff41"]
    }
  };
  return colors[cat as keyof typeof colors] || colors.All;
};

// --- PARTÍCULAS SIMPLIFICADAS (sin líneas) ---
const AdvancedParticles = ({ color }: { color: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Crear partículas simplificadas
    const createParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 10000));
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: color.particles[Math.floor(Math.random() * color.particles.length)],
          alpha: Math.random() * 0.3 + 0.1,
          type: Math.random() > 0.8 ? 'spark' : 'normal',
        });
      }
    };
    createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        // Movimiento
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Rebote
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        // Dibujar partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        if (particle.type === 'spark') {
          // Efecto de chispa
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, particle.color.replace(')', ', 0)').replace('rgb', 'rgba'));
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = particle.color.replace(')', `, ${particle.alpha})`).replace('rgb', 'rgba');
        }
        
        ctx.fill();
      });
      
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// --- CARRUSEL 3D INTERACTIVO ---
const Carousel3D = ({ photos, themeColor }: { photos: Photo[], themeColor: any }) => {
  const [rotation, setRotation] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const featuredPhotos = useMemo(() => 
    photos.filter(p => p.featured).slice(0, 8), 
    [photos]
  );
  
  const radius = 400;
  const totalItems = featuredPhotos.length;

  useEffect(() => {
    if (!isAutoRotating || featuredPhotos.length === 0) return;
    
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.002);
    }, 16);
    
    return () => clearInterval(interval);
  }, [isAutoRotating, featuredPhotos.length]);

  if (featuredPhotos.length === 0) return null;

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Globe2 className="w-8 h-8" style={{ color: themeColor.main }} />
            <span>Featured Visuals</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Explore the most captivating photographs in a dynamic 3D carousel
          </p>
        </motion.div>

        <div className="relative h-[600px]" ref={carouselRef}>
          {/* Controles */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className="p-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all"
            >
              {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setRotation(0)}
              className="p-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Carrusel 3D */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ 
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              perspective: '1000px'
            }}
          >
            {featuredPhotos.map((photo, index) => {
              const angle = (index / totalItems) * Math.PI * 2 + rotation;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              const scale = hoveredIndex === index ? 1.2 : 1;
              
              return (
                <motion.div
                  key={photo._id}
                  className="absolute w-48 h-64 rounded-xl overflow-hidden cursor-pointer"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${z}px)`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    filter: `brightness(${hoveredIndex === index ? 1.2 : 0.8})`,
                    zIndex: hoveredIndex === index ? 20 : 10,
                    boxShadow: hoveredIndex === index 
                      ? `0 0 40px ${themeColor.main}80` 
                      : `0 0 20px rgba(0,0,0,0.5)`
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  whileHover={{ scale: 1.05 }}
                  animate={{ 
                    rotateY: [0, 360],
                    transition: { duration: 20, repeat: Infinity, ease: "linear" }
                  }}
                >
                  <Image
                    src={photo.imageUrl}
                    alt={photo.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold truncate">{photo.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3" style={{ color: themeColor.main }} />
                      <span className="text-xs text-white/60">{photo.country || "Global"}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Instrucciones */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-white/60"
          >
            <p className="flex items-center gap-2">
              <span>Hover to zoom • Auto-rotating</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- ANIMACIÓN DE TEXTO NEÓN ---
const NeonText = ({ children, color }: { children: React.ReactNode; color: any }) => {
  return (
    <motion.span
      className="relative inline-block"
      animate={{
        textShadow: [
          `0 0 10px ${color.main}, 0 0 20px ${color.main}, 0 0 30px ${color.main}`,
          `0 0 20px ${color.main}, 0 0 30px ${color.main}, 0 0 40px ${color.main}`,
          `0 0 10px ${color.main}, 0 0 20px ${color.main}, 0 0 30px ${color.main}`
        ]
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.span>
  );
};

// --- EFECTO DE GLITCH MEJORADO (arreglado) ---
const GlitchEffect = ({ text, color }: { text: string; color: any }) => {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 100);
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block">
      <span className="relative z-10 opacity-100">
        {text}
      </span>
      {glitch && (
        <>
          <span 
            className="absolute left-0 top-0 opacity-70"
            style={{ 
              color: color.main,
              transform: 'translate(-1px, 1px)',
              filter: 'blur(0.5px)'
            }}
          >
            {text}
          </span>
          <span 
            className="absolute left-0 top-0 opacity-70"
            style={{ 
              color: color.light,
              transform: 'translate(1px, -1px)',
              filter: 'blur(0.5px)'
            }}
          >
            {text}
          </span>
        </>
      )}
    </div>
  );
};

// --- BOTÓN DE MODO INMERSIVO ---
const ImmersiveModeToggle = ({ enabled, onToggle, color }: { enabled: boolean, onToggle: () => void, color: any }) => {
  return (
    <motion.button
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={enabled ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 0.5 }}
    >
      {enabled ? <Sparkle className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
    </motion.button>
  );
};

// --- VISUALIZADOR 3D DE FOTOS ---
const PhotoCard3D = ({ photo, index, themeColor, delay, onClick }: { 
  photo: Photo; 
  index: number; 
  themeColor: any; 
  delay: number; 
  onClick: () => void 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !isHovered) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 10;
    const rotateX = ((centerY - y) / centerY) * 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotateX: rotation.x,
        rotateY: rotation.y
      }}
      transition={{ 
        duration: 0.6, 
        delay: delay * 0.05,
        rotateX: { type: "spring", stiffness: 100, damping: 15 },
        rotateY: { type: "spring", stiffness: 100, damping: 15 }
      }}
      className="relative group cursor-pointer perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d' as const }}
    >
      {/* Efecto de aura */}
      <motion.div 
        className="absolute -inset-4 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"
        style={{ background: themeColor.gradient }}
        animate={isHovered ? { 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Contenedor principal */}
      <div className="relative bg-gradient-to-br from-black/90 to-gray-900/90 rounded-xl overflow-hidden border transition-all duration-500 group-hover:shadow-2xl"
           style={{ 
             borderColor: isHovered ? themeColor.main : 'rgba(255,255,255,0.1)',
             transform: isHovered ? 'translateZ(50px)' : 'translateZ(0)',
             boxShadow: isHovered ? 
               `0 25px 50px ${themeColor.main}30, inset 0 1px 0 ${themeColor.main}20` : 
               '0 4px 20px rgba(0,0,0,0.5)'
           }}>
        
        {/* Imagen */}
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
                  'grayscale(0) brightness(1.1) saturate(1.2)' : 
                  'grayscale(0.2) brightness(0.9) saturate(1.1)' 
              }}
            />
          </motion.div>
          
          {/* Efectos de capa */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          <motion.div 
            className="absolute inset-0 opacity-0 group-hover:opacity-30"
            style={{ background: themeColor.gradient }}
            animate={isHovered ? { 
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
            } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 z-10">
            <motion.span 
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest rounded-full font-bold backdrop-blur-md"
              style={{ 
                background: themeColor.gradient, 
                color: 'white',
                boxShadow: `0 0 20px ${themeColor.main}30`
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {photo.category}
            </motion.span>
          </div>
          
          <div className="absolute top-4 right-4 z-10">
            <motion.span 
              className="text-sm font-mono px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md"
              style={{ color: themeColor.main }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              #{String(index + 1).padStart(2, '0')}
            </motion.span>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-6 relative z-10">
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
                  boxShadow: [
                    `0 0 5px ${themeColor.main}`,
                    `0 0 15px ${themeColor.main}`,
                    `0 0 5px ${themeColor.main}`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs uppercase tracking-widest text-white/60">Click to explore</span>
            </div>
            
            <motion.div 
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: themeColor.main }}
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Maximize2 className="w-4 h-4 text-black" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- MODAL DE FOTO FULLSCREEN ---
const PhotoModal = ({ 
  photo, 
  isOpen, 
  onClose, 
  themeColor, 
  onNext, 
  onPrev, 
  hasNext, 
  hasPrev 
}: { 
  photo: Photo; 
  isOpen: boolean; 
  onClose: () => void; 
  themeColor: any; 
  onNext: () => void; 
  onPrev: () => void; 
  hasNext: boolean; 
  hasPrev: boolean 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Efectos de fondo */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-30"
            style={{ 
              background: `radial-gradient(circle at center, ${themeColor.main}20, transparent 70%)`
            }}
          />
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[1px] h-[1px] rounded-full"
              style={{ background: themeColor.main }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>

        {/* Contenido del modal */}
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/10 bg-black/80 backdrop-blur-xl"
          style={{ boxShadow: `0 0 60px ${themeColor.main}40` }}
        >
          {/* Controles */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Imagen */}
            <div className="lg:col-span-2 relative h-[60vh] lg:h-full">
              <Image
                src={photo.imageUrl}
                alt={photo.title}
                fill
                className="object-contain p-8"
                sizes="100vw"
              />
              
              {/* Controles de navegación */}
              {hasPrev && (
                <button
                  onClick={onPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              {hasNext && (
                <button
                  onClick={onNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Información */}
            <div className="p-8 border-t lg:border-t-0 lg:border-l border-white/10">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-white/60 mb-2">
                    <MapPin className="w-4 h-4" style={{ color: themeColor.main }} />
                    <span>{photo.country || "WORLDWIDE"}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{photo.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs uppercase tracking-widest rounded-full"
                          style={{ 
                            background: `${themeColor.main}20`, 
                            color: themeColor.main,
                            border: `1px solid ${themeColor.main}40`
                          }}>
                      {photo.category}
                    </span>
                    {photo.year && (
                      <span className="text-sm text-white/60">• {photo.year}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Description</h3>
                  <p className="text-white/70 leading-relaxed">
                    {photo.description || "A stunning visual capture from Dani Flamingo's global journey."}
                  </p>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <button className="flex-1 py-3 rounded-lg border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>Like</span>
                  </button>
                  <button className="flex-1 py-3 rounded-lg border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button className="flex-1 py-3 rounded-lg text-black font-semibold transition-all flex items-center justify-center gap-2"
                          style={{ 
                            background: themeColor.main,
                            boxShadow: `0 0 20px ${themeColor.main}40`
                          }}>
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Resolution</div>
                    <div className="text-white">4000 × 6000</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Camera</div>
                    <div className="text-white">Sony A7R IV</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Indicador de navegación */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-sm text-white/60">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`p-2 rounded-full border border-white/10 ${hasPrev ? 'hover:bg-white/10' : 'opacity-30'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Navigate with ← → keys</span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`p-2 rounded-full border border-white/10 ${hasNext ? 'hover:bg-white/10' : 'opacity-30'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- COMPONENTE PRINCIPAL MEJORADO ---
export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState<string>("All");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [ambientEnabled, setAmbientEnabled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Efecto para cambiar CSS variables dinámicamente
  useEffect(() => {
    const themeColor = getThemeColor(activeCat);
    document.documentElement.style.setProperty('--theme-color', themeColor.main);
  }, [activeCat]);

  // Efecto para trackear scroll
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
      "imageUrl": image.asset->url,
      description,
      year,
      featured
    }`;
    
    client.fetch(query)
      .then((data: Photo[]) => {
        if (data && data.length > 0) {
          setPhotos(data);
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

  // Efecto de sonido al interactuar
  const playSound = (type: 'hover' | 'click' | 'select') => {
    if (!audioEnabled) return;
    
    // En un proyecto real, aquí cargarías archivos de audio
    console.log(`Playing ${type} sound`);
  };

  const handleSelectCategory = useCallback((cat: string) => {
    setActiveCat(cat);
    playSound('select');
  }, [audioEnabled]);

  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
    playSound('click');
  };

  const closePhotoModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPhoto(null), 300);
  };

  const navigatePhoto = (direction: 'next' | 'prev') => {
    if (!selectedPhoto) return;
    
    const currentIndex = filtered.findIndex(p => p._id === selectedPhoto._id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex < filtered.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filtered.length - 1;
    }
    
    setSelectedPhoto(filtered[newIndex]);
  };

  const hasNextPhoto = selectedPhoto && filtered.findIndex(p => p._id === selectedPhoto._id) < filtered.length - 1;
  const hasPrevPhoto = selectedPhoto && filtered.findIndex(p => p._id === selectedPhoto._id) > 0;

  return (
    <main className={`min-h-screen bg-black text-white overflow-x-hidden ${immersiveMode ? 'immersive' : ''}`}>
      {/* Partículas simplificadas (sin líneas) */}
      <AdvancedParticles color={themeColor} />
      
      {/* Modo inmersivo toggle */}
      <ImmersiveModeToggle 
        enabled={immersiveMode}
        onToggle={() => setImmersiveMode(!immersiveMode)}
        color={themeColor}
      />
      
      {/* Barra de progreso */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
        style={{ 
          background: themeColor.gradient,
          boxShadow: `0 0 20px ${themeColor.main}`
        }}
        animate={{ scaleX: scrollProgress / 100 }}
      />
      
      {/* Controles globales */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <motion.button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => playSound('hover')}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </motion.button>
        <motion.button
          onClick={() => setAmbientEnabled(!ambientEnabled)}
          className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => playSound('hover')}
        >
          {ambientEnabled ? <Music2 className="w-4 h-4" /> : <Music2 className="w-4 h-4 opacity-50" />}
        </motion.button>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Hero Section con efectos mejorados */}
        <header className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 relative overflow-hidden">
          {/* Fondo dinámico */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${themeColor.main}10, transparent 70%)`,
                filter: 'blur(100px)'
              }}
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </div>
          
          <div className="max-w-7xl mx-auto w-full relative">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              className="text-center"
            >
              {/* Título con efecto glitch corregido */}
              <div className="mb-12 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1, delay: 0.5, type: "spring" }}
                  className="inline-block"
                >
                  <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4">
                    <span className="relative">
                      {/* "DANI" con color blanco sólido y efecto de brillo */}
                      <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/90">
                        DANI
                      </span>
                      {/* Efecto de brillo superpuesto */}
                      <motion.span
                        className="absolute inset-0 bg-clip-text text-transparent"
                        style={{
                          background: themeColor.gradient,
                          backgroundSize: '200% 100%'
                        }}
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        DANI
                      </motion.span>
                    </span>
                    <br />
                    <NeonText color={themeColor}>
                      <span className="relative">
                        {/* "FLAMINGO" con el color del tema */}
                        <span 
                          className="bg-clip-text text-transparent"
                          style={{
                            background: themeColor.gradient,
                            backgroundSize: '200% 100%'
                          }}
                        >
                          FLAMINGO
                        </span>
                      </span>
                    </NeonText>
                  </h1>
                </motion.div>
                
                {/* Subtítulo animado */}
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-lg md:text-xl tracking-[0.3em] uppercase text-white/60 mb-8"
                >
                  <span className="inline-flex overflow-hidden">
                    <motion.span
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{ 
                        background: themeColor.gradient,
                        backgroundSize: '200% 100%',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent'
                      }}
                    >
                      VISUAL EXPLORER • GLOBAL ARTIST • PHOTOGRAPHER
                    </motion.span>
                  </span>
                </motion.p>
              </div>
              
              {/* Flamingos animados */}
              <div className="flex items-center justify-center gap-8 md:gap-24 mb-16">
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8, type: "spring" }}
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
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    style={{ 
                      background: `radial-gradient(circle, ${themeColor.main}20, transparent 70%)`,
                      filter: 'blur(40px)'
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>
                
                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8, type: "spring" }}
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
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    style={{ 
                      background: `radial-gradient(circle, ${themeColor.main}20, transparent 70%)`,
                      filter: 'blur(40px)'
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                </motion.div>
              </div>
              
              {/* Stats mejoradas */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2" style={{ color: themeColor.main }}>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {photos.length}+
                    </motion.span>
                  </div>
                  <div className="text-xs uppercase tracking-widest text-white/60">Visuals</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2" style={{ color: themeColor.main }}>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      78+
                    </motion.span>
                  </div>
                  <div className="text-xs uppercase tracking-widest text-white/60">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2" style={{ color: themeColor.main }}>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      7+
                    </motion.span>
                  </div>
                  <div className="text-xs uppercase tracking-widest text-white/60">Years</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2" style={{ color: themeColor.main }}>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                    >
                      {CATEGORIES.length}
                    </motion.span>
                  </div>
                  <div className="text-xs uppercase tracking-widest text-white/60">Categories</div>
                </div>
              </motion.div>
              
              {/* Scroll indicator */}
              <motion.div 
                animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              >
                <span className="text-xs uppercase tracking-widest text-white/40">Begin Exploration</span>
                <ArrowRight className="w-5 h-5 rotate-90 text-white/40" />
              </motion.div>
            </motion.div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="sticky top-0 z-40 py-6 bg-black/80 backdrop-blur-xl border-b border-white/10 mb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {CATEGORIES.map((cat) => {
                const isActive = activeCat === cat;
                const catColor = getThemeColor(cat);
                
                return (
                  <motion.button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className="relative px-4 py-2.5 rounded-xl overflow-hidden transition-all duration-300 group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => playSound('hover')}
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
                        layoutId="navActiveBg"
                      />
                    )}
                    
                    <span className="relative z-10 text-sm font-medium tracking-wider uppercase flex items-center gap-2">
                      {cat === 'Sofia\'s Artwork' && <Sparkle className="w-3 h-3" />}
                      {cat}
                    </span>
                    
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 w-8 h-1 rounded-full"
                        style={{ background: catColor.main }}
                        layoutId="navActiveLine"
                      />
                    )}
                    
                    {/* Efecto de hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                         style={{ 
                           background: `linear-gradient(90deg, transparent, ${catColor.main}10, transparent)`,
                           transform: 'translateX(-100%)'
                         }} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Carrusel 3D */}
        <Carousel3D photos={photos} themeColor={themeColor} />

        {/* Gallery Section */}
        <section id="gallery" className="px-4 md:px-8 mb-32">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <motion.div
                  className="relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-20 h-20 border-4 border-white/10 rounded-full" />
                  <div className="absolute inset-2 border-t-4 border-[#ff0099] rounded-full" />
                </motion.div>
                <motion.p 
                  className="mt-8 text-white/60 uppercase tracking-widest text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Loading Visual Universe...
                </motion.p>
              </div>
            ) : filtered.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-32 rounded-2xl border border-dashed border-white/10"
              >
                <div className="max-w-md mx-auto">
                  <h3 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: themeColor.main }}>
                    Visual Void Detected
                  </h3>
                  <p className="text-white/60 mb-8">
                    No photographs found in the {activeCat.toLowerCase()} dimension. 
                    Try exploring other categories to discover hidden masterpieces.
                  </p>
                  <motion.button
                    onClick={() => handleSelectCategory("All")}
                    className="px-8 py-4 rounded-xl uppercase tracking-widest font-bold transition-all relative overflow-hidden group"
                    style={{ 
                      background: themeColor.gradient,
                      boxShadow: `0 0 40px ${themeColor.main}40`
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: `0 0 60px ${themeColor.main}60`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">Explore All Dimensions</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Gallery Header */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: themeColor.main }}>
                    {activeCat === "All" ? "Visual Universe" : activeCat}
                    <span className="block text-lg md:text-xl text-white/60 mt-2">
                      {filtered.length} masterpiece{filtered.length !== 1 ? 's' : ''} • Curated Collection
                    </span>
                  </h2>
                  
                  {/* Filters */}
                  <div className="inline-flex gap-2 p-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10">
                    <button className="px-4 py-2 text-sm rounded-lg transition-colors"
                            style={{ 
                              background: `${themeColor.main}20`, 
                              color: themeColor.main
                            }}>
                      <Filter className="w-4 h-4 inline mr-2" />
                      Latest
                    </button>
                    <button className="px-4 py-2 text-sm rounded-lg transition-colors text-white/60 hover:text-white">
                      <Grid className="w-4 h-4 inline mr-2" />
                      Grid
                    </button>
                    <button className="px-4 py-2 text-sm rounded-lg transition-colors text-white/60 hover:text-white">
                      <List className="w-4 h-4 inline mr-2" />
                      List
                    </button>
                  </div>
                </motion.div>
                
                {/* Photo Grid */}
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <AnimatePresence mode="popLayout">
                    {filtered.map((photo, i) => (
                      <PhotoCard3D
                        key={photo._id}
                        photo={photo}
                        index={i}
                        themeColor={themeColor}
                        delay={i}
                        onClick={() => openPhotoModal(photo)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
                
                {/* Gallery Stats */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-16 pt-8 border-t border-white/10"
                >
                  <p className="text-white/40 text-sm">
                    Showing <span className="font-bold text-white">{filtered.length}</span> of{" "}
                    <span className="font-bold text-white">{photos.length}</span> visual masterpieces
                  </p>
                  <motion.button
                    className="mt-6 px-6 py-3 text-sm uppercase tracking-widest rounded-full border border-white/20 hover:border-white/40 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Return to Orbit
                  </motion.button>
                </motion.div>
              </>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 pt-12 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: themeColor.main }}>
                  Continue the Visual Journey
                </h3>
                <p className="text-white/60 max-w-md text-lg">
                  Every photograph tells a story. Every location holds a memory. 
                  The visual exploration never ends.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button 
                  className="px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => playSound('hover')}
                >
                  <Instagram className="w-4 h-4" />
                  <span className="text-sm uppercase tracking-widest">Instagram</span>
                </motion.button>
                <motion.button 
                  className="px-6 py-3 rounded-lg transition-all flex items-center gap-2"
                  style={{ 
                    background: themeColor.gradient,
                    boxShadow: `0 0 30px ${themeColor.main}40`
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: `0 0 40px ${themeColor.main}60` 
                  }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => playSound('hover')}
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm uppercase tracking-widest font-bold text-black">View Portfolio</span>
                </motion.button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pt-8 border-t border-white/10">
              <div className="text-center md:text-left">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: themeColor.main }} />
                  Collaborate
                </h4>
                <p className="text-white/60 text-sm">Work with Dani Flamingo on visual projects worldwide.</p>
              </div>
              <div className="text-center">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" style={{ color: themeColor.main }} />
                  Prints & Exhibitions
                </h4>
                <p className="text-white/60 text-sm">Limited edition prints and gallery exhibitions.</p>
              </div>
              <div className="text-center md:text-right">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: themeColor.main }} />
                  Newsletter
                </h4>
                <p className="text-white/60 text-sm">Exclusive content and early access.</p>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center pt-8 border-t border-white/10 text-white/40 text-sm">
              <p>© {new Date().getFullYear()} Dani Flamingo Visuals • Created with passion across continents</p>
              <p className="mt-2 text-xs opacity-60">
                Interactive 3D Carousel • Particle Effects • Dynamic Animations • Immersive Experience
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal de foto */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          isOpen={isModalOpen}
          onClose={closePhotoModal}
          themeColor={themeColor}
          onNext={() => navigatePhoto('next')}
          onPrev={() => navigatePhoto('prev')}
          hasNext={!!hasNextPhoto}
          hasPrev={!!hasPrevPhoto}
        />
      )}

      {/* Agregar estilos CSS globales */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${themeColor.gradient};
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${themeColor.main};
          box-shadow: 0 0 10px ${themeColor.main};
        }
        
        /* Selection color */
        ::selection {
          background: rgba(${themeColor.rgb}, 0.3);
          color: white;
        }
        
        ::-moz-selection {
          background: rgba(${themeColor.rgb}, 0.3);
          color: white;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Image loading animations */
        .image-loading {
          background: linear-gradient(90deg, #111 0%, #222 50%, #111 100%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </main>
  );
}
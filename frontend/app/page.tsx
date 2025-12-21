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
  Zap, Sparkles, Camera, Navigation, X,
  Maximize2, Minimize2, Volume2, VolumeX,
  Download, Heart, Share2, ChevronLeft, ChevronRight,
  Filter, Grid, List, Settings, Moon, Sun,
  Sparkle, Zap as Lightning, Target, Rocket,
  Palette, Music, Video, Image as ImageIcon,
  Eye, EyeOff, Lock, Unlock, Star,
  Award, Trophy, Crown, Shield, Sword
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
        <div className="w-12 h-12 border-2 border-dashed border-white/20 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-t-2 border-[#ff0099] rounded-full" />
        <motion.div 
          className="absolute -inset-4 rounded-full border border-white/10"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
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
  description?: string;
  year?: number;
}

const CATEGORIES = [
  "All", "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", "Sofia", "Sofia's Artwork"
];

// --- PALETA DE COLORES DINÁMICA CON MÁS VARIEDAD ---
const getThemeColor = (cat: string): { 
  main: string; 
  light: string; 
  dark: string; 
  glow: string;
  gradient: string;
  rgb: string;
} => {
  const colors = {
    "Sofia": { 
      main: "#ff0099", 
      light: "#ff66cc", 
      dark: "#cc0077", 
      glow: "#ff0099",
      gradient: "linear-gradient(135deg, #ff0099, #ff66cc, #ff0099)",
      rgb: "255, 0, 153"
    },
    "Sofia's Artwork": { 
      main: "#ff0099", 
      light: "#ff66cc", 
      dark: "#cc0077", 
      glow: "#ff0099",
      gradient: "linear-gradient(135deg, #ff0099, #ff66cc, #ff0099)",
      rgb: "255, 0, 153"
    },
    "Beach": { 
      main: "#00f2ff", 
      light: "#66f7ff", 
      dark: "#00c2cc", 
      glow: "#00f2ff",
      gradient: "linear-gradient(135deg, #00f2ff, #66f7ff, #00f2ff)",
      rgb: "0, 242, 255"
    },
    "Street": { 
      main: "#ff4d00", 
      light: "#ff8040", 
      dark: "#cc3e00", 
      glow: "#ff4d00",
      gradient: "linear-gradient(135deg, #ff4d00, #ff8040, #ff4d00)",
      rgb: "255, 77, 0"
    },
    "Plants": { 
      main: "#00ff41", 
      light: "#66ff80", 
      dark: "#00cc34", 
      glow: "#00ff41",
      gradient: "linear-gradient(135deg, #00ff41, #66ff80, #00ff41)",
      rgb: "0, 255, 65"
    },
    "People": { 
      main: "#bd00ff", 
      light: "#d366ff", 
      dark: "#9400cc", 
      glow: "#bd00ff",
      gradient: "linear-gradient(135deg, #bd00ff, #d366ff, #bd00ff)",
      rgb: "189, 0, 255"
    },
    "Animals": { 
      main: "#ffc400", 
      light: "#ffd966", 
      dark: "#cc9d00", 
      glow: "#ffc400",
      gradient: "linear-gradient(135deg, #ffc400, #ffd966, #ffc400)",
      rgb: "255, 196, 0"
    },
    "Food": { 
      main: "#ff0040", 
      light: "#ff6699", 
      dark: "#cc0033", 
      glow: "#ff0040",
      gradient: "linear-gradient(135deg, #ff0040, #ff6699, #ff0040)",
      rgb: "255, 0, 64"
    },
    "Abstract": { 
      main: "#ffffff", 
      light: "#ffffff", 
      dark: "#cccccc", 
      glow: "#ffffff",
      gradient: "linear-gradient(135deg, #ffffff, #e0e0e0, #ffffff)",
      rgb: "255, 255, 255"
    },
    "All": { 
      main: "#00f2ff", 
      light: "#66f7ff", 
      dark: "#00c2cc", 
      glow: "#00f2ff",
      gradient: "linear-gradient(135deg, #00f2ff, #ff0099, #00f2ff)",
      rgb: "0, 242, 255"
    }
  };
  return colors[cat as keyof typeof colors] || colors.All;
};

// --- PARTICLES BACKGROUND COMPONENT ---
const ParticlesBackground = ({ color }: { color: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Crear partículas
    const createParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 10000));
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `rgba(${color.rgb}, ${Math.random() * 0.3 + 0.1})`
        });
      }
    };
    createParticles();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Actualizar y dibujar partículas
      particlesRef.current.forEach(particle => {
        // Actualizar posición
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Rebotes en los bordes
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        // Atracción hacia el mouse
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          particle.x += dx * 0.01;
          particle.y += dy * 0.01;
        }
        
        // Dibujar partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Conexiones entre partículas
        particlesRef.current.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color.rgb}, ${0.2 * (1 - distance/100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

// --- CONTADOR FÍSICO MEJORADO CON EFECTOS ---
const PhysicsCounter = ({ n, label, color, icon: Icon }: { 
  n: number; 
  label: string; 
  color: any;
  icon?: any;
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const controls = animate(count, n, { 
      duration: 2.5, 
      ease: "circOut"
    });
    return controls.stop;
  }, [n, count]);

  return (
    <motion.div 
      className="text-center relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative inline-block">
        <motion.div 
          className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{ background: `radial-gradient(circle, ${color.main}, transparent 70%)` }}
        />
        
        {Icon && (
          <motion.div 
            className="absolute -top-6 left-1/2 -translate-x-1/2"
            animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1 }}
          >
            <Icon className="w-6 h-6" style={{ color: color.main }} />
          </motion.div>
        )}
        
        <motion.div 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 relative"
          style={{ color: color.main }}
          animate={isHovered ? { 
            textShadow: [
              `0 0 10px ${color.main}`,
              `0 0 20px ${color.main}`,
              `0 0 10px ${color.main}`
            ]
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <motion.span>{rounded}</motion.span>+
        </motion.div>
      </div>
      
      <div className="text-xs uppercase tracking-widest text-white/60 mt-2">
        {label}
      </div>
      
      {/* Efecto de partículas al hover */}
      <AnimatePresence>
        {isHovered && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ 
                  background: color.main,
                  left: '50%',
                  top: '50%',
                }}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: 1 
                }}
                animate={{ 
                  x: Math.cos((i * 45) * Math.PI / 180) * 60,
                  y: Math.sin((i * 45) * Math.PI / 180) * 60,
                  opacity: 0,
                  scale: 0
                }}
                transition={{ 
                  duration: 1,
                  delay: i * 0.1 
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- MARCO HOLOGRÁFICO 2.0 ---
const HolographicFrame = ({ color }: { color: any }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };
    
    const interval = setInterval(() => {
      setTime(prev => prev + 0.01);
    }, 16);
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Marco principal */}
      <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
        {/* Líneas de borde animadas */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color.main} stopOpacity="0" />
              <stop offset="50%" stopColor={color.main} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color.main} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Marco rectangular con animación de escaneo */}
          <motion.rect
            x="20"
            y="20"
            width="calc(100% - 40)"
            height="calc(100% - 40)"
            fill="none"
            stroke="url(#borderGradient)"
            strokeWidth="1"
            strokeDasharray="10 5"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: -100 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Esquinas decoradas */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
          const isTop = corner.includes('top');
          const isLeft = corner.includes('left');
          
          return (
            <div
              key={corner}
              className={`absolute ${isTop ? 'top-0' : 'bottom-0'} ${isLeft ? 'left-0' : 'right-0'} w-32 h-32`}
            >
              {/* Líneas principales */}
              <div 
                className={`absolute ${isTop ? 'top-0' : 'bottom-0'} ${isLeft ? 'left-0' : 'right-0'} w-24 h-1`}
                style={{ 
                  background: `linear-gradient(${isLeft ? 'to right' : 'to left'}, transparent, ${color.main}30, transparent)`
                }}
              />
              <div 
                className={`absolute ${isTop ? 'top-0' : 'bottom-0'} ${isLeft ? 'left-0' : 'right-0'} w-1 h-24`}
                style={{ 
                  background: `linear-gradient(${isTop ? 'to bottom' : 'to top'}, transparent, ${color.main}30, transparent)`
                }}
              />
              
              {/* Elemento decorativo central */}
              <motion.div
                className={`absolute ${isTop ? 'top-8' : 'bottom-8'} ${isLeft ? 'left-8' : 'right-8'} w-16 h-16`}
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 border border-white/10 rounded-full" />
                  <div className="absolute inset-2 border border-dashed border-white/5 rounded-full" />
                  <motion.div 
                    className="absolute inset-4 rounded-full"
                    style={{ background: color.main }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
              
              {/* Partículas orbitales */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{ 
                    background: color.main,
                    top: isTop ? '12px' : 'auto',
                    bottom: isTop ? 'auto' : '12px',
                    left: isLeft ? '12px' : 'auto',
                    right: isLeft ? 'auto' : '12px',
                  }}
                  animate={{
                    x: [
                      isLeft ? 0 : 0,
                      isLeft ? 20 : -20,
                      isLeft ? 0 : 0
                    ],
                    y: [
                      isTop ? 0 : 0,
                      isTop ? 20 : -20,
                      isTop ? 0 : 0
                    ],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>
          );
        })}

        {/* Líneas de escaneo interactivas */}
        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ top: `${mousePosition.y}%` }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"
          style={{ left: `${mousePosition.x}%` }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />

        {/* Efectos de brillo en las esquinas */}
        <div 
          className="absolute top-0 left-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${color.main}, transparent 50%)` }}
        />
        <div 
          className="absolute top-0 right-0 w-64 h-64 translate-x-1/2 -translate-y-1/2 opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${color.main}, transparent 50%)` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-64 h-64 -translate-x-1/2 translate-y-1/2 opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${color.main}, transparent 50%)` }}
        />
        <div 
          className="absolute bottom-0 right-0 w-64 h-64 translate-x-1/2 translate-y-1/2 opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, ${color.main}, transparent 50%)` }}
        />
      </div>

      {/* Efectos de partículas del marco */}
      <div className="fixed inset-0 z-30 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full"
            style={{ 
              background: color.main,
              left: `${(i * 7) % 100}%`,
              top: `${Math.sin(time + i) * 50 + 50}%`,
            }}
            animate={{
              y: [0, Math.sin(time + i) * 20, 0],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 3 + Math.sin(i),
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </>
  );
};

// --- MODAL DE FOTO FULLSCREEN ---
const PhotoModal = ({ photo, isOpen, onClose, themeColor, onNext, onPrev, hasNext, hasPrev }: any) => {
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

// --- VISUALIZADOR 3D DE FOTOS ---
const PhotoCard3D = ({ photo, index, themeColor, delay, onClick }: any) => {
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
      style={{ transformStyle: 'preserve-3d' }}
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

// --- COMPONENTE DE LOGROS ---
const Achievements = ({ photos, themeColor }: { photos: Photo[], themeColor: any }) => {
  const achievements = [
    { icon: Trophy, label: 'Global Explorer', value: '78+ Countries', color: '#ff0099' },
    { icon: Award, label: 'Master Shots', value: `${photos.length}+ Photos`, color: '#00f2ff' },
    { icon: Crown, label: 'Top Categories', value: '10 Collections', color: '#ff4d00' },
    { icon: Shield, label: 'Years Active', value: '7+ Years', color: '#00ff41' },
    { icon: Sword, label: 'Continents', value: '6/7 Covered', color: '#bd00ff' },
    { icon: Star, label: 'Exhibitions', value: '24 Shows', color: '#ffc400' },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8" style={{ color: themeColor.main }} />
            <span>Achievements & Milestones</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Celebrating years of visual exploration and photographic excellence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-black/50 to-gray-900/30 backdrop-blur-sm group hover:scale-[1.02] transition-all duration-500"
            >
              {/* Efecto de fondo */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"
                style={{ background: achievement.color }}
              />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <achievement.icon className="w-10 h-10" style={{ color: achievement.color }} />
                  <motion.div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: achievement.color }}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Sparkle className="w-3 h-3 text-black" />
                  </motion.div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{achievement.label}</h3>
                <div className="text-2xl font-bold mb-2" style={{ color: achievement.color }}>
                  {achievement.value}
                </div>
                <p className="text-sm text-white/60">
                  Milestone achieved through years of dedicated photography
                </p>
              </div>
            </motion.div>
          ))}
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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [ambientEnabled, setAmbientEnabled] = useState(false);

  // Efectos de sonido (podrías agregar archivos de audio reales)
  const playHoverSound = () => {
    if (audioEnabled) {
      // Implementar sonido de hover
    }
  };

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
      year
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
    playHoverSound();
  }, []);

  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
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
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Partículas interactivas */}
      <ParticlesBackground color={themeColor} />
      
      {/* Marco holográfico */}
      <HolographicFrame color={themeColor} />
      
      {/* Barra de progreso épica */}
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
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </motion.button>
        <motion.button
          onClick={() => setAmbientEnabled(!ambientEnabled)}
          className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {ambientEnabled ? <Music className="w-4 h-4" /> : <Music className="w-4 h-4 opacity-50" />}
        </motion.button>
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Hero Section Mejorada */}
        <header className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 relative overflow-hidden">
          {/* Efectos de fondo hero */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${themeColor.main}10, transparent 70%)`,
                filter: 'blur(100px)'
              }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
          
          <div className="max-w-7xl mx-auto w-full relative">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              className="text-center"
            >
              {/* Título animado */}
              <div className="mb-12 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1, delay: 0.5, type: "spring" }}
                  className="inline-block"
                >
                  <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                      DANI
                    </span>
                    <br />
                    <motion.span 
                      className="bg-clip-text text-transparent"
                      style={{ 
                        background: themeColor.gradient,
                        backgroundSize: '200% 100%'
                      }}
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        filter: [
                          `drop-shadow(0 0 20px ${themeColor.main})`,
                          `drop-shadow(0 0 40px ${themeColor.main})`,
                          `drop-shadow(0 0 20px ${themeColor.main})`
                        ]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      FLAMINGO
                    </motion.span>
                  </h1>
                </motion.div>
                
                {/* Subtítulo */}
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
              
              {/* Estadísticas */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto"
              >
                <PhysicsCounter n={78} label="Countries" color={themeColor} icon={Globe2} />
                <PhysicsCounter n={photos.length} label="Photos" color={themeColor} icon={Camera} />
                <PhysicsCounter n={7} label="Years" color={themeColor} icon={Award} />
                <PhysicsCounter n={24} label="Exhibitions" color={themeColor} icon={Trophy} />
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
                    style={{
                      background: isActive 
                        ? `linear-gradient(135deg, ${catColor.main}20, ${catColor.main}40)` 
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isActive ? catColor.main : 'rgba(255,255,255,0.1)'}`,
                      color: isActive ? catColor.main : '#888',
                    }}
                    onMouseEnter={playHoverSound}
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
                  Initializing Visual Database...
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

        {/* Achievements Section */}
        <Achievements photos={photos} themeColor={themeColor} />

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
                  onMouseEnter={playHoverSound}
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
                  onMouseEnter={playHoverSound}
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
                Interactive 3D Globe • Particle Effects • Holographic UI • Dynamic Animations
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
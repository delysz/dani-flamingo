"use client"
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { client } from '@/lib/sanity'
import Image from 'next/image'
import Masonry from 'react-masonry-css'

// --- 1. CONFIGURACIÓN E INTERFACES ---

interface Photo { 
  _id: string; 
  title: string; 
  country?: string; 
  imageUrl: string; 
  category: string;
}

// Tus categorías exactas
const CATEGORIES = [
  "All",
  "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", // Grupo AZUL
  "Sofia", "Sofia's Artwork" // Grupo ROSA
];

// Función para determinar el color del tema
const getThemeColor = (cat: string) => {
  if (["Sofia", "Sofia's Artwork"].includes(cat)) return "#ff0099"; // Rosa Neón
  return "#00f2ff"; // Cian Neón
};

// --- 2. COMPONENTES VISUALES ---

// Contador Animado
const Counter = ({ to }: { to: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => { animate(count, to, { duration: 2.5, ease: "circOut" }); }, [to, count]);
  return <motion.span>{rounded}</motion.span>;
};

// Mapa del Mundo Vectorial (Geográficamente correcto)
const ProfessionalMap = ({ color }: { color: string }) => {
  return (
    <div className="w-full h-full flex justify-center items-center overflow-hidden">
      <svg 
        viewBox="0 0 1000 450" 
        className="w-full h-full opacity-40 transition-all duration-700"
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      >
        <g fill={color} className="transition-colors duration-700">
          {/* Norteamérica */}
          <path d="M150,80 L250,80 L280,150 L200,200 L120,150 Z" opacity="0.1" /> 
          <path d="M50,80 Q150,50 250,80 T300,200 T150,220 T50,80" fill="none" stroke={color} strokeWidth="1"/>
          {/* Path complejo simplificado para estética 'Tech' */}
          <path d="M165,115 l5,-5 l10,0 l5,10 l-10,15 l-15,-5 z M200,100 l20,-10 l30,20 l-10,40 l-40,-10 z" /> 
          
          {/* Sudamérica */}
          <path d="M260,240 l40,10 l20,80 l-30,60 l-40,-40 z" />
          
          {/* Europa & Asia (Masa continental) */}
          <path d="M450,90 l50,-20 l100,0 l50,20 l20,50 l-40,30 l-80,0 l-60,-40 z" />
          <path d="M600,80 l80,-10 l120,30 l40,80 l-60,40 l-100,-20 z" />
          
          {/* África */}
          <path d="M460,190 l60,-10 l50,40 l10,80 l-50,60 l-70,-30 z" />
          
          {/* Australia */}
          <path d="M800,280 l60,10 l20,50 l-40,20 l-50,-30 z" />
          
          {/* Puntos de conexión "Tech" */}
          <circle cx="220" cy="140" r="3" /> <circle cx="280" cy="300" r="3" />
          <circle cx="500" cy="140" r="3" /> <circle cx="840" cy="300" r="3" />
          <circle cx="700" cy="150" r="3" /> <circle cx="520" cy="250" r="3" />
        </g>
        
        {/* Líneas de escáner decorativas */}
        <line x1="0" y1="50" x2="1000" y2="50" stroke={color} strokeWidth="0.5" opacity="0.2" />
        <line x1="0" y1="400" x2="1000" y2="400" stroke={color} strokeWidth="0.5" opacity="0.2" />
        <circle cx="500" cy="225" r="180" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="5 15" opacity="0.3">
          <animateTransform attributeName="transform" type="rotate" from="0 500 225" to="360 500 225" dur="120s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  )
}

// Partículas de fondo
const ParticlesBackground = ({ color }: { color: string }) => {
  const particles = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2
    }))
  , []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, 30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + p.speed,
            repeat: Infinity,
            delay: p.id * 0.05
          }}
        />
      ))}
    </div>
  );
};

// Hook para sonidos
const useSound = (src: string, volume = 0.3) => {
  const [audio] = useState(typeof Audio !== 'undefined' ? new Audio(src) : null);
  
  useEffect(() => {
    if (audio) {
      audio.volume = volume;
      audio.preload = 'auto';
    }
  }, [audio, volume]);

  const play = useCallback(() => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(console.log);
    }
  }, [audio]);

  return { play };
};

// --- 3. COMPONENTE PRINCIPAL ---

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState("All");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]); // Para depuración

  // Sonidos
  const { play: playHoverSound } = useSound('/sounds/hover.mp3', 0.2);
  const { play: playClickSound } = useSound('/sounds/click.mp3', 0.3);

  // Carga de datos
  useEffect(() => {
    // Traemos TODAS las fotos primero
    const query = `*[_type == "photo"] | order(_createdAt desc) { 
      _id, title, country, category, "imageUrl": image.asset->url 
    }`;
    
    client.fetch(query)
      .then((data) => {
        setPhotos(data);
        // Extraemos qué categorías existen realmente en Sanity para ayudarte a depurar
        const realCategories = Array.from(new Set(data.map((p: any) => p.category)));
        setAvailableCategories(realCategories as string[]);
      })
      .catch(console.error);
  }, []);

  // Lógica de filtrado y color
  const filtered = activeCat === "All" ? photos : photos.filter(p => p.category === activeCat);
  const themeColor = getThemeColor(activeCat);

  // Configuración de masonry
  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-16 relative overflow-x-hidden selection:bg-white/20 selection:text-black">
      
      {/* Marco Global Sutil */}
      <div className="fixed inset-0 border-[20px] border-transparent pointer-events-none z-50 transition-colors duration-1000" 
           style={{ borderImage: `linear-gradient(to bottom, ${themeColor}, transparent) 1`, opacity: 0.5 }} />

      {/* Partículas de fondo */}
      <ParticlesBackground color={themeColor} />

      {/* HEADER */}
      <header className="pt-12 pb-8 text-center relative z-10 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-8xl font-sans tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-6 drop-shadow-2xl">
          Dani Flamingo
        </h1>
        
        <div className="flex justify-center items-center gap-4 text-xl md:text-2xl tracking-[0.4em] font-light" 
             style={{ color: themeColor, textShadow: `0 0 20px ${themeColor}` }}>
          <span className="font-bold text-4xl"><Counter to={50} />+</span> COUNTRIES
        </div>
      </header>

      {/* ZONA DEL MAPA */}
      <div className="relative w-full h-[250px] md:h-[400px] mb-16 grayscale hover:grayscale-0 transition-all duration-1000">
        <ProfessionalMap color={themeColor} />
      </div>

      {/* MENÚ DE CATEGORÍAS */}
      <nav className="flex flex-wrap justify-center gap-6 md:gap-10 mb-20 max-w-6xl mx-auto px-4">
        {CATEGORIES.map(cat => {
          const isActive = activeCat === cat;
          const catColor = getThemeColor(cat);
          
          return (
            <button 
              key={cat} 
              onClick={() => {
                playClickSound();
                setActiveCat(cat);
              }}
              onMouseEnter={() => playHoverSound()}
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
          )
        })}
      </nav>

      {/* AVISO DE DEPURACIÓN (Solo sale si no hay fotos) */}
      {photos.length === 0 && (
        <div className="text-center p-8 border border-red-500 text-red-500 mb-10 max-w-2xl mx-auto bg-red-900/10">
          <p className="font-bold mb-2">⚠ NO SE VEN FOTOS</p>
          <p>Comprueba en Sanity.io Manage &gt; API &gt; CORS que esté añadido: <strong>http://localhost:3000</strong> con "Allow Credentials".</p>
        </div>
      )}

      {/* AVISO DE CATEGORÍA VACÍA (Si hay fotos pero el filtro falla) */}
      {photos.length > 0 && filtered.length === 0 && (
        <div className="text-center text-gray-500 mb-10">
          <p>No hay fotos en la categoría "{activeCat}".</p>
          <p className="text-xs mt-2">Categorías detectadas en tu Sanity: {availableCategories.join(", ")}</p>
        </div>
      )}

      {/* GALERÍA CON MASONRY */}
      <div className="max-w-7xl mx-auto pb-24">
        <AnimatePresence mode="popLayout">
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex gap-6"
            columnClassName="masonry-column"
          >
            {filtered.map((photo, i) => (
              <motion.div
                layout
                key={photo._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] bg-[#111] overflow-hidden border border-white/5 transition-all duration-500 group-hover:border-[color:var(--neon)]"
                     style={{ '--neon': themeColor } as any}>
                  
                  {/* Imagen con Next Image */}
                  <Image 
                    src={photo.imageUrl} 
                    alt={photo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAfEAACAQMFAQEAAAAAAAAAAAABAgMABAUGIWFRkfD/xAAVAQEBAAAAAAAAAAAAAAAAAAABAv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJtvVk5cubK2v2XzrJ6xY6j3hN4IrX2Kkw6XUc8k/cq0x9lG5t5mkuJpGk8i4QYHwUUFBX/2Q=="
                  />
                  
                  {/* Overlay Información */}
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
          </Masonry>
        </AnimatePresence>
      </div>
    </main>
  )
}
"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { client } from '@/lib/sanity'

// Interfaz segura
interface Photo { 
  _id: string; title: string; country?: string; imageUrl: string; category: string;
  location?: { lat: number; lng: number };
}

// TUS CATEGORÍAS EXACTAS (Sin 'Art')
const CATEGORIES = [
  "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", // Grupo AZUL
  "Sofia", "Sofia's Artwork" // Grupo ROSA
];

// Función para detectar si es Rosa o Azul
const isPink = (cat: string) => ["Sofia", "Sofia's Artwork"].includes(cat);

// Contador Animado Robusto
const Counter = ({ to }: { to: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => { animate(count, to, { duration: 2 }); }, [count, to]);
  return <motion.span>{rounded}</motion.span>;
};

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState("Beach"); // Empezamos en Beach para que haya color
  const [loading, setLoading] = useState(true);

  // Carga de datos con protección de errores
  useEffect(() => {
    const query = `*[_type == "photo"] | order(_createdAt desc) { 
      _id, title, country, category, location, "imageUrl": image.asset->url 
    }`;
    
    client.fetch(query)
      .then((data) => {
        console.log("Fotos cargadas:", data.length); // MIRA LA CONSOLA DEL NAVEGADOR
        setPhotos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando fotos:", err);
        setLoading(false);
      });
  }, []);

  // Lógica de filtrado y colores
  const filtered = activeCat === "All" ? photos : photos.filter(p => p.category === activeCat);
  const themeColor = isPink(activeCat) ? "#ff0099" : "#00f2ff"; // Rosa o Cian

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-12 relative overflow-x-hidden">
      <div className="global-frame" />
      
      {/* HEADER LIMPIO (Estilo tu imagen) */}
      <header className="pt-10 pb-4 text-center z-10 relative">
        <div className="flex justify-center items-center gap-6 mb-4">
           {/* Flamenco Izquierda (Solo decorativo) */}
           <img src="/logo.jpeg" className="w-16 opacity-80 drop-shadow-[0_0_15px_rgba(255,0,153,0.5)] hidden md:block" />
           
           <h1 className="text-4xl md:text-7xl font-sans tracking-tight text-white">
             Dani Flamingo Photography
           </h1>

           {/* Flamenco Derecha */}
           <img src="/logo.jpeg" className="w-16 opacity-80 drop-shadow-[0_0_15px_rgba(255,0,153,0.5)] hidden md:block" />
        </div>

        {/* CONTADOR DE PAÍSES */}
        <p className="text-xl tracking-[0.3em] font-light flex justify-center items-center gap-2 mb-8" style={{ color: themeColor }}>
          <span className="font-bold text-3xl flex"><Counter to={50} />+</span> COUNTRIES
        </p>
      </header>

      {/* MAPA DE PUNTOS PRO (Dotted World Map) */}
      <div className="relative w-full max-w-5xl mx-auto h-[250px] md:h-[400px] mb-12 flex justify-center items-center opacity-60 transition-colors duration-700"
           style={{ color: themeColor }}>
        
        {/* SVG REAL DE MAPA MUNDI DE PUNTOS */}
        <svg viewBox="0 0 1008 500" className="w-full h-full fill-current drop-shadow-[0_0_5px_currentColor]">
           {/* América */}
           <circle cx="200" cy="150" r="3" /><circle cx="210" cy="150" r="3" /><circle cx="220" cy="150" r="3" />
           <circle cx="190" cy="160" r="3" /><circle cx="200" cy="160" r="3" /><circle cx="210" cy="160" r="3" />
           <circle cx="200" cy="170" r="3" /><circle cx="230" cy="170" r="3" /><circle cx="240" cy="170" r="3" />
           <circle cx="250" cy="200" r="3" /><circle cx="260" cy="210" r="3" /><circle cx="270" cy="230" r="3" />
           <circle cx="280" cy="300" r="3" /><circle cx="290" cy="320" r="3" /><circle cx="300" cy="350" r="3" />
           
           {/* Europa / África */}
           <circle cx="500" cy="120" r="3" /><circle cx="510" cy="120" r="3" /><circle cx="520" cy="120" r="3" />
           <circle cx="490" cy="130" r="3" /><circle cx="500" cy="130" r="3" /><circle cx="530" cy="130" r="3" />
           <circle cx="500" cy="200" r="3" /><circle cx="510" cy="210" r="3" /><circle cx="530" cy="230" r="3" />
           <circle cx="520" cy="250" r="3" /><circle cx="540" cy="280" r="3" /><circle cx="550" cy="300" r="3" />
           
           {/* Asia */}
           <circle cx="700" cy="120" r="3" /><circle cx="710" cy="120" r="3" /><circle cx="720" cy="120" r="3" />
           <circle cx="750" cy="130" r="3" /><circle cx="760" cy="130" r="3" /><circle cx="780" cy="150" r="3" />
           <circle cx="800" cy="180" r="3" /><circle cx="820" cy="200" r="3" /><circle cx="850" cy="250" r="3" />

           {/* Efecto Radar giratorio */}
           <g className="origin-center animate-[spin_10s_linear_infinite]">
             <line x1="500" y1="250" x2="500" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.3" />
             <circle cx="500" cy="250" r="150" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
           </g>
        </svg>

        {/* Si no hay fotos, mostrar mensaje */}
        {photos.length === 0 && !loading && (
           <div className="absolute inset-0 flex items-center justify-center">
             <p className="bg-red-500/20 text-red-500 px-4 py-2 border border-red-500 rounded">
               ⚠️ No hay fotos cargadas. Revisa CORS en Sanity.
             </p>
           </div>
        )}
      </div>

      {/* MENÚ DE CATEGORÍAS (Estilo Texto Limpio como tu imagen) */}
      <nav className="flex justify-center flex-wrap gap-8 mb-16 max-w-4xl mx-auto">
        {CATEGORIES.map(cat => {
          const isActive = activeCat === cat;
          const color = isPink(cat) ? "#ff0099" : "#00f2ff";
          
          return (
            <button 
              key={cat} onClick={() => setActiveCat(cat)}
              className="text-lg md:text-xl tracking-wide transition-all duration-300 relative group"
              style={{ 
                color: color, 
                opacity: isActive ? 1 : 0.6,
                textShadow: isActive ? `0 0 20px ${color}` : 'none'
              }}
            >
              {cat}
              <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          )
        })}
      </nav>

      {/* GALERÍA */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo) => (
            <motion.div
              layout key={photo._id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="group cursor-pointer"
            >
              <div className="p-0.5 bg-gradient-to-br from-white/20 to-transparent group-hover:from-[var(--neon)] transition-all">
                <div className="relative aspect-[4/5] bg-gray-900 overflow-hidden">
                  <img src={photo.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-bold text-white uppercase">{photo.title}</p>
                    <p className="text-xs tracking-widest" style={{ color: themeColor }}>{photo.country}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </main>
  )
}
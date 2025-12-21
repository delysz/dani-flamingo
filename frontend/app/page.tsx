"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { client } from '@/lib/sanity'

// Interfaz
interface Photo { 
  _id: string; title: string; country?: string; imageUrl: string; category: string;
  location?: { lat: number; lng: number };
}

// Categorías (SOLO las que pediste)
const CATEGORIES = [
  "All", // IMPORTANTE: Para ver todas las fotos al entrar
  "Beach", "Street", "Plants", "People", "Animals", "Food", "Abstract", // Grupo CYAN
  "Sofia", "Sofia's Artwork" // Grupo ROSA
];

const isPink = (cat: string) => ["Sofia", "Sofia's Artwork"].includes(cat);

// Contador Animado
const Counter = ({ to }: { to: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => { animate(count, to, { duration: 2 }); }, [count, to]);
  return <motion.span>{rounded}</motion.span>;
};

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeCat, setActiveCat] = useState("All"); // EMPEZAMOS EN ALL PARA QUE NO SALGA VACÍO
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query más permisiva para evitar errores si falta location
    const query = `*[_type == "photo"] | order(_createdAt desc) { 
      _id, title, country, category, location, "imageUrl": image.asset->url 
    }`;
    
    client.fetch(query)
      .then((data) => {
        console.log("FOTOS RECIBIDAS DE SANITY:", data); // Mira la consola (F12) para ver qué llega
        setPhotos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching:", err);
      });
  }, []);

  const filtered = activeCat === "All" ? photos : photos.filter(p => p.category === activeCat);
  const themeColor = isPink(activeCat) ? "#ff0099" : "#00f2ff";

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-12 relative overflow-x-hidden">
      <div className="global-frame" />
      
      {/* HEADER */}
      <header className="pt-10 pb-8 text-center z-10 relative">
        <div className="flex justify-center items-center gap-4 mb-2">
           {/* Logo Izq */}
           <motion.img 
             initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}
             src="/logo.jpeg" className="w-16 hidden md:block rounded-full drop-shadow-[0_0_15px_rgba(0,242,255,0.5)]" 
           />
           
           <h1 className="text-4xl md:text-7xl font-sans tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
             Dani Flamingo Photography
           </h1>

           {/* Logo Der */}
           <motion.img 
             initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}
             src="/logo.jpeg" className="w-16 hidden md:block rounded-full drop-shadow-[0_0_15px_rgba(255,0,153,0.5)]" 
           />
        </div>

        <p className="text-xl tracking-[0.3em] font-light flex justify-center items-center gap-2 mb-8" style={{ color: themeColor }}>
          <span className="font-bold text-3xl flex"><Counter to={50} />+</span> COUNTRIES
        </p>
      </header>

      {/* MAPA DE PUNTOS REAL (SVG Geométrico) */}
      <div className="relative w-full max-w-5xl mx-auto h-[200px] md:h-[400px] mb-16 flex justify-center items-center transition-colors duration-700"
           style={{ color: themeColor }}>
        
        {/* Este SVG dibuja un mapamundi real con círculos */}
        <svg viewBox="0 0 1000 450" className="w-full h-full opacity-60 drop-shadow-[0_0_5px_currentColor]">
           <g fill="currentColor">
             {/* NORTEAMÉRICA */}
             <circle cx="150" cy="100" r="3"/><circle cx="170" cy="100" r="3"/><circle cx="190" cy="100" r="3"/>
             <circle cx="140" cy="120" r="3"/><circle cx="160" cy="120" r="3"/><circle cx="180" cy="120" r="3"/><circle cx="200" cy="120" r="3"/>
             <circle cx="150" cy="140" r="3"/><circle cx="170" cy="140" r="3"/><circle cx="190" cy="140" r="3"/><circle cx="210" cy="140" r="3"/>
             <circle cx="180" cy="160" r="3"/><circle cx="200" cy="160" r="3"/><circle cx="220" cy="160" r="3"/>
             {/* SUDAMÉRICA */}
             <circle cx="250" cy="250" r="3"/><circle cx="270" cy="250" r="3"/><circle cx="290" cy="250" r="3"/>
             <circle cx="260" cy="270" r="3"/><circle cx="280" cy="270" r="3"/><circle cx="300" cy="270" r="3"/>
             <circle cx="270" cy="290" r="3"/><circle cx="290" cy="290" r="3"/>
             <circle cx="280" cy="310" r="3"/>
             {/* EUROPA */}
             <circle cx="480" cy="100" r="3"/><circle cx="500" cy="100" r="3"/><circle cx="520" cy="100" r="3"/>
             <circle cx="470" cy="120" r="3"/><circle cx="490" cy="120" r="3"/><circle cx="510" cy="120" r="3"/><circle cx="530" cy="120" r="3"/>
             {/* ÁFRICA */}
             <circle cx="480" cy="180" r="3"/><circle cx="500" cy="180" r="3"/><circle cx="520" cy="180" r="3"/><circle cx="540" cy="180" r="3"/>
             <circle cx="490" cy="200" r="3"/><circle cx="510" cy="200" r="3"/><circle cx="530" cy="200" r="3"/>
             <circle cx="500" cy="220" r="3"/><circle cx="520" cy="220" r="3"/><circle cx="540" cy="220" r="3"/>
             <circle cx="510" cy="240" r="3"/><circle cx="530" cy="240" r="3"/>
             <circle cx="520" cy="260" r="3"/>
             {/* ASIA */}
             <circle cx="600" cy="100" r="3"/><circle cx="620" cy="100" r="3"/><circle cx="640" cy="100" r="3"/><circle cx="660" cy="100" r="3"/><circle cx="680" cy="100" r="3"/>
             <circle cx="580" cy="120" r="3"/><circle cx="600" cy="120" r="3"/><circle cx="620" cy="120" r="3"/><circle cx="640" cy="120" r="3"/><circle cx="660" cy="120" r="3"/><circle cx="680" cy="120" r="3"/><circle cx="700" cy="120" r="3"/>
             <circle cx="600" cy="140" r="3"/><circle cx="620" cy="140" r="3"/><circle cx="640" cy="140" r="3"/><circle cx="660" cy="140" r="3"/><circle cx="680" cy="140" r="3"/><circle cx="700" cy="140" r="3"/>
             <circle cx="620" cy="160" r="3"/><circle cx="640" cy="160" r="3"/><circle cx="660" cy="160" r="3"/><circle cx="680" cy="160" r="3"/>
             <circle cx="630" cy="180" r="3"/><circle cx="650" cy="180" r="3"/>
             {/* AUSTRALIA */}
             <circle cx="800" cy="280" r="3"/><circle cx="820" cy="280" r="3"/><circle cx="840" cy="280" r="3"/>
             <circle cx="810" cy="300" r="3"/><circle cx="830" cy="300" r="3"/>
           </g>
           
           {/* Anillo Orbital Giratorio */}
           <circle cx="500" cy="225" r="180" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3">
             <animateTransform attributeName="transform" type="rotate" from="0 500 225" to="360 500 225" dur="60s" repeatCount="indefinite"/>
           </circle>
        </svg>

        {/* Mensaje si no hay fotos */}
        {photos.length === 0 && !loading && (
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
             <p className="text-red-500 bg-black/50 p-4 border border-red-500">
               ⚠️ 0 Fotos encontradas.<br/>Revisa que las categorías en Sanity coincidan con el menú.
             </p>
           </div>
        )}
      </div>

      {/* MENÚ DE CATEGORÍAS */}
      <nav className="flex justify-center flex-wrap gap-6 md:gap-10 mb-16 max-w-6xl mx-auto px-4">
        {CATEGORIES.map(cat => {
          const isActive = activeCat === cat;
          const isPinkCat = isPink(cat);
          // Si está activo, usa su color. Si no, blanco apagado.
          const color = isActive 
            ? (isPinkCat ? "#ff0099" : "#00f2ff") 
            : "rgba(255,255,255,0.6)";
          
          return (
            <button 
              key={cat} onClick={() => setActiveCat(cat)}
              className="text-sm md:text-xl tracking-wide transition-all duration-300 relative hover:text-white"
              style={{ 
                color: color, 
                textShadow: isActive ? `0 0 15px ${color}` : 'none',
                fontWeight: isActive ? 'bold' : 'normal'
              }}
            >
              {cat}
            </button>
          )
        })}
      </nav>

      {/* GALERÍA */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 max-w-7xl mx-auto">
        <AnimatePresence mode="popLayout">
          {filtered.map((photo, i) => (
            <motion.div
              layout key={photo._id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="group cursor-pointer"
            >
              {/* Contenedor con borde neón al hover */}
              <div className="p-0.5 transition-all duration-500 bg-transparent group-hover:bg-gradient-to-tr"
                   style={{ 
                     backgroundImage: `linear-gradient(to top right, ${themeColor}, transparent)` 
                   }}>
                
                <div className="relative aspect-[4/5] bg-[#0a0a0a] overflow-hidden">
                  <img src={photo.imageUrl} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                  
                  {/* Overlay Info */}
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-bold uppercase text-lg">{photo.title}</p>
                    <p className="text-xs tracking-widest mt-1" style={{ color: themeColor }}>
                      {photo.country || "WORLDWIDE"}
                    </p>
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
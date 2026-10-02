import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, ArrowRight, Shield, ChevronRight } from 'lucide-react';

interface LocationModalProps {
  onLocationSubmit: (location: string) => void;
}

const CITIES = [
  { name: 'Bhopal', image: '/images/hero.jpg' },
  { name: 'Delhi', image: '/images/delhi.jpg' },
  { name: 'Mumbai', image: '/images/mumbai.jpg' },
  { name: 'Bengaluru', image: '/images/bengaluru.jpg' },
  { name: 'Hyderabad', image: '/images/hyderabad.jpg' },
  { name: 'Pune', image: '/images/pune.jpg' },
];

export function LocationModal({ onLocationSubmit }: LocationModalProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onLocationSubmit(input.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent"
    >
      {/* Decorative Top Nav (matches reference) */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center pointer-events-none hidden md:flex z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">ClimaGuard</h1>
            <p className="text-xs text-gray-400 font-medium leading-none">Policy-Grounded Weather Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-gray-300">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> Live weather data</span>
          <span>•</span>
          <span>15 policies</span>
          <span>•</span>
          <span>AI-powered guidance</span>
        </div>
      </div>

      {/* FLOATING 3D WEATHER CARDS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden xl:block">
        
        {/* Top Left: Bhopal */}
        <motion.div 
          initial={{ opacity: 0, x: -50, y: -50 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.2, duration: 1 }}
          className="absolute top-[15%] left-[10%] w-[220px] rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(34,211,238,0.2)] overflow-hidden bg-black/40 backdrop-blur-md"
          style={{ transform: 'perspective(1000px) rotateY(15deg) rotateX(5deg)' }}
        >
          <div className="h-[120px] bg-cover bg-center" style={{ backgroundImage: `url(${CITIES[0].image})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <p className="text-[11px] text-gray-300 font-medium leading-none mb-1">Bhopal</p>
            <p className="text-2xl font-bold text-white leading-none mb-1">28°</p>
            <p className="text-[10px] text-gray-400">Clear sky</p>
          </div>
        </motion.div>

        {/* Bottom Left: Mumbai */}
        <motion.div 
          initial={{ opacity: 0, x: -50, y: 50 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.4, duration: 1 }}
          className="absolute bottom-[20%] left-[15%] w-[200px] rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(34,211,238,0.2)] overflow-hidden bg-black/40 backdrop-blur-md"
          style={{ transform: 'perspective(1000px) rotateY(20deg) rotateX(-5deg)' }}
        >
          <div className="h-[110px] bg-cover bg-center" style={{ backgroundImage: `url(${CITIES[2].image})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <p className="text-[11px] text-gray-300 font-medium leading-none mb-1">Mumbai</p>
            <p className="text-2xl font-bold text-white leading-none mb-1">32°</p>
            <p className="text-[10px] text-gray-400">Humid</p>
          </div>
        </motion.div>

        {/* Top Right: Delhi */}
        <motion.div 
          initial={{ opacity: 0, x: 50, y: -50 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.3, duration: 1 }}
          className="absolute top-[12%] right-[12%] w-[220px] rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(34,211,238,0.2)] overflow-hidden bg-black/40 backdrop-blur-md"
          style={{ transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)' }}
        >
          <div className="h-[120px] bg-cover bg-center" style={{ backgroundImage: `url(${CITIES[1].image})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <p className="text-[11px] text-gray-300 font-medium leading-none mb-1">Delhi</p>
            <p className="text-2xl font-bold text-white leading-none mb-1">24°</p>
            <p className="text-[10px] text-gray-400">Haze</p>
          </div>
        </motion.div>

        {/* Mid Right: Bengaluru */}
        <motion.div 
          initial={{ opacity: 0, x: 50, y: 0 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.5, duration: 1 }}
          className="absolute top-[40%] right-[5%] w-[180px] rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(34,211,238,0.2)] overflow-hidden bg-black/40 backdrop-blur-md"
          style={{ transform: 'perspective(1000px) rotateY(-25deg) rotateX(10deg)' }}
        >
          <div className="h-[100px] bg-cover bg-center" style={{ backgroundImage: `url(${CITIES[3].image})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <p className="text-[11px] text-gray-300 font-medium leading-none mb-1">Bengaluru</p>
            <p className="text-xl font-bold text-white leading-none mb-1">26°</p>
            <p className="text-[10px] text-gray-400">Cloudy</p>
          </div>
        </motion.div>

        {/* Bottom Right: Hyderabad */}
        <motion.div 
          initial={{ opacity: 0, x: 50, y: 50 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.6, duration: 1 }}
          className="absolute bottom-[15%] right-[15%] w-[230px] rounded-2xl border border-white/20 shadow-[0_0_30px_rgba(34,211,238,0.2)] overflow-hidden bg-black/40 backdrop-blur-md"
          style={{ transform: 'perspective(1000px) rotateY(-15deg) rotateX(-5deg)' }}
        >
          <div className="h-[130px] bg-cover bg-center" style={{ backgroundImage: `url(${CITIES[4].image})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <p className="text-[11px] text-gray-300 font-medium leading-none mb-1">Hyderabad</p>
            <p className="text-2xl font-bold text-white leading-none mb-1">30°</p>
            <p className="text-[10px] text-gray-400">Partly cloudy</p>
          </div>
        </motion.div>

      </div>

      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-full max-w-2xl relative"
      >
        {/* Glow behind the modal */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-30" />
        
        <div className="relative bg-[#02040A]/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-10 md:p-14 shadow-2xl overflow-hidden">
          
          {/* Radar lines in background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full pointer-events-none" />

          <div className="flex flex-col items-center text-center relative z-10">
            
            {/* Glowing Map Pin */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="w-20 h-20 rounded-full border border-cyan-400/50 bg-blue-900/40 flex items-center justify-center relative">
                <div className="w-14 h-14 rounded-full border border-cyan-300/30 bg-blue-600/20 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Where are <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">you</span>?
            </h2>
            <p className="text-gray-300 text-lg mb-10">
              Set your city to get started with personalized weather guidance.
            </p>

            <form onSubmit={handleSubmit} className="w-full relative mb-10 group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
               <div className="relative flex items-center bg-[#050A16] rounded-2xl border border-cyan-500/50 p-2">
                 <div className="pl-4 pr-3 text-cyan-400">
                   <Search className="w-6 h-6" />
                 </div>
                 <input
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   placeholder="Search for your city (e.g. Bhopal, New York, Tokyo...)"
                   className="flex-1 bg-transparent text-white px-2 py-3 text-lg outline-none placeholder:text-gray-500"
                   autoFocus
                 />
                 <button
                   type="submit"
                   disabled={!input.trim()}
                   className="w-14 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50"
                 >
                   <ArrowRight className="w-6 h-6" />
                 </button>
               </div>
            </form>

            <div className="w-full text-left">
              <p className="text-sm text-gray-400 mb-4 font-medium">Popular cities</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CITIES.map((city: any) => (
                  <button
                    key={city.name}
                    onClick={() => onLocationSubmit(city.name)}
                    className="flex items-center p-1.5 pr-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-cyan-500/50 transition-all group"
                  >
                    <div 
                      className="w-16 h-12 rounded-lg bg-cover bg-center opacity-80 group-hover:opacity-100 transition-opacity mr-3 flex-shrink-0 border border-white/10" 
                      style={{ backgroundImage: `url(${city.image})` }} 
                    />
                    <MapPin className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
                    <span className="text-sm font-bold text-gray-200 group-hover:text-white flex-1 text-left">{city.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
               <Shield className="w-4 h-4 text-blue-500/70" />
               Your location helps us provide accurate, policy-grounded weather advice.
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

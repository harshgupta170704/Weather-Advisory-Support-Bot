import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, ArrowRight } from 'lucide-react';

interface LocationModalProps {
  onLocationSubmit: (location: string) => void;
}

const CITIES = ['Bhopal', 'Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune'];

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050A16]/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-2xl bg-[#090D1A] border border-white/5 rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-start max-w-xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0F1B33] flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <MapPin className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Where are you?
            </h2>
          </div>
          
          <p className="text-gray-400 text-[15px] mb-8 font-medium">
            Set your city to get started with personalized weather guidance.
          </p>

          <form onSubmit={handleSubmit} className="w-full mb-10">
             <div className="flex items-center bg-[#050811] rounded-2xl border border-white/5 p-1.5 focus-within:border-cyan-500/30 focus-within:bg-[#070C1A] transition-colors shadow-inner">
               <div className="pl-4 pr-3 text-cyan-500/70">
                 <MapPin className="w-5 h-5" />
               </div>
               <input
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="Search for your city (e.g. Bhopal, New York, Tokyo...)"
                 className="flex-1 bg-transparent text-white px-2 py-3.5 outline-none placeholder:text-gray-600 font-medium"
                 autoFocus
               />
               <button
                 type="submit"
                 disabled={!input.trim()}
                 className="w-12 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
               >
                 <ArrowRight className="w-5 h-5" />
               </button>
             </div>
          </form>

          <div className="flex flex-wrap gap-3">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => onLocationSubmit(city)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all text-sm font-medium text-gray-300 hover:text-white group"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-500/70 group-hover:text-cyan-400 transition-colors" />
                {city}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

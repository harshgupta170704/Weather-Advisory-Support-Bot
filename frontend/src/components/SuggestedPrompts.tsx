import { Bike, TreePine, Heart, Car } from 'lucide-react';
import { motion } from 'framer-motion';

const PROMPTS = [
  { text: "Can I cycle in Bhopal today?", category: "OUTDOOR EXERCISE", icon: Bike, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", hover: "hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]" },
  { text: "Is it good for a picnic this evening?", category: "LEISURE", icon: TreePine, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", hover: "hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]" },
  { text: "Can my child go to the park?", category: "FAMILY", icon: Heart, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30", hover: "hover:border-fuchsia-400 hover:shadow-[0_0_20px_rgba(217,70,239,0.2)]" },
  { text: "Should I commute by bike today?", category: "TRAVEL", icon: Car, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", hover: "hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]" },
];

export function SuggestedPrompts({ onSelect }: { onSelect: (p: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {PROMPTS.map((p, i) => {
        const Icon = p.icon;
        return (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(p.text)}
            className={`flex flex-col text-left p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border ${p.border} ${p.hover} transition-all group h-[140px]`}
          >
            <div className="flex items-start justify-between mb-auto w-full">
              <Icon className={`w-5 h-5 ${p.color}`} strokeWidth={2} />
              <span className={`text-[9px] font-bold tracking-widest uppercase ${p.color}`}>{p.category}</span>
            </div>
            
            <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors leading-snug mt-2">
              {p.text}
            </p>
            
            <div className="flex justify-end w-full mt-2">
               <span className={`text-sm leading-none transition-transform group-hover:translate-x-1 ${p.color}`}>→</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

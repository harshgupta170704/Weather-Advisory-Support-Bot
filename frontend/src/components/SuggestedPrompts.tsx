import { Bike, TreePine, Baby, Map } from 'lucide-react';
import { motion } from 'framer-motion';

const PROMPTS = [
  { text: "Can I cycle in Bhopal today?", category: "Outdoor Exercise", icon: Bike, color: "text-cyan-400", border: "border-cyan-500/30", hoverBorder: "group-hover:border-cyan-400", glow: "group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]" },
  { text: "Is it good for a picnic this evening?", category: "Leisure", icon: TreePine, color: "text-emerald-400", border: "border-emerald-500/30", hoverBorder: "group-hover:border-emerald-400", glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]" },
  { text: "Can my child go to the park?", category: "Family & Kids", icon: Baby, color: "text-fuchsia-400", border: "border-fuchsia-500/30", hoverBorder: "group-hover:border-fuchsia-400", glow: "group-hover:shadow-[0_0_20px_rgba(217,70,239,0.2)]" },
  { text: "Should I commute by bike today?", category: "Travel", icon: Map, color: "text-yellow-400", border: "border-yellow-500/30", hoverBorder: "group-hover:border-yellow-400", glow: "group-hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]" },
];

export function SuggestedPrompts({ onSelect }: { onSelect: (p: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {PROMPTS.map((p, i) => {
        const Icon = p.icon;
        return (
          <motion.button
            key={i}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(p.text)}
            className={`flex flex-col text-left p-5 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/5 transition-all group relative overflow-hidden ${p.glow}`}
          >
            <div className={`absolute inset-0 border-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${p.hoverBorder}`} />
            
            <div className="flex items-center justify-between mb-4 w-full">
              <Icon className={`w-6 h-6 ${p.color}`} />
            </div>
            <p className="text-[15px] font-semibold text-gray-200 group-hover:text-white transition-colors leading-snug mb-2">
              {p.text}
            </p>
            <div className="flex items-center justify-between w-full mt-auto pt-2">
               <span className="text-[11px] font-medium text-gray-500">{p.category}</span>
               <span className={`text-lg leading-none transition-transform group-hover:translate-x-1 ${p.color}`}>→</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

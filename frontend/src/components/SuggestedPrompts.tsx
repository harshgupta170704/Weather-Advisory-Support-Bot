import { Bike, TreePine, Baby, Car } from 'lucide-react';
import { motion } from 'framer-motion';

const PROMPTS = [
  { text: "Can I cycle in Bhopal today?", icon: Bike, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { text: "Is it good for a picnic this evening?", icon: TreePine, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { text: "Can my child go to the park?", icon: Baby, color: "text-rose-400", bg: "bg-rose-500/10" },
  { text: "Should I commute by bike today?", icon: Car, color: "text-blue-400", bg: "bg-blue-500/10" },
];

export function SuggestedPrompts({ onSelect }: { onSelect: (p: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {PROMPTS.map((p, i) => {
        const Icon = p.icon;
        return (
          <motion.button
            key={i}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(p.text)}
            className="flex items-center gap-4 p-4 rounded-2xl glass text-left hover:bg-white/[0.06] hover:border-cyan-500/30 transition-colors group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/5 ${p.bg}`}>
              <Icon className={`w-6 h-6 ${p.color}`} />
            </div>
            <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors leading-relaxed">
              {p.text}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}

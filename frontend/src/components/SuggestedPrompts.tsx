import { motion } from 'framer-motion';
import {
  Bike, TreePine, Baby, Route, Heart, Car,
} from 'lucide-react';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  { text: 'Can I cycle in Bhopal today?', icon: Bike, color: 'from-sky-500/20 to-cyan-500/20', iconColor: 'text-sky-400' },
  { text: 'Is it good for a picnic this evening?', icon: TreePine, color: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-400' },
  { text: 'Can my child go to the park?', icon: Baby, color: 'from-violet-500/20 to-purple-500/20', iconColor: 'text-violet-400' },
  { text: 'Should I commute by bike today?', icon: Route, color: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-400' },
  { text: 'Can my elderly parents go for a walk?', icon: Heart, color: 'from-rose-500/20 to-pink-500/20', iconColor: 'text-rose-400' },
  { text: 'Is it safe to travel this afternoon?', icon: Car, color: 'from-indigo-500/20 to-blue-500/20', iconColor: 'text-indigo-400' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl"
    >
      {PROMPTS.map((prompt, idx) => (
        <motion.button
          key={idx}
          variants={item}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(prompt.text)}
          className="group relative flex items-start gap-3 p-4 rounded-2xl glass glass-hover text-left transition-all duration-300"
        >
          {/* Hover glow */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${prompt.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

          <div className={`relative z-10 w-9 h-9 rounded-xl bg-gradient-to-br ${prompt.color} flex items-center justify-center flex-shrink-0 border border-white/[0.06]`}>
            <prompt.icon className={`w-4 h-4 ${prompt.iconColor}`} />
          </div>
          <span className="relative z-10 text-[13px] text-white/60 group-hover:text-white/90 leading-snug font-medium transition-colors pt-1.5">
            {prompt.text}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}

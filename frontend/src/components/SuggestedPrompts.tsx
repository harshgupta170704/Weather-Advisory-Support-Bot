import React from 'react';
import { motion } from 'framer-motion';
import { Bike, TreePine, Baby, Route, Heart, Car } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

const PROMPTS = [
  { text: 'Can I cycle in Bhopal today?', icon: Bike },
  { text: 'Is it good for a picnic this evening?', icon: TreePine },
  { text: 'Can my child go to the park?', icon: Baby },
  { text: 'Should I commute by bike today?', icon: Route },
  { text: 'Can my elderly parents go for a walk?', icon: Heart },
  { text: 'Is it safe to travel this afternoon?', icon: Car },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4"
    >
      {PROMPTS.map((prompt, idx) => (
        <motion.button
          key={idx}
          variants={item}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(prompt.text)}
          className="flex flex-col items-center justify-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-center transition-colors group h-32"
        >
          <div className="bg-cyan-950/50 p-3 rounded-full mb-3 group-hover:bg-cyan-900/50 transition-colors">
            <prompt.icon className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-sm font-medium text-gray-300 group-hover:text-white">
            {prompt.text}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}

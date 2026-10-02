import { motion } from 'framer-motion';
import { AIOrb } from './AIOrb';
import { SuggestedPrompts } from './SuggestedPrompts';
import { Shield, Cloud, FileText, MessageSquare, Paperclip, Send } from 'lucide-react';
import { useState } from 'react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const [input, setInput] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-between h-full w-full max-w-5xl mx-auto pt-16 pb-8"
    >
      <div className="flex flex-col items-center flex-1 w-full mt-10">
        <motion.div variants={itemVariants} className="mb-4 flex flex-col items-center">
          <AIOrb state="idle" size="hero" />
          <div className="mt-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md text-xs text-gray-400 font-medium tracking-wide">
            Your AI Weather Assistant
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold text-white text-center mb-2 tracking-tight">
          Weather decisions,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
            grounded in policy.
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-gray-300 font-medium text-lg text-center mb-10">
          Live conditions. Explicit policies. No guessing.
        </motion.p>

        <motion.div variants={itemVariants} className="flex justify-center gap-8 mb-12">
          <FeaturePill icon={Shield} text="Policy-backed advice" />
          <FeaturePill icon={Cloud} text="Live weather data" />
          <FeaturePill icon={FileText} text="Transparent SOPs" />
          <FeaturePill icon={MessageSquare} text="Conversational memory" />
        </motion.div>

        <motion.div variants={itemVariants} className="w-full flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded flex items-center justify-center text-cyan-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
          </div>
          <h3 className="text-lg font-bold text-white">Try asking</h3>
        </motion.div>
        
        <motion.div variants={itemVariants} className="w-full">
          <SuggestedPrompts onSelect={onSelectPrompt} />
        </motion.div>
      </div>

      {/* Input Area */}
      <motion.div variants={itemVariants} className="w-full max-w-3xl mt-12 mb-2">
        <div className="relative flex items-center bg-[#050A16]/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <button className="p-3 text-gray-400 hover:text-white transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) onSelectPrompt(input);
            }}
            placeholder="Ask about an outdoor activity..."
            className="flex-1 bg-transparent text-gray-200 px-2 py-3 outline-none placeholder:text-gray-500 text-sm"
          />
          
          <button
            onClick={() => input.trim() && onSelectPrompt(input)}
            disabled={!input.trim()}
            className="w-12 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <p className="text-center text-[10px] text-gray-500 mt-4">
          Powered by Open-Meteo live data · Responses grounded in SOPs
        </p>
      </motion.div>
    </motion.div>
  );
}

function FeaturePill({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center max-w-[100px]">
      <div className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-center">
        <Icon className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
      </div>
      <p className="text-[11px] font-medium text-gray-300 leading-tight">
        {text.split(' ').map((w,i) => <span key={i}>{w}<br/></span>)}
      </p>
    </div>
  );
}

import { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { SendHorizontal, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (canSend) {
      onSend(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  return (
    <div className="relative">
      {/* Outer glow on focus */}
      <div className={`absolute -inset-1 rounded-[22px] bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-sky-500/20 opacity-0 blur-lg transition-opacity duration-500 ${text ? 'opacity-100' : ''}`} />

      <div className="relative rounded-2xl glass border border-white/[0.08] overflow-hidden transition-all duration-300 focus-within:border-sky-500/20">
        <div className="flex items-end">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask about an outdoor activity..."
            className="flex-1 max-h-[140px] min-h-[52px] bg-transparent text-white/90 placeholder-white/20 resize-none py-4 pl-5 pr-3 text-[14px] leading-relaxed focus:outline-none"
            rows={1}
          />
          <div className="p-2">
            <motion.button
              whileHover={canSend ? { scale: 1.05 } : {}}
              whileTap={canSend ? { scale: 0.95 } : {}}
              onClick={handleSend}
              disabled={!canSend}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                canSend
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40'
                  : 'bg-white/[0.04] text-white/15'
              }`}
            >
              {disabled ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SendHorizontal className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-white/15 mt-2.5 font-medium">
        Powered by Open-Meteo live data · Responses grounded in SOPs
      </p>
    </div>
  );
}

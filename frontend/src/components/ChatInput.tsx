import { useState, useRef, useEffect } from 'react';
import { SendHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative group w-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 rounded-3xl blur-md opacity-30 group-focus-within:opacity-60 transition duration-500" />
      
      <div className="relative flex items-end bg-[#0a0e1a]/90 rounded-3xl border border-white/10 shadow-inner p-2 focus-within:border-cyan-500/40 transition-colors">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about an outdoor activity..."
          className="flex-1 bg-transparent text-white px-4 py-3 max-h-[120px] outline-none resize-none placeholder:text-gray-500 text-[15px]"
          rows={1}
        />
        
        <motion.button
          whileHover={{ scale: disabled || !input.trim() ? 1 : 1.05 }}
          whileTap={{ scale: disabled || !input.trim() ? 1 : 0.95 }}
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className={`mb-1 mr-1 p-3 rounded-full flex items-center justify-center transition-all ${
            input.trim() && !disabled
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_-3px_rgba(34,211,238,0.4)]'
              : 'bg-white/5 text-gray-500'
          }`}
        >
          <SendHorizontal className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

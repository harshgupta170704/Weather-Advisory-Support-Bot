import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="relative">
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileFocus={{ scale: 1.01 }}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-end p-2 shadow-lg"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about an outdoor activity..."
          className="flex-1 max-h-[120px] min-h-[44px] bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 resize-none py-3 px-4 text-sm"
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className={`p-3 rounded-xl m-1 transition-colors flex-shrink-0 ${
            text.trim() && !disabled
              ? 'bg-cyan-500 hover:bg-cyan-400 text-white'
              : 'bg-white/5 text-gray-500'
          }`}
        >
          <SendHorizontal className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}

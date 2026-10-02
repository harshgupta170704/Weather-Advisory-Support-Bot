import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '@/types';
import { PolicyTrace } from './PolicyTrace';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
          isUser ? 'bg-cyan-900/50 text-cyan-400 ml-3' : 'bg-white/10 text-white mr-3'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4 text-cyan-400" />}
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-medium text-gray-400">
              {isUser ? 'You' : 'ClimaGuard'}
            </span>
            {message.timestamp && (
              <span className="text-[10px] text-gray-600">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-cyan-600/20 text-white border border-cyan-500/20 rounded-tr-sm' 
              : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-sm'
          }`}>
            {message.isLoading ? (
              <div className="flex space-x-1.5 h-6 items-center px-2">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-cyan-400">
                {isUser ? (
                  <p>{message.content}</p>
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
              </div>
            )}
          </div>

          {!isUser && message.response?.trace && (
            <div className="w-full mt-2">
              <PolicyTrace 
                trace={message.response.trace} 
                selectedSop={message.response.selected_sop || null}
                matchingSops={message.response.matching_sops || []}
                status={message.response.status || 'ok'}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

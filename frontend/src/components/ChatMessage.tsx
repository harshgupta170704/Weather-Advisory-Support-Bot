import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '@/types';
import { PolicyTrace } from './PolicyTrace';
import { AIOrb } from './AIOrb';
import { Thermometer, Wind, CloudRain, Sun } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex w-full max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-10 h-10 rounded-full bg-cyan-900/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
              U
            </div>
          ) : (
            <AIOrb state={message.isLoading ? 'thinking' : 'idle'} size="md" />
          )}
        </div>
        
        {/* Message Content */}
        <div className={`flex flex-col min-w-0 flex-1 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-[13px] font-semibold text-gray-300">
              {isUser ? 'You' : 'ClimaGuard'}
            </span>
            {message.timestamp && (
              <span className="text-[11px] text-gray-500 font-medium">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          
          <div className={`px-5 py-4 rounded-2xl ${
            isUser 
              ? 'bg-cyan-950/40 text-white border border-cyan-500/10 rounded-tr-sm shadow-sm' 
              : 'bg-white/[0.03] text-gray-200 border border-white/5 rounded-tl-sm w-full shadow-sm'
          }`}>
            {message.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-cyan-400/70 py-1">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>Checking live conditions...</motion.div>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-img:w-full prose-img:max-h-72 prose-img:object-cover prose-headings:text-white prose-strong:text-white">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}

            {/* Inline Weather Chips if available and it's assistant */}
            {!isUser && message.response?.weather && (
              <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                <WeatherChip icon={Thermometer} label={`${message.response.weather.temperature_c}°C`} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
                <WeatherChip icon={CloudRain} label={`${message.response.weather.precipitation_mm} mm (${message.response.weather.precipitation_probability}%)`} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
                <WeatherChip icon={Wind} label={`${message.response.weather.wind_speed_kmh} km/h`} color="text-sky-400" bg="bg-sky-500/10" border="border-sky-500/20" />
                <WeatherChip icon={Sun} label={`UV ${message.response.weather.uv_index}`} color="text-violet-400" bg="bg-violet-500/10" border="border-violet-500/20" />
              </div>
            )}
            
            {/* Selected SOP Badge */}
            {!isUser && message.response?.selected_sop && (
              <div className="mt-4 flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5 w-fit">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-gray-300">{message.response.selected_sop.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getSeverityClass(message.response.selected_sop.severity)}`}>
                  {message.response.selected_sop.severity} RISK
                </span>
              </div>
            )}
          </div>

          {!isUser && message.response?.trace && (
            <div className="w-full mt-3">
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

function WeatherChip({ icon: Icon, label, color, bg, border }: any) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${bg} ${border}`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-[11px] font-medium text-gray-300">{label}</span>
    </div>
  );
}

import { Shield } from 'lucide-react';

function getSeverityClass(severity: string) {
  switch (severity.toUpperCase()) {
    case 'LOW': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    case 'MODERATE': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'HIGH': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    case 'CRITICAL': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

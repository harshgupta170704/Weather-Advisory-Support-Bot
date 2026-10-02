// ClimaGuard — Main Application Component

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { WeatherPanel } from '@/components/WeatherPanel';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { SuggestedPrompts } from '@/components/SuggestedPrompts';
import { useChat } from '@/hooks/useChat';
import { checkHealth } from '@/api/client';
import { LocationModal } from '@/components/LocationModal';

export default function App() {
  const { messages, isLoading, lastResponse, send, clearSession } = useChat();
  const [isConnected, setIsConnected] = useState(false);
  const [sopsLoaded, setSopsLoaded] = useState(0);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Health check on mount
  useEffect(() => {
    const check = async () => {
      try {
        const health = await checkHealth();
        setIsConnected(health.status === 'healthy');
        setSopsLoaded(health.sops_loaded);
      } catch {
        setIsConnected(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const weather = lastResponse?.weather ?? null;
  const location = lastResponse?.location ?? null;
  const hasMessages = messages.length > 0;

  const handleSend = (content: string) => {
    send(content, userLocation);
  };

  return (
    <div className="min-h-screen bg-navy-900 relative">
      <AnimatePresence>
        {!userLocation && (
          <LocationModal onLocationSubmit={setUserLocation} />
        )}
      </AnimatePresence>

      {/* Aurora background */}
      <div className="aurora-bg" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-screen pt-16">
        {/* Header */}
        <Header
          isConnected={isConnected}
          sopsLoaded={sopsLoaded}
          userLocation={userLocation}
          onChangeLocation={() => {
            setUserLocation(null);
            clearSession();
          }}
          onClearSession={clearSession}
        />

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages or Hero */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
              <AnimatePresence mode="wait">
                {!hasMessages ? (
                  <motion.div
                    key="hero"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto"
                  >
                    {/* Hero icon */}
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="mb-8"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                        <Shield className="w-10 h-10 text-cyan-400" />
                      </div>
                    </motion.div>

                    {/* Hero text */}
                    <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
                      Weather decisions,{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                        grounded in policy
                      </span>
                    </h1>
                    <p className="text-gray-400 text-center text-lg mb-2">
                      Live conditions. Explicit policies. No guessing.
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-10">
                      <Sparkles className="w-4 h-4" />
                      <span>Powered by Open-Meteo live data & deterministic SOPs</span>
                    </div>

                    {/* Suggested prompts */}
                    <SuggestedPrompts onSelect={handleSend} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-3xl mx-auto space-y-1"
                  >
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="px-4 md:px-8 pb-4 md:pb-6">
              <div className="max-w-3xl mx-auto">
                <ChatInput onSend={handleSend} disabled={isLoading} />
              </div>
            </div>
          </div>

          {/* Weather panel — hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block w-80 xl:w-96 border-l border-white/5 overflow-y-auto">
            <WeatherPanel weather={weather} location={location} />
          </div>
        </div>
      </div>
    </div>
  );
}

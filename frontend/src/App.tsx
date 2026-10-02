import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TopNav } from '@/components/TopNav';
import { Sidebar } from '@/components/Sidebar';
import { WeatherPanel } from '@/components/WeatherPanel';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/EmptyState';
import { LocationModal } from '@/components/LocationModal';
import { AtmosphericBackground } from '@/components/AtmosphericBackground';
import { useChat } from '@/hooks/useChat';
import { checkHealth } from '@/api/client';

export default function App() {
  const { messages, isLoading, lastResponse, send, clearSession } = useChat();
  const [isConnected, setIsConnected] = useState(false);
  const [sopsLoaded, setSopsLoaded] = useState(0);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const weather = lastResponse?.weather ?? null;
  const location = lastResponse?.location ?? null;
  const hasMessages = messages.length > 0;

  const handleSend = (content: string) => {
    send(content, userLocation);
  };

  const handleNewChat = () => {
    clearSession();
  };

  return (
    <div className="h-screen bg-transparent relative text-gray-200 font-sans overflow-hidden">
      <AtmosphericBackground />

      <AnimatePresence>
        {!userLocation && (
          <LocationModal onLocationSubmit={setUserLocation} />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex h-full max-w-[1920px] mx-auto w-full">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-72 h-full flex-shrink-0">
          <Sidebar onNewChat={handleNewChat} />
        </div>

        {/* Center Main Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative border-l border-white/5">
          <TopNav
            isConnected={isConnected}
            sopsLoaded={sopsLoaded}
            userLocation={userLocation}
            onChangeLocation={() => {
              setUserLocation(null);
              clearSession();
            }}
          />

          <div className="flex-1 overflow-y-auto px-4 md:px-8 xl:px-12 pb-6 relative z-10 flex flex-col">
            <AnimatePresence mode="wait">
              {!hasMessages ? (
                <EmptyState key="empty" onSelectPrompt={handleSend} />
              ) : (
                <div key="chat" className="max-w-4xl mx-auto pt-6 pb-24 w-full flex-1">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area (Only show in chat mode) */}
          {hasMessages && (
            <div className="px-4 md:px-8 xl:px-12 pb-6 pt-2 bg-gradient-to-t from-[#02050E] via-[#02050E]/90 to-transparent relative z-20">
              <div className="max-w-4xl mx-auto">
                <ChatInput onSend={handleSend} disabled={isLoading || !userLocation} />
              </div>
            </div>
          )}
        </div>
        {/* Right Weather Panel */}
        <div className="hidden xl:block w-[360px] 2xl:w-[400px] h-full border-l border-white/5 bg-[#02040A]/60 backdrop-blur-2xl">
          <WeatherPanel weather={weather} location={location} />
        </div>
      </div>
    </div>
  );
}

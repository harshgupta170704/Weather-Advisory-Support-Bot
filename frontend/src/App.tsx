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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile
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

  const handleNewChat = () => {
    clearSession();
  };

  return (
    <div className="min-h-screen bg-[#050817] relative text-gray-200">
      <AtmosphericBackground />

      <AnimatePresence>
        {!userLocation && (
          <LocationModal onLocationSubmit={setUserLocation} />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col h-screen pt-16">
        <TopNav
          isConnected={isConnected}
          sopsLoaded={sopsLoaded}
          userLocation={userLocation}
          onChangeLocation={() => {
            setUserLocation(null);
            clearSession();
          }}
          onClearSession={clearSession}
        />

        <div className="flex-1 flex overflow-hidden max-w-[1920px] mx-auto w-full">
          {/* Left Sidebar - hidden on mobile, visible on lg */}
          <div className="hidden lg:block h-full">
            <Sidebar onNewChat={handleNewChat} sopsLoaded={sopsLoaded} />
          </div>

          {/* Center Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full relative">
            <div className="flex-1 overflow-y-auto px-4 md:px-8 xl:px-12 py-6">
              <AnimatePresence mode="wait">
                {!hasMessages ? (
                  <EmptyState key="empty" onSelectPrompt={handleSend} />
                ) : (
                  <div key="chat" className="max-w-4xl mx-auto pb-4">
                    {messages.map((msg) => (
                      <ChatMessage key={msg.id} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="px-4 md:px-8 xl:px-12 pb-6 pt-2 bg-gradient-to-t from-[#050817] via-[#050817]/90 to-transparent">
              <div className="max-w-4xl mx-auto">
                <ChatInput onSend={handleSend} disabled={isLoading || !userLocation} />
              </div>
            </div>
          </div>

          {/* Right Weather Panel - visible when there are messages on xl */}
          <div className="hidden xl:block w-[340px] 2xl:w-[380px] h-full border-l border-white/[0.06] bg-[#070A18]/30 backdrop-blur-md">
            <WeatherPanel weather={weather} location={location} />
          </div>
        </div>
      </div>
    </div>
  );
}

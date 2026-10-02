import { useState } from 'react';
import { Plus, CloudRain, Bike, Car, Heart, Shield, MessageCircle, FileText } from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
  userLocation?: string | null;
  onOpenPolicies?: () => void;
}

const recentChatsData = [
  { id: 1, title: '{city} cycling', sub: 'Is it safe to cycle today?', time: '2 min ago', icon: Bike, color: 'text-cyan-400' },
  { id: 2, title: 'Picnic this weekend', sub: 'Good for picnic?', time: '1 hour ago', icon: CloudRain, color: 'text-emerald-400' },
  { id: 3, title: 'Delhi travel', sub: 'Should I travel?', time: '3 hours ago', icon: Car, color: 'text-blue-400' },
  { id: 4, title: 'Chennai weather', sub: 'Rain tomorrow?', time: '1 day ago', icon: CloudRain, color: 'text-gray-400' },
  { id: 5, title: 'Elderly parents', sub: 'Can parents go for walk?', time: '2 days ago', icon: Heart, color: 'text-rose-400' },
  { id: 6, title: 'General question', sub: 'What is UV index?', time: '3 days ago', icon: MessageCircle, color: 'text-gray-400' },
];

export function Sidebar({ onNewChat, userLocation, onOpenPolicies }: SidebarProps) {
  const [activeId, setActiveId] = useState<number | null>(1);
  const displayCity = userLocation || 'Bhopal';

  return (
    <div className="h-full flex flex-col bg-[#02040A]/80 backdrop-blur-3xl pt-6 pb-6 border-r border-white/5">
      {/* Brand */}
      <div className="px-5 flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-[17px] font-bold text-white tracking-tight leading-none mb-1">ClimaGuard</h1>
          <p className="text-[10px] text-gray-400 font-medium leading-none">Policy-Grounded Weather Intelligence</p>
        </div>
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={() => {
            setActiveId(null);
            onNewChat();
          }}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-blue-500/50 bg-blue-500/10 text-cyan-300 font-bold text-sm hover:bg-blue-500/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        <h3 className="text-[10px] capitalize font-medium text-gray-500 mb-3 px-3">Recent conversations by our users</h3>
        
        <div className="space-y-1">
          {recentChatsData.map((chat) => {
            const Icon = chat.icon;
            const isActive = activeId === chat.id;
            return (
              <button
                key={chat.id}
                onClick={() => setActiveId(chat.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
                  isActive 
                    ? 'bg-cyan-500/10 border border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
                    : 'border border-transparent hover:bg-white/[0.02]'
                }`}
              >
                <div className={`p-2 rounded-xl bg-black/40 border ${isActive ? 'border-cyan-500/30' : 'border-white/5'} ${isActive ? 'shadow-[0_0_10px_rgba(34,211,238,0.2)]' : ''}`}>
                  <Icon className={`w-4 h-4 ${chat.color}`} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-[13px] font-bold truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {chat.title.replace('{city}', displayCity)}
                    </p>
                    <span className="text-[9px] text-gray-500 shrink-0 ml-2">{chat.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{chat.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="px-4 mt-2">
        <div 
          onClick={onOpenPolicies}
          className="p-3.5 rounded-xl bg-[#050814] border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1">
                15 Active Policies
              </p>
              <p className="text-[10px] text-gray-500">Live policy engine</p>
            </div>
          </div>
          <div className="text-gray-500 text-xs">›</div>
        </div>
      </div>
    </div>
  );
}

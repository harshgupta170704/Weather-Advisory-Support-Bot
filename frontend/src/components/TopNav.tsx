import { MapPin, Sun } from 'lucide-react';

interface TopNavProps {
  isConnected: boolean;
  sopsLoaded: number;
  userLocation: string | null;
  onChangeLocation: () => void;
  onOpenPolicies?: () => void;
}

export function TopNav({ isConnected, sopsLoaded, userLocation, onChangeLocation, onOpenPolicies }: TopNavProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 h-20 pt-6 px-8 flex items-center justify-between pointer-events-none">
      
      {/* CENTER: Navigation */}
      <div className="flex-1 flex justify-center pointer-events-auto">
        <div className="flex items-center gap-6 px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md">
          <button className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            Live Data
          </button>
          <button onClick={onOpenPolicies} className="text-xs font-medium text-gray-400 hover:text-white transition-colors">Policies</button>
          <button className="text-xs font-medium text-gray-400 hover:text-white transition-colors">About</button>
        </div>
      </div>

      {/* RIGHT: Status & Controls */}
      <div className="absolute right-8 flex items-center gap-3 pointer-events-auto">
        {/* Location Pill */}
        {userLocation && (
          <button
            onClick={onChangeLocation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 text-xs font-semibold text-gray-200 hover:bg-white/10 transition-colors backdrop-blur-md"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>{userLocation}</span>
            <span className="text-gray-500 ml-1 text-[10px]">v</span>
          </button>
        )}

        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          LIVE
        </div>

        {/* SOP Count */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 text-xs font-medium text-gray-300 backdrop-blur-md">
          <div className="w-3.5 h-3.5 border-2 border-gray-400/50 rounded-sm opacity-70" />
          {sopsLoaded} policies
        </div>

        {/* Theme/Settings */}
        <button className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-md">
          <Sun className="w-4 h-4 text-cyan-400" />
        </button>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white border border-white/10 ml-2">
          H
        </div>
      </div>
    </header>
  );
}

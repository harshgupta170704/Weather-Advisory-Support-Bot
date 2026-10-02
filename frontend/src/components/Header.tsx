import { motion } from 'framer-motion';
import { Shield, RotateCcw, Activity, Zap, MapPin } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  sopsLoaded: number;
  userLocation: string | null;
  onChangeLocation: () => void;
  onClearSession: () => void;
}

export function Header({ isConnected, sopsLoaded, userLocation, onChangeLocation, onClearSession }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      {/* Subtle bottom border glow */}
      <div className="absolute inset-0 bg-[#050816]/80 backdrop-blur-xl border-b border-white/[0.04]" />

      <div className="relative max-w-[1600px] mx-auto h-full px-5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/20 flex items-center justify-center"
          >
            <Shield className="w-[18px] h-[18px] text-sky-400" />
            <div className="absolute inset-0 rounded-xl bg-sky-500/10 blur-sm" />
          </motion.div>
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-none">
              ClimaGuard
            </h1>
            <p className="text-[11px] text-white/30 font-medium mt-0.5 hidden sm:block">
              Policy-Grounded Weather Intelligence
            </p>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2.5">
          {userLocation && (
            <button
              onClick={onChangeLocation}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass hover:bg-white/[0.04] text-[11px] font-semibold tracking-wide text-sky-400 transition-colors"
            >
              <MapPin className="w-3 h-3" />
              <span>{userLocation}</span>
            </button>
          )}

          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px] font-semibold tracking-wide">
            <div className="relative flex items-center justify-center">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {isConnected && (
                <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <span className={isConnected ? 'text-emerald-300/80' : 'text-red-300/80'}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* SOPs badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] font-medium text-white/40">
            <Zap className="w-3 h-3 text-sky-400/60" />
            <span>{sopsLoaded} policies</span>
          </div>

          {/* Clear button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearSession}
            className="w-8 h-8 rounded-lg glass glass-hover flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
            title="New conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}

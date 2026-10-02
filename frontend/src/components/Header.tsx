import React from 'react';
import { Shield, RotateCcw } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  sopsLoaded: number;
  onClearSession: () => void;
}

export function Header({ isConnected, sopsLoaded, onClearSession }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-lg border-b border-white/10 h-16">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-950/50 p-2 rounded-lg border border-cyan-900/50">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">ClimaGuard</h1>
            <p className="text-xs text-gray-400">Policy-Grounded Weather Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-300">LIVE DATA</span>
          </div>
          
          <div className="hidden sm:block bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-gray-300">
            {sopsLoaded} SOPs Active
          </div>
          
          <button
            onClick={onClearSession}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
            title="Clear Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

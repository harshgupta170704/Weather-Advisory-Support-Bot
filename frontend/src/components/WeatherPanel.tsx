import { Droplets, CloudRain, Wind, Sun, Maximize2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { WeatherData, LocationData } from '@/types';

interface WeatherPanelProps {
  weather: WeatherData | null;
  location: LocationData | null;
}

export function WeatherPanel({ weather, location }: WeatherPanelProps) {
  if (!weather || !location) {
    return <div className="h-full flex items-center justify-center text-gray-500 text-sm">Weather context will appear here</div>;
  }

  return (
    <div className="h-full flex flex-col pt-6 pb-6 px-4 overflow-y-auto">
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 className="text-[15px] font-bold text-white tracking-wide">Current Conditions</h3>
        <RefreshCw className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
      </div>

      <div className="space-y-3 px-2">
        
        {/* Location & Hero Card */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: 'url(/images/hero.jpg)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          
          <div className="relative p-5 z-10 flex flex-col h-full min-h-[180px]">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPinIcon />
              <span className="text-sm font-bold text-white">{location.city}, {location.country}</span>
            </div>
            <p className="text-[10px] text-gray-300 mb-auto ml-5">Updated {new Date(weather.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            
            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-1">
                <Sun className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-[40px] font-bold text-white leading-none tracking-tighter">
                  {weather.temperature_c}°C
                </span>
              </div>
              <p className="text-sm font-medium text-gray-200">Clear sky</p>
            </div>
          </div>
        </div>

        {/* 6-Grid Stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={Droplets} label="Rainfall" value={`${weather.precipitation_mm} mm`} color="text-cyan-400" />
          <StatCard icon={CloudRain} label="Rain Prob." value={`${weather.precipitation_probability}%`} color="text-cyan-400" />
          <StatCard icon={Wind} label="Wind Speed" value={`${weather.wind_speed_kmh} km/h`} color="text-cyan-400" />
          <StatCard icon={Wind} label="Wind Gusts" value={`${weather.wind_gusts_kmh} km/h`} color="text-cyan-400" />
          <StatCard icon={Sun} label="UV Index" value={weather.uv_index.toString()} color="text-yellow-400" />
          <StatCard icon={ThermometerIcon} label="Feels Like" value={`${weather.temperature_c}°C`} color="text-cyan-400" />
        </div>

        {/* Map */}
        <div className="mt-4 border border-white/10 rounded-2xl overflow-hidden bg-black/40 relative">
          <div className="flex items-center justify-between p-3 absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent">
             <span className="text-xs font-bold text-white">Live Weather Map</span>
             <Maximize2 className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-white" />
          </div>
          <div 
            className="w-full h-40 bg-cover bg-center"
            style={{ backgroundImage: 'url(/images/map.jpg)' }}
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-black/50 px-2 py-1 rounded backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Open-Meteo • Live Data
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:bg-white/[0.04] transition-colors">
      <Icon className={`w-5 h-5 ${color} opacity-80 shrink-0`} strokeWidth={1.5} />
      <div>
        <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-200">{value}</p>
      </div>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function ThermometerIcon({ className }: any) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    </svg>
  );
}

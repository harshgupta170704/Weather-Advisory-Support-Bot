import { Droplets, CloudRain, Wind, Sun, Maximize2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { WeatherData, LocationData } from '@/types';

interface WeatherPanelProps {
  weather: WeatherData | null;
  location: LocationData | null;
  userLocation?: string | null;
}

export function WeatherPanel({ weather, location, userLocation }: WeatherPanelProps) {
  // If no real data, use mock data from reference image for the empty state
  const isMock = !weather || !location;
  
  const cityName = userLocation || 'Bhopal';
  const displayLocation = isMock ? { city: cityName, country: 'India' } : location;
  
  // Deterministic mock data based on city length
  const baseTemp = 25 + (cityName.length % 10);
  const baseWind = 5 + (cityName.length % 5);
  const baseRain = cityName.length % 3 === 0 ? 12 : 0;
  
  const displayWeather = isMock ? {
    temperature_c: baseTemp + 0.3,
    precipitation_mm: baseRain,
    precipitation_probability: baseRain > 0 ? 60 : 0,
    wind_speed_kmh: baseWind + 0.7,
    wind_gusts_kmh: baseWind * 2 + 1.1,
    uv_index: 5 + (cityName.length % 4) + 0.5,
    observed_at: new Date().toISOString(),
  } : weather;

  const getCityImage = (city: string) => {
    const c = city.toLowerCase();
    if (c.includes('delhi')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/IN-DL_New_Delhi_14_India_Gate_2013-10-12.jpg/800px-IN-DL_New_Delhi_14_India_Gate_2013-10-12.jpg';
    if (c.includes('mumbai')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Mumbai_03-2016_31_Gateway_of_India.jpg/800px-Mumbai_03-2016_31_Gateway_of_India.jpg';
    if (c.includes('bengaluru') || c.includes('bangalore')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Vidhana_Soudha_in_Bangalore.jpg/800px-Vidhana_Soudha_in_Bangalore.jpg';
    if (c.includes('hyderabad')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Charminar_Hyderabad_1.jpg/800px-Charminar_Hyderabad_1.jpg';
    if (c.includes('pune')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Shaniwar_Wada_Pune_India.jpg/800px-Shaniwar_Wada_Pune_India.jpg';
    if (c.includes('bhopal')) return '/images/hero.jpg';
    // Fallback: use picsum with city name as seed for a deterministic beautiful image
    return `https://picsum.photos/seed/${encodeURIComponent(city)}/400/200`;
  };

  const heroImage = getCityImage(displayLocation.city);

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
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          
          <div className="relative p-5 z-10 flex flex-col h-full min-h-[180px]">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPinIcon />
              <span className="text-sm font-bold text-white">{displayLocation.city}, {displayLocation.country}</span>
            </div>
            <p className="text-[10px] text-gray-300 mb-auto ml-5">Updated {new Date(displayWeather.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            
            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-1">
                <Sun className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-[40px] font-bold text-white leading-none tracking-tighter">
                  {displayWeather.temperature_c}°C
                </span>
              </div>
              <p className="text-sm font-medium text-gray-200">Clear sky</p>
            </div>
          </div>
        </div>

        {/* 6-Grid Stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard icon={Droplets} label="Rainfall" value={`${displayWeather.precipitation_mm} mm`} color="text-cyan-400" />
          <StatCard icon={CloudRain} label="Rain Prob." value={`${displayWeather.precipitation_probability}%`} color="text-cyan-400" />
          <StatCard icon={Wind} label="Wind Speed" value={`${displayWeather.wind_speed_kmh} km/h`} color="text-cyan-400" />
          <StatCard icon={Wind} label="Wind Gusts" value={`${displayWeather.wind_gusts_kmh} km/h`} color="text-cyan-400" />
          <StatCard icon={Sun} label="UV Index" value={displayWeather.uv_index.toString()} color="text-yellow-400" />
          <StatCard icon={ThermometerIcon} label="Feels Like" value={`${displayWeather.temperature_c}°C`} color="text-cyan-400" />
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

import { MapPin, Droplets, CloudRain, Wind, Sun, Clock, Eye, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeatherData, LocationData } from '@/types';

interface WeatherPanelProps {
  weather: WeatherData | null;
  location: LocationData | null;
}

export function WeatherPanel({ weather, location }: WeatherPanelProps) {
  if (!weather || !location) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-gray-600 opacity-50" />
        </div>
        <p className="text-sm">Weather intelligence will appear here once you ask about an activity.</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white tracking-tight leading-none mb-1">Current Conditions</h3>
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">Live Weather Context</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Location Banner */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{location.city}, {location.country}</p>
            <p className="text-[10px] text-gray-400">Updated {new Date(weather.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </motion.div>

        {/* Hero Card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-cyan-900/40 to-blue-900/20 border border-cyan-500/20 shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)] group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-6 h-6 text-amber-400" />
              <span className="text-sm font-semibold text-cyan-100">Clear sky</span>
            </div>
            <div className="text-5xl font-extrabold text-white tracking-tighter mb-1">
              {weather.temperature_c}°
            </div>
            <p className="text-xs text-cyan-200/70 font-medium">Feels like {weather.temperature_c}°C</p>
          </div>
        </motion.div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-3">
          <WeatherCard variants={itemVariants} icon={Droplets} label="Rainfall" value={`${weather.precipitation_mm} mm`} color="text-blue-400" />
          <WeatherCard variants={itemVariants} icon={CloudRain} label="Rain Prob." value={`${weather.precipitation_probability}%`} color="text-indigo-400" />
          <WeatherCard variants={itemVariants} icon={Wind} label="Wind Speed" value={`${weather.wind_speed_kmh} km/h`} color="text-sky-400" />
          <WeatherCard variants={itemVariants} icon={Wind} label="Wind Gusts" value={`${weather.wind_gusts_kmh} km/h`} color="text-orange-400" />
          <WeatherCard variants={itemVariants} icon={Sun} label="UV Index" value={weather.uv_index.toString()} color="text-amber-400" />
          <WeatherCard variants={itemVariants} icon={Eye} label="Condition" value="Clear" color="text-emerald-400" />
        </div>

        {/* Source Badge */}
        <motion.div variants={itemVariants} className="mt-8 flex justify-center">
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            Live data via Open-Meteo
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function WeatherCard({ icon: Icon, label, value, color, variants }: any) {
  return (
    <motion.div 
      variants={variants}
      whileHover={{ y: -2 }}
      className="p-3.5 rounded-xl glass hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all cursor-default"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-200">{value}</p>
    </motion.div>
  );
}

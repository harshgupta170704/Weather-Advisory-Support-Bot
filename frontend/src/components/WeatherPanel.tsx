import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Thermometer, CloudRain, Droplets, Wind, Sun, Clock } from 'lucide-react';
import { WeatherData, LocationData } from '@/types';

interface WeatherPanelProps {
  weather: WeatherData | null;
  location: LocationData | null;
}

export function WeatherPanel({ weather, location }: WeatherPanelProps) {
  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-lg font-bold text-white mb-6">Current Conditions</h2>
      <AnimatePresence mode="wait">
        {!weather ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center text-sm px-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <CloudRain className="w-7 h-7 text-gray-600" />
            </div>
            <p>Weather data will appear here after your first query.</p>
          </motion.div>
        ) : (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5 flex-1"
          >
            {location && (
              <div className="flex items-center space-x-2 text-cyan-400 bg-cyan-950/30 w-fit px-3 py-1.5 rounded-full border border-cyan-900/50">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{location.city}, {location.country}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs uppercase tracking-wider">Temp</span>
                </div>
                <div className="text-2xl font-semibold text-white">{weather.temperature_c}°C</div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs uppercase tracking-wider">Rain</span>
                </div>
                <div className="text-2xl font-semibold text-white">{weather.precipitation_mm}<span className="text-sm text-gray-400 ml-1">mm</span></div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs uppercase tracking-wider">Rain Prob.</span>
                </div>
                <div className="text-2xl font-semibold text-white">{weather.precipitation_probability}<span className="text-sm text-gray-400 ml-1">%</span></div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs uppercase tracking-wider">Wind</span>
                </div>
                <div className="text-2xl font-semibold text-white">{weather.wind_speed_kmh}<span className="text-sm text-gray-400 ml-1">km/h</span></div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs uppercase tracking-wider">Gusts</span>
                </div>
                <div className="text-2xl font-semibold text-white">{weather.wind_gusts_kmh}<span className="text-sm text-gray-400 ml-1">km/h</span></div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <Sun className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs uppercase tracking-wider">UV Index</span>
                </div>
                <div className="text-2xl font-semibold text-white">{weather.uv_index}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/10">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{weather.observed_at ? new Date(weather.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
              </div>
              <div className="bg-blue-900/30 px-2 py-1 rounded text-blue-300 border border-blue-900/50 text-[10px] font-medium">
                {weather.source || 'Open-Meteo'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

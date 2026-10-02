import { motion } from 'framer-motion';
import { Shield, X, AlertTriangle, CloudRain, Sun, Wind, ThermometerSnowflake } from 'lucide-react';

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_POLICIES = [
  { id: 'SOP-001', title: 'Severe Thunderstorm Protocol', severity: 'CRITICAL', icon: CloudRain, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/20' },
  { id: 'SOP-002', title: 'High Heat Index Warning', severity: 'HIGH', icon: Sun, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-500/20' },
  { id: 'SOP-003', title: 'Gale Force Winds Alert', severity: 'HIGH', icon: Wind, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-500/20' },
  { id: 'SOP-004', title: 'Extreme Cold Exposure', severity: 'MODERATE', icon: ThermometerSnowflake, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-500/20' },
  { id: 'SOP-005', title: 'Standard Outdoor Activities', severity: 'LOW', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/20' },
];

export function PoliciesModal({ isOpen, onClose }: PoliciesModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#02040A]/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#050A16]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-1">Active Policies</h2>
              <p className="text-xs text-gray-400 font-medium">Live Deterministic Safety Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-gray-300">Currently Loaded (15)</h3>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </div>
          </div>

          <div className="space-y-3">
            {MOCK_POLICIES.map((policy) => {
              const Icon = policy.icon;
              return (
                <div key={policy.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${policy.bg} ${policy.border} border`}>
                    <Icon className={`w-6 h-6 ${policy.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">{policy.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${policy.bg} ${policy.border} ${policy.color}`}>
                        {policy.severity}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{policy.title}</p>
                  </div>
                </div>
              );
            })}
            
            <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 border-dashed text-center">
              <p className="text-xs font-medium text-gray-500">+ 10 more baseline policies loaded</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

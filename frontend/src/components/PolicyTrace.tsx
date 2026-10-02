import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TraceStep, SelectedSOP, MatchingSOP } from '@/types';
import { ChevronRight, X, Shield, ArrowRight, Zap, Target, Activity, MapPin, Cloud, CheckCircle2 } from 'lucide-react';

interface PolicyTraceProps {
  trace: TraceStep[];
  selectedSop: SelectedSOP | null;
  matchingSops: MatchingSOP[];
  status: string;
}

export function PolicyTrace({ trace, selectedSop, matchingSops, status }: PolicyTraceProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <div className="flex justify-end mt-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400/70 hover:text-cyan-300 transition-colors bg-cyan-900/10 hover:bg-cyan-900/30 px-3 py-1.5 rounded-full border border-cyan-500/10"
        >
          View Decision Trace <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Modal Trace View */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-[#050817]/90 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full max-w-7xl bg-[#0a0e1a]/95 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">How this answer was decided</h2>
                  <p className="text-gray-400 text-sm mt-1">A transparent view of the complete decision journey.</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full glass hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body / Flowchart */}
              <div className="flex-1 overflow-auto p-8 relative">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500/0 via-cyan-500/30 to-blue-500/0" />
                
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start relative">
                  
                  {/* LEFT COLUMN: Linear Trace */}
                  <div className="flex-1 space-y-6 relative">
                    <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-gradient-to-b from-cyan-500/40 via-blue-500/20 to-transparent" />
                    
                    {trace.map((step, idx) => (
                      <TraceNode key={idx} step={step} index={idx + 1} />
                    ))}
                  </div>

                  {/* RIGHT COLUMN: SOP Details (If applicable) */}
                  <div className="w-full md:w-[400px] flex flex-col gap-6">
                    {selectedSop ? (
                      <div className="glass p-6 rounded-2xl border-emerald-500/30 shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-emerald-400 tracking-wider">SELECTED SOP</p>
                            <p className="text-lg font-bold text-white">{selectedSop.id}</p>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-200 mb-6">{selectedSop.title}</h4>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Severity</p>
                            <p className="text-sm font-bold text-emerald-400">{selectedSop.severity}</p>
                          </div>
                          <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Category</p>
                            <p className="text-sm font-bold text-gray-300">{selectedSop.category}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Why it matched</p>
                          <p className="text-sm text-gray-400 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                            {selectedSop.reason}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="glass p-8 rounded-2xl border-white/10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                          <Shield className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No Policy Match</h3>
                        <p className="text-sm text-gray-400">
                          Conditions are within normal bounds for this activity. No restrictive safety policies were triggered.
                        </p>
                      </div>
                    )}
                    
                    {matchingSops.length > 1 && (
                      <div className="glass p-5 rounded-2xl border-white/10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Other Matching Policies ({matchingSops.length - 1})</p>
                        <div className="space-y-2">
                          {matchingSops.filter(s => selectedSop && s.id !== selectedSop.id).map(s => (
                            <div key={s.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                              <span className="text-sm font-medium text-gray-300">{s.id}</span>
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded uppercase">{s.severity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function TraceNode({ step, index }: { step: TraceStep, index: number }) {
  const getIcon = (name: string) => {
    if (name.includes('intent')) return <Target className="w-4 h-4 text-cyan-400" />;
    if (name.includes('location')) return <MapPin className="w-4 h-4 text-blue-400" />;
    if (name.includes('weather')) return <Cloud className="w-4 h-4 text-sky-400" />;
    if (name.includes('evaluate')) return <Activity className="w-4 h-4 text-violet-400" />;
    return <Zap className="w-4 h-4 text-gray-400" />;
  };

  const isSuccess = step.status === 'ok';

  return (
    <div className="flex gap-4 relative z-10 items-start">
      <div className="flex-shrink-0 mt-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow-lg ${
          isSuccess ? 'bg-cyan-900/40 border-cyan-500/40 text-cyan-300' : 'bg-red-900/40 border-red-500/40 text-red-300'
        }`}>
          {index}
        </div>
      </div>
      
      <div className="flex-1 glass rounded-2xl p-4 border-white/10 hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center gap-2 mb-2">
          {getIcon(step.step)}
          <h4 className="text-sm font-bold text-white capitalize">{step.step.replace(/_/g, ' ')}</h4>
          <div className="ml-auto flex items-center gap-1.5">
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
          </div>
        </div>
        
        {step.detail && (
          <div className="mt-2 p-3 bg-black/20 rounded-lg border border-white/5 text-xs text-gray-300 font-mono whitespace-pre-wrap break-all">
            {step.detail}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { TraceStep, SelectedSOP, MatchingSOP } from '@/types';

interface PolicyTraceProps {
  trace: TraceStep[];
  selectedSop: SelectedSOP | null;
  matchingSops: MatchingSOP[];
  status: string;
}

export function PolicyTrace({ trace, selectedSop, matchingSops, status }: PolicyTraceProps) {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'LOW': return 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50';
      case 'MODERATE': return 'bg-amber-950/30 text-amber-400 border-amber-900/50';
      case 'HIGH': return 'bg-orange-950/30 text-orange-400 border-orange-900/50';
      case 'CRITICAL': return 'bg-red-950/30 text-red-400 border-red-900/50';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <MinusCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="mt-4 border border-white/10 rounded-xl bg-black/20 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-sm text-gray-300 hover:bg-white/5 transition-colors"
      >
        <span className="font-medium">How this answer was decided</span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Execution Pipeline</h4>
                <div className="space-y-2">
                  {trace.map((traceStep, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-sm">
                      {getStatusIcon(traceStep.status)}
                      <div>
                        <span className="text-gray-300 font-medium">{traceStep.step}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{traceStep.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSop && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Selected Policy</h4>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-xs text-cyan-400 mb-1">{selectedSop.id}</div>
                        <div className="text-sm font-medium text-white">{selectedSop.title}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(selectedSop.severity)}`}>
                        {selectedSop.severity}
                      </div>
                    </div>
                    {selectedSop.reason && (
                      <p className="text-xs text-gray-400 mt-2 border-t border-white/5 pt-2">
                        <span className="font-medium text-gray-300">Reason:</span> {selectedSop.reason}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {matchingSops.length > 1 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Other Matches ({matchingSops.length - 1})</h4>
                  <div className="flex flex-wrap gap-2">
                    {matchingSops.filter(s => s.id !== selectedSop?.id).map((sop, idx) => (
                      <div key={idx} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded text-gray-300">
                        {sop.id}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

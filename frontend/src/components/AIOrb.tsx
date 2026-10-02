import { motion } from 'framer-motion';

export type AIOrbState = 'idle' | 'thinking' | 'responding' | 'error';

interface AIOrbProps {
  state: AIOrbState;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export function AIOrb({ state, className = '', size = 'md' }: AIOrbProps) {
  const isHero = size === 'hero';
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    hero: 'w-48 h-48 md:w-56 md:h-56',
  };

  const ringGlows = {
    idle: 'border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]',
    thinking: 'border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.5)]',
    responding: 'border-blue-400/40 shadow-[0_0_30px_rgba(96,165,250,0.4)]',
    error: 'border-red-500/40 shadow-[0_0_30px_rgba(248,113,113,0.3)]',
  };

  return (
    <div className={`relative flex items-center justify-center ${dimensions[size]} ${className}`}>
      
      {/* Complex orbital rings for Hero mode */}
      {isHero && (
        <>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute inset-[-20%] rounded-[100%] border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)] rotate-45 scale-y-50" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }} className="absolute inset-[-20%] rounded-[100%] border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] -rotate-45 scale-y-50" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute inset-[-10%] rounded-full border-t-2 border-r border-magenta-500/30 blur-[1px]" style={{ borderColor: 'rgba(217, 70, 239, 0.3)' }} />
          
          {/* Orbital nodes */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-[-30%]">
             <div className="absolute top-0 left-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]" />
             <div className="absolute bottom-1/4 left-0 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,1)]" />
          </motion.div>
        </>
      )}

      {/* Outer rotating ring */}
      <motion.div
        animate={{
          rotate: state === 'thinking' ? 360 : 180,
          scale: state === 'responding' ? [1, 1.05, 1] : 1,
        }}
        transition={{
          rotate: { duration: state === 'thinking' ? 2 : 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        className={`absolute inset-0 rounded-full border-2 ${ringGlows[state]}`}
      />

      {/* Core Dark Sphere */}
      <div className={`absolute inset-2 rounded-full bg-gradient-to-br from-[#0a1128] to-[#040814] shadow-inner ${isHero ? 'border-[3px] border-cyan-500/40 shadow-[0_0_50px_rgba(34,211,238,0.5)]' : ''}`} />

      {/* Eyes (only if hero) */}
      {isHero ? (
        <div className="relative z-10 flex gap-4 mt-2">
          <motion.div 
            animate={{ scaleY: [1, 0.1, 1] }} 
            transition={{ duration: 0.2, delay: 3, repeat: Infinity, repeatDelay: 4 }}
            className="w-4 h-5 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,1)]" 
          />
          <motion.div 
            animate={{ scaleY: [1, 0.1, 1] }} 
            transition={{ duration: 0.2, delay: 3.05, repeat: Infinity, repeatDelay: 4 }}
            className="w-4 h-5 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,1)]" 
          />
        </div>
      ) : (
        /* Standard small core glow */
        <motion.div
          animate={{
            scale: state === 'idle' ? [0.9, 1, 0.9] : state === 'thinking' ? [0.8, 1.1, 0.8] : [0.95, 1.05, 0.95],
            opacity: state === 'idle' ? [0.5, 0.8, 0.5] : [0.7, 1, 0.7],
          }}
          transition={{
            duration: state === 'thinking' ? 1 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute inset-1.5 rounded-full blur-[2px] ${state === 'error' ? 'bg-red-500/50' : 'bg-cyan-400/50'}`}
        />
      )}
    </div>
  );
}

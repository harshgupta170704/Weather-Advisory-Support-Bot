import { motion } from 'framer-motion';

export function AtmosphericBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#02040A]">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100 transition-opacity duration-1000"
        style={{ backgroundImage: 'url(/images/bg2.jpg)' }}
      />
      {/* Dark gradient overlay for readability, focused on sides and bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#02040A]/40 to-[#02040A]/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#02040A]/90 via-transparent to-[#02040A]/80" />
    </div>
  );
}

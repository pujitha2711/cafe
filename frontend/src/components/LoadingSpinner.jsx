import React from 'react';
import { Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ message = "Brewing your experience..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[300px]">
      <div className="relative">
        {/* Steam particles */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1 justify-center">
          <motion.span 
            animate={{ y: [-5, -15], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1 h-3 bg-coffee-400 rounded-full"
          />
          <motion.span 
            animate={{ y: [-5, -18], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.3 }}
            className="w-1 h-4 bg-coffee-400 rounded-full"
          />
          <motion.span 
            animate={{ y: [-5, -15], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.6 }}
            className="w-1 h-3 bg-coffee-400 rounded-full"
          />
        </div>

        {/* Cup */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center shadow-lg border border-coffee-500/20"
        >
          <Coffee className="w-8 h-8 text-amber-50" />
        </motion.div>
        
        {/* Shadow */}
        <div className="w-12 h-1.5 bg-coffee-950/10 rounded-full mt-2 mx-auto blur-sm" />
      </div>

      <p className="text-sm font-semibold tracking-wide text-coffee-850 animate-pulse font-serif">{message}</p>
    </div>
  );
}

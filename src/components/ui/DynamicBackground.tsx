"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DynamicBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-[#0a0a0a]" />;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0a0a0a]">
      {/* Animated Blobs */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-900/20 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 100, -60, 0],
          scale: [1, 1.1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, 60, -100, 0],
          y: [0, 150, -100, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] rounded-full bg-teal-900/10 blur-[120px]"
      />

      {/* Noise / Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      
      {/* Dark Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0a0a0a]/40 to-[#0a0a0a]/80 pointer-events-none" />
    </div>
  );
}

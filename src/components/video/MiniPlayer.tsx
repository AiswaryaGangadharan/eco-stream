/* webhint-disable no-inline-styles */
"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { usePlayer } from "../../context/PlayerContext";

export default function MiniPlayer() {
  const {
    activeVideo,
    isMinimized,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    maximize,
    closePlayer,
  } = usePlayer();

  // ── Animation state ──
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (activeVideo && isMinimized) {
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    } else {
      const timer = setTimeout(() => setVisible(false), 0);
      return () => clearTimeout(timer);
    }
  }, [activeVideo, isMinimized]);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  if (!activeVideo || !isMinimized) return null;

  const progress = duration > 0 ? currentTime / duration : 0;
  const RADIUS = 22;
  const CIRC = Math.PI * 2 * RADIUS;
  const offset = (1 - progress) * CIRC;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);

    if (dy < 30) {
      if (dx > 60) {
        closePlayer();
        return;
      }
      if (dx < -60) {
        maximize();
        return;
      }
    }
  };

  return (
    <div
      className="fixed right-4 z-50 transition-all duration-300 ease-out"
      style={{
        bottom: `max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem))`,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(120%) scale(0.95)",
        opacity: visible ? 1 : 0,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center gap-3 bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/60 px-3 py-2 border border-zinc-700/50">
        
        {/* Thumbnail */}
        <div
          className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={maximize}
        >
          <Image
            src={activeVideo.thumbnail}
            alt={activeVideo.title}
            width={120}
            height={70}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={maximize}>
          <p className="text-white text-xs font-medium truncate max-w-[100px]">
            {activeVideo.title}
          </p>
          <p className="text-zinc-400 text-xs truncate">
            {activeVideo.category}
          </p>
        </div>

        {/* Play Button + Progress Ring */}
        <div className="relative flex-shrink-0">
          <svg width="52" height="52" className="absolute inset-0 -rotate-90">
            <circle
              cx="26"
              cy="26"
              r={RADIUS}
              fill="none"
              stroke="#3f3f46"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx="26"
              cy="26"
              r={RADIUS}
              fill="none"
              stroke="#4ade80"
              strokeWidth="2.5"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.3s ease" }}
            />
          </svg>

          <button
            onClick={togglePlay}
            className="relative w-[52px] h-[52px] flex items-center justify-center"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1" width="4" height="14" rx="1.5" fill="white" />
                <rect x="10" y="1" width="4" height="14" rx="1.5" fill="white" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 1.5l11 6.5-11 6.5V1.5z" fill="white" />
              </svg>
            )}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={closePlayer}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-700/60 flex-shrink-0"
          aria-label="Close mini player"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 1l8 8M9 1L1 9"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <p className="text-center text-zinc-600 text-[10px] mt-1">
        swipe ← to close · swipe → to expand
      </p>
    </div>
  );
}
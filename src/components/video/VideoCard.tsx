"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { usePlayer } from '../../context/PlayerContext';
import { Video } from '../../types/video';
import { useRef, useState, useCallback } from 'react';

interface VideoCardProps {
  video: Video;
  enablePreview?: boolean;
}

export default function VideoCard({ video, enablePreview = false }: VideoCardProps) {
  const { openPlayer } = usePlayer();
  const [isHovered, setIsHovered] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (enablePreview && videoRef.current) {
      hoverTimerRef.current = setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, 400);
    }
  }, [enablePreview]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setPreviewReady(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const formatDuration = (seconds?: string | number) => {
    if (!seconds) return null;
    const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
    if (isNaN(numSeconds)) return null;
    const m = Math.floor(numSeconds / 60);
    const s = Math.floor(numSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      layoutId={`card-${video.id}`}
      className="group relative flex-shrink-0 w-44 md:w-52 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => openPlayer(video, 0)}
      initial={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div
        className={`
          relative rounded-lg overflow-hidden
          transition-all duration-300 ease-out
          ${isHovered ? 'scale-105 shadow-2xl shadow-black/60 z-10' : 'scale-100 shadow-md shadow-black/30'}
        `}
        style={{ aspectRatio: '16/9' }}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className={`object-cover transition-opacity duration-300 ${
            enablePreview && previewReady && isHovered ? 'opacity-0' : 'opacity-100'
          }`}
          sizes="(max-width: 768px) 25vw, 20vw"
          style={{ objectFit: 'cover' }}
        />

        {enablePreview && (
          <video
            ref={videoRef}
            src={video.src}
            muted
            playsInline
            loop
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              previewReady && isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            onCanPlay={() => setPreviewReady(true)}
          />
        )}

        <div
          className={`
            absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        />

        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300
            ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}
        >
          <div className="bg-white/90 rounded-full p-3 shadow-lg shadow-black/40 backdrop-blur-sm">
            <svg className="w-5 h-5 fill-black translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration */}
        {video.duration && (
          <span
            className={`
              absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-semibold
              px-1.5 py-0.5 rounded backdrop-blur-sm
              transition-opacity duration-300
              ${isHovered ? 'opacity-0' : 'opacity-100'}
            `}
          >
            {formatDuration(video.duration)}
          </span>
        )}

        <div
          className={`
            absolute inset-0 rounded-lg ring-2 ring-emerald-500/60
            transition-opacity duration-300 pointer-events-none
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        />
      </div>

      <p
        className={`
          mt-2 text-xs font-medium leading-tight line-clamp-2 px-0.5
          transition-colors duration-200
          ${isHovered ? 'text-white' : 'text-white/70'}
        `}
      >
        {video.title}
      </p>
    </motion.div>
  );
}


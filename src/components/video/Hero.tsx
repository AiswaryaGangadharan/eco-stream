"use client";

import Image from 'next/image';
import { usePlayer } from '../../context/PlayerContext';
import { Video } from '../../types/video';

interface HeroProps {
  video: Video;
}

export default function Hero({ video }: HeroProps) {
  const { openPlayer } = usePlayer();

  const truncate = (str: string, n: number): string =>
    str.length > n ? str.substring(0, n - 1) + '...' : str;

  return (
    <section className="relative w-full h-[56vw] min-h-[340px] max-h-[780px] overflow-hidden">
      <div className="absolute inset-0">
        <Image 
  src={video.thumbnail} 
  alt={video.title} 
  fill 
  className="object-cover object-top scale-105 brightness-50" 
  sizes="100vw"
  priority 
  style={{ objectFit: 'cover' }}
/>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      <div className="relative z-10 flex flex-col justify-end h-full px-8 md:px-16 pb-20 md:pb-28 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">
          <span className="w-5 h-px bg-emerald-400" />
          Featured
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] mb-4" style={{fontFamily: 'Georgia, serif', textShadow: '0 2px 20px rgba(0,0,0,0.5)'}}>
          {truncate(video.title, 50)}
        </h1>
        {video.description && (
          <p className="text-sm md:text-base text-white/70 leading-relaxed mb-8 max-w-md line-clamp-3">
            {truncate(video.description, 160)}
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => openPlayer(video, 0)} className="group flex items-center gap-2.5 bg-white text-black font-bold px-7 py-3 rounded-md text-sm hover:bg-white/90 active:scale-95 transition-all duration-150 shadow-lg shadow-black/30">
            <svg className="w-5 h-5 fill-black group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </button>
          <button className="flex items-center gap-2.5 bg-white/20 backdrop-blur-sm text-white font-semibold px-7 py-3 rounded-md text-sm hover:bg-white/30 active:scale-95 transition-all duration-150 border border-white/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
            </svg>
            More Info
          </button>
        </div>
      </div>
    </section>
  );
}

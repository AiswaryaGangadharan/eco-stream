"use client";

import { useRef, useState, useCallback } from 'react';
import VideoCard from './VideoCard';
import { Category } from '../../types/video';

interface VideoRowProps {
  category: Category;
  enablePreview?: boolean;
}

export default function VideoRow({ category, enablePreview = false }: VideoRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = rowRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 350);
  };

  if (!category.videos?.length) return null;

  return (
    <section className="mb-10 group/row">
      <div className="flex items-center justify-between px-8 md:px-16 mb-4">
        <h2 className="text-white font-bold text-lg md:text-xl tracking-wide flex items-center gap-3">
          {category.title}
          <span className="text-emerald-400 text-sm font-semibold opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 -translate-x-1 group-hover/row:translate-x-0 transition-transform">
            Explore all
          </span>
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-16 rounded-md bg-black/70 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/90 active:scale-95 transition-all duration-200 border border-white/10 ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-16 rounded-md bg-black/70 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/90 active:scale-95 transition-all duration-200 border border-white/10 ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        <div
          ref={rowRef}
          onScroll={updateScrollButtons}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-8 md:px-16 py-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
{category.videos.map((video) => (
            <VideoCard key={`row-${category.id}-${video.id}`} video={video} enablePreview={enablePreview} />
          ))}
        </div>
      </div>
    </section>
  );
}


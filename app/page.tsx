"use client";

import { useState, useEffect } from "react";
import { categories } from '@/data/videos';
import type { Category, ExtendedVideo } from '@/types/video';
import Hero from '@/components/video/Hero';
import VideoRow from '@/components/video/VideoRow';
import ContinueVideoCard from '@/components/video/ContinueVideoCard';
import VideoPlayer from '@/components/video/VideoPlayer';
import { PlayerProvider, usePlayer } from '@/context/PlayerContext';
import { usePlaybackMemory } from '@/hooks/usePlaybackMemory';
import DynamicBackground from '@/components/ui/DynamicBackground';

function HomeContent() {
  const { activeVideo } = usePlayer();
  const [refreshKey, setRefreshKey] = useState(0);
  const { getSavedPosition } = usePlaybackMemory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const allVideos: ExtendedVideo[] = categories.flatMap((cat: Category, catIndex: number) =>
    cat.videos.map((video, i: number): ExtendedVideo => ({
      ...video,
      index: catIndex * 10 + i,
    }))
  );

  const continueVideos = mounted ? allVideos.filter(v => getSavedPosition(v.id) > 0) : [];
  const heroVideo = categories[0]?.videos[0];

  return (
    <main className="min-h-screen bg-transparent text-white relative">
      <DynamicBackground />
      {activeVideo && <VideoPlayer />}

      {/* Header */}
      <header className="px-4 md:px-8 pt-10 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-emerald-400">🌿</span>
          <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">
            Eco-Stream
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Watch. Learn. <span className="text-emerald-400">Sustain.</span>
        </h1>
        <p className="mt-2 text-white/70 text-sm max-w-md">
          Curated videos on renewable energy, conservation, and a greener future.
        </p>
      </header>

      {/* Continue Watching */}
      {continueVideos.length > 0 && (
        <section className="mb-10 px-4 md:px-8">
          <h2 className="text-lg font-semibold mb-4">Continue Watching</h2>
          <div className="flex gap-4 overflow-x-auto">
            {continueVideos.map((video) => (
              <ContinueVideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      {/* Hero */}
      {heroVideo && (
        <Hero video={heroVideo} />
      )}

      {/* Categories */}
      <div className="relative z-10 -mt-16 pb-20">
        {categories.map((category: Category, index: number) => (
          <VideoRow
            key={`cat-${index}`}
            category={category}
            enablePreview={false}
          />
        ))}
      </div>
    </main>
  );
}

export default function HomePage() {
  // ✅ FIX: Provider must wrap component using usePlayer
  const allVideos = categories.flatMap((cat: Category, catIndex: number) =>
    cat.videos.map((video, i: number) => ({
      ...video,
      index: catIndex * 10 + i,
    }))
  );

  return (
    <PlayerProvider allVideos={allVideos}>
      <HomeContent />
    </PlayerProvider>
  );
}
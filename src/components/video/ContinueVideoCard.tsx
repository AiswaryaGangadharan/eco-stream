"use client";

import Image from "next/image";
import { usePlaybackMemory } from "../../hooks/usePlaybackMemory";
import { Video } from "../../types/video";
import { usePlayer } from "../../context/PlayerContext";

interface Props {
  video: Video & { index: number };
}

export default function ContinueVideoCard({ video }: Props) {
  const { getSavedPosition } = usePlaybackMemory();
  const { openPlayer } = usePlayer();

  const savedTime = getSavedPosition(video.id);
  const progress = savedTime > 0 ? savedTime / 300 : 0; // Assume ~5min videos

  const handleClick = () => openPlayer(video, video.index);

  return (
    <div className="flex-shrink-0 w-44 sm:w-52 cursor-pointer group relative" onClick={handleClick}>
      {/* Thumbnail + Progress Overlay */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-800">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 176px, (max-width: 768px) 208px, 240px"
        />

        {/* Progress Bar Overlay */}
        {savedTime > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500/80" style={{ width: `${progress * 100}%` }} />
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
          <div className="opacity-0 group-hover:opacity-100 bg-green-500 rounded-full w-10 h-10 flex items-center justify-center transition-opacity duration-300">
            <div className="w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[12px] border-l-white ml-1" />
          </div>
        </div>

        {/* Progress Dot */}
        {savedTime > 0 && (
          <div className="absolute -bottom-1 right-2 w-3 h-3 bg-green-500 rounded-full shadow-md" />
        )}
      </div>

      {/* Title */}
      <p className="mt-2 text-sm font-medium text-zinc-100 line-clamp-2 group-hover:text-green-400 transition-colors">
        {video.title}
      </p>
    </div>
  );
}

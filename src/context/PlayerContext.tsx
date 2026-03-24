"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { Video } from "../types/video";
import { usePlaybackMemory } from "../hooks/usePlaybackMemory";

type PlayerState = {
  activeVideo: Video | null;
  allVideos: Video[];
  currentIndex: number;
  isMinimized: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  volume: number;
  isPiP: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;

  openPlayer: (video: Video, index: number) => void;
  nextVideo: () => void;
  closePlayer: () => void;
  minimize: () => void;
  maximize: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setIsPlaying: (v: boolean) => void;
  togglePiP: () => Promise<void>;
};

const PlayerContext = createContext<PlayerState | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
  allVideos: Video[];
}

export function PlayerProvider({ children, allVideos }: PlayerProviderProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const [isPiP, setIsPiP] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { savePosition, getSavedPosition } = usePlaybackMemory();

  // ── Open video ──
  const openPlayer = useCallback(
    (video: Video, index: number) => {
      const saved = getSavedPosition(video.id);

      setActiveVideo(video);
      setCurrentIndex(index);
      setIsMinimized(false);
      setIsPlaying(true);

      if (isFinite(saved) && saved > 0) {
        setTimeout(() => {
          if (videoRef.current && isFinite(saved)) videoRef.current.currentTime = saved;
          setCurrentTime(saved);
        }, 300);
      } else {
        setCurrentTime(0);
      }
    },
    [getSavedPosition]
  );

  // ── Next video ──
  const nextVideo = useCallback(() => {
    if (currentIndex < allVideos.length - 1) {
      const next = allVideos[currentIndex + 1];
      openPlayer(next, currentIndex + 1);
    }
  }, [allVideos, currentIndex, openPlayer]);

  // ── Close player ──
  const closePlayer = useCallback(() => {
    const vid = videoRef.current;

    if (vid && activeVideo) {
      if (isFinite(vid.currentTime)) {
        savePosition(activeVideo.id, vid.currentTime);
      }
      vid.pause();
    }

    setActiveVideo(null);
    setIsPlaying(false);
    setCurrentTime(0);
  }, [activeVideo, savePosition]);

  const minimize = () => setIsMinimized(true);
  const maximize = () => setIsMinimized(false);

  // ── Play / Pause ──
  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !activeVideo) return;

    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      if (isFinite(vid.currentTime)) {
        savePosition(activeVideo.id, vid.currentTime);
      }
      vid.pause();
      setIsPlaying(false);
    }
  }, [activeVideo, savePosition]);

  // ── Seek ──
  const seek = (seconds: number) => {
    const vid = videoRef.current;
    if (!vid || !isFinite(vid.duration) || !isFinite(vid.currentTime)) return;

    const newTime = vid.currentTime + seconds;
    if (isFinite(newTime)) {
      vid.currentTime = Math.max(0, Math.min(newTime, vid.duration));
    }
  };

  // ── Volume ──
  const setVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);

    if (videoRef.current) {
      videoRef.current.volume = clamped;
    }
  };

  // ── Speed ──
  const setPlaybackSpeed = (speed: number) => {
    setPlaybackSpeedState(speed);

    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // ── Picture-in-Picture ──
  const togglePiP = async () => {
    const vid = videoRef.current;
    if (!vid) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (document.pictureInPictureEnabled) {
        await vid.requestPictureInPicture();
        setIsPiP(true);

        vid.addEventListener(
          "leavepictureinpicture",
          () => setIsPiP(false),
          { once: true }
        );
      }
    } catch (err) {
      console.warn("PiP failed:", err);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        activeVideo,
        allVideos,
        currentIndex,
        isMinimized,
        isPlaying,
        currentTime,
        duration,
        playbackSpeed,
        volume,
        isPiP,
        videoRef,
        openPlayer,
        nextVideo,
        closePlayer,
        minimize,
        maximize,
        togglePlay,
        seek,
        setVolume,
        setPlaybackSpeed,
        setCurrentTime,
        setDuration,
        setIsPlaying,
        togglePiP,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx)
    throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}
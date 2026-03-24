"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useDominantColor } from '../../hooks/useDominantColor';

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoPlayer() {
  const {
    activeVideo, isMinimized, videoRef,
    isPlaying, currentTime, duration,
    playbackSpeed, volume, isPiP,
    togglePlay, seek, setVolume,
    setPlaybackSpeed, setCurrentTime,
    setDuration, setIsPlaying,
    togglePiP,
    nextVideo,
    minimize,
    maximize,
    closePlayer,
    allVideos,
    currentIndex,
    openPlayer,
  } = usePlayer();

  const bgColor = useDominantColor(activeVideo?.thumbnail ?? null);

  // Touch refs
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartVol = useRef(1);
  const isVolSwipe = useRef(false);

  // Mouse refs
  const isMouseDrag = useRef(false);
  const mouseStartY = useRef(0);
  const mouseStartVol = useRef(1);
  const inVolZone = useRef(false);

  // Double-tap refs
  const lastTapTime = useRef(0);
  const lastTapSide = useRef<'left' | 'right' | null>(null);

  // UI state
  const [skipFlash, setSkipFlash] = useState<'left' | 'right' | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [volumeOverlay, setVolumeOverlay] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [quality, setQuality] = useState('1080p');
  const [subtitles, setSubtitles] = useState('Off');
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [buffered, setBuffered] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  // Mocked Highlights (Segments in % start/end)
  const segments = [
    { start: 15, end: 22, color: 'bg-blue-400/40', label: 'Intro' },
    { start: 45, end: 58, color: 'bg-purple-400/40', label: 'Key Concept' },
    { start: 85, end: 95, color: 'bg-orange-400/40', label: 'Summary' }
  ];

  // Timers
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const volumeHideTimer = useRef<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const showVolumeFor = (vol: number) => {
    setVolumeOverlay(Math.round(vol * 100));
    if (volumeHideTimer.current) clearTimeout(volumeHideTimer.current);
    volumeHideTimer.current = setTimeout(() => setVolumeOverlay(null), 1500);
  };

  const lastVideoId = useRef<string | null>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !activeVideo) return;

    if (lastVideoId.current !== activeVideo.id) {
      lastVideoId.current = activeVideo.id;
      vid.volume = 0;
      vid.play().then(() => {
        setIsPlaying(true);
        let v = 0;
        const step = () => {
          v = Math.min(v + 0.05, 1);
          vid.volume = v;
          setVolume(v);
          if (v < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }).catch(() => {});
    }

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (volumeHideTimer.current) clearTimeout(volumeHideTimer.current);
    };
  }, [activeVideo, setIsPlaying, setVolume]);

  useEffect(() => {
    if (!isMinimized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMinimized]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut execution when typing in input/textarea (like comments)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          resetHideTimer();
          break;
        case 'f':
          e.preventDefault();
          if (isMinimized) maximize();
          else minimize();
          resetHideTimer();
          break;
        case 'm':
          e.preventDefault();
          if (videoRef.current) {
            if (volume > 0) {
              videoRef.current.dataset.lastVol = String(volume);
              setVolume(0);
            } else {
              setVolume(Number(videoRef.current.dataset.lastVol) || 1);
            }
          }
          resetHideTimer();
          break;
        case 'arrowright':
          e.preventDefault();
          seek(10);
          setSkipFlash('right');
          setTimeout(() => setSkipFlash(null), 600);
          resetHideTimer();
          break;
        case 'arrowleft':
          e.preventDefault();
          seek(-10);
          setSkipFlash('left');
          setTimeout(() => setSkipFlash(null), 600);
          resetHideTimer();
          break;
        case 'arrowup':
          e.preventDefault();
          const upVol = Math.min(1, volume + 0.1);
          setVolume(upVol);
          showVolumeFor(upVol);
          resetHideTimer();
          break;
        case 'arrowdown':
          e.preventDefault();
          const downVol = Math.max(0, volume - 0.1);
          setVolume(downVol);
          showVolumeFor(downVol);
          resetHideTimer();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, isMinimized, maximize, minimize, volume, setVolume, seek, videoRef, resetHideTimer]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isMouseDrag.current = true;
    mouseStartY.current = e.clientY;
    mouseStartVol.current = volume;
    inVolZone.current = e.clientX < e.currentTarget.offsetWidth * 0.35;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDrag.current || !inVolZone.current) return;
    const delta = -((e.clientY - mouseStartY.current) / 200);
    const newVol = Math.max(0, Math.min(1, mouseStartVol.current + delta));
    setVolume(newVol);
    showVolumeFor(newVol);
  };

  const handleMouseUp = () => { isMouseDrag.current = false; inVolZone.current = false; };
  const handleMouseLeave = () => { isMouseDrag.current = false; inVolZone.current = false; };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchStartVol.current = volume;
    isVolSwipe.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = e.touches[0].clientY - touchStartY.current;
    const isLeft = touchStartX.current < window.innerWidth * 0.35;
    if (isLeft && Math.abs(dy) > 10 && Math.abs(dy) > dx) {
      isVolSwipe.current = true;
      const newVol = Math.max(0, Math.min(1, touchStartVol.current + -(dy / 200)));
      setVolume(newVol);
      showVolumeFor(newVol);
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isVolSwipe.current) { isVolSwipe.current = false; return; }
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy > 80) { minimize(); return; }

    const now = Date.now();
    const x = e.changedTouches[0].clientX;
    const side = x < window.innerWidth / 2 ? 'left' : 'right';

    if (now - lastTapTime.current < 300 && lastTapSide.current === side) {
      seek(side === 'right' ? 10 : -10);
      setSkipFlash(side);
      setTimeout(() => setSkipFlash(null), 600);
      lastTapTime.current = 0;
    } else {
      lastTapTime.current = now;
      lastTapSide.current = side;
      resetHideTimer();
    }
  };

  const cycleSpeed = () => {
    const next = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 0.5 : 1;
    setPlaybackSpeed(next);
  };

  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!playerContainerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        if (playerContainerRef.current.requestFullscreen) {
          await playerContainerRef.current.requestFullscreen();
        } else if ((playerContainerRef.current as any).webkitRequestFullscreen) {
          await (playerContainerRef.current as any).webkitRequestFullscreen();
        }
        // Attempt to lock orientation to landscape on mobile
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        if (screen.orientation && (screen.orientation as any).unlock) {
          screen.orientation.unlock();
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  }, []);

  if (!activeVideo) return null;

  const volIcon = volume === 0 ? '🔇' : volume < 0.4 ? '🔉' : '🔊';

  const cssVars = {
    '--player-bg': `linear-gradient(180deg, ${bgColor} 0%, #000 100%)`,
    '--vol-height': `${volume * 100}%`,
    '--vol-bar-w': `${volumeOverlay ?? 0}%`,
    '--pt-safe': 'max(1rem, env(safe-area-inset-top))',
    '--pb-safe': 'max(2rem, env(safe-area-inset-bottom))',
  } as React.CSSProperties;

  return (
    <motion.div 
      ref={playerContainerRef}
      style={{
        ...cssVars,
        pointerEvents: 'auto',
        touchAction: 'none',
      }}
      layoutId={`card-${activeVideo.id}`}
      drag={isMinimized}
      dragConstraints={{ left: -1000, top: -1000, right: 0, bottom: 0 }}
      dragElastic={0.1}
      initial={{ opacity: 0, scale: 1.1 }}
      animate={
        isMinimized
          ? {
              width: 280,
              height: 158,
              bottom: 24,
              right: 24,
              opacity: 1,
              scale: 1,
              borderRadius: 16,
              zIndex: 50,
            }
          : {
              width: "100vw",
              height: "100vh",
              bottom: 0,
              right: 0,
              opacity: 1,
              scale: 1,
              borderRadius: 0,
              zIndex: 100,
            }
      }
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className={`fixed ${isMinimized ? 'shadow-2xl shadow-black/60 bg-black cursor-grab active:cursor-grabbing overflow-hidden ring-1 ring-white/10' : 'inset-0 bg-black'}`}
      onClick={() => {
        if (isMinimized && !isMouseDrag.current) {
          maximize();
        }
      }}
    >
      {/* Background layer behind video when maximized */}
      {!isMinimized && (
        <div className="absolute inset-0 transition-[background] duration-700 [background:var(--player-bg)]" />
      )}

      <video
        ref={videoRef}
        src={activeVideo.src}
        className="absolute inset-0 w-full h-full object-contain"
        playsInline
        muted
        loop={isLooping}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          if (e.currentTarget.buffered.length > 0) {
            setBuffered(e.currentTarget.buffered.end(e.currentTarget.buffered.length - 1));
          }
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={nextVideo}
        onError={() => setError("Failed to load video. Please check your connection.")}
      />

      {/* Branding Watermark (When Maximized) */}
      {!isMinimized && (
        <div className="absolute top-4 right-4 z-40 opacity-30 select-none pointer-events-none flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          <span className="text-white text-xs font-bold tracking-widest">ECO-STREAM</span>
        </div>
      )}

      {/* Error State Overlay */}
      {error && (
        <div className="absolute inset-0 z-[70] bg-black/90 flex flex-col items-center justify-center text-center p-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="mb-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div className="text-white font-bold text-xl mb-2">Oops! Something went wrong</div>
          <p className="text-white/60 text-sm max-w-xs mb-6">{error}</p>
          <button 
            onClick={() => { setError(null); if(videoRef.current) videoRef.current.load(); }}
            className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Central Play/Pause Fallback (When Maximized and not Playing) */}
      {!isMinimized && !isPlaying && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all scale-110 active:scale-95 shadow-2xl"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      )}

      {/* When Minimized: Mini Player Overlay */}
      {isMinimized && (
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closePlayer(); }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      )}

      {/* When Maximized: Fullscreen Controls */}
      {!isMinimized && (
        <div 
          className="absolute inset-0 flex flex-col select-none" 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={() => { resetHideTimer(); setIsSettingsOpen(false); setIsCommentsOpen(false); setIsPlaylistOpen(false); }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />
          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-white/10 pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 bg-green-400/60 rounded-r-full transition-all duration-100 [height:var(--vol-height)]" />
          </div>
          {volumeOverlay !== null && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
              <div className="bg-black/70 backdrop-blur-md rounded-2xl px-5 py-3 flex flex-col items-center gap-1">
                <span className="text-2xl">{volIcon}</span>
                <span className="text-white font-semibold text-base">{volumeOverlay}%</span>
                <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full transition-all duration-100 [width:var(--vol-bar-w)]" />
                </div>
              </div>
            </div>
          )}
          {skipFlash && (
            <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none z-20 ${skipFlash === 'left' ? 'left-8' : 'right-8'}`}>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-white font-semibold text-sm">{skipFlash === 'right' ? '+10s' : '-10s'}</span>
              </div>
            </div>
          )}
          <div className={`relative z-10 flex items-center justify-between px-4 [padding-top:var(--pt-safe)] transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
              onClick={(e) => { e.stopPropagation(); minimize(); }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white shrink-0"
              aria-label="Minimize player"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <h3 className="text-white text-sm font-semibold flex-1 text-center mx-3 truncate">
              {activeVideo.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/40 text-white hover:bg-white/20'}`}
                aria-label="Like"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsBookmarked(!isBookmarked); }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isBookmarked ? 'bg-yellow-500/20 text-yellow-500' : 'bg-black/40 text-white hover:bg-white/20'}`}
                aria-label="Bookmark"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(!isCommentsOpen); setIsPlaylistOpen(false); }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isCommentsOpen ? 'bg-white/20 text-white' : 'bg-black/40 text-white hover:bg-white/20'}`}
                aria-label="Comments"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsPlaylistOpen(!isPlaylistOpen); setIsCommentsOpen(false); }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isPlaylistOpen ? 'bg-white/20 text-white' : 'bg-black/40 text-white hover:bg-white/20'}`}
                aria-label="Playlist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsWatchLater(!isWatchLater); }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isWatchLater ? 'bg-indigo-500/20 text-indigo-400' : 'bg-black/40 text-white hover:bg-white/20'}`}
                aria-label="Add to Watch Later"
                title="Watch Later"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isWatchLater ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </button>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(window.location.href);
                    setShowShareToast(true);
                    setTimeout(() => setShowShareToast(false), 2000);
                  }}
                  className="p-2 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
                  aria-label="Share video link"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                </button>
                {showShareToast && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap animate-bounce">
                    Link Copied!
                  </div>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); minimize(); }}
                className="p-2 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-sm text-white transition-colors"
                aria-label="Minimize"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="3" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="9" y="8" width="7" height="5" rx="1" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1" />
          <div className={`relative z-10 px-4 [padding-bottom:var(--pb-safe)] transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="mb-5 px-1">
              <div 
                className="relative h-1.5 group/seek cursor-pointer"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const pct = x / rect.width;
                  setHoverTime(pct * duration);
                  setHoverX(x);
                }}
                onMouseLeave={() => setHoverTime(null)}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  const t = pct * duration;
                  if (videoRef.current) videoRef.current.currentTime = t;
                  setCurrentTime(t);
                }}
              >
                {/* Rail */}
                <div className="absolute inset-0 bg-white/20 rounded-full overflow-hidden">
                  {/* Buffer */}
                  <div 
                    className="absolute inset-x-0 h-full bg-white/20 transition-all duration-300" 
                    style={{ width: `${(buffered / duration) * 100}%` }}
                  />
                  {/* Highlights */}
                  {segments.map((s, i) => (
                    <div 
                      key={i}
                      className={`absolute h-full ${s.color}`}
                      style={{ left: `${s.start}%`, width: `${s.end - s.start}%` }}
                    />
                  ))}
                  {/* Progress */}
                  <div 
                    className="absolute inset-x-0 h-full bg-green-500 rounded-full" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                {/* Thumb hover handle */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity pointer-events-none"
                  style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                />
                {/* Tooltip & Preview */}
                {hoverTime !== null && (
                  <div 
                    className="absolute bottom-4 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
                    style={{ left: hoverX }}
                  >
                    <div className="w-32 aspect-video rounded-lg border-2 border-white/20 shadow-2xl bg-black overflow-hidden relative">
                      <img src={activeVideo.thumbnail} alt="Preview" className="w-full h-full object-cover blur-[1px] opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-white text-xs font-bold drop-shadow-md">{fmt(hoverTime)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-zinc-400 mt-1.5">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-2">
              <button
                onClick={(e) => { e.stopPropagation(); seek(-10); }}
                className="flex flex-col items-center gap-1 active:scale-110 transition-transform"
                aria-label="Rewind 10 seconds"
              >
                <RotateCcw size={24} color="white" strokeWidth={2} />
                <span className="text-white text-[10px] font-semibold leading-none">10s</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-900/50 active:scale-95 transition-transform"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="4" y="2" width="5" height="18" rx="1.5" fill="white"/>
                    <rect x="13" y="2" width="5" height="18" rx="1.5" fill="white"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M5 2l14 9-14 9V2z" fill="white"/>
                  </svg>
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); seek(10); }}
                className="flex flex-col items-center gap-1 active:scale-110 transition-transform"
                aria-label="Skip 10 seconds"
              >
                <RotateCw size={24} color="white" strokeWidth={2} />
                <span className="text-white text-[10px] font-semibold leading-none">10s</span>
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 mt-5 px-2 relative">
              <div className="hidden sm:flex items-center gap-3 flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    if (volume > 0) {
                      videoRef.current.dataset.lastVol = String(volume);
                      setVolume(0);
                    } else {
                      const prev = Number(videoRef.current.dataset.lastVol) || 1;
                      setVolume(prev);
                    }
                  }
                }}
                className="text-white/60 text-sm select-none hover:text-white cursor-pointer"
                aria-label={volume === 0 ? "Unmute" : "Mute"}
              >
                {volIcon}
              </button>
              <label htmlFor="volume-slider" className="sr-only">Volume</label>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-28 h-1 accent-green-400 cursor-pointer"
                onMouseDown={(e) => e.stopPropagation()}
              />
              <span className="text-white/40 text-xs w-8 tabular-nums" aria-hidden="true">
                {Math.round(volume * 100)}%
              </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Settings Toggle Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}
                  className={`p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                  aria-label="Settings"
                  aria-expanded={isSettingsOpen}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>

                {/* Fullscreen Toggle Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  aria-label="Toggle Fullscreen"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  </svg>
                </button>
              </div>

              {/* Settings Menu Popover */}
              {isSettingsOpen && (
                <div onClick={(e) => e.stopPropagation()} className="absolute bottom-14 right-0 w-64 max-h-[70vh] overflow-y-auto bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl z-50 text-sm select-none scrollbar-hide">
                  <div className="flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors" onClick={() => setIsLooping(!isLooping)}>
                    <div className="flex items-center gap-3"><RotateCcw size={16}/> <span>Loop</span></div>
                    <span className="text-white/50 text-xs">{isLooping ? 'On' : 'Off'}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors" onClick={cycleSpeed}>
                    <div className="flex items-center gap-3"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> <span>Play Speed</span></div>
                    <span className="text-white/50 text-xs">{playbackSpeed === 1 ? 'Normal' : `${playbackSpeed}x`}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors" onClick={() => setQuality(quality === '1080p' ? '720p' : quality === '720p' ? '4K' : '1080p')}>
                    <div className="flex items-center gap-3"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> <span>Quality</span></div>
                    <span className="text-white/50 text-xs">{quality}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors" onClick={() => setSubtitles(subtitles === 'Off' ? 'English (Auto)' : 'Off')}>
                    <div className="flex items-center gap-3"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><path d="M7 15h0M11 15h6M7 11h0M11 11h6"></path></svg> <span>Subtitles</span></div>
                    <span className="text-white/50 text-xs">{subtitles}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Side Comments Panel Overlay (When Maximized) */}
      {!isMinimized && isCommentsOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-72 sm:w-80 md:w-96 bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 z-[60] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-white font-bold text-lg">Comments</h2>
            <button onClick={() => setIsCommentsOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 pb-20 scrollbar-hide text-sm space-y-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 shrink-0 flex items-center justify-center text-emerald-400 font-bold">JD</div>
              <div>
                <div className="text-white/80 font-semibold mb-1">Jane Doe <span className="font-normal text-white/30 text-xs ml-2">2 days ago</span></div>
                <p className="text-white/60">This video completely changed my perspective on renewable microgrids. The 3:45 timestamp explains it perfectly.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 shrink-0 flex items-center justify-center text-blue-400 font-bold">AS</div>
              <div>
                <div className="text-white/80 font-semibold mb-1">Alex Smith <span className="font-normal text-white/30 text-xs ml-2">5 hours ago</span></div>
                <p className="text-white/60">Can anyone pinpoint where they sourced that efficiency data? Beautiful presentation.</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center pt-8 text-center text-white/30">
              <span className="text-4xl mb-2">💬</span>
              <p>Be the first to reply!</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-white/5">
            <div className="relative">
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full bg-black/50 border border-white/10 rounded-full px-4 py-3 pr-12 text-sm text-white placeholder-white/30 outline-none focus:border-green-500/50 transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-green-400 hover:text-green-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Side Playlist Panel Overlay (When Maximized) */}
      {!isMinimized && isPlaylistOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-72 sm:w-80 md:w-96 bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 z-[60] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-white font-bold text-lg">Up Next</h2>
            <button onClick={() => setIsPlaylistOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide space-y-2">
            {allVideos.slice(currentIndex + 1).map((v, idx) => (
              <div 
                key={v.id} 
                onClick={() => openPlayer(v, currentIndex + 1 + idx)}
                className="flex gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <div className="w-32 h-20 shrink-0 rounded-lg overflow-hidden relative bg-zinc-800">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity" />
                </div>
                <div className="flex-1 py-1">
                  <h4 className="text-white font-semibold text-sm line-clamp-2 leading-tight mb-1">{v.title}</h4>
                  <p className="text-zinc-400 text-xs truncate">{v.category || 'Nature Documentary'}</p>
                </div>
              </div>
            ))}
            {allVideos.slice(currentIndex + 1).length === 0 && (
              <div className="text-center text-white/40 pt-10 text-sm">
                You've reached the end of the list.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// src/hooks/usePlaybackMemory.ts

// Prefix all localStorage keys so they don't clash with other data
const PREFIX = "eco-stream:pos:";

export function usePlaybackMemory() {

  // Save a video's current time to localStorage
  const savePosition = (videoId: string, time: number) => {
    try {
      // Don't bother saving if less than 3 seconds in (treat as "not started")
      if (time < 3) {
        localStorage.removeItem(PREFIX + videoId);
      } else {
        localStorage.setItem(PREFIX + videoId, String(time));
      }
    } catch {
      // localStorage can throw in private browsing — fail silently
    }
  };

  // Get saved position, or 0 if none exists
  const getSavedPosition = (videoId: string): number => {
    try {
      const raw = localStorage.getItem(PREFIX + videoId);
      return raw ? parseFloat(raw) : 0;
    } catch {
      return 0;
    }
  };

  // Clear a saved position (e.g. when video finishes)
  const clearPosition = (videoId: string) => {
    try {
      localStorage.removeItem(PREFIX + videoId);
    } catch {}
  };

  return { savePosition, getSavedPosition, clearPosition };
}


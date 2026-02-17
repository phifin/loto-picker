// Simple audio player for local loto voice files with preloading
// Usage: playNumberAudio(5) -> plays ./assets/loto_voice_hoaimy/5.mp3

const AUDIO_BASE_PATH = "./assets/loto_voice_hoaimy";
const MIN_NUMBER = 1;
const MAX_NUMBER = 90;

// Preloaded audio cache
const audioCache = new Map();
let preloadPromise = null;
let currentAudio = null;
let audioContextUnlocked = false;

/**
 * Unlock audio context on mobile (requires user interaction)
 */
async function unlockAudioContext() {
  if (audioContextUnlocked) return true;
  
  try {
    // Create a silent audio to unlock audio context
    const unlockAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQQAAAAAAA==");
    unlockAudio.volume = 0.01;
    
    await unlockAudio.play();
    unlockAudio.pause();
    audioContextUnlocked = true;
    return true;
  } catch (error) {
    console.warn('Failed to unlock audio context:', error);
    return false;
  }
}

/**
 * Initialize audio context unlock (call on first user interaction)
 */
export function initAudioContext() {
  if (audioContextUnlocked) return;
  
  // Unlock on any user interaction
  const unlockEvents = ["touchstart", "touchend", "mousedown", "keydown", "click"];
  const unlockHandler = async () => {
    await unlockAudioContext();
    unlockEvents.forEach(event => {
      document.removeEventListener(event, unlockHandler);
    });
  };
  
  unlockEvents.forEach(event => {
    document.addEventListener(event, unlockHandler, { once: true, passive: true });
  });
}

/**
 * Preload all audio files for better mobile performance
 */
function preloadAllAudio() {
  if (preloadPromise) return preloadPromise;

  preloadPromise = Promise.all(
    Array.from({ length: MAX_NUMBER - MIN_NUMBER + 1 }, (_, i) => {
      const number = MIN_NUMBER + i;
      const filename = String(number);
      const audio = new Audio(`${AUDIO_BASE_PATH}/${filename}.mp3`);
      
      // Preload audio
      audio.preload = "auto";
      
      return new Promise((resolve) => {
        // Try to load the audio
        const handleCanPlay = () => {
          audio.removeEventListener("canplaythrough", handleCanPlay);
          audio.removeEventListener("error", handleError);
          audioCache.set(number, audio);
          resolve();
        };
        
        const handleError = () => {
          audio.removeEventListener("canplaythrough", handleCanPlay);
          audio.removeEventListener("error", handleError);
          // Still cache it even if load fails - might work on play
          audioCache.set(number, audio);
          resolve();
        };
        
        audio.addEventListener("canplaythrough", handleCanPlay, { once: true });
        audio.addEventListener("error", handleError, { once: true });
        
        // Trigger load
        audio.load();
        
        // Timeout after 2 seconds to avoid blocking
        setTimeout(() => {
          audio.removeEventListener("canplaythrough", handleCanPlay);
          audio.removeEventListener("error", handleError);
          audioCache.set(number, audio);
          resolve();
        }, 2000);
      });
    })
  );

  return preloadPromise;
}

/**
 * Initialize audio preloading (call this early in app lifecycle)
 */
export function initAudioPreload() {
  // Initialize audio context unlock
  initAudioContext();
  
  // Start preloading in background, don't block
  preloadAllAudio().catch(() => {
    // Ignore preload errors
  });
}

export function stopCurrentAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // Ignore errors from pausing/stopping
    }
    currentAudio = null;
  }
}

/**
 * Play audio for a number with improved mobile support
 * Returns a promise that resolves when audio starts playing or rejects on error
 */
export function playNumberAudio(number) {
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1 || n > 90) {
    return Promise.reject(new Error('Invalid number'));
  }

  // Stop any currently playing audio
  stopCurrentAudio();

  const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Always try to get from cache first, create new if not exists
  let audio = audioCache.get(n);
  if (!audio) {
    const filename = String(n);
    audio = new Audio(`${AUDIO_BASE_PATH}/${filename}.mp3`);
    audio.preload = "auto";
    audioCache.set(n, audio);
  }
  
  // Reset audio to beginning
  try {
    audio.currentTime = 0;
  } catch (e) {
    // Ignore reset errors
  }

  currentAudio = audio;

  // Return a promise for better control flow
  return new Promise(async (resolve, reject) => {
    // On mobile, ensure audio context is unlocked before playing
    if (isMobile && !audioContextUnlocked) {
      const unlocked = await unlockAudioContext();
      if (!unlocked) {
        console.warn('Audio context not unlocked, attempting to play anyway');
      }
    }

    let playAttempted = false;
    let timeoutId = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      audio.removeEventListener("canplaythrough", onCanPlayThrough);
      audio.removeEventListener("loadeddata", onLoadedData);
      audio.removeEventListener("error", onError);
    };

    const attemptPlay = async () => {
      if (playAttempted) return;
      playAttempted = true;
      cleanup();
      
      try {
        // Attempt to play
        await audio.play();
        resolve();
      } catch (error) {
        console.warn(`Play failed for number ${n}:`, error);
        
        // On mobile, if play fails due to NotAllowedError, try to unlock again
        if (isMobile && error.name === 'NotAllowedError') {
          try {
            await unlockAudioContext();
            await audio.play();
            resolve();
          } catch (retryError) {
            reject(retryError);
          }
        } else {
          reject(error);
        }
      }
    };

    const onCanPlayThrough = () => {
      attemptPlay();
    };

    const onLoadedData = () => {
      // If we have enough data, try to play
      if (audio.readyState >= 2) {
        attemptPlay();
      }
    };

    const onError = (error) => {
      cleanup();
      console.warn(`Audio load error for number ${n}:`, error);
      reject(error);
    };

    // Set up event listeners
    audio.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
    audio.addEventListener("loadeddata", onLoadedData, { once: true });
    audio.addEventListener("error", onError, { once: true });

    // If audio is already ready, play immediately
    if (audio.readyState >= 3) {
      attemptPlay();
    } else if (audio.readyState >= 2) {
      // Has enough data to start playing
      attemptPlay();
    } else {
      // Trigger load if needed
      if (audio.readyState === 0) {
        audio.load();
      }
      
      // Timeout fallback - try to play anyway after 1.5 seconds
      timeoutId = setTimeout(() => {
        if (!playAttempted && audio.readyState >= 1) {
          attemptPlay();
        } else if (!playAttempted) {
          cleanup();
          reject(new Error(`Audio not ready after timeout for number ${n}`));
        }
      }, 1500);
    }

    // Cleanup when audio ends
    audio.addEventListener(
      "ended",
      () => {
        if (currentAudio === audio) {
          currentAudio = null;
        }
      },
      { once: true }
    );
  });
}


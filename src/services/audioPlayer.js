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
function unlockAudioContext() {
  if (audioContextUnlocked) return;
  
  // Create a silent audio to unlock audio context
  const unlockAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQQAAAAAAA==");
  unlockAudio.volume = 0.01;
  
  const playPromise = unlockAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        unlockAudio.pause();
        audioContextUnlocked = true;
      })
      .catch(() => {
        // Ignore unlock errors
      });
  }
}

/**
 * Initialize audio context unlock (call on first user interaction)
 */
export function initAudioContext() {
  if (audioContextUnlocked) return;
  
  // Unlock on any user interaction
  const unlockEvents = ["touchstart", "touchend", "mousedown", "keydown"];
  const unlockHandler = () => {
    unlockAudioContext();
    unlockEvents.forEach(event => {
      document.removeEventListener(event, unlockHandler, { once: true });
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
 * Play audio for a number with retry logic for mobile
 * On mobile, we create a new Audio instance each time to avoid reuse issues
 */
export function playNumberAudio(number) {
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1 || n > 90) return;

  stopCurrentAudio();

  // On mobile, always create a new Audio instance to avoid reuse issues
  // On desktop, we can reuse cached audio
  const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  let audio;
  if (isMobile) {
    // Mobile: create new Audio instance each time
    const filename = String(n);
    audio = new Audio(`${AUDIO_BASE_PATH}/${filename}.mp3`);
    audio.preload = "auto";
    // Load immediately
    audio.load();
  } else {
    // Desktop: try to reuse cached audio
    audio = audioCache.get(n);
    if (!audio) {
      const filename = String(n);
      audio = new Audio(`${AUDIO_BASE_PATH}/${filename}.mp3`);
      audio.preload = "auto";
      audioCache.set(n, audio);
    } else {
      // Reset to beginning
      audio.currentTime = 0;
    }
  }

  currentAudio = audio;

  // Try to play with retry logic for mobile
  const attemptPlay = (retries = 3) => {
    // Try to unlock audio context if not already unlocked
    if (!audioContextUnlocked && isMobile) {
      unlockAudioContext();
    }
    
    // Ensure audio is loaded
    if (audio.readyState === 0) {
      audio.load();
    }
    
    // Wait for audio to be ready if needed
    if (audio.readyState < 2 && retries > 0) {
      const onCanPlay = () => {
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("canplaythrough", onCanPlayThrough);
        audio.removeEventListener("error", onError);
        audio.currentTime = 0;
        attemptPlay(retries - 1);
      };
      
      const onCanPlayThrough = () => {
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("canplaythrough", onCanPlayThrough);
        audio.removeEventListener("error", onError);
        audio.currentTime = 0;
        attemptPlay(retries - 1);
      };
      
      const onError = (error) => {
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("canplaythrough", onCanPlayThrough);
        audio.removeEventListener("error", onError);
        console.warn(`Audio load error for number ${n}:`, error);
        if (retries > 0) {
          // Retry with new audio instance on mobile
          if (isMobile) {
            setTimeout(() => {
              const filename = String(n);
              const newAudio = new Audio(`${AUDIO_BASE_PATH}/${filename}.mp3`);
              newAudio.preload = "auto";
              newAudio.load();
              currentAudio = newAudio;
              attemptPlay(retries - 1);
            }, 200);
          }
        }
      };
      
      audio.addEventListener("canplay", onCanPlay, { once: true });
      audio.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
      audio.addEventListener("error", onError, { once: true });
      
      // Trigger load
      audio.load();
      return;
    }
    
    // Try to play
    const playPromise = audio.play();
    
    playPromise.catch((error) => {
      // On mobile, sometimes we need to wait for audio to be ready
      if (retries > 0) {
        if (error.name === "NotAllowedError" || error.name === "NotSupportedError") {
          // Wait a bit and retry
          setTimeout(() => {
            if (currentAudio === audio) {
              audio.currentTime = 0;
              attemptPlay(retries - 1);
            }
          }, 150);
          return;
        }
        
        // If audio is not ready, wait for it
        if (audio.readyState < 2) {
          audio.addEventListener(
            "canplay",
            () => {
              if (currentAudio === audio) {
                audio.currentTime = 0;
                attemptPlay(retries - 1);
              }
            },
            { once: true }
          );
          // Trigger load if needed
          if (audio.readyState === 0) {
            audio.load();
          }
          return;
        }
      }
      
      // Final failure - log for debugging
      console.warn(`Failed to play audio for number ${n} after ${3 - retries} retries:`, error);
    });
  };

  attemptPlay();

  audio.addEventListener(
    "ended",
    () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
    },
    { once: true }
  );
  
  audio.addEventListener(
    "error",
    (e) => {
      console.warn(`Audio error for number ${n}:`, e);
      if (currentAudio === audio) {
        currentAudio = null;
      }
    },
    { once: true }
  );
}


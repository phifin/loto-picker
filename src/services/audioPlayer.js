// Simple audio player for local loto voice files with preloading
// Usage: playNumberAudio(5) -> plays ./assets/loto_voice_hoaimy/5.mp3

const AUDIO_BASE_PATH = "./assets/loto_voice_hoaimy";
const MIN_NUMBER = 1;
const MAX_NUMBER = 90;

// Preloaded audio cache
const audioCache = new Map();
let preloadPromise = null;
let currentAudio = null;

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
 */
export function playNumberAudio(number) {
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1 || n > 90) return;

  stopCurrentAudio();

  // Get audio from cache or create new one
  let audio = audioCache.get(n);
  
  if (!audio) {
    // Fallback: create new audio if not in cache yet
    const filename = String(n);
    audio = new Audio(`${AUDIO_BASE_PATH}/${filename}.mp3`);
    audio.preload = "auto";
    audioCache.set(n, audio);
  } else {
    // Reset audio to beginning if reusing cached audio
    audio.currentTime = 0;
  }

  currentAudio = audio;

  // Try to play with retry logic for mobile
  const attemptPlay = (retries = 2) => {
    const playPromise = audio.play();
    
    playPromise.catch((error) => {
      // On mobile, sometimes we need to wait for audio to be ready
      if (retries > 0 && (error.name === "NotAllowedError" || error.name === "NotSupportedError")) {
        // Wait a bit and retry
        setTimeout(() => {
          audio.currentTime = 0;
          attemptPlay(retries - 1);
        }, 100);
        return;
      }
      
      // If audio is not ready, wait for it
      if (retries > 0 && audio.readyState < 2) {
        audio.addEventListener(
          "canplay",
          () => {
            audio.currentTime = 0;
            attemptPlay(retries - 1);
          },
          { once: true }
        );
        // Trigger load if needed
        if (audio.readyState === 0) {
          audio.load();
        }
        return;
      }
      
      // Final failure - fail silently
      console.warn(`Failed to play audio for number ${n}:`, error);
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
}


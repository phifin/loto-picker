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
let silentAudio = null; // Keep audio context alive on mobile

/**
 * Unlock audio context on mobile (requires user interaction)
 * This is called on first user interaction
 */
async function unlockAudioContext() {
  if (audioContextUnlocked) return true;
  
  try {
    // Create a silent audio to test unlock
    const unlockAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQQAAAAAAA==");
    unlockAudio.volume = 0;
    
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
 * Start silent audio loop to keep audio context alive (mobile only)
 * Call this when entering host game screen
 */
export async function startSilentAudio() {
  if (silentAudio) return; // Already running
  
  const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return; // Only needed on mobile
  
  try {
    silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQQAAAAAAA==");
    silentAudio.loop = true;
    silentAudio.volume = 0;
    
    await silentAudio.play();
    audioContextUnlocked = true;
  } catch (error) {
    console.warn('Failed to start silent audio:', error);
  }
}

/**
 * Stop the silent audio loop (call when leaving host game screen)
 */
export function stopSilentAudio() {
  if (silentAudio) {
    silentAudio.pause();
    silentAudio = null;
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
 * Play audio for a number - simple and reliable
 */
export function playNumberAudio(number) {
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1 || n > 90) return;

  // Stop any currently playing audio
  stopCurrentAudio();

  const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  let audio;
  
  if (isMobile) {
    // Mobile: Always create new Audio instance to avoid reuse issues
    const filename = String(n);
    audio = new Audio(`${AUDIO_BASE_PATH}/${filename}.mp3`);
    audio.preload = "auto";
    // Load immediately
    audio.load();
  } else {
    // Desktop: Reuse cached audio
    audio = audioCache.get(n);
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
  }

  currentAudio = audio;

  // Simple play with error handling
  const playPromise = audio.play();
  
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.warn(`Audio play failed for number ${n}:`, error.name);
    });
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
}


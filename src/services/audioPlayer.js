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

// Web Audio API context for mobile
let audioContext = null;
let oscillatorNode = null; // Keep context alive

/**
 * Get or create AudioContext
 */
function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  return audioContext;
}

/**
 * Start oscillator to keep audio context alive on mobile
 */
function startAudioContextKeepAlive() {
  const ctx = getAudioContext();
  if (!ctx || oscillatorNode) return;
  
  try {
    // Create a silent oscillator that keeps context alive
    oscillatorNode = ctx.createOscillator();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0; // Silent
    oscillatorNode.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillatorNode.start();
    console.log('[Audio] Keep-alive oscillator started');
  } catch (error) {
    console.warn('[Audio] Failed to start keep-alive:', error);
  }
}

/**
 * Stop oscillator
 */
function stopAudioContextKeepAlive() {
  if (oscillatorNode) {
    try {
      oscillatorNode.stop();
      oscillatorNode.disconnect();
    } catch (e) {
      // Ignore
    }
    oscillatorNode = null;
    console.log('[Audio] Keep-alive oscillator stopped');
  }
}

/**
 * Unlock audio context on mobile (requires user interaction)
 */
async function unlockAudioContext() {
  if (audioContextUnlocked) return true;
  
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    // Also try HTML5 audio unlock
    const unlockAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQQAAAAAAA==");
    unlockAudio.volume = 0;
    await unlockAudio.play();
    unlockAudio.pause();
    
    audioContextUnlocked = true;
    console.log('[Audio] Context unlocked');
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
  const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) return; // Only needed on mobile
  
  // Unlock audio context first
  await unlockAudioContext();
  
  // Start Web Audio API keep-alive
  startAudioContextKeepAlive();
}

/**
 * Stop the silent audio loop (call when leaving host game screen)
 */
export function stopSilentAudio() {
  stopAudioContextKeepAlive();
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
  
  // Resume audio context if suspended (mobile)
  if (isMobile) {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(e => console.warn('Failed to resume context:', e));
    }
  }
  
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


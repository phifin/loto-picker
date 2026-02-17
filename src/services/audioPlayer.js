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

// Debug logger for mobile
const debugLogs = [];
const MAX_DEBUG_LOGS = 10;

function debugLog(message) {
  console.log(message);
  debugLogs.push(`${new Date().toLocaleTimeString()}: ${message}`);
  if (debugLogs.length > MAX_DEBUG_LOGS) {
    debugLogs.shift();
  }
  updateDebugUI();
}

function updateDebugUI() {
  let debugEl = document.getElementById('audioDebug');
  if (!debugEl) {
    debugEl = document.createElement('div');
    debugEl.id = 'audioDebug';
    debugEl.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,0.9);color:#0f0;font-size:10px;padding:8px;max-height:150px;overflow-y:auto;z-index:9999;font-family:monospace;';
    document.body.appendChild(debugEl);
  }
  debugEl.innerHTML = debugLogs.join('<br>');
  debugEl.scrollTop = debugEl.scrollHeight;
}

// Clear debug on double tap
if (typeof window !== 'undefined') {
  let lastTap = 0;
  document.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      const debugEl = document.getElementById('audioDebug');
      if (debugEl && e.target === debugEl) {
        debugLogs.length = 0;
        updateDebugUI();
      }
    }
    lastTap = currentTime;
  });
}

/**
 * Unlock audio context on mobile (requires user interaction)
 */
async function unlockAudioContext() {
  if (audioContextUnlocked) return true;
  
  debugLog('[Unlock] Attempting to unlock audio context');
  
  try {
    // Create a silent audio to unlock audio context
    const unlockAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQQAAAAAAA==");
    unlockAudio.volume = 0.01;
    
    await unlockAudio.play();
    unlockAudio.pause();
    audioContextUnlocked = true;
    debugLog('[Unlock] Audio context unlocked successfully');
    return true;
  } catch (error) {
    debugLog(`[Unlock] Failed: ${error.name} - ${error.message}`);
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
 * Play audio for a number - simple and reliable
 */
export function playNumberAudio(number) {
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1 || n > 90) return;

  debugLog(`[Play] Number ${n} - Starting`);

  // Stop any currently playing audio
  stopCurrentAudio();

  const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  debugLog(`[Play] isMobile: ${isMobile}, unlocked: ${audioContextUnlocked}`);
  
  let audio;
  
  if (isMobile) {
    // Mobile: Always create new Audio instance to avoid reuse issues
    const filename = String(n);
    audio = new Audio(`${AUDIO_BASE_PATH}/${filename}.mp3`);
    audio.preload = "auto";
    debugLog(`[Play] Created new audio, readyState: ${audio.readyState}`);
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
    playPromise
      .then(() => {
        debugLog(`[Play] ✓ Number ${n} playing`);
      })
      .catch((error) => {
        debugLog(`[Play] ✗ Number ${n} failed: ${error.name}`);
      });
  }

  // Cleanup when audio ends
  audio.addEventListener(
    "ended",
    () => {
      debugLog(`[Play] Number ${n} ended`);
      if (currentAudio === audio) {
        currentAudio = null;
      }
    },
    { once: true }
  );
  
  // Add error listener
  audio.addEventListener(
    "error",
    (e) => {
      debugLog(`[Play] Error event for ${n}`);
    },
    { once: true }
  );
}


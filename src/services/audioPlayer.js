// Simple audio player for local loto voice files
// Usage: playNumberAudio(5) -> plays ./assets/loto_voice_hoaimy/5.mp3

const AUDIO_BASE_PATH = "./assets/loto_voice_hoaimy";

let currentAudio = null;

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

export function playNumberAudio(number) {
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1 || n > 90) return;

  stopCurrentAudio();

  const audio = new Audio(`${AUDIO_BASE_PATH}/${n}.mp3`);
  currentAudio = audio;

  audio.play().catch(() => {
    // Autoplay restrictions or missing file – fail silently
  });

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


// PWA Install Prompt - Ask user to add to home screen

const STORAGE_KEY = "loto_install_prompt";

export function initInstallPrompt() {
  if (window.matchMedia("(display-mode: standalone)").matches) return;
  if (localStorage.getItem(STORAGE_KEY) === "dismissed") return;

  const banner = document.getElementById("installBanner");
  if (!banner) return;

  const btnInstall = document.getElementById("btnInstall");
  const btnDismiss = document.getElementById("btnDismiss");
  const iosHint = document.getElementById("installIosHint");

  let deferredPrompt = null;

  // Chrome/Edge: beforeinstallprompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (iosHint) iosHint.classList.add("hidden");
    banner.classList.remove("hidden");
  });

  // iOS: Show instructions (no beforeinstallprompt API)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone === true;
  if (isIOS && !isStandalone) {
    if (iosHint) iosHint.classList.remove("hidden");
    if (btnInstall) btnInstall.style.display = "none";
    setTimeout(() => banner.classList.remove("hidden"), 1500);
  }

  function hide() {
    banner.classList.add("hidden");
    localStorage.setItem(STORAGE_KEY, "dismissed");
  }

  if (btnInstall) {
    btnInstall.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") hide();
        deferredPrompt = null;
      } else {
        hide();
      }
    };
  }

  if (btnDismiss) {
    btnDismiss.onclick = hide;
  }
}

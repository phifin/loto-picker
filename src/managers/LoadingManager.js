/**
 * Manages the loading screen
 */
export class LoadingManager {
  constructor() {
    this.loadingScreen = document.getElementById("loadingScreen");
    this.loadingHidden = false;
  }

  hide() {
    if (this.loadingHidden || !this.loadingScreen) return;
    this.loadingHidden = true;
    
    this.loadingScreen.classList.add("hidden");
    // Remove from DOM after animation completes
    setTimeout(() => {
      if (this.loadingScreen && this.loadingScreen.parentNode) {
        this.loadingScreen.remove();
      }
    }, 300);
  }

  /**
   * Hide loading screen with proper timing to ensure UI is rendered
   */
  hideAfterRender() {
    // Use requestAnimationFrame to ensure DOM is painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Small delay to ensure initial render completes
        setTimeout(() => {
          this.hide();
        }, 200);
      });
    });
  }
}

/**
 * Manages the player "More" menu (theme toggle + color picker)
 */
export class PlayerMenuManager {
  constructor({ elements }) {
    this.elements = elements;
    this._setupEventListeners();
  }

  _setupEventListeners() {
    if (!this.elements.btnPlayerMore || !this.elements.playerMoreMenu) {
      return;
    }

    const themeToggleBtn = this.elements.themeToggleGame;
    const colorInput = this.elements.colorPickerEl;

    // Toggle menu
    this.elements.btnPlayerMore.addEventListener("click", (e) => {
      e.stopPropagation();
      this.elements.playerMoreMenu.classList.toggle("open");
    });

    // Click outside to close menu
    const handleClickOutside = (e) => {
      if (
        this.elements.playerMoreMenu.classList.contains("open") &&
        !this.elements.playerMoreMenu.contains(e.target) &&
        !this.elements.btnPlayerMore.contains(e.target)
      ) {
        this.elements.playerMoreMenu.classList.remove("open");
      }
    };

    // Use capture phase to catch clicks before they bubble
    document.addEventListener("click", handleClickOutside, true);

    // Menu item handlers
    const btnPlayerTheme = document.getElementById("playerMoreThemeToggle");
    const btnPlayerColor = document.getElementById("playerMoreColor");

    btnPlayerTheme?.addEventListener("click", () => {
      this.elements.playerMoreMenu.classList.remove("open");
      themeToggleBtn?.click();
    });

    btnPlayerColor?.addEventListener("click", () => {
      this.elements.playerMoreMenu.classList.remove("open");
      
      // On mobile, color picker is hidden, so we need to temporarily show it
      if (colorInput) {
        const wrapper = colorInput.closest('.color-picker-wrap');
        const wasHidden = wrapper && wrapper.classList.contains('mobile-hidden');
        
        // Temporarily remove mobile-hidden to make it clickable
        if (wasHidden) {
          wrapper.classList.remove('mobile-hidden');
        }
        
        // Trigger click
        setTimeout(() => {
          colorInput.click();
          
          // Restore mobile-hidden after a short delay
          if (wasHidden) {
            setTimeout(() => {
              wrapper.classList.add('mobile-hidden');
            }, 100);
          }
        }, 10);
      }
    });
  }
}

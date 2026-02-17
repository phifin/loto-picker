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
      
      // On mobile, create a temporary visible color input to trigger picker
      if (colorInput) {
        // Create a temporary input that's actually visible
        const tempInput = document.createElement('input');
        tempInput.type = 'color';
        tempInput.value = colorInput.value;
        tempInput.style.cssText = 'position:absolute;opacity:0;pointer-events:none;';
        document.body.appendChild(tempInput);
        
        // Listen for color change
        tempInput.addEventListener('change', (e) => {
          // Update the real color input
          colorInput.value = e.target.value;
          // Trigger change event on real input
          const changeEvent = new Event('input', { bubbles: true });
          colorInput.dispatchEvent(changeEvent);
          // Remove temp input
          document.body.removeChild(tempInput);
        });
        
        // Trigger click on temp input
        setTimeout(() => {
          tempInput.click();
        }, 10);
        
        // Cleanup if user cancels (after 5 seconds)
        setTimeout(() => {
          if (tempInput.parentNode) {
            document.body.removeChild(tempInput);
          }
        }, 5000);
      }
    });
  }
}

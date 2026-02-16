// Screen navigation and visibility management

// Steps for the main app flow
// - selectRole  -> choose User / Host
// - selectMode  -> choose Single / Multi
// - selectBoard -> choose board(s)
// - game        -> playing on selected board(s)

export class ScreenManager {
  constructor(elements) {
    this.modeScreen = elements.modeScreen;
    this.selectScreen = elements.selectScreen;
    this.gameScreen = elements.gameScreen;
    this.selectTitle = elements.selectTitle;
    this.multiSelectInfo = elements.multiSelectInfo;
    this.selectedCount = elements.selectedCount;

    // Inside mode screen
    this.roleSubtitle = elements.roleSubtitle;
    this.roleSelection = elements.roleSelection;
    this.modeSelection = elements.modeSelection;
    this.modeSubtitle = elements.modeSubtitle;
    this.modeBackButton = elements.btnBackToRole;

    this.currentStep = "selectRole";
  }

  /**
   * Set the current step and ensure only the relevant UI is visible.
   * step: "selectRole" | "selectMode" | "selectBoard" | "game"
   */
  setStep(step) {
    this.currentStep = step;

    // Hide all top-level screens
    this.modeScreen.classList.add("hidden");
    this.selectScreen.classList.add("hidden");
    this.gameScreen.classList.add("hidden");

    // Hide all sub-sections in mode screen by default
    if (this.roleSubtitle) this.roleSubtitle.classList.add("hidden");
    if (this.roleSelection) this.roleSelection.classList.add("hidden");
    if (this.modeSubtitle) this.modeSubtitle.classList.add("hidden");
    if (this.modeSelection) this.modeSelection.classList.add("hidden");
    if (this.modeBackButton) this.modeBackButton.classList.add("hidden");

    switch (step) {
      case "selectRole": {
        // Role selection only
        this.modeScreen.classList.remove("hidden");
        if (this.roleSubtitle) this.roleSubtitle.classList.remove("hidden");
        if (this.roleSelection) this.roleSelection.classList.remove("hidden");
        break;
      }
      case "selectMode": {
        // Mode selection + back-to-role button
        this.modeScreen.classList.remove("hidden");
        if (this.modeSubtitle) this.modeSubtitle.classList.remove("hidden");
        if (this.modeSelection) this.modeSelection.classList.remove("hidden");
        if (this.modeBackButton) this.modeBackButton.classList.remove("hidden");
        break;
      }
      case "selectBoard": {
        // Board selection screen
        this.selectScreen.classList.remove("hidden");
        break;
      }
      case "game": {
        // In-game screen
        this.gameScreen.classList.remove("hidden");
        break;
      }
    }
  }

  // Backwards-compatible helpers used by UIManager

  showMode() {
    this.setStep("selectRole");
  }

  showSelect(isMultiMode = false) {
    this.setStep("selectBoard");

    if (isMultiMode) {
      this.selectTitle.textContent = "🎰 Chọn các bàn muốn chơi";
      this.multiSelectInfo.classList.remove("hidden");
    } else {
      this.selectTitle.textContent = "🎯 Chọn bàn Loto";
      this.multiSelectInfo.classList.add("hidden");
    }
  }

  showGame() {
    this.setStep("game");
  }

  updateSelectedCount(count) {
    this.selectedCount.textContent = count;
  }
}

// Screen navigation and visibility management

export class ScreenManager {
  constructor(elements) {
    this.modeScreen = elements.modeScreen;
    this.selectScreen = elements.selectScreen;
    this.gameScreen = elements.gameScreen;
    this.selectTitle = elements.selectTitle;
    this.multiSelectInfo = elements.multiSelectInfo;
    this.selectedCount = elements.selectedCount;
  }

  showMode() {
    this.modeScreen.classList.remove("hidden");
    this.selectScreen.classList.add("hidden");
    this.gameScreen.classList.add("hidden");
  }

  showSelect(isMultiMode = false) {
    this.modeScreen.classList.add("hidden");
    this.selectScreen.classList.remove("hidden");
    this.gameScreen.classList.add("hidden");
    
    if (isMultiMode) {
      this.selectTitle.textContent = "🎰 Chọn các bàn muốn chơi";
      this.multiSelectInfo.classList.remove("hidden");
    } else {
      this.selectTitle.textContent = "🎯 Chọn bàn Loto";
      this.multiSelectInfo.classList.add("hidden");
    }
  }

  showGame() {
    this.modeScreen.classList.add("hidden");
    this.selectScreen.classList.add("hidden");
    this.gameScreen.classList.remove("hidden");
  }

  updateSelectedCount(count) {
    this.selectedCount.textContent = count;
  }
}

/**
 * Manages game mode selection (Single vs Multi board)
 */
export class ModeManager {
  constructor({ elements, uiManager, multiBoardMgr, boardData, onStartSingle, onStartMulti }) {
    this.elements = elements;
    this.uiManager = uiManager;
    this.multiBoardMgr = multiBoardMgr;
    this.boardData = boardData;
    this.onStartSingle = onStartSingle;
    this.onStartMulti = onStartMulti;
    
    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Single mode button
    if (this.elements.btnSingleMode) {
      this.elements.btnSingleMode.onclick = () => this.selectSingleMode();
    }

    // Multi mode button
    if (this.elements.btnMultiMode) {
      this.elements.btnMultiMode.onclick = () => this.selectMultiMode();
    }

    // Start multi game button
    if (this.elements.btnStartMulti) {
      this.elements.btnStartMulti.onclick = () => this.startMultiGame();
    }

    // Back to mode selection
    if (this.elements.btnBackToMode) {
      this.elements.btnBackToMode.onclick = () => this.backToModeSelection();
    }
  }

  selectSingleMode() {
    this.multiBoardMgr.setMode(false);
    this.uiManager.showSelect(false);
    this.uiManager.renderBoardList(
      this.boardData,
      (board) => this.onStartSingle(board)
    );
  }

  selectMultiMode() {
    this.multiBoardMgr.setMode(true);
    this.multiBoardMgr.clearSelection();
    this.uiManager.showSelect(true);
    this.uiManager.renderBoardList(
      this.boardData,
      (board) => this.toggleBoardSelection(board),
      this.multiBoardMgr
    );
    this.uiManager.updateSelectedCount(0);
    // Require at least 2 boards
    this.elements.btnStartMulti.disabled = true;
  }

  toggleBoardSelection(board) {
    this.multiBoardMgr.toggleBoard(board);
    const count = this.multiBoardMgr.getSelectedCount();
    this.uiManager.updateSelectedCount(count);
    // Require at least 2 boards for multi-mode
    this.elements.btnStartMulti.disabled = count < 2;
    this.uiManager.renderBoardList(
      this.boardData,
      (board) => this.toggleBoardSelection(board),
      this.multiBoardMgr
    );
  }

  startMultiGame() {
    const selectedBoards = this.multiBoardMgr.getSelectedBoards();
    if (selectedBoards.length === 0) return;
    this.onStartMulti(selectedBoards);
  }

  backToModeSelection() {
    // Clear any board selection state but keep current role
    this.multiBoardMgr.reset();
    // Go back to mode selection step
    this.uiManager.setStep("selectMode");
  }
}

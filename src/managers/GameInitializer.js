import { loadColor, loadMarked } from "../services/storage.js";
import { createCellClickHandler, createMultiCellClickHandler } from "../events/eventHandlers.js";

/**
 * Handles initialization of single and multi-board games
 */
export class GameInitializer {
  constructor({ 
    elements, 
    gameState, 
    gameLogic, 
    uiManager, 
    multiBoardMgr,
    hostController,
    roleManager
  }) {
    this.elements = elements;
    this.gameState = gameState;
    this.gameLogic = gameLogic;
    this.uiManager = uiManager;
    this.multiBoardMgr = multiBoardMgr;
    this.hostController = hostController;
    this.roleManager = roleManager;
  }

  /**
   * Apply color to action buttons
   */
  applyActionButtonsColor(hex) {
    if (this.elements.actionsBar) {
      this.elements.actionsBar.style.setProperty("--action-btn-color", hex);
    }
  }

  /**
   * Start a single board game
   */
  startSingleGame(boardData) {
    this.gameState.setCurrentBoard(boardData);
    this.gameState.resetForNewGame();
    this.elements.inputEl.value = "";

    // Show color picker in single mode
    this.elements.colorPickerWrap.style.display = "flex";
    const color = loadColor(boardData.id, boardData.color);
    this.elements.colorPickerEl.value = color;
    this.applyActionButtonsColor(color);

    // Render single board
    const boardWrapper = document.createElement("div");
    boardWrapper.className = "board-wrapper single-board";

    const boardElement = document.createElement("div");
    boardElement.className = "board";
    boardElement.style.setProperty("--cell-color", color);

    boardData.data.forEach((row, rowIndex) => {
      row.forEach((v) => {
        const div = document.createElement("div");
        div.dataset.row = rowIndex;
        
        if (v === null) {
          div.className = "cell empty";
        } else {
          div.className = "cell num";
          div.textContent = v;
          this.gameState.addCell(v, div, rowIndex);
          
          const cellClickHandler = createCellClickHandler(
            this.gameState,
            this.gameLogic,
            this.uiManager,
            boardData.id
          );
          
          const num = v;
          div.onclick = () => {
            if (this.roleManager.isHost() && !this.hostController.canManualTick(num)) {
              this.hostController.showNotCalledFeedback(num);
              return;
            }
            cellClickHandler(div, rowIndex);
          };
        }
        boardElement.appendChild(div);
      });
    });

    boardWrapper.appendChild(boardElement);
    this.elements.boardsContainer.innerHTML = "";
    this.elements.boardsContainer.appendChild(boardWrapper);

    // Restore saved state
    this.gameLogic.restoreMarked(boardData.id, this.gameState);
    this.uiManager.updateRowCounter(this.gameState);

    // Show game screen and focus input
    this.uiManager.showGame();
    this.elements.inputEl.focus();
  }

  /**
   * Start a multi-board game
   */
  startMultiGame(boards) {
    this.multiBoardMgr.clearBoardStates();
    this.elements.inputEl.value = "";

    // Hide color picker in multi mode
    this.elements.colorPickerWrap.style.display = "none";
    // Use first board's color for action buttons
    const firstColor = loadColor(boards[0].id, boards[0].color);
    this.applyActionButtonsColor(firstColor);

    // Create multi-cell click handler
    const baseHandler = createMultiCellClickHandler(
      this.multiBoardMgr,
      this.gameLogic,
      this.uiManager,
      boards
    );
    
    const multiCellClickHandler = (number, boardId, cellElement, rowIndex) => {
      if (this.roleManager.isHost() && !this.hostController.canManualTick(number)) {
        this.hostController.showNotCalledFeedback(number);
        return;
      }
      baseHandler(number, boardId, cellElement, rowIndex);
    };

    // Render all boards
    this.uiManager.renderMultipleBoards(boards, this.multiBoardMgr, multiCellClickHandler);

    // Restore saved state for each board
    boards.forEach(board => {
      const boardState = this.multiBoardMgr.getBoardState(board.id);
      const saved = loadMarked(board.id);
      saved.forEach(num => {
        const entry = boardState.cellMap.get(num);
        if (entry) entry.el.classList.add("marked");
      });

      // Check rows silently
      for (let r = 0; r < 9; r++) {
        this.gameLogic.checkRowSilentMulti(board.id, r, this.multiBoardMgr, this.uiManager);
      }
    });

    // Show game screen and focus input
    this.uiManager.showGame();
    this.elements.inputEl.focus();
  }
}

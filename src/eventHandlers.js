// Event handlers setup
import { saveMarked, clearMarked } from "./storage.js";

export function setupEventHandlers(elements, gameState, uiManager, gameLogic, boards, startSingleGame, multiBoardMgr, startMultiGame) {
  const { inputEl, btnReset, btnBack, colorPickerEl } = elements;

  // Number input handler
  inputEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    
    const value = Number(e.target.value);
    e.target.value = "";
    
    if (multiBoardMgr.isMulti()) {
      // Multi-board mode: mark number on all boards
      const selectedBoards = multiBoardMgr.getSelectedBoards();
      selectedBoards.forEach(board => {
        const boardState = multiBoardMgr.getBoardState(board.id);
        if (!boardState || !boardState.cellMap.has(value)) return;
        
        const { el, row } = boardState.cellMap.get(value);
        if (el.classList.contains("marked")) return; // Already marked
        
        el.classList.add("marked");
        uiManager.flashCell(el);
        gameLogic.checkRowMulti(board.id, row, multiBoardMgr, uiManager);
        saveMarked(board.id, boardState.cellMap);
      });
    } else {
      // Single board mode
      const board = gameState.getCurrentBoard();
      if (!board) return;
      
      gameLogic.markNumber(value, gameState, () => {
        saveMarked(board.id, gameState.cellMap);
        uiManager.updateRowCounter(gameState);
      });
    }
  });

  // Color picker handler (not used in multi-mode)
  colorPickerEl.addEventListener("input", (e) => {
    const board = gameState.getCurrentBoard();
    uiManager.applyBoardColor(e.target.value, board?.id);
  });

  // Reset button handler
  btnReset.onclick = () => {
    uiManager.resetMarkedCells();
    inputEl.value = "";
    
    if (multiBoardMgr.isMulti()) {
      // Reset all boards
      const selectedBoards = multiBoardMgr.getSelectedBoards();
      selectedBoards.forEach(board => {
        const boardState = multiBoardMgr.getBoardState(board.id);
        if (boardState) {
          boardState.alertedRows.clear();
        }
        clearMarked(board.id);
      });
    } else {
      // Reset single board
      gameState.alertedRows.clear();
      const board = gameState.getCurrentBoard();
      if (board) clearMarked(board.id);
    }
    
    uiManager.updateRowCounter(gameState);
  };

  // Back button handler
  btnBack.onclick = () => {
    gameState.clearState();
    multiBoardMgr.reset();
    uiManager.clearBoard();
    uiManager.showMode();
  };
}

// Cell click handler factory for single board
export function createCellClickHandler(gameState, gameLogic, uiManager, boardId) {
  return (cellElement, rowIndex) => {
    cellElement.classList.toggle("marked");
    
    saveMarked(boardId, gameState.cellMap);
    gameLogic.checkRow(rowIndex, gameState);
    uiManager.updateRowCounter(gameState);
  };
}

// Cell click handler factory for multi-board
export function createMultiCellClickHandler(multiBoardMgr, gameLogic, uiManager, boards) {
  return (number, boardId, cellElement, rowIndex) => {
    const isMarked = cellElement.classList.contains("marked");
    
    // Sync across all boards
    boards.forEach(board => {
      const boardState = multiBoardMgr.getBoardState(board.id);
      if (!boardState || !boardState.cellMap.has(number)) return;
      
      const { el, row } = boardState.cellMap.get(number);
      
      if (isMarked) {
        // Unmark
        el.classList.remove("marked");
      } else {
        // Mark
        el.classList.add("marked");
      }
      
      gameLogic.checkRowMulti(board.id, row, multiBoardMgr, uiManager);
      saveMarked(board.id, boardState.cellMap);
    });
  };
}

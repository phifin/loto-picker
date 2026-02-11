// Event handlers setup
import { saveMarked, clearMarked } from "./storage.js";

export function setupEventHandlers(elements, gameState, uiManager, gameLogic, boards, startGame) {
  const { inputEl, btnReset, btnBack, colorPickerEl } = elements;

  // Number input handler
  inputEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    
    const value = Number(e.target.value);
    e.target.value = "";
    
    const board = gameState.getCurrentBoard();
    if (!board) return;
    
    gameLogic.markNumber(value, gameState, () => {
      saveMarked(board.id, gameState.cellMap);
      uiManager.updateRowCounter(gameState);
    });
  });

  // Color picker handler
  colorPickerEl.addEventListener("input", (e) => {
    const board = gameState.getCurrentBoard();
    uiManager.applyBoardColor(e.target.value, board?.id);
  });

  // Reset button handler
  btnReset.onclick = () => {
    uiManager.resetMarkedCells();
    gameState.alertedRows.clear();
    inputEl.value = "";
    
    const board = gameState.getCurrentBoard();
    if (board) clearMarked(board.id);
    
    uiManager.updateRowCounter(gameState);
  };

  // Back button handler
  btnBack.onclick = () => {
    gameState.clearState();
    uiManager.clearBoard();
    uiManager.refreshBoardList(boards, startGame);
    uiManager.showSelect();
  };
}

// Cell click handler factory
export function createCellClickHandler(gameState, gameLogic, uiManager) {
  return (cellElement, rowIndex) => {
    cellElement.classList.toggle("marked");
    
    const board = gameState.getCurrentBoard();
    if (board) {
      saveMarked(board.id, gameState.cellMap);
    }
    
    gameLogic.checkRow(rowIndex, gameState);
    uiManager.updateRowCounter(gameState);
  };
}

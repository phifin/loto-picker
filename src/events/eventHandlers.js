// Event handlers setup
import { saveMarked, clearMarked } from "../services/storage.js";
import { initVirtualNumpad } from "../ui/virtualNumpad.js";

export function setupEventHandlers(
  elements,
  gameState,
  uiManager,
  gameLogic,
  boards,
  startSingleGame,
  multiBoardMgr,
  startMultiGame,
  applyActionButtonsColor,
  options = {}
) {
  const { inputEl, btnReset, btnBack, colorPickerEl } = elements;
  const { canManualTick, onBlocked } = options;

  // Submit số từ input (dùng cho cả keydown Enter và bàn phím ảo)
  function submitNumberInput(value) {
    if (canManualTick && !canManualTick(value)) {
      onBlocked?.(value);
      return;
    }

    if (multiBoardMgr.isMulti()) {
      const selectedBoards = multiBoardMgr.getSelectedBoards();
      selectedBoards.forEach(board => {
        const boardState = multiBoardMgr.getBoardState(board.id);
        if (!boardState || !boardState.cellMap.has(value)) return;
        const { el, row } = boardState.cellMap.get(value);
        if (el.classList.contains("marked")) return;
        el.classList.add("marked");
        uiManager.flashCell(el);
        gameLogic.checkRowMulti(board.id, row, multiBoardMgr, uiManager);
        saveMarked(board.id, boardState.cellMap);
      });
    } else {
      const board = gameState.getCurrentBoard();
      if (!board) return;
      gameLogic.markNumber(value, gameState, () => {
        saveMarked(board.id, gameState.cellMap);
        uiManager.updateRowCounter(gameState);
      });
    }
  }

  // Bàn phím ảo (tránh bàn phím mặc định gây zoom trên mobile)
  initVirtualNumpad(inputEl, submitNumberInput);

  // Enter từ bàn phím vật lý (desktop)
  inputEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const value = Number(e.target.value);
    e.target.value = "";
    submitNumberInput(value);
  });

  // Color picker handler (not used in multi-mode)
  colorPickerEl.addEventListener("input", (e) => {
    const hex = e.target.value;
    const board = gameState.getCurrentBoard();
    uiManager.applyBoardColor(hex, board?.id);
    applyActionButtonsColor?.(hex);
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
    uiManager.clearBoard();
    
    // Return to appropriate screen based on mode
    if (multiBoardMgr.isMulti()) {
      // Multi mode: go back to board selection
      uiManager.showSelect(true);
      
      // Define the board selection handler
      const handleBoardSelect = (board) => {
        multiBoardMgr.toggleBoard(board);
        const count = multiBoardMgr.getSelectedCount();
        uiManager.updateSelectedCount(count);
        elements.btnStartMulti.disabled = count < 2;
        // Re-render board list to update UI
        uiManager.renderBoardList(boards, handleBoardSelect, multiBoardMgr);
      };
      
      // Initial render with current selection state
      uiManager.renderBoardList(boards, handleBoardSelect, multiBoardMgr);
      uiManager.updateSelectedCount(multiBoardMgr.getSelectedCount());
      elements.btnStartMulti.disabled = multiBoardMgr.getSelectedCount() < 2;
    } else {
      // Single mode: go back to board selection
      uiManager.showSelect(false);
      uiManager.renderBoardList(boards, startSingleGame);
    }
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
    // Manual toggle without validation by default; host mode can wrap this factory if needed
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

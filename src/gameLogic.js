// Game logic and rules
import { loadMarked } from "./storage.js";

export class GameLogic {
  constructor(uiManager) {
    this.ui = uiManager;
  }

  checkRowSilent(rowIndex, gameState) {
    const cells = this.ui.getRowCells(rowIndex);
    const markedCount = cells.filter(
      (c) => c.classList.contains("num") && c.classList.contains("marked")
    ).length;
    
    if (markedCount === 5) {
      gameState.markRowAsAlerted(rowIndex);
      cells.forEach((c) => c.classList.add("row-complete"));
    } else {
      // Remove highlight if no longer complete
      gameState.alertedRows.delete(rowIndex);
      cells.forEach((c) => c.classList.remove("row-complete"));
    }
  }

  checkRow(rowIndex, gameState, boardName = "bàn") {
    const cells = this.ui.getRowCells(rowIndex);
    const markedCount = cells.filter(
      (c) => c.classList.contains("num") && c.classList.contains("marked")
    ).length;
    
    const wasAlerted = gameState.isRowAlerted(rowIndex);
    
    if (markedCount === 5) {
      if (!wasAlerted) {
        gameState.markRowAsAlerted(rowIndex);
        cells.forEach((c) => c.classList.add("row-complete"));
        // Show alert for new completion
        alert(`🎉 Chúc mừng! Bạn đã hoàn thành hàng ${rowIndex + 1}!`);
      }
    } else {
      // Row is no longer complete, remove alert status
      if (wasAlerted) {
        gameState.alertedRows.delete(rowIndex);
        cells.forEach((c) => c.classList.remove("row-complete"));
      }
    }
  }

  checkRowSilentMulti(boardId, rowIndex, multiBoardMgr, uiManager) {
    const boardState = multiBoardMgr.getBoardState(boardId);
    if (!boardState) return;
    
    const cells = uiManager.getRowCellsForBoard(boardId, rowIndex);
    const markedCount = cells.filter(
      (c) => c.classList.contains("num") && c.classList.contains("marked")
    ).length;
    
    if (markedCount === 5) {
      boardState.alertedRows.add(rowIndex);
      cells.forEach((c) => c.classList.add("row-complete"));
    } else {
      // Remove highlight if no longer complete
      boardState.alertedRows.delete(rowIndex);
      cells.forEach((c) => c.classList.remove("row-complete"));
    }
  }

  checkRowMulti(boardId, rowIndex, multiBoardMgr, uiManager) {
    const boardState = multiBoardMgr.getBoardState(boardId);
    if (!boardState) return;
    
    const cells = uiManager.getRowCellsForBoard(boardId, rowIndex);
    const markedCount = cells.filter(
      (c) => c.classList.contains("num") && c.classList.contains("marked")
    ).length;
    
    const wasAlerted = boardState.alertedRows.has(rowIndex);
    
    if (markedCount === 5) {
      if (!wasAlerted) {
        boardState.alertedRows.add(rowIndex);
        cells.forEach((c) => c.classList.add("row-complete"));
        // Show alert for new completion
        alert(`🎉 Chúc mừng! Bàn ${boardId} - Hoàn thành hàng ${rowIndex + 1}!`);
      }
    } else {
      // Row is no longer complete, remove alert status and highlight
      if (wasAlerted) {
        boardState.alertedRows.delete(rowIndex);
        cells.forEach((c) => c.classList.remove("row-complete"));
      }
    }
  }

  restoreMarked(boardId, gameState) {
    const saved = loadMarked(boardId);
    saved.forEach((num) => {
      const entry = gameState.getCell(num);
      if (entry) entry.el.classList.add("marked");
    });
    
    // Check all rows for completion
    for (let r = 0; r < 9; r++) {
      this.checkRowSilent(r, gameState);
    }
  }

  markNumber(number, gameState, onUpdate) {
    if (!gameState.hasCell(number)) return false;
    
    const { el, row } = gameState.getCell(number);
    if (el.classList.contains("marked")) return false;
    
    el.classList.add("marked");
    this.ui.flashCell(el);
    this.checkRow(row, gameState);
    onUpdate();
    
    return true;
  }
}

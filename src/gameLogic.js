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
    }
  }

  checkRow(rowIndex, gameState) {
    if (gameState.isRowAlerted(rowIndex)) return;
    
    const cells = this.ui.getRowCells(rowIndex);
    const markedCount = cells.filter(
      (c) => c.classList.contains("num") && c.classList.contains("marked")
    ).length;
    
    if (markedCount === 5) {
      gameState.markRowAsAlerted(rowIndex);
      cells.forEach((c) => c.classList.add("row-complete"));
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
    }
  }

  checkRowMulti(boardId, rowIndex, multiBoardMgr, uiManager) {
    const boardState = multiBoardMgr.getBoardState(boardId);
    if (!boardState || boardState.alertedRows.has(rowIndex)) return;
    
    const cells = uiManager.getRowCellsForBoard(boardId, rowIndex);
    const markedCount = cells.filter(
      (c) => c.classList.contains("num") && c.classList.contains("marked")
    ).length;
    
    if (markedCount === 5) {
      boardState.alertedRows.add(rowIndex);
      cells.forEach((c) => c.classList.add("row-complete"));
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

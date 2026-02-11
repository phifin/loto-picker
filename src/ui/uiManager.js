// Main UI Manager - orchestrates all UI modules

import { ScreenManager } from "./screenManager.js";
import { BoardListRenderer } from "./boardListRenderer.js";
import { BoardRenderer } from "./boardRenderer.js";

export class UIManager {
  constructor(elements) {
    this.screenManager = new ScreenManager(elements);
    this.boardListRenderer = new BoardListRenderer(elements.boardListEl);
    this.boardRenderer = new BoardRenderer(elements.boardsContainer, elements.colorPickerEl);
  }

  // Screen management delegation
  showMode() {
    this.screenManager.showMode();
  }

  showSelect(isMultiMode = false) {
    this.screenManager.showSelect(isMultiMode);
  }

  showGame() {
    this.screenManager.showGame();
  }

  updateSelectedCount(count) {
    this.screenManager.updateSelectedCount(count);
  }

  // Board list delegation
  renderBoardList(boards, onBoardSelect, multiBoardMgr = null) {
    this.boardListRenderer.renderBoardList(boards, onBoardSelect, multiBoardMgr);
  }

  refreshBoardList(boards, onBoardSelect, multiBoardMgr = null) {
    this.boardListRenderer.renderBoardList(boards, onBoardSelect, multiBoardMgr);
  }

  // Board rendering delegation
  renderMultipleBoards(boards, multiBoardMgr, onCellClick) {
    this.boardRenderer.renderMultipleBoards(boards, multiBoardMgr, onCellClick);
  }

  applyBoardColor(hex, boardId) {
    this.boardRenderer.applyBoardColor(hex, boardId);
  }

  clearBoard() {
    this.boardRenderer.clearBoard();
  }

  resetMarkedCells() {
    this.boardRenderer.resetMarkedCells();
  }

  getRowCells(rowIndex) {
    return this.boardRenderer.getRowCells(rowIndex);
  }

  getRowCellsForBoard(boardId, rowIndex) {
    return this.boardRenderer.getRowCellsForBoard(boardId, rowIndex);
  }

  getCellElement(boardId, number) {
    return this.boardRenderer.getCellElement(boardId, number);
  }

  flashCell(el) {
    this.boardRenderer.flashCell(el);
  }

  updateRowCounter(gameState) {
    this.boardRenderer.updateRowCounter(gameState);
  }
}

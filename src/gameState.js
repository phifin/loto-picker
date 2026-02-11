// Game state management

export class GameState {
  constructor() {
    this.currentBoard = null;
    this.alertedRows = new Set();
    this.cellMap = new Map();
  }

  setCurrentBoard(board) {
    this.currentBoard = board;
  }

  getCurrentBoard() {
    return this.currentBoard;
  }

  clearState() {
    this.currentBoard = null;
    this.alertedRows.clear();
    this.cellMap.clear();
  }

  resetForNewGame() {
    this.alertedRows.clear();
    this.cellMap.clear();
  }

  addCell(number, element, rowIndex) {
    this.cellMap.set(number, { el: element, row: rowIndex });
  }

  getCell(number) {
    return this.cellMap.get(number);
  }

  hasCell(number) {
    return this.cellMap.has(number);
  }

  markRowAsAlerted(rowIndex) {
    this.alertedRows.add(rowIndex);
  }

  isRowAlerted(rowIndex) {
    return this.alertedRows.has(rowIndex);
  }
}

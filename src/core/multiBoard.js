// Multi-board game management

export class MultiBoardManager {
  constructor() {
    this.selectedBoards = [];
    this.isMultiMode = false;
    this.boardStates = new Map(); // boardId -> {cellMap, alertedRows}
  }

  setMode(isMulti) {
    this.isMultiMode = isMulti;
  }

  isMulti() {
    return this.isMultiMode;
  }

  addBoard(board) {
    if (!this.selectedBoards.find(b => b.id === board.id)) {
      this.selectedBoards.push(board);
    }
  }

  removeBoard(boardId) {
    this.selectedBoards = this.selectedBoards.filter(b => b.id !== boardId);
  }

  toggleBoard(board) {
    const index = this.selectedBoards.findIndex(b => b.id === board.id);
    if (index >= 0) {
      this.selectedBoards.splice(index, 1);
      return false;
    } else {
      this.selectedBoards.push(board);
      return true;
    }
  }

  isSelected(boardId) {
    return this.selectedBoards.some(b => b.id === boardId);
  }

  getSelectedBoards() {
    return this.selectedBoards;
  }

  getSelectedCount() {
    return this.selectedBoards.length;
  }

  clearSelection() {
    this.selectedBoards = [];
  }

  initBoardState(boardId) {
    if (!this.boardStates.has(boardId)) {
      this.boardStates.set(boardId, {
        cellMap: new Map(),
        alertedRows: new Set()
      });
    }
    return this.boardStates.get(boardId);
  }

  getBoardState(boardId) {
    return this.boardStates.get(boardId);
  }

  clearBoardStates() {
    this.boardStates.clear();
  }

  reset() {
    this.selectedBoards = [];
    this.isMultiMode = false;
    this.boardStates.clear();
  }
}

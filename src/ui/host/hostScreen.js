import { NumberCaller } from "../../services/numberCaller.js";
import { playNumberAudio, stopCurrentAudio, initAudioContext } from "../../services/audioPlayer.js";
import { HostToolbar } from "./hostToolbar.js";
import { saveMarked, clearMarked } from "../../services/storage.js";

export class HostController {
  constructor({
    elements,
    gameState,
    uiManager,
    gameLogic,
    multiBoardMgr,
    isHostActive = () => false,
  }) {
    this.elements = elements;
    this.gameState = gameState;
    this.ui = uiManager;
    this.logic = gameLogic;
    this.multiBoardMgr = multiBoardMgr;
    this.isHostActive = isHostActive;

    this.autoTick = true;

    this.numberCaller = new NumberCaller({
      initialIntervalSeconds: 4,
      onNumberCalled: (number) => this._onNumberCalled(number),
    });

    this.toolbar = new HostToolbar(elements, this);
  }

  // --- NumberCaller bridges ---
  _onNumberCalled(number) {
    // Play audio (fire and forget)
    playNumberAudio(number);

    if (!this.autoTick) return;

    if (this.multiBoardMgr.isMulti()) {
      // Auto mark across selected boards
      const selectedBoards = this.multiBoardMgr.getSelectedBoards();
      selectedBoards.forEach((board) => {
        const boardState = this.multiBoardMgr.getBoardState(board.id);
        if (!boardState || !boardState.cellMap.has(number)) return;
        const { el, row } = boardState.cellMap.get(number);
        if (el.classList.contains("marked")) return;
        el.classList.add("marked");
        this.ui.flashCell(el);
        this.logic.checkRowMulti(board.id, row, this.multiBoardMgr, this.ui);
        saveMarked(board.id, boardState.cellMap);
      });
    } else {
      const board = this.gameState.getCurrentBoard();
      if (!board) return;
      this.logic.markNumber(number, this.gameState, () => {
        saveMarked(board.id, this.gameState.cellMap);
        this.ui.updateRowCounter(this.gameState);
      });
    }
  }

  // --- API for toolbar ---
  getIntervalSeconds() {
    return this.numberCaller.intervalSeconds;
  }

  setIntervalSeconds(seconds) {
    this.numberCaller.setIntervalSeconds(seconds);
  }

  getAutoTick() {
    return this.autoTick;
  }

  setAutoTick(value) {
    this.autoTick = !!value;
  }

  start() {
    // Ensure audio context is unlocked before starting
    initAudioContext();
    
    this.numberCaller.start();
  }

  pause() {
    this.numberCaller.pause();
  }

  isRunning() {
    return this.numberCaller.isRunning;
  }

  getCalledNumbers() {
    return this.numberCaller.getCalledNumbers();
  }

  isCalled(n) {
    return this.numberCaller.hasNumber(n);
  }

  resetAll() {
    // Stop everything
    this.numberCaller.reset();
    stopCurrentAudio();

    // Clear ticks on board(s)
    this.ui.resetMarkedCells();
    this.elements.inputEl.value = "";

    if (this.multiBoardMgr.isMulti()) {
      const selectedBoards = this.multiBoardMgr.getSelectedBoards();
      selectedBoards.forEach((board) => {
        const boardState = this.multiBoardMgr.getBoardState(board.id);
        if (boardState) {
          boardState.alertedRows.clear();
        }
        clearMarked(board.id);
      });
    } else {
      this.gameState.alertedRows.clear();
      const board = this.gameState.getCurrentBoard();
      if (board) clearMarked(board.id);
    }
  }

  // --- Manual tick validation helpers ---
  canManualTick(number) {
    return this.isHostActive() ? this.isCalled(number) : true;
  }

  showNotCalledFeedback(number) {
    if (!this.isHostActive()) return;
    alert(`Số ${number} chưa được chủ trò đọc.`);
  }
}


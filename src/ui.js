// UI rendering and screen management
import { loadMarked, loadColor, saveColor } from "./storage.js";

export class UIManager {
  constructor(elements) {
    this.selectScreen = elements.selectScreen;
    this.gameScreen = elements.gameScreen;
    this.boardListEl = elements.boardListEl;
    this.boardEl = elements.boardEl;
    this.colorPickerEl = elements.colorPickerEl;
    this.rowCounterEl = elements.rowCounterEl;
  }

  showSelect() {
    this.selectScreen.classList.remove("hidden");
    this.gameScreen.classList.add("hidden");
  }

  showGame() {
    this.selectScreen.classList.add("hidden");
    this.gameScreen.classList.remove("hidden");
  }

  renderBoardList(boards, onBoardSelect) {
    this.boardListEl.innerHTML = "";
    boards.forEach((b) => {
      const wrap = document.createElement("div");
      wrap.className = "board-btn-wrap";

      const btn = document.createElement("button");
      btn.className = "board-btn";
      btn.style.background = loadColor(b.id, b.color);

      const saved = loadMarked(b.id);
      if (saved.length > 0) {
        const badge = document.createElement("span");
        badge.className = "resume-badge";
        badge.textContent = `${saved.length} số`;
        btn.appendChild(badge);
      }

      const label = document.createElement("span");
      label.textContent = `Bàn ${b.id}`;
      btn.appendChild(label);
      btn.onclick = () => onBoardSelect(b);

      wrap.appendChild(btn);
      wrap.appendChild(this.buildMiniPreview(b));
      this.boardListEl.appendChild(wrap);
    });
  }

  buildMiniPreview(board) {
    const saved = new Set(loadMarked(board.id));
    const preview = document.createElement("div");
    preview.className = "mini-preview";
    preview.style.setProperty("--prev-color", loadColor(board.id, board.color));

    board.data.forEach((row) => {
      row.forEach((v) => {
        const cell = document.createElement("div");
        if (v === null) {
          cell.className = "mini-cell mini-empty";
        } else {
          cell.className = "mini-cell mini-num" + (saved.has(v) ? " mini-marked" : "");
          cell.textContent = v;
        }
        preview.appendChild(cell);
      });
    });

    return preview;
  }

  renderBoard(data, gameState, onCellClick) {
    this.boardEl.innerHTML = "";

    data.forEach((row, rowIndex) => {
      row.forEach((v) => {
        const div = document.createElement("div");
        div.dataset.row = rowIndex;
        if (v === null) {
          div.className = "cell empty";
        } else {
          div.className = "cell num";
          div.textContent = v;
          gameState.addCell(v, div, rowIndex);
          div.onclick = () => onCellClick(div, rowIndex);
        }
        this.boardEl.appendChild(div);
      });
    });
  }

  applyBoardColor(hex, boardId) {
    this.boardEl.style.setProperty("--cell-color", hex);
    this.colorPickerEl.value = hex;
    if (boardId) saveColor(boardId, hex);
  }

  updateRowCounter(gameState) {
    if (!this.rowCounterEl) return;
    this.rowCounterEl.innerHTML = "";
    
    for (let r = 0; r < 9; r++) {
      const cells = this.getRowCells(r);
      const nums = cells.filter((c) => c.classList.contains("num"));
      if (nums.length === 0) continue;
      
      const marked = nums.filter((c) => c.classList.contains("marked")).length;
      const done = marked === 5;
      
      const pill = document.createElement("span");
      pill.className = "row-pill" + (done ? " row-done" : "");
      pill.innerHTML = `H${r + 1}: <b>${marked}</b>/<span>${nums.length}</span>${done ? " 🎉" : ""}`;
      this.rowCounterEl.appendChild(pill);
    }
  }

  getRowCells(rowIndex) {
    const start = rowIndex * 9;
    return [...this.boardEl.children].slice(start, start + 9);
  }

  flashCell(el) {
    el.classList.remove("flash");
    void el.offsetWidth; // Force reflow
    el.classList.add("flash");
    el.addEventListener("animationend", () => el.classList.remove("flash"), {
      once: true,
    });
  }

  clearBoard() {
    this.boardEl.innerHTML = "";
  }

  resetMarkedCells() {
    this.boardEl
      .querySelectorAll(".marked, .row-complete, .flash")
      .forEach((el) => el.classList.remove("marked", "row-complete", "flash"));
  }
}

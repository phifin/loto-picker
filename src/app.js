import { LOTO_DATA } from "./boards.js";

const selectScreen = document.getElementById("selectScreen");
const gameScreen = document.getElementById("gameScreen");
const boardListEl = document.getElementById("boardList");
const boardEl = document.getElementById("board");
const inputEl = document.getElementById("numberInput");
const btnReset = document.getElementById("btnReset");
const btnBack = document.getElementById("btnBack");
const colorPickerEl = document.getElementById("colorPicker");
const rowCounterEl = document.getElementById("rowCounter");

let currentBoard = null;
let alertedRows = new Set();
let cellMap = new Map();

function keyMarked(id) {
  return `loto_marked_${id}`;
}
function keyColor(id) {
  return `loto_color_${id}`;
}

function saveMarked(boardId) {
  const marked = [];
  cellMap.forEach((val, num) => {
    if (val.el.classList.contains("marked")) marked.push(num);
  });
  localStorage.setItem(keyMarked(boardId), JSON.stringify(marked));
}

function loadMarked(boardId) {
  try {
    return JSON.parse(localStorage.getItem(keyMarked(boardId))) || [];
  } catch {
    return [];
  }
}

function clearMarked(boardId) {
  localStorage.removeItem(keyMarked(boardId));
}

function saveColor(boardId, hex) {
  localStorage.setItem(keyColor(boardId), hex);
}

function loadColor(boardId, fallback) {
  return localStorage.getItem(keyColor(boardId)) || fallback;
}

function showSelect() {
  selectScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  renderBoardList();
}

function showGame() {
  selectScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  inputEl.focus();
}

function renderBoardList() {
  boardListEl.innerHTML = "";
  LOTO_DATA.forEach((b) => {
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
    btn.onclick = () => startGame(b);

    wrap.appendChild(btn);
    wrap.appendChild(buildMiniPreview(b));
    boardListEl.appendChild(wrap);
  });
}

function buildMiniPreview(b) {
  const saved = new Set(loadMarked(b.id));
  const preview = document.createElement("div");
  preview.className = "mini-preview";
  preview.style.setProperty("--prev-color", loadColor(b.id, b.color));

  b.data.forEach((row) => {
    row.forEach((v) => {
      const cell = document.createElement("div");
      cell.className =
        v === null
          ? "mini-cell mini-empty"
          : "mini-cell mini-num" + (saved.has(v) ? " mini-marked" : "");
      preview.appendChild(cell);
    });
  });

  return preview;
}

function startGame(boardData) {
  currentBoard = boardData;
  alertedRows.clear();
  cellMap.clear();
  inputEl.value = "";

  const color = loadColor(boardData.id, boardData.color);
  colorPickerEl.value = color;
  applyBoardColor(color);

  renderBoard(boardData.data);
  restoreMarked(boardData.id);
  updateRowCounter();
  showGame();
}

function applyBoardColor(hex) {
  boardEl.style.setProperty("--cell-color", hex);
  colorPickerEl.value = hex;
  if (currentBoard) saveColor(currentBoard.id, hex);
}

function renderBoard(data) {
  boardEl.innerHTML = "";
  alertedRows.clear();
  cellMap.clear();

  data.forEach((row, rowIndex) => {
    row.forEach((v) => {
      const div = document.createElement("div");
      div.dataset.row = rowIndex;
      if (v === null) {
        div.className = "cell empty";
      } else {
        div.className = "cell num";
        div.textContent = v;
        cellMap.set(v, { el: div, row: rowIndex });
        div.onclick = () => {
          div.classList.toggle("marked");
          saveMarked(currentBoard.id);
          checkRow(rowIndex);
          updateRowCounter();
        };
      }
      boardEl.appendChild(div);
    });
  });
}

function restoreMarked(boardId) {
  const saved = loadMarked(boardId);
  saved.forEach((num) => {
    const entry = cellMap.get(num);
    if (entry) entry.el.classList.add("marked");
  });
  for (let r = 0; r < 9; r++) checkRowSilent(r);
}

function getRowCells(rowIndex) {
  const start = rowIndex * 9;
  return [...boardEl.children].slice(start, start + 9);
}

function checkRowSilent(rowIndex) {
  const cells = getRowCells(rowIndex);
  const markedCount = cells.filter(
    (c) => c.classList.contains("num") && c.classList.contains("marked"),
  ).length;
  if (markedCount === 5) {
    alertedRows.add(rowIndex);
    cells.forEach((c) => c.classList.add("row-complete"));
  }
}

function checkRow(rowIndex) {
  if (alertedRows.has(rowIndex)) return;
  const cells = getRowCells(rowIndex);
  const markedCount = cells.filter(
    (c) => c.classList.contains("num") && c.classList.contains("marked"),
  ).length;
  if (markedCount === 5) {
    alertedRows.add(rowIndex);
    cells.forEach((c) => c.classList.add("row-complete"));
  }
}

function updateRowCounter() {
  if (!rowCounterEl) return;
  rowCounterEl.innerHTML = "";
  for (let r = 0; r < 9; r++) {
    const cells = getRowCells(r);
    const nums = cells.filter((c) => c.classList.contains("num"));
    if (nums.length === 0) continue;
    const marked = nums.filter((c) => c.classList.contains("marked")).length;
    const done = marked === 5;
    const pill = document.createElement("span");
    pill.className = "row-pill" + (done ? " row-done" : "");
    pill.innerHTML = `H${r + 1}: <b>${marked}</b>/<span>${nums.length}</span>${done ? " 🎉" : ""}`;
    rowCounterEl.appendChild(pill);
  }
}

function flashCell(el) {
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
  el.addEventListener("animationend", () => el.classList.remove("flash"), {
    once: true,
  });
}

inputEl.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const value = Number(e.target.value);
  e.target.value = "";
  if (!cellMap.has(value)) return;
  const { el, row } = cellMap.get(value);
  if (!el.classList.contains("marked")) {
    el.classList.add("marked");
    flashCell(el);
    saveMarked(currentBoard.id);
    checkRow(row);
    updateRowCounter();
  }
});

colorPickerEl.addEventListener("input", (e) => {
  applyBoardColor(e.target.value);
});

btnReset.onclick = () => {
  boardEl
    .querySelectorAll(".marked, .row-complete, .flash")
    .forEach((el) => el.classList.remove("marked", "row-complete", "flash"));
  alertedRows.clear();
  inputEl.value = "";
  if (currentBoard) clearMarked(currentBoard.id);
  updateRowCounter();
};

btnBack.onclick = () => {
  currentBoard = null;
  boardEl.innerHTML = "";
  showSelect();
};

renderBoardList();
showSelect();

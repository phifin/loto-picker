import { LOTO_DATA } from "./boards.js";

const selectScreen = document.getElementById("selectScreen");
const gameScreen = document.getElementById("gameScreen");
const boardListEl = document.getElementById("boardList");
const boardEl = document.getElementById("board");
const inputEl = document.getElementById("numberInput");
const btnReset = document.getElementById("btnReset");
const btnBack = document.getElementById("btnBack");
const colorPickerEl = document.getElementById("colorPicker");

let currentBoard = null;
let alertedRows = new Set();
let cellMap = new Map();

function storageKey(boardId) {
  return `loto_marked_${boardId}`;
}

function saveMarked(boardId) {
  const marked = [];
  cellMap.forEach((val, num) => {
    if (val.el.classList.contains("marked")) marked.push(num);
  });
  localStorage.setItem(storageKey(boardId), JSON.stringify(marked));
}

function loadMarked(boardId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(boardId))) || [];
  } catch {
    return [];
  }
}

function clearMarked(boardId) {
  localStorage.removeItem(storageKey(boardId));
}

function showSelect() {
  selectScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
}

function showGame() {
  selectScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  inputEl.focus();
}

function renderBoardList() {
  boardListEl.innerHTML = "";
  LOTO_DATA.forEach((b) => {
    const btn = document.createElement("button");
    btn.className = "board-btn";
    btn.textContent = `Bàn ${b.id}`;
    btn.style.background = b.color;
    btn.onclick = () => startGame(b);
    boardListEl.appendChild(btn);
  });
}

function startGame(boardData) {
  currentBoard = boardData;
  alertedRows.clear();
  cellMap.clear();
  inputEl.value = "";

  colorPickerEl.value = boardData.color;
  applyBoardColor(colorPickerEl.value);

  renderBoard(boardData.data);
  restoreMarked(boardData.id);
  showGame();
}

function applyBoardColor(hex) {
  boardEl.style.setProperty("--cell-color", hex);
  colorPickerEl.value = hex;
}

function renderBoard(data) {
  boardEl.innerHTML = "";
  alertedRows.clear();
  cellMap.clear();

  data.forEach((row, rowIndex) => {
    row.forEach((v) => {
      const div = document.createElement("div");
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
    if (entry) {
      entry.el.classList.add("marked");
    }
  });
  for (let r = 0; r < 9; r++) checkRowSilent(r);
}

function checkRowSilent(rowIndex) {
  const start = rowIndex * 9;
  const cells = [...boardEl.children].slice(start, start + 9);
  const markedCount = cells.filter(
    (c) => c.classList.contains("num") && c.classList.contains("marked"),
  ).length;
  if (markedCount === 5) alertedRows.add(rowIndex);
}

function checkRow(rowIndex) {
  if (alertedRows.has(rowIndex)) return;
  const start = rowIndex * 9;
  const cells = [...boardEl.children].slice(start, start + 9);
  const markedCount = cells.filter(
    (c) => c.classList.contains("num") && c.classList.contains("marked"),
  ).length;
  if (markedCount === 5) {
    alertedRows.add(rowIndex);
    alert(`🎉 Tới rồi! Hàng ${rowIndex + 1} đủ 5 số 🎉`);
  }
}

inputEl.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const value = Number(e.target.value);
  e.target.value = "";
  if (!cellMap.has(value)) return;
  const { el, row } = cellMap.get(value);
  if (!el.classList.contains("marked")) {
    el.classList.add("marked");
    saveMarked(currentBoard.id);
    checkRow(row);
  }
});

colorPickerEl.addEventListener("input", (e) => {
  applyBoardColor(e.target.value);
});

btnReset.onclick = () => {
  boardEl
    .querySelectorAll(".marked")
    .forEach((el) => el.classList.remove("marked"));
  alertedRows.clear();
  inputEl.value = "";
  if (currentBoard) clearMarked(currentBoard.id);
};

btnBack.onclick = () => {
  currentBoard = null;
  boardEl.innerHTML = "";
  showSelect();
};

renderBoardList();
showSelect();

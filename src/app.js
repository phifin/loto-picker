import { LOTO_DATA } from "./boards.js";

/* ===== DOM ===== */
const selectScreen = document.getElementById("selectScreen");
const gameScreen = document.getElementById("gameScreen");

const boardListEl = document.getElementById("boardList");
const boardEl = document.getElementById("board");

const inputEl = document.getElementById("numberInput");
const btnReset = document.getElementById("btnReset");
const btnBack = document.getElementById("btnBack");

/* ===== STATE ===== */
let currentBoard = null;
let alertedRows = new Set();
let cellMap = new Map(); // number -> { el, row }

/* ===== SCREEN CONTROL ===== */
function showSelect() {
  selectScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
}

function showGame() {
  selectScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}

/* ===== RENDER SELECT BOARD ===== */
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

/* ===== START GAME ===== */
function startGame(boardData) {
  currentBoard = boardData;
  alertedRows.clear();
  cellMap.clear();
  inputEl.value = "";

  renderBoard(boardData.data, boardData.color);
  showGame();
}

/* ===== RENDER BOARD ===== */
function renderBoard(data, color) {
  boardEl.innerHTML = "";
  boardEl.style.setProperty("--cell-color", color);
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
          checkRow(rowIndex);
        };
      }

      boardEl.appendChild(div);
    });
  });
}

/* ===== INPUT ENTER ===== */
inputEl.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const value = Number(e.target.value);
  e.target.value = "";

  if (!cellMap.has(value)) return;

  const { el, row } = cellMap.get(value);

  if (!el.classList.contains("marked")) {
    el.classList.add("marked");
    checkRow(row);
  }
});

/* ===== CHECK ROW ===== */
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

/* ===== RESET ===== */
btnReset.onclick = () => {
  boardEl
    .querySelectorAll(".marked")
    .forEach((el) => el.classList.remove("marked"));

  alertedRows.clear();
  inputEl.value = "";
};

/* ===== BACK ===== */
btnBack.onclick = () => {
  currentBoard = null;
  boardEl.innerHTML = "";
  showSelect();
};

/* ===== INIT ===== */
renderBoardList();
showSelect();

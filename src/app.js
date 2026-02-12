import { LOTO_DATA } from "./boards.js";
import { GameState } from "./gameState.js";
import { UIManager } from "./ui/uiManager.js";
import { GameLogic } from "./gameLogic.js";
import { MultiBoardManager } from "./multiBoard.js";
import { ThemeManager, watchSystemTheme } from "./themeManager.js";
import { initInstallPrompt } from "./installPrompt.js";
import { loadColor, loadMarked } from "./storage.js";
import { setupEventHandlers, createCellClickHandler, createMultiCellClickHandler } from "./eventHandlers.js";

// DOM elements
const elements = {
  modeScreen: document.getElementById("modeScreen"),
  selectScreen: document.getElementById("selectScreen"),
  gameScreen: document.getElementById("gameScreen"),
  boardListEl: document.getElementById("boardList"),
  boardsContainer: document.getElementById("boardsContainer"),
  inputEl: document.getElementById("numberInput"),
  btnReset: document.getElementById("btnReset"),
  btnBack: document.getElementById("btnBack"),
  btnSingleMode: document.getElementById("btnSingleMode"),
  btnMultiMode: document.getElementById("btnMultiMode"),
  btnStartMulti: document.getElementById("btnStartMulti"),
  colorPickerEl: document.getElementById("colorPicker"),
  colorPickerWrap: document.getElementById("colorPickerWrap"),
  multiSelectInfo: document.getElementById("multiSelectInfo"),
  selectedCount: document.getElementById("selectedCount"),
  selectTitle: document.getElementById("selectTitle"),
  themeToggleGame: document.getElementById("themeToggleGame"),
  btnBackToMode: document.getElementById("btnBackToMode"),
  actionsBar: document.getElementById("actionsBar"),
};

// Apply color picker color to Reset and Đổi bàn buttons
function applyActionButtonsColor(hex) {
  if (elements.actionsBar) {
    elements.actionsBar.style.setProperty("--action-btn-color", hex);
  }
}

// Initialize game components
const gameState = new GameState();
const uiManager = new UIManager(elements);
const gameLogic = new GameLogic(uiManager);
const multiBoardMgr = new MultiBoardManager();
const themeManager = new ThemeManager();

// Initialize theme with game toggle button
themeManager.init(elements.themeToggleGame);
watchSystemTheme(themeManager);

// Initialize PWA install prompt
initInstallPrompt();

// Mode selection handlers
elements.btnSingleMode.onclick = () => {
  multiBoardMgr.setMode(false);
  uiManager.showSelect(false);
  uiManager.renderBoardList(LOTO_DATA, startSingleGame);
};

elements.btnMultiMode.onclick = () => {
  multiBoardMgr.setMode(true);
  multiBoardMgr.clearSelection();
  uiManager.showSelect(true);
  uiManager.renderBoardList(LOTO_DATA, toggleBoardSelection, multiBoardMgr);
  uiManager.updateSelectedCount(0);
  // Require at least 2 boards
  elements.btnStartMulti.disabled = true;
};

// Back to mode selection from board selection screen
elements.btnBackToMode.onclick = () => {
  multiBoardMgr.reset();
  uiManager.showMode();
};

// Board selection handler for multi-mode
function toggleBoardSelection(board) {
  multiBoardMgr.toggleBoard(board);
  const count = multiBoardMgr.getSelectedCount();
  uiManager.updateSelectedCount(count);
  // Require at least 2 boards for multi-mode
  elements.btnStartMulti.disabled = count < 2;
  uiManager.renderBoardList(LOTO_DATA, toggleBoardSelection, multiBoardMgr);
}

// Start multi-board game
elements.btnStartMulti.onclick = () => {
  const selectedBoards = multiBoardMgr.getSelectedBoards();
  if (selectedBoards.length === 0) return;
  
  startMultiGame(selectedBoards);
};

// Single board game handler
function startSingleGame(boardData) {
  gameState.setCurrentBoard(boardData);
  gameState.resetForNewGame();
  elements.inputEl.value = "";
  
  // Show color picker in single mode
  elements.colorPickerWrap.style.display = "flex";
  const color = loadColor(boardData.id, boardData.color);
  elements.colorPickerEl.value = color;
  applyActionButtonsColor(color);

  // Render single board
  const boardWrapper = document.createElement("div");
  boardWrapper.className = "board-wrapper single-board";
  
  const boardElement = document.createElement("div");
  boardElement.className = "board";
  
  boardElement.style.setProperty("--cell-color", color);
  
  boardData.data.forEach((row, rowIndex) => {
    row.forEach((v) => {
      const div = document.createElement("div");
      div.dataset.row = rowIndex;
      if (v === null) {
        div.className = "cell empty";
      } else {
        div.className = "cell num";
        div.textContent = v;
        gameState.addCell(v, div, rowIndex);
        const cellClickHandler = createCellClickHandler(gameState, gameLogic, uiManager, boardData.id);
        div.onclick = () => cellClickHandler(div, rowIndex);
      }
      boardElement.appendChild(div);
    });
  });
  
  boardWrapper.appendChild(boardElement);
  elements.boardsContainer.innerHTML = "";
  elements.boardsContainer.appendChild(boardWrapper);

  // Restore saved state
  gameLogic.restoreMarked(boardData.id, gameState);
  uiManager.updateRowCounter(gameState);

  // Show game screen and focus input
  uiManager.showGame();
  elements.inputEl.focus();
}

// Multi board game handler
function startMultiGame(boards) {
  multiBoardMgr.clearBoardStates();
  elements.inputEl.value = "";
  
  // Hide color picker in multi mode
  elements.colorPickerWrap.style.display = "none";
  // Use first board's color for action buttons
  const firstColor = loadColor(boards[0].id, boards[0].color);
  applyActionButtonsColor(firstColor);

  // Create multi-cell click handler
  const multiCellClickHandler = createMultiCellClickHandler(multiBoardMgr, gameLogic, uiManager, boards);
  
  // Render all boards
  uiManager.renderMultipleBoards(boards, multiBoardMgr, multiCellClickHandler);
  
  // Restore saved state for each board
  boards.forEach(board => {
    const boardState = multiBoardMgr.getBoardState(board.id);
    const saved = loadMarked(board.id);
    saved.forEach(num => {
      const entry = boardState.cellMap.get(num);
      if (entry) entry.el.classList.add("marked");
    });
    
    // Check rows silently
    for (let r = 0; r < 9; r++) {
      gameLogic.checkRowSilentMulti(board.id, r, multiBoardMgr, uiManager);
    }
  });
  
  // Show game screen and focus input
  uiManager.showGame();
  elements.inputEl.focus();
}

// Setup event handlers with board data and game functions
setupEventHandlers(elements, gameState, uiManager, gameLogic, LOTO_DATA, startSingleGame, multiBoardMgr, startMultiGame, applyActionButtonsColor);

// Initial render
function init() {
  uiManager.showMode();
}

// Start the app
init();

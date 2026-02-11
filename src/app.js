import { LOTO_DATA } from "./boards.js";
import { GameState } from "./gameState.js";
import { UIManager } from "./ui.js";
import { GameLogic } from "./gameLogic.js";
import { loadColor } from "./storage.js";
import { setupEventHandlers, createCellClickHandler } from "./eventHandlers.js";

// DOM elements
const elements = {
  selectScreen: document.getElementById("selectScreen"),
  gameScreen: document.getElementById("gameScreen"),
  boardListEl: document.getElementById("boardList"),
  boardEl: document.getElementById("board"),
  inputEl: document.getElementById("numberInput"),
  btnReset: document.getElementById("btnReset"),
  btnBack: document.getElementById("btnBack"),
  colorPickerEl: document.getElementById("colorPicker"),
};

// Initialize game components
const gameState = new GameState();
const uiManager = new UIManager(elements);
const gameLogic = new GameLogic(uiManager);

// Game start handler
function startGame(boardData) {
  gameState.setCurrentBoard(boardData);
  gameState.resetForNewGame();
  elements.inputEl.value = "";

  // Load and apply color
  const color = loadColor(boardData.id, boardData.color);
  uiManager.applyBoardColor(color, boardData.id);

  // Render board with cell click handler
  const cellClickHandler = createCellClickHandler(gameState, gameLogic, uiManager);
  uiManager.renderBoard(boardData.data, gameState, cellClickHandler);

  // Restore saved state
  gameLogic.restoreMarked(boardData.id, gameState);
  uiManager.updateRowCounter(gameState);

  // Show game screen and focus input
  uiManager.showGame();
  elements.inputEl.focus();
}

// Setup event handlers with board data and startGame callback
setupEventHandlers(elements, gameState, uiManager, gameLogic, LOTO_DATA, startGame);

// Initial render
function init() {
  uiManager.renderBoardList(LOTO_DATA, startGame);
  uiManager.showSelect();
}

// Start the app
init();

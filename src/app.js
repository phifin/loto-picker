import { LOTO_DATA } from "./data/boards.js";
import { GameState } from "./core/gameState.js";
import { UIManager } from "./ui/uiManager.js";
import { GameLogic } from "./core/gameLogic.js";
import { MultiBoardManager } from "./core/multiBoard.js";
import { ThemeManager, watchSystemTheme } from "./services/themeManager.js";
import { initInstallPrompt } from "./services/installPrompt.js";
import { loadColor, loadMarked } from "./services/storage.js";
import {
  setupEventHandlers,
  createCellClickHandler,
  createMultiCellClickHandler,
} from "./events/eventHandlers.js";
import { HostController } from "./ui/host/hostScreen.js";

// DOM elements
const elements = {
  modeScreen: document.getElementById("modeScreen"),
  roleSubtitle: document.getElementById("roleSubtitle"),
  roleSelection: document.getElementById("roleSelection"),
  modeSelection: document.getElementById("modeSelection"),
  modeSubtitle: document.getElementById("modeSubtitle"),
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
  btnRoleUser: document.getElementById("btnRoleUser"),
  btnRoleHost: document.getElementById("btnRoleHost"),
  colorPickerEl: document.getElementById("colorPicker"),
  colorPickerWrap: document.getElementById("colorPickerWrap"),
  multiSelectInfo: document.getElementById("multiSelectInfo"),
  selectedCount: document.getElementById("selectedCount"),
  selectTitle: document.getElementById("selectTitle"),
  themeToggleGame: document.getElementById("themeToggleGame"),
  btnBackToMode: document.getElementById("btnBackToMode"),
  btnBackToRole: document.getElementById("btnBackToRole"),
  actionsBar: document.getElementById("actionsBar"),
};

// Apply color picker color to Reset and Đổi bàn buttons
function applyActionButtonsColor(hex) {
  if (elements.actionsBar) {
    elements.actionsBar.style.setProperty("--action-btn-color", hex);
  }
}

// Initialize game components (shared for both roles)
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

// --- Role & mode flow ---
let currentRole = null; // 'user' | 'host'

// Host controller (needs access to currentRole to know when it's active)
const hostController = new HostController({
  elements,
  gameState,
  uiManager,
  gameLogic,
  multiBoardMgr,
  isHostActive: () => currentRole === "host",
});

if (elements.btnRoleUser) {
  elements.btnRoleUser.onclick = () => {
    currentRole = "user";
    document.body.classList.remove("host-mode");
    uiManager.setStep("selectMode");
  };
}

if (elements.btnRoleHost) {
  elements.btnRoleHost.onclick = () => {
    currentRole = "host";
    document.body.classList.add("host-mode");
    uiManager.setStep("selectMode");
  };
}

// Back from mode selection to role selection
if (elements.btnBackToRole) {
  elements.btnBackToRole.onclick = () => {
    // Clear any mode-specific state
    multiBoardMgr.reset();
    // Reset role
    currentRole = null;
    document.body.classList.remove("host-mode");
    // Show role selection screen only
    uiManager.setStep("selectRole");
  };
}

// Mode selection handlers (still shared; role-specific behaviour will be added later)
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

// Back to role selection from board selection screen
elements.btnBackToMode.onclick = () => {
  // Clear any board selection state but keep current role.
  multiBoardMgr.reset();
  // Go back to mode selection step for the current role
  uiManager.setStep("selectMode");
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
        const cellClickHandler = createCellClickHandler(
          gameState,
          gameLogic,
          uiManager,
          boardData.id
        );
        const num = v;
        div.onclick = () => {
          if (currentRole === "host" && !hostController.canManualTick(num)) {
            hostController.showNotCalledFeedback(num);
            return;
          }
          cellClickHandler(div, rowIndex);
        };
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
  const baseHandler = createMultiCellClickHandler(
    multiBoardMgr,
    gameLogic,
    uiManager,
    boards
  );
  const multiCellClickHandler = (number, boardId, cellElement, rowIndex) => {
    if (currentRole === "host" && !hostController.canManualTick(number)) {
      hostController.showNotCalledFeedback(number);
      return;
    }
    baseHandler(number, boardId, cellElement, rowIndex);
  };

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
setupEventHandlers(
  elements,
  gameState,
  uiManager,
  gameLogic,
  LOTO_DATA,
  startSingleGame,
  multiBoardMgr,
  startMultiGame,
  applyActionButtonsColor,
  {
    canManualTick: (value) =>
      currentRole !== "host" || hostController.canManualTick(value),
    onBlocked: (value) => hostController.showNotCalledFeedback(value),
  }
);

// Initial render
function init() {
  uiManager.showMode();
}

// Start the app
init();

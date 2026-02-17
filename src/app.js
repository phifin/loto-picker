/**
 * Main application entry point
 * Bootstraps and coordinates all managers and controllers
 */
import { LOTO_DATA } from "./data/boards.js";
import { GameState } from "./core/gameState.js";
import { UIManager } from "./ui/uiManager.js";
import { GameLogic } from "./core/gameLogic.js";
import { MultiBoardManager } from "./core/multiBoard.js";
import { ThemeManager, watchSystemTheme } from "./services/themeManager.js";
import { initInstallPrompt } from "./services/installPrompt.js";
import { initAudioPreload } from "./services/audioPlayer.js";
import { setupEventHandlers } from "./events/eventHandlers.js";
import { HostController } from "./ui/host/hostScreen.js";

// Managers
import { getDOMElements } from "./managers/DOMElements.js";
import { RoleManager } from "./managers/RoleManager.js";
import { ModeManager } from "./managers/ModeManager.js";
import { GameInitializer } from "./managers/GameInitializer.js";
import { PlayerMenuManager } from "./managers/PlayerMenuManager.js";
import { LoadingManager } from "./managers/LoadingManager.js";

/**
 * Application class - orchestrates all components
 */
class LotoApp {
  constructor() {
    // Get DOM elements
    this.elements = getDOMElements();
    
    // Initialize core game components
    this.gameState = new GameState();
    this.multiBoardMgr = new MultiBoardManager();
    this.uiManager = new UIManager(this.elements);
    this.gameLogic = new GameLogic(this.uiManager);
    
    // Initialize managers
    this.loadingManager = new LoadingManager();
    this.playerMenuManager = new PlayerMenuManager({ elements: this.elements });
    
    // Initialize role manager
    this.roleManager = new RoleManager({
      elements: this.elements,
      uiManager: this.uiManager,
      multiBoardMgr: this.multiBoardMgr,
      onRoleChange: (role) => this._onRoleChange(role)
    });
    
    // Initialize host controller
    this.hostController = new HostController({
      elements: this.elements,
      gameState: this.gameState,
      uiManager: this.uiManager,
      gameLogic: this.gameLogic,
      multiBoardMgr: this.multiBoardMgr,
      isHostActive: () => this.roleManager.isHost(),
    });
    
    // Initialize game initializer
    this.gameInitializer = new GameInitializer({
      elements: this.elements,
      gameState: this.gameState,
      gameLogic: this.gameLogic,
      uiManager: this.uiManager,
      multiBoardMgr: this.multiBoardMgr,
      hostController: this.hostController,
      roleManager: this.roleManager,
    });
    
    // Initialize mode manager
    this.modeManager = new ModeManager({
      elements: this.elements,
      uiManager: this.uiManager,
      multiBoardMgr: this.multiBoardMgr,
      boardData: LOTO_DATA,
      onStartSingle: (board) => this.gameInitializer.startSingleGame(board),
      onStartMulti: (boards) => this.gameInitializer.startMultiGame(boards),
    });
    
    // Initialize theme
    this.themeManager = new ThemeManager();
    this.themeManager.init(this.elements.themeToggleGame);
    watchSystemTheme(this.themeManager);
    
    // Initialize PWA and audio
    initInstallPrompt();
    initAudioPreload();
    
    // Setup event handlers
    this._setupEventHandlers();
  }

  _onRoleChange(role) {
    // Hook for role change events if needed
  }

  _setupEventHandlers() {
    setupEventHandlers(
      this.elements,
      this.gameState,
      this.uiManager,
      this.gameLogic,
      LOTO_DATA,
      (board) => this.gameInitializer.startSingleGame(board),
      this.multiBoardMgr,
      (boards) => this.gameInitializer.startMultiGame(boards),
      (hex) => this.gameInitializer.applyActionButtonsColor(hex),
      {
        canManualTick: (value) =>
          !this.roleManager.isHost() || this.hostController.canManualTick(value),
        onBlocked: (value) => this.hostController.showNotCalledFeedback(value),
      }
    );
  }

  start() {
    this.uiManager.showMode();
    
    // Prevent auto-focus on buttons (mobile browsers sometimes do this)
    setTimeout(() => {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
        document.activeElement.blur();
      }
    }, 100);
    
    this.loadingManager.hideAfterRender();
  }
}

/**
 * Bootstrap the application
 */
function init() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const app = new LotoApp();
      app.start();
    });
  } else {
    const app = new LotoApp();
    app.start();
  }
}

// Start the app
init();

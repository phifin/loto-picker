# Loto Picker - Code Structure

## Overview
The application has been refactored from a single 261-line file into a modular architecture for better maintainability and separation of concerns.

## File Structure

```
src/
├── app.js              # Entry point, initialization & orchestration (50 lines)
├── boards.js           # Board data configuration
├── storage.js          # LocalStorage operations (35 lines)
├── gameState.js        # Game state management (40 lines)
├── ui.js              # UI rendering & DOM manipulation (130 lines)
├── gameLogic.js       # Game rules & logic (45 lines)
└── eventHandlers.js   # Event handlers setup (50 lines)
```

## Module Responsibilities

### 1. `storage.js` - Data Persistence
- Manages all localStorage operations
- Functions: `saveMarked`, `loadMarked`, `clearMarked`, `saveColor`, `loadColor`
- No dependencies on other modules

### 2. `gameState.js` - State Management
- Centralized game state using `GameState` class
- Manages: `currentBoard`, `alertedRows`, `cellMap`
- Provides methods for state operations
- No dependencies on other modules

### 3. `ui.js` - User Interface
- `UIManager` class handles all DOM operations
- Responsibilities:
  - Screen transitions (select/game)
  - Board list rendering
  - Board rendering
  - Mini preview generation
  - Row counter updates
  - Visual effects (flash animations)
- Dependencies: `storage.js`

### 4. `gameLogic.js` - Game Rules
- `GameLogic` class implements game rules
- Responsibilities:
  - Row completion checking
  - Mark restoration
  - Number marking logic
- Dependencies: `ui.js`, `storage.js`

### 5. `eventHandlers.js` - Event Management
- Sets up all event listeners
- Functions:
  - `setupEventHandlers` - Main event setup
  - `createCellClickHandler` - Factory for cell click handlers
- Dependencies: `storage.js`

### 6. `app.js` - Application Entry Point
- Initializes all components
- Wires dependencies together
- Starts the application
- Dependencies: all modules

## Benefits of This Structure

### ✅ Separation of Concerns
Each module has a single, well-defined responsibility

### ✅ Easier Testing
Modules can be tested independently with mocked dependencies

### ✅ Better Maintainability
- Easier to locate and fix bugs
- Changes to one concern don't affect others
- Clear module boundaries

### ✅ Code Reusability
Classes like `GameState` and `UIManager` can be reused or extended

### ✅ Improved Readability
- Smaller files are easier to understand
- Clear naming conventions
- Logical grouping of related functions

## Architecture Pattern

The refactored code follows a **layered architecture**:

```
┌─────────────────┐
│    app.js       │  ← Entry point & orchestration
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───────────┐
│Event │  │  GameLogic   │  ← Application layer
│Handle│  │              │
└───┬──┘  └──┬───────────┘
    │        │
    │    ┌───▼───────┐
    └────►  UIManager│        ← Presentation layer
         └───┬───────┘
             │
         ┌───▼───────┐
         │ GameState │        ← State layer
         └───────────┘
             │
         ┌───▼───────┐
         │  Storage  │        ← Data layer
         └───────────┘
```

## Migration Notes

No breaking changes. The application works exactly the same as before, but with better internal structure.

## Future Improvements

Potential enhancements:
- Add unit tests for each module
- Implement undo/redo functionality
- Add keyboard shortcuts
- Support for custom board creation
- Multi-player mode with state synchronization

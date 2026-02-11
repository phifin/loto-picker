# 🎯 Loto Tân Tân

A modern, responsive web application for playing Vietnamese Loto (Bingo) with support for single and multi-board modes.

## ✨ Features

### 🎲 Game Modes
- **Single Board**: Focus on one board at a time
- **Multi Board**: Play multiple boards simultaneously with synchronized marking

### 🎨 Themes
- **Light Mode**: Clean, bright interface for daytime use
- **Dark Mode**: Easy on the eyes for low-light environments
- Automatic system theme detection
- Persistent theme preference

### 📋 Board Management
- 16 pre-configured boards with unique layouts
- Color-coded boards for easy identification
- Mini preview on hover
- Resume badges showing saved progress

### ✅ Game Features
- Click to mark/unmark numbers
- Quick number entry with keyboard (Enter to mark)
- Auto-detection of completed rows (5 numbers)
- Flash animation for marked numbers
- Reset button to start fresh
- LocalStorage to save progress

### 🎯 Multi-Board Sync
- Select multiple boards to play together
- Mark/unmark syncs across all selected boards
- Independent row completion tracking per board
- Simultaneous reset for all boards

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd loto-picker

# Open in browser
open index.html
```

No build step required! Pure vanilla JavaScript.

### Usage
1. **Choose Mode**: Select single or multi-board mode
2. **Select Board(s)**: Click to choose one or more boards
3. **Play**: 
   - Type number and press Enter, or
   - Click numbers directly on the board
4. **Win**: Complete 5 numbers in a row (horizontal)

## 📁 Project Structure

```
loto-picker/
├── index.html
├── assets/
│   ├── styles.css (main entry)
│   └── css/
│       ├── base.css
│       ├── themes.css
│       ├── theme-toggle.css
│       ├── mode-selection.css
│       ├── board-selection.css
│       ├── preview.css
│       ├── game-controls.css
│       ├── board.css
│       └── responsive.css
└── src/
    ├── app.js
    ├── boards.js
    ├── storage.js
    ├── gameState.js
    ├── multiBoard.js
    ├── gameLogic.js
    ├── themeManager.js
    ├── eventHandlers.js
    └── ui/
        ├── uiManager.js
        ├── screenManager.js
        ├── boardListRenderer.js
        └── boardRenderer.js
```

## 🛠️ Tech Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript**: No frameworks, pure ES6 modules
- **LocalStorage**: Client-side persistence

## 📱 Responsive Design

- Desktop: Full-featured experience
- Tablet: Optimized layout for 2-column boards
- Mobile: Single-column stack, touch-friendly

## 🎨 Customization

### Board Colors
Each board has its own color. Colors are customizable and persist per board.

### Themes
Toggle between light and dark mode using the button in top-right corner.

### Adding Boards
Edit `src/boards.js` to add new board configurations:

```javascript
{
  id: 17,
  color: "#yourColor",
  data: [
    // 9 rows × 9 columns
    // null for empty cells, numbers 1-90 for filled cells
  ]
}
```

## 📚 Documentation

- [Refactoring Guide](REFACTORING.md) - Original code structure
- [Multi-Board Feature](MULTI_BOARD_FEATURE.md) - Multi-board implementation
- [File Structure](FILE_STRUCTURE.md) - Modular architecture
- [Theme Feature](THEME_FEATURE.md) - Light/dark mode implementation

## 🧪 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Development

### Code Quality
- Modular architecture
- Single Responsibility Principle
- Clean separation of concerns
- No external dependencies

### Features in Detail

#### Storage
- Board progress: `loto_marked_{boardId}`
- Board colors: `loto_color_{boardId}`
- Theme: `loto_theme`

#### State Management
- `GameState`: Single-board state
- `MultiBoardManager`: Multi-board orchestration
- Each board maintains independent state

#### UI Modules
- `ScreenManager`: Navigation between screens
- `BoardListRenderer`: Board selection & previews
- `BoardRenderer`: Game board rendering

## 🎯 Game Rules

1. Each board has 9 rows × 9 columns
2. Empty cells are marked with gaps
3. Numbers range from 1-90
4. Mark 5 numbers in a row to complete it
5. Row completion is highlighted with gold color
6. In multi-board mode, marks sync across all boards

## 💡 Tips

- Use keyboard for faster number entry
- Hover over boards to see mini preview
- Resume badges show saved progress
- Dark mode for night playing
- Multi-board mode for serious players

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and modular structure.

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 👨‍💻 Author

Built with ❤️ for Loto enthusiasts

## 🙏 Acknowledgments

- Modern UI inspired by contemporary design principles
- Vietnamese Loto rules and traditions
- Community feedback and suggestions

---

**Enjoy playing! 🎉**

// Game board rendering (single and multi-board)

import { loadColor, saveColor } from "../services/storage.js";

export class BoardRenderer {
  constructor(boardsContainer, colorPickerEl) {
    this.boardsContainer = boardsContainer;
    this.colorPickerEl = colorPickerEl;
  }

  renderMultipleBoards(boards, multiBoardMgr, onCellClick) {
    this.boardsContainer.innerHTML = "";
    
    // Check if mobile and create swiper container
    const isMobile = window.innerWidth < 768;
    let swiperContainer = null;
    let swiperWrapper = null;
    
    if (isMobile) {
      swiperContainer = document.createElement("div");
      swiperContainer.className = "swiper swiper-multiboard";
      
      swiperWrapper = document.createElement("div");
      swiperWrapper.className = "swiper-wrapper";
      
      this.boardsContainer.appendChild(swiperContainer);
      swiperContainer.appendChild(swiperWrapper);
    }
    
    boards.forEach((boardData) => {
      const boardWrapper = document.createElement("div");
      boardWrapper.className = "board-wrapper";
      boardWrapper.dataset.boardId = boardData.id;
      
      // Add swiper slide class on mobile
      if (isMobile) {
        boardWrapper.classList.add("swiper-slide");
      }
      
      const boardHeader = document.createElement("div");
      boardHeader.className = "board-header";
      boardHeader.innerHTML = `<h3>Bàn ${boardData.id}</h3>`;
      
      const boardElement = document.createElement("div");
      boardElement.className = "board";
      boardElement.dataset.boardId = boardData.id;
      
      const color = loadColor(boardData.id, boardData.color);
      boardElement.style.setProperty("--cell-color", color);
      
      const boardState = multiBoardMgr.initBoardState(boardData.id);
      
      boardData.data.forEach((row, rowIndex) => {
        row.forEach((v) => {
          const div = document.createElement("div");
          div.dataset.row = rowIndex;
          div.dataset.boardId = boardData.id;
          if (v === null) {
            div.className = "cell empty";
          } else {
            div.className = "cell num";
            div.textContent = v;
            boardState.cellMap.set(v, { el: div, row: rowIndex });
            div.onclick = () => onCellClick(v, boardData.id, div, rowIndex);
          }
          boardElement.appendChild(div);
        });
      });
      
      boardWrapper.appendChild(boardHeader);
      boardWrapper.appendChild(boardElement);
      
      if (isMobile) {
        swiperWrapper.appendChild(boardWrapper);
      } else {
        this.boardsContainer.appendChild(boardWrapper);
      }
    });
    
    // Initialize Swiper on mobile
    if (isMobile && swiperContainer) {
      // Add pagination only
      const pagination = document.createElement("div");
      pagination.className = "swiper-pagination";
      swiperContainer.appendChild(pagination);
      
      // Initialize Swiper without navigation
      new Swiper(swiperContainer, {
        direction: 'horizontal',
        loop: false,
        spaceBetween: 10,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        slidesPerView: 1,
        centeredSlides: true,
      });
    }
  }

  applyBoardColor(hex, boardId) {
    // This is for single board mode compatibility
    const boardEl = this.boardsContainer.querySelector(".board");
    if (boardEl) {
      boardEl.style.setProperty("--cell-color", hex);
    }
    this.colorPickerEl.value = hex;
    if (boardId) saveColor(boardId, hex);
  }

  clearBoard() {
    this.boardsContainer.innerHTML = "";
  }

  resetMarkedCells() {
    this.boardsContainer
      .querySelectorAll(".marked, .row-complete, .flash")
      .forEach((el) => el.classList.remove("marked", "row-complete", "flash"));
  }

  getRowCells(rowIndex) {
    // For single board mode
    const boardEl = this.boardsContainer.querySelector(".board");
    if (!boardEl) return [];
    const start = rowIndex * 9;
    return [...boardEl.children].slice(start, start + 9);
  }

  getRowCellsForBoard(boardId, rowIndex) {
    const boardEl = this.boardsContainer.querySelector(`.board[data-board-id="${boardId}"]`);
    if (!boardEl) return [];
    const start = rowIndex * 9;
    return [...boardEl.children].slice(start, start + 9);
  }

  getCellElement(boardId, number) {
    const cells = this.boardsContainer.querySelectorAll(`.cell.num[data-board-id="${boardId}"]`);
    for (const cell of cells) {
      if (cell.textContent === String(number)) {
        return cell;
      }
    }
    return null;
  }

  flashCell(el) {
    el.classList.remove("flash");
    void el.offsetWidth; // Force reflow
    el.classList.add("flash");
    el.addEventListener("animationend", () => el.classList.remove("flash"), {
      once: true,
    });
  }

  updateRowCounter(gameState) {
    // Row counter feature removed, kept for compatibility
  }
}

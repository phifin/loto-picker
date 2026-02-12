// Board list and preview rendering

import { loadMarked, loadColor } from "../services/storage.js";

export class BoardListRenderer {
  constructor(boardListEl) {
    this.boardListEl = boardListEl;
    this.previewContainer = null;
  }

  renderBoardList(boards, onBoardSelect, multiBoardMgr = null) {
    this.boardListEl.innerHTML = "";
    
    // Create or get preview container
    if (!this.previewContainer) {
      this.previewContainer = document.getElementById("previewContainer");
      if (!this.previewContainer) {
        this.previewContainer = document.createElement("div");
        this.previewContainer.id = "previewContainer";
        this.previewContainer.className = "preview-container";
        document.body.appendChild(this.previewContainer);
      }
    }
    this.previewContainer.innerHTML = "";
    
    const isMultiMode = multiBoardMgr && multiBoardMgr.isMulti();
    
    boards.forEach((b) => {
      const wrap = document.createElement("div");
      wrap.className = "board-btn-wrap";
      
      if (isMultiMode && multiBoardMgr.isSelected(b.id)) {
        wrap.classList.add("selected");
      }

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
      
      // Add checkmark for multi-select mode (only if selected)
      if (isMultiMode && multiBoardMgr.isSelected(b.id)) {
        const checkbox = document.createElement("span");
        checkbox.className = "board-checkbox";
        checkbox.innerHTML = "✓";
        btn.appendChild(checkbox);
      }

      const label = document.createElement("span");
      label.textContent = `Bàn ${b.id}`;
      btn.appendChild(label);

      // Create preview and add to container
      const preview = this.buildMiniPreview(b);
      preview.dataset.boardId = b.id;
      this.previewContainer.appendChild(preview);

      let isPreviewVisible = false;
      let skipNextClick = false; // Prevent click after long press or tap-to-dismiss
      let touchStartTime = 0;
      let touchStartX = 0;
      let touchStartY = 0;
      let hasMoved = false;

      const showPreview = () => {
        const rect = btn.getBoundingClientRect();
        preview.style.left = `${rect.left + rect.width / 2}px`;
        preview.style.top = `${rect.bottom + 6}px`;
        preview.classList.add("visible");
        isPreviewVisible = true;
      };

      const hidePreview = () => {
        preview.classList.remove("visible");
        isPreviewVisible = false;
      };

      // Click handler: only for desktop
      btn.onclick = (e) => {
        // On touch devices, handle everything through touch events
        if ('ontouchstart' in window) {
          e.preventDefault();
          return;
        }
        console.log(`Desktop click on board ${b.id}`);
        onBoardSelect(b);
      };

      // Desktop: hover
      if (!('ontouchstart' in window)) {
        wrap.addEventListener("mouseenter", showPreview);
        wrap.addEventListener("mouseleave", hidePreview);
      }

      // Mobile: use pointer events for better control
      if ('ontouchstart' in window) {
        let longPressTimer = null;
        let isLongPress = false;

        btn.addEventListener("pointerdown", (e) => {
          console.log(`Pointerdown on board ${b.id}, isPreviewVisible: ${isPreviewVisible}`);
          isLongPress = false;
          
          if (isPreviewVisible) {
            console.log("Tapping to dismiss preview");
            hidePreview();
            return;
          }

          longPressTimer = setTimeout(() => {
            console.log("Long press triggered, showing preview");
            showPreview();
            isLongPress = true;
          }, 500);
        });

        btn.addEventListener("pointerup", (e) => {
          console.log(`Pointerup on board ${b.id}, isLongPress: ${isLongPress}`);
          
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }

          // Only select board if it wasn't a long press
          if (!isLongPress && !isPreviewVisible) {
            console.log(`Quick tap detected, selecting board ${b.id}`);
            onBoardSelect(b);
          }
        });

        btn.addEventListener("pointercancel", () => {
          console.log("Pointercancel");
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
          isLongPress = false;
        });

        btn.addEventListener("pointerleave", () => {
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
          isLongPress = false;
        });
      }

      wrap.appendChild(btn);
      this.boardListEl.appendChild(wrap);
    });

    // Click outside to hide preview on mobile
    if ('ontouchstart' in window) {
      document.addEventListener("touchstart", (e) => {
        if (!e.target.closest('.board-btn-wrap') && !e.target.closest('.mini-preview')) {
          document.querySelectorAll('.mini-preview.visible').forEach(p => {
            p.classList.remove('visible');
          });
        }
      });
    }
  }

  buildMiniPreview(board) {
    const saved = new Set(loadMarked(board.id));
    const preview = document.createElement("div");
    preview.className = "mini-preview";
    preview.style.setProperty("--prev-color", loadColor(board.id, board.color));

    board.data.forEach((row) => {
      row.forEach((v) => {
        const cell = document.createElement("div");
        if (v === null) {
          cell.className = "mini-cell mini-empty";
        } else {
          cell.className = "mini-cell mini-num" + (saved.has(v) ? " mini-marked" : "");
          cell.textContent = v;
        }
        preview.appendChild(cell);
      });
    });

    return preview;
  }
}

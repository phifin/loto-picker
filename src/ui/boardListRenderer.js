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

      // Click handler: skip if it was long press or tap-to-dismiss
      btn.onclick = (e) => {
        if (skipNextClick) {
          e.preventDefault();
          e.stopPropagation();
          skipNextClick = false;
          return;
        }
        onBoardSelect(b);
      };

      // Desktop: hover
      wrap.addEventListener("mouseenter", showPreview);
      wrap.addEventListener("mouseleave", hidePreview);

      // Mobile: improved touch handling
      let longPressTimer = null;

      btn.addEventListener("touchstart", (e) => {
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        hasMoved = false;
        
        if (isPreviewVisible) {
          // Tap to dismiss - hide preview, skip the follow-up click
          hidePreview();
          skipNextClick = true;
          return;
        }

        longPressTimer = setTimeout(() => {
          if (!hasMoved) {
            showPreview();
            skipNextClick = true; // Prevent click when user releases
          }
          longPressTimer = null;
        }, 500); // Increased to 500ms for better distinction
      });

      btn.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const moveX = Math.abs(touch.clientX - touchStartX);
        const moveY = Math.abs(touch.clientY - touchStartY);
        
        // If moved more than 10px, consider it as a scroll/drag, not a press
        if (moveX > 10 || moveY > 10) {
          hasMoved = true;
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        }
      });

      btn.addEventListener("touchend", (e) => {
        const touchDuration = Date.now() - touchStartTime;
        
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        
        // If it was a quick tap (less than 200ms) and no movement, allow click
        if (touchDuration < 200 && !hasMoved && !isPreviewVisible) {
          skipNextClick = false;
        }
      });

      btn.addEventListener("touchcancel", () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        hasMoved = true;
      });

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

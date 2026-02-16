import { openSettingsModal } from "./hostModals/settingsModal.js";
import { openCheckModal } from "./hostModals/checkModal.js";
import { openConfirmResetModal } from "./hostModals/confirmResetModal.js";

export class HostToolbar {
  constructor(elements, hostController) {
    this.elements = elements;
    this.host = hostController;

    this.isMobile = window.innerWidth < 768;

    this._bindButtons();
    this._applyLayout();
    window.addEventListener("resize", () => {
      const mobileNow = window.innerWidth < 768;
      if (mobileNow !== this.isMobile) {
        this.isMobile = mobileNow;
        this._applyLayout();
      }
    });
  }

  _bindButtons() {
    this.btnStartPause = document.getElementById("btnHostStartPause");
    this.btnSettings = document.getElementById("btnHostSettings");
    this.btnCheck = document.getElementById("btnHostCheck");
    this.btnMore = document.getElementById("btnHostMore");
    this.moreMenu = document.getElementById("hostMoreMenu");
    this.btnReset = this.elements.btnReset;

    if (this.btnStartPause) {
      this.btnStartPause.addEventListener("click", () => this._toggleStartPause());
      this._updateStartPauseLabel();
    }

    const openSettings = () =>
      openSettingsModal({
        intervalSeconds: this.host.getIntervalSeconds(),
        autoTick: this.host.getAutoTick(),
        onChange: ({ intervalSeconds, autoTick }) => {
          this.host.setIntervalSeconds(intervalSeconds);
          this.host.setAutoTick(autoTick);
        },
      });

    const openCheck = () =>
      openCheckModal({
        calledNumbers: this.host.getCalledNumbers(),
        isCalled: (n) => this.host.isCalled(n),
      });

    if (this.btnSettings) {
      this.btnSettings.addEventListener("click", openSettings);
    }

    if (this.btnCheck) {
      this.btnCheck.addEventListener("click", openCheck);
    }

    if (this.btnMore && this.moreMenu) {
      this.btnMore.addEventListener("click", () => {
        this.moreMenu.classList.toggle("open");
      });

      const moreSettings = document.getElementById("hostMoreSettings");
      const moreCheck = document.getElementById("hostMoreCheck");

      moreSettings?.addEventListener("click", () => {
        this.moreMenu.classList.remove("open");
        openSettings();
      });
      moreCheck?.addEventListener("click", () => {
        this.moreMenu.classList.remove("open");
        openCheck();
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener("click", (e) => {
        // Only intercept reset when host mode is active
        if (!this.host.isHostActive?.()) return;
        e.preventDefault();
        openConfirmResetModal({
          onConfirm: () => {
            this.host.resetAll();
          },
        });
      });
    }
  }

  _applyLayout() {
    if (!this.btnMore || !this.btnSettings || !this.btnCheck) return;

    if (this.isMobile) {
      // Mobile: show More (⋯), hide inline Settings / Check
      this.btnMore.classList.remove("host-toolbar-hidden");
      this.btnSettings.classList.add("host-toolbar-hidden");
      this.btnCheck.classList.add("host-toolbar-hidden");
    } else {
      // Desktop / tablet: show inline Settings / Check, hide More (⋯)
      this.btnMore.classList.add("host-toolbar-hidden");
      this.btnSettings.classList.remove("host-toolbar-hidden");
      this.btnCheck.classList.remove("host-toolbar-hidden");
      this.moreMenu?.classList.remove("open");
    }
  }

  _toggleStartPause() {
    if (this.host.isRunning()) {
      this.host.pause();
    } else {
      this.host.start();
    }
    this._updateStartPauseLabel();
  }

  _updateStartPauseLabel() {
    if (!this.btnStartPause) return;
    this.btnStartPause.textContent = this.host.isRunning()
      ? "Tạm dừng"
      : "Bắt đầu";
  }
}


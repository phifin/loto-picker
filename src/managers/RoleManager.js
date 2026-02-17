/**
 * Manages role selection (User vs Host)
 */
export class RoleManager {
  constructor({ elements, uiManager, multiBoardMgr, onRoleChange }) {
    this.elements = elements;
    this.uiManager = uiManager;
    this.multiBoardMgr = multiBoardMgr;
    this.onRoleChange = onRoleChange;
    this.currentRole = null; // 'user' | 'host'
    
    this._setupEventListeners();
  }

  _setupEventListeners() {
    if (this.elements.btnRoleUser) {
      this.elements.btnRoleUser.onclick = () => this.selectUserRole();
    }

    if (this.elements.btnRoleHost) {
      this.elements.btnRoleHost.onclick = () => this.selectHostRole();
    }

    if (this.elements.btnBackToRole) {
      this.elements.btnBackToRole.onclick = () => this.backToRoleSelection();
    }
  }

  async selectUserRole() {
    this.currentRole = "user";
    document.body.classList.remove("host-mode");
    this.uiManager.setStep("selectMode");
    this.onRoleChange?.(this.currentRole);
  }

  async selectHostRole() {
    this.currentRole = "host";
    document.body.classList.add("host-mode");
    
    // Unlock audio context immediately when entering host mode
    const { initAudioContext } = await import("../services/audioPlayer.js");
    initAudioContext();
    
    this.uiManager.setStep("selectMode");
    this.onRoleChange?.(this.currentRole);
  }

  backToRoleSelection() {
    // Clear any mode-specific state
    this.multiBoardMgr.reset();
    // Reset role
    this.currentRole = null;
    document.body.classList.remove("host-mode");
    // Show role selection screen
    this.uiManager.setStep("selectRole");
    this.onRoleChange?.(null);
  }

  getCurrentRole() {
    return this.currentRole;
  }

  isHost() {
    return this.currentRole === "host";
  }

  isUser() {
    return this.currentRole === "user";
  }
}

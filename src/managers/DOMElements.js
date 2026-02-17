/**
 * Centralized DOM element references
 */
export function getDOMElements() {
  return {
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
    btnPlayerMore: document.getElementById("btnPlayerMore"),
    playerMoreMenu: document.getElementById("playerMoreMenu"),
  };
}

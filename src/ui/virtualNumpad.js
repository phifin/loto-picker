/**
 * Bàn phím số ảo: cập nhật value cho input và gọi onSubmit khi bấm Enter.
 * Dùng để tránh bàn phím mặc định trên mobile (zoom/đẩy UI).
 */

export function initVirtualNumpad(inputEl, onSubmit) {
  const numpad = document.getElementById("virtualNumpad");
  if (!numpad || !inputEl) return;

  const isCoarsePointer =
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
    "ontouchstart" in window;

  // Desktop: ẩn bàn phím ảo, cho phép gõ bình thường
  if (!isCoarsePointer) {
    numpad.classList.add("hidden");
    numpad.setAttribute("aria-hidden", "true");
    inputEl.readOnly = false;
    inputEl.setAttribute("inputmode", "numeric");
    return;
  }

  // Mobile/Tablet: hiện bàn phím ảo + chặn bàn phím mặc định
  numpad.classList.remove("hidden");
  numpad.setAttribute("aria-hidden", "false");
  inputEl.readOnly = true;
  inputEl.setAttribute("inputmode", "none");

  // Chặn focus mở bàn phím trên mobile (readonly vẫn có thể trigger trên một số thiết bị)
  inputEl.addEventListener("focus", () => inputEl.blur());

  numpad.addEventListener("click", (e) => {
    const key = e.target.closest(".numpad-key")?.dataset?.key;
    if (!key) return;

    e.preventDefault();
    if (key === "enter") {
      const value = Number(inputEl.value);
      inputEl.value = "";
      onSubmit(value);
      return;
    }
    if (key === "backspace") {
      inputEl.value = inputEl.value.slice(0, -1);
      return;
    }
    // Digit 0-9: tối đa 2 chữ số (số loto 1–90)
    const digit = key;
    if (inputEl.value.length < 2) {
      inputEl.value += digit;
    }
  });
}

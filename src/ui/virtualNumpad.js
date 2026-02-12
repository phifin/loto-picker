/**
 * Bàn phím số ảo: cập nhật value cho input và gọi onSubmit khi bấm Enter.
 * Dùng để tránh bàn phím mặc định trên mobile (zoom/đẩy UI).
 */

export function initVirtualNumpad(inputEl, onSubmit) {
  // Chỉ khởi tạo numpad trên mobile và tablet
  if (window.innerWidth >= 1024) {
    // Desktop: cho phép input bình thường
    inputEl.removeAttribute("readonly");
    inputEl.setAttribute("type", "number");
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const value = Number(inputEl.value);
        inputEl.value = "";
        onSubmit(value);
      }
    });
    return;
  }

  const numpad = document.getElementById("virtualNumpad");
  if (!numpad || !inputEl) return;

  // Chặn focus mở bàn phím trên mobile (readonly vẫn có thể trigger trên một số thiết bị)
  inputEl.addEventListener("focus", () => {
    if ("ontouchstart" in window) inputEl.blur();
  });

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

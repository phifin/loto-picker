import { openModal } from "../../shared/components/modal.js";

function createOtpInputs(initialValues = []) {
  const wrap = document.createElement("div");
  wrap.className = "otp-inputs";

  const inputs = [];

  for (let i = 0; i < 5; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.maxLength = 2;
    input.className = "otp-input";
    if (initialValues[i]) {
      input.value = String(initialValues[i]);
    }
    inputs.push(input);
    wrap.appendChild(input);
  }

  // Navigation logic
  inputs.forEach((input, idx) => {
    input.addEventListener("input", (e) => {
      const v = e.target.value.replace(/\D/g, "").slice(0, 2);
      e.target.value = v;
      if (v.length === 2 && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
  });

  return { wrap, inputs };
}

export function openCheckModal({ calledNumbers, isCalled }) {
  const content = document.createElement("div");
  content.className = "host-check";

  const listSection = document.createElement("div");
  listSection.className = "called-list";

  const listTitle = document.createElement("div");
  listTitle.className = "section-title";
  listTitle.textContent = "Các số đã đọc";
  listSection.appendChild(listTitle);

  const numbersGrid = document.createElement("div");
  numbersGrid.className = "numbers-grid";

  const sorted = [...calledNumbers].sort((a, b) => a - b);
  sorted.forEach((n) => {
    const span = document.createElement("span");
    span.className = "number-chip";
    span.textContent = String(n);
    numbersGrid.appendChild(span);
  });

  if (!sorted.length) {
    const empty = document.createElement("div");
    empty.className = "empty-text";
    empty.textContent = "Chưa có số nào được đọc.";
    numbersGrid.appendChild(empty);
  }

  listSection.appendChild(numbersGrid);

  const checkSection = document.createElement("div");
  checkSection.className = "check-section";

  const checkTitle = document.createElement("div");
  checkTitle.className = "section-title";
  checkTitle.textContent = "Nhập 5 số cần kiểm tra";

  const { wrap: otpWrap, inputs } = createOtpInputs();

  const result = document.createElement("div");
  result.className = "check-result";

  checkSection.appendChild(checkTitle);
  checkSection.appendChild(otpWrap);
  checkSection.appendChild(result);

  content.appendChild(listSection);
  content.appendChild(checkSection);

  function doCheck() {
    const values = inputs
      .map((i) => i.value.trim())
      .filter((v) => v.length > 0)
      .map((v) => Number(v));

    if (values.length !== 5 || values.some((v) => !Number.isInteger(v) || v < 1 || v > 90)) {
      result.textContent = "Vui lòng nhập đủ 5 số từ 1 đến 90.";
      result.classList.remove("valid");
      result.classList.add("invalid");
      return false;
    }

    const missing = values.filter((v) => !isCalled(v));

    if (missing.length === 0) {
      result.textContent = "Hợp lệ ✅";
      result.classList.remove("invalid");
      result.classList.add("valid");
    } else {
      result.textContent = `Chưa được đọc: ${missing.join(", ")}`;
      result.classList.remove("valid");
      result.classList.add("invalid");
    }

    return false; // keep modal open
  }

  openModal({
    title: "Kiểm tra số",
    content,
    actions: [
      {
        label: "Đóng",
        primary: false,
      },
      {
        label: "Kiểm tra",
        primary: true,
        onClick: () => doCheck(),
      },
    ],
  });
}


import { openModal } from "../../shared/components/modal.js";

export function openSettingsModal({ intervalSeconds, autoTick, onChange }) {
  const content = document.createElement("div");
  content.className = "host-settings";

  const intervalLabel = document.createElement("label");
  intervalLabel.className = "settings-row";
  intervalLabel.textContent = "Thời gian giữa 2 số (giây)";

  const intervalInput = document.createElement("input");
  intervalInput.type = "number";
  intervalInput.min = "1";
  intervalInput.max = "30";
  intervalInput.step = "1";
  intervalInput.value = String(intervalSeconds ?? 4);
  intervalInput.className = "settings-input";
  intervalLabel.appendChild(intervalInput);

  const autoTickLabel = document.createElement("label");
  autoTickLabel.className = "settings-row";

  const autoTickCheckbox = document.createElement("input");
  autoTickCheckbox.type = "checkbox";
  autoTickCheckbox.checked = !!autoTick;
  autoTickCheckbox.className = "settings-checkbox";

  const autoTickText = document.createElement("span");
  autoTickText.textContent = "Tự đánh dấu số trên bàn hiện tại";

  autoTickLabel.appendChild(autoTickCheckbox);
  autoTickLabel.appendChild(autoTickText);

  content.appendChild(intervalLabel);
  content.appendChild(autoTickLabel);

  openModal({
    title: "Cài đặt chủ trò",
    content,
    actions: [
      {
        label: "Hủy",
        primary: false,
      },
      {
        label: "Lưu",
        primary: true,
        onClick: () => {
          const val = Number(intervalInput.value);
          const normalized = Number.isFinite(val) ? Math.min(30, Math.max(1, val)) : 4;
          onChange?.({
            intervalSeconds: normalized,
            autoTick: autoTickCheckbox.checked,
          });
        },
      },
    ],
  });
}


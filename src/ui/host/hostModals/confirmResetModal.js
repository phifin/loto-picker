import { openModal } from "../../shared/components/modal.js";

export function openConfirmResetModal({ onConfirm }) {
  openModal({
    title: "Chơi ván mới?",
    content: "Tất cả dấu đã đánh và lịch sử số đã đọc sẽ bị xóa.",
    actions: [
      {
        label: "Hủy",
        primary: false,
      },
      {
        label: "Reset",
        primary: true,
        onClick: () => {
          onConfirm?.();
        },
      },
    ],
  });
}

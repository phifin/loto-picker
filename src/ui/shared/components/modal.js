// Lightweight modal helper used by host settings/check/confirm dialogs

function ensureContainer() {
  let root = document.getElementById("modalRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "modalRoot";
    document.body.appendChild(root);
  }
  return root;
}

export function openModal({ title, content, actions = [], onClose } = {}) {
  const root = ensureContainer();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const dialog = document.createElement("div");
  dialog.className = "modal-dialog";

  if (title) {
    const h = document.createElement("h3");
    h.className = "modal-title";
    h.textContent = title;
    dialog.appendChild(h);
  }

  if (content instanceof HTMLElement) {
    dialog.appendChild(content);
  } else if (typeof content === "string") {
    const p = document.createElement("p");
    p.className = "modal-text";
    p.textContent = content;
    dialog.appendChild(p);
  }

  if (actions.length) {
    const footer = document.createElement("div");
    footer.className = "modal-actions";

    actions.forEach((action) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = action.label;
      btn.className = action.primary ? "action-btn primary" : "action-btn";
      btn.addEventListener("click", () => {
        const shouldClose = action.onClick?.() !== false;
        if (shouldClose) {
          close();
        }
      });
      footer.appendChild(btn);
    });

    dialog.appendChild(footer);
  }

  overlay.appendChild(dialog);
  root.appendChild(overlay);

  function close() {
    overlay.remove();
    onClose?.();
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  return { close };
}


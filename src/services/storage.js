// Local storage management for loto game

function keyMarked(id) {
  return `loto_marked_${id}`;
}

function keyColor(id) {
  return `loto_color_${id}`;
}

export function saveMarked(boardId, cellMap) {
  const marked = [];
  cellMap.forEach((val, num) => {
    if (val.el.classList.contains("marked")) marked.push(num);
  });
  localStorage.setItem(keyMarked(boardId), JSON.stringify(marked));
}

export function loadMarked(boardId) {
  try {
    return JSON.parse(localStorage.getItem(keyMarked(boardId))) || [];
  } catch {
    return [];
  }
}

export function clearMarked(boardId) {
  localStorage.removeItem(keyMarked(boardId));
}

export function saveColor(boardId, hex) {
  localStorage.setItem(keyColor(boardId), hex);
}

export function loadColor(boardId, fallback) {
  return localStorage.getItem(keyColor(boardId)) || fallback;
}

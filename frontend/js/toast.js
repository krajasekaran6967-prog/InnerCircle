const toastEl = document.getElementById("toast");
let toastTimer = null;

export function showToast(message, type = "success") {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.className = `toast toast-${type} toast-show`;
  toastEl.hidden = false;
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("toast-show");
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 200);
  }, 2500);
}

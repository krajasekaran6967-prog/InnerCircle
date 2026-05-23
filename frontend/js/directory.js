import { api } from "./api.js";

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderAvatar(user) {
  if (user.thumbnailUrl) {
    return `<img src="${user.thumbnailUrl}" alt="" class="avatar-img" />`;
  }
  return `<span class="avatar-initials">${getInitials(user.name)}</span>`;
}

export function initDirectory({ listEl, searchEl, emptyEl, onViewMember }) {
  let debounceTimer = null;

  async function loadDirectory(search = "") {
    listEl.innerHTML = '<p class="muted loading-text">Loading members…</p>';
    emptyEl.hidden = true;

    try {
      const data = await api.getUsers(search);
      const users = data.users || [];

      if (users.length === 0) {
        listEl.innerHTML = "";
        emptyEl.hidden = false;
        return;
      }

      listEl.innerHTML = users
        .map(
          (user) => `
        <article class="member-card">
          <div class="avatar avatar-lg">${renderAvatar(user)}</div>
          <div class="member-card-body">
            <h3>${escapeHtml(user.name)}</h3>
            <p class="muted">${escapeHtml(user.department)}</p>
            <p class="member-email">${escapeHtml(user.email)}</p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" data-user-id="${user.id}">
            View profile
          </button>
        </article>
      `
        )
        .join("");

      listEl.querySelectorAll("[data-user-id]").forEach((button) => {
        button.addEventListener("click", () => {
          onViewMember(button.dataset.userId);
        });
      });
    } catch (error) {
      listEl.innerHTML = `<p class="form-message error">${escapeHtml(error.message)}</p>`;
    }
  }

  searchEl.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadDirectory(searchEl.value.trim());
    }, 300);
  });

  return { loadDirectory };
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

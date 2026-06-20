import { api } from "./api.js";
import { burstFromEvent } from "./effects.js";

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

function friendshipButton(user) {
  const status = user.friendship ? user.friendship.status : "none";

  if (status === "friends") {
    return `<button type="button" class="btn btn-primary btn-sm" data-message="${user.id}">Message</button>`;
  }
  if (status === "pending_outgoing") {
    return `<button type="button" class="btn btn-secondary btn-sm" disabled>Requested</button>`;
  }
  if (status === "pending_incoming") {
    return `<button type="button" class="btn btn-primary btn-sm" data-accept="${user.friendship.requestId}">Accept request</button>`;
  }
  return `<button type="button" class="btn btn-primary btn-sm" data-add-friend="${user.id}">Add friend</button>`;
}

export function initDirectory({ listEl, searchEl, emptyEl, onViewMember, onMessageUser, onChange }) {
  let debounceTimer = null;
  let lastSearch = "";

  async function loadDirectory(search = "") {
    lastSearch = search;
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
          <div class="member-card-actions">
            <button type="button" class="btn btn-secondary btn-sm" data-user-id="${user.id}">
              View profile
            </button>
            ${friendshipButton(user)}
          </div>
        </article>
      `
        )
        .join("");

      wireActions();
    } catch (error) {
      listEl.innerHTML = `<p class="form-message error">${escapeHtml(error.message)}</p>`;
    }
  }

  function wireActions() {
    listEl.querySelectorAll("[data-user-id]").forEach((button) => {
      button.addEventListener("click", () => onViewMember(button.dataset.userId));
    });
    listEl.querySelectorAll("[data-add-friend]").forEach((button) => {
      button.addEventListener("click", (event) => addFriend(button.dataset.addFriend, event));
    });
    listEl.querySelectorAll("[data-accept]").forEach((button) => {
      button.addEventListener("click", (event) => acceptRequest(button.dataset.accept, event));
    });
    listEl.querySelectorAll("[data-message]").forEach((button) => {
      button.addEventListener("click", () => onMessageUser(button.dataset.message));
    });
  }

  async function addFriend(userId, event) {
    try {
      await api.sendFriendRequest(userId);
      burstFromEvent(event, { count: 28, power: 8 });
      await loadDirectory(lastSearch);
      if (onChange) onChange();
    } catch (error) {
      console.error(error);
    }
  }

  async function acceptRequest(requestId, event) {
    try {
      await api.respondToRequest(requestId, "accept");
      burstFromEvent(event);
      await loadDirectory(lastSearch);
      if (onChange) onChange();
    } catch (error) {
      console.error(error);
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

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

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function memberCard(user, actionsHtml) {
  return `
    <article class="member-card" data-user-id="${user.id}">
      <div class="avatar avatar-lg">${renderAvatar(user)}</div>
      <div class="member-card-body">
        <h3>${escapeHtml(user.name)}</h3>
        <p class="muted">${escapeHtml(user.department)}</p>
        <p class="member-email">${escapeHtml(user.email)}</p>
      </div>
      <div class="member-card-actions">${actionsHtml}</div>
    </article>
  `;
}

export function initFriends({
  incomingListEl,
  incomingEmptyEl,
  incomingCountEl,
  friendsListEl,
  friendsEmptyEl,
  outgoingListEl,
  outgoingEmptyEl,
  badgeEl,
  onMessageUser,
  onChange,
}) {
  let cache = { friends: [], incoming: [], outgoing: [] };

  function updateBadge(count) {
    if (count > 0) {
      badgeEl.textContent = count;
      badgeEl.hidden = false;
    } else {
      badgeEl.hidden = true;
    }
  }

  function render() {
    const { friends, incoming, outgoing } = cache;

    incomingCountEl.hidden = incoming.length === 0;
    incomingCountEl.textContent = incoming.length;
    updateBadge(incoming.length);

    incomingEmptyEl.hidden = incoming.length > 0;
    incomingListEl.innerHTML = incoming
      .map((item) =>
        memberCard(
          item.user,
          `<button type="button" class="btn btn-primary btn-sm" data-accept="${item.requestId}">Accept</button>
           <button type="button" class="btn btn-secondary btn-sm" data-decline="${item.requestId}">Decline</button>`
        )
      )
      .join("");

    friendsEmptyEl.hidden = friends.length > 0;
    friendsListEl.innerHTML = friends
      .map((user) =>
        memberCard(
          user,
          `<button type="button" class="btn btn-primary btn-sm" data-message="${user.id}">Message</button>
           <button type="button" class="btn btn-secondary btn-sm" data-remove-friend="${user.id}">Remove</button>`
        )
      )
      .join("");

    outgoingEmptyEl.hidden = outgoing.length > 0;
    outgoingListEl.innerHTML = outgoing
      .map((item) =>
        memberCard(
          item.user,
          `<button type="button" class="btn btn-secondary btn-sm" disabled>Pending</button>`
        )
      )
      .join("");

    wireActions();
  }

  function wireActions() {
    incomingListEl.querySelectorAll("[data-accept]").forEach((btn) => {
      btn.addEventListener("click", (event) => respond(btn.dataset.accept, "accept", event));
    });
    incomingListEl.querySelectorAll("[data-decline]").forEach((btn) => {
      btn.addEventListener("click", () => respond(btn.dataset.decline, "decline"));
    });
    friendsListEl.querySelectorAll("[data-message]").forEach((btn) => {
      btn.addEventListener("click", () => onMessageUser(btn.dataset.message));
    });
    friendsListEl.querySelectorAll("[data-remove-friend]").forEach((btn) => {
      btn.addEventListener("click", () => removeFriend(btn.dataset.removeFriend));
    });
  }

  async function respond(requestId, action, event) {
    try {
      await api.respondToRequest(requestId, action);
      if (action === "accept") {
        burstFromEvent(event);
      }
      await loadFriends();
      if (onChange) onChange();
    } catch (error) {
      console.error(error);
    }
  }

  async function removeFriend(userId) {
    const friend = cache.friends.find((user) => user.id === userId);
    if (!friend || !friend.friendship) {
      return;
    }
    try {
      await api.removeFriend(friend.friendship.requestId);
      await loadFriends();
      if (onChange) onChange();
    } catch (error) {
      console.error(error);
    }
  }

  async function loadFriends() {
    try {
      const data = await api.getFriends();
      cache = {
        friends: data.friends || [],
        incoming: data.incoming || [],
        outgoing: data.outgoing || [],
      };
      render();
    } catch (error) {
      console.error(error);
    }
  }

  async function refreshBadge() {
    try {
      const data = await api.getFriends();
      updateBadge((data.incoming || []).length);
    } catch (error) {
      console.error(error);
    }
  }

  function getFriends() {
    return cache.friends;
  }

  return { loadFriends, refreshBadge, getFriends };
}

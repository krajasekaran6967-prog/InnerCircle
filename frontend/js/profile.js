import { api } from "./api.js";
import { showMessage } from "./auth.js";
import { burstFromElement, burstFromEvent } from "./effects.js";

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function setAvatarPreview(container, user) {
  if (user.thumbnailUrl) {
    container.innerHTML = `<img src="${user.thumbnailUrl}" alt="" class="avatar-img" />`;
  } else {
    container.innerHTML = `<span class="avatar-initials">${getInitials(user.name)}</span>`;
  }
}

export function initProfile({
  formEl,
  messageEl,
  avatarPreviewEl,
  avatarInputEl,
  onProfileUpdated,
}) {
  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(formEl);

    try {
      showMessage(messageEl, "");
      const data = await api.updateProfile({
        name: formData.get("name"),
        department: formData.get("department"),
        bio: formData.get("bio"),
      });
      onProfileUpdated(data.user);
      showMessage(messageEl, "Profile saved.", "success");
      burstFromElement(formEl.querySelector('button[type="submit"]'));
    } catch (error) {
      showMessage(messageEl, error.message, "error");
    }
  });

  avatarInputEl.addEventListener("change", async () => {
    const file = avatarInputEl.files[0];
    if (!file) {
      return;
    }

    try {
      showMessage(messageEl, "");
      const data = await api.uploadAvatar(file);
      setAvatarPreview(avatarPreviewEl, data.user);
      onProfileUpdated(data.user);
      showMessage(messageEl, "Photo updated.", "success");
      burstFromElement(avatarPreviewEl);
    } catch (error) {
      showMessage(messageEl, error.message, "error");
    } finally {
      avatarInputEl.value = "";
    }
  });

  return {
    fillProfileForm(user) {
      formEl.name.value = user.name;
      formEl.department.value = user.department;
      formEl.bio.value = user.bio || "";
      setAvatarPreview(avatarPreviewEl, user);
    },
  };
}

export function initMemberView({ containerEl, backBtnEl, onBack, onMessageUser, onChange }) {
  backBtnEl.addEventListener("click", onBack);

  function actionButton(user) {
    const status = user.friendship ? user.friendship.status : "none";
    if (status === "self") {
      return "";
    }
    if (status === "friends") {
      return `<button type="button" class="btn btn-primary" data-message="${user.id}">Message</button>`;
    }
    if (status === "pending_outgoing") {
      return `<button type="button" class="btn btn-secondary" disabled>Request sent</button>`;
    }
    if (status === "pending_incoming") {
      return `<button type="button" class="btn btn-primary" data-accept="${user.friendship.requestId}">Accept request</button>`;
    }
    return `<button type="button" class="btn btn-primary" data-add-friend="${user.id}">Add friend</button>`;
  }

  async function showMember(userId) {
    containerEl.innerHTML = '<p class="muted loading-text">Loading profile…</p>';

    try {
      const data = await api.getUser(userId);
      const user = data.user;
      const avatar = user.thumbnailUrl
        ? `<img src="${user.thumbnailUrl}" alt="" class="avatar-img" />`
        : `<span class="avatar-initials">${getInitials(user.name)}</span>`;

      containerEl.innerHTML = `
        <div class="profile-display">
          <div class="avatar avatar-xl">${avatar}</div>
          <div>
            <h2>${escapeHtml(user.name)}</h2>
            <p class="muted">${escapeHtml(user.department)}</p>
            <p class="member-email">${escapeHtml(user.email)}</p>
            ${user.bio ? `<p class="profile-bio">${escapeHtml(user.bio)}</p>` : '<p class="muted">No bio yet.</p>'}
            <div class="profile-actions">${actionButton(user)}</div>
          </div>
        </div>
      `;

      const addBtn = containerEl.querySelector("[data-add-friend]");
      if (addBtn) {
        addBtn.addEventListener("click", async (event) => {
          try {
            await api.sendFriendRequest(addBtn.dataset.addFriend);
            burstFromEvent(event, { count: 28, power: 8 });
            await showMember(userId);
            if (onChange) onChange();
          } catch (error) {
            console.error(error);
          }
        });
      }

      const acceptBtn = containerEl.querySelector("[data-accept]");
      if (acceptBtn) {
        acceptBtn.addEventListener("click", async (event) => {
          try {
            await api.respondToRequest(acceptBtn.dataset.accept, "accept");
            burstFromEvent(event);
            await showMember(userId);
            if (onChange) onChange();
          } catch (error) {
            console.error(error);
          }
        });
      }

      const messageBtn = containerEl.querySelector("[data-message]");
      if (messageBtn) {
        messageBtn.addEventListener("click", () => onMessageUser(messageBtn.dataset.message));
      }
    } catch (error) {
      containerEl.innerHTML = `<p class="form-message error">${escapeHtml(error.message)}</p>`;
    }
  }

  return { showMember };
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

import { api } from "./api.js";

function getInitials(name) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function setAvatarPreview(container, user) {
  container.innerHTML = user.thumbnailUrl
    ? `<img src="${user.thumbnailUrl}" alt="" class="avatar-img" />`
    : `<span class="avatar-initials">${getInitials(user.name)}</span>`;
}

export function initProfile({ formEl, avatarPreviewEl, avatarInputEl, onProfileUpdated, onError }) {
  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(formEl);
    try {
      const data = await api.updateProfile({
        name: fd.get("name"),
        department: fd.get("department"),
        bio: fd.get("bio"),
      });
      onProfileUpdated(data.user);
    } catch (error) {
      onError(error.message);
    }
  });

  avatarInputEl.addEventListener("change", async () => {
    const file = avatarInputEl.files[0];
    if (!file) return;
    try {
      const data = await api.uploadAvatar(file);
      setAvatarPreview(avatarPreviewEl, data.user);
      onProfileUpdated(data.user);
    } catch (error) {
      onError(error.message);
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

export function initMemberView({ containerEl, backBtnEl, onBack, onAddFriend, onRemoveFriend, onMessage }) {
  backBtnEl.addEventListener("click", onBack);

  return {
    async showMember(userId) {
      containerEl.innerHTML = '<p class="muted loading-text">Loading profile…</p>';
      try {
        const data = await api.getUser(userId);
        const user = data.user;
        const avatar = user.thumbnailUrl
          ? `<img src="${user.thumbnailUrl}" alt="" class="avatar-img" />`
          : `<span class="avatar-initials">${getInitials(user.name)}</span>`;
        const friendBtn = user.isFriend
          ? `<button type="button" class="btn btn-secondary btn-sm" data-remove-friend="${user.id}">Remove friend</button>`
          : `<button type="button" class="btn btn-primary btn-sm" data-add-friend="${user.id}">Add friend</button>`;

        containerEl.innerHTML = `
          <div class="profile-display">
            <div class="avatar avatar-xl">${avatar}</div>
            <div>
              <h2>${escapeHtml(user.name)}</h2>
              <p class="muted">${escapeHtml(user.department)}</p>
              <p class="member-email">${escapeHtml(user.email)}</p>
              <div class="member-actions">
                ${friendBtn}
                <button type="button" class="btn btn-secondary btn-sm" data-message-member="${user.id}">Message</button>
              </div>
              ${user.bio ? `<p class="profile-bio">${escapeHtml(user.bio)}</p>` : '<p class="muted">No bio yet.</p>'}
            </div>
          </div>
        `;

        containerEl.querySelector("[data-add-friend]")?.addEventListener("click", () => onAddFriend(user.id));
        containerEl.querySelector("[data-remove-friend]")?.addEventListener("click", () => onRemoveFriend(user.id));
        containerEl.querySelector("[data-message-member]")?.addEventListener("click", () => onMessage(user.id));
      } catch (error) {
        containerEl.innerHTML = `<p class="form-message error">${escapeHtml(error.message)}</p>`;
      }
    },
  };
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

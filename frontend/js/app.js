import { getCurrentUser, handleLogin, handleLogout, handleSignup } from "./auth.js";
import { initDirectory } from "./directory.js";
import { initProfile, initMemberView } from "./profile.js";
import { api } from "./api.js";

const views = {
  landing: document.getElementById("view-landing"),
  login: document.getElementById("view-login"),
  signup: document.getElementById("view-signup"),
  app: document.getElementById("view-app"),
};

const panels = {
  home: document.getElementById("panel-home"),
  directory: document.getElementById("panel-directory"),
  profile: document.getElementById("panel-profile"),
  member: document.getElementById("panel-member"),
  messages: document.getElementById("panel-messages"),
};

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const loginMessage = document.getElementById("login-message");
const signupMessage = document.getElementById("signup-message");
const welcomeName = document.getElementById("welcome-name");
const welcomeDepartment = document.getElementById("welcome-department");
const logoutBtn = document.getElementById("logout-btn");
const navHeaderName = document.getElementById("nav-header-name");

const directoryList = document.getElementById("directory-list");
const directorySearch = document.getElementById("directory-search");
const directoryEmpty = document.getElementById("directory-empty");
const memberContainer = document.getElementById("member-profile");
const memberBackBtn = document.getElementById("member-back-btn");
const messagesMessage = document.getElementById("messages-message");
const publicMessagesList = document.getElementById("public-messages-list");
const directMessagesList = document.getElementById("direct-messages-list");
const publicMessageForm = document.getElementById("public-message-form");
const directMessageForm = document.getElementById("direct-message-form");
const directFriendSelect = document.getElementById("direct-friend-select");

const profileForm = document.getElementById("profile-form");
const profileMessage = document.getElementById("profile-message");
const avatarPreview = document.getElementById("avatar-preview");
const avatarInput = document.getElementById("avatar-input");

let currentUser = null;
let activePanel = "home";
let selectedFriendId = "";

const directory = initDirectory({
  listEl: directoryList,
  searchEl: directorySearch,
  emptyEl: directoryEmpty,
  onViewMember: (userId) => {
    showPanel("member");
    memberView.showMember(userId);
  },
});

const profile = initProfile({
  formEl: profileForm,
  messageEl: profileMessage,
  avatarPreviewEl: avatarPreview,
  avatarInputEl: avatarInput,
  onProfileUpdated: (user) => {
    currentUser = user;
    updateHeader(user);
  },
});

const memberView = initMemberView({
  containerEl: memberContainer,
  backBtnEl: memberBackBtn,
  onBack: () => showPanel("directory"),
  onAddFriend: async (userId) => {
    await api.addFriend(userId);
    await memberView.showMember(userId);
  },
  onRemoveFriend: async (userId) => {
    await api.removeFriend(userId);
    await memberView.showMember(userId);
  },
  onMessage: async (userId) => {
    showPanel("messages");
    selectedFriendId = userId;
    await loadFriends();
    await loadDirectMessages();
  },
});

function showView(name) {
  Object.entries(views).forEach(([key, element]) => {
    element.hidden = key !== name;
  });
}

function showPanel(name) {
  activePanel = name;
  Object.entries(panels).forEach(([key, element]) => {
    element.hidden = key !== name;
  });

  document.querySelectorAll("[data-panel-nav]").forEach((button) => {
    button.classList.toggle("nav-active", button.dataset.panelNav === name);
  });

  if (name === "directory") {
    directory.loadDirectory(directorySearch.value.trim());
  }

  if (name === "profile" && currentUser) {
    profile.fillProfileForm(currentUser);
  }

  if (name === "messages") {
    loadPublicMessages();
    loadFriends().then(loadDirectMessages);
  }
}

function updateHeader(user) {
  welcomeName.textContent = user.name;
  welcomeDepartment.textContent = user.department;
  navHeaderName.textContent = user.name;
}

function setAuthenticatedUser(user) {
  currentUser = user;
  updateHeader(user);
  showView("app");
  showPanel("home");
}

function setLoggedOut() {
  currentUser = null;
  directorySearch.value = "";
  showView("landing");
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleString();
}

function renderMessages(container, messages, emptyText) {
  if (!messages.length) {
    container.innerHTML = `<p class="muted">${emptyText}</p>`;
    return;
  }

  container.innerHTML = messages
    .map(
      (message) => `
      <article class="message-item">
        <p class="message-meta">${message.sender?.name || "Unknown"} · ${formatTime(message.createdAt)}</p>
        <p>${escapeHtml(message.text)}</p>
      </article>
    `
    )
    .join("");
}

async function loadPublicMessages() {
  try {
    const data = await api.getPublicMessages();
    renderMessages(publicMessagesList, data.messages || [], "No public messages yet.");
  } catch (error) {
    publicMessagesList.innerHTML = `<p class="form-message error">${escapeHtml(error.message)}</p>`;
  }
}

async function loadFriends() {
  const data = await api.getFriends();
  const friends = data.users || [];
  if (!friends.length) {
    directFriendSelect.innerHTML = '<option value="">No friends yet</option>';
    selectedFriendId = "";
    return;
  }

  if (!selectedFriendId || !friends.find((friend) => friend.id === selectedFriendId)) {
    selectedFriendId = friends[0].id;
  }

  directFriendSelect.innerHTML = friends
    .map((friend) => `<option value="${friend.id}">${escapeHtml(friend.name)} (${escapeHtml(friend.department)})</option>`)
    .join("");
  directFriendSelect.value = selectedFriendId;
}

async function loadDirectMessages() {
  if (!selectedFriendId) {
    renderMessages(directMessagesList, [], "Add friends to start direct messaging.");
    return;
  }

  const data = await api.getDirectMessages(selectedFriendId);
  renderMessages(directMessagesList, data.messages || [], "No direct messages yet.");
}

directFriendSelect.addEventListener("change", () => {
  selectedFriendId = directFriendSelect.value;
  loadDirectMessages();
});

publicMessageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(publicMessageForm);
  const text = String(formData.get("text") || "").trim();
  if (!text) {
    return;
  }
  try {
    messagesMessage.hidden = true;
    await api.postPublicMessage(text);
    publicMessageForm.reset();
    await loadPublicMessages();
  } catch (error) {
    messagesMessage.textContent = error.message;
    messagesMessage.className = "form-message error";
    messagesMessage.hidden = false;
  }
});

directMessageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(directMessageForm);
  const text = String(formData.get("text") || "").trim();
  if (!text || !selectedFriendId) {
    return;
  }
  try {
    messagesMessage.hidden = true;
    await api.postDirectMessage(selectedFriendId, text);
    directMessageForm.reset();
    await loadDirectMessages();
  } catch (error) {
    messagesMessage.textContent = error.message;
    messagesMessage.className = "form-message error";
    messagesMessage.hidden = false;
  }
});

document.querySelectorAll("[data-nav]").forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.nav);
  });
});

document.querySelectorAll("[data-panel-nav]").forEach((button) => {
  button.addEventListener("click", () => {
    showPanel(button.dataset.panelNav);
  });
});

document.querySelectorAll("[data-goto-panel]").forEach((button) => {
  button.addEventListener("click", () => {
    showPanel(button.dataset.gotoPanel);
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleLogin(loginForm, loginMessage, setAuthenticatedUser);
});

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSignup(signupForm, signupMessage, setAuthenticatedUser);
});

logoutBtn.addEventListener("click", () => {
  handleLogout(setLoggedOut);
});

async function init() {
  const user = await getCurrentUser();
  if (user) {
    setAuthenticatedUser(user);
  } else {
    showView("landing");
  }
}

init();

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

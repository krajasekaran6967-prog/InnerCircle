import { getCurrentUser, handleLogin, handleLogout, handleSignup } from "./auth.js";
import { initDirectory } from "./directory.js";
import { initProfile, initMemberView } from "./profile.js";
import { api } from "./api.js";
import { showToast } from "./toast.js";

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
const welcomeName = document.getElementById("welcome-name");
const welcomeDepartment = document.getElementById("welcome-department");
const logoutBtn = document.getElementById("logout-btn");
const navHeaderName = document.getElementById("nav-header-name");

const directoryList = document.getElementById("directory-list");
const directorySearch = document.getElementById("directory-search");
const directoryEmpty = document.getElementById("directory-empty");
const memberContainer = document.getElementById("member-profile");
const memberBackBtn = document.getElementById("member-back-btn");
const publicMessagesList = document.getElementById("public-messages-list");
const directMessagesList = document.getElementById("direct-messages-list");
const publicMessageForm = document.getElementById("public-message-form");
const directMessageForm = document.getElementById("direct-message-form");
const directFriendSelect = document.getElementById("direct-friend-select");

const profileForm = document.getElementById("profile-form");
const avatarPreview = document.getElementById("avatar-preview");
const avatarInput = document.getElementById("avatar-input");

let currentUser = null;
let activePanel = "home";
let selectedFriendId = "";
let pollTimer = null;

// ── Message tabs ──
const msgTabs = document.querySelectorAll(".msg-tab");
const tabPublic = document.getElementById("tab-public");
const tabDirect = document.getElementById("tab-direct");

msgTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    msgTabs.forEach((t) => {
      t.classList.toggle("msg-tab-active", t.dataset.tab === target);
      t.setAttribute("aria-selected", t.dataset.tab === target ? "true" : "false");
    });
    tabPublic.hidden = target !== "public";
    tabDirect.hidden = target !== "direct";
  });
});

// ── Directory ──
const directory = initDirectory({
  listEl: directoryList,
  searchEl: directorySearch,
  emptyEl: directoryEmpty,
  onViewMember: (userId) => {
    showPanel("member");
    memberView.showMember(userId);
  },
});

// ── Profile ──
const profile = initProfile({
  formEl: profileForm,
  avatarPreviewEl: avatarPreview,
  avatarInputEl: avatarInput,
  onProfileUpdated: (user) => {
    currentUser = user;
    updateHeader(user);
    showToast("Profile saved.");
  },
  onError: (msg) => showToast(msg, "error"),
});

// ── Member view ──
const memberView = initMemberView({
  containerEl: memberContainer,
  backBtnEl: memberBackBtn,
  onBack: () => showPanel("directory"),
  onAddFriend: async (userId) => {
    await api.addFriend(userId);
    showToast("Friend added!");
    await memberView.showMember(userId);
  },
  onRemoveFriend: async (userId) => {
    await api.removeFriend(userId);
    showToast("Friend removed.", "error");
    await memberView.showMember(userId);
  },
  onMessage: async (userId) => {
    showPanel("messages");
    selectedFriendId = userId;
    await loadFriends();
    await loadDirectMessages();
    // Switch to direct tab
    msgTabs.forEach((t) => {
      const isDirect = t.dataset.tab === "direct";
      t.classList.toggle("msg-tab-active", isDirect);
      t.setAttribute("aria-selected", isDirect ? "true" : "false");
    });
    tabPublic.hidden = true;
    tabDirect.hidden = false;
  },
});

// ── View / panel helpers ──
function showView(name) {
  Object.entries(views).forEach(([key, el]) => { el.hidden = key !== name; });
}

function showPanel(name) {
  activePanel = name;
  Object.entries(panels).forEach(([key, el]) => { el.hidden = key !== name; });

  document.querySelectorAll("[data-panel-nav]").forEach((btn) => {
    btn.classList.toggle("nav-active", btn.dataset.panelNav === name);
  });

  if (name === "directory") directory.loadDirectory(directorySearch.value.trim());
  if (name === "profile" && currentUser) profile.fillProfileForm(currentUser);
  if (name === "messages") {
    loadPublicMessages();
    loadFriends().then(loadDirectMessages);
    startPolling();
  } else {
    stopPolling();
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
  stopPolling();
  directorySearch.value = "";
  showView("landing");
}

// ── Auto-poll ──
function startPolling() {
  stopPolling();
  pollTimer = setInterval(loadPublicMessages, 15000);
}

function stopPolling() {
  clearInterval(pollTimer);
  pollTimer = null;
}

// ── Messages ──
function formatTime(isoString) {
  return new Date(isoString).toLocaleString();
}

function renderMessages(container, messages, emptyText) {
  if (!messages.length) {
    container.innerHTML = `<p class="muted">${emptyText}</p>`;
    return;
  }
  container.innerHTML = messages.map((m) => `
    <article class="message-item">
      <p class="message-meta">${m.sender?.name || "Unknown"} · ${formatTime(m.createdAt)}</p>
      <p>${escapeHtml(m.text)}</p>
    </article>
  `).join("");
  container.scrollTop = container.scrollHeight;
}

async function loadPublicMessages() {
  try {
    const data = await api.getPublicMessages();
    renderMessages(publicMessagesList, data.messages || [], "No public messages yet.");
  } catch (error) {
    showToast(error.message, "error");
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
  if (!selectedFriendId || !friends.find((f) => f.id === selectedFriendId)) {
    selectedFriendId = friends[0].id;
  }
  directFriendSelect.innerHTML = friends.map((f) =>
    `<option value="${f.id}">${escapeHtml(f.name)} (${escapeHtml(f.department)})</option>`
  ).join("");
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

publicMessageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = String(new FormData(publicMessageForm).get("text") || "").trim();
  if (!text) return;
  try {
    await api.postPublicMessage(text);
    publicMessageForm.reset();
    await loadPublicMessages();
    showToast("Message sent!");
  } catch (error) {
    showToast(error.message, "error");
  }
});

directMessageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = String(new FormData(directMessageForm).get("text") || "").trim();
  if (!text || !selectedFriendId) return;
  try {
    await api.postDirectMessage(selectedFriendId, text);
    directMessageForm.reset();
    await loadDirectMessages();
    showToast("Message sent!");
  } catch (error) {
    showToast(error.message, "error");
  }
});

// ── Nav wiring ──
document.querySelectorAll("[data-nav]").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.nav));
});

document.querySelectorAll("[data-panel-nav]").forEach((btn) => {
  btn.addEventListener("click", () => showPanel(btn.dataset.panelNav));
});

document.querySelectorAll("[data-goto-panel]").forEach((btn) => {
  btn.addEventListener("click", () => showPanel(btn.dataset.gotoPanel));
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleLogin(loginForm, setAuthenticatedUser, (msg) => showToast(msg, "error"));
});

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSignup(signupForm, setAuthenticatedUser, (msg) => showToast(msg, "error"));
});

logoutBtn.addEventListener("click", () => handleLogout(setLoggedOut));

// ── Init ──
async function init() {
  const user = await getCurrentUser();
  if (user) setAuthenticatedUser(user);
  else showView("landing");
}

init();

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

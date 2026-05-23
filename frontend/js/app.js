import { getCurrentUser, handleLogin, handleLogout, handleSignup } from "./auth.js";
import { initDirectory } from "./directory.js";
import { initProfile, initMemberView } from "./profile.js";

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

const profileForm = document.getElementById("profile-form");
const profileMessage = document.getElementById("profile-message");
const avatarPreview = document.getElementById("avatar-preview");
const avatarInput = document.getElementById("avatar-input");

let currentUser = null;
let activePanel = "home";

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

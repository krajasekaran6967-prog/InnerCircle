import { api } from "./api.js";

export function showMessage(element, text, type = "error") {
  element.textContent = text;
  element.className = `form-message ${type}`;
  element.hidden = !text;
}

export async function handleSignup(form, messageEl, onSuccess) {
  const formData = new FormData(form);
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    department: formData.get("department"),
    password: formData.get("password"),
  };

  try {
    showMessage(messageEl, "");
    const data = await api.signup(payload);
    onSuccess(data.user);
  } catch (error) {
    showMessage(messageEl, error.message, "error");
  }
}

export async function handleLogin(form, messageEl, onSuccess) {
  const formData = new FormData(form);
  const payload = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    showMessage(messageEl, "");
    const data = await api.login(payload);
    onSuccess(data.user);
  } catch (error) {
    showMessage(messageEl, error.message, "error");
  }
}

export async function handleLogout(onSuccess) {
  try {
    await api.logout();
    onSuccess();
  } catch (error) {
    console.error(error);
    onSuccess();
  }
}

export async function getCurrentUser() {
  try {
    const data = await api.me();
    return data.user;
  } catch {
    return null;
  }
}

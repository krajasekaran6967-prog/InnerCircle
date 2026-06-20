import { api } from "./api.js";

export async function handleSignup(form, onSuccess, onError) {
  const formData = new FormData(form);
  try {
    const data = await api.signup({
      name: formData.get("name"),
      email: formData.get("email"),
      department: formData.get("department"),
      password: formData.get("password"),
    });
    onSuccess(data.user);
  } catch (error) {
    onError(error.message);
  }
}

export async function handleLogin(form, onSuccess, onError) {
  const formData = new FormData(form);
  try {
    const data = await api.login({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    onSuccess(data.user);
  } catch (error) {
    onError(error.message);
  }
}

export async function handleLogout(onSuccess) {
  try {
    await api.logout();
  } catch (error) {
    console.error(error);
  }
  onSuccess();
}

export async function getCurrentUser() {
  try {
    const data = await api.me();
    return data.user;
  } catch {
    return null;
  }
}

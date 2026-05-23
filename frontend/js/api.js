const API_BASE = "/api";

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const hasBody = options.body !== undefined && options.body !== null;

  if (hasBody && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers,
    ...options,
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const message = data?.error || "Something went wrong.";
    throw new Error(message);
  }

  return data;
}

export const api = {
  signup(body) {
    return request("/auth/signup", { method: "POST", body: JSON.stringify(body) });
  },
  login(body) {
    return request("/auth/login", { method: "POST", body: JSON.stringify(body) });
  },
  logout() {
    return request("/auth/logout", { method: "POST" });
  },
  me() {
    return request("/auth/me");
  },
  getUsers(search = "") {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return request(`/users${query}`);
  },
  getUser(id) {
    return request(`/users/${id}`);
  },
  updateProfile(body) {
    return request("/users/me", { method: "PUT", body: JSON.stringify(body) });
  },
  uploadAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);
    return request("/users/me/avatar", { method: "POST", body: formData });
  },
};

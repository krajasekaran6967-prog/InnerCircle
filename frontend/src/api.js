const API_BASE = "/api";

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers,
    ...options,
  });
  let data = null;
  if (res.headers.get("content-type")?.includes("application/json")) {
    data = await res.json();
  }
  if (!res.ok) throw new Error(data?.error || "Something went wrong.");
  return data;
}

export const api = {
  signup: (body) => request("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  getUsers: (search = "") => request(`/users${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getUser: (id) => request(`/users/${id}`),
  updateProfile: (body) => request("/users/me", { method: "PUT", body: JSON.stringify(body) }),
  getFriends: () => request("/users/me/friends"),
  addFriend: (id) => request(`/users/${id}/friends`, { method: "POST" }),
  removeFriend: (id) => request(`/users/${id}/friends`, { method: "DELETE" }),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append("avatar", file);
    return request("/users/me/avatar", { method: "POST", body: fd });
  },
  getPublicMessages: () => request("/messages/public?limit=50"),
  postPublicMessage: (text) => request("/messages/public", { method: "POST", body: JSON.stringify({ text }) }),
  getDirectMessages: (userId) => request(`/messages/direct/${encodeURIComponent(userId)}?limit=100`),
  postDirectMessage: (userId, text) =>
    request(`/messages/direct/${encodeURIComponent(userId)}`, { method: "POST", body: JSON.stringify({ text }) }),
};

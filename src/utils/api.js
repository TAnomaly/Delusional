/**
 * API client - minimal fetch wrapper with auth.
 * All responses follow { data, error } convention.
 */

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function isAuthenticated() {
  return !!getToken();
}

async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    return await res.json();
  } catch (err) {
    return { data: null, error: "Network error. Please try again." };
  }
}

// Auth
export const auth = {
  register: (data) => request("POST", "/auth/register", data),
  login: (data) => request("POST", "/auth/login", data),
};

// Profile
export const profile = {
  me: () => request("GET", "/profile/me"),
  update: (data) => request("PATCH", "/profile/me", data),
};

// Posts
export const posts = {
  create: (data) => request("POST", "/posts/", data),
  feed: () => request("GET", "/posts/feed"),
  my: () => request("GET", "/posts/my"),
};

// Focus
export const focus = {
  start: (data) => request("POST", "/focus/start", data),
  end: (id, data) => request("POST", `/focus/${id}/end`, data),
  active: () => request("GET", "/focus/active"),
  history: () => request("GET", "/focus/history"),
  stats: () => request("GET", "/focus/stats"),
};

// Analytics
export const analytics = {
  weekly: () => request("GET", "/analytics/weekly"),
  latest: () => request("GET", "/analytics/latest"),
};

// Kanban
export const kanban = {
  boards: () => request("GET", "/kanban/boards"),
  createBoard: (data) => request("POST", "/kanban/boards", data),
  getBoard: (id) => request("GET", `/kanban/boards/${id}`),
  archiveBoard: (id) => request("DELETE", `/kanban/boards/${id}`),
  addColumn: (boardId, data) => request("POST", `/kanban/boards/${boardId}/columns`, data),
  createCard: (columnId, data) => request("POST", `/kanban/columns/${columnId}/cards`, data),
  updateCard: (cardId, data) => request("PATCH", `/kanban/cards/${cardId}`, data),
  deleteCard: (cardId) => request("DELETE", `/kanban/cards/${cardId}`),
};

// Collections
export const collections = {
  list: () => request("GET", "/collections/"),
  public: () => request("GET", "/collections/public"),
  create: (data) => request("POST", "/collections/", data),
  get: (id) => request("GET", `/collections/${id}`),
  addItem: (id, data) => request("POST", `/collections/${id}/items`, data),
  removeItem: (id, itemId) => request("DELETE", `/collections/${id}/items/${itemId}`),
};

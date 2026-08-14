const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

// Get auth token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("admin_token");
  }
  return null;
};

// Set auth token
export const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_token", token);
  }
};

// Remove auth token
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_token");
  }
};

// Check if authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Base fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// ============ AUTH ============
export const login = (email, password) =>
  apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => apiFetch("/api/auth/me");

// ============ PROJECTS ============
export const getProjects = () => apiFetch("/api/projects");

export const getAllProjects = () => apiFetch("/api/projects/all");

export const getProject = (id) => apiFetch(`/api/projects/${id}`);

export const createProject = (formData) =>
  apiFetch("/api/projects", {
    method: "POST",
    body: formData,
  });

export const updateProject = (id, formData) =>
  apiFetch(`/api/projects/${id}`, {
    method: "PUT",
    body: formData,
  });

export const deleteProject = (id) =>
  apiFetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

export const reorderProjects = (orders) =>
  apiFetch("/api/projects/reorder/batch", {
    method: "PUT",
    body: JSON.stringify({ orders }),
  });

// ============ RESUME ============
export const getResume = () => apiFetch("/api/resume");

export const uploadResume = (formData) =>
  apiFetch("/api/resume", {
    method: "POST",
    body: formData,
  });

export const deleteResume = () =>
  apiFetch("/api/resume", {
    method: "DELETE",
  });

export const getResumeDownloadUrl = () => `${API_BASE}/api/resume/download`;

// ============ CONTENT ============
export const getContent = (section) => apiFetch(`/api/content/${section}`);

export const updateContent = (section, data) =>
  apiFetch(`/api/content/${section}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });

// ============ SOCIAL LINKS ============
export const getSocialLinks = () => apiFetch("/api/social");

export const getAllSocialLinks = () => apiFetch("/api/social/all");

export const createSocialLink = (linkData) =>
  apiFetch("/api/social", {
    method: "POST",
    body: JSON.stringify(linkData),
  });

export const updateSocialLink = (id, linkData) =>
  apiFetch(`/api/social/${id}`, {
    method: "PUT",
    body: JSON.stringify(linkData),
  });

export const deleteSocialLink = (id) =>
  apiFetch(`/api/social/${id}`, {
    method: "DELETE",
  });

// ============ HELPERS ============
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${API_BASE}/${cleanPath}`;
};

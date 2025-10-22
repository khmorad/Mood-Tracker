// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// API endpoints
export const API_ENDPOINTS = {
  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_LOGIN: `${API_BASE_URL}/users/login`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,

  // Journal Entries
  JOURNAL_ENTRIES: `${API_BASE_URL}/journal-entries`,
  JOURNAL_ENTRY_BY_ID: (id: number) => `${API_BASE_URL}/journal-entries/${id}`,
  JOURNAL_ENTRIES_BY_USER: (userId: string) =>
    `${API_BASE_URL}/journal-entries?user_id=${userId}`,

  // Emotions
  EMOTIONS: `${API_BASE_URL}/emotions`,
  EMOTIONS_DASHBOARD: (userId: string, days: number = 30) =>
    `${API_BASE_URL}/emotions/dashboard/${userId}?days=${days}`,
  EMOTIONS_SUMMARY: (userId: string) =>
    `${API_BASE_URL}/emotions/summary/${userId}`,
  EMOTIONS_ANALYZE: `${API_BASE_URL}/emotions/analyze`,

  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

// API utility functions
export const apiClient = {
  async get(url: string) {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Request failed");
    }

    return response.json();
  },

  async post(url: string, data: unknown) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Request failed");
    }

    return response.json();
  },

  async put(url: string, data: unknown) {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Request failed");
    }

    return response.json();
  },

  async delete(url: string) {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Request failed");
    }

    return response.json();
  },
};

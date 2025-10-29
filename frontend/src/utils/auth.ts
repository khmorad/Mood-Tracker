interface JWTPayload {
  user_id: string;
  email: string;
  profile_picture?: string;
  gender?: string;
  preferred_language?: string;
  phone_number?: string;
  date_of_birth?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  diagnosis_status?: string;
  subscription_tier?: string;
  subscription_expires_at?: string;
  monthly_entries_count?: number;
  exp: number;
}

export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "access_token") {
      return value;
    }
  }
  return null;
};

export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const getCurrentUser = (): JWTPayload | null => {
  const token = getAccessToken();
  if (!token) return null;

  const userData = decodeJWT(token);
  if (!userData) return null;

  // Check if token is expired
  if (userData.exp * 1000 < Date.now()) {
    console.warn("JWT token is expired");
    return null;
  }

  return userData;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const logout = (): void => {
  if (typeof window !== "undefined") {
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  }
};

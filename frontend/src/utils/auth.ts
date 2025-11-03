import { jwtDecode } from "jwt-decode";
import {
  clearStoredSubscription,
  syncSubscriptionFromJWT,
  getStoredSubscription,
} from "./subscription";

interface DecodedToken {
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  subscription_tier?: string;
  subscription_expires_at?: string;
  [key: string]: unknown;
}

interface User {
  user_id?: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionTier?: string;
  subscriptionExpires?: string;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
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

export const getCurrentUser = (): User | null => {
  try {
    const jwt = getCookie("access_token");
    if (!jwt) return null;

    const decoded: DecodedToken = jwtDecode(jwt);

    // Check for more recent subscription data in localStorage
    const storedSubscription = getStoredSubscription();
    const subscriptionTier =
      storedSubscription?.tier || decoded.subscription_tier || "Free";
    const subscriptionExpires =
      storedSubscription?.expires_at || decoded.subscription_expires_at;

    // Sync JWT data to localStorage if localStorage is empty or older
    if (!storedSubscription && decoded.subscription_tier) {
      syncSubscriptionFromJWT(
        decoded.subscription_tier,
        decoded.subscription_expires_at
      );
    }

    const userData: User = {
      user_id: decoded.user_id || decoded.email || "anonymous",
      firstName: decoded.first_name || "",
      lastName: decoded.last_name || "",
      email: decoded.email || "",
      subscriptionTier,
      subscriptionExpires,
    };

    return userData;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const logout = (): void => {
  try {
    // Clear the access token cookie
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Clear stored subscription data
    clearStoredSubscription();

    // Clear any other localStorage items
    localStorage.removeItem("userInfo");

    console.log("[Auth] User logged out and all stored data cleared");

    // Redirect to login page
    window.location.href = "/auth/signin";
  } catch (error) {
    console.error("[Auth] Error during logout:", error);
    // Still redirect even if there's an error
    window.location.href = "/auth/signin";
  }
};

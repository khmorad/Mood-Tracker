interface SubscriptionData {
  tier: string;
  expires_at?: string;
  updated_at: number;
}

const SUBSCRIPTION_KEY = "mood_tracker_subscription";
const MAX_AGE = 5 * 60 * 1000; // 5 minutes

export const getStoredSubscription = (): SubscriptionData | null => {
  try {
    const stored = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!stored) return null;

    const data: SubscriptionData = JSON.parse(stored);

    // Check if data is too old
    if (Date.now() - data.updated_at > MAX_AGE) {
      localStorage.removeItem(SUBSCRIPTION_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[Subscription] Error reading from localStorage:", error);
    localStorage.removeItem(SUBSCRIPTION_KEY);
    return null;
  }
};

export const storeSubscription = (tier: string, expires_at?: string): void => {
  try {
    const data: SubscriptionData = {
      tier,
      expires_at,
      updated_at: Date.now(),
    };

    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(data));
    console.log("[Subscription] Stored subscription data:", data);
  } catch (error) {
    console.error("[Subscription] Error storing to localStorage:", error);
  }
};

export const clearStoredSubscription = (): void => {
  try {
    localStorage.removeItem(SUBSCRIPTION_KEY);
    console.log("[Subscription] Cleared stored subscription data");
  } catch (error) {
    console.error("[Subscription] Error clearing localStorage:", error);
  }
};

export const syncSubscriptionFromJWT = (
  subscriptionTier?: string,
  subscriptionExpires?: string
): void => {
  if (subscriptionTier) {
    storeSubscription(subscriptionTier, subscriptionExpires);
  }
};

import { useState, useEffect } from "react";
import { apiClient, API_ENDPOINTS } from "../config/api";
import { getCurrentUser } from "../utils/auth";

interface EmotionData {
  mood_improvement: {
    percentage: number;
    trend: string;
    message: string;
    days_compared: number;
  };
  mood_journey: {
    daily_moods: Array<{
      date: string;
      mood_score: number;
      dominant_emotion: string;
      emotions: Record<string, number>;
    }>;
    statistics: {
      average_mood: number;
      lowest_mood: number;
      highest_mood: number;
      total_days: number;
    };
  };
  emotional_landscape: {
    emotions: Array<{
      name: string;
      percentage: number;
      color: string;
    }>;
    dominant_emotion: string;
  };
  progress: {
    good_days: {
      count: number;
      total: number;
      percentage: number;
    };
    journaling_streak: {
      current_days: number;
      this_period: number;
    };
    mood_stability: {
      percentage: number;
      status: string;
    };
    total_entries: number;
  };
  journal_entries: {
    this_week: number;
    total_period: number;
    average_per_week: number;
  };
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
}

export const useEmotionData = (days: number = 30) => {
  const [data, setData] = useState<EmotionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.user_id) {
      setUserId(user.user_id);
    } else {
      setError("User not authenticated");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchEmotionData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(
          API_ENDPOINTS.EMOTIONS_DASHBOARD(userId, days)
        );
        setData(response);
      } catch (err) {
        console.error("Error fetching emotion data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch emotion data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmotionData();
  }, [userId, days]);

  const refetch = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(
        API_ENDPOINTS.EMOTIONS_DASHBOARD(userId, days)
      );
      setData(response);
    } catch (err) {
      console.error("Error refetching emotion data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch emotion data"
      );
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch, userId };
};

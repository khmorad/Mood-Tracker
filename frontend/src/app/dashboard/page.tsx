"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Layout from "../layout";
import { useEmotionData } from "../../hooks/useEmotionData";
import { getCurrentUser } from "../../utils/auth";

const TypeAnimation = dynamic(
  () => import("react-type-animation").then((mod) => mod.TypeAnimation),
  { ssr: false }
);

const Dashboard: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const {
    data: emotionData,
    loading,
    error,
    refetch,
  } = useEmotionData(timeRange);

  useEffect(() => {
    setMounted(true);

    // Check authentication and get subscription info
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    // Log subscription info
    console.log("[Dashboard] User subscription:", {
      tier: user.subscription_tier || "Free",
      expires: user.subscription_expires_at,
    });
  }, []);

  if (!mounted) return null;

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 mt-14">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your mood insights...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 mt-14">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-gray-600 mb-4">
                  Failed to load dashboard data
                </p>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate good days based on emotional landscape
  const calculateGoodDays = () => {
    if (!emotionData?.emotional_landscape?.emotions) {
      return { count: 0, total: 0, percentage: 0 };
    }

    const emotions = emotionData.emotional_landscape.emotions;
    const positiveEmotions = ["Happy", "Calm", "Grateful"];

    // Calculate percentage of positive emotions
    const positivePercentage = emotions
      .filter((emotion) => positiveEmotions.includes(emotion.name))
      .reduce((sum, emotion) => sum + emotion.percentage, 0);

    const totalDays = emotionData?.period?.days || timeRange;
    // If positive emotions make up more than 40% of emotional landscape, consider it good
    const goodDaysCount = Math.round((positivePercentage / 100) * totalDays);

    return {
      count: goodDaysCount,
      total: totalDays,
      percentage: Math.round((goodDaysCount / totalDays) * 100),
    };
  };

  const goodDaysData = calculateGoodDays();

  // Use real data or fallback to defaults
  const moodJourney = emotionData?.mood_journey?.daily_moods || [];
  const emotionalLandscape = emotionData?.emotional_landscape?.emotions || [];
  const progress = {
    ...emotionData?.progress,
    good_days: goodDaysData,
  };
  const moodImprovement = emotionData?.mood_improvement;
  const journalEntries = emotionData?.journal_entries;

  // Console log mood journey data for debugging
  console.log("=== MOOD JOURNEY DEBUG ===");
  console.log("Full emotion data:", emotionData);
  console.log("Mood journey array:", moodJourney);
  console.log("Mood journey length:", moodJourney.length);
  console.log("Sample mood entry:", moodJourney[0]);
  console.log("Time range:", timeRange);
  console.log("========================");

  // Create mock data if no real data exists for demonstration
  const getMoodJourneyData = () => {
    if (moodJourney.length > 0) {
      return moodJourney.slice(-14);
    }

    // Create mock data for demonstration if no real data
    const mockData = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      mockData.push({
        date: date.toISOString().split("T")[0],
        mood_score: Math.random() * 4 + 1, // Random between 1-5
        dominant_emotion: ["Happy", "Sad", "Neutral", "Anxious", "Calm"][
          Math.floor(Math.random() * 5)
        ],
      });
    }
    return mockData;
  };

  const displayMoodData = getMoodJourneyData();
  console.log("Display mood data:", displayMoodData);

  // Create insights from real data
  const insights = [
    {
      icon: "📈",
      title: "Mood Improvement",
      description: moodImprovement?.message || "Calculating...",
      color:
        moodImprovement?.trend === "improving"
          ? "bg-green-100 border-green-300"
          : moodImprovement?.trend === "declining"
          ? "bg-red-100 border-red-300"
          : "bg-blue-100 border-blue-300",
      value: `${(moodImprovement?.percentage ?? 0) >= 0 ? "+" : ""}${
        moodImprovement?.percentage ?? 0
      }%`,
    },
    {
      icon: "📝",
      title: "Journal Entries",
      description: `${journalEntries?.this_week || 0} entries this week`,
      color: "bg-blue-100 border-blue-300",
      value: `${journalEntries?.total_period || 0}`,
    },
    {
      icon: "🌟",
      title: "Good Days",
      description: `Out of ${goodDaysData.total} analyzed days`,
      color: "bg-purple-100 border-purple-300",
      value: `${goodDaysData.count}`,
    },
    {
      icon: "🔥",
      title: "Current Streak",
      description: "Keep it going!",
      color: "bg-pink-100 border-pink-300",
      value: `${progress?.journaling_streak?.current_days || 0}`,
    },
  ];

  // Activity data (you might want to add this to your backend later)
  const activityData = [
    { name: "Exercise", value: 12, color: "#10b981" },
    { name: "Meditation", value: 8, color: "#8b5cf6" },
    { name: "Social", value: 15, color: "#3b82f6" },
    { name: "Work", value: 20, color: "#ec4899" },
    { name: "Self-Care", value: 10, color: "#f59e0b" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 mt-14">
        <div className="container mx-auto px-4 py-6">
          {/* Time Range Selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 shadow-sm">
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days as 7 | 30 | 90)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === days
                      ? "bg-purple-500 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {days === 7 ? "1 Week" : days === 30 ? "1 Month" : "3 Months"}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`${insight.color} border-2 rounded-xl p-4 shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{insight.icon}</div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{insight.title}</p>
                    <p className="text-xl font-bold text-gray-800">
                      {insight.value}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Trend */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Your Mood Journey
                </h3>
                <div className="text-sm text-gray-600 font-medium">
                  {timeRange === 7 && <span>This Week</span>}
                  {timeRange === 30 && (
                    <span>
                      {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {timeRange === 90 && (
                    <span>
                      {new Date(
                        Date.now() - 90 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("en-US", { month: "short" })}{" "}
                      -{" "}
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-end justify-between h-40 mb-4 bg-gray-50 rounded-lg p-4">
                {displayMoodData.length > 0 ? (
                  displayMoodData.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-end h-full"
                      style={{ width: `${100 / displayMoodData.length}%` }}
                    >
                      <div
                        className="w-7 bg-gradient-to-t from-purple-400 to-pink-400 transition-all hover:from-purple-500 hover:to-pink-500 cursor-pointer shadow-sm"
                        style={{
                          height: `${Math.max(
                            8,
                            (day.mood_score / 5) * 120
                          )}px`,
                        }}
                        title={`${
                          day.dominant_emotion
                        }: ${day.mood_score.toFixed(1)}/5 on ${new Date(
                          day.date
                        ).toLocaleDateString()}`}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2 font-medium">
                        {timeRange <= 7
                          ? new Date(day.date).toLocaleDateString("en", {
                              weekday: "short",
                            })
                          : new Date(day.date).getDate()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center text-gray-500 py-8">
                    <div className="mb-4">
                      <svg
                        className="w-16 h-16 mx-auto text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        ></path>
                      </svg>
                    </div>
                    <p className="mb-2 font-medium">No mood data available</p>
                    <p className="text-sm">
                      Start journaling to see your mood journey!
                    </p>
                  </div>
                )}
              </div>

              {/* Mood Scale Legend */}
              <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <span>😢 1</span>
                  <span>😐 3</span>
                  <span>😊 5</span>
                </div>
                <span className="text-gray-400">Mood Scale</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <span className="font-medium">
                  Low:{" "}
                  {displayMoodData.length > 0
                    ? Math.min(
                        ...displayMoodData.map((d) => d.mood_score)
                      ).toFixed(1)
                    : "0"}
                  /5
                </span>
                <span className="font-medium">
                  Avg:{" "}
                  {displayMoodData.length > 0
                    ? (
                        displayMoodData.reduce(
                          (sum, d) => sum + d.mood_score,
                          0
                        ) / displayMoodData.length
                      ).toFixed(1)
                    : "0"}
                  /5
                </span>
                <span className="font-medium">
                  High:{" "}
                  {displayMoodData.length > 0
                    ? Math.max(
                        ...displayMoodData.map((d) => d.mood_score)
                      ).toFixed(1)
                    : "0"}
                  /5
                </span>
              </div>

              {/* Recent Trend Indicator */}
            </div>

            {/* Emotional Distribution */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Emotional Landscape
              </h3>
              <div className="space-y-3">
                {emotionalLandscape.length > 0 ? (
                  emotionalLandscape.map((emotion, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: emotion.color }}
                        ></div>
                        <span className="text-sm text-gray-700">
                          {emotion.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${emotion.percentage}%`,
                              backgroundColor: emotion.color,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {emotion.percentage}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500">
                    No emotion data available
                  </div>
                )}
              </div>
            </div>

            {/* Activity Balance */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Activity Balance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {activityData.map((activity, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: activity.color }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{activity.name}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${(activity.value / 20) * 100}%`,
                            backgroundColor: activity.color,
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {activity.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Summary */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Good Days</span>
                  <span className="text-lg font-bold text-green-600">
                    {goodDaysData.count}/{goodDaysData.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${goodDaysData.percentage}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Journaling Streak
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {progress?.journaling_streak?.current_days || 0} days
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (progress?.journaling_streak?.current_days || 0) * 14
                      )}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mood Stability</span>
                  <span className="text-lg font-bold text-purple-600">
                    {progress?.mood_stability?.percentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${progress?.mood_stability?.percentage || 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Your Progress Analysis
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed">
              {mounted && emotionData && (
                <TypeAnimation
                  sequence={[
                    `Your mood tracking reveals ${
                      goodDaysData.percentage
                    }% good days over the last ${timeRange} days. ${
                      moodImprovement?.message || ""
                    } Your current journaling streak is ${
                      progress?.journaling_streak?.current_days || 0
                    } days, and your mood stability is at ${
                      progress?.mood_stability?.percentage || 0
                    }%. ${
                      emotionalLandscape[0]?.name || "Neutral"
                    } appears to be your dominant emotion recently. Keep up the great work! 💙`,
                  ]}
                  wrapper="p"
                  speed={90}
                  repeat={0}
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={() => (window.location.href = "/mood-tracking")}
              className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Continue Journaling 📝
            </button>
            <button
              onClick={refetch}
              className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Refresh Data 🔄
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

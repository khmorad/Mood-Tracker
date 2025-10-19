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
  const {
    data: emotionData,
    loading,
    error,
    refetch,
    userId,
  } = useEmotionData(30);

  useEffect(() => {
    setMounted(true);

    // Check authentication
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }
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

  // Use real data or fallback to defaults
  const moodJourney = emotionData?.mood_journey?.daily_moods?.slice(-7) || [];
  const emotionalLandscape = emotionData?.emotional_landscape?.emotions || [];
  const progress = emotionData?.progress;
  const moodImprovement = emotionData?.mood_improvement;
  const journalEntries = emotionData?.journal_entries;

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
      description: `Out of ${progress?.good_days?.total || 0} analyzed days`,
      color: "bg-purple-100 border-purple-300",
      value: `${progress?.good_days?.count || 0}`,
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
          {/* User Info Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600">
              Here's your mood journey overview for the last{" "}
              {emotionData?.period?.days || 30} days
            </p>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Mood Journey
              </h3>
              <div className="flex items-end justify-between h-32 mb-4">
                {moodJourney.length > 0 ? (
                  moodJourney.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className="w-8 bg-gradient-to-t from-purple-400 to-pink-400 rounded-t-sm"
                        style={{ height: `${(day.mood_score / 5) * 100}%` }}
                        title={`${day.dominant_emotion}: ${day.mood_score}/5`}
                      ></div>
                      <span className="text-xs text-gray-600 mt-1">
                        {
                          new Date(day.date).toLocaleDateString("en", {
                            weekday: "short",
                          })[0]
                        }
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center text-gray-500">
                    No mood data available
                  </div>
                )}
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Low: {emotionData?.mood_journey?.statistics?.lowest_mood || 0}
                  /5
                </span>
                <span>
                  High:{" "}
                  {emotionData?.mood_journey?.statistics?.highest_mood || 0}/5
                </span>
              </div>
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
                    {progress?.good_days?.count || 0}/
                    {progress?.good_days?.total || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${progress?.good_days?.percentage || 0}%`,
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
                      progress?.good_days?.percentage || 0
                    }% good days over the last ${
                      emotionData?.period?.days || 30
                    } days. ${
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
                  speed={60}
                  repeat={0}
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={() => (window.location.href = "/journal")}
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

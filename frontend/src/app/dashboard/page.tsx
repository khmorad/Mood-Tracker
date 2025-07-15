"use client";

import React, { useState, useEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import Layout from "../layout";

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);
  const [currentDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  if (!isClient) {
    return null;
  }

  const moodData = [4, 3, 5, 4.5, 3.5, 4, 5];
  const maxMood = Math.max(...moodData);
  const minMood = Math.min(...moodData);

  const insights = [
    {
      icon: "📈",
      title: "Mood Improvement",
      description: "20% better than last week",
      color: "bg-green-100 border-green-300",
      value: "+20%",
    },
    {
      icon: "📝",
      title: "Journal Entries",
      description: "5 days this week",
      color: "bg-blue-100 border-blue-300",
      value: "14",
    },
    {
      icon: "🌟",
      title: "Good Days",
      description: "Out of 30 total days",
      color: "bg-purple-100 border-purple-300",
      value: "22",
    },
    {
      icon: "🔥",
      title: "Current Streak",
      description: "Keep it going!",
      color: "bg-pink-100 border-pink-300",
      value: "5",
    },
  ];

  const emotionData = [
    { name: "Happy", percentage: 35, color: "#10b981" },
    { name: "Calm", percentage: 25, color: "#3b82f6" },
    { name: "Sad", percentage: 20, color: "#8b5cf6" },
    { name: "Anxious", percentage: 15, color: "#f59e0b" },
    { name: "Angry", percentage: 5, color: "#ef4444" },
  ];

  const activityData = [
    { name: "Exercise", value: 12, color: "#10b981" },
    { name: "Meditation", value: 8, color: "#8b5cf6" },
    { name: "Social", value: 15, color: "#3b82f6" },
    { name: "Work", value: 20, color: "#ec4899" },
    { name: "Self-Care", value: 10, color: "#f59e0b" },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {insights.map((insight, index) => (
              <div
                key={index}
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
                {moodData.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-8 bg-gradient-to-t from-purple-400 to-pink-400 rounded-t-sm"
                      style={{ height: `${(value / 5) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-1">
                      {["M", "T", "W", "T", "F", "S", "S"][index]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Low: {minMood}/5</span>
                <span>High: {maxMood}/5</span>
              </div>
            </div>

            {/* Emotional Distribution */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Emotional Landscape
              </h3>
              <div className="space-y-3">
                {emotionData.map((emotion, index) => (
                  <div
                    key={index}
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
                ))}
              </div>
            </div>

            {/* Activity Balance */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Activity Balance
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {activityData.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
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
                    22/30
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "73%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Journaling Streak
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    5 days
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "71%" }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mood Stability</span>
                  <span className="text-lg font-bold text-purple-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: "85%" }}
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
              <TypeAnimation
                sequence={[
                  "You're showing excellent progress in emotional awareness and self-regulation. Your mood tracking reveals a positive trend with 73% good days. Your consistent journaling habit is helping you identify triggers and develop better coping strategies. Activities like exercise and social interaction have a significant positive impact on your mood. Keep up the great work! 💙",
                ]}
                wrapper="p"
                speed={60}
                repeat={0}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Continue Journaling 📝
            </button>
            <button className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              View Details 📊
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

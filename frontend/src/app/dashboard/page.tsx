"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Layout from "../layout";
import { useEmotionData } from "../../hooks/useEmotionData";
import { getCurrentUser } from "../../utils/auth";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Smile,
  Flame,
  RefreshCw,
  PenLine,
  Activity,
  ChevronRight,
} from "lucide-react";

const TypeAnimation = dynamic(
  () => import("react-type-animation").then((mod) => mod.TypeAnimation),
  { ssr: false }
);

const Dashboard: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const { data: emotionData, loading, error, refetch } = useEmotionData(timeRange);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "/login";
    }
  }, []);

  if (!mounted) return null;

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 mt-14 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading your insights…</p>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── Error ───────────────────────────────────────────────── */
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 mt-14 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-5 h-5 text-red-400" />
            </div>
            <p className="font-semibold text-gray-800 mb-1">Failed to load data</p>
            <p className="text-sm text-gray-400 mb-5">{error}</p>
            <button
              onClick={refetch}
              className="bg-violet-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── Data helpers ────────────────────────────────────────── */
  const calculateGoodDays = () => {
    if (!emotionData?.emotional_landscape?.emotions) {
      return { count: 0, total: 0, percentage: 0 };
    }
    const emotions = emotionData.emotional_landscape.emotions;
    const positiveEmotions = ["Happy", "Calm", "Grateful"];
    const positivePercentage = emotions
      .filter((e) => positiveEmotions.includes(e.name))
      .reduce((sum, e) => sum + e.percentage, 0);
    const totalDays = emotionData?.period?.days || timeRange;
    const goodDaysCount = Math.round((positivePercentage / 100) * totalDays);
    return {
      count: goodDaysCount,
      total: totalDays,
      percentage: Math.round((goodDaysCount / totalDays) * 100),
    };
  };

  const goodDaysData = calculateGoodDays();
  const moodJourney = emotionData?.mood_journey?.daily_moods || [];
  const emotionalLandscape = emotionData?.emotional_landscape?.emotions || [];
  const progress = { ...emotionData?.progress, good_days: goodDaysData };
  const moodImprovement = emotionData?.mood_improvement;
  const journalEntries = emotionData?.journal_entries;
  const hasAnyData =
    moodJourney.length > 0 ||
    emotionalLandscape.length > 0 ||
    (journalEntries?.total_period || 0) > 0;
  const displayMoodData = moodJourney.slice(-14);
  const trend = moodImprovement?.trend || "neutral";
  const improvementValue = moodImprovement?.percentage ?? 0;

  /* ── Stat cards config ───────────────────────────────────── */
  const TrendIcon =
    trend === "improving" ? TrendingUp : trend === "declining" ? TrendingDown : Minus;

  const stats = [
    {
      label: "Mood Trend",
      value: hasAnyData
        ? `${improvementValue >= 0 ? "+" : ""}${improvementValue}%`
        : "—",
      sub: moodImprovement?.message || "No data yet",
      Icon: TrendIcon,
      iconBg:
        trend === "improving"
          ? "bg-emerald-50"
          : trend === "declining"
          ? "bg-red-50"
          : "bg-gray-50",
      iconColor:
        trend === "improving"
          ? "text-emerald-500"
          : trend === "declining"
          ? "text-red-400"
          : "text-gray-400",
      valueColor:
        trend === "improving"
          ? "text-emerald-600"
          : trend === "declining"
          ? "text-red-500"
          : "text-gray-900",
    },
    {
      label: "Journal Entries",
      value: `${journalEntries?.total_period || 0}`,
      sub: `${journalEntries?.this_week || 0} this week`,
      Icon: BookOpen,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
      valueColor: "text-gray-900",
    },
    {
      label: "Good Days",
      value: hasAnyData ? `${goodDaysData.count}` : "—",
      sub: hasAnyData ? `of ${goodDaysData.total} analyzed` : "Start tracking",
      Icon: Smile,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      valueColor: "text-gray-900",
    },
    {
      label: "Current Streak",
      value: `${progress?.journaling_streak?.current_days || 0}`,
      sub: "days in a row",
      Icon: Flame,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      valueColor: "text-gray-900",
    },
  ];

  /* ── Progress bars config ────────────────────────────────── */
  const progressMetrics = [
    {
      label: "Good Days",
      value: `${goodDaysData.count}/${goodDaysData.total}`,
      percentage: goodDaysData.percentage,
      barColor: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      label: "Journaling Streak",
      value: `${progress?.journaling_streak?.current_days || 0} days`,
      percentage: Math.min(
        100,
        (progress?.journaling_streak?.current_days || 0) * 14
      ),
      barColor: "bg-sky-500",
      textColor: "text-sky-600",
    },
    {
      label: "Mood Stability",
      value: `${progress?.mood_stability?.percentage || 0}%`,
      percentage: progress?.mood_stability?.percentage || 0,
      barColor: "bg-violet-500",
      textColor: "text-violet-600",
    },
  ];

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 mt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Header ─────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-white rounded-xl border border-gray-200 p-1">
                {([7, 30, 90] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setTimeRange(d)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      timeRange === d
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {d === 7 ? "1 Week" : d === 30 ? "1 Month" : "3 Months"}
                  </button>
                ))}
              </div>
              <button
                onClick={refetch}
                className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Empty state ────────────────────────────────── */}
          {!hasAnyData && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center mb-8">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PenLine className="w-7 h-7 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Start your mood journey
              </h2>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                Your insights will appear here once you begin journaling. Track
                how you feel each day to unlock personalized analytics.
              </p>
              <button
                onClick={() => (window.location.href = "/mood-tracking")}
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-violet-700 transition-colors"
              >
                Write First Entry <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Stat Cards ─────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, sub, Icon, iconBg, iconColor, valueColor }, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {label}
                  </p>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}
                  >
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-1 leading-tight">{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Main content (only with data) ──────────────── */}
          {hasAnyData && (
            <>
              {/* Row 1: Mood Journey (2/3) + Emotional Landscape (1/3) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                {/* Mood Journey Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-gray-900">Mood Journey</h2>
                    <span className="text-xs text-gray-400">
                      {timeRange === 7
                        ? "This Week"
                        : timeRange === 30
                        ? new Date().toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : `${new Date(
                            Date.now() - 90 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString("en-US", {
                            month: "short",
                          })} – ${new Date().toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}`}
                    </span>
                  </div>

                  {displayMoodData.length > 0 ? (
                    <>
                      {/* Bar chart */}
                      <div className="flex items-end gap-1 h-36">
                        {displayMoodData.map((day, idx) => {
                          const pct = Math.max(5, (day.mood_score / 5) * 100);
                          const isHovered = hoveredBar === idx;
                          return (
                            <div
                              key={idx}
                              className="relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
                              onMouseEnter={() => setHoveredBar(idx)}
                              onMouseLeave={() => setHoveredBar(null)}
                            >
                              {/* Tooltip */}
                              {isHovered && (
                                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap z-10">
                                  {day.mood_score.toFixed(1)}/5
                                  <br />
                                  <span className="text-gray-400">
                                    {day.dominant_emotion}
                                  </span>
                                </div>
                              )}
                              {/* Bar */}
                              <div
                                className={`w-full rounded-t-md transition-colors duration-150 ${
                                  isHovered ? "bg-violet-500" : "bg-violet-200"
                                }`}
                                style={{ height: `${pct}%` }}
                              />
                              {/* Label */}
                              <span className="text-[9px] text-gray-400 mt-1.5 select-none">
                                {timeRange <= 7
                                  ? new Date(day.date).toLocaleDateString(
                                      "en",
                                      { weekday: "short" }
                                    )
                                  : new Date(day.date).getDate()}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Low / Avg / High */}
                      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-50">
                        {[
                          {
                            label: "Low",
                            val: Math.min(
                              ...displayMoodData.map((d) => d.mood_score)
                            ).toFixed(1),
                          },
                          {
                            label: "Avg",
                            val: (
                              displayMoodData.reduce(
                                (s, d) => s + d.mood_score,
                                0
                              ) / displayMoodData.length
                            ).toFixed(1),
                          },
                          {
                            label: "High",
                            val: Math.max(
                              ...displayMoodData.map((d) => d.mood_score)
                            ).toFixed(1),
                          },
                        ].map((s) => (
                          <div key={s.label} className="text-center">
                            <p className="text-xs text-gray-400">{s.label}</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {s.val}
                              <span className="text-xs font-normal text-gray-400">
                                /5
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-36 flex flex-col items-center justify-center text-gray-400 gap-3">
                      <p className="text-sm">No mood data for this period</p>
                      <button
                        onClick={() => (window.location.href = "/mood-tracking")}
                        className="text-xs text-violet-600 hover:underline"
                      >
                        Start journaling →
                      </button>
                    </div>
                  )}
                </div>

                {/* Emotional Landscape */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-semibold text-gray-900 mb-5">Emotions</h2>
                  {emotionalLandscape.length > 0 ? (
                    <div className="space-y-4">
                      {emotionalLandscape.map((emotion, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: emotion.color }}
                              />
                              <span className="text-sm text-gray-600">
                                {emotion.name}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-800">
                              {emotion.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${emotion.percentage}%`,
                                backgroundColor: emotion.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                      No emotion data yet
                    </div>
                  )}

                  {emotionData?.emotional_landscape?.dominant_emotion && (
                    <div className="mt-5 pt-4 border-t border-gray-50">
                      <p className="text-xs text-gray-400 mb-0.5">
                        Dominant emotion
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {emotionData.emotional_landscape.dominant_emotion}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Progress Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {progressMetrics.map((m, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-500">{m.label}</p>
                      <p className={`text-lg font-bold ${m.textColor}`}>
                        {m.value}
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${m.barColor}`}
                        style={{ width: `${m.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 3: Analysis */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-violet-400" />
                  <h2 className="font-semibold text-gray-900">
                    Progress Analysis
                  </h2>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {mounted && emotionData ? (
                    <TypeAnimation
                      sequence={[
                        `Your mood tracking shows ${goodDaysData.percentage}% good days over the last ${timeRange} days. ${
                          moodImprovement?.message || ""
                        } Your journaling streak is ${
                          progress?.journaling_streak?.current_days || 0
                        } days, with a mood stability of ${
                          progress?.mood_stability?.percentage || 0
                        }%. ${
                          emotionalLandscape[0]?.name || "Neutral"
                        } is your dominant emotion recently.`,
                      ]}
                      wrapper="span"
                      speed={90}
                      repeat={0}
                    />
                  ) : null}
                </p>
              </div>
            </>
          )}

          {/* ── Actions ────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.href = "/mood-tracking")}
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              <PenLine className="w-4 h-4" />
              {hasAnyData ? "New Entry" : "Start Journaling"}
            </button>
            {hasAnyData && (
              <button
                onClick={refetch}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

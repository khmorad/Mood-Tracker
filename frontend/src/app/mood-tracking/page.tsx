"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Layout from "../layout";
import axios from "axios";
import TypingAnimation from "../components/TypingAnimation";
import Link from "next/link";
import { getCurrentUser } from "../../utils/auth";
import {
  Smile,
  Meh,
  Frown,
  Heart,
  CloudRain,
  Zap,
  Moon,
  Sun,
  Send,
  BarChart3,
  Volume2,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  Crown,
} from "lucide-react";

interface User {
  user_id?: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionTier?: string;
  subscriptionExpires?: string;
}

interface Conversation {
  user: string;
  ai: string;
}

interface JournalEntry {
  entry_id: number;
  user_id: string;
  entry_text: string;
  AI_response: string;
  journal_date: string;
  episode_flag: number;
}

const MoodTrackingPage: React.FC = () => {
  const [journal, setJournal] = useState("");
  const [journalEntries, setJournalEntries] = useState<string[]>([]);
  const [currentMood, setCurrentMood] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [aiResponses, setAiResponses] = useState<string[]>([]);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(
    null
  );
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savingStates, setSavingStates] = useState<{
    [key: number]: "saving" | "saved" | "error";
  }>({});
  const [, setGuestMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [moodAutoDetected, setMoodAutoDetected] = useState(false);

  const journalInputRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const moodEmojis = [
    {
      icon: <Sun className="w-6 h-6" />,
      label: "Happy",
      color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700",
      selectedColor: "bg-yellow-200 border-yellow-400 text-yellow-800",
      bgColor: "rgba(254, 240, 138, 0.45)",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      label: "Calm",
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
      selectedColor: "bg-blue-200 border-blue-400 text-blue-800",
      bgColor: "rgba(147, 197, 253, 0.45)",
    },
    {
      icon: <Meh className="w-6 h-6" />,
      label: "Neutral",
      color: "bg-gray-100 hover:bg-gray-200 text-gray-700",
      selectedColor: "bg-gray-200 border-gray-400 text-gray-800",
      bgColor: "rgba(209, 213, 219, 0.45)",
    },
    {
      icon: <Frown className="w-6 h-6" />,
      label: "Sad",
      color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
      selectedColor: "bg-indigo-200 border-indigo-400 text-indigo-800",
      bgColor: "rgba(165, 180, 252, 0.45)",
    },
    {
      icon: <CloudRain className="w-6 h-6" />,
      label: "Anxious",
      color: "bg-orange-100 hover:bg-orange-200 text-orange-700",
      selectedColor: "bg-orange-200 border-orange-400 text-orange-800",
      bgColor: "rgba(253, 186, 116, 0.45)",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      label: "Angry",
      color: "bg-red-100 hover:bg-red-200 text-red-700",
      selectedColor: "bg-red-200 border-red-400 text-red-800",
      bgColor: "rgba(252, 165, 165, 0.45)",
    },
    {
      icon: <Moon className="w-6 h-6" />,
      label: "Tired",
      color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
      selectedColor: "bg-purple-200 border-purple-400 text-purple-800",
      bgColor: "rgba(216, 180, 254, 0.45)",
    },
    {
      icon: <Smile className="w-6 h-6" />,
      label: "Grateful",
      color: "bg-pink-100 hover:bg-pink-200 text-pink-700",
      selectedColor: "bg-pink-200 border-pink-400 text-pink-800",
      bgColor: "rgba(249, 168, 212, 0.45)",
    },
  ];

  // Initialize user and welcome message
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUser(user);

      const welcomeMessage = `Hello ${
        user.firstName || "User"
      }! How are you feeling today? I'm here to listen and support you. 💙`;
      setAiResponses([welcomeMessage]);
      setConversation([{ user: "", ai: welcomeMessage }]);
      setTypingMessageIndex(0);

      console.log("[MoodTracking] User loaded:", user);
    } else {
      handleAnonymousUser();
      console.warn("[MoodTracking] No authenticated user found.");
    }
    setIsClient(true);
  }, []);

  const GUEST_MESSAGE_LIMIT = 2;

  const handleAnonymousUser = () => {
    const anonymousUser: User = {
      user_id: "anonymous",
      firstName: "Guest",
      lastName: "",
      email: "anonymous@example.com",
      subscriptionTier: "Free",
    };
    setUser(anonymousUser);

    // Restore previous guest session count
    const savedCount = parseInt(
      localStorage.getItem("guest_chat_count") || "0",
      10
    );
    setGuestMessageCount(savedCount);
    if (savedCount >= GUEST_MESSAGE_LIMIT) {
      setShowLoginPrompt(true);
    }

    const welcomeMessage =
      "Hello! How are you feeling today? I'm here to listen and support you. 💙";
    setAiResponses([welcomeMessage]);
    setConversation([{ user: "", ai: welcomeMessage }]);
    setTypingMessageIndex(0);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [journalEntries, aiResponses]);

  const clearMessages = () => {
    // Remove the setErrorMessage and setSuccessMessage calls since they're not used
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setJournal(e.currentTarget.textContent || "");
    clearMessages();
  };

  const getGeminiResponse = async (entry: string): Promise<string> => {
    try {
      clearMessages();

      const conversationHistoryString = conversation
        .filter((conv) => conv.user || conv.ai)
        .map((conv) => {
          const userMessage = conv.user ? `User: ${conv.user}` : "";
          const aiMessage = conv.ai ? `AI: ${conv.ai}` : "";
          return [userMessage, aiMessage].filter(Boolean).join(" ");
        })
        .join(" | ");

      const userInfoString = user
        ? `User: ${user.firstName} ${user.lastName} (${user.email})`
        : "Anonymous User";

      const moodString =
        currentMood.length > 0 ? currentMood.join(", ") : "Not specified";

      const prompt = `You are a supportive mental health assistant. Be encouraging and empathetic. Always end with a thoughtful question to help the user explore their feelings deeper. Keep responses natural and conversational without describing physical gestures or actions.
      
      ${userInfoString}
      Current mood(s): ${moodString}
      User message: ${entry}
      Previous conversation: ${conversationHistoryString}
      
      Provide a supportive response:`;

      console.log("[AI Request] Sending prompt to AI:", prompt);
      console.log("[AI Request] Request URL:", "/api/generate");
      console.log("[AI Request] Request payload:", {
        message: prompt,
        conversation: conversation,
      });

      const response = await axios.post("/api/generate", {
        message: prompt,
        conversation: conversation,
      });

      console.log("[AI Response] Full response object:", response);
      console.log("[AI Response] Response status:", response.status);
      console.log("[AI Response] Response data:", response.data);

      const aiResponse =
        response.data.message ||
        response.data.response ||
        "I'm here to support you. How else can I help? c";

      console.log("[AI Response] Final processed response:", aiResponse);
      return aiResponse;
    } catch (error) {
      console.error("[AI Error] Full error object:", error);
      if (axios.isAxiosError(error)) {
        console.error("[AI Error] Response data:", error.response?.data);
        console.error("[AI Error] Response status:", error.response?.status);
        console.error("[AI Error] Error message:", error.message);
      }
      // Remove setErrorMessage call since it's not used
      return "I'm sorry, I'm having trouble processing that right now. Could you try again? 💙";
    } finally {
      setIsLoading(false);
    }
  };

  const saveJournalEntry = async (
    entryText: string,
    aiResponse: string
  ): Promise<boolean> => {
    try {
      if (!user) {
        console.error("[Journal Save] No user available");
        return false;
      }

      const today = new Date();
      const journalDate = today.toISOString().split("T")[0]; // YYYY-MM-DD format

      const postData = {
        user_id: user.user_id || user.email,
        entry_text: entryText,
        AI_response: aiResponse,
        journal_date: journalDate,
        episode_flag: 0,
      };

      console.log("[Journal Save] Saving entry:", postData);

      const response = await axios.post("/api/journal-entries", postData);

      if (response.status === 200 || response.status === 201) {
        console.log("[Journal Save] Success:", response.data);
        // Remove setSuccessMessage call since it's not used
        return true;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error("[Journal Save] Error:", error);
      if (axios.isAxiosError(error)) {
        console.error("[Journal Save] Response data:", error.response?.data);
      }
      return false;
    }
  };

  const playTTS = async (text: string) => {
    try {
      const response = await axios.post("/api/text-to-speech", { text });
      const audioUrl = response.data.url;
      new Audio(audioUrl).play();
    } catch (error) {
      console.error("Error playing TTS:", error);
    }
  };
  // ─── Auto-Emotion Detection ────────────────────────────────────────────────
  // Runs in the background after each AI response.
  // Sends a short classification prompt to Gemini and updates mood buttons.
  const detectEmotions = async (
    userMessage: string,
    aiResponse: string
  ): Promise<void> => {
    const validMoods = [
      "Happy",
      "Calm",
      "Neutral",
      "Sad",
      "Anxious",
      "Angry",
      "Tired",
      "Grateful",
    ];

    try {
      const classifyPrompt = `Analyze the USER's emotional state based on the conversation below.

User message: "${userMessage}"
AI response for context: "${aiResponse}"

Reply with ONLY a valid JSON array containing 1-3 of these exact mood labels that best reflect what the USER is feeling:
["Happy", "Calm", "Neutral", "Sad", "Anxious", "Angry", "Tired", "Grateful"]

Rules:
- Return ONLY the JSON array, no explanation or markdown
- Choose labels that match the USER's emotion, not the AI's tone
- Prefer specificity: if the message is clearly happy, don't include Neutral

Example: ["Happy", "Grateful"]`;

      const response = await axios.post("/api/generate", {
        message: classifyPrompt,
        conversation: [],
      });

      const rawText: string = response.data.message || "";

      // Parse JSON array from response (Gemini sometimes wraps in markdown)
      const match = rawText.match(/\[[\s\S]*?\]/);
      if (!match) return;

      const parsed: unknown = JSON.parse(match[0]);
      if (!Array.isArray(parsed)) return;

      const detectedMoods = (parsed as unknown[]).filter(
        (m): m is string => typeof m === "string" && validMoods.includes(m)
      );

      if (detectedMoods.length > 0) {
        setCurrentMood(detectedMoods);
        setMoodAutoDetected(true);
        console.log("[Emotion Detection] Detected moods:", detectedMoods);
      }
    } catch (error) {
      // Non-critical — silently ignore
      console.warn("[Emotion Detection] Failed:", error);
    }
  };

  const handleSubmit = async () => {
    if (!journal.trim()) return;

    const isGuest = user?.user_id === "anonymous";

    // Gate: guest has used all free messages
    if (isGuest) {
      const currentCount = parseInt(
        localStorage.getItem("guest_chat_count") || "0",
        10
      );
      if (currentCount >= GUEST_MESSAGE_LIMIT) {
        setShowLoginPrompt(true);
        return;
      }
    }

    const userText = journal;

    // 1. Show user message instantly
    setJournalEntries((prev) => [...prev, userText]);

    // 2. Prepare typing index for AI response
    const aiIndex = conversation.length;
    setTypingMessageIndex(aiIndex);

    // 3. Clear input immediately
    setJournal("");
    if (journalInputRef.current) journalInputRef.current.textContent = "";

    // 4. Get AI response
    const aiResponse = await getGeminiResponse(userText);

    // 5. Show AI message — keep typingMessageIndex set so TypingAnimation plays.
    //    onComplete on the animation will clear it once typing finishes.
    setConversation((prev) => [...prev, { user: userText, ai: aiResponse }]);
    setAiResponses((prev) => [...prev, aiResponse]);

    // 6. Auto-detect emotions in background (both guests and logged-in users)
    detectEmotions(userText, aiResponse);

    if (isGuest) {
      // Increment guest count — no DB save for anonymous users
      const currentCount = parseInt(
        localStorage.getItem("guest_chat_count") || "0",
        10
      );
      const newCount = currentCount + 1;
      localStorage.setItem("guest_chat_count", String(newCount));
      setGuestMessageCount(newCount);
      if (newCount >= GUEST_MESSAGE_LIMIT) {
        setShowLoginPrompt(true);
      }
      return;
    }

    // 7. Save to DB IN BACKGROUND (logged-in users only)
    setSavingStates((prev) => ({ ...prev, [aiIndex]: "saving" }));

    saveJournalEntry(userText, aiResponse)
      .then((ok) => {
        setSavingStates((prev) => ({
          ...prev,
          [aiIndex]: ok ? "saved" : "error",
        }));
      })
      .catch(() => {
        setSavingStates((prev) => ({
          ...prev,
          [aiIndex]: "error",
        }));
      });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Load existing journal entries on component mount
  const loadExistingEntries = useCallback(async () => {
    try {
      if (!user || user.user_id === "anonymous" || hasLoadedEntries) return;

      console.log(
        "[Load Entries] Starting to load entries for user:",
        user.user_id
      );

      const response = await axios.get(
        `/api/journal-entries?userId=${encodeURIComponent(
          user.user_id || user.email
        )}`
      );

      if (response.data && Array.isArray(response.data)) {
        const today = new Date().toISOString().split("T")[0];
        const entries: JournalEntry[] = response.data
          .filter((entry) => entry.journal_date === today)
          .sort(
            (a, b) =>
              new Date(a.journal_date).getTime() -
              new Date(b.journal_date).getTime()
          );

        // Only update if we have entries to load
        if (entries.length > 0) {
          // Load recent entries into conversation
          const loadedConversation: Conversation[] = [
            {
              user: "",
              ai: `Hello ${
                user.firstName || "User"
              }! How are you feeling today? I'm here to listen and support you. 💙`,
            },
          ];
          const loadedUserEntries: string[] = [];
          const loadedAiResponses: string[] = [
            `Hello ${
              user.firstName || "User"
            }! How are you feeling today? I'm here to listen and support you. 💙`,
          ];

          entries.forEach((entry) => {
            loadedConversation.push({
              user: entry.entry_text,
              ai: entry.AI_response,
            });
            loadedUserEntries.push(entry.entry_text);
            loadedAiResponses.push(entry.AI_response);
          });

          setConversation(loadedConversation);
          setJournalEntries(loadedUserEntries);
          setAiResponses(loadedAiResponses);

          console.log(
            "[Load Entries] Loaded",
            entries.length,
            "recent entries"
          );
        }

        // Mark as loaded regardless of whether we found entries
        setHasLoadedEntries(true);

        // Clear typing indicator since these are loaded messages
        setTypingMessageIndex(null);
      }
    } catch (error) {
      console.error("[Load Entries] Error:", error);
      setHasLoadedEntries(true); // Prevent retry loops
    }
  }, [user, hasLoadedEntries]);

  useEffect(() => {
    if (user && user.user_id !== "anonymous" && !hasLoadedEntries) {
      loadExistingEntries();
    }
  }, [user, hasLoadedEntries, loadExistingEntries]);

  const handleMoodSelection = (moodLabel: string) => {
    // Clear auto-detected badge when user manually adjusts moods
    setMoodAutoDetected(false);
    setCurrentMood((prev) => {
      if (prev.includes(moodLabel)) {
        return prev.filter((mood) => mood !== moodLabel);
      } else {
        return [...prev, moodLabel];
      }
    });
  };

  // ─── Sidebar dynamic background ────────────────────────────────────────────
  // Blends the colors of all selected moods into a gradient background.
  const sidebarBackground = useMemo(() => {
    const selectedColors = moodEmojis
      .filter((m) => currentMood.includes(m.label))
      .map((m) => m.bgColor);

    if (selectedColors.length === 0) return "#f9fafb"; // gray-50 default
    if (selectedColors.length === 1)
      return `linear-gradient(160deg, ${selectedColors[0]}, #f9fafb 70%)`;

    // Spread multiple colors evenly across the gradient
    const stops = selectedColors
      .map((c, i) => {
        const pct = Math.round((i / (selectedColors.length - 1)) * 100);
        return `${c} ${pct}%`;
      })
      .join(", ");
    return `linear-gradient(160deg, ${stops})`;
  }, [currentMood]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isClient) {
    return null;
  }

  return (
    <Layout>
      <div className="flex h-screen bg-white pt-16 overflow-hidden">
        {/* Sidebar for Mood Selection */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-80 border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 pt-16 lg:pt-0 overflow-hidden`}
          style={{
            background: sidebarBackground,
            transition: "background 1.2s ease, transform 300ms ease-in-out",
          }}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              How are you feeling?
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="p-4 space-y-3 overflow-y-auto flex flex-col"
            style={{ height: "calc(100vh - 140px)" }}
          >
            {/* Mood Selection Grid */}
            <div className="grid grid-cols-2 gap-2">
              {moodEmojis.map((mood, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelection(mood.label)}
                  className={`py-2 px-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                    currentMood.includes(mood.label)
                      ? `${mood.selectedColor} border-current shadow-sm`
                      : `${mood.color} border-transparent hover:border-gray-300`
                  }`}
                >
                  <div className="flex-shrink-0">{mood.icon}</div>
                  <span className="font-medium text-sm">{mood.label}</span>
                </button>
              ))}
            </div>

            {/* Selected Moods Summary */}
            {currentMood.length > 0 && (
              <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Current Mood
                  </h3>
                  {moodAutoDetected && (
                    <span className="flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full animate-pulse">
                      ✨ AI detected
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentMood.map((mood, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {mood}
                    </span>
                  ))}
                </div>
                {moodAutoDetected && (
                  <p className="mt-2 text-xs text-gray-400">
                    Based on your message · click any mood to override
                  </p>
                )}
              </div>
            )}

            {/* Spacer to push buttons to bottom */}
            <div className="flex-1"></div>

            {/* Divider Line */}
            <hr className="border-gray-300 my-4" />

            {/* Bottom Action Buttons */}
            <div className="space-y-3">
              {/* Upgrade Button - Only show for Free tier users */}
              {user?.subscriptionTier === "Free" && (
                <Link
                  href="/pricing"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Crown className="w-5 h-5" />
                  <span>Upgrade to Plus</span>
                </Link>
              )}

              {/* Current Plan Display for Premium Users */}
              {user?.subscriptionTier && user.subscriptionTier !== "Free" && (
                <>
                  <div className="w-full bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 py-3 px-4 rounded-xl flex items-center justify-center space-x-2">
                    <Crown className="w-5 h-5 text-green-600" />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-800">
                        {user.subscriptionTier} Plan Active
                      </div>
                      {user.subscriptionExpires &&
                        user.subscriptionTier !== "Professional" && (
                          <div className="text-xs text-green-600">
                            Expires:{" "}
                            {new Date(
                              user.subscriptionExpires
                            ).toLocaleDateString()}
                          </div>
                        )}
                      {user.subscriptionTier === "Professional" && (
                        <div className="text-xs text-green-600">
                          Lifetime Access
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Change Plan Button for Premium Users */}
                  <Link
                    href="/pricing"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Change Plan</span>
                  </Link>
                </>
              )}

              {/* Dashboard Link */}
              <Link
                href="/dashboard"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span>View Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Mood Journal
            </h1>
            <div className="w-10 lg:w-0"></div>
          </div>

          {/* Messages */}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Initial AI Message */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 max-w-3xl">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4">
                    {typingMessageIndex === 0 ? (
                      <TypingAnimation
                        text={aiResponses[0]}
                        onComplete={() => setTypingMessageIndex(null)}
                      />
                    ) : (
                      <div className="flex items-start justify-between">
                        <p className="text-gray-800">{aiResponses[0]}</p>
                        <div className="flex items-center space-x-2 ml-3">
                          <button
                            onClick={() => playTTS(aiResponses[0])}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="Play AI Response"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conversation History */}
              {journalEntries.map((entry, index) => (
                <div key={index} className="space-y-6">
                  {/* User Message */}
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="flex-1 max-w-3xl">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm p-4 ml-12">
                        <p>{entry}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 max-w-3xl">
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-4">
                        {aiResponses[index + 1] ? (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {typingMessageIndex === index + 1 ? (
                                <TypingAnimation
                                  text={aiResponses[index + 1]}
                                  onComplete={() => setTypingMessageIndex(null)}
                                />
                              ) : (
                                <p className="text-gray-800">
                                  {aiResponses[index + 1]}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-3">
                              <button
                                onClick={() => playTTS(aiResponses[index + 1])}
                                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                                aria-label="Play AI Response"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>

                              {/* Save Status Indicator */}
                              {savingStates[index + 1] === "saving" && (
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-xs">Saving...</span>
                                </div>
                              )}
                              {savingStates[index + 1] === "saved" && (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <CheckCircle className="w-3 h-3" />
                                  <span className="text-xs">Saved</span>
                                </div>
                              )}
                              {savingStates[index + 1] === "error" && (
                                <div className="flex items-center space-x-1 text-red-500">
                                  <AlertCircle className="w-3 h-3" />
                                  <span className="text-xs">Failed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Login prompt — shown after guest uses free messages */}
              {showLoginPrompt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 max-w-3xl">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl rounded-tl-sm p-5">
                      <p className="text-gray-800 mb-1 font-semibold">
                        You&apos;ve used your {GUEST_MESSAGE_LIMIT} free messages 💙
                      </p>
                      <p className="text-gray-600 text-sm mb-4">
                        Create a free account to keep chatting, save your mood
                        history, and get personalized insights over time.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href="/login"
                          className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                        >
                          Log In
                        </a>
                        <a
                          href="/register"
                          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                        >
                          Sign Up Free
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              {showLoginPrompt ? (
                /* Locked state for guests who've hit the limit */
                <div className="flex items-center justify-center gap-4 py-3 px-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-sm text-gray-600">
                    Log in to continue your session
                  </p>
                  <a
                    href="/login"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
                  >
                    Log In
                  </a>
                  <a
                    href="/register"
                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
                  >
                    Sign Up Free
                  </a>
                </div>
              ) : (
                <div className="relative">
                  <div
                    contentEditable
                    onInput={handleInput}
                    onKeyPress={handleKeyPress}
                    ref={journalInputRef}
                    className="w-full min-h-[60px] max-h-32 overflow-y-auto p-4 pr-12 text-gray-800 bg-white border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                    suppressContentEditableWarning={true}
                  />
                  {journal === "" && (
                    <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                      Message Mood Journal...
                    </div>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!journal.trim()}
                    className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MoodTrackingPage;

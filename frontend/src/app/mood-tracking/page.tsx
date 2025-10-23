"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../layout";
import axios from "axios";
import TypingAnimation from "../components/TypingAnimation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
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
  ChevronRight,
} from "lucide-react";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
}

interface DecodedToken {
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  [key: string]: unknown;
}

interface User {
  user_id?: string;
  firstName: string;
  lastName: string;
  email: string;
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

  const journalInputRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const moodEmojis = [
    {
      icon: <Sun className="w-6 h-6" />,
      label: "Happy",
      color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700",
      selectedColor: "bg-yellow-200 border-yellow-400 text-yellow-800",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      label: "Calm",
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
      selectedColor: "bg-blue-200 border-blue-400 text-blue-800",
    },
    {
      icon: <Meh className="w-6 h-6" />,
      label: "Neutral",
      color: "bg-gray-100 hover:bg-gray-200 text-gray-700",
      selectedColor: "bg-gray-200 border-gray-400 text-gray-800",
    },
    {
      icon: <Frown className="w-6 h-6" />,
      label: "Sad",
      color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
      selectedColor: "bg-indigo-200 border-indigo-400 text-indigo-800",
    },
    {
      icon: <CloudRain className="w-6 h-6" />,
      label: "Anxious",
      color: "bg-orange-100 hover:bg-orange-200 text-orange-700",
      selectedColor: "bg-orange-200 border-orange-400 text-orange-800",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      label: "Angry",
      color: "bg-red-100 hover:bg-red-200 text-red-700",
      selectedColor: "bg-red-200 border-red-400 text-red-800",
    },
    {
      icon: <Moon className="w-6 h-6" />,
      label: "Tired",
      color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
      selectedColor: "bg-purple-200 border-purple-400 text-purple-800",
    },
    {
      icon: <Smile className="w-6 h-6" />,
      label: "Grateful",
      color: "bg-pink-100 hover:bg-pink-200 text-pink-700",
      selectedColor: "bg-pink-200 border-pink-400 text-pink-800",
    },
  ];

  // Initialize user and welcome message
  useEffect(() => {
    const jwt = getCookie("access_token");
    if (jwt) {
      try {
        const decoded: DecodedToken = jwtDecode(jwt);
        const userData: User = {
          user_id: decoded.user_id || decoded.email || "anonymous",
          firstName: decoded.first_name || "",
          lastName: decoded.last_name || "",
          email: decoded.email || "",
        };
        setUser(userData);

        const welcomeMessage = `Hello ${
          userData.firstName || "User"
        }! How are you feeling today? I'm here to listen and support you. 💙`;
        setAiResponses([welcomeMessage]);
        setConversation([{ user: "", ai: welcomeMessage }]);
        setTypingMessageIndex(0); // Show typing for welcome message

        console.log("[MoodTracking] User loaded:", userData);
      } catch (e) {
        console.error("[MoodTracking] Failed to decode JWT:", e);
        handleAnonymousUser();
      }
    } else {
      handleAnonymousUser();
      console.warn("[MoodTracking] No access_token cookie found.");
    }
    setIsClient(true);
  }, []);

  const handleAnonymousUser = () => {
    const anonymousUser: User = {
      user_id: "anonymous",
      firstName: "Guest",
      lastName: "",
      email: "anonymous@example.com",
    };
    setUser(anonymousUser);

    const welcomeMessage =
      "Hello! How are you feeling today? I'm here to listen and support you. 💙";
    setAiResponses([welcomeMessage]);
    setConversation([{ user: "", ai: welcomeMessage }]);
    setTypingMessageIndex(0); // Show typing for welcome message
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
      setIsLoading(true);
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
      setIsLoading(true);
      const response = await axios.post("/api/text-to-speech", { text });
      const audioUrl = response.data.url;
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error playing TTS:", error);
      // Remove setErrorMessage call since it's not used
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!journal.trim()) {
      // Remove setErrorMessage call since it's not used
      return;
    }

    try {
      setIsLoading(true);
      clearMessages();

      // Add user message to UI immediately
      setJournalEntries((prev) => [...prev, journal]);

      // Set typing indicator for the new AI response
      const newResponseIndex = aiResponses.length;
      setTypingMessageIndex(newResponseIndex);

      // Get AI response first
      const aiResponse = await getGeminiResponse(journal);

      // Update conversation state and show AI response
      const newConversation = [
        ...conversation,
        { user: journal, ai: aiResponse },
      ];
      setConversation(newConversation);
      setAiResponses((prev) => [...prev, aiResponse]);

      // Clear typing indicator after response is complete
      setTimeout(() => {
        setTypingMessageIndex(null);
      }, 100);

      // Clear input immediately after AI response
      const currentJournal = journal;
      setJournal("");
      if (journalInputRef.current) {
        journalInputRef.current.textContent = "";
      }

      setIsLoading(false);

      // Now save to backend in the background with loading indicator
      setSavingStates((prev) => ({ ...prev, [newResponseIndex]: "saving" }));

      try {
        const saved = await saveJournalEntry(currentJournal, aiResponse);

        if (saved) {
          console.log("[Submit] Journal entry saved successfully");
          setSavingStates((prev) => ({ ...prev, [newResponseIndex]: "saved" }));
          // Remove saved indicator after 3 seconds
          setTimeout(() => {
            setSavingStates((prev) => {
              const newState = { ...prev };
              delete newState[newResponseIndex];
              return newState;
            });
          }, 3000);
        } else {
          console.warn("[Submit] Journal entry not saved");
          setSavingStates((prev) => ({ ...prev, [newResponseIndex]: "error" }));
        }
      } catch (saveError) {
        console.error("[Submit] Save Error:", saveError);
        setSavingStates((prev) => ({ ...prev, [newResponseIndex]: "error" }));
      }
    } catch (error) {
      console.error("[Submit] Error:", error);
      // Remove setErrorMessage call since it's not used
      console.error(
        "An error occurred while processing your entry. Please try again."
      );
      setTypingMessageIndex(null);
      setIsLoading(false);
    }
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
    setCurrentMood((prev) => {
      if (prev.includes(moodLabel)) {
        // Remove mood if already selected
        return prev.filter((mood) => mood !== moodLabel);
      } else {
        // Add mood if not selected
        return [...prev, moodLabel];
      }
    });
  };

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
          } fixed inset-y-0 left-0 z-50 w-80 bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 pt-16 lg:pt-0 overflow-hidden`}
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
            className="p-4 space-y-3 overflow-y-auto"
            style={{ height: "calc(100vh - 140px)" }}
          >
            {/* Mood Selection Grid */}
            <div className="grid grid-cols-2 gap-3">
              {moodEmojis.map((mood, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelection(mood.label)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    currentMood.includes(mood.label)
                      ? `${mood.selectedColor} border-current shadow-sm`
                      : `${mood.color} border-transparent hover:border-gray-300`
                  }`}
                >
                  <div className="flex-shrink-0">{mood.icon}</div>
                  <span className="font-medium text-sm text-center">
                    {mood.label}
                  </span>
                  {currentMood.includes(mood.label) && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>

            {/* Selected Moods Summary */}
            {currentMood.length > 0 && (
              <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Current Mood
                </h3>
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
              </div>
            )}

            {/* Dashboard Link */}
            <div className="mt-6">
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
                      <TypingAnimation text={aiResponses[0]} />
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
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
            <div className="max-w-4xl mx-auto">
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
                  disabled={isLoading || !journal.trim()}
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MoodTrackingPage;

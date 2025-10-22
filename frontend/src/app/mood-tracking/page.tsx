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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [aiResponses, setAiResponses] = useState<string[]>([]);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);

  const journalInputRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const moodEmojis = [
    {
      icon: <Sun className="w-8 h-8" />,
      label: "Happy",
      color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      label: "Calm",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    },
    {
      icon: <Meh className="w-8 h-8" />,
      label: "Neutral",
      color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
    },
    {
      icon: <Frown className="w-8 h-8" />,
      label: "Sad",
      color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
    },
    {
      icon: <CloudRain className="w-8 h-8" />,
      label: "Anxious",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      label: "Angry",
      color: "bg-red-50 border-red-200 hover:bg-red-100",
    },
    {
      icon: <Moon className="w-8 h-8" />,
      label: "Tired",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    },
    {
      icon: <Smile className="w-8 h-8" />,
      label: "Grateful",
      color: "bg-pink-50 border-pink-200 hover:bg-pink-100",
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
    setErrorMessage(null);
    setSuccessMessage(null);
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

      const prompt = `You are a supportive mental health assistant. Be encouraging, empathetic, and include nonverbal cues. Always end with a thoughtful question to help the user explore their feelings deeper.
      
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
      setErrorMessage(
        "I'm having trouble processing that right now. Could you try again?"
      );
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
        setSuccessMessage("Your journal entry has been saved! 💙");
        return true;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.error("[Journal Save] Error:", error);
      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          error.message;
        setErrorMessage(`Failed to save journal entry: ${errorMsg}`);
      } else {
        setErrorMessage("Failed to save journal entry. Please try again.");
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
      setErrorMessage("Failed to play audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!journal.trim()) {
      setErrorMessage("Please enter some text before submitting.");
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

      // Get AI response
      const aiResponse = await getGeminiResponse(journal);

      // Update conversation state
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

      // Save to backend
      const saved = await saveJournalEntry(journal, aiResponse);

      if (saved) {
        console.log("[Submit] Journal entry saved successfully");
      } else {
        console.warn("[Submit] Journal entry not saved, but continuing...");
      }

      // Clear input
      setJournal("");
      if (journalInputRef.current) {
        journalInputRef.current.textContent = "";
      }
    } catch (error) {
      console.error("[Submit] Error:", error);
      setErrorMessage(
        "An error occurred while processing your entry. Please try again."
      );
      setTypingMessageIndex(null); // Clear typing on error
    } finally {
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
      if (!user || user.user_id === "anonymous") return;

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

        // Load recent entries into conversation
        const loadedConversation: Conversation[] = [conversation[0]]; // Keep welcome message
        const loadedUserEntries: string[] = [];
        const loadedAiResponses: string[] = [aiResponses[0]]; // Keep welcome message

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
        
        // Clear typing indicator since these are loaded messages
        setTypingMessageIndex(null);

        console.log("[Load Entries] Loaded", entries.length, "recent entries");
      }
    } catch (error) {
      console.error("[Load Entries] Error:", error);
      // Don't show error to user for loading existing entries
    }
  }, [user, conversation, aiResponses]);

  useEffect(() => {
    if (user && user.user_id !== "anonymous") {
      loadExistingEntries();
    }
  }, [user, loadExistingEntries]);

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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="max-w-4xl mx-auto mb-8 mt-10 text-center"></div>

          {/* Mood Selection */}
          <div className="max-w-4xl mx-auto mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              How are you feeling right now?
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {moodEmojis.map((mood, index) => (
                <button
                  key={index}
                  onClick={() => handleMoodSelection(mood.label)}
                  className={`p-6 rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    currentMood.includes(mood.label)
                      ? `${mood.color} border-rose-400 shadow-lg`
                      : `${mood.color} shadow-sm`
                  }`}
                >
                  <div className="text-rose-500 mb-3 flex justify-center">
                    {mood.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {mood.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700">{errorMessage}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-green-700">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-6">
              <div className="space-y-8 max-h-96 overflow-y-auto">
                {/* Initial AI Message */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 shadow-sm border border-rose-100">
                    {typingMessageIndex === 0 ? (
                      <TypingAnimation text={aiResponses[0]} />
                    ) : (
                      <p className="text-gray-800 leading-relaxed">{aiResponses[0]}</p>
                    )}
                  </div>
                </div>

                {/* Conversation History */}
                {journalEntries.map((entry, index) => (
                  <div key={index} className="space-y-6">
                    {/* User Message */}
                    <div className="flex items-start space-x-4 justify-end">
                      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 text-right shadow-sm border border-blue-100">
                        <p className="text-gray-800 leading-relaxed">{entry}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 shadow-sm border border-rose-100">
                        {aiResponses[index + 1] ? (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {typingMessageIndex === index + 1 ? (
                                <TypingAnimation text={aiResponses[index + 1]} />
                              ) : (
                                <p className="text-gray-800 leading-relaxed">{aiResponses[index + 1]}</p>
                              )}
                            </div>
                            <button
                              onClick={() => playTTS(aiResponses[index + 1])}
                              className="ml-4 p-3 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-full transition-colors"
                              aria-label="Play AI Response"
                            >
                              <Volume2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-rose-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-3 h-3 bg-rose-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-3 h-3 bg-rose-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="relative">
                <div
                  contentEditable
                  onInput={handleInput}
                  onKeyPress={handleKeyPress}
                  ref={journalInputRef}
                  className="w-full min-h-[140px] max-h-48 overflow-y-auto p-6 text-gray-800 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all resize-none leading-relaxed"
                  suppressContentEditableWarning={true}
                />
                {journal === "" && (
                  <div className="absolute top-6 left-6 text-gray-400 pointer-events-none">
                    <TypingAnimation text="Share what's on your heart today..." />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !journal.trim()}
                  className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500 text-white py-4 px-8 rounded-3xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  aria-label="Submit Journal Entry"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Processing with care...
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Share Your Thoughts
                    </>
                  )}
                </button>

                <Link
                  href="/dashboard"
                  className="flex-1 bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-4 px-8 rounded-3xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center flex items-center justify-center"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Your Journey
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MoodTrackingPage;

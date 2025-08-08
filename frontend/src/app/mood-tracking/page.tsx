"use client";

import React, { useState, useEffect, useRef } from "react";
import Layout from "../layout";
import axios from "axios";
import TypingAnimation from "../components/TypingAnimation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

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
  const [currentMood, setCurrentMood] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [aiResponses, setAiResponses] = useState<string[]>([]);

  const journalInputRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const moodEmojis = [
    { emoji: "😊", label: "Happy", color: "bg-green-100 border-green-300" },
    { emoji: "😌", label: "Calm", color: "bg-blue-100 border-blue-300" },
    { emoji: "😐", label: "Neutral", color: "bg-gray-100 border-gray-300" },
    { emoji: "😔", label: "Sad", color: "bg-blue-100 border-blue-300" },
    { emoji: "😰", label: "Anxious", color: "bg-yellow-100 border-yellow-300" },
    { emoji: "😡", label: "Angry", color: "bg-red-100 border-red-300" },
    { emoji: "😴", label: "Tired", color: "bg-purple-100 border-purple-300" },
    { emoji: "🤗", label: "Grateful", color: "bg-pink-100 border-pink-300" },
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

      const prompt = `You are a supportive mental health assistant. Be encouraging, empathetic, and include nonverbal cues. Always end with a thoughtful question to help the user explore their feelings deeper.
      
      ${userInfoString}
      Current mood: ${currentMood || "Not specified"}
      User message: ${entry}
      Previous conversation: ${conversationHistoryString}
      
      Provide a supportive response:`;

      console.log("[AI Request] Sending prompt to AI:", prompt);

      const response = await axios.post("/api/generate", {
        message: prompt,
        conversation: conversation,
      });

      const aiResponse =
        response.data.message ||
        response.data.response ||
        "I'm here to support you. How else can I help? 💙";

      console.log("[AI Response] Received:", aiResponse);
      return aiResponse;
    } catch (error) {
      console.error("[AI Error]", error);
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

      // Get AI response
      const aiResponse = await getGeminiResponse(journal);

      // Update conversation state
      const newConversation = [
        ...conversation,
        { user: journal, ai: aiResponse },
      ];
      setConversation(newConversation);
      setAiResponses((prev) => [...prev, aiResponse]);

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
  useEffect(() => {
    if (user && user.user_id !== "anonymous") {
      loadExistingEntries();
    }
  }, [user]);

  const loadExistingEntries = async () => {
    try {
      if (!user || user.user_id === "anonymous") return;

      const response = await axios.get(
        `/api/journal-entries?userId=${encodeURIComponent(
          user.user_id || user.email
        )}`
      );

      if (response.data && Array.isArray(response.data)) {
        const entries: JournalEntry[] = response.data.sort(
          (a, b) =>
            new Date(a.journal_date).getTime() -
            new Date(b.journal_date).getTime()
        );

        // Load recent entries into conversation
        const recentEntries = entries.slice(-5); // Last 5 entries
        const loadedConversation: Conversation[] = [conversation[0]]; // Keep welcome message
        const loadedUserEntries: string[] = [];
        const loadedAiResponses: string[] = [aiResponses[0]]; // Keep welcome message

        recentEntries.forEach((entry) => {
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
          recentEntries.length,
          "recent entries"
        );
      }
    } catch (error) {
      console.error("[Load Entries] Error:", error);
      // Don't show error to user for loading existing entries
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Mood Selection */}
          <div className="max-w-4xl mx-auto mb-8 mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              How would you describe your mood right now?
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {moodEmojis.map((mood, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMood(mood.label)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    currentMood === mood.label
                      ? `${mood.color} border-2 border-purple-400 shadow-lg`
                      : `${mood.color} hover:shadow-md`
                  }`}
                >
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">
                    {mood.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-6 mb-6">
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {/* Initial AI Message */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    AI
                  </div>
                  <div className="flex-1 bg-purple-50 rounded-2xl p-4">
                    <TypingAnimation text={aiResponses[0]} />
                  </div>
                </div>

                {/* Conversation History */}
                {journalEntries.map((entry, index) => (
                  <div key={index} className="space-y-4">
                    {/* User Message */}
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="flex-1 bg-blue-50 rounded-2xl p-4 text-right">
                        <p className="text-gray-800">{entry}</p>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        You
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        AI
                      </div>
                      <div className="flex-1 bg-purple-50 rounded-2xl p-4">
                        {aiResponses[index + 1] ? (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <TypingAnimation text={aiResponses[index + 1]} />
                            </div>
                            <button
                              onClick={() => playTTS(aiResponses[index + 1])}
                              className="ml-3 p-2 text-purple-600 hover:text-purple-800 transition-colors"
                              aria-label="Play AI Response"
                            >
                              🔊
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
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
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg p-6">
              <div className="relative">
                <div
                  contentEditable
                  onInput={handleInput}
                  onKeyPress={handleKeyPress}
                  ref={journalInputRef}
                  className="w-full min-h-[120px] max-h-48 overflow-y-auto p-4 text-gray-800 bg-transparent border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none transition-colors resize-none"
                  suppressContentEditableWarning={true}
                />
                {journal === "" && (
                  <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                    <TypingAnimation text="Share your thoughts and feelings..." />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !journal.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Submit Journal Entry"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Send Message 💙"
                  )}
                </button>

                <Link
                  href="/dashboard"
                  className="flex-1 bg-gradient-to-r from-blue-400 to-purple-400 text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center"
                >
                  View Analytics 📊
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

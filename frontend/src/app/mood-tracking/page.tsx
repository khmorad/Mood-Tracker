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

const MoodTrackingPage: React.FC = () => {
  const [journal, setJournal] = useState("");
  const [journalEntries, setJournalEntries] = useState<string[]>([]);
  const [currentMood, setCurrentMood] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);
  type DecodedToken = {
    first_name: string;
    last_name: string;
    email: string;
    [key: string]: unknown; // optional: if you expect additional fields
  };
  const [isClient, setIsClient] = useState(false);
  const journalInputRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  interface Conversation {
    user: string;
    ai: string;
  }

  const [conversation, setConversation] = useState<Conversation[]>([
    {
      user: "",
      ai: "Hello! How are you feeling today? I'm here to listen and support you. 💙",
    },
  ]);

  const [aiResponses, setAiResponses] = useState<string[]>([
    "Hello! How are you feeling today? I'm here to listen and support you. 💙",
  ]);

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

  useEffect(() => {
    // Read JWT from cookie and decode
    const jwt = getCookie("access_token");
    if (jwt) {
      try {
        const decoded: DecodedToken = jwtDecode(jwt);
        setUser({
          firstName: decoded.first_name || "",
          lastName: decoded.last_name || "",
          email: decoded.email || "",
        });
        setAiResponses([
          `Hello ${
            decoded.first_name || "User"
          }! How are you feeling today? I'm here to listen and support you. 💙`,
        ]);
        console.log("[MoodTracking] Decoded JWT:", decoded);
      } catch (e) {
        console.error("[MoodTracking] Failed to decode JWT:", e);
        setUser(null);
      }
    } else {
      setUser(null);
      setAiResponses([
        "Hello! How are you feeling today? I'm here to listen and support you. 💙",
      ]);
      console.warn("[MoodTracking] No access_token cookie found.");
    }
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [journalEntries, aiResponses]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setJournal(e.currentTarget.textContent || "");
  };

  const getGeminiResponse = async (entry: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const conversationHistoryString = conversation
        .map((conv) => {
          const userMessage = `User message: ${conv.user || ""}`;
          const aiMessage = `AI response: ${conv.ai || ""}`;
          return `${userMessage}, ${aiMessage}`;
        })
        .join(" ");

      const userInfoString = JSON.stringify(user);
      const nameOfUser = `user info: ${userInfoString}`;
      const combinedEntry = `Your response to the user needs to be encouraging, supportive, include nonverbal cues and always end with a question that could dig deeper. Name of the user: ${nameOfUser}, User message: ${entry}, Previous messages: ${conversationHistoryString}`;

      const response = await axios.post("/api/generate", {
        message: combinedEntry,
        conversation: conversation || null,
      });

      const aiResponse = response.data.message;
      setConversation([...conversation, { user: entry, ai: aiResponse }]);

      return aiResponse;
    } catch {
      setErrorMessage("An error occurred while processing your entry.");
      return "I'm sorry, I'm having trouble processing that right now. Could you try again? 💙";
    } finally {
      setIsLoading(false);
    }
  };

  const playTTS = async (text: string) => {
    try {
      const response = await axios.post("/api/text-to-speech", { text });
      const audioUrl = response.data.url;
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error playing TTS:", error);
      setErrorMessage("Failed to play audio. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (journal.trim()) {
      setJournalEntries((prevEntries) => [...prevEntries, journal]);
      const aiResponse = await getGeminiResponse(journal);
      setAiResponses((prevResponses) => [...prevResponses, aiResponse]);
      setJournal("");
      if (journalInputRef.current) {
        journalInputRef.current.textContent = "";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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

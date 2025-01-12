"use client";

import React, { useState, useEffect, useRef } from "react";
import Layout from "../layout";
import axios from "axios";
import TypingAnimation from "../components/TypingAnimation";
import "../styles/mood-tracking.css";
import Link from "next/link";
const MoodTrackingPage: React.FC = () => {
  const [journal, setJournal] = useState("");
  const [journalEntries, setJournalEntries] = useState<string[]>([]);

  interface Conversation {
    user: string;
    ai: string;
  }

  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);

  const [isClient, setIsClient] = useState(false);
  const journalInputRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      // Set the initial AI response with the user's first name
      setAiResponses([
        `Hello ${parsedUser.firstName}, how can I help you today?`,
      ]);
    }
    setIsClient(true); // Ensure client-side rendering before executing browser-specific code
  }, []);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const [aiResponses, setAiResponses] = useState<string[]>([
    `Hello How can I help you today?`,
  ]);
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
      const combinedEntry = `your respond to the user needs to be encouragig, supportive, encouraging, includer nonverval cues${nameOfUser}, User message: ${entry}, Previous messages: ${conversationHistoryString}`;

      const response = await axios.post("/api/generate", {
        message: combinedEntry,
        conversation: conversation || null,
      });

      const aiResponse = response.data.message;
      setConversation([...conversation, { user: entry, ai: aiResponse }]);

      return aiResponse;
    } catch {
      setErrorMessage("An error occurred while processing your entry.");
      return "An error occurred while processing your entry.";
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

      // comment to stop text to speech
      //playTTS(aiResponse);

      setJournal("");
      if (journalInputRef.current) {
        journalInputRef.current.textContent = "";
      }
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <Layout>
      <div style={styles.container}>
        <h1>Track Your Moods</h1>
        {errorMessage && <p style={styles.error}>{errorMessage}</p>}
        <div style={styles.entriesList}>
          {journalEntries.map((entry, index) => (
            <div key={index}>
              <p>
                <strong>You:</strong> {entry}
              </p>
              <p style={styles.aiMessage}>
                <strong>AI:</strong>{" "}
                {aiResponses[index + 1] ? (
                  <TypingAnimation text={aiResponses[index + 1]} />
                ) : (
                  <span></span>
                )}
                <button
                  onClick={() => playTTS(aiResponses[index + 1])}
                  aria-label="Play AI Response"
                  style={{ marginLeft: "10px" }}
                >
                  🔊
                </button>
                
              </p>
            </div>
          ))}
        </div>
        <div style={styles.journalWrapper}>
          <div
            contentEditable
            onInput={handleInput}
            ref={journalInputRef}
            style={styles.journalInput}
            suppressContentEditableWarning={true}
          ></div>
          {journal === "" && (
            <div style={styles.placeholder}>
              <TypingAnimation text={"type here..."} />
            </div>
          )}
        </div>
        <button
          style={styles.sub_button}
          onClick={handleSubmit}
          disabled={isLoading || !journal.trim()}
          aria-label="Submit Journal Entry"
        >
          Submit
        </button>
        <button style={styles.analyze_button} disabled={isLoading || !journal.trim()}>
  <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
    Analyze
  </Link>
</button>

      </div>
    </Layout>
  );
};

const styles = {
  container: {
    margin: "5rem auto",
    maxWidth: "600px",
  },
  entriesList: {
    marginBottom: "1.2rem",
    padding: "1rem",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e0e0e0",
    width: "98%",
  },
  journalWrapper: {
    position: "relative" as const,
    width: "100%",
    marginBottom: "0.2rem",
  },
  journalInput: {
    width: "100%",
    minHeight: "10px",
    maxHeight: "200px",
    overflowY: "auto" as const,
    padding: "10px",
    fontSize: "1rem",
    backgroundColor: "#f0f4f8",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
    outline: "none",
    transition: "border-color 0.3s ease",
    color: "#333",
    overflowX: "hidden" as const,
  },
  placeholder: {
    position: "absolute" as const,
    bottom: "-6px",

    left: "10px",
    color: "#aaa",

    pointerEvents: "none" as const,
    zIndex: 0,
  },
  sub_button: {
    padding: "0.55rem 1.5rem",
    backgroundColor: "#3B82F6",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  analyze_button: {
    padding: "0.55rem 1.5rem",
    background: "linear-gradient(135deg, #FF7E79, #FFD700, #FF69B4)",
    backgroundSize: "200% 200%",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background-size 0.6s ease",
    marginLeft: "1rem",
  },
  aiMessage: {
    color: "#888",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
  },
};

export default MoodTrackingPage;

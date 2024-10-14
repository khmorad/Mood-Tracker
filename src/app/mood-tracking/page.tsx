"use client";

import React, { useState, useEffect, useRef } from "react";
import Layout from "../layout";
import axios from "axios"; // To make API requests

const MoodTrackingPage: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [journal, setJournal] = useState(""); // State for journal input
  const [journalEntries, setJournalEntries] = useState<string[]>([]); // Stores all journal entries
  const [aiResponses, setAiResponses] = useState<string[]>(["How can I help you today?"]); // Stores AI responses
  const [conversation, setConversation] = useState(null); // Stores conversation object
  const [isLoading, setIsLoading] = useState(false); // Loading state for API call
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Error state
  const [isClient, setIsClient] = useState(false);
  const journalInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setJournal(e.currentTarget.textContent || "");
  };

  // Function to make a POST request to the API
  const getGeminiResponse = async (entry: string) => {
    try {
      setIsLoading(true); // Show loading spinner
      setErrorMessage(null); // Clear any previous error messages

      // Client-side log: Sending request to API
      console.log("CLIENT: Sending request to API with message:", entry);
      console.log("CLIENT: Current conversation state:", conversation);

      const response = await axios.post("/api/generate", {
        message: entry,
        conversation: conversation || null,
      });

      // Client-side log: API response received
      console.log("CLIENT: API response received:", response.data);

      const aiResponse = response.data.message;
      setConversation(response.data.conversation); // Save the updated conversation

      return aiResponse;
    } catch (error) {
      console.error("CLIENT: Error getting AI response:", error);
      setErrorMessage("An error occurred while processing your entry."); // Set error message
      return "An error occurred while processing your entry.";
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  const handleSubmit = async () => {
    if (journal.trim()) {
      // Client-side log: User submitted journal entry
      console.log("CLIENT: User submitted journal entry:", journal);

      // Save the journal entry
      setJournalEntries((prevEntries) => [...prevEntries, journal]);

      // Fetch AI response
      const aiResponse = await getGeminiResponse(journal);
      
      // Update AI responses only after receiving the response
      setAiResponses((prevResponses) => [...prevResponses, aiResponse]);

      // Clear the journal input
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

        {/* Display the AI and journal entries */}
        <div style={styles.entriesList}>
          {/* Initial AI Message from aiResponses[0] */}
          <div>
            <p style={styles.aiMessage}>
              <strong>AI:</strong> {aiResponses[0]}
            </p>
          </div>

          {/* Display user entries and AI responses */}
          {journalEntries.map((entry, index) => (
            <div key={index}>
              <p>
                <strong>You:</strong> {entry}
              </p>
              <p style={styles.aiMessage}>
                <strong>AI:</strong> {isLoading ? "(Loading...)" : aiResponses[index + 1] || "(Pending AI response...)"}
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

          {journal === "" && <div style={styles.placeholder}>How are you feeling today?</div>}
        </div>

        <button 
          style={styles.sub_button} 
          onClick={handleSubmit}
          disabled={isLoading || !journal.trim()} // Disable button if loading or input is empty
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
        <button
          style={{
            ...styles.analyze_button,
            backgroundSize: isHovering ? "100% 100%" : "200% 200%", // Change background size on hover
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleSubmit}
          disabled={isLoading || !journal.trim()} // Disable button if loading or input is empty
        >
          Analyze
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
    width: "98%", // Same width as journalWrapper
  },
  journalWrapper: {
    position: "relative" as const,
    width: "100%",
    marginBottom: "0.2rem",
  },
  journalInput: {
    width: "100%",
    minHeight: "10px", // Reasonable initial height
    maxHeight: "200px",
    overflowY: "auto" as const, // Explicitly set the type for overflowY
    padding: "10px",
    fontSize: "1rem",
    backgroundColor: "#f0f4f8",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
    outline: "none",
    transition: "border-color 0.3s ease",
    color: "#333",
    zIndex: 1,
    overflowX: "hidden" as const, // Explicitly set the type for overflowX
  },
  placeholder: {
    position: "absolute" as const,
    top: "10px",
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
    disabled: {
      backgroundColor: "#ccc", // Style for disabled state
    },
  },
  analyze_button: {
    padding: "0.55rem 1.5rem",
    background: "linear-gradient(135deg, #FF7E79, #FFD700, #FF69B4)",
    backgroundSize: "200% 200%", // Set the initial background size
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "background-size 0.6s ease", // Smooth transition for the background
    marginLeft: "1rem",
  },
  aiMessage: {
    color: "#888",
    fontStyle: "italic",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
    fontStyle: "italic",
  }
};

export default MoodTrackingPage;

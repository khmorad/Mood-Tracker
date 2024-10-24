"use client";

import React, { useState, useEffect, useRef } from "react";
import Layout from "../layout";
import axios from "axios"; // To make API requests
import { TypeAnimation } from 'react-type-animation'; // Import the correct component
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown for Markdown rendering

const MoodTrackingPage: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [journal, setJournal] = useState(""); 
  const [journalEntries, setJournalEntries] = useState<string[]>([]); 
  const [aiResponses, setAiResponses] = useState<string[]>(["How can I help you today?"]); 
  const [conversation, setConversation] = useState<any[]>([]); // Stores conversation object as an array
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

  const getGeminiResponse = async (entry: string) => {
    try {
      setIsLoading(true); // Show loading spinner
      setErrorMessage(null); // Clear any previous error messages

      // Build a conversation history to send to the API
      const conversationHistory = [...conversation, { user: entry }];
  
      const response = await axios.post("/api/generate", {
        message: entry,
        conversation: conversationHistory || null,
      });
  
      const aiResponse = response.data.message;
      setConversation([...conversationHistory, { ai: aiResponse }]); // Update conversation state
  
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
        <div style={styles.entriesList}>
          <div>
            <p style={styles.aiMessage}>
              <strong>AI:</strong> 
              <TypeAnimation
                sequence={[
                  aiResponses[0], // Initial AI response
                  1000, // Wait for 1 second
                ]}
                wrapper="span"
                speed={90} // Typing speed
                cursor={false} // Remove the cursor
                repeat={0} // Do not repeat the animation
                style={{ display: 'inline-block' }}
              />
            </p>
          </div>

          {/* Display user entries and AI responses */}
          {journalEntries.map((entry, index) => (
            <div key={index}>
              <p>
                <strong>You:</strong> {entry}
              </p>
              <p style={styles.aiMessage}>
                <strong>AI:</strong> 
                {index === journalEntries.length - 1 && !isLoading ? (
                  // Apply typing animation only to the latest response
                  <TypeAnimation
                    sequence={[
                      aiResponses[index + 1] || "(Pending AI response...)", // AI Response or pending
                      1000, // Wait for 1 second
                    ]}
                    wrapper="span"
                    speed={90} // Typing speed
                    cursor={false} // Remove the cursor
                    repeat={0} // No repetition
                    style={{ display: 'inline-block' }}
                  />
                ) : (
                  // Render previous AI responses using ReactMarkdown
                  <ReactMarkdown>
                    {aiResponses[index + 1] || "(Pending AI response...)"}
                  </ReactMarkdown>
                )}
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
      backgroundColor: "#ccc", 
    },
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
    fontStyle: "italic",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
    fontStyle: "italic",
  }
};

export default MoodTrackingPage;

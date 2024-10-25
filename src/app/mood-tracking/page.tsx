"use client";

import React, { useState, useEffect, useRef } from "react";
import Layout from "../layout";
import axios from "axios";
import { TypeAnimation } from "react-type-animation"; 
import ReactMarkdown from "react-markdown";

const MoodTrackingPage: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [journal, setJournal] = useState(""); 
  const [journalEntries, setJournalEntries] = useState<string[]>([]); 
  const [aiResponses, setAiResponses] = useState<string[]>(["How can I help you today?"]); 
  const [conversation, setConversation] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null); 
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
      setIsLoading(true); 
      setErrorMessage(null); 

      const conversationHistoryString = conversation.map((conv, index) => {
        const userMessage = `User message: ${conv.user || ''}`;
        const aiMessage = `AI response: ${conv.ai || ''}`;
        return `${userMessage}, ${aiMessage}`;
      }).join(' ');

      const combinedEntry = `User message: ${entry}, Previous messages: ${conversationHistoryString}`;

      const response = await axios.post("/api/generate", {
        message: combinedEntry, 
        conversation: conversation || null,
      });

      const aiResponse = response.data.message;
      setConversation([...conversation, { user: entry, ai: aiResponse }]); 
    
      return aiResponse;
    } catch (error) {
      setErrorMessage("An error occurred while processing your entry.");
      return "An error occurred while processing your entry.";
    } finally {
      setIsLoading(false);
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
                sequence={[aiResponses[0], 1000]}
                wrapper="span"
                speed={90}
                cursor={false}
                repeat={0}
                style={{ display: "inline-block" }}
              />
            </p>
          </div>

          {journalEntries.map((entry, index) => (
            <div key={index}>
              <p><strong>You:</strong> {entry}</p>
              <p style={styles.aiMessage}>
                <strong>AI:</strong>
                {index === journalEntries.length - 1 && !isLoading ? (
                  <TypeAnimation
                    sequence={[aiResponses[index + 1] || "(Pending AI response...)", 1000]}
                    wrapper="span"
                    speed={90}
                    cursor={false}
                    repeat={0}
                    style={{ display: "inline-block" }}
                  />
                ) : (
                  <div>
                    <ReactMarkdown>
                      {aiResponses[index + 1]
                        ?.replace(/\* /g, "\n- ") // Ensure markdown bullet points are rendered correctly
                        .trim()}
                    </ReactMarkdown>
                  </div>
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
          disabled={isLoading || !journal.trim()}
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
        <button
          style={{
            ...styles.analyze_button,
            backgroundSize: isHovering ? "100% 100%" : "200% 200%", 
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleSubmit}
          disabled={isLoading || !journal.trim()}
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
    zIndex: 1,
    overflowX: "hidden" as const,
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
  }
};

export default MoodTrackingPage;

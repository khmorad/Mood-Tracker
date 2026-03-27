import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface TypingAnimationProps {
  text: string;
  speed?: number;        // ms per character — lower = faster
  onComplete?: () => void; // fires once when all characters are shown
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 22,
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const completedRef = useRef(false); // guard so onComplete fires exactly once

  useEffect(() => {
    // Reset if text prop changes (e.g. component reused)
    setDisplayText("");
    setCharIndex(0);
    completedRef.current = false;
  }, [text]);

  useEffect(() => {
    if (charIndex < text.length) {
      const id = setTimeout(() => {
        setDisplayText((prev) => prev + text[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(id);
    }

    // All characters shown — call onComplete exactly once
    if (text.length > 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [charIndex, text, speed, onComplete]);

  return <ReactMarkdown>{displayText}</ReactMarkdown>;
};

export default TypingAnimation;

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface TypingAnimationProps {
  text: string;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ text }) => {
  const [renderText, setRenderText] = useState<string>("");
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    if (index < text.length) {
      const timeoutId = setTimeout(() => {
        setRenderText((prev) => prev + text.charAt(index));
        setIndex(index + 1);
      }, 10); 
      //in case speed needs to be changed the lower the number the faster
      return () => clearTimeout(timeoutId);
    }
  }, [index, text]);

  return <ReactMarkdown>{renderText}</ReactMarkdown>;
};

export default TypingAnimation;

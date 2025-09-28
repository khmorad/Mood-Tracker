"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface InteractiveCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  onClick: () => void;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  description,
  icon,
  gradient,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <motion.div
        className="h-64 bg-white/25 backdrop-blur-lg rounded-3xl border border-white/40 p-8 transition-all duration-300"
        animate={{
          backgroundColor: isHovered
            ? "rgba(255, 255, 255, 0.35)"
            : "rgba(255, 255, 255, 0.25)",
          borderColor: isHovered
            ? "rgba(255, 255, 255, 0.6)"
            : "rgba(255, 255, 255, 0.4)",
          boxShadow: isHovered
            ? "0 25px 50px rgba(0, 0, 0, 0.2)"
            : "0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between mb-6">
          <motion.div
            className={`w-14 h-14 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 0.4 }}
          >
            {icon}
          </motion.div>
        </div>

        <motion.h3
          className="text-xl font-bold text-gray-800 mb-4"
          animate={{
            color: isHovered ? "#1f2937" : "#374151",
            x: isHovered ? 4 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h3>

        <motion.p
          className="text-gray-700 text-sm leading-relaxed"
          animate={{
            opacity: isHovered ? 1 : 0.8,
            color: isHovered ? "#4b5563" : "#6b7280",
          }}
          transition={{ duration: 0.3 }}
        >
          {description}
        </motion.p>

        {/* Arrow indicator */}
        <motion.div
          className="absolute bottom-6 right-6 text-gray-600"
          animate={{
            x: isHovered ? 4 : 0,
            opacity: isHovered ? 1 : 0.6,
          }}
          transition={{ duration: 0.3 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default InteractiveCard;

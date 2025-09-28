"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface NavItemProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, title, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.96 }}
    >
      <motion.button
        className="w-full h-32 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex flex-col items-center justify-center gap-4 p-6 transition-all duration-300"
        onClick={onClick}
        animate={{
          backgroundColor: isHovered
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(255, 255, 255, 0.2)",
          borderColor: isHovered
            ? "rgba(255, 255, 255, 0.5)"
            : "rgba(255, 255, 255, 0.3)",
          boxShadow: isHovered
            ? "0 20px 40px rgba(0, 0, 0, 0.15)"
            : "0 8px 20px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-gray-700"
          animate={{
            scale: isHovered ? 1.15 : 1,
            color: isHovered ? "#4f46e5" : "#374151",
          }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <motion.h3
          className="text-sm font-semibold text-gray-800 text-center"
          animate={{
            color: isHovered ? "#1f2937" : "#4b5563",
            y: isHovered ? -2 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h3>
      </motion.button>
    </motion.div>
  );
};

export default NavItem;

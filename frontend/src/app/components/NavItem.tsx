"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface NavItemProps {
  emoji: string;
  title: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ emoji, title, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.button
        className="w-full h-32 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 flex flex-col items-center justify-center gap-4 p-6 transition-all duration-300 hover:shadow-xl hover:bg-white/95"
        onClick={onClick}
        animate={{
          y: isHovered ? -5 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-4xl"
          animate={{
            scale: isHovered ? 1.2 : 1,
            rotate: isHovered ? [0, 10, -10, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {emoji}
        </motion.div>
        <motion.h3
          className="text-lg font-semibold text-gray-800 text-center"
          animate={{
            y: isHovered ? -3 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h3>
      </motion.button>

      {/* Floating elements */}
      <motion.div
        className="absolute -top-2 -right-2 text-xl opacity-60"
        animate={{
          y: isHovered ? [-5, 5, -5] : 0,
          rotate: isHovered ? [0, 10, -10, 0] : 0,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute -bottom-2 -left-2 text-lg opacity-60"
        animate={{
          y: isHovered ? [5, -5, 5] : 0,
          rotate: isHovered ? [0, -10, 10, 0] : 0,
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        💫
      </motion.div>
    </motion.div>
  );
};

export default NavItem;

"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface InteractiveCardProps {
  title: string;
  description: string;
  icon: string;
  onClick?: () => void;
  gradient: string;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  description,
  icon,
  onClick,
  gradient,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02, rotateY: 2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div
        className={`relative overflow-hidden rounded-2xl p-8 h-full bg-white/95 backdrop-blur-md shadow-xl border border-white/30`}
        style={{
          background: `linear-gradient(135deg, ${gradient})`,
        }}
      >
        {/* White overlay for better readability */}
        <div className="absolute inset-0 bg-white/80 rounded-2xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            className="text-6xl mb-6 text-center"
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>

          {/* Title */}
          <motion.h3
            className="text-2xl font-bold text-gray-800 mb-4 text-center"
            animate={{
              y: isHovered ? -3 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>

          {/* Description */}
          <motion.p
            className="text-gray-700 text-center leading-relaxed"
            animate={{
              y: isHovered ? -2 : 0,
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {description}
          </motion.p>
        </div>

        {/* Gradient border effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${gradient})`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
          }}
        />

        {/* Floating Elements */}
        <motion.div
          className="absolute top-4 right-4 text-2xl opacity-60"
          animate={{
            y: isHovered ? [-5, 5, -5] : 0,
            rotate: isHovered ? [0, 10, -10, 0] : 0,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute bottom-4 left-4 text-xl opacity-60"
          animate={{
            y: isHovered ? [5, -5, 5] : 0,
            rotate: isHovered ? [0, -10, 10, 0] : 0,
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          💫
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InteractiveCard;

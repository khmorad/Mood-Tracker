"use client";

import { motion } from "framer-motion";

const SimpleBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200" />

      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 text-4xl"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        💖
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-3xl"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -15, 15, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🌸
      </motion.div>
      <motion.div
        className="absolute bottom-40 left-20 text-5xl"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 20, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-3xl"
        animate={{
          y: [0, 25, 0],
          rotate: [0, -25, 25, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        💫
      </motion.div>

      {/* Animated Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default SimpleBackground;

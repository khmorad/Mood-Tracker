"use client";

import { motion } from "framer-motion";

const Safe3DScene: React.FC = () => {
  const hearts = [
    { id: 1, color: "#ff69b4", delay: 0, duration: 4 },
    { id: 2, color: "#9370db", delay: 1, duration: 5 },
    { id: 3, color: "#87ceeb", delay: 2, duration: 6 },
    { id: 4, color: "#98fb98", delay: 0.5, duration: 4.5 },
    { id: 5, color: "#ffb6c1", delay: 1.5, duration: 5.5 },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 3D Hearts using CSS */}
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute w-16 h-16 rounded-full"
          style={{
            background: `radial-gradient(circle, ${heart.color}40, ${heart.color}20)`,
            boxShadow: `0 0 20px ${heart.color}40`,
            left: `${20 + heart.id * 15}%`,
            top: `${30 + heart.id * 10}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.sin(heart.id) * 30, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            delay: Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

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

export default Safe3DScene;

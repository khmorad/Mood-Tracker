"use client";

import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

const AnimatedHero: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="text-center mb-16 relative z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Logo */}
      <motion.div
        className="mb-8"
        variants={itemVariants}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <motion.div
            className="w-40 h-40 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(236, 72, 153, 0.4)",
                "0 0 0 20px rgba(236, 72, 153, 0)",
                "0 0 0 0 rgba(236, 72, 153, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.span
              className="text-8xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🌸
            </motion.span>
          </motion.div>

          {/* Floating Elements Around Logo */}
          <motion.div
            className="absolute -top-4 -left-4 text-3xl"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute -top-4 -right-4 text-2xl"
            animate={{
              y: [0, 10, 0],
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            💫
          </motion.div>
          <motion.div
            className="absolute -bottom-4 -left-4 text-2xl"
            animate={{
              y: [0, 15, 0],
              rotate: [0, -15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            💖
          </motion.div>
          <motion.div
            className="absolute -bottom-4 -right-4 text-3xl"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🌟
          </motion.div>
        </div>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        className="text-6xl md:text-7xl font-bold text-gray-800 mb-6"
        variants={itemVariants}
      >
        Welcome to Your
        <motion.span
          className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        >
          Magical Safe Space ✨
        </motion.span>
      </motion.h1>

      {/* Animated Description */}
      <motion.p
        className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8"
        variants={itemVariants}
      >
        <TypeAnimation
          sequence={[
            "A gentle place where your feelings are always welcome 💖",
            4000,
            "Every emotion is valid, every step is beautiful progress 🌸",
            4000,
            "You're doing amazing, one day at a time ✨",
            4000,
            "Let's make your mental health journey magical together 💫",
            4000,
          ]}
          wrapper="span"
          speed={40}
          repeat={Infinity}
        />
      </motion.p>

      {/* CTA Button */}
      <motion.div
        className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
        variants={itemVariants}
      >
        <motion.button
          onClick={() => (window.location.href = "/mood-tracking")}
          className="relative overflow-hidden bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white px-10 py-5 rounded-full font-semibold text-xl shadow-2xl"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 20px 40px rgba(236, 72, 153, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            background: [
              "linear-gradient(45deg, #ec4899, #a855f7, #3b82f6)",
              "linear-gradient(45deg, #3b82f6, #ec4899, #a855f7)",
              "linear-gradient(45deg, #a855f7, #3b82f6, #ec4899)",
              "linear-gradient(45deg, #ec4899, #a855f7, #3b82f6)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span className="relative z-10">Start Your Magical Journey 🌸✨</span>
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedHero;

// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Background from "./components/Background";
import NavItem from "./components/NavItem";
import Safe3DScene from "./components/Safe3DScene";
import AnimatedHero from "./components/AnimatedHero";
import InteractiveCard from "./components/InteractiveCard";
import AnimatedBackground from "./components/AnimatedBackground";
import SimpleBackground from "./components/SimpleBackground";
import { motion } from "framer-motion";

const Page: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [useSimpleBackground, setUseSimpleBackground] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check if WebGL is supported
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setUseSimpleBackground(true);
      }
    } catch {
      setUseSimpleBackground(true);
    }
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-40 h-40 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <span className="text-8xl">🌸</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Background />
      <Navbar />
      <div className="min-h-screen relative overflow-hidden mt-10">
        {/* Background */}
        {useSimpleBackground ? <SimpleBackground /> : <AnimatedBackground />}

        {/* 3D Background Scene */}
        {!useSimpleBackground && <Safe3DScene />}

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-16">
          {/* Animated Hero Section */}
          <AnimatedHero />

          {/* Interactive Navigation */}
          <motion.div
            className="max-w-5xl mx-auto mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-4xl font-bold text-center text-gray-800 mb-8"
              variants={itemVariants}
            >
              Choose Your Adventure 💫
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div variants={itemVariants}>
                <NavItem
                  emoji="📊"
                  title="Track Moods"
                  onClick={() => (window.location.href = "/mood-tracking")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NavItem
                  emoji="💡"
                  title="Daily Tips"
                  onClick={() => scrollToSection("tips")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NavItem
                  emoji="🤝"
                  title="Community"
                  onClick={() => scrollToSection("community")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NavItem
                  emoji="🚨"
                  title="Crisis Help"
                  onClick={() => scrollToSection("crisis")}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Interactive Features Grid */}
          <motion.div
            className="max-w-6xl mx-auto mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-5xl font-bold text-center text-gray-800 mb-12"
              variants={itemVariants}
            >
              Magical Tools for Your Journey ✨
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <InteractiveCard
                  title="Mood Tracking"
                  description="Gently track your feelings with our compassionate mood tracker. Understand your patterns and celebrate your progress with love 💖"
                  icon="📊"
                  gradient="from-pink-400 to-purple-500"
                  onClick={() => (window.location.href = "/mood-tracking")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <InteractiveCard
                  title="Crisis Support"
                  description="Immediate access to help when you need it most. Crisis resources and emergency contacts are always available with care 🤗"
                  icon="🚨"
                  gradient="from-red-400 to-pink-500"
                  onClick={() => scrollToSection("crisis")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <InteractiveCard
                  title="Grounding Exercises"
                  description="Quick, gentle exercises to help you stay present and calm during difficult moments. Find your center with love 🌸"
                  icon="🧘"
                  gradient="from-green-400 to-blue-500"
                  onClick={() => scrollToSection("grounding")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <InteractiveCard
                  title="Community Support"
                  description="Connect with others who understand. Share experiences and find support in a safe, loving space full of understanding hearts 💫"
                  icon="🤝"
                  gradient="from-purple-400 to-indigo-500"
                  onClick={() => scrollToSection("community")}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Interactive Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
          </div>

          {/* Enhanced Crisis Support Section */}
          <motion.div
            className="mt-20 bg-white/95 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/30"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="text-center">
              <motion.h3
                className="text-4xl font-bold text-gray-800 mb-4"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Need Some Extra Love? 💖
              </motion.h3>
              <motion.p
                className="text-xl text-gray-600 mb-8"
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Remember, you&apos;re never alone. Help is always available, and
                you deserve support.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.button
                  className="bg-gradient-to-r from-red-400 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Crisis Hotline 🚨
                </motion.button>
                <motion.button
                  className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Emergency Resources 📞
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Page;

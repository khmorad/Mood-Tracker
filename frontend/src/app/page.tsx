// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Lightbulb,
  Users,
  AlertTriangle,
  Heart,
  Flower2,
  Sparkles,
  Phone,
  ArrowRight,
} from "lucide-react";
import Navbar from "./components/Navbar";
import Background from "./components/Background";
import NavItem from "./components/NavItem";
import Safe3DScene from "./components/Safe3DScene";
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
          <div className="w-20 h-20 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Flower2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
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
        staggerChildren: 0.15,
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
        <div className="relative z-10 container mx-auto px-6 py-20">
          {/* Modern Hero Section */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/30"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700 font-medium">
                Your Mental Health Companion
              </span>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Welcome to Your
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Safe Space
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Track your moods, find support, and discover tools for better
              mental health. You&apos;re not alone in this journey.
            </motion.p>

            <motion.button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/mood-tracking")}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Navigation Grid */}
          <motion.div
            className="max-w-4xl mx-auto mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-3xl font-bold text-center text-gray-800 mb-12"
              variants={itemVariants}
            >
              Explore Our Tools
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div variants={itemVariants}>
                <NavItem
                  icon={<BarChart3 className="w-8 h-8" />}
                  title="Track Moods"
                  onClick={() => (window.location.href = "/mood-tracking")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NavItem
                  icon={<Lightbulb className="w-8 h-8" />}
                  title="Daily Tips"
                  onClick={() => scrollToSection("tips")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NavItem
                  icon={<Users className="w-8 h-8" />}
                  title="Community"
                  onClick={() => scrollToSection("community")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <NavItem
                  icon={<AlertTriangle className="w-8 h-8" />}
                  title="Crisis Help"
                  onClick={() => scrollToSection("crisis")}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="max-w-6xl mx-auto mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-4xl font-bold text-center text-gray-800 mb-12"
              variants={itemVariants}
            >
              Tools for Your Wellbeing
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <InteractiveCard
                  title="Mood Tracking"
                  description="Monitor your emotional patterns with our intuitive mood tracker. Gain insights into your mental health journey."
                  icon={<BarChart3 className="w-8 h-8" />}
                  gradient="from-purple-500 to-pink-500"
                  onClick={() => (window.location.href = "/mood-tracking")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <InteractiveCard
                  title="Crisis Support"
                  description="Immediate access to professional help and emergency resources when you need them most."
                  icon={<AlertTriangle className="w-8 h-8" />}
                  gradient="from-red-500 to-orange-500"
                  onClick={() => scrollToSection("crisis")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <InteractiveCard
                  title="Wellness Resources"
                  description="Discover coping strategies, mindfulness exercises, and tools for better mental health."
                  icon={<Heart className="w-8 h-8" />}
                  gradient="from-green-500 to-teal-500"
                  onClick={() => scrollToSection("grounding")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <InteractiveCard
                  title="Community Support"
                  description="Connect with others who understand your journey. Find support in a safe environment."
                  icon={<Users className="w-8 h-8" />}
                  gradient="from-blue-500 to-indigo-500"
                  onClick={() => scrollToSection("community")}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Crisis Support Section */}
          <motion.div
            className="mt-20 bg-white/25 backdrop-blur-lg rounded-3xl p-10 shadow-xl border border-white/40"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="text-center">
              <motion.h3
                className="text-3xl font-bold text-gray-800 mb-4"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Need Immediate Support?
              </motion.h3>
              <motion.p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                Crisis resources and professional help are available 24/7. You
                deserve support and care.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AlertTriangle className="w-5 h-5" />
                  Crisis Hotline
                </motion.button>
                <motion.button
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="w-5 h-5" />
                  Get Help Now
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

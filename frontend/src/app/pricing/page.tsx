"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Flower2,
  Sparkles,
  ArrowRight,
  BarChart3,
  Heart,
  Users,
  Shield,
  Star,
  Zap,
  Crown,
  Check,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Background from "../components/Background";
import PricingCard from "../components/PricingCard";
import AnimatedBackground from "../components/AnimatedBackground";
import SimpleBackground from "../components/SimpleBackground";
import Safe3DScene from "../components/Safe3DScene";
import Footer from "../components/Footer";

const PricingPage: React.FC = () => {
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

  const pricingPlans = [
    {
      title: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with mood tracking",
      features: [
        "Basic mood tracking (3 entries per day)",
        "7-day mood history",
        "Simple mood insights",
        "Basic charts and trends",
      ],
      buttonText: "Get Started Free",
      gradient: "from-gray-500 to-gray-600",
    },
    {
      title: "Plus",
      price: "$4.99",
      period: "month",
      description: "Enhanced tracking and insights for personal growth",
      features: [
        "Unlimited mood tracking",
        "30-day mood history & trends",
        "Advanced mood analytics",
        "Detailed pattern insights",
        "Custom mood categories",
        "Enhanced data visualization",
      ],
      isPopular: true,
      buttonText: "Start 7-Day Free Trial",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Professional",
      price: "$14.99",
      period: "month",
      description: "For therapists and mental health professionals",
      features: [
        "Everything in Plus",
        "Extended data retention",
        "Professional-grade analytics",
        "Advanced reporting tools",
        "Priority support",
        "API access for integrations",
      ],
      buttonText: "Contact Sales",
      gradient: "from-blue-500 to-indigo-500",
    },
  ];

  const features = [
    {
      name: "Daily Mood Entries",
      free: "3 per day",
      premium: "Unlimited",
      professional: "Unlimited",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: "Mood History",
      free: "7 days",
      premium: "30 days",
      professional: "Unlimited",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      name: "Analytics & Charts",
      free: "Basic",
      premium: "Advanced",
      professional: "Professional",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: "Custom Categories",
      free: false,
      premium: true,
      professional: true,
      icon: <Heart className="w-5 h-5" />,
    },
    {
      name: "Data Visualization",
      free: "Basic",
      premium: "Enhanced",
      professional: "Advanced",
      icon: <Sparkles className="w-5 h-5" />,
    },
  ];

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
          {/* Hero Section */}
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
              <Star className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700 font-medium">
                Choose Your Mental Health Journey
              </span>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Simple
              <br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Start free and upgrade when you're ready. All plans include our
              core mood tracking features with no hidden fees.
            </motion.p>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            className="max-w-6xl mx-auto mb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <PricingCard
                    {...plan}
                    onClick={() => {
                      if (plan.title === "Free") {
                        window.location.href = "/mood-tracking";
                      } else if (plan.title === "Professional") {
                        window.location.href = "/contact";
                      } else {
                        window.location.href = "/signup";
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature Comparison */}
          <motion.div
            className="max-w-6xl mx-auto mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
              Feature Comparison
            </h2>

            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/30">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/30">
                      <th className="text-left py-4 px-4 font-semibold text-gray-800">
                        Features
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-800">
                        Free
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-800">
                        Premium
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-800">
                        Professional
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, index) => (
                      <motion.tr
                        key={index}
                        className="border-b border-white/20"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <td className="py-4 px-4 flex items-center gap-3">
                          {feature.icon}
                          <span className="text-gray-700 font-medium">
                            {feature.name}
                          </span>
                        </td>
                        <td className="text-center py-4 px-4">
                          {typeof feature.free === "boolean" ? (
                            feature.free ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-600">
                              {feature.free}
                            </span>
                          )}
                        </td>
                        <td className="text-center py-4 px-4">
                          {typeof feature.premium === "boolean" ? (
                            feature.premium ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-600">
                              {feature.premium}
                            </span>
                          )}
                        </td>
                        <td className="text-center py-4 px-4">
                          {typeof feature.professional === "boolean" ? (
                            feature.professional ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-600">
                              {feature.professional}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center bg-white/25 backdrop-blur-lg rounded-3xl p-10 shadow-xl border border-white/40"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are taking control of their mental
              health. Start with our free plan and upgrade anytime.
            </p>
            <motion.button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/mood-tracking")}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PricingPage;

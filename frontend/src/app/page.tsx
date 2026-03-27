// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Heart,
  Sparkles,
  ArrowRight,
  Shield,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Phone,
} from "lucide-react";
import Navbar from "./components/Navbar";
import Background from "./components/Background";
import SimpleBackground from "./components/SimpleBackground";
import Footer from "./components/Footer";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically imported — avoids SSR issues with Three.js & window refs
const ScrollCanvas = dynamic(() => import("./components/ScrollCanvas"), {
  ssr: false,
});

// ─── TiltCard ─────────────────────────────────────────────────────────────────
// 3D spring-based tilt that follows the mouse
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
const TiltCard: React.FC<TiltCardProps> = ({ children, className, onClick }) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-90, 90], [10, -10]), {
    stiffness: 180,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mx, [-90, 90], [-10, 10]), {
    stiffness: 180,
    damping: 24,
  });
  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.02 }}
      transition={{ scale: { duration: 0.2 } }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left - r.width / 2);
        my.set(e.clientY - r.top - r.height / 2);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const Page: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [webgl, setWebgl] = useState(false);

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.18], [0, -110]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  useEffect(() => {
    setIsClient(true);
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      setWebgl(!!gl);
    } catch {
      setWebgl(false);
    }

  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center">
        <div className="w-20 h-20 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-2xl animate-pulse shadow-xl" />
      </div>
    );
  }

  const marqueeRow1 = [
    { emoji: "😊", label: "Feel Happier" },
    { emoji: "🧘", label: "Stay Calmer" },
    { emoji: "💪", label: "Grow Stronger" },
    { emoji: "✨", label: "Think Clearer" },
    { emoji: "💙", label: "Feel Supported" },
    { emoji: "🎯", label: "Stay Focused" },
    { emoji: "🌱", label: "Build Habits" },
    { emoji: "💭", label: "Know Yourself" },
  ];

  const marqueeRow2 = [
    "Track Daily Moods",
    "Discover Patterns",
    "Understand Triggers",
    "Celebrate Progress",
    "Find Your Support",
    "Build Resilience",
    "One Day at a Time",
    "You Are Not Alone",
  ];

  const features = [
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "Smart Mood Tracking",
      description:
        "Log your emotions daily and watch patterns emerge. Analytics reveal what affects your mood most — helping you make real, lasting changes.",
      gradient: "from-purple-500 to-pink-500",
      glow: "rgba(168,85,247,0.18)",
      href: "/mood-tracking",
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Powerful Analytics",
      description:
        "Beautiful charts and insights that turn raw data into clarity. Understand your emotional cycles and what drives them.",
      gradient: "from-blue-500 to-indigo-500",
      glow: "rgba(99,102,241,0.18)",
      href: "/mood-tracking",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Private & Secure",
      description:
        "Your mental health data is deeply personal. We encrypt everything and never sell your information. Your journey, your data.",
      gradient: "from-emerald-500 to-teal-500",
      glow: "rgba(16,185,129,0.18)",
      href: "/about",
    },
    {
      icon: <Heart className="w-7 h-7" />,
      title: "Crisis Support",
      description:
        "Professional help and emergency resources are one tap away. You are never alone — support is always within reach.",
      gradient: "from-rose-500 to-orange-500",
      glow: "rgba(239,68,68,0.18)",
      href: "#crisis",
    },
  ];

  const steps = [
    {
      number: "01",
      emoji: "✨",
      title: "Create your account",
      description: "Sign up for free in under a minute. No credit card needed.",
    },
    {
      number: "02",
      emoji: "💭",
      title: "Log your first mood",
      description:
        "Track how you feel, add notes, and tag what triggered the emotion.",
    },
    {
      number: "03",
      emoji: "📈",
      title: "Discover your patterns",
      description:
        "After a few days, analytics reveal the trends shaping your emotional health.",
    },
  ];

  return (
    <>
      <Background />
      <Navbar />

      {/* ── Global 3D Background ─────────────────────────────────── */}
      {webgl ? <ScrollCanvas /> : <SimpleBackground />}

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center mt-10 overflow-hidden">
        {/* Parallax wrapper — fades & slides the whole hero on scroll */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 border border-white/35 shadow-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "backOut" }}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-gray-700 font-medium text-sm">
              Your Mental Health Companion
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-6xl md:text-8xl font-extrabold text-gray-800 mb-6 leading-[1.04] tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.3 }}
          >
            Know Your Mind.
            <br />
            <motion.span
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Own Your Health.
            </motion.span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Track your moods, uncover emotional patterns, and take control of
            your mental wellbeing — one day at a time.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <motion.button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-9 py-4 rounded-2xl font-semibold text-lg shadow-xl flex items-center gap-3"
              whileHover={{
                scale: 1.06,
                boxShadow: "0 24px 48px rgba(168,85,247,0.45)",
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => (window.location.href = "/mood-tracking")}
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="bg-white/30 backdrop-blur-md border border-white/50 text-gray-800 px-9 py-4 rounded-2xl font-semibold text-lg shadow-sm"
              whileHover={{
                scale: 1.06,
                backgroundColor: "rgba(255,255,255,0.48)",
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => (window.location.href = "/pricing")}
            >
              View Plans
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          <span className="text-gray-500/80 text-xs tracking-[0.2em] uppercase">
            Scroll
          </span>
          <div className="w-5 h-8 border-2 border-gray-400/50 rounded-full flex items-start justify-center p-1">
            <motion.div
              className="w-1.5 h-2 bg-gray-500/70 rounded-full"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────── */}
      <section className="relative py-8 overflow-hidden bg-black/30 backdrop-blur-md border-y border-white/10">
        {/* Left & right edge fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-black/40 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-black/40 to-transparent z-10" />

        {/* Row 1 — scrolls LEFT — mood pills with emojis */}
        <div className="overflow-hidden mb-4">
          <motion.div
            className="flex whitespace-nowrap gap-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          >
            {[...marqueeRow1, ...marqueeRow1].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/15 rounded-full px-5 py-2 text-white font-semibold text-base shrink-0 cursor-default"
              >
                <span className="text-xl">{item.emoji}</span>
                {item.label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Row 2 — scrolls RIGHT — affirmation text */}
        <div className="overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap gap-8"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
          >
            {[...marqueeRow2, ...marqueeRow2].map((text, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-3 text-white/60 font-medium text-sm tracking-wide shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400/70 shrink-0" />
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="py-28 relative">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Section header */}
          <div className="text-center mb-20">
            <motion.span
              className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              initial={{ opacity: 0, scale: 0.75 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "backOut" }}
            >
              Features
            </motion.span>
            <motion.h2
              className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.1 }}
            >
              Everything you need to thrive
            </motion.h2>
            <motion.p
              className="text-gray-500 text-lg max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.2 }}
            >
              Built for real people dealing with real emotions. Simple,
              powerful, private.
            </motion.p>
          </div>

          {/* Feature cards — alternate slide from left / right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -55 : 55, y: 15 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.72, ease: "easeOut" }}
              >
                <TiltCard
                  className="group relative bg-white/25 backdrop-blur-xl rounded-3xl p-8 border border-white/40 h-full overflow-hidden cursor-pointer"
                  onClick={() => (window.location.href = f.href)}
                >
                  {/* Top glow that appears on hover */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${f.glow}, transparent 65%)`,
                    }}
                  />
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 relative`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 relative">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm relative">
                    {f.description}
                  </p>
                  <motion.div
                    className="absolute bottom-6 right-6"
                    animate={{ x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors duration-300" />
                  </motion.div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-28 relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-20">
            <motion.span
              className="inline-block bg-pink-100 text-pink-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              initial={{ opacity: 0, scale: 0.75 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "backOut" }}
            >
              How It Works
            </motion.span>
            <motion.h2
              className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.1 }}
            >
              Up and running in minutes
            </motion.h2>
            <motion.p
              className="text-gray-500 text-lg max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.2 }}
            >
              No learning curve. Just open the app and start.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Animated connector line */}
            <motion.div
              className="hidden md:block absolute top-8 left-[17%] right-[17%] h-px bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.5, ease: "easeInOut" }}
            />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: i * 0.18 }}
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg relative z-10"
                  whileHover={{ scale: 1.12, rotate: [-4, 4, -4, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-2xl">{step.emoji}</span>
                </motion.div>
                <p className="text-xs font-bold text-purple-400 tracking-[0.18em] uppercase mb-2">
                  {step.number}
                </p>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING CTA ──────────────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-3xl p-14 text-center overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated floating orbs inside the CTA */}
            <motion.div
              className="absolute -top-16 -right-16 w-60 h-60 bg-white/10 rounded-full"
              animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
              transition={{ duration: 4.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-14 -left-14 w-52 h-52 bg-pink-300/20 rounded-full"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.45, 0.75, 0.45] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-6 left-12 w-3 h-3 bg-yellow-200/50 rounded-full"
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-8 right-16 w-4 h-4 bg-white/30 rounded-full"
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 3.2, repeat: Infinity }}
            />

            <div className="relative z-10">
              <motion.h2
                className="text-4xl md:text-5xl font-extrabold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Simple, honest pricing
              </motion.h2>
              <motion.p
                className="text-purple-100 text-lg mb-8 max-w-xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
              >
                Start free forever. Upgrade only when you want more — no
                surprises, no pressure.
              </motion.p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="bg-white text-purple-600 font-bold px-9 py-4 rounded-2xl text-lg shadow-lg"
                  whileHover={{
                    scale: 1.06,
                    boxShadow: "0 20px 40px rgba(255,255,255,0.3)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => (window.location.href = "/pricing")}
                >
                  See All Plans
                </motion.button>
                <motion.button
                  className="bg-white/20 backdrop-blur-md border border-white/40 text-white font-semibold px-9 py-4 rounded-2xl text-lg"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => (window.location.href = "/mood-tracking")}
                >
                  Start for Free
                </motion.button>
              </div>

              <motion.div
                className="mt-8 flex flex-wrap items-center justify-center gap-6 text-purple-100 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                {[
                  "Free plan forever",
                  "No credit card needed",
                  "Cancel anytime",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {item}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CRISIS ───────────────────────────────────────────────── */}
      <section className="pb-24" id="crisis">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div
            className="bg-white/25 backdrop-blur-lg rounded-3xl p-10 shadow-xl border border-white/40 text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.h3
              className="text-3xl font-bold text-gray-800 mb-4"
              animate={{ scale: [1, 1.015, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              Need Immediate Support?
            </motion.h3>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Crisis resources and professional help are available 24/7. You
              deserve support and care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AlertTriangle className="w-5 h-5" />
                Crisis Hotline
              </motion.button>
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-5 h-5" />
                Get Help Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Page;

// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Layout from "./layout";
import NavItem from "./components/NavItem";
import FeatureCard from "./components/FeatureCard";
import { emojiButtonStyles } from "./styles/emojiButtonStyles";
import { TypeAnimation } from "react-type-animation"; // Import the correct component
import Footer from "./components/Footer";
const Page: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) {
    return null;
  }
  return (
    <Layout>
      <div className="relative z-10" style={styles.container}>
        <style>{emojiButtonStyles}</style>

        <nav style={styles.navbar}>
          <NavItem
            emoji="📊"
            title="Track Your Moods"
            onClick={() => (window.location.href = "/mood-tracking")} // Navigate to the new page
          />

          <NavItem
            emoji="💡"
            title="Daily Tips"
            onClick={() => scrollToSection("tips")}
          />
          <NavItem
            emoji="🤝"
            title="Community Support"
            onClick={() => scrollToSection("community")}
          />
          <NavItem
            emoji="🚨"
            title="Emergency Resources"
            onClick={() => scrollToSection("resources")}
          />
        </nav>

        <div id="moods" className="mt-16" style={styles.section}>
          <h1 className="text-4xl font-bold text-center">
            Welcome to the Mood Stabilizer Support App
          </h1>
          <p
            className="text-lg text-gray-600 mt-4 text-center"
            style={styles.description}
          >
            <TypeAnimation
              sequence={[
                "A safe space to help you manage your mental health journey with personalized resources and tools.",
                2000,
                "Navigating with Understanding: A Compassionate Guide for Your Mental Health Journey",
                2000,
                "Supporting You Every Day: Tools, Tips, and Community for Living with BPD",
                2000,
                "Focus on Progress: Your Personalized Guide to Managing BPD with Confidence",
                2000,
              ]}
              wrapper="span"
              speed={70}
              repeat={Infinity}
            />{" "}
          </p>
        </div>

        <div
          className="features-section mt-10"
          style={styles.featuresContainer}
        >
          <FeatureCard
            title="Track Your Moods"
            description="Monitor your mood swings and patterns with our comprehensive mood tracking feature. Log your emotions daily, analyze patterns, and track improvements over time."
            icon="📊"
            id="moods"
          />
          <FeatureCard
            title="Daily Tips"
            description="Receive personalized tips on how to handle difficult emotions and mental health challenges. Daily advice tailored to your mood patterns and mental state."
            icon="💡"
            id="tips"
          />
          <FeatureCard
            title="Community Support"
            description="Connect with others who understand and share similar experiences. Our community support feature enables you to seek advice, share stories, and connect with supportive peers."
            icon="🤝"
            id="community"
          />
          <FeatureCard
            title="Emergency Resources"
            description="Access helpful resources and contacts for when you need immediate support. Crisis lines, helplines, and professional mental health services are just a click away."
            icon="🚨"
            id="resources"
          />
          <FeatureCard
            title="Personalized Insights"
            description="Gain insights into your mental health with analytics based on your mood tracking. Discover patterns, triggers, and progress to better understand your mental journey."
            icon="📈"
            id="insights"
          />
          <FeatureCard
            title="Mindfulness Exercises"
            description="Access a variety of guided mindfulness exercises designed to help you stay grounded and focused. Perfect for moments when you need calm and clarity."
            icon="🧘"
            id="mindfulness"
          />
          <FeatureCard
            title="Goal Setting"
            description="Set and track personal goals to improve your mental health. Create achievable goals, track your progress, and celebrate milestones along the way."
            icon="🎯"
            id="goals"
          />
          <FeatureCard
            title="Resource Library"
            description="Explore a library of articles, videos, and exercises on mental health topics. Find reliable information and tools to empower your mental wellness journey."
            icon="📚"
            id="library"
          />
          <FeatureCard
            title="Sleep Tracker"
            description="Track and improve your sleep patterns with our integrated sleep tracker. Analyze your sleep quality and receive tips to help you rest better."
            icon="🌙"
            id="sleep"
          />
          <FeatureCard
            title="Breathing Exercises"
            description="Practice guided breathing exercises to help manage stress and anxiety. Use these exercises anytime you need a quick relaxation tool."
            icon="🌬️"
            id="breathing"
          />
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

// Scroll to Section
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const styles = {
  body: { background: "linear-gradient(to bottom, #a2c5ff, #d4a6f7)" },
  container: {
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    flexDirection: "column" as const,
    marginTop: "10%",
    marginLeft: "5%",
    marginRight: "5%",
  },
  navbar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "#f8f8f8",
    position: "sticky" as const,
    top: "40px",
    zIndex: 10,
    width: "100%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  section: {
    textAlign: "center" as const,
    marginBottom: "2rem",
  },
  description: {
    fontSize: "18px",
    color: "#666",
  },
  featuresContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "2rem",
    marginTop: "2rem",
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "900px",
    padding: "2rem",
  },
  cta: {
    marginTop: "3rem",
  },
  button: {
    padding: "1rem 2rem",
    borderRadius: "50px",
    backgroundColor: "#3B82F6",
    color: "#fff",
    fontSize: "1.2rem",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};

export default Page;

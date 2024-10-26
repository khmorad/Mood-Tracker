"use client";

import { useEffect, useState } from 'react';
import Layout from './layout';
import NavItem from './components/NavItem';
import FeatureCard from './components/FeatureCard';
import { emojiButtonStyles } from './styles/emojiButtonStyles';
import { TypeAnimation } from 'react-type-animation'; // Import the correct component

const Page: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures that certain content is only rendered on the client
  }, []);

  if (!isClient) {
    return null; // Avoid rendering if it's on the server
  }

  return (
    <Layout>
      <div className="relative z-10" style={styles.container}>
        {/* Inject Emoji Button Styles */}
        <style>{emojiButtonStyles}</style>

        {/* Emoji Mini Navbar */}
        <nav style={styles.navbar}>
        <NavItem
          emoji="📊"
          title="Track Your Moods"
          onClick={() => window.location.href = '/mood-tracking'} // Navigate to the new page
        />

          <NavItem
            emoji="💡"
            title="Daily Tips"
            onClick={() => scrollToSection('tips')}
          />
          <NavItem
            emoji="🤝"
            title="Community Support"
            onClick={() => scrollToSection('community')}
          />
          <NavItem
            emoji="🚨"
            title="Emergency Resources"
            onClick={() => scrollToSection('resources')}
          />
        </nav>

        {/* Main Content */}
        <div id="moods" className="mt-16" style={styles.section}>
          <h1 className="text-4xl font-bold text-center">Welcome to the BPD Support App</h1>
          <p className="text-lg text-gray-600 mt-4 text-center" style={styles.description}>
          <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed out once, initially
        'A safe space to help you manage your mental health journey with personalized resources and tools.',
        2000, // wait 1s before replacing "Mice" with "Hamsters"
        'Navigating BPD with Understanding: A Compassionate Guide for Your Mental Health Journey',
        2000,
        'Supporting You Every Day: Tools, Tips, and Community for Living with BPD',
        2000,
        'Focus on Progress: Your Personalized Guide to Managing BPD with Confidence',
        2000
      ]}
      wrapper="span"
      speed={70}
      
      repeat={Infinity}
    />          </p>
        </div>

        <div className="features-section mt-10" style={styles.featuresContainer}>
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
        </div>

        <div className="cta mt-16 text-center" style={styles.cta}>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-10 rounded-full shadow-lg transition duration-300 transform hover:scale-110"
            style={styles.button}
            onClick={() => console.log('Start Now')}
          >
            Get Started
          </button>
        </div>
      </div>
    </Layout>
  );
};

// Scroll to Section
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const styles = {
  container: {
    boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column' as const,
    marginTop: '20%',
    marginLeft: '5%',
    marginRight: '5%',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f8f8',
    position: 'sticky' as const,
    top: '40px',
    zIndex: 10,
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  section: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  description: {
    fontSize: '18px',
    color: '#666',
  },
  featuresContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2rem',
    marginTop: '2rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '900px',
    padding: '1rem',  
  },
  cta: {
    marginTop: '3rem',
  },
  button: {
    padding: '1rem 2rem',
    borderRadius: '50px',
    backgroundColor: '#3B82F6',
    color: '#fff',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default Page;

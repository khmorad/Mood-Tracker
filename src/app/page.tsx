// src/app/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Layout from './layout';
import NavItem from './components/NavItem';
import FeatureCard from './components/FeatureCard';
import { emojiButtonStyles } from './styles/emojiButtonStyles';

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
            onClick={() => scrollToSection('moods')}
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
        <div id="moods" className="mt-16">
          <h1 className="text-4xl font-bold text-center">Welcome to the BPD Support App</h1>
          <p className="text-lg text-gray-600 mt-4 text-center">
            A safe space to help you manage your mental health journey.
          </p>
        </div>

        <div className="features-section mt-10">
          <FeatureCard
            title="Track Your Moods"
            description="Monitor your mood swings and patterns with our mood tracking feature."
            icon="📊"
            id="moods"
          />
          <FeatureCard
            title="Daily Tips"
            description="Receive personalized tips on how to handle difficult emotions."
            icon="💡"
            id="tips"
          />
          <FeatureCard
            title="Community Support"
            description="Connect with others who understand and share similar experiences."
            icon="🤝"
            id="community"
          />
          <FeatureCard
            title="Emergency Resources"
            description="Access helpful resources and contacts for when you need immediate support."
            icon="🚨"
            id="resources"
          />
        </div>

        <div className="cta mt-16 text-center">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105"
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
    flexDirection: 'column' as 'column',
    marginTop: '9%',
    marginLeft: '2%',
    marginRight: '2%',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f8f8',
    position: 'sticky' as 'sticky',
    top: 0,
    zIndex: 10,
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
};

export default Page;

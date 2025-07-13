"use client";

import React from "react";

const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Meet Our Team
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We&apos;re passionate about leveraging AI to help people stabilize
              their mood and improve their mental well-being. Our team combines
              expertise in technology, psychology, and user experience to create
              meaningful solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <TeamMember
            name="Khashayar Moradpour"
            role="CEO & Founder"
            imageSrc="/employees/ym.webp"
            bio="Visionary leader with a passion for mental health technology. Dedicated to creating AI-powered solutions that make a real difference in people's lives."
            skills={[
              "Leadership",
              "AI/ML",
              "Product Strategy",
              "Mental Health Tech",
            ]}
          />
          <TeamMember
            name="Shizuka Takao"
            role="Software Engineer"
            imageSrc="/employees/st.webp"
            bio="Full-stack developer with expertise in modern web technologies. Focuses on creating intuitive and accessible user experiences."
            skills={["React", "TypeScript", "Node.js", "UI/UX"]}
          />
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white/50 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-8">
              Our Mission
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Innovation
                </h3>
                <p className="text-gray-600">
                  Pioneering AI-driven solutions for mental health and mood
                  stabilization.
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Empathy
                </h3>
                <p className="text-gray-600">
                  Understanding and addressing the real needs of our users with
                  compassion.
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Impact
                </h3>
                <p className="text-gray-600">
                  Creating meaningful change in people&apos;s lives through
                  technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Have questions or want to learn more about our mission? We&apos;d
            love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Contact Us
            </button>
            <button className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamMember: React.FC<{
  name: string;
  role: string;
  imageSrc: string;
  bio: string;
  skills: string[];
}> = ({ name, role, imageSrc, bio, skills }) => {
  return (
    <div className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <img
            src={imageSrc}
            alt={`Profile of ${name}`}
            className="w-32 h-32 rounded-full object-cover shadow-lg group-hover:shadow-xl transition-all duration-300"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
          {name}
        </h3>
        <p className="text-lg text-purple-600 font-semibold mb-4">{role}</p>
        <p className="text-gray-600 leading-relaxed">{bio}</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AboutUsPage;

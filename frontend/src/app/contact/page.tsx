"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Send, HelpCircle, Twitter, Instagram } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimatedBackground from "../components/AnimatedBackground";
import SimpleBackground from "../components/SimpleBackground";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          fullName: "",
          email: "",
          subject: "General Inquiry",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Contact form submission error:", error);
      setSubmitStatus("error");
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen relative overflow-hidden mt-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Background */}
        <SimpleBackground />

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-6xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Get in Touch
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We&apos;re here to help. Whether you have a question, feedback, or need support, please don&apos;t hesitate to reach out.
            </motion.p>
          </motion.div>

          {/* Main Layout */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              className="bg-white/40 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  >
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Billing & Subscription</option>
                    <option>Feedback & Suggestions</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <div>
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
              {submitStatus === "success" && (
                <p className="mt-4 text-center text-green-700 bg-green-100 p-3 rounded-lg">
                  Thank you for your message! We&apos;ll get back to you soon.
                </p>
              )}
              {submitStatus === "error" && (
                <p className="mt-4 text-center text-red-700 bg-red-100 p-3 rounded-lg">
                  Something went wrong. Please try again later.
                </p>
              )}
            </motion.div>

            {/* Alternative Contact Methods */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-4">
                  <a href="mailto:support@moodtracker.com" className="flex items-center gap-4 text-gray-700 hover:text-purple-600 transition-colors">
                    <Mail className="w-6 h-6 text-purple-500" />
                    <span className="font-medium">support@moodtracker.com</span>
                  </a>
                  <div className="flex items-center gap-4">
                    <MessageSquare className="w-6 h-6 text-purple-500" />
                    <div className="font-medium">
                      <p>Follow us on social media:</p>
                      <div className="flex gap-4 mt-2">
                        <a href="#" className="text-gray-500 hover:text-pink-500"><Twitter /></a>
                        <a href="#" className="text-gray-500 hover:text-pink-500"><Instagram /></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Looking for Answers?</h3>
                <p className="text-gray-700 mb-6">
                  Check out our FAQ page for answers to common questions.
                </p>
                <motion.a
                  href="/pricing#faq" // Assuming FAQ is on pricing page
                  className="bg-white text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <HelpCircle className="w-5 h-5" />
                  Visit FAQ
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Crisis Support Disclaimer */}
          <motion.div
            className="mt-20 max-w-4xl mx-auto bg-yellow-100/50 border-2 border-yellow-300 rounded-2xl p-6 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <h4 className="text-xl font-bold text-yellow-800 mb-2">Immediate Support</h4>
            <p className="text-yellow-700">
              If you are in immediate crisis, please do not use this form. Contact a crisis support hotline or emergency services immediately. Your well-being is the top priority.
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;

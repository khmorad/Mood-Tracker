// src/app/components/FeatureCard.tsx
"use client";
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // ensure AOS styles are imported

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  id: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  id,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    AOS.init({
      once: true, // whether animation should happen only once - while scrolling down
      mirror: false, // whether elements should animate out while scrolling past them
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [isHovered]);

  return (
    <div
      data-aos="fade-right"
      id={id}
      style={{
        ...styles.card,
        boxShadow: isHovered
          ? "0px 8px 20px rgba(0, 0, 0, 0.2)"
          : "0px 4px 15px rgba(0, 0, 0, 0.1)",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.iconContainer}>
        <div style={styles.icon}>{icon}</div>
      </div>
      <div style={styles.content}>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.description}>{description}</p>
      </div>
    </div>
  );
};

const styles = {
  card: {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)", 
    transition: "all 0.3s ease",
    cursor: "pointer",
    maxWidth: "350px",
    margin: "0 auto",
  },
  iconContainer: {
    textAlign: "center" as const, 
    marginBottom: "15px",
  },
  icon: {
    fontSize: "3rem",
  },
  content: {
    textAlign: "center" as const,
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  description: {
    fontSize: "1rem",
    color: "#666",
    lineHeight: "1.5",
  },
};

export default FeatureCard;

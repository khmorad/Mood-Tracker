"use client";

import Image from "next/image";
import React, { CSSProperties, useState, useEffect } from "react";
import bpdLogo from "../assets/bpdLogo.png";
import "../styles/NavBar.css";

const EnhancedNavbar: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(
    null
  );

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUser({ firstName: user.first_name, email: user.email });
    }
  }, []);

  const handleMouseEnter = (link: string) => setHovered(link);
  const handleMouseLeave = () => setHovered(null);

  const navigateToLogin = () => {
    window.location.href = "/login";
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.logoWrapper}>
          <button
            onClick={() => (window.location.href = "/")}
            style={styles.logoLink}
          >
            <Image
              style={styles.logo}
              src={bpdLogo}
              alt="BPD Logo"
              width={40}
              height={40}
              priority
            />
          </button>
        </div>

        {/* Centered Navigation Links */}
        <ul style={styles.ul}>
          <li
            style={{
              ...styles.li,
              backgroundColor: hovered === "home" ? "#2d333b" : "transparent",
            }}
            onMouseEnter={() => handleMouseEnter("home")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => (window.location.href = "/")}
              style={styles.link}
            >
              Home
            </button>
          </li>
          <li
            style={{
              ...styles.li,
              backgroundColor: hovered === "about" ? "#2d333b" : "transparent",
            }}
            onMouseEnter={() => handleMouseEnter("about")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => (window.location.href = "/about")}
              style={styles.link}
            >
              About
            </button>
          </li>
          <li
            style={{
              ...styles.li,
              backgroundColor:
                hovered === "contact" ? "#2d333b" : "transparent",
            }}
            onMouseEnter={() => handleMouseEnter("contact")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => (window.location.href = "/contact")}
              style={styles.link}
            >
              Contact
            </button>
          </li>
        </ul>

        {/* User Greeting and Logout Button */}
        {user ? (
          <div style={styles.loginButtonWrapper}>
            <span>Hello, {user.firstName}</span>
            <button onClick={handleLogout} className="button-29">
              Logout
            </button>
          </div>
        ) : (
          <div style={styles.loginButtonWrapper}>
            <button onClick={navigateToLogin} className="button-29">
              Login
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles: { [key: string]: CSSProperties } = {
  nav: {
    backgroundColor: "#0d1117",
    padding: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    position: "fixed",
    width: "100%",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1900px",
    width: "100%",
    margin: "0 auto",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    borderRadius: "10%",
    width: "34px",
    height: "34px",
  },
  logoLink: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  ul: {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    listStyleType: "none",
    margin: 0,
    padding: 0,
    flexGrow: 1,
    textAlign: "center",
  },
  li: {
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    transition: "background-color 0.3s ease",
  },
  link: {
    background: "none",
    border: "none",
    color: "#c9d1d9",
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  loginButtonWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
};

export default EnhancedNavbar;

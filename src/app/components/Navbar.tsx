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
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUser({ firstName: user.first_name, email: user.email });
    }
  }, []);

  const handleMouseEnter = (link: string) => setHovered(link);
  const handleMouseLeave = () => setHovered(null);

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);
  const closeDropdown = () => setDropdownVisible(false);

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

        {/* User Profile Dropdown */}
        {user ? (
          <div style={styles.profileWrapper}>
            <div style={styles.profilePicture} onClick={toggleDropdown}>
              <Image
                src="/default_pfp/default_pfp1.webp"
                alt="User Profile"
                width={40}
                height={40}
                style={{ borderRadius: "50%" }}
              />
            </div>
            <div
              style={{
                ...styles.dropdown,
                opacity: dropdownVisible ? 1 : 0,
                transform: dropdownVisible
                  ? "translateY(0)"
                  : "translateY(-10px)",
                pointerEvents: dropdownVisible ? "auto" : "none",
              }}
            >
              <p style={styles.dropdownItem}>{user.email}</p>
              <button style={styles.dropdownItem} onClick={closeDropdown}>
                Account
              </button>
              <button style={styles.dropdownItem} onClick={handleLogout}>
                Logout
              </button>
            </div>
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
  profileWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginRight: "32px",
  },
  profilePicture: {
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
    padding: "0.5rem 0",
    minWidth: "150px",
    zIndex: 1000,
    transition: "opacity 0.3s ease, transform 0.3s ease",
  },
  dropdownItem: {
    padding: "0.5rem 1rem",
    textAlign: "left",
    color: "#333",
    background: "none",
    border: "none",
    width: "100%",
    textDecoration: "none",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  dropdownItemHover: {
    backgroundColor: "#f0f0f0",
  },
  loginButtonWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
};

export default EnhancedNavbar;

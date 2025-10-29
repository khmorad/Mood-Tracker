"use client";

import Image from "next/image";
import React, { CSSProperties, useState, useEffect } from "react";
import bpdLogo from "../assets/bpdLogo.png";
import "../styles/NavBar.css";
import { jwtDecode } from "jwt-decode";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift()!;
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

const EnhancedNavbar: React.FC = () => {
  type DecodedToken = {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    subscription_tier?: string;
    subscription_expires_at?: string;
    // add other fields as needed...
  };
  const [hovered, setHovered] = useState<string | null>(null);
  const [user, setUser] = useState<{
    firstName: string;
    email: string;
    subscriptionTier?: string;
    subscriptionExpires?: string;
  } | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    // Read JWT from cookie and decode
    const jwt = getCookie("access_token");
    if (jwt) {
      try {
        const decoded: DecodedToken = jwtDecode(jwt);
        setUser({
          firstName: decoded.first_name || "",
          email: decoded.email || "",
          subscriptionTier: decoded.subscription_tier || "Free",
          subscriptionExpires: decoded.subscription_expires_at || undefined,
        });
        console.log("[Navbar] Decoded JWT:", decoded);
      } catch (e) {
        console.error("[Navbar] Failed to decode JWT:", e);
        setUser(null);
      }
    } else {
      setUser(null);
      console.warn("[Navbar] No access_token cookie found.");
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
    // Clear localStorage
    localStorage.removeItem("userInfo");

    // Clear the JWT cookie
    deleteCookie("access_token");

    // Clear user state
    setUser(null);

    // Redirect to login page
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
            <a href="/contact" style={styles.link}>
              Contact
            </a>
          </li>
        </ul>

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

              {/* Subscription Status */}
              <div
                style={{
                  ...styles.dropdownItem,
                  padding: "0.5rem 1rem",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#666" }}>Plan</div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color:
                      user.subscriptionTier === "Free" ? "#666" : "#10b981",
                  }}
                >
                  {user.subscriptionTier || "Free"}
                  {user.subscriptionTier !== "Free" && " ✓"}
                </div>
                {user.subscriptionExpires &&
                  user.subscriptionTier !== "Professional" && (
                    <div style={{ fontSize: "0.7rem", color: "#666" }}>
                      Expires:{" "}
                      {new Date(user.subscriptionExpires).toLocaleDateString()}
                    </div>
                  )}
                {user.subscriptionTier === "Professional" && (
                  <div style={{ fontSize: "0.7rem", color: "#10b981" }}>
                    Lifetime Access
                  </div>
                )}
              </div>

              {/* Upgrade button for Free users */}
              {user.subscriptionTier === "Free" && (
                <button
                  style={{
                    ...styles.dropdownItem,
                    background: "linear-gradient(to right, #8b5cf6, #ec4899)",
                    color: "white",
                    fontWeight: "600",
                  }}
                  onClick={() => {
                    closeDropdown();
                    window.location.href = "/pricing";
                  }}
                >
                  Upgrade Plan
                </button>
              )}

              {/* Change Plan button for Premium users */}
              {user.subscriptionTier !== "Free" && (
                <button
                  style={{
                    ...styles.dropdownItem,
                    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                    color: "white",
                    fontWeight: "600",
                  }}
                  onClick={() => {
                    closeDropdown();
                    window.location.href = "/pricing";
                  }}
                >
                  Change Plan
                </button>
              )}

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

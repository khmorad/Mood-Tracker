"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { CSSProperties, useState } from 'react';
import bpdLogo from '../assets/bpdLogo.png'; // Import your logo

const EnhancedNavbar: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const handleMouseEnter = (link: string) => setHovered(link);
  const handleMouseLeave = () => setHovered(null);

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoWrapper}>
          <Link href="/" style={styles.logoLink}>
            <Image style={styles.logo} src={bpdLogo} alt="BPD Logo" width={40} height={40} />
          </Link>
        </div>

        {/* Centered Navigation Links */}
        <ul style={styles.ul}>
          <li
            style={{
              ...styles.li,
              backgroundColor: hovered === 'home' ? '#2d333b' : 'transparent',
            }}
            onMouseEnter={() => handleMouseEnter('home')}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/" style={styles.link}>
              Home
            </Link>
          </li>
          <li
            style={{
              ...styles.li,
              backgroundColor: hovered === 'about' ? '#2d333b' : 'transparent',
            }}
            onMouseEnter={() => handleMouseEnter('about')}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/about" style={styles.link}>
              About
            </Link>
          </li>
          <li
            style={{
              ...styles.li,
              backgroundColor: hovered === 'contact' ? '#2d333b' : 'transparent',
            }}
            onMouseEnter={() => handleMouseEnter('contact')}
            onMouseLeave={handleMouseLeave}
          >
            <Link href="/contact" style={styles.link}>
              Contact
            </Link>
          </li>
        </ul>

        {/* Login Button on the Right */}
        <div style={styles.loginButtonWrapper}>
          <Link href="/login">
            <button style={styles.loginButton}>Login</button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const styles: { [key: string]: CSSProperties } = {
  nav: {
    backgroundColor: '#0d1117',
    padding: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    position: 'fixed',
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1800px',
    width: '100%',
    margin: '0 auto',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    borderRadius: '10%',
    width: '34px',
    height: '34px',
  },
  logoLink: {
    color: '#58a6ff',
    textDecoration: 'none',
  },
  ul: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    flexGrow: 1, // Allow space between logo and login
    textAlign: 'center',
  },
  li: {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    transition: 'background-color 0.3s ease',
  },
  link: {
    color: '#c9d1d9',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
  },
  loginButtonWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.3s ease',
    outline: 'none',
    marginRight: '30px',
  },
};

export default EnhancedNavbar;

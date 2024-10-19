//src/app/components/Navbar.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image'; // Import Image from Next.js
import React, { CSSProperties, useState } from 'react';
import bpdLogo from '../assets/bpdLogo.png'; // Import your logo

const EnhancedNavbar: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const handleMouseEnter = (link: string) => setHovered(link);
  const handleMouseLeave = () => setHovered(null);

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.logo}>
          <Link href="/" style={styles.logoLink}>
            {/* Use the Image component */}
            <Image style={styles.logo} src={bpdLogo} alt="BPD Logo" width={30} height={30} />
          </Link>
        </div>
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
      </div>
    </nav>
  );
};

const styles: { [key: string]: CSSProperties } = {
  nav: {
    backgroundColor: '#0d1117',
    padding:  '8px',
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
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    borderRadius: '0.375rem',
  },
  logoLink: {
    color: '#58a6ff',
    textDecoration: 'none',
  },
  ul: {
    display: 'flex',
    gap: '1.5rem',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  li: {
    margin: '0',
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
};

export default EnhancedNavbar;

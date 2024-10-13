// components/Navbar.tsx
import Link from 'next/link';
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav style={styles.nav}>
      <ul style={styles.ul}>
        <li style={styles.li}>
          <Link href="/">Home</Link>
        </li>
        <li style={styles.li}>
          <Link href="/about">About</Link>
        </li>
        <li style={styles.li}>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    padding: '1rem',
    backgroundColor: '#333',
  },
  ul: {
    listStyleType: 'none',
    display: 'flex',
    gap: '1rem',
  },
  li: {
    color: '#fff',
  },
};

export default Navbar;

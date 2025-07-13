// src/app/signup/page.tsx

"use client";

import Link from 'next/link';
import styles from '../styles/Auth.module.css';

const Signup = () => {
  return (
    <div className={styles.authContainer}>
      <div className={styles.card}>
        <h1>Create Account</h1>
        <input type="text" placeholder="Name" className={styles.inputField} />
        <input type="email" placeholder="Email" className={styles.inputField} />
        <input type="password" placeholder="Password" className={styles.inputField} />
        <button className={styles.button}>Sign Up</button>
        <Link href="/login">
          <p className={styles.switchLink}>Already have an account? Log In</p>
        </Link>
      </div>
    </div>
  );
};

export default Signup;

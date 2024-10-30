// src/app/login/page.tsx
"use client";
//test
import React, { useState } from 'react';
import styles from '../styles/Auth.module.css';

const Login: React.FC = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.container} ${rightPanelActive ? styles.rightPanelActive : ''}`} id="container">
        {/* Sign Up Form */}
        <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
          <form>
            <h1>Create Account</h1>

            <input type="text" placeholder="Name" className={styles.inputField} /><br></br>
            <input type="email" placeholder="Email" className={styles.inputField} /><br></br>
            <input type="password" placeholder="Password" className={styles.inputField} /><br></br>
            <button type="button" className={styles.button}>Sign Up</button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={`${styles.formContainer} ${styles.signInContainer}`}>
          <form>

            <h1>Sign In</h1>

            <input type="email" placeholder="Email" className={styles.inputField} /><br></br>
            <input type="password" placeholder="Password" className={styles.inputField} /><br></br>
            <div><button type="button" className={styles.button}>Sign In</button></div>

            
            
          </form>
        </div>

        {/* Overlay */}
        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
              <h1>Welcome Back!</h1>
              <p>To keep connected with us, please login with your personal info</p>
              <button className={`${styles.button} ${styles.ghost}`} onClick={() => setRightPanelActive(false)}>Sign In</button>
            </div>
            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
              <h1>Hello, Friend!</h1>
              <p>Enter details and start your journey with us</p>
              <button className={`${styles.button} ${styles.ghost}`} onClick={() => setRightPanelActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

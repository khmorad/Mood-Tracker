"use client";

import React, { useState } from "react";
import styles from "../styles/Auth.module.css";

const Login: React.FC = () => {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    birthdate: "",
  });
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState<string | null>(null);
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "name") {
      // Split the name into first and last name
      const [firstName, ...lastNameParts] = value.split(" ");
      setSignupData({
        ...signupData,
        firstName,
        lastName: lastNameParts.join(" "), // Join remaining parts for last name
      });
    } else {
      setSignupData({
        ...signupData,
        [name]: value,
      });
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSuccess(null);

    const payload = {
      user_id: `U${Date.now()}`, // Generate unique user_id
      email: signupData.email,
      password: signupData.password,
      date_of_birth: signupData.birthdate,
      first_name: signupData.firstName,
      last_name: signupData.lastName,
      diagnosis_status: "Undiagnosed", // Example default
    };

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSignupSuccess("Account created successfully!");
      setSignupData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        birthdate: "",
      });
    } catch (err: unknown) {
      setSignupError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null); // Reset the login error before the new login attempt

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      // Handle successful login here, e.g., storing the returned data in local storage or context
      console.log("Login successful:", data);
    } catch (err: unknown) {
      setLoginError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  return (
    <div className={styles.authContainer}>
      <div
        className={`${styles.container} ${
          rightPanelActive ? styles.rightPanelActive : ""
        }`}
        id="container"
      >
        {/* Sign Up Form */}
        <div className={`${styles.formContainer} ${styles.signUpContainer}`}>
          <form onSubmit={handleSignupSubmit}>
            <h1>Create Account</h1>
            {signupError && <p className={styles.error}>{signupError}</p>}
            {signupSuccess && <p className={styles.success}>{signupSuccess}</p>}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              onChange={handleSignupChange}
              className={styles.inputField}
              required
            />
            <br />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={signupData.email}
              onChange={handleSignupChange}
              className={styles.inputField}
              required
            />
            <br />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signupData.password}
              onChange={handleSignupChange}
              className={styles.inputField}
              required
            />
            <br />
            <input
              type="date"
              name="birthdate"
              placeholder="Birthdate"
              value={signupData.birthdate}
              onChange={handleSignupChange}
              className={styles.inputField}
              required
            />
            <br />
            <button type="submit" className={styles.button}>
              Sign Up
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={`${styles.formContainer} ${styles.signInContainer}`}>
          <form onSubmit={handleLoginSubmit}>
            <h1>Sign In</h1>
            {loginError && <p className={styles.error}>{loginError}</p>}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              className={styles.inputField}
              required
            />
            <br />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              className={styles.inputField}
              required
            />
            <br />
            <button type="submit" className={styles.button}>
              Sign In
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className={styles.overlayContainer}>
          <div className={styles.overlay}>
            <div className={`${styles.overlayPanel} ${styles.overlayLeft}`}>
              <h1>Welcome Back!</h1>
              <p>
                To keep connected with us, please login with your personal info
              </p>
              <button
                className={`${styles.button} ${styles.ghost}`}
                onClick={() => setRightPanelActive(false)}
              >
                Sign In
              </button>
            </div>
            <div className={`${styles.overlayPanel} ${styles.overlayRight}`}>
              <h1>Hello, Friend!</h1>
              <p>Enter details and start your journey with us</p>
              <button
                className={`${styles.button} ${styles.ghost}`}
                onClick={() => setRightPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

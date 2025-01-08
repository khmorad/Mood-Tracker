// components/Footer.tsx
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContainer}>
        <div style={styles.footerLinks}>
          <a href="/about" style={styles.link}>
            About Us
          </a>
          <a href="/contact" style={styles.link}>
            Contact
          </a>
          <a href="/privacy" style={styles.link}>
            Privacy Policy
          </a>
          <a href="/terms" style={styles.link}>
            Terms of Service
          </a>
        </div>

        <p style={styles.copyright}>
          &copy; {new Date().getFullYear()} MSA Support App. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: "#f8f8f8",
    padding: "0.9rem 0",
    boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)",
    marginTop: "2rem",
  },
  footerContainer: {
    maxWidth: "900px",
    margin: "0 auto",
    textAlign: "center" as const,
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    marginBottom: "1rem",
  },
  link: {
    color: "#666",
    textDecoration: "none",
    fontSize: "1rem",
  },
  socialIcons: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  icon: {
    fontSize: "1.5rem",
    textDecoration: "none",
    color: "#666",
  },
  copyright: {
    fontSize: "0.9rem",
    color: "#aaa",
  },
};

export default Footer;

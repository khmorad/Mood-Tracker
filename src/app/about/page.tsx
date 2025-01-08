"use client";

import React from "react";

const AboutUsPage: React.FC = () => {
  return (
    <div className="about-us" style={styles.container}>
      <h1 className="text-4xl font-bold text-center mt-16 mb-6">
        Meet Our Team
      </h1>

      <div className="team-members" style={styles.teamContainer}>
        <TeamMember
          name="Khashayar Moradpour"
          role="CEO"
          imageSrc="/employees/ym.webp" // Replace with actual image path
        />
        <TeamMember
          name="Shizuka Takao"
          role="Software Engineer"
          imageSrc="/employees/st.webp" // Replace with actual image path
        />
      </div>
    </div>
  );
};

const TeamMember: React.FC<{
  name: string;
  role: string;
  imageSrc: string;
}> = ({ name, role, imageSrc }) => {
  return (
    <div className="team-member" style={styles.card}>
      <img src={imageSrc} alt={`Profile of ${name}`} style={styles.image} />
      <div className="info" style={styles.info}>
        <h3 className="name" style={styles.name}>
          {name}
        </h3>
        <p className="role" style={styles.role}>
          {role}
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5%",
    marginLeft: "5%",
    marginRight: "5%",
    padding: "2rem",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
  },
  teamContainer: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-around",
    width: "100%",
    flexWrap: "wrap" as const,
  },
  card: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "1rem",
    margin: "1rem",
  },
  image: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    objectFit: "cover" as const,
  },
  info: {
    textAlign: "center" as const,
    marginTop: "1rem",
  },
  name: {
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  role: {
    fontSize: "1rem",
    color: "#666",
  },
};

export default AboutUsPage;

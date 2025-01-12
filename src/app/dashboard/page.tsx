"use client";

import React, { useRef, useEffect } from 'react';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, BarController, BarElement, ArcElement, PieController, RadarController, PolarAreaController, DoughnutController, RadialLinearScale } from 'chart.js';
import { TypeAnimation } from "react-type-animation"; 
import 'aos/dist/aos.css';
import AOS from 'aos';

// Register required Chart.js components
Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, BarController, BarElement, ArcElement, PieController, RadarController, PolarAreaController, DoughnutController, RadialLinearScale);

const Dashboard: React.FC = () => {
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const pieChartRef = useRef<HTMLCanvasElement | null>(null);
  const radarChartRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutChartRef = useRef<HTMLCanvasElement | null>(null);
  const polarChartRef = useRef<HTMLCanvasElement | null>(null);

  let lineChartInstance: Chart<"line"> | null = null;
  let barChartInstance: Chart<"bar"> | null = null;
  let pieChartInstance: Chart<"pie"> | null = null;
  let radarChartInstance: Chart<"radar"> | null = null;
  let doughnutChartInstance: Chart<"doughnut"> | null = null;
  let polarChartInstance: Chart<"polarArea"> | null = null;

  useEffect(() => {
    AOS.init({ duration: 1000 });

    // Line chart: Mood trend over time
    if (lineChartRef.current) {
      if (lineChartInstance) lineChartInstance.destroy();
      lineChartInstance = new Chart(lineChartRef.current, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Mood Scores",
              data: [4, 3, 5, 4.5, 3.5, 4, 5],
              borderColor: "#6b97f7",
              backgroundColor: "rgba(107, 151, 247, 0.3)",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Mood Trend Over the Week",
            },
            tooltip: {
              enabled: true,
            },
          },
        },
      });
    }

    // Bar chart: Weekly journal entries
    if (barChartRef.current) {
      if (barChartInstance) barChartInstance.destroy();
      barChartInstance = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [
            {
              label: "Number of Entries",
              data: [12, 15, 10, 14],
              backgroundColor: "#f75713",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Weekly Journal Entry Count",
            },
            tooltip: {
              enabled: true,
            },
          },
        },
      });
    }

    // Pie chart: Emotional distribution
    if (pieChartRef.current) {
      if (pieChartInstance) pieChartInstance.destroy();
      pieChartInstance = new Chart(pieChartRef.current, {
        type: "pie",
        data: {
          labels: ["Happy", "Neutral", "Sad", "Angry"],
          datasets: [
            {
              data: [40, 25, 25, 10],
              backgroundColor: ["#6b97f7", "#b9a03b", "#f75713", "#e23e57"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Emotional Distribution",
            },
          },
        },
      });
    }

    // Radar chart: Emotional intensity
    if (radarChartRef.current) {
      if (radarChartInstance) radarChartInstance.destroy();
      radarChartInstance = new Chart(radarChartRef.current, {
        type: "radar",
        data: {
          labels: ["Happy", "Stressed", "Anxious", "Sad", "Angry"],
          datasets: [
            {
              label: "Emotion Intensity",
              data: [3, 4, 2, 5, 4],
              backgroundColor: "rgba(107, 151, 247, 0.3)",
              borderColor: "#6b97f7",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Emotional Intensity Radar",
            },
          },
        },
      });
    }

    // Doughnut chart: Episode flags
    if (doughnutChartRef.current) {
      if (doughnutChartInstance) doughnutChartInstance.destroy();
      doughnutChartInstance = new Chart(doughnutChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Flagged", "Non-Flagged"],
          datasets: [
            {
              data: [10, 30],
              backgroundColor: ["#f75713", "#6b97f7"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Flagged Episodes Distribution",
            },
          },
        },
      });
    }

    // Polar Area chart: Activity frequency
    if (polarChartRef.current) {
      if (polarChartInstance) polarChartInstance.destroy();
      polarChartInstance = new Chart(polarChartRef.current, {
        type: "polarArea",
        data: {
          labels: ["Work", "Exercise", "Socializing", "Meditation", "Other"],
          datasets: [
            {
              data: [10, 12, 8, 5, 3],
              backgroundColor: ["#6b97f7", "#f75713", "#b9a03b", "#e23e57", "#9b59b6"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Activity Frequency",
            },
          },
        },
      });
    }

    return () => {
      if (lineChartInstance) lineChartInstance.destroy();
      if (barChartInstance) barChartInstance.destroy();
      if (pieChartInstance) pieChartInstance.destroy();
      if (radarChartInstance) radarChartInstance.destroy();
      if (doughnutChartInstance) doughnutChartInstance.destroy();
      if (polarChartInstance) polarChartInstance.destroy();
    };
  }, []);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const { first_name, email } = userInfo.user || {};

  return (
    <div className="container" style={{ marginTop: '80px' }}>
<header
  style={{
    backgroundColor: "#fff",
    padding: "20px 30px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
    marginBottom: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "860px", // Same as the content width
    margin: "0 auto",

  }}
>
  <h1
    style={{
      margin: 0,
      fontSize: "1.8rem",
      fontWeight: "bold",
      color: "#333",
    }}
  >
    Analysis Dashboard
  </h1>
  <p
    style={{
      margin: 0,
      fontSize: "1rem",
      color: "#666",
    }}
  >
    Insights from your journaling
  </p>
</header>


      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-evenly', marginTop: '20px', maxWidth: '1000px', margin: '30px auto' }}>
        {[lineChartRef, barChartRef, pieChartRef, radarChartRef, doughnutChartRef, polarChartRef].map((ref, index) => (
          <div key={index} data-aos="fade-up" style={{ width: '250px', height: '200px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', padding: '10px', borderRadius: '8px', background: '#fff' }}>
            <canvas ref={ref} style={{ width: '100%', height: '100%' }} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f7f7f7', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', width: '88%', maxWidth:'890px',margin: '30px auto' }}>
        <h3>Full Analysis</h3>
        <p style={{ color: '#555' }}>
        <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed out once, initially
        '          This section provides a comprehensive analysis of the user’s emotional and behavioral trends based on their journaling and activity records. Current data suggests fluctuations in emotional states across the week, with noticeable trends in specific activities influencing mood positively or negatively. Further insights can be drawn upon analyzing these patterns over extended periods, allowing for more personalized recommendations.',
      ]}
      wrapper="span"
      speed={90}
      
      repeat={1}
    />  
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

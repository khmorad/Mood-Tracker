"use client";

import React, { useRef, useEffect } from 'react';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, BarController, BarElement, ArcElement, PieController, RadarController, PolarAreaController, DoughnutController, RadialLinearScale } from 'chart.js';
import { TypeAnimation } from "react-type-animation"; 

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
    // Line chart
    if (lineChartRef.current) {
      if (lineChartInstance) lineChartInstance.destroy();
      lineChartInstance = new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Daily Scores',
            data: [3, 4, 3.5, 4.5, 5, 4, 4.5],
            borderColor: '#6b97f7',
            backgroundColor: 'rgba(107, 151, 247, 0.3)',
          }],
        },
        options: { responsive: true, plugins: { title: { display: true, text: 'Weekly Journal Scores' }, tooltip: { enabled: true } } },
      });
    }

    // Bar chart
    if (barChartRef.current) {
      if (barChartInstance) barChartInstance.destroy();
      barChartInstance = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Weekly Average Scores',
            data: [3.5, 4, 3.7, 4.2],
            backgroundColor: '#f75713',
          }],
        },
        options: { responsive: true, plugins: { title: { display: true, text: 'Monthly Journal Analysis' }, tooltip: { enabled: true } } },
      });
    }

    // Pie chart
    if (pieChartRef.current) {
      if (pieChartInstance) pieChartInstance.destroy();
      pieChartInstance = new Chart(pieChartRef.current, {
        type: 'pie',
        data: {
          labels: ['Happy', 'Neutral', 'Sad'],
          datasets: [{
            data: [40, 35, 25],
            backgroundColor: ['#6b97f7', '#b9a03b', '#f75713'],
          }],
        },
        options: { responsive: true, plugins: { title: { display: true, text: 'Overall Mood Distribution' }, tooltip: { enabled: true } } },
      });
    }

    // Radar chart
    if (radarChartRef.current) {
      if (radarChartInstance) radarChartInstance.destroy();
      radarChartInstance = new Chart(radarChartRef.current, {
        type: 'radar',
        data: {
          labels: ['Happiness', 'Anxiety', 'Energy', 'Calmness', 'Focus', 'Satisfaction'],
          datasets: [{
            label: 'Emotional States',
            data: [3, 4, 2, 5, 4, 3],
            backgroundColor: 'rgba(107, 151, 247, 0.3)',
            borderColor: '#6b97f7',
          }],
        },
        options: { responsive: true, plugins: { title: { display: true, text: 'Emotional States Radar' } } },
      });
    }

    // Doughnut chart
    if (doughnutChartRef.current) {
      if (doughnutChartInstance) doughnutChartInstance.destroy();
      doughnutChartInstance = new Chart(doughnutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Happy', 'Neutral', 'Sad', 'Angry'],
          datasets: [{
            data: [30, 25, 25, 20],
            backgroundColor: ['#6b97f7', '#b9a03b', '#f75713', '#e23e57'],
          }],
        },
        options: { responsive: true, plugins: { title: { display: true, text: 'Mood Distribution' } } },
      });
    }

    // Polar Area chart
    if (polarChartRef.current) {
      if (polarChartInstance) polarChartInstance.destroy();
      polarChartInstance = new Chart(polarChartRef.current, {
        type: 'polarArea',
        data: {
          labels: ['Work', 'Exercise', 'Meditation', 'Socializing', 'Learning'],
          datasets: [{
            data: [15, 10, 12, 8, 5],
            backgroundColor: ['#6b97f7', '#f75713', '#b9a03b', '#e23e57', '#9b59b6'],
          }],
        },
        options: { responsive: true, plugins: { title: { display: true, text: 'Activity Frequency' } } },
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

  return (
    <div className="container" style={{marginTop: '80px'}}>
      <div style={{boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',maxWidth:'920px', margin:'auto', padding:'.002px', fontSize:'12px'}}>
      <h2>Journal Dashboard</h2>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-evenly', marginTop: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {[lineChartRef, barChartRef, pieChartRef, radarChartRef, doughnutChartRef, polarChartRef].map((ref, index) => (
          <div key={index} style={{ width: '250px', height: '200px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', padding: '10px', borderRadius: '8px', background: '#fff' }}>
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

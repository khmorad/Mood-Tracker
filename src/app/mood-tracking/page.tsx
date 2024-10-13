"use client";

import React, { useState } from 'react';
import Layout from '../layout'; // Adjust the import path based on your structure

const MoodTrackingPage: React.FC = () => {
  const [journal, setJournal] = useState('');

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setJournal(e.currentTarget.textContent || '');
  };

  const handleSubmit = () => {
    // Handle submission of the journaling entry
    console.log('Journal entry:', journal);
    setJournal(''); // Clear the input after submission
  };

  return (
    <Layout>
      <div style={styles.container}>
        <h1>Track Your Moods</h1>
        <div
          contentEditable
          onInput={handleInput}
          style={styles.journalInput}
          placeholder="How are you feeling today?"
          suppressContentEditableWarning={true} // Prevents React warning
        />
        <button style={styles.button} onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    margin: '2rem auto',
    maxWidth: '600px',
  
  },
  journalInput: {
    width: '100%',
    minHeight: '150px',
    padding: '10px',
    fontSize: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f0f4f8',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    color: '#333',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3B82F6',
    color: '#fff',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

export default MoodTrackingPage;

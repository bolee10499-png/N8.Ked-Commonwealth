import React, { useState, useEffect } from 'react';

export default function Dashboard({ user }) {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/workflows', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(d => setWorkflows(d))
      .catch(e => console.error(e));
  }, []);

  const s = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    welcome: { fontSize: '2.5rem', color: '#f00', marginBottom: '2rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
    card: {
      background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(0, 0, 0, 0.5))',
      border: '1px solid rgba(255, 0, 0, 0.2)',
      borderRadius: '12px',
      padding: '2rem',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    createNew: {
      background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(0, 0, 0, 0.7))',
      border: '2px dashed rgba(255, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      color: '#f00'
    }
  };

  return (
    <div style={s.container}>
      <h2 style={s.welcome}>Your Workflows</h2>
      <div style={s.grid}>
        <div
          style={{ ...s.card, ...s.createNew }}
          onClick={() => window.location.hash = 'workflows'}
        >
          +
        </div>
        {workflows.map(wf => (
          <div key={wf.id} style={s.card}>
            <h3 style={{ color: '#f00', marginBottom: '1rem' }}>{wf.name}</h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>{wf.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Copy } from 'lucide-react';

export default function Settings({ user }) {
  const [apiKey] = useState(`dek_${Math.random().toString(36).substr(2, 32)}`);
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const s = {
    container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
    section: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem' },
    keyBox: { background: '#000', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,0,0,0.3)' },
    btn: { background: 'linear-gradient(45deg,#f00,#c00)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }
  };

  return (
    <div style={s.container}>
      <h2 style={{ fontSize: '2rem', color: '#f00', marginBottom: '2rem' }}>Settings</h2>
      <div style={s.section}>
        <h3 style={{ marginBottom: '1rem' }}>Account</h3>
        <p>Email: {user.email}</p>
        <p>Name: {user.name}</p>
      </div>
      <div style={s.section}>
        <h3 style={{ marginBottom: '1rem' }}>API Key</h3>
        <div style={s.keyBox}>
          <code>{apiKey}</code>
          <button style={s.btn} onClick={copyKey}><Copy size={16} /> {copied ? 'Copied!' : 'Copy'}</button>
        </div>
      </div>
    </div>
  );
}
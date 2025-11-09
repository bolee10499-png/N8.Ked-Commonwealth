import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Button, Container } from '@mui/material';
import './App.css';

const LandingPage = ({ onEnter }) => (
  <div className="landing-page">
    <h1 className="title">KIDSEATDEMONS</h1>
    <Button 
      variant="contained" 
      color="error" 
      size="large"
      onClick={onEnter}
      className="enter-button"
    >
      ENTER IF YOU DARE
    </Button>
  </div>
);

const MainApp = () => (
  <div className="main-app">
    <h2>Welcome to the Void</h2>
    {/* Add your app content here */}
  </div>
);

function App() {
  const [showLanding, setShowLanding] = useState(true);

  return (
    <Router>
      <Container>
        {showLanding ? (
          <LandingPage onEnter={() => setShowLanding(false)} />
        ) : (
          <Routes>
            <Route path="*" element={<MainApp />} />
          </Routes>
        )}
      </Container>
    </Router>
  );
}

export default App;

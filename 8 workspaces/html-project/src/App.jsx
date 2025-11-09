import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import AIChat from './components/AIChat';
import WorkflowCanvas from './components/WorkflowCanvas';
import MarketDashboard from './components/MarketDashboard';
import AIVideoStudio from './components/AIVideoStudio';
import Auth from './components/Auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [currentPage, setCurrentPage] = useState('workflows');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const pages = {
    workflows: <WorkflowCanvas user={user} />,
    market: <MarketDashboard user={user} />,
    video: <AIVideoStudio user={user} />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-demon-dark via-black to-demon-dark text-white">
      {showAuth && <Auth onClose={() => setShowAuth(false)} onAuth={setUser} />}
      
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-72 liquid-glass border-r border-demon-red/20"
            >
              <Sidebar
                user={user}
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                onAuthClick={() => setShowAuth(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-auto stack-scroll"
          >
            {user ? pages[currentPage] : (
              <div className="flex items-center justify-center h-full">
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-8 py-4 bg-gradient-to-r from-demon-red to-red-700 rounded-full text-xl font-bold hover-force"
                >
                  Login to Access
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar - AI Chat */}
        <AnimatePresence>
          {chatOpen && user && (
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="w-96 liquid-glass border-l border-demon-red/20"
            >
              <AIChat user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
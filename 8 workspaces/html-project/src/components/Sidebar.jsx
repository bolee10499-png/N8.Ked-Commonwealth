import React from 'react';
import { motion } from 'framer-motion';
import { Workflow, TrendingUp, Video, Settings, LogOut, User } from 'lucide-react';

export default function Sidebar({ user, currentPage, onNavigate, onAuthClick }) {
  const menuItems = [
    { id: 'workflows', icon: Workflow, label: 'Workflow Builder', color: '#f00' },
    { id: 'market', icon: TrendingUp, label: 'Market Analytics', color: '#0ff' },
    { id: 'video', icon: Video, label: 'AI Video Studio', color: '#0f0' }
  ];

  return (
    <div className="h-full flex flex-col p-6">
      {/* Logo */}
      <motion.div
        className="mb-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-demon-red to-red-500 bg-clip-text text-transparent">
          DEMONSEATKIDS
        </h1>
        <p className="text-xs text-gray-500 mt-1">Workflow Automation</p>
      </motion.div>

      {/* User Info */}
      {user ? (
        <div className="mb-6 p-4 rounded-xl liquid-glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-demon-red to-red-700 flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={onAuthClick}
          className="mb-6 w-full py-3 rounded-xl bg-gradient-to-r from-demon-red to-red-700 hover-force font-semibold"
        >
          Login / Sign Up
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                isActive
                  ? 'liquid-glass border border-demon-red/50'
                  : 'hover:bg-white/5'
              }`}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={20} style={{ color: item.color }} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      {user && (
        <div className="space-y-2 mt-4">
          <button className="w-full p-3 rounded-xl hover:bg-white/5 flex items-center gap-3 transition-all">
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full p-3 rounded-xl hover:bg-red-500/20 flex items-center gap-3 transition-all text-red-500"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, Brain, Target, TrendingUp, Settings, 
  Database, Activity, Shield
} from 'lucide-react';

const Navigation = () => {
  return (
    <div className="bg-black text-red-500 p-4 border-b border-red-900">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {[
            { icon: <Zap />, label: 'Workflow', path: '/workflow' },
            { icon: <Brain />, label: 'AI Analysis', path: '/ai' },
            { icon: <Target />, label: 'Strategy', path: '/strategy' },
            { icon: <TrendingUp />, label: 'Market', path: '/market' },
            { icon: <Database />, label: 'Data', path: '/data' },
            { icon: <Activity />, label: 'Monitor', path: '/monitor' },
            { icon: <Shield />, label: 'Security', path: '/security' },
          ].map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className="flex items-center space-x-2 hover:text-red-400 transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <Link to="/settings">
          <Settings className="hover:text-red-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default Navigation;
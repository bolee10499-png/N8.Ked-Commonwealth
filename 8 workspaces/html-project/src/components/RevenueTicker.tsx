import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import analyticsService from '../services/analytics';

interface RevenueData {
  totalRevenue: number;
  activeSubscriptions: number;
  apiCalls: number;
  conversionRate: number;
}

const RevenueTicker: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    apiCalls: 0,
    conversionRate: 0
  });

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchRevenueData();
    const interval = setInterval(fetchRevenueData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch('/api/analytics/revenue', {
        headers: {
          'X-API-Key': process.env.REACT_APP_API_KEY || ''
        }
      });
      const data = await response.json();
      setRevenueData(data);
      
      // Track view
      analyticsService.trackEvent('RevenueDashboardView', {
        revenue: data.totalRevenue
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-red-900 p-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-8">
          <TickerItem
            icon={<DollarSign className="text-green-500" />}
            label="Revenue"
            value={`$${revenueData.totalRevenue.toLocaleString()}`}
            trend="+12.5%"
          />
          <TickerItem
            icon={<Users className="text-blue-500" />}
            label="Subscriptions"
            value={revenueData.activeSubscriptions.toString()}
            trend="+8"
          />
          <TickerItem
            icon={<Activity className="text-purple-500" />}
            label="API Calls"
            value={revenueData.apiCalls.toLocaleString()}
            trend="+1.2K"
          />
          <TickerItem
            icon={<TrendingUp className="text-red-500" />}
            label="Conversion"
            value={`${revenueData.conversionRate.toFixed(1)}%`}
            trend="+2.1%"
          />
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-500 hover:text-red-400 text-sm"
        >
          Hide
        </button>
      </div>
    </div>
  );
};

const TickerItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}> = ({ icon, label, value, trend }) => (
  <div className="flex items-center space-x-2">
    {icon}
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-green-400">{trend}</div>
    </div>
  </div>
);

export default RevenueTicker;
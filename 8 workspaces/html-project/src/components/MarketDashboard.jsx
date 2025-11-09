import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { createChart } from 'lightweight-charts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CRYPTO_SYMBOLS = [
  'BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'UNIUSD', 'AAVEUSD', 'COMPUSD',
  'MKRUSD', 'PENDLEUSD', 'CRVUSD', 'LINKUSD', 'RONUSD', 'ONDOUSD', 'VETUSD',
  'AXSUSD', 'HBARUSD', 'XLMUSD'
];

export default function MarketDashboard({ user }) {
  const [selectedCrypto, setSelectedCrypto] = useState('BTCUSD');
  const [marketData, setMarketData] = useState([]);
  const chartContainerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const data = CRYPTO_SYMBOLS.map(symbol => ({
        symbol,
        price: (Math.random() * 50000 + 1000).toFixed(2),
        change: (Math.random() * 20 - 10).toFixed(2),
        volume: (Math.random() * 1000000).toFixed(0)
      }));
      setMarketData(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: 'transparent' },
        textColor: '#fff'
      },
      grid: {
        vertLines: { color: 'rgba(255, 0, 0, 0.1)' },
        horzLines: { color: 'rgba(255, 0, 0, 0.1)' }
      }
    });

    const series = chart.addAreaSeries({
      topColor: 'rgba(255, 0, 0, 0.4)',
      bottomColor: 'rgba(255, 0, 0, 0.0)',
      lineColor: '#ff0000',
      lineWidth: 2
    });

    const data = Array.from({ length: 100 }, (_, i) => ({
      time: Date.now() / 1000 - (100 - i) * 60,
      value: 40000 + Math.random() * 10000
    }));

    series.setData(data);
    chartRef.current = chart;

    return () => chart.remove();
  }, [selectedCrypto]);

  return (
    <div className="h-full p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-demon-red to-red-500 bg-clip-text text-transparent">
          Market Analytics
        </h2>
        <p className="text-gray-500">Real-time cryptocurrency market data</p>
      </motion.div>

      {/* Crypto Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CRYPTO_SYMBOLS.map(symbol => {
          const data = marketData.find(d => d.symbol === symbol);
          const isActive = selectedCrypto === symbol;

          return (
            <motion.button
              key={symbol}
              onClick={() => setSelectedCrypto(symbol)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl flex-shrink-0 transition-all ${
                isActive
                  ? 'liquid-glass border border-demon-red/50'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="font-bold text-sm">{symbol.replace('USD', '')}</div>
              {data && (
                <div className={`text-xs ${parseFloat(data.change) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {data.change > 0 ? '+' : ''}{data.change}%
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="liquid-glass rounded-2xl p-6"
      >
        <div ref={chartContainerRef} className="w-full" />
      </motion.div>

      {/* Market Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {marketData.slice(0, 6).map((crypto, i) => (
          <motion.div
            key={crypto.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="liquid-glass rounded-xl p-4 hover-force cursor-pointer"
            onClick={() => setSelectedCrypto(crypto.symbol)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">{crypto.symbol.replace('USD', '')}</span>
              {parseFloat(crypto.change) > 0 ? (
                <TrendingUp size={16} className="text-green-500" />
              ) : (
                <TrendingDown size={16} className="text-red-500" />
              )}
            </div>
            <div className="text-2xl font-bold mb-1">${crypto.price}</div>
            <div className={`text-sm ${parseFloat(crypto.change) > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {crypto.change > 0 ? '+' : ''}{crypto.change}%
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
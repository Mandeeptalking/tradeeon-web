import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Play, 
  Pause,
  ExternalLink,
  Wifi,
  WifiOff,
  ArrowRight,
  Bot,
  Link as LinkIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DashboardPage = () => {
  const [isActivityPaused, setIsActivityPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userFirstName, setUserFirstName] = useState('User');
  
  // Mock data
  const connections = [
    { id: 1, name: 'Binance', status: 'connected', lastSync: '2 min ago' },
    { id: 2, name: 'Coinbase Pro', status: 'connected', lastSync: '1 min ago' },
    { id: 3, name: 'Kraken', status: 'error', lastSync: '1 hour ago' },
  ];

  const connectedCount = connections.filter(c => c.status === 'connected').length;
  const hasConnections = connectedCount > 0;
  const runningBots = 3;
  const orders24h = 47;
  const errorRate = 2.1;

  const recentOrders = [
    { time: '14:32:15', broker: 'Binance', symbol: 'BTC/USDT', side: 'BUY', qty: '0.0234', status: 'filled' },
    { time: '14:31:42', broker: 'Coinbase', symbol: 'ETH/USD', side: 'SELL', qty: '2.45', status: 'filled' },
    { time: '14:30:18', broker: 'Binance', symbol: 'ADA/USDT', side: 'BUY', qty: '1500', status: 'submitted' },
    { time: '14:29:55', broker: 'Kraken', symbol: 'DOT/USD', side: 'SELL', qty: '125', status: 'error' },
    { time: '14:28:33', broker: 'Binance', symbol: 'SOL/USDT', side: 'BUY', qty: '15.7', status: 'filled' },
    { time: '14:27:12', broker: 'Coinbase', symbol: 'LINK/USD', side: 'BUY', qty: '89.2', status: 'canceled' },
    { time: '14:26:48', broker: 'Binance', symbol: 'AVAX/USDT', side: 'SELL', qty: '45.8', status: 'filled' },
    { time: '14:25:21', broker: 'Kraken', symbol: 'MATIC/USD', side: 'BUY', qty: '2340', status: 'filled' },
  ];

  const liveActivity = [
    { level: 'info', message: 'BTC/USDT order filled at $48,750', time: '2s ago' },
    { level: 'warn', message: 'High volatility detected on ETH/USD', time: '15s ago' },
    { level: 'info', message: 'DCA bot purchased 0.001 BTC', time: '32s ago' },
    { level: 'error', message: 'Kraken connection timeout', time: '1m ago' },
    { level: 'info', message: 'Grid bot rebalanced SOL position', time: '2m ago' },
    { level: 'info', message: 'Price alert: ADA reached $0.52', time: '3m ago' },
    { level: 'warn', message: 'API rate limit approaching on Binance', time: '4m ago' },
    { level: 'info', message: 'Momentum bot opened LINK position', time: '5m ago' },
  ];

  // Simulate loading
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.first_name) {
          setUserFirstName(user.user_metadata.first_name);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'bg-emerald-500/20 text-emerald-400';
      case 'submitted': return 'bg-blue-500/20 text-blue-400';
      case 'canceled': return 'bg-yellow-500/20 text-yellow-400';
      case 'error': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getActivityIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Welcome Bar Skeleton */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-8 bg-white/10 rounded w-64"></div>
              <div className="h-4 bg-white/10 rounded w-48"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-12 bg-white/10 rounded-xl w-40"></div>
              <div className="h-12 bg-white/10 rounded-xl w-32"></div>
            </div>
          </div>
        </div>

        {/* KPI Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-20"></div>
                  <div className="h-8 bg-white/10 rounded w-16"></div>
                </div>
                <div className="w-8 h-8 bg-white/10 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-8 bg-white/10 rounded w-16"></div>
                <div className="h-6 bg-white/10 rounded-full w-20"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Skeleton */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-32 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-white/10 rounded w-16"></div>
                  <div className="h-4 bg-white/10 rounded w-20"></div>
                  <div className="h-4 bg-white/10 rounded w-24"></div>
                  <div className="h-4 bg-white/10 rounded w-12"></div>
                  <div className="h-4 bg-white/10 rounded w-16"></div>
                  <div className="h-6 bg-white/10 rounded-full w-20"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Skeleton */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 bg-white/10 rounded w-24"></div>
              <div className="w-8 h-8 bg-white/10 rounded"></div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg">
                  <div className="w-4 h-4 bg-white/10 rounded mt-1"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-3 bg-white/10 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Connections Health Skeleton */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-white/10 rounded w-40 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                    <div className="h-4 bg-white/10 rounded w-20"></div>
                  </div>
                  <div className="w-5 h-5 bg-white/10 rounded"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-16"></div>
                    <div className="h-3 bg-white/10 rounded w-24"></div>
                  </div>
                  <div className="w-4 h-4 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Bar */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Welcome back, {userFirstName}
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-medium">Live</span>
              <span className="text-gray-400 text-sm">• last update: now</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/dashboard/connections">
              <button 
                onClick={() => window.location.href = '/dashboard/connections?modal=add'}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 flex items-center transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Connection
              </button>
            </Link>
            <Link to="/dashboard/bots">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center transform hover:scale-105">
                <Bot className="w-5 h-5 mr-2" />
                Create Bot
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Connections */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Connections</p>
              <p className="text-3xl font-bold text-white">{connectedCount}</p>
            </div>
            <LinkIcon className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-8 w-16 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded flex items-end space-x-1 px-1">
              {[3, 5, 4, 7, 6, 8, 7].map((height, i) => (
                <div key={i} className={`bg-blue-400 rounded-sm w-1`} style={{ height: `${height * 3}px` }}></div>
              ))}
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs">+1 today</span>
          </div>
        </div>

        {/* Bots Running */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Bots Running</p>
              <p className="text-3xl font-bold text-white">{runningBots}</p>
            </div>
            <Bot className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm">+2 this week</span>
          </div>
        </div>

        {/* Orders 24h */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Orders (24h)</p>
              <p className="text-3xl font-bold text-white">{orders24h}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm">+12% vs yesterday</span>
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Error Rate (24h)</p>
              <p className="text-3xl font-bold text-white">{errorRate}%</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm">-0.8% improvement</span>
          </div>
        </div>
      </div>

      {/* Quick Start / Next Steps */}
      {!hasConnections ? (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-8">
          <h2 className="text-xl font-bold mb-6 text-center">Get Started in 3 Easy Steps</h2>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <LinkIcon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold mb-2">1. Connect</h3>
              <p className="text-gray-400 text-sm">Link your exchange</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="font-semibold mb-2">2. Create Bot</h3>
              <p className="text-gray-400 text-sm">Set up your strategy</p>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Play className="w-8 h-8" />
              </div>
              <h3 className="font-semibold mb-2">3. Go Live</h3>
              <p className="text-gray-400 text-sm">Start automated trading</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link to="/dashboard/connections">
              <button 
                onClick={() => window.location.href = '/dashboard/connections?modal=add'}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2 inline" />
                Add Your First Connection
              </button>
            </Link>
          </div>
        </div>
      ) : runningBots === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
            <h3 className="text-lg font-bold mb-4">DCA Strategy</h3>
            <p className="text-gray-400 mb-4">Automatically buy at regular intervals to average your cost basis</p>
            <Link to="/dashboard/bots">
              <button className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 w-full">
                Create DCA Bot
              </button>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
            <h3 className="text-lg font-bold mb-4">Webhook Trading</h3>
            <p className="text-gray-400 mb-4">Execute trades based on external signals and alerts</p>
            <Link to="/dashboard/bots">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 w-full">
                Create Webhook Bot
              </button>
            </Link>
          </div>
        </div>
      ) : null}

      {/* Recent Orders & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (Left, Wide) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50 text-left">
                  <th className="py-3 text-gray-400 text-sm">Time</th>
                  <th className="py-3 text-gray-400 text-sm">Broker</th>
                  <th className="py-3 text-gray-400 text-sm">Symbol</th>
                  <th className="py-3 text-gray-400 text-sm">Side</th>
                  <th className="py-3 text-gray-400 text-sm">Qty</th>
                  <th className="py-3 text-gray-400 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-700/30 last:border-b-0 hover:bg-gray-800/30 cursor-pointer transition-colors">
                    <td className="py-3 text-sm text-gray-300">{order.time}</td>
                    <td className="py-3 text-sm text-white">{order.broker}</td>
                    <td className="py-3 text-sm text-white font-medium">{order.symbol}</td>
                    <td className="py-3 text-sm">
                      <span className={`${order.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'} font-medium`}>
                        {order.side}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-white">{order.qty}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity (Right, Narrow) */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Live Activity</h2>
            <button 
              onClick={() => setIsActivityPaused(!isActivityPaused)}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              {isActivityPaused ? (
                <Play className="w-5 h-5 text-emerald-400" />
              ) : (
                <Pause className="w-5 h-5 text-yellow-400" />
              )}
            </button>
          </div>
          <Link to="/dashboard/bots/workspace">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center transform hover:scale-105">
              <TrendingUp className="w-5 h-5 mr-2" />
              Live Workspace
            </button>
          </Link>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {liveActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-lg">
                {getActivityIcon(activity.level)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connections Health */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6">Connections Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <div key={connection.id} className="bg-gray-800/30 rounded-lg p-4 hover:scale-[1.01] transition-transform">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-sm font-bold">
                    {connection.name.charAt(0)}
                  </div>
                  <span className="font-medium">{connection.name}</span>
                </div>
                {connection.status === 'connected' ? (
                  <Wifi className="w-5 h-5 text-emerald-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${connection.status === 'connected' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {connection.status === 'connected' ? 'Connected' : 'Error'}
                  </p>
                  <p className="text-xs text-gray-400">Last sync: {connection.lastSync}</p>
                </div>
                <Link to="/dashboard/connections" className="text-blue-400 hover:text-blue-300 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
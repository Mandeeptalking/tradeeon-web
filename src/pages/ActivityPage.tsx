import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Download, Search, Play, Pause, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ActivityLog {
  id: string;
  ts: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  meta?: Record<string, any>;
}

const ActivityPage = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveMode, setLiveMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'ts' | 'level' | 'message'>('ts');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data
  const mockActivities: ActivityLog[] = [
    {
      id: '1',
      ts: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'BTC/USDT order filled at $48,750',
      meta: { symbol: 'BTC/USDT', price: 48750, qty: 0.0234 }
    },
    {
      id: '2',
      ts: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      level: 'warn',
      message: 'High volatility detected on ETH/USD',
      meta: { symbol: 'ETH/USD', volatility: 12.5 }
    },
    {
      id: '3',
      ts: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'DCA bot purchased 0.001 BTC',
      meta: { bot: 'DCA Strategy', symbol: 'BTC', qty: 0.001 }
    },
    {
      id: '4',
      ts: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      level: 'error',
      message: 'Kraken connection timeout',
      meta: { connection: 'Kraken', error: 'timeout' }
    },
    {
      id: '5',
      ts: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'Grid bot rebalanced SOL position',
      meta: { bot: 'Grid Bot', symbol: 'SOL', action: 'rebalance' }
    },
    {
      id: '6',
      ts: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'Price alert: ADA reached $0.52',
      meta: { symbol: 'ADA', price: 0.52, type: 'price_alert' }
    },
    {
      id: '7',
      ts: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      level: 'warn',
      message: 'API rate limit approaching on Binance',
      meta: { connection: 'Binance', rate_limit: 85 }
    },
    {
      id: '8',
      ts: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      level: 'info',
      message: 'Momentum bot opened LINK position',
      meta: { bot: 'Momentum Bot', symbol: 'LINK', action: 'open' }
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        ts: new Date().toISOString(),
        level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)] as 'info' | 'warn' | 'error',
        message: [
          'New order executed successfully',
          'Market volatility detected',
          'Connection established',
          'Bot strategy updated',
          'Price threshold reached'
        ][Math.floor(Math.random() * 5)],
        meta: { type: 'live_update', timestamp: Date.now() }
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 200));
    }, 10000);

    return () => clearInterval(interval);
  }, [liveMode]);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'warn':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return <CheckCircle className="w-4 h-4" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm === '' || 
      activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.meta && JSON.stringify(activity.meta).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = levelFilter === 'all' || activity.level === levelFilter;
    
    return matchesSearch && matchesLevel;
  });

  // Sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    let aVal: any = a[sortBy];
    let bVal: any = b[sortBy];
    
    if (sortBy === 'ts') {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }
    
    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });

  const handleSort = (column: 'ts' | 'level' | 'message') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Activity
            </h1>
            <p className="text-gray-400 mt-2">Track all your trading activity and system events.</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-pulse">
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 bg-white/10 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Activity
          </h1>
          <p className="text-gray-400 mt-2">Track all your trading activity and system events.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={liveMode}
                onChange={(e) => setLiveMode(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            <span className="flex items-center gap-2 text-sm">
              {liveMode ? (
                <>
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Live</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400">Paused</span>
                </>
              )}
            </span>
          </div>
          <button className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select 
            value={levelFilter} 
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-40 bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
          <button className="bg-gray-800/50 hover:bg-gray-800 border border-gray-600/50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-400">Total Events</p>
          </div>
          <div className="text-2xl font-bold text-white">{filteredActivities.length}</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-400">Info</p>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {filteredActivities.filter(a => a.level === 'info').length}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-400">Warnings</p>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {filteredActivities.filter(a => a.level === 'warn').length}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-400">Errors</p>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {filteredActivities.filter(a => a.level === 'error').length}
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Activity Log</h2>
            <p className="text-gray-400 text-sm">
              {liveMode ? 'Live streaming' : 'Paused'} • Showing latest {Math.min(sortedActivities.length, 200)} events
            </p>
          </div>
          {liveMode && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          )}
        </div>

        {sortedActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📡</div>
            <h3 className="text-xl font-bold mb-2">No activity yet</h3>
            <p className="text-gray-400">System events and trading activity will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th 
                    className="text-left py-3 text-gray-400 cursor-pointer hover:text-white w-24"
                    onClick={() => handleSort('ts')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Time</span>
                      {sortBy === 'ts' && (
                        <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 text-gray-400 cursor-pointer hover:text-white w-20"
                    onClick={() => handleSort('level')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Level</span>
                      {sortBy === 'level' && (
                        <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => handleSort('message')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Message</span>
                      {sortBy === 'message' && (
                        <span className="text-xs">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedActivities.map((activity) => (
                  <tr key={activity.id} className="border-b border-gray-700/30 last:border-b-0 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3">
                      <span className="text-sm font-mono text-gray-400">
                        {new Date(activity.ts).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getLevelColor(activity.level)}`}>
                        {getLevelIcon(activity.level)}
                        <span>{activity.level.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="space-y-1">
                        <p className="text-white font-medium">{activity.message}</p>
                        {activity.meta && Object.keys(activity.meta).length > 0 && (
                          <div className="text-xs text-gray-400 font-mono">
                            {Object.entries(activity.meta).map(([key, val]) => (
                              <span key={key} className="mr-3">
                                {key}: {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
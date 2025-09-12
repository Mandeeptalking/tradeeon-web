import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Activity,
  PieChart,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  X,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Bot,
  ShoppingCart,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calculator,
  Target,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Asset {
  asset: string;
  free: number;
  locked: number;
  total: number;
  value: number;
  price: number;
  change24h: number;
  change7d: number;
  change30d: number;
  avgCost?: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
}

interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  orderType: string;
  limitPrice?: number;
  status: string;
  createdAt: string;
  broker: string;
}

interface Portfolio {
  balances: Asset[];
  openOrders: Order[];
  recentFills: Order[];
}

interface Connection {
  connectionId: string;
  label: string;
  status: 'connected' | 'error' | 'disconnected';
  broker: string;
}

const PortfolioPage = () => {
  const [connections, setConnections] = useState<Connection[]>([
    { connectionId: '1', label: 'Binance Main', status: 'connected', broker: 'Binance' },
    { connectionId: '2', label: 'Coinbase Advanced', status: 'connected', broker: 'Coinbase Advanced' },
    { connectionId: '3', label: 'KuCoin Trading', status: 'connected', broker: 'KuCoin' }
  ]);
  
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('all');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hideDust, setHideDust] = useState(false);
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [sortBy, setSortBy] = useState('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAssetDrawer, setShowAssetDrawer] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [currency, setCurrency] = useState('USD');
  const [groupBy, setGroupBy] = useState('all');
  const [showColumns, setShowColumns] = useState({
    avgCost: true,
    allocation: true,
    change24h: true,
    pnl: true
  });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Enhanced mock data with more realistic values
  const mockPortfolio: Portfolio = {
    balances: [
      { 
        asset: 'BTC', 
        free: 0.5847, 
        locked: 0.0153, 
        total: 0.6, 
        value: 28450.12, 
        price: 47416.87,
        change24h: 2.34,
        change7d: -1.23,
        change30d: 15.67,
        avgCost: 45200.00,
        pnl: 1330.12,
        pnlPercent: 4.9,
        allocation: 42.3
      },
      { 
        asset: 'ETH', 
        free: 12.34, 
        locked: 0.66, 
        total: 13, 
        value: 24692.34, 
        price: 1899.41,
        change24h: -0.87,
        change7d: 3.45,
        change30d: 8.92,
        avgCost: 1850.00,
        pnl: 642.33,
        pnlPercent: 2.7,
        allocation: 36.7
      },
      { 
        asset: 'ADA', 
        free: 15000, 
        locked: 0, 
        total: 15000, 
        value: 7800.00, 
        price: 0.52,
        change24h: 5.23,
        change7d: -2.11,
        change30d: 12.45,
        avgCost: 0.48,
        pnl: 600.00,
        pnlPercent: 8.3,
        allocation: 11.6
      },
      { 
        asset: 'SOL', 
        free: 85, 
        locked: 15, 
        total: 100, 
        value: 7123.00, 
        price: 71.23,
        change24h: 1.45,
        change7d: 7.89,
        change30d: -3.21,
        avgCost: 68.50,
        pnl: 273.00,
        pnlPercent: 4.0,
        allocation: 10.6
      },
      { 
        asset: 'USDT', 
        free: 2450.67, 
        locked: 549.33, 
        total: 3000, 
        value: 3000.00, 
        price: 1.00,
        change24h: 0.01,
        change7d: -0.02,
        change30d: 0.05,
        avgCost: 1.00,
        pnl: 0.00,
        pnlPercent: 0.0,
        allocation: 4.5
      },
      { 
        asset: 'DOT', 
        free: 850, 
        locked: 0, 
        total: 850, 
        value: 6077.50, 
        price: 7.15,
        change24h: -2.34,
        change7d: 4.56,
        change30d: 9.87,
        avgCost: 6.80,
        pnl: 297.50,
        pnlPercent: 5.1,
        allocation: 9.0
      },
      { 
        asset: 'LINK', 
        free: 245, 
        locked: 0, 
        total: 245, 
        value: 3675.00, 
        price: 15.00,
        change24h: 3.21,
        change7d: -1.45,
        change30d: 6.78,
        avgCost: 14.20,
        pnl: 196.00,
        pnlPercent: 5.6,
        allocation: 5.5
      }
    ],
    openOrders: [
      { id: '1', symbol: 'BTC/USDT', side: 'buy', qty: 0.01, orderType: 'limit', limitPrice: 47500, status: 'submitted', createdAt: new Date().toISOString(), broker: 'Binance' },
      { id: '2', symbol: 'ETH/USD', side: 'sell', qty: 2.5, orderType: 'limit', limitPrice: 2050, status: 'partially_filled', createdAt: new Date().toISOString(), broker: 'Coinbase Advanced' },
      { id: '3', symbol: 'ADA/USDT', side: 'buy', qty: 1000, orderType: 'market', status: 'filled', createdAt: new Date().toISOString(), broker: 'Binance' }
    ],
    recentFills: [
      { id: '4', symbol: 'BTC/USDT', side: 'buy', qty: 0.005, orderType: 'market', limitPrice: 47420, status: 'filled', createdAt: new Date(Date.now() - 300000).toISOString(), broker: 'Binance' },
      { id: '5', symbol: 'ETH/USD', side: 'sell', qty: 1.2, orderType: 'limit', limitPrice: 1895, status: 'filled', createdAt: new Date(Date.now() - 600000).toISOString(), broker: 'Coinbase Advanced' },
      { id: '6', symbol: 'SOL/USDT', side: 'buy', qty: 10, orderType: 'market', limitPrice: 71.15, status: 'filled', createdAt: new Date(Date.now() - 900000).toISOString(), broker: 'Binance' }
    ]
  };

  useEffect(() => {
    loadPortfolio();
  }, [selectedConnectionId]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadPortfolio(true);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedConnectionId]);

  const loadPortfolio = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setRefreshing(true);
    }
    
    // Simulate API call
    setTimeout(() => {
      setPortfolio(mockPortfolio);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const handleRefresh = () => {
    loadPortfolio();
  };

  const handleConnectionChange = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setPortfolio(null);
    setLoading(true);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (value: number) => {
    const symbol = currency === 'USD' ? '$' : '';
    return new Intl.NumberFormat('en-US', {
      style: currency === 'USD' ? 'currency' : 'decimal',
      currency: currency === 'USD' ? 'USD' : undefined,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + (currency === 'USDT' ? ' USDT' : '');
  };

  const formatNumber = (value: number, decimals = 8) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-emerald-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-3 h-3" />;
    if (value < 0) return <ArrowDownRight className="w-3 h-3" />;
    return null;
  };

  const getOrderSideColor = (side: string) => {
    return side === 'buy' ? 'text-emerald-400' : 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'partially_filled':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'submitted':
      case 'ready':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'canceled':
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getBrokerIcon = (broker: string) => {
    const colors = {
      'Binance': 'from-yellow-500 to-orange-500',
      'Coinbase Advanced': 'from-blue-500 to-cyan-500',
      'KuCoin': 'from-emerald-500 to-teal-500'
    };
    return colors[broker as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  // Filter and sort balances
  const filteredBalances = portfolio?.balances.filter(balance => {
    if (hideDust && balance.value < 5) return false;
    if (hideZeroBalances && balance.total === 0) return false;
    if (searchTerm && !balance.asset.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const aVal = a[sortBy as keyof Asset] as number;
    const bVal = b[sortBy as keyof Asset] as number;
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  }) || [];

  // Calculate totals
  const totalValue = portfolio?.balances.reduce((sum, balance) => sum + balance.value, 0) || 0;
  const totalPnL = portfolio?.balances.reduce((sum, balance) => sum + balance.pnl, 0) || 0;
  const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;
  const cashAvailable = portfolio?.balances.filter(b => ['USDT', 'USDC', 'USD'].includes(b.asset)).reduce((sum, balance) => sum + balance.value, 0) || 0;
  const totalAssets = filteredBalances.length;
  const openOrdersCount = portfolio?.openOrders.length || 0;

  const timeframes = [
    { value: '1h', label: '1H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '1y', label: '1Y' },
    { value: 'all', label: 'ALL' }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-white/10 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded w-64 animate-pulse"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 bg-white/10 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-white/10 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Controls Skeleton */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-pulse">
          <div className="flex flex-wrap gap-4">
            <div className="h-10 bg-white/10 rounded w-40"></div>
            <div className="h-10 bg-white/10 rounded w-32"></div>
            <div className="h-10 bg-white/10 rounded w-48"></div>
            <div className="h-10 bg-white/10 rounded flex-1 max-w-xs"></div>
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-white/10 rounded w-20"></div>
                  <div className="h-8 bg-white/10 rounded w-24"></div>
                </div>
                <div className="w-8 h-8 bg-white/10 rounded"></div>
              </div>
              <div className="h-4 bg-white/10 rounded w-32"></div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-32 mb-6"></div>
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                  <div className="h-4 bg-white/10 rounded w-16"></div>
                  <div className="h-4 bg-white/10 rounded w-20"></div>
                  <div className="h-4 bg-white/10 rounded w-24"></div>
                  <div className="h-4 bg-white/10 rounded w-20"></div>
                  <div className="h-4 bg-white/10 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-white/10 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (connections.filter(c => c.status === 'connected').length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Portfolio
            </h1>
            <p className="text-gray-400 mt-2">Track your holdings and live performance</p>
          </div>
        </div>
        
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔌</div>
          <h3 className="text-xl font-bold mb-2">No connections available</h3>
          <p className="text-gray-400 mb-6">You need to connect an exchange first to view your portfolio</p>
          <button 
            onClick={() => window.location.href = '/connections'}
            className="bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
          >
            Add Connection
          </button>
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
            Portfolio
          </h1>
          <p className="text-gray-400 mt-2">Track your holdings and live performance</p>
          <div className="flex items-center space-x-2 mt-3">
            <div className="flex items-center space-x-2 bg-emerald-500/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-medium">Live</span>
            </div>
            <span className="text-gray-400 text-sm">Last sync: now</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${autoRefresh ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-gray-700/50 text-gray-400'}`}
          >
            {autoRefresh ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Connection Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Connection:</span>
            <div className="flex space-x-1 bg-gray-800/30 p-1 rounded-lg">
              <button
                onClick={() => setSelectedConnectionId('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  selectedConnectionId === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                All
              </button>
              {connections.filter(c => c.status === 'connected').map((connection) => (
                <button
                  key={connection.connectionId}
                  onClick={() => setSelectedConnectionId(connection.connectionId)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    selectedConnectionId === connection.connectionId
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {connection.broker}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Switch */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Currency:</span>
            <div className="flex space-x-1 bg-gray-800/30 p-1 rounded-lg">
              {['USD', 'USDT'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    currency === curr
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Timeframe:</span>
            <div className="flex space-x-1 bg-gray-800/30 p-1 rounded-lg">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    timeframe === tf.value
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Equity</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-16 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded flex items-end space-x-1 px-1">
              {[3, 5, 4, 7, 6, 8, 7, 9, 6, 8].map((height, i) => (
                <div key={i} className={`bg-blue-400 rounded-sm w-1`} style={{ height: `${height * 2}px` }}></div>
              ))}
            </div>
            <span className="text-xs text-gray-400">Portfolio value</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">P&L ({timeframe})</p>
              <div className="flex items-center space-x-2">
                <p className={`text-3xl font-bold ${getChangeColor(totalPnL)}`}>
                  {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                </p>
                {getChangeIcon(totalPnL)}
              </div>
            </div>
            <TrendingUp className={`w-8 h-8 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${
            totalPnL >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {formatPercent(totalPnLPercent)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Cash Available</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(cashAvailable)}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-gray-400 text-sm">Ready to trade</p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Assets</p>
              <p className="text-3xl font-bold text-white">{totalAssets}</p>
            </div>
            <PieChart className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm">Diversified</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Holdings</h2>
              <p className="text-gray-400 text-sm">Your asset positions and performance</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setHideDust(!hideDust)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  hideDust ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-700/50 text-gray-400 hover:text-white'
                }`}
              >
                <EyeOff className="w-4 h-4 mr-1 inline" />
                Hide Dust
              </button>
              
              <button
                onClick={() => setHideZeroBalances(!hideZeroBalances)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  hideZeroBalances ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-700/50 text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4 mr-1 inline" />
                Hide Zero
              </button>

              <button className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>

          {filteredBalances.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-bold mb-2">No assets found</h3>
              <p className="text-gray-400">Try adjusting your filters or add some assets</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-3 text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('asset')}>
                      <div className="flex items-center space-x-1">
                        <span>Asset</span>
                        {sortBy === 'asset' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                      </div>
                    </th>
                    <th className="text-right py-3 text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('total')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Amount</span>
                        {sortBy === 'total' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                      </div>
                    </th>
                    {showColumns.avgCost && (
                      <th className="text-right py-3 text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('avgCost')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Avg Cost</span>
                          {sortBy === 'avgCost' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                        </div>
                      </th>
                    )}
                    <th className="text-right py-3 text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Price</span>
                        {sortBy === 'price' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                      </div>
                    </th>
                    <th className="text-right py-3 text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('value')}>
                      <div className="flex items-center justify-end space-x-1">
                        <span>Value</span>
                        {sortBy === 'value' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                      </div>
                    </th>
                    {showColumns.pnl && (
                      <th className="text-right py-3 text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('pnl')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>P&L</span>
                          {sortBy === 'pnl' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                        </div>
                      </th>
                    )}
                    {showColumns.allocation && (
                      <th className="text-right py-3 text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('allocation')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>Alloc %</span>
                          {sortBy === 'allocation' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                        </div>
                      </th>
                    )}
                    {showColumns.change24h && (
                      <th className="text-right py-3 text-gray-400 cursor-pointer hover:text-white" onClick={() => handleSort('change24h')}>
                        <div className="flex items-center justify-end space-x-1">
                          <span>24h</span>
                          {sortBy === 'change24h' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                        </div>
                      </th>
                    )}
                    <th className="text-right py-3 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBalances.map((balance) => (
                    <tr 
                      key={balance.asset} 
                      className="border-b border-gray-700/30 last:border-b-0 hover:bg-gray-800/30 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedAsset(balance);
                        setShowAssetDrawer(true);
                      }}
                    >
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-sm font-bold">
                            {balance.asset.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-medium text-white">{balance.asset}</span>
                            <div className="text-xs text-gray-400">{balance.asset}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4">
                        <div className="text-white font-mono">{formatNumber(balance.total)}</div>
                        <div className="text-xs text-gray-400">
                          Free: {formatNumber(balance.free)} | Locked: {formatNumber(balance.locked)}
                        </div>
                      </td>
                      {showColumns.avgCost && (
                        <td className="text-right py-4 text-gray-400 font-mono">
                          {balance.avgCost ? formatCurrency(balance.avgCost) : '—'}
                        </td>
                      )}
                      <td className="text-right py-4 text-white font-mono">{formatCurrency(balance.price)}</td>
                      <td className="text-right py-4 text-white font-semibold">{formatCurrency(balance.value)}</td>
                      {showColumns.pnl && (
                        <td className="text-right py-4">
                          <div className={`font-semibold ${getChangeColor(balance.pnl)}`}>
                            {balance.pnl >= 0 ? '+' : ''}{formatCurrency(balance.pnl)}
                          </div>
                          <div className={`text-xs ${getChangeColor(balance.pnlPercent)}`}>
                            {formatPercent(balance.pnlPercent)}
                          </div>
                        </td>
                      )}
                      {showColumns.allocation && (
                        <td className="text-right py-4 text-white font-mono">{balance.allocation.toFixed(1)}%</td>
                      )}
                      {showColumns.change24h && (
                        <td className="text-right py-4">
                          <div className={`flex items-center justify-end space-x-1 ${getChangeColor(balance.change24h)}`}>
                            {getChangeIcon(balance.change24h)}
                            <span className="font-medium">{formatPercent(balance.change24h)}</span>
                          </div>
                        </td>
                      )}
                      <td className="text-right py-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAsset(balance);
                            setShowAssetDrawer(true);
                          }}
                          className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Open Orders */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Open Orders</h2>
                <p className="text-gray-400 text-sm">{openOrdersCount} active orders</p>
              </div>
            </div>

            {portfolio?.openOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-gray-400 text-sm">No open orders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {portfolio?.openOrders.map((order) => (
                  <div key={order.id} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{order.symbol}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getBrokerIcon(order.broker)}`}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`font-medium ${getOrderSideColor(order.side)}`}>
                          {order.side.toUpperCase()}
                        </span>
                        <span className="text-gray-300 font-mono">{formatNumber(order.qty, 4)}</span>
                        <span className="text-gray-300 capitalize">{order.orderType}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono text-sm">
                          {order.limitPrice ? formatCurrency(order.limitPrice) : 'Market'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Fills */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Recent Fills</h2>
                <p className="text-gray-400 text-sm">Latest executed trades</p>
              </div>
            </div>

            {portfolio?.recentFills.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">📈</div>
                <p className="text-gray-400 text-sm">No recent fills</p>
              </div>
            ) : (
              <div className="space-y-3">
                {portfolio?.recentFills.map((fill) => (
                  <div key={fill.id} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{fill.symbol}</span>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(fill.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className={`font-medium ${getOrderSideColor(fill.side)}`}>
                          {fill.side.toUpperCase()}
                        </span>
                        <span className="text-gray-300 font-mono">{formatNumber(fill.qty, 4)}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono text-sm">
                          {formatCurrency(fill.limitPrice || 0)}
                        </div>
                        <div className="text-xs text-gray-400">{fill.broker}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Drawer */}
      {showAssetDrawer && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-end z-50">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border-l border-gray-700/50 h-full w-full max-w-lg p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-lg font-bold">
                  {selectedAsset.asset.substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedAsset.asset}</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-semibold">{formatCurrency(selectedAsset.price)}</span>
                    <div className={`flex items-center space-x-1 ${getChangeColor(selectedAsset.change24h)}`}>
                      {getChangeIcon(selectedAsset.change24h)}
                      <span className="text-sm font-medium">{formatPercent(selectedAsset.change24h)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowAssetDrawer(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mini Chart Placeholder */}
            <div className="bg-gray-800/30 rounded-xl p-6 mb-6">
              <div className="h-32 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Price Chart ({timeframe})</p>
                </div>
              </div>
            </div>

            {/* Position Details */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-bold">Position Details</h3>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Available</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedAsset.free)} {selectedAsset.asset}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Locked</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedAsset.locked)} {selectedAsset.asset}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className="text-lg font-semibold">{formatNumber(selectedAsset.total)} {selectedAsset.asset}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Value</p>
                    <p className="text-lg font-semibold text-emerald-400">{formatCurrency(selectedAsset.value)}</p>
                  </div>
                  {selectedAsset.avgCost && (
                    <>
                      <div>
                        <p className="text-gray-400 text-sm">Avg Cost</p>
                        <p className="text-lg font-semibold">{formatCurrency(selectedAsset.avgCost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">P&L</p>
                        <div className={`text-lg font-semibold ${getChangeColor(selectedAsset.pnl)}`}>
                          {selectedAsset.pnl >= 0 ? '+' : ''}{formatCurrency(selectedAsset.pnl)}
                          <div className="text-sm">{formatPercent(selectedAsset.pnlPercent)}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-bold">Performance</h3>
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">24h Change</span>
                    <div className={`flex items-center space-x-1 ${getChangeColor(selectedAsset.change24h)}`}>
                      {getChangeIcon(selectedAsset.change24h)}
                      <span className="font-medium">{formatPercent(selectedAsset.change24h)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">7d Change</span>
                    <div className={`flex items-center space-x-1 ${getChangeColor(selectedAsset.change7d)}`}>
                      {getChangeIcon(selectedAsset.change7d)}
                      <span className="font-medium">{formatPercent(selectedAsset.change7d)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">30d Change</span>
                    <div className={`flex items-center space-x-1 ${getChangeColor(selectedAsset.change30d)}`}>
                      {getChangeIcon(selectedAsset.change30d)}
                      <span className="font-medium">{formatPercent(selectedAsset.change30d)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Allocation</span>
                    <span className="font-medium text-white">{selectedAsset.allocation.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mb-6">
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center">
                <Bot className="w-4 h-4 mr-2" />
                Create Bot
              </button>
              <button className="flex-1 bg-gray-700/50 hover:bg-gray-700 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Test Order
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <Target className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <div className="text-sm text-gray-400">Market Cap Rank</div>
                <div className="font-semibold">#1</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                <Calculator className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                <div className="text-sm text-gray-400">Volatility</div>
                <div className="font-semibold">Medium</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
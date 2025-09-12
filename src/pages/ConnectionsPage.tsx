import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { 
  Link as LinkIcon, 
  Wifi, 
  WifiOff, 
  Plus, 
  Settings, 
  Search,
  MoreVertical,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  Trash2,
  RotateCcw,
  FileText,
  Edit3,
  TestTube,
  ExternalLink,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ConnectExchangeModal from '../components/ConnectExchangeModal';

interface Connection {
  id: string;
  name: string;
  exchange: string;
  region: string;
  status: 'healthy' | 'warning' | 'error' | 'revoked';
  balance: string;
  activePairs: number;
  latency?: number;
  lastSync: string;
  lastTest: string;
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string;
  label?: string;
  errorMessage?: string;
  dryRun: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
  value: number;
  price: number;
  change24h: number;
}

interface Portfolio {
  balances: Balance[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
}

const ConnectionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState(false);

  // Mock data
  const mockConnections: Connection[] = [
    { 
      id: '1', 
      name: 'Binance Main', 
      exchange: 'BINANCE',
      region: 'com',
      status: 'healthy', 
      balance: '$23,456.78', 
      activePairs: 45,
      latency: 12,
      lastSync: '2 min ago',
      lastTest: '5 min ago',
      apiKey: 'abc123***',
      apiSecret: 'def456***',
      label: 'Main Trading Account',
      dryRun: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    { 
      id: '2', 
      name: 'Binance US', 
      exchange: 'BINANCE',
      region: 'us',
      status: 'warning', 
      balance: '$12,789.34', 
      activePairs: 28,
      latency: 18,
      lastSync: '5 min ago',
      lastTest: '10 min ago',
      apiKey: 'xyz789***',
      apiSecret: 'uvw012***',
      label: 'US Compliance Account',
      dryRun: false,
      errorMessage: 'Rate limit approaching',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString()
    },
    { 
      id: '3', 
      name: 'Binance Testnet', 
      exchange: 'BINANCE',
      region: 'testnet',
      status: 'healthy', 
      balance: '$100,000.00', 
      activePairs: 15,
      latency: 25,
      lastSync: '1 min ago',
      lastTest: '3 min ago',
      apiKey: 'test123***',
      apiSecret: 'test456***',
      label: 'Testing Environment',
      dryRun: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString()
    },
    { 
      id: '4', 
      name: 'Binance Error', 
      exchange: 'BINANCE',
      region: 'com',
      status: 'error', 
      balance: '$0.00', 
      activePairs: 0,
      lastSync: '1 hour ago',
      lastTest: '1 hour ago',
      errorMessage: 'IP not whitelisted',
      apiKey: 'err123***',
      apiSecret: 'err456***',
      label: 'Failed Connection',
      dryRun: false,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const mockPortfolio: Portfolio = {
    balances: [
      { asset: 'BTC', free: 0.5847, locked: 0.0153, total: 0.6, value: 28450.12, price: 47416.87, change24h: 2.34 },
      { asset: 'ETH', free: 12.34, locked: 0.66, total: 13, value: 24692.34, price: 1899.41, change24h: -0.87 },
      { asset: 'USDT', free: 2450.67, locked: 549.33, total: 3000, value: 3000.00, price: 1.00, change24h: 0.01 },
      { asset: 'ADA', free: 15000, locked: 0, total: 15000, value: 7800.00, price: 0.52, change24h: 5.23 },
      { asset: 'SOL', free: 85, locked: 15, total: 100, value: 7123.00, price: 71.23, change24h: 1.45 }
    ],
    totalValue: 71065.46,
    totalPnL: 2156.78,
    totalPnLPercent: 3.13
  };

  // Handle deep linking
  useEffect(() => {
    const modal = searchParams.get('modal');
    const connectionId = searchParams.get('connectionId');
    const status = searchParams.get('status');
    const region = searchParams.get('region');

    if (modal === 'add') {
      setShowConnectModal(true);
    }

    if (connectionId) {
      const connection = connections.find(c => c.id === connectionId);
      if (connection) {
        setSelectedConnection(connection);
        setShowDetailDrawer(true);
      }
    }

    if (status) {
      setStatusFilter(status);
    }

    if (region) {
      setRegionFilter(region);
    }
  }, [searchParams, connections]);

  // Load connections
  useEffect(() => {
    loadConnections();
  }, []);

  // Filter connections
  useEffect(() => {
    let filtered = connections;

    // Apply filters
    if (exchangeFilter !== 'all') {
      filtered = filtered.filter(conn => conn.exchange.toLowerCase() === exchangeFilter.toLowerCase());
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter(conn => conn.region === regionFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(conn => conn.status === statusFilter);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(conn => 
        conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.exchange.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredConnections(filtered);

    // Update URL with filters
    const newSearchParams = new URLSearchParams(searchParams);
    if (statusFilter !== 'all') {
      newSearchParams.set('status', statusFilter);
    } else {
      newSearchParams.delete('status');
    }
    if (regionFilter !== 'all') {
      newSearchParams.set('region', regionFilter);
    } else {
      newSearchParams.delete('region');
    }
    setSearchParams(newSearchParams);
  }, [connections, exchangeFilter, regionFilter, statusFilter, searchQuery]);

  const loadConnections = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/connections?user_id=' + userId);
      // const data = await response.json();
      
      // Simulate API call
      setTimeout(() => {
        setConnections(mockConnections);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load connections:', error);
      setLoading(false);
    }
  };

  const loadPortfolio = async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    // Check if portfolio view is enabled
    const portfolioEnabled = connection.region === 'testnet' || 
                           (['com', 'us'].includes(connection.region) && !connection.dryRun);
    
    if (!portfolioEnabled) {
      return;
    }

    setPortfolioLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/portfolio?connection_id=${connectionId}&user_id=${userId}`);
      // const data = await response.json();
      
      // Simulate API call
      setTimeout(() => {
        setPortfolio(mockPortfolio);
        setPortfolioLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setPortfolioLoading(false);
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    setTestingConnection(connectionId);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/connections/${connectionId}/test`, { method: 'POST' });
      // const result = await response.json();
      
      // Simulate API call
      setTimeout(() => {
        // Update connection status based on test result
        setConnections(prev => prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, status: Math.random() > 0.3 ? 'healthy' : 'error', lastTest: 'just now' }
            : conn
        ));
        setTestingConnection(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to test connection:', error);
      setTestingConnection(null);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/connections/${connectionId}`, { method: 'DELETE' });
      
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      setShowDetailDrawer(false);
      setSelectedConnection(null);
    } catch (error) {
      console.error('Failed to delete connection:', error);
    }
  };

  const handleUpdateConnection = async (connectionId: string, updates: Partial<Connection>) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/connections/${connectionId}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify(updates)
      // });
      
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, ...updates, updatedAt: new Date().toISOString() }
          : conn
      ));
    } catch (error) {
      console.error('Failed to update connection:', error);
    }
  };

  const handleCloseConnectModal = () => {
    setShowConnectModal(false);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('modal');
    setSearchParams(newSearchParams);
  };

  const handleViewPortfolio = (connection: Connection) => {
    setSelectedConnection(connection);
    setShowPortfolio(true);
    loadPortfolio(connection.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'revoked': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Check className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <X className="w-4 h-4" />;
      case 'revoked': return <X className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getBrokerIcon = (exchange: string, region: string) => {
    if (exchange === 'BINANCE') {
      return region === 'testnet' 
        ? 'from-gray-500 to-gray-600' 
        : 'from-yellow-500 to-orange-500';
    }
    return 'from-gray-500 to-gray-600';
  };

  const getRegionLabel = (region: string) => {
    switch (region) {
      case 'com': return 'Global';
      case 'us': return 'US';
      case 'testnet': return 'Testnet';
      default: return region.toUpperCase();
    }
  };

  const isPortfolioEnabled = (connection: Connection) => {
    return connection.region === 'testnet' || 
           (['com', 'us'].includes(connection.region) && !connection.dryRun);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Exchange Connections
            </h1>
            <p className="text-gray-400 mt-2">Manage your exchange API connections</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 animate-pulse">
              <div className="h-20 bg-white/10 rounded-lg mb-4" />
              <div className="h-4 bg-white/10 rounded mb-2" />
              <div className="h-4 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Exchange Connections
          </h1>
          <p className="text-gray-400 mt-2">Manage your exchange API connections</p>
          <div className="flex items-center space-x-2 mt-3">
            <div className="flex items-center space-x-2 bg-emerald-500/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-sm font-medium">Live</span>
            </div>
            <span className="text-gray-400 text-sm">Last sync: now</span>
          </div>
        </div>
        <button 
          onClick={() => setShowConnectModal(true)}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 flex items-center transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Connection
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Exchange Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Exchange:</span>
            <select 
              value={exchangeFilter} 
              onChange={(e) => setExchangeFilter(e.target.value)}
              className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="binance">Binance</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Region:</span>
            <select 
              value={regionFilter} 
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="com">Global (.com)</option>
              <option value="us">US (.us)</option>
              <option value="testnet">Testnet</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredConnections.length === 0 && connections.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-bold mb-2">No connections yet</h3>
          <p className="text-gray-400 mb-6">Connect your first exchange to start automated trading</p>
          <button 
            onClick={() => setShowConnectModal(true)}
            className="bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2 inline" />
            Add Your First Connection
          </button>
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">No connections found</h3>
          <p className="text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        /* Connection Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredConnections.map((connection) => (
            <div 
              key={connection.id} 
              className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 ${
                connection.status === 'revoked' ? 'opacity-75' : ''
              }`}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getBrokerIcon(connection.exchange, connection.region)} rounded-xl flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">
                      {connection.exchange === 'BINANCE' ? 'B' : connection.exchange.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{connection.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(connection.status)}`}>
                        {getStatusIcon(connection.status)}
                        <span>{connection.status}</span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {getRegionLabel(connection.region)}
                      </span>
                      {connection.dryRun && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          Dry Run
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedConnection(connection);
                    setShowDetailDrawer(true);
                  }}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Connection Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Balance</span>
                  <span className="text-white font-medium">{connection.balance}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Active Pairs</span>
                  <span className="text-white">{connection.activePairs}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Last Test</span>
                  <span className="text-white">{connection.lastTest}</span>
                </div>
                {connection.latency && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Latency</span>
                    <span className="text-emerald-400">{connection.latency}ms</span>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {connection.status === 'error' && connection.errorMessage && (
                <div className="flex items-center space-x-2 mb-4 p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-400">{connection.errorMessage}</span>
                </div>
              )}

              {/* Actions Row */}
              <div className="flex items-center justify-between space-x-2">
                <button 
                  onClick={() => handleTestConnection(connection.id)}
                  disabled={testingConnection === connection.id}
                  className="px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center disabled:opacity-50"
                >
                  {testingConnection === connection.id ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Test
                </button>
                
                <button 
                  onClick={() => handleViewPortfolio(connection)}
                  disabled={!isPortfolioEnabled(connection)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    isPortfolioEnabled(connection)
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400'
                      : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <PieChart className="w-4 h-4 mr-2" />
                  Portfolio
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Exchange Modal */}
      <ConnectExchangeModal
        isOpen={showConnectModal}
        onClose={handleCloseConnectModal}
        preselectedRegion={searchParams.get('region') as 'com' | 'us' | 'testnet' || undefined}
      />

      {/* Detail Drawer */}
      {showDetailDrawer && selectedConnection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-end z-50">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border-l border-gray-700/50 h-full w-full max-w-lg p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${getBrokerIcon(selectedConnection.exchange, selectedConnection.region)} rounded-xl flex items-center justify-center`}>
                  <span className="text-white font-bold">
                    {selectedConnection.exchange === 'BINANCE' ? 'B' : selectedConnection.exchange.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedConnection.name}</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(selectedConnection.status)}`}>
                      {getStatusIcon(selectedConnection.status)}
                      <span>{selectedConnection.status}</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      {getRegionLabel(selectedConnection.region)}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailDrawer(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Connection Details */}
            <div className="space-y-6">
              <div className="bg-gray-800/30 rounded-xl p-4">
                <h3 className="font-semibold mb-3">Connection Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Exchange</span>
                    <span className="text-white">{selectedConnection.exchange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Region</span>
                    <span className="text-white">{getRegionLabel(selectedConnection.region)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mode</span>
                    <span className="text-white">{selectedConnection.dryRun ? 'Dry Run' : 'Live Trading'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-white">{new Date(selectedConnection.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white">{new Date(selectedConnection.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* API Keys Section */}
              <div className="bg-gray-800/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">API Credentials</h3>
                  <button
                    onClick={() => setShowKeys(!showKeys)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">API Key</label>
                    <input
                      type={showKeys ? "text" : "password"}
                      value={selectedConnection.apiKey || ''}
                      readOnly
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">API Secret</label>
                    <input
                      type="password"
                      value={selectedConnection.apiSecret || ''}
                      readOnly
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button 
                  onClick={() => handleTestConnection(selectedConnection.id)}
                  disabled={testingConnection === selectedConnection.id}
                  className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {testingConnection === selectedConnection.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </button>

                <button 
                  onClick={() => handleViewPortfolio(selectedConnection)}
                  disabled={!isPortfolioEnabled(selectedConnection)}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    isPortfolioEnabled(selectedConnection)
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400'
                      : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <PieChart className="w-4 h-4 mr-2" />
                  View Portfolio
                </button>

                <button 
                  onClick={() => handleUpdateConnection(selectedConnection.id, { 
                    apiKey: 'rotated_' + Date.now(),
                    apiSecret: 'rotated_' + Date.now() 
                  })}
                  className="w-full bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rotate Keys
                </button>

                <button 
                  onClick={() => handleUpdateConnection(selectedConnection.id, { dryRun: !selectedConnection.dryRun })}
                  className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Toggle {selectedConnection.dryRun ? 'Live' : 'Dry Run'}
                </button>

                <button 
                  onClick={() => handleDeleteConnection(selectedConnection.id)}
                  className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Revoke Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio View Modal */}
      {showPortfolio && selectedConnection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${getBrokerIcon(selectedConnection.exchange, selectedConnection.region)} rounded-xl flex items-center justify-center`}>
                  <span className="text-white font-bold">
                    {selectedConnection.exchange === 'BINANCE' ? 'B' : selectedConnection.exchange.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    {selectedConnection.name} Portfolio
                  </h2>
                  <p className="text-gray-400">{getRegionLabel(selectedConnection.region)} • {selectedConnection.dryRun ? 'Demo' : 'Live'}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPortfolio(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Portfolio Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {portfolioLoading ? (
                <div className="space-y-6">
                  {/* Loading KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-gray-800/30 rounded-xl p-6 animate-pulse">
                        <div className="h-4 bg-white/10 rounded w-20 mb-2"></div>
                        <div className="h-8 bg-white/10 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                  {/* Loading Table */}
                  <div className="bg-gray-800/30 rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-white/10 rounded w-32 mb-4"></div>
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-4 bg-white/10 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : portfolio ? (
                <div className="space-y-6">
                  {/* Portfolio KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Total Value</p>
                          <p className="text-2xl font-bold text-white">{formatCurrency(portfolio.totalValue)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>

                    <div className="bg-gray-800/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">P&L (24h)</p>
                          <div className="flex items-center space-x-2">
                            <p className={`text-2xl font-bold ${getChangeColor(portfolio.totalPnL)}`}>
                              {portfolio.totalPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.totalPnL)}
                            </p>
                            {getChangeIcon(portfolio.totalPnL)}
                          </div>
                        </div>
                        <TrendingUp className={`w-8 h-8 ${portfolio.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${
                        portfolio.totalPnL >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {formatPercent(portfolio.totalPnLPercent)}
                      </div>
                    </div>

                    <div className="bg-gray-800/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-gray-400 text-sm">Assets</p>
                          <p className="text-2xl font-bold text-white">{portfolio.balances.filter(b => b.total > 0).length}</p>
                        </div>
                        <PieChart className="w-8 h-8 text-purple-400" />
                      </div>
                    </div>
                  </div>

                  {/* Holdings Table */}
                  <div className="bg-gray-800/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">Holdings</h3>
                      <button className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700/50">
                            <th className="text-left py-3 text-gray-400">Asset</th>
                            <th className="text-right py-3 text-gray-400">Amount</th>
                            <th className="text-right py-3 text-gray-400">Price</th>
                            <th className="text-right py-3 text-gray-400">Value</th>
                            <th className="text-right py-3 text-gray-400">24h</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portfolio.balances.filter(balance => balance.total > 0).map((balance) => (
                            <tr key={balance.asset} className="border-b border-gray-700/30 last:border-b-0 hover:bg-gray-800/30 transition-colors">
                              <td className="py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-sm font-bold">
                                    {balance.asset.substring(0, 2)}
                                  </div>
                                  <span className="font-medium text-white">{balance.asset}</span>
                                </div>
                              </td>
                              <td className="text-right py-4">
                                <div className="text-white font-mono">{formatNumber(balance.total)}</div>
                                <div className="text-xs text-gray-400">
                                  Free: {formatNumber(balance.free)} | Locked: {formatNumber(balance.locked)}
                                </div>
                              </td>
                              <td className="text-right py-4 text-white font-mono">{formatCurrency(balance.price)}</td>
                              <td className="text-right py-4 text-white font-semibold">{formatCurrency(balance.value)}</td>
                              <td className="text-right py-4">
                                <div className={`flex items-center justify-end space-x-1 ${getChangeColor(balance.change24h)}`}>
                                  {getChangeIcon(balance.change24h)}
                                  <span className="font-medium">{formatPercent(balance.change24h)}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-bold mb-2">Portfolio Unavailable</h3>
                  <p className="text-gray-400">
                    {selectedConnection.region === 'testnet' 
                      ? 'Portfolio data is not available for testnet connections'
                      : selectedConnection.dryRun 
                      ? 'Switch to live mode to view portfolio'
                      : 'Portfolio access is restricted for this connection'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;
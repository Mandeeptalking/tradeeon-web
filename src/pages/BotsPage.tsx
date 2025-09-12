import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, Settings, Trash2, TrendingUp, TrendingDown, X, Bot, MoreVertical, AlertCircle, CheckCircle } from 'lucide-react';
import RSICompounderBot from '../components/RSICompounderBot';

interface BotData {
  botId: string;
  name: string;
  type: 'webhook' | 'dca' | 'rsi_compounder';
  status: 'running' | 'stopped' | 'error';
  connectionId: string;
  market: 'crypto' | 'us_equity';
  config: any;
  createdAt: string;
  updatedAt: string;
}

interface Connection {
  connectionId: string;
  label: string;
  status: 'connected' | 'error' | 'disconnected';
  broker: string;
}

interface CreateBotRequest {
  name: string;
  type: 'webhook' | 'dca' | 'rsi_compounder';
  connectionId: string;
  market: 'crypto' | 'us_equity';
  config: any;
}

const BotsPage = () => {
  const navigate = useNavigate();
  const [bots, setBots] = useState<BotData[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'webhook' | 'dca' | 'rsi_compounder'>('rsi_compounder');
  const [showRSIBot, setShowRSIBot] = useState(false);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    connectionId: '',
    market: 'crypto' as 'crypto' | 'us_equity',
    // Webhook fields
    symbolAllowlist: [] as string[],
    requireSignature: true,
    defaultOrderType: 'market' as 'market' | 'limit',
    maxNotional: '',
    // DCA fields
    symbol: '',
    baseSlice: '',
    triggerPercent: '',
    maxAdds: '',
    takeProfit: ''
  });
  
  const [symbolInput, setSymbolInput] = useState('');

  // Mock data
  const mockConnections: Connection[] = [
    { connectionId: '1', label: 'Binance Main', status: 'connected', broker: 'Binance' },
    { connectionId: '2', label: 'Coinbase Advanced', status: 'connected', broker: 'Coinbase Advanced' },
    { connectionId: '3', label: 'KuCoin Trading', status: 'connected', broker: 'KuCoin' }
  ];

  const mockBots: BotData[] = [
    {
      botId: '1',
      name: 'BTC Scalper',
      type: 'webhook',
      status: 'running',
      connectionId: '1',
      market: 'crypto',
      config: { symbolAllowlist: ['BTCUSDT'], requireSignature: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      botId: '2',
      name: 'ETH DCA Bot',
      type: 'dca',
      status: 'running',
      connectionId: '2',
      market: 'crypto',
      config: { symbol: 'ETHUSDT', baseSlice: 100, triggerPercent: 5 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      botId: '4',
      name: 'RSI Compounder Pro',
      type: 'rsi_compounder',
      status: 'running',
      connectionId: '1',
      market: 'us_equity',
      config: { 
        startingCapital: 100000, 
        stepSizePercentage: 10, 
        takeProfitPercent: 6.28,
        reinvestMode: 98 
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      botId: '3',
      name: 'Momentum Strategy',
      type: 'webhook',
      status: 'stopped',
      connectionId: '1',
      market: 'crypto',
      config: { symbolAllowlist: ['ADAUSDT', 'SOLUSDT'], requireSignature: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Simulate API call
    setTimeout(() => {
      setBots(mockBots);
      setConnections(mockConnections.filter(c => c.status === 'connected'));
      setLoading(false);
    }, 1000);
  };

  const handleCreateBot = () => {
    navigate('/dashboard/bots/new');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.connectionId) {
      alert('Please fill in required fields');
      return;
    }

    // Validate based on bot type
    if (activeTab === 'rsi_compounder') {
      // RSI Compounder will be handled by the dedicated component
      setShowRSIBot(true);
      setDialogOpen(false);
      return;
    } else if (activeTab === 'webhook') {
      if (formData.symbolAllowlist.length === 0) {
        alert('Please add at least one symbol to the allowlist');
        return;
      }
    } else if (activeTab === 'dca') {
      if (!formData.symbol || !formData.baseSlice || !formData.triggerPercent) {
        alert('Please fill in all DCA fields');
        return;
      }
    }

    try {
      const config = activeTab === 'rsi_compounder' ? {
        startingCapital: 100000,
        stepSizePercentage: 10,
        takeProfitPercent: 6.28,
        reinvestMode: 98
      } : activeTab === 'webhook' ? {
        symbolAllowlist: formData.symbolAllowlist,
        requireSignature: formData.requireSignature,
        defaultOrderType: formData.defaultOrderType,
        maxNotional: formData.maxNotional ? parseFloat(formData.maxNotional) : undefined
      } : {
        symbol: formData.symbol,
        baseSlice: parseFloat(formData.baseSlice),
        triggerPercent: parseFloat(formData.triggerPercent),
        maxAdds: formData.maxAdds ? parseInt(formData.maxAdds) : undefined,
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined
      };

      const newBot: BotData = {
        botId: Date.now().toString(),
        name: formData.name,
        type: activeTab,
        connectionId: formData.connectionId,
        market: formData.market,
        config,
        status: 'stopped',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setBots(prev => [...prev, newBot]);
      setDialogOpen(false);
    } catch (error) {
      alert('Failed to create bot');
    }
  };

  const handleToggleBot = async (botId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'stopped' : 'running';
    setBots(prev => prev.map(bot => 
      bot.botId === botId ? { ...bot, status: newStatus as any } : bot
    ));
  };

  const handleDeleteBot = async (botId: string) => {
    setBots(prev => prev.filter(b => b.botId !== botId));
  };

  const handleRSIBotSave = (botConfig: any) => {
    if (editingBotId) {
      // Update existing bot
      setBots(prev => prev.map(bot => 
        bot.botId === editingBotId 
          ? { ...bot, config: botConfig, updatedAt: new Date().toISOString() }
          : bot
      ));
    } else {
      // Create new bot
      const newBot: BotData = {
        botId: Date.now().toString(),
        name: botConfig.name,
        type: 'rsi_compounder',
        connectionId: '1', // Default to first connection
        market: 'us_equity',
        config: botConfig,
        status: 'stopped',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setBots(prev => [...prev, newBot]);
    }
    
    setShowRSIBot(false);
    setEditingBotId(null);
  };

  const handleEditRSIBot = (botId: string) => {
    setEditingBotId(botId);
    setShowRSIBot(true);
  };

  const addSymbol = () => {
    if (symbolInput.trim() && !formData.symbolAllowlist.includes(symbolInput.trim().toUpperCase())) {
      setFormData(prev => ({
        ...prev,
        symbolAllowlist: [...prev.symbolAllowlist, symbolInput.trim().toUpperCase()]
      }));
      setSymbolInput('');
    }
  };

  const removeSymbol = (symbol: string) => {
    setFormData(prev => ({
      ...prev,
      symbolAllowlist: prev.symbolAllowlist.filter(s => s !== symbol)
    }));
  };

  const handleSymbolKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSymbol();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'stopped':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Pause className="w-4 h-4" />;
    }
  };

  const getBotTypeIcon = (type: string) => {
    return type === 'webhook' ? '🔗' : type === 'dca' ? '📈' : '🤖';
  };

  const getBotTypeColor = (type: string) => {
    switch (type) {
      case 'webhook': return 'from-blue-500 to-cyan-500';
      case 'dca': return 'from-green-500 to-emerald-500';
      case 'rsi_compounder': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const activeBots = bots.filter(bot => bot.status === 'running');
  const totalProfit = 4135.78; // Mock total profit
  const avgWinRate = 70.8; // Mock win rate

  // Show RSI Compounder Bot interface
  if (showRSIBot) {
    const editingBot = editingBotId ? bots.find(b => b.botId === editingBotId) : null;
    return (
      <RSICompounderBot
        onBack={() => {
          setShowRSIBot(false);
          setEditingBotId(null);
        }}
        onSave={handleRSIBotSave}
        initialConfig={editingBot?.config}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Trading Bots
            </h1>
            <p className="text-gray-400 mt-2">
              Automate your trading strategies with intelligent bots.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Trading Bots
          </h1>
          <p className="text-gray-400 mt-2">
            Automate your trading strategies with intelligent bots.
          </p>
        </div>
        
        <button 
          onClick={handleCreateBot}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 flex items-center transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Bot
        </button>
        
        <Link to="/dashboard/bots/workspace">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center transform hover:scale-105">
            <TrendingUp className="w-5 h-5 mr-2" />
            Live Chart Workspace
          </button>
        </Link>
        
        <Link to="/dashboard/bots/wizard">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center transform hover:scale-105">
            <Bot className="w-5 h-5 mr-2" />
            Test Bot Flow
          </button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Active Bots</p>
              <p className="text-3xl font-bold text-white">{activeBots.length}</p>
            </div>
            <Play className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-gray-400 text-sm">
            {bots.length - activeBots.length} inactive
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Profit</p>
              <p className="text-3xl font-bold text-emerald-400">+${totalProfit.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-gray-400 text-sm">
            <span className="text-emerald-400">+15.6%</span> overall return
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 hover:scale-[1.01] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Avg Win Rate</p>
              <p className="text-3xl font-bold text-white">{avgWinRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm">
            Across all strategies
          </p>
        </div>
      </div>

      {/* Bots Grid */}
      {bots.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">No trading bots yet</h3>
          <p className="text-gray-400 mb-6">Create your first automated trading bot to get started</p>
          <button 
            onClick={handleCreateBot}
            className="bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
          >
            Create Bot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => {
            const connection = connections.find(c => c.connectionId === bot.connectionId);
            const profit = `+$${(Math.random() * 1000 + 100).toFixed(2)}`;
            const profitPercent = `+${(Math.random() * 20 + 5).toFixed(1)}%`;
            const trades = Math.floor(Math.random() * 100 + 10);
            const winRate = `${(Math.random() * 30 + 60).toFixed(0)}%`;
            const lastRun = bot.status === 'running' ? '2 min ago' : '1 hour ago';

            return (
              <div 
                key={bot.botId}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-lg">
                      {getBotTypeIcon(bot.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{bot.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(bot.status)} ${
                          bot.status === 'running' ? 'animate-pulse' : ''
                        }`}>
                          {getStatusIcon(bot.status)}
                          <span>{bot.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Bot Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Type</span>
                    <span className="text-white capitalize">{bot.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Connection</span>
                    <span className="text-white">{connection?.label || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Run</span>
                    <span className="text-white">{lastRun}</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Profit</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-400 font-bold">{profit}</span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-emerald-400 text-xs">{profitPercent}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Trades</p>
                    <p className="text-white font-bold">{trades}</p>
                    <p className="text-gray-400 text-xs">Win Rate: {winRate}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => handleToggleBot(bot.botId, bot.status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                      bot.status === 'running' 
                        ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 animate-pulse' 
                        : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:scale-105'
                    }`}
                  >
                    {bot.status === 'running' ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Start</span>
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        if (bot.type === 'rsi_compounder') {
                          handleEditRSIBot(bot.botId);
                        }
                      }}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBot(bot.botId)}
                      className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Bot Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Create Trading Bot
                </h2>
                <p className="text-gray-400 mt-1">Configure your automated trading strategy</p>
              </div>
              <button 
                onClick={() => setDialogOpen(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Bot Name *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Trading Bot"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-400">Connection *</label>
                  <select 
                    value={formData.connectionId} 
                    onChange={(e) => setFormData(prev => ({ ...prev, connectionId: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select connection</option>
                    {connections.map((connection) => (
                      <option key={connection.connectionId} value={connection.connectionId}>
                        {connection.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Market</label>
                <select 
                  value={formData.market} 
                  onChange={(e) => setFormData(prev => ({ ...prev, market: e.target.value as 'crypto' | 'us_equity' }))}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="crypto">Cryptocurrency</option>
                  <option value="us_equity">US Equity</option>
                </select>
              </div>

              {/* Strategy Tabs */}
              <div className="space-y-4">
                <div className="flex bg-gray-800/50 rounded-lg p-1 space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('rsi_compounder')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'rsi_compounder' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    RSI Compounder
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('webhook')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'webhook' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Webhook Strategy
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dca')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'dca' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    DCA Strategy
                  </button>
                </div>

                {activeTab === 'rsi_compounder' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">RSI Compounder Bot</h3>
                          <p className="text-gray-400 text-sm">Advanced RSI-based compounding strategy for Indian equity markets</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <div className="text-purple-400 text-sm font-medium">✨ Key Features</div>
                          <ul className="text-gray-300 text-xs mt-2 space-y-1">
                            <li>• RSI-based entry signals</li>
                            <li>• Intelligent capital deployment</li>
                            <li>• Advanced DCA management</li>
                            <li>• Comprehensive risk controls</li>
                          </ul>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <div className="text-emerald-400 text-sm font-medium">📊 Optimized For</div>
                          <ul className="text-gray-300 text-xs mt-2 space-y-1">
                            <li>• Nifty 50/Next 50/250 stocks</li>
                            <li>• Long-term compounding</li>
                            <li>• Risk-adjusted returns</li>
                            <li>• Indian equity markets</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRSIBot(true);
                            setDialogOpen(false);
                          }}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
                        >
                          Configure RSI Compounder Bot
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'webhook' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-400">Symbol Allowlist *</label>
                      <div className="flex gap-2">
                        <input
                          value={symbolInput}
                          onChange={(e) => setSymbolInput(e.target.value)}
                          onKeyPress={handleSymbolKeyPress}
                          placeholder="Enter symbol (e.g., BTCUSDT)"
                          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        />
                        <button 
                          type="button" 
                          onClick={addSymbol}
                          className="bg-gray-700/50 hover:bg-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.symbolAllowlist.map((symbol) => (
                          <span key={symbol} className="bg-gray-700/50 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                            <span>{symbol}</span>
                            <button
                              type="button"
                              onClick={() => removeSymbol(symbol)}
                              className="hover:bg-red-500/20 rounded p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Default Order Type</label>
                        <select 
                          value={formData.defaultOrderType} 
                          onChange={(e) => setFormData(prev => ({ ...prev, defaultOrderType: e.target.value as 'market' | 'limit' }))}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="market">Market</option>
                          <option value="limit">Limit</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Max Notional ($)</label>
                        <input
                          type="number"
                          value={formData.maxNotional}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxNotional: e.target.value }))}
                          placeholder="1000"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="block text-sm font-medium text-gray-400">Require Signature</label>
                        <p className="text-sm text-gray-500">
                          Verify webhook signatures for security
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={formData.requireSignature}
                          onChange={(e) => setFormData(prev => ({ ...prev, requireSignature: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'dca' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Symbol *</label>
                        <input
                          value={formData.symbol}
                          onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                          placeholder="BTCUSDT"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Base Slice ($) *</label>
                        <input
                          type="number"
                          value={formData.baseSlice}
                          onChange={(e) => setFormData(prev => ({ ...prev, baseSlice: e.target.value }))}
                          placeholder="100"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Trigger % Drop *</label>
                        <input
                          type="number"
                          value={formData.triggerPercent}
                          onChange={(e) => setFormData(prev => ({ ...prev, triggerPercent: e.target.value }))}
                          placeholder="5"
                          step="0.1"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Max Additional Buys</label>
                        <input
                          type="number"
                          value={formData.maxAdds}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxAdds: e.target.value }))}
                          placeholder="5"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-400">Take Profit (%)</label>
                      <input
                        type="number"
                        value={formData.takeProfit}
                        onChange={(e) => setFormData(prev => ({ ...prev, takeProfit: e.target.value }))}
                        placeholder="10"
                        step="0.1"
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setDialogOpen(false)}
                  className="bg-gray-700/50 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                {activeTab !== 'rsi_compounder' && (
                  <button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 px-6 py-3 rounded-lg font-medium transition-all"
                  >
                    Create Bot
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotsPage;
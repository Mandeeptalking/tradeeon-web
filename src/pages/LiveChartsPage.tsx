import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, BarChart3, RefreshCw, Settings, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChartPane from '../components/workspace/ChartPane';
import { useBinanceMiniTickerWS } from '../hooks/useBinanceMiniTickerWS';

interface IndicatorOverlay {
  id: string;
  indicatorId: string;
  settings: Record<string, any>;
  visible: boolean;
  color?: string;
}

const LiveChartsPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [overlays, setOverlays] = useState<IndicatorOverlay[]>([]);
  const [showAddIndicator, setShowAddIndicator] = useState(false);
  const [selectedIndicatorToAdd, setSelectedIndicatorToAdd] = useState('RSI');

  // Get live price data for the selected symbol
  const prices = useBinanceMiniTickerWS([selectedSymbol], 'COM');
  const priceData = prices[selectedSymbol];

  // Popular trading symbols
  const popularSymbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT',
    'DOTUSDT', 'AVAXUSDT', 'MATICUSDT', 'LINKUSDT', 'UNIUSDT', 'LTCUSDT'
  ];

  // Available timeframes
  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' }
  ];

  // Available indicators
  const availableIndicators = [
    { id: 'RSI', label: 'RSI', icon: '📊', color: '#8b5cf6' },
    { id: 'MACD', label: 'MACD', icon: '〰️', color: '#06b6d4' },
    { id: 'EMA', label: 'EMA', icon: '📈', color: '#3b82f6' },
    { id: 'BBANDS', label: 'Bollinger Bands', icon: '📏', color: '#f59e0b' },
    { id: 'ADX', label: 'ADX', icon: '💪', color: '#ef4444' },
    { id: 'VWAP', label: 'VWAP', icon: '⚖️', color: '#6366f1' }
  ];

  const handleAddOverlay = () => {
    const indicator = availableIndicators.find(i => i.id === selectedIndicatorToAdd);
    if (!indicator) return;

    const overlayId = `${selectedIndicatorToAdd}-${Date.now()}`;
    const settings = getDefaultSettings(selectedIndicatorToAdd);
    
    const newOverlay: IndicatorOverlay = {
      id: overlayId,
      indicatorId: selectedIndicatorToAdd,
      settings,
      visible: true,
      color: indicator.color
    };

    setOverlays(prev => [...prev, newOverlay]);
    setShowAddIndicator(false);
  };

  const handleRemoveOverlay = (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    setOverlays(prev => prev.map(o => 
      o.id === id ? { ...o, visible: !o.visible } : o
    ));
  };

  const getDefaultSettings = (indicatorId: string): Record<string, any> => {
    const defaults: Record<string, any> = {
      RSI: { length: 14 },
      EMA: { length: 50 },
      MACD: { fast: 12, slow: 26, signal: 9 },
      BBANDS: { length: 20, std: 2 },
      ADX: { length: 14 },
      VWAP: {}
    };
    return defaults[indicatorId] || {};
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(0);
    if (price >= 100) return price.toFixed(1);
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(8);
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-emerald-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Live Charts</h1>
                  <p className="text-sm text-gray-600">Real-time market data from Binance</p>
                </div>
              </div>
            </div>

            {/* Price Display */}
            {priceData && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    ${formatPrice(priceData.last)}
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${getPriceChangeColor(priceData.changePct)}`}>
                    <span>{getPriceChangeIcon(priceData.changePct)}</span>
                    <span>{priceData.changePct >= 0 ? '+' : ''}{priceData.changePct.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Symbol & Timeframe Selectors */}
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Symbol</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {popularSymbols.map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Timeframe</label>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {timeframes.map(tf => (
                    <option key={tf.value} value={tf.value}>{tf.label}</option>
                  ))}
                </select>
              </div>

              {/* Quick Symbol Buttons */}
              <div className="flex items-center space-x-2 ml-6">
                <span className="text-xs text-gray-500">Quick:</span>
                {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT'].map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedSymbol === symbol
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {symbol.replace('USDT', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Indicators Controls */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {overlays.filter(o => o.visible).length} indicator{overlays.filter(o => o.visible).length !== 1 ? 's' : ''} active
              </span>
              
              <button
                onClick={() => setShowAddIndicator(true)}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Indicator</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart - Takes up 3/4 of the width */}
          <div className="lg:col-span-3">
            <ChartPane
              symbol={selectedSymbol}
              timeframe={selectedTimeframe}
              overlays={overlays}
              onChartReady={(ready) => {
                console.log('Chart ready:', ready);
              }}
              onIndicatorComputed={(overlayId, data) => {
                console.log('Indicator computed:', overlayId, data.length, 'points');
              }}
              className="h-[600px]"
            />
          </div>

          {/* Sidebar - Takes up 1/4 of the width */}
          <div className="space-y-6">
            {/* Market Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Market Info</h3>
              </div>
              
              {priceData ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Price</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${formatPrice(priceData.last)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">24h Change</span>
                    <span className={`text-sm font-semibold ${getPriceChangeColor(priceData.changePct)}`}>
                      {priceData.changePct >= 0 ? '+' : ''}{priceData.changePct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">24h High</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${formatPrice(priceData.high)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">24h Low</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${formatPrice(priceData.low)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">24h Volume</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {priceData.volume.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading market data...</p>
                </div>
              )}
            </div>

            {/* Active Indicators */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Indicators</h3>
                  <span className="text-sm text-gray-500">({overlays.length})</span>
                </div>
                
                <button
                  onClick={() => setShowAddIndicator(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {overlays.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-gray-500 text-sm mb-4">No indicators added</p>
                  <button
                    onClick={() => setShowAddIndicator(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Add Indicator
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {overlays.map((overlay) => {
                    const indicator = availableIndicators.find(i => i.id === overlay.indicatorId);
                    return (
                      <div
                        key={overlay.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: overlay.color }}
                          />
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{indicator?.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900">{overlay.indicatorId}</div>
                              <div className="text-xs text-gray-500">
                                {Object.entries(overlay.settings).map(([key, value]) => 
                                  `${key}: ${value}`
                                ).join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleVisibility(overlay.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {overlay.visible ? (
                              <Eye className="w-4 h-4 text-gray-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleRemoveOverlay(overlay.id)}
                            className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/dashboard/bots/new">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-105">
                    <span>🤖</span>
                    <span>Create Trading Bot</span>
                  </button>
                </Link>
                
                <Link to="/dashboard/bots/workspace">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg font-medium transition-all transform hover:scale-105">
                    <span>🚀</span>
                    <span>Strategy Workspace</span>
                  </button>
                </Link>
                
                <Link to="/dashboard/portfolio">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                    <span>📊</span>
                    <span>View Portfolio</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Chart Info */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <h4 className="text-base font-semibold text-blue-900 mb-3">Chart Features</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Real-time price updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Technical indicators</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Interactive chart controls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Multiple timeframes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Indicator Modal */}
      {showAddIndicator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Indicator</h3>
              <button
                onClick={() => setShowAddIndicator(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Indicator
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableIndicators.map((indicator) => (
                    <button
                      key={indicator.id}
                      onClick={() => setSelectedIndicatorToAdd(indicator.id)}
                      className={`flex items-center space-x-2 p-3 border rounded-lg text-left transition-colors ${
                        selectedIndicatorToAdd === indicator.id
                          ? 'border-purple-200 bg-purple-50 text-purple-800'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{indicator.icon}</span>
                      <div>
                        <div className="font-medium">{indicator.label}</div>
                        <div className="text-xs text-gray-500">{indicator.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddIndicator(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOverlay}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Add Indicator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChartsPage;
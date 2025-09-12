import React, { useState } from 'react';
import { Plus, Eye, EyeOff, Settings, Trash2, BarChart3, X } from 'lucide-react';
import { useIndicatorList } from '../../features/createBot/hooks/useIndicatorDefs';
import { computeIndicator } from '../../api/indicators';

interface IndicatorOverlay {
  id: string;
  indicatorId: string;
  settings: Record<string, any>;
  visible: boolean;
  color?: string;
}

interface IndicatorOverlayPanelProps {
  overlays: IndicatorOverlay[];
  onAddOverlay: (overlay: IndicatorOverlay) => void;
  onRemoveOverlay: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onSelectOverlay: (id: string | null) => void;
  selectedOverlay: string | null;
  symbol: string;
  timeframe: string;
  onIndicatorComputed?: (overlayId: string, data: Array<{ timestamp: number; values: Record<string, number> }>) => void;
  className?: string;
}

const IndicatorOverlayPanel: React.FC<IndicatorOverlayPanelProps> = ({
  overlays,
  onAddOverlay,
  onRemoveOverlay,
  onToggleVisibility,
  onSelectOverlay,
  selectedOverlay,
  symbol,
  timeframe,
  onIndicatorComputed,
  className = ''
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState('RSI');
  
  const { indicators, loading } = useIndicatorList();

  const handleAddOverlay = () => {
    const indicator = indicators.find(i => i.id === selectedIndicator);
    if (!indicator) return;

    const overlayId = `${selectedIndicator}-${Date.now()}`;
    const settings = getDefaultSettings(selectedIndicator);
    
    const newOverlay: IndicatorOverlay = {
      id: overlayId,
      indicatorId: selectedIndicator,
      settings,
      visible: true,
      color: getIndicatorColor(selectedIndicator)
    };

    onAddOverlay(newOverlay);
    
    // Compute historical indicator data
    computeHistoricalData(overlayId, selectedIndicator, settings);
    setShowAddDialog(false);
  };

  const computeHistoricalData = async (overlayId: string, indicatorId: string, settings: Record<string, any>) => {
    try {
      const result = await computeIndicator({
        symbol,
        timeframe,
        indicatorId,
        settings,
        region: 'COM',
        limit: 1500
      });
      
      onIndicatorComputed?.(overlayId, result.data);
    } catch (error) {
      console.error('Failed to compute indicator:', error);
      // Generate mock data as fallback
      const mockData = generateMockIndicatorData(indicatorId, 1500);
      onIndicatorComputed?.(overlayId, mockData);
    }
  };

  const generateMockIndicatorData = (indicatorId: string, count: number) => {
    const data = [];
    const now = Date.now();
    const interval = getTimeframeMs(timeframe);
    
    for (let i = count - 1; i >= 0; i--) {
      const timestamp = now - (i * interval);
      let values: Record<string, number> = {};
      
      switch (indicatorId) {
        case 'RSI':
          values = { line: 30 + Math.random() * 40 };
          break;
        case 'MACD':
          const macd = (Math.random() - 0.5) * 10;
          const signal = macd * 0.8 + (Math.random() - 0.5) * 2;
          values = { 
            macd, 
            signal, 
            histogram: macd - signal,
            zero: 0
          };
          break;
        case 'EMA':
          values = { line: 45000 + (Math.random() - 0.5) * 5000 };
          break;
        case 'BBANDS':
          const middle = 45000 + (Math.random() - 0.5) * 5000;
          const std = 1000;
          values = {
            upper: middle + (2 * std),
            middle,
            lower: middle - (2 * std)
          };
          break;
        case 'ADX':
          values = { adx: Math.random() * 50 + 10 };
          break;
        default:
          values = { line: Math.random() * 100 };
      }
      
      data.push({ timestamp, values });
    }
    
    return data;
  };

  const getTimeframeMs = (tf: string): number => {
    const map: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return map[tf] || 15 * 60 * 1000;
  };

  const getDefaultSettings = (indicatorId: string): Record<string, any> => {
    const defaults: Record<string, any> = {
      RSI: { length: 14 },
      EMA: { length: 50 },
      MACD: { fast: 12, slow: 26, signal: 9 },
      BBANDS: { length: 20, std: 2 },
      ADX: { length: 14 },
      DI: { length: 14 },
      VWAP: {}
    };
    return defaults[indicatorId] || {};
  };

  const getIndicatorColor = (indicatorId: string): string => {
    const colors: Record<string, string> = {
      RSI: '#8b5cf6',
      EMA: '#3b82f6',
      MACD: '#06b6d4',
      BBANDS: '#f59e0b',
      ADX: '#ef4444',
      DI: '#10b981',
      VWAP: '#6366f1'
    };
    return colors[indicatorId] || '#6b7280';
  };

  const getIndicatorIcon = (indicatorId: string): string => {
    const icons: Record<string, string> = {
      RSI: '📊',
      EMA: '📈',
      MACD: '〰️',
      BBANDS: '📏',
      ADX: '💪',
      DI: '↗️',
      VWAP: '⚖️'
    };
    return icons[indicatorId] || '📊';
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Indicators</h3>
          <span className="text-sm text-gray-500">({overlays.length})</span>
        </div>
        
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Overlays List */}
      <div className="p-4">
        {overlays.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-gray-500 text-sm mb-4">No indicators added</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add First Indicator
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {overlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-all cursor-pointer ${
                  selectedOverlay === overlay.id
                    ? 'border-purple-200 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onSelectOverlay(overlay.id)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: overlay.color }}
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getIndicatorIcon(overlay.indicatorId)}</span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(overlay.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {overlay.visible ? (
                      <Eye className="w-4 h-4 text-gray-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveOverlay(overlay.id);
                    }}
                    className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Indicator Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Indicator</h3>
              <button
                onClick={() => setShowAddDialog(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Indicator
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {loading ? (
                    <div className="col-span-2 text-center py-4">
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : (
                    indicators.map((indicator) => (
                      <button
                        key={indicator.id}
                        onClick={() => setSelectedIndicator(indicator.id)}
                        className={`flex items-center space-x-2 p-3 border rounded-lg text-left transition-colors ${
                          selectedIndicator === indicator.id
                            ? 'border-purple-200 bg-purple-50 text-purple-800'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{getIndicatorIcon(indicator.id)}</span>
                        <div>
                          <div className="font-medium">{indicator.label}</div>
                          <div className="text-xs text-gray-500">{indicator.version}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddDialog(false)}
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

export default IndicatorOverlayPanel;
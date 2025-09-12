import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Minus } from 'lucide-react';
import { useBinanceMiniTickerWS } from '../hooks/useBinanceMiniTickerWS';
import { useSymbolData } from '../hooks/useSymbolData';
import SymbolFilters from './SymbolFilters';
import SymbolGrid from './SymbolGrid';

interface BulkAddSymbolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (symbols: string[]) => void;
  market: string;
  exchangeId?: string;
  quote: string;
  existingSymbols: string[];
  availableSymbols: string[];
}

const BulkAddSymbolsModal: React.FC<BulkAddSymbolsModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  market,
  exchangeId,
  quote,
  existingSymbols,
  availableSymbols
}) => {
  const [manualInput, setManualInput] = useState('');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [baseAssetFilter, setBaseAssetFilter] = useState('All Assets');
  const [quoteAssetFilter, setQuoteAssetFilter] = useState('All Quotes');

  // Use the symbol data hook to get comprehensive symbols
  const { symbols: comprehensiveSymbols, loading } = useSymbolData(market, exchangeId, 'COM');

  // Get live prices for crypto symbols
  const prices = useBinanceMiniTickerWS(
    market === 'Crypto' ? comprehensiveSymbols.slice(0, 200) : [], // Limit for performance
    'COM'
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedSymbols([]);
      setManualInput('');
      setSearchTerm('');
      setBaseAssetFilter('All Assets');
      setQuoteAssetFilter('All Quotes');
    }
  }, [isOpen]);

  // Get unique base assets for filtering
  const getUniqueBaseAssets = () => {
    const baseAssets = new Set<string>();
    comprehensiveSymbols.forEach(symbol => {
      const possibleQuotes = [
        'USDT', 'USDC', 'FDUSD', 'TUSD', 'BUSD', 'DAI', 'USDP', 'FRAX', 'LUSD', 'GUSD',
        'BTC', 'ETH', 'BNB', 'EUR', 'GBP', 'AUD', 'BRL', 'TRY', 'RUB', 'UAH', 'PLN', 
        'RON', 'ZAR', 'ARS', 'BIDR', 'IDRT', 'NGN', 'VAI', 'BVND', 'GYEN', 'UST'
      ];
      
      for (const quoteAsset of possibleQuotes) {
        if (symbol.endsWith(quoteAsset)) {
          const baseAsset = symbol.slice(0, -quoteAsset.length);
          if (baseAsset) {
            baseAssets.add(baseAsset);
          }
          break;
        }
      }
    });
    return Array.from(baseAssets).sort();
  };

  // Get unique quote assets for filtering
  const getUniqueQuoteAssets = () => {
    const quoteAssets = new Set<string>();
    comprehensiveSymbols.forEach(symbol => {
      const possibleQuotes = [
        'USDT', 'USDC', 'FDUSD', 'TUSD', 'BUSD', 'DAI', 'USDP', 'FRAX', 'LUSD', 'GUSD',
        'BTC', 'ETH', 'BNB', 'EUR', 'GBP', 'AUD', 'BRL', 'TRY', 'RUB', 'UAH', 'PLN', 
        'RON', 'ZAR', 'ARS', 'BIDR', 'IDRT', 'NGN', 'VAI', 'BVND', 'GYEN', 'UST'
      ];
      
      for (const quoteAsset of possibleQuotes) {
        if (symbol.endsWith(quoteAsset)) {
          quoteAssets.add(quoteAsset);
          break;
        }
      }
    });
    return Array.from(quoteAssets).sort();
  };

  const uniqueBaseAssets = getUniqueBaseAssets();
  const uniqueQuoteAssets = getUniqueQuoteAssets();

  // Filter symbols based on search and filters
  const filteredSymbols = comprehensiveSymbols.filter(symbol => {
    // Search filter
    if (searchTerm && !symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Base asset filter
    if (baseAssetFilter !== 'All Assets') {
      if (!symbol.startsWith(baseAssetFilter)) {
        return false;
      }
    }

    // Quote asset filter
    if (quoteAssetFilter !== 'All Quotes') {
      if (!symbol.endsWith(quoteAssetFilter)) {
        return false;
      }
    }

    return true;
  });

  // Handle symbol selection
  const handleSymbolClick = (symbol: string) => {
    if (existingSymbols.includes(symbol)) return; // Already added
    
    setSelectedSymbols(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Handle manual input
  const handleManualAdd = () => {
    const inputSymbols = manualInput
      .split(/[,\n]/)
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);
    
    // Validate symbols against available symbols list
    const validSymbols = inputSymbols.filter(symbol => {
      const isValid = comprehensiveSymbols.includes(symbol);
      if (!isValid) {
        console.warn(`Invalid symbol: ${symbol}`);
      }
      return isValid && !existingSymbols.includes(symbol);
    });
    
    const invalidSymbols = inputSymbols.filter(symbol => 
      !comprehensiveSymbols.includes(symbol)
    );
    
    // Show error for invalid symbols
    if (invalidSymbols.length > 0) {
      alert(`Invalid symbols: ${invalidSymbols.join(', ')}\n\nPlease use valid trading pairs like BTCUSDT, ETHUSDC, BTCFDUSD, etc.`);
      return;
    }
    
    setSelectedSymbols(prev => {
      const combined = [...new Set([...prev, ...validSymbols])];
      return combined;
    });
    setManualInput('');
  };

  // Handle add symbols
  const handleAddSymbols = () => {
    const allSelectedSymbols = [...selectedSymbols];
    
    // Add manual input symbols
    const inputSymbols = manualInput
      .split(/[,\n]/)
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);
    
    // Validate manual symbols
    const validManualSymbols = inputSymbols.filter(symbol => 
      comprehensiveSymbols.includes(symbol) && !existingSymbols.includes(symbol)
    );
    
    const invalidSymbols = inputSymbols.filter(symbol => 
      !comprehensiveSymbols.includes(symbol)
    );
    
    // Show warning for invalid symbols but still proceed with valid ones
    if (invalidSymbols.length > 0) {
      alert(`Warning: Invalid symbols ignored: ${invalidSymbols.join(', ')}\n\nValid symbols will be added.`);
    }
    
    allSelectedSymbols.push(...validManualSymbols);
    
    const uniqueSymbols = [...new Set(allSelectedSymbols)];
    
    if (uniqueSymbols.length > 0) {
      onAdd(uniqueSymbols);
      onClose();
    }
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedSymbols([]);
    setManualInput('');
  };

  // Quick filter handlers
  const handleQuickFilter = (baseAsset: string) => {
    setBaseAssetFilter(baseAsset);
    setQuoteAssetFilter('All Quotes');
  };

  const handleQuoteFilter = (quoteAsset: string) => {
    setQuoteAssetFilter(quoteAsset);
    setBaseAssetFilter('All Assets');
  };

  const handleShowAll = () => {
    setBaseAssetFilter('All Assets');
    setQuoteAssetFilter('All Quotes');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-2xl w-[98vw] h-[95vh] flex flex-col shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Add Symbols</h2>
            <p className="text-gray-600 mt-1">
              Select symbols from the list or enter manually • {comprehensiveSymbols.length} symbols available
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-4 gap-6 p-6 min-h-0">
          {/* Left Side - Symbol Browser (3 columns) */}
          <div className="col-span-3 flex flex-col min-h-0">
            {/* Filters */}
            <div className="flex-shrink-0 mb-4">
              <SymbolFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                baseAssetFilter={baseAssetFilter}
                onBaseAssetChange={setBaseAssetFilter}
                quoteAssetFilter={quoteAssetFilter}
                onQuoteAssetChange={setQuoteAssetFilter}
                uniqueBaseAssets={uniqueBaseAssets}
                uniqueQuoteAssets={uniqueQuoteAssets}
                onQuickFilter={handleQuickFilter}
                onQuoteFilter={handleQuoteFilter}
                onShowAll={handleShowAll}
              />
            </div>

            {/* Available Symbols Header */}
            <div className="flex-shrink-0 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Available Symbols</h3>
              <p className="text-sm text-gray-600">{filteredSymbols.length} symbols available</p>
            </div>

            {/* Symbols Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0 border border-gray-200 rounded-lg p-4 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading symbols...</span>
                </div>
              ) : (
                <SymbolGrid
                  symbols={filteredSymbols}
                  selectedSymbols={selectedSymbols}
                  existingSymbols={existingSymbols}
                  prices={prices}
                  onSymbolClick={handleSymbolClick}
                  market={market}
                />
              )}
            </div>
          </div>

          {/* Right Side - Manual Entry & Selected */}
          <div className="col-span-1 flex flex-col min-h-0">
            {/* Manual Entry */}
            <div className="flex-shrink-0 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Manual Entry</h3>
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="BTCUSDT&#10;ETHUSDT&#10;BNBUSDT&#10;BTCUSDC&#10;BTCFDUSD&#10;BTCTUSD"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter symbols manually (one per line or comma separated)
              </p>
              
              {manualInput.trim() && (
                <button
                  onClick={handleManualAdd}
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Add to Selection
                </button>
              )}
            </div>

            {/* Selected Symbols */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">Selected ({selectedSymbols.length})</h3>
                {selectedSymbols.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0 border border-gray-200 rounded-lg p-3 bg-gray-50">
                {selectedSymbols.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-gray-500 text-sm">Click symbols from the list to select them</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedSymbols.map((symbol) => {
                      const priceData = prices[symbol];
                      return (
                        <div
                          key={symbol}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-blue-900">{symbol}</div>
                            {priceData && (
                              <div className="text-sm text-blue-700">
                                ${priceData.last.toFixed(priceData.last >= 1 ? 2 : 6)}
                                <span className={`ml-2 ${priceData.changePct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {priceData.changePct >= 0 ? '+' : ''}{priceData.changePct.toFixed(2)}%
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedSymbols(prev => prev.filter(s => s !== symbol))}
                            className="p-1 hover:bg-blue-200 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{selectedSymbols.length + (manualInput.split(/[,\n]/).filter(s => s.trim()).length)} symbols ready to add</span>
            {market === 'Crypto' && (
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>{Object.keys(prices).length} live price feeds active</span>
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSymbols}
              disabled={selectedSymbols.length === 0 && !manualInput.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add {selectedSymbols.length + (manualInput.split(/[,\n]/).filter(s => s.trim()).length)} Symbols</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkAddSymbolsModal;
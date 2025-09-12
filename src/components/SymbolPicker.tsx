import React, { useState, useEffect } from 'react';
import { Search, Plus, X, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import BulkAddSymbolsModal from './BulkAddSymbolsModal';
import { useBinanceMiniTickerWS } from '../hooks/useBinanceMiniTickerWS';
import { useSymbolData } from '../hooks/useSymbolData';

interface SymbolPickerProps {
  market: string;
  exchangeId?: string;
  quote: string;
  type: string;
  value: string[];
  onChange: (symbols: string[]) => void;
  freeLimit: number;
  isPro: boolean;
  onPriceData?: (priceData: Record<string, any>) => void;
}

const SymbolPicker: React.FC<SymbolPickerProps> = ({
  market,
  exchangeId,
  quote,
  type,
  value,
  onChange,
  freeLimit,
  isPro,
  onPriceData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [manualInput, setManualInput] = useState('');

  // Load symbols using the hook
  const { symbols: availableSymbols, loading: symbolsLoading } = useSymbolData(
    market, 
    exchangeId, 
    exchangeId ? 'COM' : 'COM'
  );

  // Get live prices for crypto symbols
  const prices = useBinanceMiniTickerWS(
    market === 'Crypto' ? value : [],
    'COM'
  );

  // Pass price data to parent
  useEffect(() => {
    if (onPriceData && Object.keys(prices).length > 0) {
      onPriceData(prices);
    }
  }, [prices, onPriceData]);

  // Filter available symbols based on search (limit to 20 for dropdown)
  const filteredSymbols = searchTerm.length >= 2 
    ? availableSymbols
        .filter(symbol => symbol.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 20)
    : [];

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(value.length >= 2);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filteredSymbols.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSymbols.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSymbols.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSymbols.length) {
          handleAddSymbol(filteredSymbols[selectedIndex]);
          setSearchTerm('');
          setShowDropdown(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle dropdown item click
  const handleDropdownItemClick = (symbol: string) => {
    if (!value.includes(symbol)) {
      onChange([...value, symbol]);
    }
    setSearchTerm('');
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleAddSymbol = (symbol: string) => {
    if (!value.includes(symbol)) {
      onChange([...value, symbol.toUpperCase()]);
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    onChange(value.filter(s => s !== symbol));
  };

  const handleManualAdd = () => {
    const inputSymbols = manualInput
      .split(/[,\n]/)
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);
    
    // Add valid symbols that aren't already selected
    const newSymbols = inputSymbols.filter(symbol => 
      !value.includes(symbol) && availableSymbols.includes(symbol)
    );
    
    if (newSymbols.length > 0) {
      onChange([...value, ...newSymbols]);
    }
    
    setManualInput('');
  };

  const handleBulkAdd = (symbols: string[]) => {
    onChange([...value, ...symbols.filter(s => !value.includes(s))]);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(0);
    if (price >= 100) return price.toFixed(1);
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(8);
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-emerald-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-md flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Symbols & Universe</h2>
          <p className="text-gray-600 text-xs">Select trading symbols for your bot</p>
        </div>
      </div>

      {/* Search and Add Controls */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          
          {/* Dropdown */}
          {showDropdown && filteredSymbols.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {filteredSymbols.map((symbol, index) => {
                const priceData = prices[symbol];
                const isAlreadyAdded = value.includes(symbol);
                
                return (
                  <div
                    key={symbol}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!isAlreadyAdded) {
                        handleDropdownItemClick(symbol);
                      }
                    }}
                    className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                      isAlreadyAdded
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : index === selectedIndex
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{symbol}</div>
                        {priceData && market === 'Crypto' && (
                          <div className="text-sm text-gray-600">
                            ${formatPrice(priceData.last)}
                            <span className={`ml-2 ${getPriceChangeColor(priceData.changePct)}`}>
                              {priceData.changePct >= 0 ? '+' : ''}{priceData.changePct.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                      {isAlreadyAdded && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          Added
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {searchTerm.length >= 2 && filteredSymbols.length === 0 && (
                <div className="px-4 py-3 text-gray-500 text-center">
                  No symbols found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowBulkAdd(true)}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Bulk Add Symbols</span>
        </button>
      </div>

      {/* Selected Symbols */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Selected Symbols ({value.length})
          </h3>
          {value.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="text-xs text-red-600 hover:text-red-800 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {value.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-gray-500 text-sm">No symbols selected</p>
            <p className="text-gray-400 text-xs">Add symbols to start trading</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {value.map((symbol) => {
              const priceData = prices[symbol];
              return (
                <div
                  key={symbol}
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-blue-900">{symbol}</span>
                      {market === 'Crypto' && priceData && (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-blue-700">
                            ${formatPrice(priceData.last)}
                          </span>
                          <div className={`flex items-center space-x-1 ${getPriceChangeColor(priceData.changePct)}`}>
                            {getPriceChangeIcon(priceData.changePct)}
                            <span className="text-xs">
                              {priceData.changePct >= 0 ? '+' : ''}{priceData.changePct.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSymbol(symbol)}
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

      {/* Quick Add Suggestions */}
      {market === 'Crypto' && value.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Symbols:</h4>
          <div className="flex flex-wrap gap-2">
            {['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT'].map(symbol => (
              <button
                key={symbol}
                onClick={() => {
                  if (!value.includes(symbol)) {
                    onChange([...value, symbol]);
                  }
                }}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      <BulkAddSymbolsModal
        isOpen={showBulkAdd}
        onClose={() => setShowBulkAdd(false)}
        onAdd={handleBulkAdd}
        market={market}
        exchangeId={exchangeId}
        quote={quote}
        existingSymbols={value}
        availableSymbols={availableSymbols}
      />
    </div>
  );
};

export default SymbolPicker;
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Ticker } from '../hooks/useBinanceMiniTickerWS';

interface SymbolGridProps {
  symbols: string[];
  selectedSymbols: string[];
  existingSymbols: string[];
  prices: Record<string, Ticker>;
  onSymbolClick: (symbol: string) => void;
  market: string;
}

const SymbolGrid: React.FC<SymbolGridProps> = ({
  symbols,
  selectedSymbols,
  existingSymbols,
  prices,
  onSymbolClick,
  market
}) => {
  // Format price with proper decimals
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(0);
    if (price >= 100) return price.toFixed(1);
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(8);
  };

  // Get price change color
  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-emerald-600 bg-emerald-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Extract base and quote assets from symbol
  const parseSymbol = (symbol: string) => {
    const possibleQuotes = [
      'USDT', 'USDC', 'FDUSD', 'TUSD', 'BUSD', 'DAI', 'USDP', 'FRAX', 'LUSD', 'GUSD',
      'BTC', 'ETH', 'BNB', 'EUR', 'GBP', 'AUD', 'BRL', 'TRY', 'RUB', 'UAH', 'PLN', 
      'RON', 'ZAR', 'ARS', 'BIDR', 'IDRT', 'NGN', 'VAI', 'BVND', 'GYEN', 'UST'
    ];
    
    for (const quote of possibleQuotes) {
      if (symbol.endsWith(quote)) {
        const base = symbol.slice(0, -quote.length);
        if (base) {
          return { baseAsset: base, quoteAsset: quote };
        }
      }
    }
    
    return { baseAsset: symbol, quoteAsset: '' };
  };

  if (symbols.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No symbols found</h3>
        <p className="text-gray-600">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 pr-2">
      {symbols.map((symbol) => {
        const isSelected = selectedSymbols.includes(symbol);
        const isAlreadyAdded = existingSymbols.includes(symbol);
        const priceData = prices[symbol];
        const { baseAsset, quoteAsset } = parseSymbol(symbol);
        
        return (
          <button
            key={symbol}
            onClick={() => onSymbolClick(symbol)}
            disabled={isAlreadyAdded}
            className={`p-3 rounded-lg border text-left transition-all duration-200 hover:scale-105 ${
              isAlreadyAdded
                ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                : isSelected
                ? 'bg-blue-100 border-blue-300 text-blue-800 ring-2 ring-blue-200 shadow-md'
                : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {baseAsset}
                </span>
                {quoteAsset && (
                  <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    /{quoteAsset}
                  </span>
                )}
              </div>
              {isSelected && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              )}
              {isAlreadyAdded && (
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                  <Minus className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="text-sm font-semibold text-gray-900 mb-1">{symbol}</div>
            
            {priceData && market === 'Crypto' && (
              <div className="space-y-1">
                <div className="text-sm font-bold text-gray-900">
                  ${formatPrice(priceData.last)}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${getPriceChangeColor(priceData.changePct)}`}>
                  {priceData.changePct >= 0 ? '+' : ''}{priceData.changePct.toFixed(2)}%
                </div>
              </div>
            )}
            
            {isAlreadyAdded && (
              <div className="text-xs text-gray-500 mt-1">Already added</div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SymbolGrid;
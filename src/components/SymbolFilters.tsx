import React from 'react';

interface SymbolFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  baseAssetFilter: string;
  onBaseAssetChange: (filter: string) => void;
  quoteAssetFilter: string;
  onQuoteAssetChange: (filter: string) => void;
  uniqueBaseAssets: string[];
  uniqueQuoteAssets: string[];
  onQuickFilter: (baseAsset: string) => void;
  onQuoteFilter: (quoteAsset: string) => void;
  onShowAll: () => void;
}

const SymbolFilters: React.FC<SymbolFiltersProps> = ({
  searchTerm,
  onSearchChange,
  baseAssetFilter,
  onBaseAssetChange,
  quoteAssetFilter,
  onQuoteAssetChange,
  uniqueBaseAssets,
  uniqueQuoteAssets,
  onQuickFilter,
  onQuoteFilter,
  onShowAll
}) => {
  return (
    <div className="space-y-4">
      {/* Search and Dropdowns */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={baseAssetFilter}
          onChange={(e) => onBaseAssetChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-32"
        >
          <option value="All Assets">All Assets</option>
          {uniqueBaseAssets.slice(0, 30).map(asset => (
            <option key={asset} value={asset}>{asset} pairs</option>
          ))}
        </select>

        <select
          value={quoteAssetFilter}
          onChange={(e) => onQuoteAssetChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-32"
        >
          <option value="All Quotes">All Quotes</option>
          {uniqueQuoteAssets.map(asset => (
            <option key={asset} value={asset}>/{asset}</option>
          ))}
        </select>
      </div>

      {/* Quick Filters */}
      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-700 mr-3">Popular Base Assets:</span>
          <div className="inline-flex flex-wrap gap-2">
            {['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI', 'LTC'].map(asset => (
              <button
                key={asset}
                onClick={() => onQuickFilter(asset)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  baseAssetFilter === asset
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {asset} pairs
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-700 mr-3">Quote Assets:</span>
          <div className="inline-flex flex-wrap gap-2">
            {['/USDT', '/USDC', '/FDUSD', '/TUSD', '/BUSD', '/DAI', '/BTC', '/ETH', '/EUR', '/GBP', '/AUD', '/ARS'].map(quote => (
              <button
                key={quote}
                onClick={() => onQuoteFilter(quote.slice(1))}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  quoteAssetFilter === quote.slice(1)
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {quote}
              </button>
            ))}
            <button
              onClick={onShowAll}
              className="px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              Show All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymbolFilters;
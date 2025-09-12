import React from 'react';
import { Bot, Settings } from 'lucide-react';
import SymbolPicker from '../SymbolPicker';
import ExchangeSelect from '../ExchangeSelect';

interface BotBasicsStepProps {
  data: {
    name: string;
    market: "Indian Equity" | "Crypto" | "US Stocks";
    type: "Spot" | "Futures";
    direction?: "Long" | "Short";
    exchangeId: string | null;
    exchange: "binance" | "binanceus" | "binance_testnet" | null;
    region: "COM" | "US" | "TESTNET" | null;
    symbols: string[];
  };
  onChange: (data: Partial<BotBasicsStepProps['data']>) => void;
}

const BotBasicsStep: React.FC<BotBasicsStepProps> = ({ data, onChange }) => {
  const user = { isPro: false }; // Mock user data

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Basic Details */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
            <Settings className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Basic Details</h3>
            <p className="text-gray-600 text-xs">Configure your bot's fundamental settings</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Bot Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Enter bot name..."
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Give your bot a memorable name</p>
          </div>

          {/* Market */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Market</label>
            <select
              value={data.market}
              onChange={(e) => {
                const market = e.target.value as "Indian Equity" | "Crypto" | "US Stocks";
                onChange({ 
                  market,
                  // Reset exchange when market changes
                  exchangeId: null,
                  exchange: null,
                  region: null,
                  symbols: []
                });
              }}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Indian Equity">Indian Equity</option>
              <option value="Crypto">Cryptocurrency</option>
              <option value="US Stocks">US Stocks</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose your trading market</p>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={data.type}
              onChange={(e) => onChange({ type: e.target.value as "Spot" | "Futures" })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Spot">Spot Trading</option>
              <option value="Futures">Futures Trading</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Trading instrument type</p>
          </div>

          {/* Direction - Only for Futures */}
          {data.type === 'Futures' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
              <select
                value={data.direction}
                onChange={(e) => onChange({ direction: e.target.value as "Long" | "Short" })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Long">Long (Buy)</option>
                <option value="Short">Short (Sell)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Trading direction</p>
            </div>
          )}

          {/* Exchange Select - Only for Crypto */}
          {data.market === 'Crypto' && (
            <div>
              <ExchangeSelect
                value={{
                  exchangeId: data.exchangeId,
                  exchange: data.exchange,
                  region: data.region
                }}
                onChange={(selection) => {
                  onChange({ 
                    exchangeId: selection.exchangeId,
                    exchange: selection.exchange,
                    region: selection.region,
                    symbols: [] // Reset symbols when exchange changes
                  });
                }}
                market={data.market}
                className="w-full"
              />
            </div>
          )}

          {/* Step Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Configuration Summary</h4>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-blue-700 font-medium">Bot:</span>
                <span className="ml-2 text-blue-900">{data.name || 'Not set'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Market:</span>
                <span className="ml-2 text-blue-900">{data.market}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Type:</span>
                <span className="ml-2 text-blue-900">{data.type}</span>
              </div>
              {data.type === 'Futures' && (
                <div>
                  <span className="text-blue-700 font-medium">Direction:</span>
                  <span className="ml-2 text-blue-900">{data.direction}</span>
                </div>
              )}
              {data.market === 'Crypto' && data.exchange && (
                <div>
                  <span className="text-blue-700 font-medium">Exchange:</span>
                  <span className="ml-2 text-blue-900">{data.exchange} ({data.region})</span>
                </div>
              )}
              <div>
                <span className="text-blue-700 font-medium">Symbols:</span>
                <span className="ml-2 text-blue-900">
                  {data.symbols.length > 0 ? `${data.symbols.length} selected` : 'None selected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Symbol Selection */}
      <div>
        <SymbolPicker
          market={data.market}
          exchangeId={data.market === 'Crypto' ? data.exchangeId : undefined}
          quote={data.market === 'Crypto' ? 'USDT' : data.market === 'Indian Equity' ? 'INR' : 'USD'}
          type="spot"
          value={data.symbols}
          onChange={(symbols) => onChange({ symbols })}
          freeLimit={3}
          isPro={user.isPro}
          onPriceData={(priceData) => {
            console.log('Live price data:', priceData);
          }}
        />
      </div>
    </div>
  );
};

export default BotBasicsStep;
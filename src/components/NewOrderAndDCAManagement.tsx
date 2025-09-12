import React, { useState } from 'react';
import { Settings, Target, TrendingDown, HelpCircle, BarChart3 } from 'lucide-react';

interface NewOrderAndDCAManagementProps {
  value: {
    orderType: 'amo' | 'market';
    takeProfitPercent: number;
    dcaEnabled: boolean;
    dcaConditions: 'lastEntry' | 'averagePrice' | 'positionLoss';
    dcaPercentage: number;
    dcaAmountType: 'ratio' | 'fixed' | 'multiplier';
    dcaFixedAmount: number;
    dcaMultiplier: number;
    tradingIndex: 'NIFTY50' | 'NEXT50' | 'NIFTY250';
    maxDcaOrders: number;
    dcaPerPosition: number;
  };
  onChange: (next: NewOrderAndDCAManagementProps['value']) => void;
  deployCapital?: string;
  className?: string;
}

const NewOrderAndDCAManagement: React.FC<NewOrderAndDCAManagementProps> = ({
  value,
  onChange,
  deployCapital = "Safest: 10%/10%/10%/10%/50%",
  className = ''
}) => {
  const [customDcaInput, setCustomDcaInput] = useState('');

  // Check if deploy capital is in fixed mode
  const isDeployCapitalFixed = () => {
    return deployCapital.startsWith('Fixed:') || deployCapital.startsWith('Custom Fixed:');
  };

  // Get deploy fixed amount
  const getDeployFixedAmount = () => {
    if (deployCapital.startsWith('Fixed: ₹')) {
      const amountStr = deployCapital.replace('Fixed: ₹', '').replace(/,/g, '');
      return Number(amountStr) || 0;
    }
    return 0;
  };

  // Handle order type change
  const handleOrderTypeChange = (orderType: 'amo' | 'market') => {
    onChange({ ...value, orderType });
  };

  // Handle take profit change
  const handleTakeProfitChange = (takeProfitPercent: number) => {
    const clampedPercent = Math.max(0.1, Math.min(100, takeProfitPercent));
    onChange({ ...value, takeProfitPercent: clampedPercent });
  };

  // Handle DCA toggle
  const handleDcaToggle = (enabled: boolean) => {
    onChange({ ...value, dcaEnabled: enabled });
  };

  // Handle DCA conditions change
  const handleDcaConditionsChange = (dcaConditions: 'lastEntry' | 'averagePrice' | 'positionLoss') => {
    onChange({ ...value, dcaConditions });
  };

  // Handle DCA percentage change
  const handleDcaPercentageChange = (dcaPercentage: number) => {
    const clampedPercent = Math.max(0.1, Math.min(50, dcaPercentage));
    onChange({ ...value, dcaPercentage: clampedPercent });
  };

  // Handle DCA amount type change
  const handleDcaAmountTypeChange = (dcaAmountType: 'ratio' | 'fixed' | 'multiplier') => {
    onChange({ ...value, dcaAmountType });
  };

  // Handle trading index change
  const handleTradingIndexChange = (tradingIndex: 'NIFTY50' | 'NEXT50' | 'NIFTY250') => {
    onChange({ ...value, tradingIndex });
  };

  // Handle DCA fixed amount change
  const handleDcaFixedAmountChange = (dcaFixedAmount: number) => {
    const clampedAmount = Math.max(1000, dcaFixedAmount);
    onChange({ ...value, dcaFixedAmount: clampedAmount });
  };

  // Handle DCA multiplier change
  const handleDcaMultiplierChange = (dcaMultiplier: number) => {
    const clampedMultiplier = Math.max(0.1, Math.min(10, dcaMultiplier));
    onChange({ ...value, dcaMultiplier: clampedMultiplier });
  };

  // Handle max DCA orders change
  const handleMaxDcaOrdersChange = (maxDcaOrders: number) => {
    const clampedOrders = Math.max(1, Math.min(50, Math.round(maxDcaOrders)));
    onChange({ ...value, maxDcaOrders: clampedOrders });
  };

  // Handle DCA per position change
  const handleDcaPerPositionChange = (dcaPerPosition: number) => {
    const clampedDcaPerPosition = Math.max(1, Math.min(20, Math.round(dcaPerPosition)));
    onChange({ ...value, dcaPerPosition: clampedDcaPerPosition });
  };

  // Get order type text
  const getOrderTypeText = (type: 'amo' | 'market') => {
    return type === 'amo' ? 'AMO Order' : 'Market Order';
  };

  // Get DCA conditions text
  const getDcaConditionsText = (conditions: 'lastEntry' | 'averagePrice' | 'positionLoss') => {
    switch (conditions) {
      case 'lastEntry': return 'From Last Entry';
      case 'averagePrice': return 'From Average Price';
      case 'positionLoss': return 'Position Loss';
      default: return 'From Last Entry';
    }
  };

  // Get trading index text
  const getTradingIndexText = (index: 'NIFTY50' | 'NEXT50' | 'NIFTY250') => {
    switch (index) {
      case 'NIFTY50': return 'Nifty 50 Stocks';
      case 'NEXT50': return 'Nifty Next 50';
      case 'NIFTY250': return 'Nifty 250';
      default: return 'Nifty 50 Stocks';
    }
  };

  // Get DCA amount type text
  const getDcaAmountTypeText = (type: 'ratio' | 'fixed' | 'multiplier') => {
    switch (type) {
      case 'ratio': return 'Ratio (Same as Deploy)';
      case 'fixed': return 'Fixed Amount';
      case 'multiplier': return 'Multiplier';
      default: return 'Ratio (Same as Deploy)';
    }
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 md:p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Order & DCA Management</h3>
        <button 
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => {/* placeholder */}}
          aria-label="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Layout */}
      <div className="space-y-3">
        {/* Row 1: Order Type and Trading Index */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Order Type
            </label>
            <div className="flex bg-gray-100 rounded-md p-0.5">
              <button
                onClick={() => handleOrderTypeChange('amo')}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  value.orderType === 'amo'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                AMO
              </button>
              <button
                onClick={() => handleOrderTypeChange('market')}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  value.orderType === 'market'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Market
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Order execution type</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Trading Index
            </label>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handleTradingIndexChange('NIFTY50')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                  value.tradingIndex === 'NIFTY50'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Nifty 50
              </button>
              <button
                onClick={() => handleTradingIndexChange('NEXT50')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                  value.tradingIndex === 'NEXT50'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next 50
              </button>
              <button
                onClick={() => handleTradingIndexChange('NIFTY250')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                  value.tradingIndex === 'NIFTY250'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Nifty 250
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Market index selection</p>
          </div>
        </div>

        {/* Row 2: Take Profit and DCA Conditions */}
        <div className="grid grid-cols-2 gap-4">
          {/* Take Profit - Left side */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Take Profit
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="100"
                value={value.takeProfitPercent}
                onChange={(e) => handleTakeProfitChange(Number(e.target.value) || 0.1)}
                className="w-full h-9 px-3 pr-6 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Target profit percentage</p>
          </div>

          {/* DCA Conditions - Right side */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-700">
                DCA Conditions
              </label>
              {isDeployCapitalFixed() && (
                <button
                  onClick={() => handleDcaToggle(!value.dcaEnabled)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    value.dcaEnabled ? 'bg-cyan-600' : 'bg-gray-300'
                  }`}
                  aria-pressed={value.dcaEnabled}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                    value.dcaEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}></div>
                </button>
              )}
            </div>

            {isDeployCapitalFixed() && !value.dcaEnabled ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-2 h-9 flex items-center">
                <span className="text-sm text-gray-600">DCA Disabled</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1 mb-1">
                  <button
                    onClick={() => handleDcaConditionsChange('lastEntry')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      value.dcaConditions === 'lastEntry'
                        ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Last Entry
                  </button>
                  <button
                    onClick={() => handleDcaConditionsChange('averagePrice')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      value.dcaConditions === 'averagePrice'
                        ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Avg Price
                  </button>
                  <button
                    onClick={() => handleDcaConditionsChange('positionLoss')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      value.dcaConditions === 'positionLoss'
                        ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Position Loss
                  </button>
                </div>
                
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={value.dcaPercentage}
                  onChange={(e) => handleDcaPercentageChange(Number(e.target.value) || 0.1)}
                  className="w-full h-9 px-3 pr-6 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="5"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
            )}
            <p className="text-[11px] text-gray-500 mt-1">DCA trigger conditions</p>
          </div>
        </div>

        {/* Row 3: DCA Amount Type (only if DCA is enabled) */}
        {(!isDeployCapitalFixed() || value.dcaEnabled) && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              DCA Amount Type
            </label>
            
            <div className="grid grid-cols-3 gap-2 mb-2">
              {/* Ratio Option - Only show if deploy capital is in ratio mode */}
              {!isDeployCapitalFixed() && (
                <button
                  onClick={() => handleDcaAmountTypeChange('ratio')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                    value.dcaAmountType === 'ratio'
                      ? 'bg-purple-50 border-purple-200 text-purple-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Ratio
                </button>
              )}
              
              <button
                onClick={() => handleDcaAmountTypeChange('fixed')}
                disabled={!isDeployCapitalFixed() && value.dcaAmountType !== 'fixed'}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                  value.dcaAmountType === 'fixed'
                    ? 'bg-purple-50 border-purple-200 text-purple-800'
                    : !isDeployCapitalFixed() && value.dcaAmountType !== 'fixed'
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Fixed
              </button>
              
              <button
                onClick={() => handleDcaAmountTypeChange('multiplier')}
                disabled={!isDeployCapitalFixed() && value.dcaAmountType !== 'multiplier'}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                  value.dcaAmountType === 'multiplier'
                    ? 'bg-purple-50 border-purple-200 text-purple-800'
                    : !isDeployCapitalFixed() && value.dcaAmountType !== 'multiplier'
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                >
                Multiplier
              </button>
            </div>

            {/* DCA Amount Configuration - 2 column grid for proper alignment */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column: Amount Input */}
              <div>
                {value.dcaAmountType === 'ratio' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-2 h-9 flex items-center">
                    <span className="text-sm text-blue-800">Same as Deploy</span>
                  </div>
                )}
                
                {value.dcaAmountType === 'fixed' && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={value.dcaFixedAmount}
                      onChange={(e) => handleDcaFixedAmountChange(Number(e.target.value) || 1000)}
                      className="w-full h-9 pl-8 pr-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="10000"
                    />
                  </div>
                )}
                
                {value.dcaAmountType === 'multiplier' && (
                  <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={value.dcaMultiplier}
                    onChange={(e) => handleDcaMultiplierChange(Number(e.target.value) || 0.1)}
                    className="w-full h-9 px-3 pr-6 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="1.0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">x</span>
                  </div>
                )}
              </div>

              {/* Right Column: Max DCA Orders (only for Fixed and Multiplier) */}
              <div>
                {value.dcaAmountType !== 'ratio' ? (
                  <>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Max DCA Orders
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={value.maxDcaOrders}
                      onChange={(e) => handleMaxDcaOrdersChange(Number(e.target.value) || 1)}
                      className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="10"
                    />
                  </>
                ) : (
                  <div className="h-9"></div> // Spacer for alignment
                )}
              </div>
            </div>
            
            {/* Help Text Row */}
            <div className="grid grid-cols-2 gap-4 mt-1">
              <p className="text-[11px] text-gray-500">
                {value.dcaAmountType === 'ratio' && 'Uses deploy capital ratio'}
                {value.dcaAmountType === 'fixed' && 'Fixed DCA amount'}
                {value.dcaAmountType === 'multiplier' && getDeployFixedAmount() > 0 && 
                  `Amount: ₹${(getDeployFixedAmount() * value.dcaMultiplier).toLocaleString()}`}
              </p>
              {value.dcaAmountType !== 'ratio' && (
                <p className="text-[11px] text-gray-500">Maximum DCA orders</p>
              )}
            </div>

            {/* DCA Per Position (only for Fixed and Multiplier) */}
            {value.dcaAmountType !== 'ratio' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  DCA Per Position
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={value.dcaPerPosition}
                  onChange={(e) => handleDcaPerPositionChange(Number(e.target.value) || 1)}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="10"
                />
                <p className="text-[11px] text-gray-500 mt-1">Max DCA orders per position</p>
              </div>
            )}

            {/* Info for Ratio Mode */}
            {value.dcaAmountType === 'ratio' && !isDeployCapitalFixed() && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-2">
                <div className="text-xs text-blue-800">
                  ℹ️ DCA will use same ratio as Deploy Capital configuration
                </div>
              </div>
            )}
          </div>
        )}

        {/* Max Positions - Full width below */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Max Positions
          </label>
          <input
            type="number"
            value={value.maxPositions}
            onChange={(e) => handleMaxPositionsChange(Number(e.target.value) || 1)}
            className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="100"
            step="1"
          />
          <p className="text-[11px] text-gray-500 mt-1">Maximum concurrent positions</p>
        </div>

        {/* Links Row */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {/* placeholder */}}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <BarChart3 className="w-3 h-3" />
              <span>DCA Strategy Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderAndDCAManagement;
import React from 'react';
import { Settings, BarChart3, Target, TrendingDown, Edit3, DollarSign } from 'lucide-react';

interface OrderAndDCAManagementProps {
  orderType?: string;
  takeProfitPercent?: number;
  dcaConditions?: string;
  dcaPercentage?: number;
  tradingIndex?: string;
  dcaAmountType?: string;
  dcaFixedAmount?: number;
  dcaMultiplier?: number;
  dcaOrdersCount?: number;
  dcaPerPosition?: number;
  deployCapital?: string;
  dcaEnabled?: boolean;
  onUpdateSettings?: (settings: {
    orderType: string;
    takeProfitPercent: number;
    dcaConditions: string;
    dcaPercentage: number;
    tradingIndex: string;
    dcaAmountType: string;
    dcaFixedAmount: number;
    dcaMultiplier: number;
    dcaOrdersCount: number;
    dcaPerPosition: number;
  }) => void;
  botType?: string;
}

const OrderAndDCAManagement: React.FC<OrderAndDCAManagementProps> = ({
  orderType = "AMO Order",
  takeProfitPercent = 6.28,
  dcaConditions = "From Last Entry",
  dcaPercentage = 5,
  tradingIndex = "Nifty 50 Stocks",
  dcaAmountType = "ratio",
  dcaFixedAmount = 10000,
  dcaMultiplier = 1.0,
  dcaPerPosition = 10,
  deployCapital = "Safest: 10%/10%/10%/10%/50%",
  dcaEnabled = true,
  onUpdateSettings,
  botType = "RSI Compounder"
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editSettings, setEditSettings] = React.useState({
    orderType,
    takeProfitPercent,
    dcaConditions,
    dcaPercentage,
    tradingIndex,
    dcaAmountType,
    dcaFixedAmount,
    dcaMultiplier,
    dcaPerPosition
  });
  const [orderTypeOption, setOrderTypeOption] = React.useState('amo');
  const [dcaConditionsOption, setDcaConditionsOption] = React.useState('lastEntry');
  const [tradingIndexOption, setTradingIndexOption] = React.useState('NIFTY50');
  const [dcaAmountTypeOption, setDcaAmountTypeOption] = React.useState(dcaAmountType);

  // Get order type text based on option
  const getOrderTypeText = (option: string) => {
    switch (option) {
      case 'amo': return 'AMO Order';
      case 'regular': return 'Market Order';
      default: return 'AMO Order';
    }
  };

  // Get trading index text based on option
  const getTradingIndexText = (option: string) => {
    switch (option) {
      case 'NIFTY50': return 'Nifty 50 Stocks';
      case 'NEXT50': return 'Nifty Next 50';
      case 'NIFTY250': return 'Nifty 250';
      default: return 'Nifty 50 Stocks';
    }
  };

  // Get DCA amount type text
  const getDcaAmountTypeText = (option: string) => {
    switch (option) {
      case 'ratio': return 'Ratio (Same as Deploy)';
      case 'fixed': return 'Fixed Amount';
      case 'multiplier': return 'Multiplier';
      default: return 'Ratio (Same as Deploy)';
    }
  };

  // Check if deploy capital is in ratio mode
  const isDeployCapitalRatio = () => {
    return !deployCapital.startsWith('Fixed:');
  };

  // Check if deploy capital is in fixed mode
  const isDeployCapitalFixed = () => {
    return deployCapital.startsWith('Fixed:') || deployCapital.startsWith('Custom Fixed:');
  };

  // Get fixed amount from deploy capital
  const getDeployFixedAmount = () => {
    if (deployCapital.startsWith('Fixed: ₹')) {
      const amountStr = deployCapital.replace('Fixed: ₹', '').replace(/,/g, '');
      return Number(amountStr) || 0;
    }
    return 0;
  };

  const handleSaveChanges = () => {
    const orderTypeText = orderTypeOption === 'amo' ? 'AMO Order' : 'Market Order';
    const dcaConditionsText = 
      dcaConditionsOption === 'lastEntry' ? 'From Last Entry' :
      dcaConditionsOption === 'averagePrice' ? 'From Average Price' :
      'Position Loss';
    const tradingIndexText = 
      tradingIndexOption === 'NIFTY50' ? 'Nifty 50 Stocks' :
      tradingIndexOption === 'NEXT50' ? 'Nifty Next 50' :
      'Nifty 250';
    const dcaAmountTypeText = getDcaAmountTypeText(dcaAmountTypeOption);

    const updatedSettings = {
      orderType: orderTypeText,
      takeProfitPercent: editSettings.takeProfitPercent,
      dcaConditions: dcaConditionsText,
      dcaPercentage: editSettings.dcaPercentage,
      tradingIndex: tradingIndexText,
      dcaAmountType: dcaAmountTypeText,
      dcaFixedAmount: editSettings.dcaFixedAmount,
      dcaMultiplier: editSettings.dcaMultiplier,
      dcaPerPosition: editSettings.dcaPerPosition
    };

    setEditSettings(updatedSettings);

    if (onUpdateSettings) {
      onUpdateSettings(updatedSettings);
    }
    
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Order & DCA Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configure order execution and DCA settings</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (isEditing) {
              handleSaveChanges();
            } else {
              setIsEditing(true);
            }
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {isEditing ? 'Save Changes' : 'Edit Settings'}
        </button>
      </div>

      {isEditing ? (
        /* Edit Form */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Order Type */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center mr-2">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Order Type</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Execution</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => setOrderTypeOption('amo')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  orderTypeOption === 'amo'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">AMO</div>
              </button>
              
              <button
                onClick={() => setOrderTypeOption('regular')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  orderTypeOption === 'regular'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">Market</div>
              </button>
            </div>
          </div>

          {/* Trading Index */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mr-2">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Trading Index</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Market</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => setTradingIndexOption('NIFTY50')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  tradingIndexOption === 'NIFTY50'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">📊 Nifty 50</div>
              </button>
              
              <button
                onClick={() => setTradingIndexOption('NEXT50')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  tradingIndexOption === 'NEXT50'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">📈 Next 50</div>
              </button>
              
              <button
                onClick={() => setTradingIndexOption('NIFTY250')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  tradingIndexOption === 'NIFTY250'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">📊 Nifty 250</div>
              </button>
            </div>
          </div>

          {/* Take Profit */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center mr-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Take Profit</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Target %</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={editSettings.takeProfitPercent}
                onChange={(e) => setEditSettings({...editSettings, takeProfitPercent: Number(e.target.value)})}
                className="w-full px-3 pr-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>

          {/* DCA Conditions */}
          <div className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 ${
            isDeployCapitalFixed() && !dcaEnabled ? 'opacity-50' : ''
          }`}>
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-cyan-600 rounded-md flex items-center justify-center mr-2">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">DCA Conditions</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Trigger</p>
              </div>
              {/* DCA Enable/Disable Toggle for Fixed Deploy Capital */}
              {isDeployCapitalFixed() && (
                <div className="ml-auto">
                  <button
                    onClick={() => setDcaEnabled(!dcaEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      dcaEnabled ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                      dcaEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              )}
            </div>
            
            {/* Show DCA disabled message for Fixed Deploy Capital */}
            {isDeployCapitalFixed() && !dcaEnabled ? (
              <div className="bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg p-3">
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium text-center">
                  DCA Disabled
                </div>
                <div className="text-gray-500 dark:text-gray-500 text-xs text-center mt-1">
                  Only initial entry orders will be placed
                </div>
              </div>
            ) : (
              <div>
              <div className="space-y-1">
              <button
                onClick={() => setDcaConditionsOption('lastEntry')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  dcaConditionsOption === 'lastEntry'
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700 text-cyan-800 dark:text-cyan-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                disabled={isDeployCapitalFixed() && !dcaEnabled}
              >
                <div className="font-medium">Last Entry</div>
              </button>
              
              <button
                onClick={() => setDcaConditionsOption('averagePrice')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  dcaConditionsOption === 'averagePrice'
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700 text-cyan-800 dark:text-cyan-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                disabled={isDeployCapitalFixed() && !dcaEnabled}
              >
                <div className="font-medium">Average Price</div>
              </button>
              
              <button
                onClick={() => setDcaConditionsOption('positionLoss')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  dcaConditionsOption === 'positionLoss'
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700 text-cyan-800 dark:text-cyan-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                disabled={isDeployCapitalFixed() && !dcaEnabled}
              >
                <div className="font-medium">Position Loss</div>
              </button>
              </div>
            
              {/* DCA Percentage Input */}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  DCA Trigger %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={editSettings.dcaPercentage}
                    onChange={(e) => setEditSettings({...editSettings, dcaPercentage: Number(e.target.value)})}
                    disabled={isDeployCapitalFixed() && !dcaEnabled}
                    className="w-full px-3 pr-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              </div>
            )}
          </div>

          {/* DCA Amount */}
          <div className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 ${
            (isDeployCapitalFixed() && !dcaEnabled) ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center mr-2">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">DCA Amount</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Order size</p>
              </div>
            </div>
            
            <div className="space-y-2">
                {/* DCA Amount Type Selection */}
                <div className="space-y-1">
                  {/* Ratio Option - Only show if deploy capital is in ratio mode */}
                  {isDeployCapitalRatio() && (
                    <button
                      onClick={() => setDcaAmountTypeOption('ratio')}
                      disabled={(isDeployCapitalFixed() && !dcaEnabled)}
                      className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                        dcaAmountTypeOption === 'ratio'
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">Ratio</div>
                      <div className="text-xs opacity-75">Same as Deploy</div>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setDcaAmountTypeOption('fixed')}
                    disabled={(isDeployCapitalFixed() && !dcaEnabled)}
                    className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                      dcaAmountTypeOption === 'fixed'
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300'
                        : isDeployCapitalRatio() 
                          ? 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">Fixed Amount</div>
                    {isDeployCapitalRatio() && (
                      <div className="text-xs opacity-75 text-gray-400">Not available for ratio mode</div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setDcaAmountTypeOption('multiplier')}
                    disabled={(isDeployCapitalFixed() && !dcaEnabled)}
                    className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                      dcaAmountTypeOption === 'multiplier'
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300'
                        : isDeployCapitalRatio() 
                          ? 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">Multiplier</div>
                    {isDeployCapitalRatio() && (
                      <div className="text-xs opacity-75 text-gray-400">Not available for ratio mode</div>
                    )}
                  </button>
                </div>
              
                {/* Fixed Amount Input */}
                {dcaAmountTypeOption === 'fixed' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fixed Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                      <input
                        type="number"
                        min="1000"
                        value={editSettings.dcaFixedAmount}
                        onChange={(e) => setEditSettings({...editSettings, dcaFixedAmount: Number(e.target.value)})}
                        disabled={(isDeployCapitalFixed() && !dcaEnabled)}
                        className="w-full pl-8 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        placeholder="10000"
                      />
                    </div>
                  </div>
                )}
              
                {/* Multiplier Input */}
                {dcaAmountTypeOption === 'multiplier' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Multiplier (0.10x - 10x)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        value={editSettings.dcaMultiplier}
                        onChange={(e) => setEditSettings({...editSettings, dcaMultiplier: Number(e.target.value)})}
                        disabled={(isDeployCapitalFixed() && !dcaEnabled)}
                        className="w-full px-3 pr-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        placeholder="1.0"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">x</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {getDeployFixedAmount() > 0 && (
                        <>DCA Amount: ₹{(getDeployFixedAmount() * editSettings.dcaMultiplier).toLocaleString()}</>
                      )}
                    </div>
                  </div>
                )}
              
                {/* Info for Ratio Mode */}
                {dcaAmountTypeOption === 'ratio' && isDeployCapitalRatio() && (
                  <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2">
                    <div className="text-xs text-blue-800 dark:text-blue-300">
                      ℹ️ DCA will use same ratio as Deploy Capital
                    </div>
                  </div>
                )}
              
                {/* Max DCA Orders Input - Only for Fixed and Multiplier */}
                {dcaAmountTypeOption !== 'ratio' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max DCA Orders
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={editSettings.dcaOrdersCount}
                      onChange={(e) => setEditSettings({...editSettings, dcaOrdersCount: Number(e.target.value)})}
                      disabled={(isDeployCapitalFixed() && !dcaEnabled)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      placeholder="10"
                    />
                  </div>
                )}
              
                {/* No of DCA per Position Input - Only for Fixed and Multiplier */}
               {dcaAmountTypeOption !== 'ratio' && (
                 <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    No of DCA per Position
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editSettings.dcaPerPosition || 10}
                    onChange={(e) => setEditSettings({...editSettings, dcaPerPosition: Number(e.target.value)})}
                    disabled={(isDeployCapitalFixed() && !dcaEnabled)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="10"
                  />
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Maximum DCA orders per individual position
                  </div>
                </div>
               )}
              </div>
          </div>
        </div>
      ) : (
        /* Display Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Order Type */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center mr-2">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Order Type</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Execution</p>
              </div>
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-gray-100">
              {getOrderTypeText(orderTypeOption)}
            </div>
          </div>

          {/* Trading Index */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mr-2">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Trading Index</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Market</p>
              </div>
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
              {getTradingIndexText(tradingIndexOption)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Selected market index
            </div>
          </div>

          {/* Take Profit */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center mr-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Take Profit</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Target %</p>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              {editSettings.takeProfitPercent}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Target profit percentage
            </div>
          </div>

          {/* DCA Conditions */}
          <div className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 ${
            isDeployCapitalFixed() && !dcaEnabled ? 'opacity-50' : ''
          }`}>
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-cyan-600 rounded-md flex items-center justify-center mr-2">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">DCA Conditions</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Trigger</p>
              </div>
              {/* DCA Enable/Disable Toggle for Fixed Deploy Capital */}
              {isDeployCapitalFixed() && (
                <div className="ml-auto">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    dcaEnabled 
                      ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500'
                  }`}>
                    {dcaEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Show DCA disabled message for Fixed Deploy Capital when DCA is disabled */}
            {isDeployCapitalFixed() && !dcaEnabled ? (
              <div className="bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg p-3">
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium text-center">
                  DCA Disabled
                </div>
                <div className="text-gray-500 dark:text-gray-500 text-xs text-center mt-1">
                  Only initial entry orders will be placed
                </div>
              </div>
            ) : (
              <>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {editSettings.dcaConditions}
                </div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">
                  {editSettings.dcaPercentage}% Trigger
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  DCA activation threshold
                </div>
              </>
            )}
          </div>

          {/* DCA Amount */}
          <div className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 ${
            (isDeployCapitalFixed() && !dcaEnabled) ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center mr-2">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">DCA Amount</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Order size</p>
              </div>
            </div>
            
            {(isDeployCapitalFixed() && !dcaEnabled) ? (
              /* Show DCA disabled message for Fixed Deploy Capital when DCA is disabled */
              <div className="bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg p-3">
                <div className="text-gray-600 dark:text-gray-400 text-sm font-medium text-center">
                  DCA Disabled
                </div>
                <div className="text-gray-500 dark:text-gray-500 text-xs text-center mt-1">
                  Only initial entry orders will be placed
                </div>
              </div>
            ) : (
              /* Normal DCA Amount configuration */
              <>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {getDcaAmountTypeText(dcaAmountTypeOption)}
                </div>
                
                {/* Show specific details based on type */}
                {dcaAmountTypeOption === 'fixed' && (
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    ₹{editSettings.dcaFixedAmount.toLocaleString()}
                  </div>
                )}
                
                {dcaAmountTypeOption === 'multiplier' && (
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {editSettings.dcaMultiplier}x Multiplier
                    </div>
                    {getDeployFixedAmount() > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Amount: ₹{(getDeployFixedAmount() * editSettings.dcaMultiplier).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
                
                {dcaAmountTypeOption === 'ratio' && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Uses deploy capital ratio
                  </div>
                )}
                
                {/* DCA Orders Count Display - Only for Fixed and Multiplier */}
                {dcaAmountTypeOption !== 'ratio' && editSettings.dcaOrdersCount && (
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-2">
                    Max Orders: {editSettings.dcaOrdersCount}
                  </div>
                )}
                
                {/* No of DCA per Position Display - Only for Fixed and Multiplier */}
                {dcaAmountTypeOption !== 'ratio' && editSettings.dcaPerPosition && (
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                    Per Position: {editSettings.dcaPerPosition}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderAndDCAManagement;
import React, { useState, useEffect } from 'react';
import { DollarSign, HelpCircle, BarChart3, FileText } from 'lucide-react';

interface NewCapitalManagementProps {
  value: {
    capital: number;
    currency: 'INR' | 'USD' | 'EUR' | 'AUD' | 'GBP' | 'AED';
    stepMode: 'percent' | 'fixed';
    stepPercent: number;
    stepFixed: number;
    deployPlan: string;
    reinvestEnabled: boolean;
    reinvestPercent: number;
    dcaEnabled: boolean;
    maxPositions: number;
  };
  onChange: (next: NewCapitalManagementProps['value']) => void;
  onOpenCompounding?: () => void;
  onOpenDeployment?: () => void;
  className?: string;
}

const NewCapitalManagement: React.FC<NewCapitalManagementProps> = ({
  value,
  onChange,
  onOpenCompounding,
  onOpenDeployment,
  className = ''
}) => {
  const [customDeployInput, setCustomDeployInput] = useState('');
  const [deployError, setDeployError] = useState('');

  // Currency symbol mapping
  const getCurrencySymbol = (currency: string) => {
    const symbols = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      AUD: 'A$',
      GBP: '£',
      AED: 'د.إ'
    };
    return symbols[currency as keyof typeof symbols] || '$';
  };

  // Load currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('tbp_currency');
    if (savedCurrency && ['INR', 'USD', 'EUR', 'AUD', 'GBP', 'AED'].includes(savedCurrency)) {
      onChange({ ...value, currency: savedCurrency as any });
    }
  }, []);

  // Save currency to localStorage
  const handleCurrencyChange = (currency: string) => {
    localStorage.setItem('tbp_currency', currency);
    onChange({ ...value, currency: currency as any });
  };

  // Clamp values to valid ranges
  const clampValue = (val: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, val));
  };

  // Calculate derived values
  const derivedAmount = value.stepMode === 'percent' 
    ? value.capital * value.stepPercent / 100 
    : value.stepFixed;
  
  const derivedPercent = value.stepMode === 'fixed' 
    ? (value.stepFixed / value.capital) * 100 
    : value.stepPercent;

  // Validate custom deploy plan
  const validateCustomDeploy = (input: string): { isValid: boolean; error: string } => {
    if (!input.trim()) {
      return { isValid: false, error: 'Custom ratio cannot be empty' };
    }

    if (!input.includes('%')) {
      return { isValid: false, error: 'Percentages must include % sign' };
    }

    const parts = input.split('/');
    if (parts.length < 2) {
      return { isValid: false, error: 'Enter at least 2 percentages separated by /' };
    }

    let total = 0;
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed.endsWith('%')) {
        return { isValid: false, error: 'Each percentage must end with %' };
      }

      const numberStr = trimmed.slice(0, -1);
      const number = parseFloat(numberStr);
      
      if (isNaN(number) || number < 0) {
        return { isValid: false, error: `Invalid percentage: ${trimmed}` };
      }

      if (number > 100) {
        return { isValid: false, error: `Percentage cannot exceed 100%: ${trimmed}` };
      }

      total += number;
    }

    if (Math.abs(total - 100) > 0.01) {
      return { isValid: false, error: `Total must equal 100%. Current: ${total.toFixed(1)}%` };
    }

    return { isValid: true, error: '' };
  };

  // Handle custom deploy input
  const handleCustomDeployChange = (input: string) => {
    setCustomDeployInput(input);
    const validation = validateCustomDeploy(input);
    
    if (validation.isValid) {
      setDeployError('');
      onChange({ ...value, deployPlan: `Custom: ${input}` });
    } else {
      setDeployError(validation.error);
    }
  };

  // Handle deploy preset selection
  const handleDeployPreset = (preset: string) => {
    setCustomDeployInput('');
    setDeployError('');
    onChange({ ...value, deployPlan: preset });
  };

  // Handle step mode change
  const handleStepModeChange = (mode: 'percent' | 'fixed') => {
    if (mode === 'fixed' && value.stepMode === 'percent') {
      // Convert current percentage to fixed amount
      const fixedAmount = value.capital * value.stepPercent / 100;
      onChange({ 
        ...value, 
        stepMode: mode, 
        stepFixed: Math.round(fixedAmount),
        deployPlan: `Fixed: ${Math.round(fixedAmount)}`
      });
    } else if (mode === 'percent' && value.stepMode === 'fixed') {
      // Convert current fixed amount to percentage
      const percent = (value.stepFixed / value.capital) * 100;
      onChange({ 
        ...value, 
        stepMode: mode, 
        stepPercent: clampValue(percent, 0, 100)
      });
    } else {
      onChange({ ...value, stepMode: mode });
    }
  };

  // Handle capital change
  const handleCapitalChange = (capital: number) => {
    const clampedCapital = clampValue(capital, 0, Infinity);
    
    // If in fixed mode, ensure stepFixed doesn't exceed capital
    let updates: any = { capital: clampedCapital };
    if (value.stepMode === 'fixed' && value.stepFixed > clampedCapital) {
      updates.stepFixed = clampedCapital;
    }
    
    onChange({ ...value, ...updates });
  };

  // Handle step percent change
  const handleStepPercentChange = (percent: number) => {
    const clampedPercent = clampValue(percent, 0, 100);
    onChange({ ...value, stepPercent: clampedPercent });
  };

  // Handle step fixed change
  const handleStepFixedChange = (fixed: number) => {
    const clampedFixed = clampValue(fixed, 0, value.capital);
    onChange({ 
      ...value, 
      stepFixed: clampedFixed,
      deployPlan: `Fixed: ${clampedFixed}`
    });
  };

  // Handle reinvest toggle
  const handleReinvestToggle = (enabled: boolean) => {
    onChange({ 
      ...value, 
      reinvestEnabled: enabled,
      reinvestPercent: enabled ? (value.reinvestPercent || 50) : 0
    });
  };

  // Handle reinvest percent change
  const handleReinvestPercentChange = (percent: number) => {
    const clampedPercent = clampValue(percent, 0, 100);
    onChange({ ...value, reinvestPercent: clampedPercent });
  };

  // Handle max positions change
  const handleMaxPositionsChange = (positions: number) => {
    const clampedPositions = Math.max(1, Math.round(positions));
    onChange({ ...value, maxPositions: clampedPositions });
  };

  // Format compact number
  const formatCompactNumber = (amount: number) => {
    const symbol = getCurrencySymbol(value.currency);
    if (amount >= 10000000) {
      return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `${symbol}${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    } else {
      return `${symbol}${amount.toFixed(0)}`;
    }
  };

  const currencySymbol = getCurrencySymbol(value.currency);

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 md:p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Capital Management</h3>
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
        {/* Row 1: Total Capital and Deploy Capital */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Total Capital
            </label>
            <div className="flex">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  value={value.capital}
                  onChange={(e) => handleCapitalChange(Number(e.target.value) || 0)}
                  className="w-full h-9 pl-8 pr-3 bg-white border border-gray-300 rounded-l-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="1000"
                />
              </div>
              <select
                value={value.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="h-9 px-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="AUD">AUD</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
              </select>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Total trading capital available</p>
          </div>

          {/* Deploy Capital - Right side of row 1 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Deploy Capital
            </label>
            
            {value.stepMode === 'fixed' ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-2 h-9 flex items-center">
                <span className="text-sm text-gray-600">Fixed Mode</span>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Preset buttons */}
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => handleDeployPreset('Safest: 10%/10%/10%/10%/50%')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      value.deployPlan === 'Safest: 10%/10%/10%/10%/50%'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Safest
                  </button>
                  <button
                    onClick={() => handleDeployPreset('Equal: 25%/25%/25%/25%')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      value.deployPlan === 'Equal: 25%/25%/25%/25%'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Equal
                  </button>
                  <button
                    onClick={() => handleDeployPreset('Aggressive: 40%/30%/20%/10%')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      value.deployPlan === 'Aggressive: 40%/30%/20%/10%'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Aggressive
                  </button>
                  <button
                    onClick={() => {
                      setCustomDeployInput('');
                      setDeployError('');
                      onChange({ ...value, deployPlan: 'Custom: ' });
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      value.deployPlan.startsWith('Custom:')
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Custom
                  </button>
                </div>
                
               {/* Show selected preset percentages */}
               {(value.deployPlan === 'Safest: 10%/10%/10%/10%/50%' || 
                 value.deployPlan === 'Equal: 25%/25%/25%/25%' || 
                 value.deployPlan === 'Aggressive: 40%/30%/20%/10%') && (
                 <div className="mt-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                   {value.deployPlan.split(': ')[1]}
                 </div>
               )}
               
                {/* Custom input */}
                <input
                  type="text"
                  placeholder="20%/30%/25%/25%"
                  value={customDeployInput}
                  disabled={!value.deployPlan.startsWith('Custom:')}
                  onChange={(e) => {
                    setCustomDeployInput(e.target.value);
                    handleCustomDeployChange(e.target.value);
                  }}
                  className={`w-full h-9 px-3 bg-white border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
                    deployError 
                      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                      : !value.deployPlan.startsWith('Custom:')
                      ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  aria-describedby="deploy-error"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between mt-1">
              {deployError ? (
                <p id="deploy-error" className="text-[11px] text-red-600" role="alert">
                  {deployError}
                </p>
              ) : (
                <p className="text-[11px] text-gray-500">Distribution strategy</p>
              )}
              {value.stepMode !== 'fixed' && onOpenDeployment && (
                <button
                  onClick={onOpenDeployment}
                  className="text-[11px] text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View Plan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Step Size (left) and Reinvest (right) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column: Step Size and Max Positions */}
          <div>
            {/* Step Size */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Step Size
              </label>
              
              {/* Segmented Toggle */}
              <div className="flex bg-gray-100 rounded-md p-0.5 mb-2">
                <button
                  onClick={() => handleStepModeChange('percent')}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    value.stepMode === 'percent'
                      ? 'bg-blue-50 border border-blue-200 text-blue-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-pressed={value.stepMode === 'percent'}
                >
                  Percent
                </button>
                <button
                  onClick={() => handleStepModeChange('fixed')}
                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    value.stepMode === 'fixed'
                      ? 'bg-blue-50 border border-blue-200 text-blue-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-pressed={value.stepMode === 'fixed'}
                >
                  Fixed
                </button>
              </div>

              {/* Input based on mode */}
              {value.stepMode === 'percent' ? (
                <div className="relative">
                  <input
                    type="number"
                    value={value.stepPercent}
                    onChange={(e) => handleStepPercentChange(Number(e.target.value) || 0)}
                    className="w-full h-9 px-3 pr-6 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="100"
                    step="0.1"
                    aria-describedby="step-percent-help"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={value.stepFixed}
                    onChange={(e) => handleStepFixedChange(Number(e.target.value) || 0)}
                    className="w-full h-9 pl-8 pr-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max={value.capital}
                    step="100"
                    aria-describedby="step-fixed-help"
                  />
                </div>
              )}
              
              <p id={value.stepMode === 'percent' ? 'step-percent-help' : 'step-fixed-help'} className="text-[11px] text-gray-500 mt-1">
                {value.stepMode === 'percent' 
                  ? `Amount: ${formatCompactNumber(derivedAmount)}`
                  : `Percent: ${derivedPercent.toFixed(1)}%`
                }
              </p>
            </div>

            {/* Max Positions - Below Step Size */}
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
          </div>


          {/* Reinvest - Right side of row 2 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-700">
                Reinvest
              </label>
              <button
                onClick={() => handleReinvestToggle(!value.reinvestEnabled)}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  value.reinvestEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-pressed={value.reinvestEnabled}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                  value.reinvestEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
            
            <div className="relative">
              {/* Cool gradient background when enabled */}
              {value.reinvestEnabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-md animate-pulse"></div>
              )}
              
              <input
                type="number"
                value={value.reinvestEnabled ? value.reinvestPercent : 0}
                onChange={(e) => handleReinvestPercentChange(Number(e.target.value) || 0)}
                disabled={!value.reinvestEnabled}
                className={`relative w-full h-9 px-3 pr-6 border rounded-md text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
                  value.reinvestEnabled 
                    ? 'bg-white border-emerald-300 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm' 
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                }`}
                min="0"
                max="100"
                step="1"
                aria-describedby="reinvest-help"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {value.reinvestEnabled && value.reinvestPercent >= 70 && (
                  <span className="text-emerald-500 text-xs">🚀</span>
                )}
                <span className={`text-sm ${value.reinvestEnabled ? 'text-emerald-600' : 'text-gray-500'}`}>%</span>
              </div>
            </div>
            
            <p id="reinvest-help" className="text-[11px] text-gray-500 mt-1">
              <span className={value.reinvestEnabled && value.reinvestPercent >= 50 ? 'text-emerald-600 font-medium' : ''}>
                Reinvest {value.reinvestEnabled ? value.reinvestPercent : 0}%
              </span>
              {' / '}
              <span className={!value.reinvestEnabled || value.reinvestPercent < 50 ? 'text-amber-600 font-medium' : ''}>
                Withdraw {value.reinvestEnabled ? 100 - value.reinvestPercent : 100}%
              </span>
            </p>
            
            {/* Encouragement for reinvest */}
            {value.reinvestEnabled && value.reinvestPercent >= 50 && (
              <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-md p-2">
                <div className="flex items-start">
                  <div className="text-emerald-600 mr-1">🚀</div>
                  <div>
                    <div className="text-emerald-800 font-medium text-xs">
                      Excellent Choice!
                    </div>
                    <div className="text-emerald-700 text-xs mt-0.5">
                      High reinvestment accelerates compound growth
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Warning for low reinvest percentage */}
            {value.reinvestEnabled && value.reinvestPercent < 50 && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-2">
                <div className="flex items-start">
                  <div className="text-amber-600 mr-1">⚠️</div>
                  <div>
                    <div className="text-amber-800 font-medium text-xs">
                      Slower Growth Alert
                    </div>
                    <div className="text-amber-700 text-xs mt-1">
                      Low reinvestment may significantly delay reaching your capital goals
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Warning when reinvest is disabled */}
            {!value.reinvestEnabled && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-2">
                <div className="flex items-start">
                  <div className="text-red-600 mr-1">🐌</div>
                  <div>
                    <div className="text-red-800 font-medium text-xs">
                      No Compounding
                    </div>
                    <div className="text-red-700 text-xs mt-1">
                      Without reinvestment, you'll miss exponential growth opportunities
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Links Row */}
        <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {onOpenCompounding && (
            <button
              onClick={onOpenCompounding}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <BarChart3 className="w-3 h-3" />
              <span>Compounding Table</span>
            </button>
          )}
          {value.stepMode !== 'fixed' && onOpenDeployment && (
            <button
              onClick={onOpenDeployment}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>Deployment Plan</span>
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default NewCapitalManagement;
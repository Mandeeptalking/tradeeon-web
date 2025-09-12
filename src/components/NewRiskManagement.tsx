import React, { useState } from 'react';
import { Shield, AlertTriangle, Clock, TrendingDown, HelpCircle, Edit3 } from 'lucide-react';

interface NewRiskManagementProps {
  value: {
    stopLossPercent: number;
    stopLossEnabled: boolean;
    lifetimeMode: string;
    recoveryDrip: boolean;
    timeBasedExit: boolean;
    maxDrawdownStop: boolean;
    rangeExit: boolean;
    recoveryDripDays: number;
    recoveryDripMonths: number;
    timeBasedExitDays: number;
    timeBasedExitMonths: number;
    maxDrawdownPercent: number;
    rangeExitDays: number;
    rangeExitMonths: number;
    rangeLowerPercent: number;
    rangeUpperPercent: number;
    riskFeaturePriorities: {
      recoveryDrip: number;
      timeBasedExit: number;
      maxDrawdownStop: number;
      rangeExit: number;
    };
  };
  onChange: (next: NewRiskManagementProps['value']) => void;
  className?: string;
}

const NewRiskManagement: React.FC<NewRiskManagementProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle stop loss toggle
  const handleStopLossToggle = (enabled: boolean) => {
    onChange({ ...value, stopLossEnabled: enabled });
  };

  // Handle stop loss percent change
  const handleStopLossPercentChange = (percent: number) => {
    const clampedPercent = Math.max(10, Math.min(90, percent));
    onChange({ ...value, stopLossPercent: clampedPercent });
  };

  // Handle risk feature toggle
  const handleRiskFeatureToggle = (feature: keyof typeof value.riskFeaturePriorities, enabled: boolean) => {
    onChange({ ...value, [feature]: enabled });
  };

  // Handle recovery drip settings
  const handleRecoveryDripChange = (field: 'recoveryDripDays' | 'recoveryDripMonths', val: number) => {
    const clampedVal = field === 'recoveryDripDays' 
      ? Math.max(0, Math.min(365, val))
      : Math.max(1, Math.min(60, val));
    onChange({ ...value, [field]: clampedVal });
  };

  // Handle time based exit settings
  const handleTimeBasedExitChange = (field: 'timeBasedExitDays' | 'timeBasedExitMonths', val: number) => {
    const clampedVal = field === 'timeBasedExitDays' 
      ? Math.max(0, Math.min(365, val))
      : Math.max(1, Math.min(60, val));
    onChange({ ...value, [field]: clampedVal });
  };

  // Handle max drawdown percent change
  const handleMaxDrawdownPercentChange = (percent: number) => {
    const clampedPercent = Math.max(10, Math.min(90, percent));
    onChange({ ...value, maxDrawdownPercent: clampedPercent });
  };

  // Handle range exit settings
  const handleRangeExitChange = (field: 'rangeLowerPercent' | 'rangeUpperPercent' | 'rangeExitMonths', val: number) => {
    let clampedVal = val;
    if (field === 'rangeLowerPercent') {
      clampedVal = Math.max(-50, Math.min(0, val));
    } else if (field === 'rangeUpperPercent') {
      clampedVal = Math.max(0, Math.min(50, val));
    } else if (field === 'rangeExitMonths') {
      clampedVal = Math.max(1, Math.min(60, val));
    }
    onChange({ ...value, [field]: clampedVal });
  };

  // Count enabled features
  const enabledFeaturesCount = [
    value.recoveryDrip,
    value.timeBasedExit,
    value.maxDrawdownStop,
    value.rangeExit
  ].filter(Boolean).length;

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 md:p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Risk Management</h3>
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
        {/* Row 1: Stop Loss and Lifetime Mode */}
        <div className="grid grid-cols-2 gap-4">
          {/* Stop Loss */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-700">
                Stop Loss
              </label>
              <button
                onClick={() => handleStopLossToggle(!value.stopLossEnabled)}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  value.stopLossEnabled ? 'bg-red-600' : 'bg-gray-300'
                }`}
                aria-pressed={value.stopLossEnabled}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                  value.stopLossEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
            
            <div className="relative">
              <input
                type="number"
                step="1"
                min="10"
                max="90"
                value={value.stopLossPercent}
                onChange={(e) => handleStopLossPercentChange(Number(e.target.value) || 10)}
                disabled={!value.stopLossEnabled}
                className={`w-full h-9 px-3 pr-6 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
                  value.stopLossEnabled 
                    ? 'bg-white border-red-300 text-gray-900 focus:ring-red-500 focus:border-red-500' 
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                }`}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {value.stopLossEnabled ? 'Maximum acceptable loss threshold' : 'Disabled (recommended for CNC/SPOT)'}
            </p>
          </div>

          {/* Lifetime Mode - Informative Only */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Lifetime Mode
            </label>
            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-2 h-9 flex items-center">
              <span className="text-sm text-indigo-800">After Full Deploy</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Features activate after full capital deployment</p>
          </div>
        </div>

        {/* Row 2: Risk Features Toggle */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-700">
              Risk Features ({enabledFeaturesCount} enabled)
            </label>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>

          {/* Feature Toggles - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Recovery Drip */}
            <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💧</span>
                <span className="text-xs font-medium text-gray-700">Recovery Drip</span>
              </div>
              <button
                onClick={() => handleRiskFeatureToggle('recoveryDrip', !value.recoveryDrip)}
                className={`w-6 h-3 rounded-full transition-colors relative ${
                  value.recoveryDrip ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform absolute top-0.25 ${
                  value.recoveryDrip ? 'translate-x-3' : 'translate-x-0.25'
                }`}></div>
              </button>
            </div>

            {/* Time Exit */}
            <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center space-x-2">
                <span className="text-lg">⏰</span>
                <span className="text-xs font-medium text-gray-700">Time Exit</span>
              </div>
              <button
                onClick={() => handleRiskFeatureToggle('timeBasedExit', !value.timeBasedExit)}
                className={`w-6 h-3 rounded-full transition-colors relative ${
                  value.timeBasedExit ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform absolute top-0.25 ${
                  value.timeBasedExit ? 'translate-x-3' : 'translate-x-0.25'
                }`}></div>
              </button>
            </div>

            {/* Max Drawdown */}
            <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📉</span>
                <span className="text-xs font-medium text-gray-700">Max Drawdown</span>
              </div>
              <button
                onClick={() => handleRiskFeatureToggle('maxDrawdownStop', !value.maxDrawdownStop)}
                className={`w-6 h-3 rounded-full transition-colors relative ${
                  value.maxDrawdownStop ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform absolute top-0.25 ${
                  value.maxDrawdownStop ? 'translate-x-3' : 'translate-x-0.25'
                }`}></div>
              </button>
            </div>

            {/* Range Exit */}
            <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <span className="text-xs font-medium text-gray-700">Range Exit</span>
              </div>
              <button
                onClick={() => handleRiskFeatureToggle('rangeExit', !value.rangeExit)}
                className={`w-6 h-3 rounded-full transition-colors relative ${
                  value.rangeExit ? 'bg-yellow-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-transform absolute top-0.25 ${
                  value.rangeExit ? 'translate-x-3' : 'translate-x-0.25'
                }`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Settings - Expandable */}
        {showAdvanced && (
          <div className="space-y-3 pt-3 border-t border-gray-100">
            {/* Recovery Drip Settings */}
            {value.recoveryDrip && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">💧</span>
                  <span className="text-sm font-medium text-blue-800">Recovery Drip Settings</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">Days</label>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={value.recoveryDripDays}
                      onChange={(e) => handleRecoveryDripChange('recoveryDripDays', Number(e.target.value) || 0)}
                      className="w-full h-8 px-2 bg-white border border-blue-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">Months</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={value.recoveryDripMonths}
                      onChange={(e) => handleRecoveryDripChange('recoveryDripMonths', Number(e.target.value) || 1)}
                      className="w-full h-8 px-2 bg-white border border-blue-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Buy 1% more every {value.recoveryDripDays} days for {value.recoveryDripMonths} months
                </p>
              </div>
            )}

            {/* Time Based Exit Settings */}
            {value.timeBasedExit && (
              <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">⏰</span>
                  <span className="text-sm font-medium text-purple-800">Time-Based Exit Settings</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-purple-700 mb-1">Days</label>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={value.timeBasedExitDays}
                      onChange={(e) => handleTimeBasedExitChange('timeBasedExitDays', Number(e.target.value) || 0)}
                      className="w-full h-8 px-2 bg-white border border-purple-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-purple-700 mb-1">Months</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={value.timeBasedExitMonths}
                      onChange={(e) => handleTimeBasedExitChange('timeBasedExitMonths', Number(e.target.value) || 1)}
                      className="w-full h-8 px-2 bg-white border border-purple-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-purple-700 mt-1">
                  Auto-exit if target not hit within {value.timeBasedExitMonths} months
                </p>
              </div>
            )}

            {/* Max Drawdown Settings */}
            {value.maxDrawdownStop && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">📉</span>
                  <span className="text-sm font-medium text-red-800">Max Drawdown Settings</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-red-700 mb-1">Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      max="90"
                      value={value.maxDrawdownPercent}
                      onChange={(e) => handleMaxDrawdownPercentChange(Number(e.target.value) || 10)}
                      className="w-full h-8 px-2 pr-6 bg-white border border-red-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">%</span>
                  </div>
                </div>
                <p className="text-xs text-red-700 mt-1">
                  Cut losses if stock falls &gt;{value.maxDrawdownPercent}% from initial entry
                </p>
              </div>
            )}

            {/* Range Exit Settings */}
            {value.rangeExit && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">📊</span>
                  <span className="text-sm font-medium text-yellow-800">Range-Bound Exit Settings</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-yellow-700 mb-1">Lower %</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="-50"
                        max="0"
                        value={value.rangeLowerPercent}
                        onChange={(e) => handleRangeExitChange('rangeLowerPercent', Number(e.target.value) || -10)}
                        className="w-full h-8 px-2 pr-6 bg-white border border-yellow-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-yellow-700 mb-1">Upper %</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={value.rangeUpperPercent}
                        onChange={(e) => handleRangeExitChange('rangeUpperPercent', Number(e.target.value) || 10)}
                        className="w-full h-8 px-2 pr-6 bg-white border border-yellow-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-yellow-700 mb-1">Months</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={value.rangeExitMonths}
                      onChange={(e) => handleRangeExitChange('rangeExitMonths', Number(e.target.value) || 6)}
                      className="w-full h-8 px-2 bg-white border border-yellow-300 rounded text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Exit if stuck between {value.rangeLowerPercent}% to {value.rangeUpperPercent}% for {value.rangeExitMonths} months
                </p>
              </div>
            )}
          </div>
        )}

        {/* Warning Messages */}
        {value.stopLossEnabled && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start">
              <div className="text-red-600 mr-2">⚠️</div>
              <div>
                <div className="text-red-800 font-medium text-xs">Stop Loss Override Warning</div>
                <div className="text-red-700 text-xs mt-1">
                  Stop Loss will OVERRIDE all other Risk Management Features
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Links Row */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {/* placeholder */}}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Shield className="w-3 h-3" />
              <span>Risk Strategy Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRiskManagement;
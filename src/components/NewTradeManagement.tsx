import React, { useState } from 'react';
import { Settings, Calendar, TrendingUp, HelpCircle, BarChart3, AlertCircle } from 'lucide-react';

interface NewTradeManagementProps {
  value: {
    maxNewPositionsPerDay: number;
    maxDcaExecutionsPerDay: number;
    dcaNewEntrySameDay: boolean;
    maxDcaPerStockPerWeek: number;
    reEntryCooldownDays: number;
    reEntryCooldownEnabled: boolean;
    maxOpenPositions: number;
    dcaPriorityLogic: {
      highestDrawdown: boolean;
      longestTimeSinceLastDca: boolean;
      oldestPosition: boolean;
    };
  };
  onChange: (next: NewTradeManagementProps['value']) => void;
  className?: string;
}

const NewTradeManagement: React.FC<NewTradeManagementProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle daily limits changes
  const handleMaxNewPositionsChange = (maxNewPositionsPerDay: number) => {
    const clampedValue = Math.max(1, Math.min(10, Math.round(maxNewPositionsPerDay)));
    onChange({ ...value, maxNewPositionsPerDay: clampedValue });
  };

  const handleMaxDcaExecutionsChange = (maxDcaExecutionsPerDay: number) => {
    const clampedValue = Math.max(1, Math.min(10, Math.round(maxDcaExecutionsPerDay)));
    onChange({ ...value, maxDcaExecutionsPerDay: clampedValue });
  };

  const handleDcaNewEntrySameDayToggle = (dcaNewEntrySameDay: boolean) => {
    onChange({ ...value, dcaNewEntrySameDay });
  };

  const handleMaxDcaPerStockPerWeekChange = (maxDcaPerStockPerWeek: number) => {
    const clampedValue = Math.max(1, Math.min(7, Math.round(maxDcaPerStockPerWeek)));
    onChange({ ...value, maxDcaPerStockPerWeek: clampedValue });
  };

  // Handle re-entry cooldown
  const handleReEntryCooldownToggle = (enabled: boolean) => {
    onChange({ ...value, reEntryCooldownEnabled: enabled });
  };

  const handleReEntryCooldownDaysChange = (reEntryCooldownDays: number) => {
    const clampedValue = Math.max(0, Math.min(365, Math.round(reEntryCooldownDays)));
    onChange({ ...value, reEntryCooldownDays: clampedValue });
  };

  const handleMaxOpenPositionsChange = (maxOpenPositions: number) => {
    const clampedValue = Math.max(1, Math.min(100, Math.round(maxOpenPositions)));
    onChange({ ...value, maxOpenPositions: clampedValue });
  };

  // Handle DCA priority logic (only one can be selected at a time)
  const handleDcaPriorityChange = (priority: keyof typeof value.dcaPriorityLogic, enabled: boolean) => {
    const newPriorityLogic = {
      highestDrawdown: false,
      longestTimeSinceLastDca: false,
      oldestPosition: false
    };
    
    if (enabled) {
      newPriorityLogic[priority] = true;
    }
    
    onChange({ ...value, dcaPriorityLogic: newPriorityLogic });
  };

  // Get active priority text
  const getActivePriorityText = () => {
    if (value.dcaPriorityLogic.highestDrawdown) return 'Highest Drawdown';
    if (value.dcaPriorityLogic.longestTimeSinceLastDca) return 'Longest Since DCA';
    if (value.dcaPriorityLogic.oldestPosition) return 'Oldest Position';
    return 'Highest Drawdown';
  };

  const getDcaNewEntrySameDayIcon = () => {
    return value.dcaNewEntrySameDay ? '✓' : '✗';
  };

  const getDcaNewEntrySameDayColor = () => {
    return value.dcaNewEntrySameDay ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-4 md:p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Trade Management</h3>
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
        {/* Row 1: Daily Limits */}
        <div className="grid grid-cols-2 gap-4">
          {/* Max New Positions Per Day */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max New Positions/Day
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={value.maxNewPositionsPerDay}
              onChange={(e) => handleMaxNewPositionsChange(Number(e.target.value) || 1)}
              className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">Maximum new positions per day</p>
          </div>

          {/* Max DCA Executions Per Day */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max DCA Executions/Day
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={value.maxDcaExecutionsPerDay}
              onChange={(e) => handleMaxDcaExecutionsChange(Number(e.target.value) || 1)}
              className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">Maximum DCA executions per day</p>
          </div>
        </div>

        {/* Row 2: DCA + New Entry Same Day and Max DCA Per Stock Per Week */}
        <div className="grid grid-cols-2 gap-4">
          {/* DCA + New Entry Same Day */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              DCA + New Entry Same Day
            </label>
            <div className="flex items-center justify-center h-9 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDcaNewEntrySameDayToggle(true)}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                    value.dcaNewEntrySameDay === true
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                  }`}
                >
                  ✓
                </button>
                <button
                  onClick={() => handleDcaNewEntrySameDayToggle(false)}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                    value.dcaNewEntrySameDay === false
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                  }`}
                >
                  ✗
                </button>
                <span className={`font-bold text-lg ${getDcaNewEntrySameDayColor()}`}>
                  {getDcaNewEntrySameDayIcon()}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Allow DCA and new entry on same day</p>
          </div>

          {/* Max DCA Per Stock Per Week */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max DCA Per Stock/Week
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={value.maxDcaPerStockPerWeek}
              onChange={(e) => handleMaxDcaPerStockPerWeekChange(Number(e.target.value) || 1)}
              className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">Maximum DCA per stock per week</p>
          </div>
        </div>

        {/* Row 3: Re-entry Cooldown and Max Open Positions */}
        <div className="grid grid-cols-2 gap-4">
          {/* Re-entry Cooldown */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-700">
                Re-entry Cooldown (Days)
              </label>
              <button
                onClick={() => handleReEntryCooldownToggle(!value.reEntryCooldownEnabled)}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  value.reEntryCooldownEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-pressed={value.reEntryCooldownEnabled}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                  value.reEntryCooldownEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
            <input
              type="number"
              min="0"
              max="365"
              value={value.reEntryCooldownDays}
              onChange={(e) => handleReEntryCooldownDaysChange(Number(e.target.value) || 0)}
              disabled={!value.reEntryCooldownEnabled}
              className={`w-full h-9 px-3 border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
                value.reEntryCooldownEnabled 
                  ? 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-500'
              }`}
            />
            <p className="text-[11px] text-gray-500 mt-1">
              {value.reEntryCooldownEnabled ? 'Days before re-entering same stock' : 'Disabled'}
            </p>
          </div>

          {/* Max Open Positions */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max Open Positions
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={value.maxOpenPositions}
              onChange={(e) => handleMaxOpenPositionsChange(Number(e.target.value) || 1)}
              className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[11px] text-gray-500 mt-1">Maximum concurrent positions</p>
          </div>
        </div>

        {/* Row 4: DCA Priority Logic */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-700">
              DCA Priority Logic
            </label>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showAdvanced ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {/* Current Priority Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                #1
              </div>
              <span className="text-sm font-medium text-blue-800">{getActivePriorityText()}</span>
            </div>
            <p className="text-xs text-blue-700">
              When multiple positions are eligible for DCA, prioritize by {getActivePriorityText().toLowerCase()}
            </p>
          </div>

          {/* Advanced DCA Priority Settings */}
          {showAdvanced && (
            <div className="mt-3 space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <div className="font-medium mb-1">DCA Priority Selection</div>
                    <div className="text-blue-700">
                      Choose which criterion takes priority when multiple positions are eligible for DCA on the same day
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {/* Highest % Drawdown */}
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center mr-3 text-white text-xs font-bold">
                      #1
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Highest % Drawdown</div>
                      <div className="text-xs text-gray-600">Focus on trades furthest from recovery</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDcaPriorityChange('highestDrawdown', !value.dcaPriorityLogic.highestDrawdown)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      value.dcaPriorityLogic.highestDrawdown
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'border-gray-300 hover:border-red-500'
                    }`}
                  >
                    {value.dcaPriorityLogic.highestDrawdown && '✓'}
                  </button>
                </div>

                {/* Longest Time Since Last DCA */}
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center mr-3 text-white text-xs font-bold">
                      #2
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Longest Since DCA</div>
                      <div className="text-xs text-gray-600">Keeps averaging consistent over time</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDcaPriorityChange('longestTimeSinceLastDca', !value.dcaPriorityLogic.longestTimeSinceLastDca)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      value.dcaPriorityLogic.longestTimeSinceLastDca
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'border-gray-300 hover:border-orange-500'
                    }`}
                  >
                    {value.dcaPriorityLogic.longestTimeSinceLastDca && '✓'}
                  </button>
                </div>

                {/* Oldest Position */}
                <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mr-3 text-white text-xs font-bold">
                      #3
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Oldest Position</div>
                      <div className="text-xs text-gray-600">Ensures older trades don't get stuck</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDcaPriorityChange('oldestPosition', !value.dcaPriorityLogic.oldestPosition)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      value.dcaPriorityLogic.oldestPosition
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {value.dcaPriorityLogic.oldestPosition && '✓'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Links Row */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {/* placeholder */}}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Settings className="w-3 h-3" />
              <span>Trade Management Guide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTradeManagement;
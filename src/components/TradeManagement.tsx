import React, { useState } from 'react';
import { Settings, Calendar, TrendingUp, Edit3, BarChart3, AlertCircle } from 'lucide-react';

interface TradeManagementProps {
  maxNewPositionsPerDay?: number;
  maxDcaExecutionsPerDay?: number;
  dcaNewEntrySameDay?: boolean;
  maxDcaPerStockPerWeek?: number;
  reEntryCooldownDays?: number;
  reEntryCooldownEnabled?: boolean;
  maxOpenPositions?: number;
  dcaPriorityLogic?: {
    highestDrawdown: boolean;
    longestTimeSinceLastDca: boolean;
    oldestPosition: boolean;
  };
  onUpdateSettings?: (settings: {
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
  }) => void;
  botType?: string;
}

const TradeManagement: React.FC<TradeManagementProps> = ({
  maxNewPositionsPerDay = 1,
  maxDcaExecutionsPerDay = 1,
  dcaNewEntrySameDay = false,
  maxDcaPerStockPerWeek = 1,
  reEntryCooldownDays = 30,
  reEntryCooldownEnabled = false,
  maxOpenPositions = 50,
  dcaPriorityLogic = {
    highestDrawdown: true,
    longestTimeSinceLastDca: false,
    oldestPosition: false
  },
  onUpdateSettings,
  botType = "RSI Compounder"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editSettings, setEditSettings] = useState({
    maxNewPositionsPerDay,
    maxDcaExecutionsPerDay,
    dcaNewEntrySameDay,
    maxDcaPerStockPerWeek,
    reEntryCooldownDays,
    reEntryCooldownEnabled: false,
    maxOpenPositions,
    dcaPriorityLogic
  });

  const handleSaveChanges = () => {
    if (onUpdateSettings) {
      onUpdateSettings(editSettings);
    }
    setIsEditing(false);
  };

  const handleDcaPriorityChange = (priority: keyof typeof dcaPriorityLogic, enabled: boolean) => {
    // Only allow one priority to be selected at a time
    const newPriorityLogic = {
      highestDrawdown: false,
      longestTimeSinceLastDca: false,
      oldestPosition: false
    };
    
    if (enabled) {
      newPriorityLogic[priority] = true;
    }
    
    setEditSettings({
      ...editSettings,
      dcaPriorityLogic: newPriorityLogic
    });
  };

  const getDcaNewEntrySameDayIcon = () => {
    if (editSettings.dcaNewEntrySameDay === true) return '✓';
    if (editSettings.dcaNewEntrySameDay === false) return '✗';
    return '◐'; // For indeterminate state
  };

  const getDcaNewEntrySameDayColor = () => {
    if (editSettings.dcaNewEntrySameDay === true) return 'text-green-400';
    if (editSettings.dcaNewEntrySameDay === false) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getActivePriorityText = () => {
    if (editSettings.dcaPriorityLogic.highestDrawdown) return 'highest_drawdown';
    if (editSettings.dcaPriorityLogic.longestTimeSinceLastDca) return 'longest_since_dca';
    if (editSettings.dcaPriorityLogic.oldestPosition) return 'oldest_position';
    return 'highest_drawdown';
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Trade Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Execution limits & DCA prioritization</p>
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
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {isEditing ? 'Save Changes' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Limits Section */}
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mr-2">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-gray-900 dark:text-gray-100 font-semibold">Daily Limits</h4>
          </div>

          <div className="space-y-4">
            {/* Max new positions/day */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700 dark:text-gray-300 text-sm">Max new positions/day</label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editSettings.maxNewPositionsPerDay}
                  onChange={(e) => setEditSettings({...editSettings, maxNewPositionsPerDay: Number(e.target.value)})}
                  className="w-16 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="text-gray-900 dark:text-gray-100 font-medium">{editSettings.maxNewPositionsPerDay}</span>
              )}
            </div>

            {/* Max DCA executions/day */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700 dark:text-gray-300 text-sm">Max DCA executions/day</label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editSettings.maxDcaExecutionsPerDay}
                  onChange={(e) => setEditSettings({...editSettings, maxDcaExecutionsPerDay: Number(e.target.value)})}
                  className="w-16 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="text-gray-900 dark:text-gray-100 font-medium">{editSettings.maxDcaExecutionsPerDay}</span>
              )}
            </div>

            {/* DCA + new entry same day */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700 dark:text-gray-300 text-sm">DCA + new entry same day?</label>
              {isEditing ? (
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditSettings({...editSettings, dcaNewEntrySameDay: true})}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                      editSettings.dcaNewEntrySameDay === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditSettings({...editSettings, dcaNewEntrySameDay: false})}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                      editSettings.dcaNewEntrySameDay === false
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  >
                    ✗
                  </button>
                </div>
              ) : (
                <span className={`font-bold text-lg ${
                  editSettings.dcaNewEntrySameDay === true ? 'text-green-600 dark:text-green-400' :
                  editSettings.dcaNewEntrySameDay === false ? 'text-red-600 dark:text-red-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {getDcaNewEntrySameDayIcon()}
                </span>
              )}
            </div>

            {/* Max DCA per stock/week */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700 dark:text-gray-300 text-sm">Max DCA per stock/week</label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={editSettings.maxDcaPerStockPerWeek}
                  onChange={(e) => setEditSettings({...editSettings, maxDcaPerStockPerWeek: Number(e.target.value)})}
                  className="w-16 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="text-gray-900 dark:text-gray-100 font-medium">{editSettings.maxDcaPerStockPerWeek}</span>
              )}
            </div>

            {/* Re-entry cooldown */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="text-gray-700 dark:text-gray-300 text-sm mr-2">Re-entry cooldown (days)</label>
                {isEditing && (
                  <button
                    onClick={() => setEditSettings({...editSettings, reEntryCooldownEnabled: !editSettings.reEntryCooldownEnabled})}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      editSettings.reEntryCooldownEnabled ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 ${
                      editSettings.reEntryCooldownEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                )}
                {!isEditing && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    editSettings.reEntryCooldownEnabled 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500'
                  }`}>
                    {editSettings.reEntryCooldownEnabled ? 'ON' : 'OFF'}
                  </div>
                )}
              </div>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={editSettings.reEntryCooldownDays}
                  onChange={(e) => setEditSettings({...editSettings, reEntryCooldownDays: Number(e.target.value)})}
                  disabled={!editSettings.reEntryCooldownEnabled}
                  className={`w-16 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !editSettings.reEntryCooldownEnabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
              ) : (
                <span className={`font-medium ${
                  editSettings.reEntryCooldownEnabled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {editSettings.reEntryCooldownEnabled ? editSettings.reEntryCooldownDays : 'Disabled'}
                </span>
              )}
            </div>

            {/* Max open positions */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700 dark:text-gray-300 text-sm">Max open positions</label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editSettings.maxOpenPositions}
                  onChange={(e) => setEditSettings({...editSettings, maxOpenPositions: Number(e.target.value)})}
                  className="w-16 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <span className="text-gray-900 dark:text-gray-100 font-medium">{editSettings.maxOpenPositions}</span>
              )}
            </div>
          </div>
        </div>

        {/* DCA Priority Logic Section */}
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center mr-2">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-gray-900 dark:text-gray-100 font-semibold">DCA Priority</h4>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <div className="text-blue-600 dark:text-blue-400 mr-2">ℹ️</div>
              <div className="text-xs text-blue-800 dark:text-blue-300">
                <div className="font-medium mb-1">When multiple positions are eligible for DCA today</div>
                <div className="text-blue-700 dark:text-blue-400">
                  This setting decides which position gets priority for DCA execution
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Priority Options */}
            <div className="space-y-3">
              {/* Highest % Drawdown */}
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center mr-3 text-white text-xs font-bold">
                    #1
                  </div>
                  <div>
                    <div className="text-gray-900 dark:text-gray-100 font-medium text-sm">Highest % Drawdown</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">Focus on trades furthest from recovery</div>
                  </div>
                </div>
                {isEditing ? (
                  <button
                    onClick={() => handleDcaPriorityChange('highestDrawdown', !editSettings.dcaPriorityLogic.highestDrawdown)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      editSettings.dcaPriorityLogic.highestDrawdown
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'border-gray-300 dark:border-gray-500 hover:border-red-500'
                    }`}
                  >
                    {editSettings.dcaPriorityLogic.highestDrawdown && '✓'}
                  </button>
                ) : (
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                    editSettings.dcaPriorityLogic.highestDrawdown
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {editSettings.dcaPriorityLogic.highestDrawdown && '✓'}
                  </div>
                )}
              </div>

              {/* Longest Time Since Last DCA */}
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center mr-3 text-white text-xs font-bold">
                    #2
                  </div>
                  <div>
                    <div className="text-gray-900 dark:text-gray-100 font-medium text-sm">Longest Since DCA</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">Keeps averaging consistent over time</div>
                  </div>
                </div>
                {isEditing ? (
                  <button
                    onClick={() => handleDcaPriorityChange('longestTimeSinceLastDca', !editSettings.dcaPriorityLogic.longestTimeSinceLastDca)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      editSettings.dcaPriorityLogic.longestTimeSinceLastDca
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'border-gray-300 dark:border-gray-500 hover:border-orange-500'
                    }`}
                  >
                    {editSettings.dcaPriorityLogic.longestTimeSinceLastDca && '✓'}
                  </button>
                ) : (
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                    editSettings.dcaPriorityLogic.longestTimeSinceLastDca
                      ? 'bg-orange-600 border-orange-600 text-white'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {editSettings.dcaPriorityLogic.longestTimeSinceLastDca && '✓'}
                  </div>
                )}
              </div>

              {/* Oldest Position */}
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mr-3 text-white text-xs font-bold">
                    #3
                  </div>
                  <div>
                    <div className="text-gray-900 dark:text-gray-100 font-medium text-sm">Oldest Position (entry date)</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">Ensures older trades don't get stuck forever</div>
                  </div>
                </div>
                {isEditing ? (
                  <button
                    onClick={() => handleDcaPriorityChange('oldestPosition', !editSettings.dcaPriorityLogic.oldestPosition)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      editSettings.dcaPriorityLogic.oldestPosition
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 dark:border-gray-500 hover:border-blue-500'
                    }`}
                  >
                    {editSettings.dcaPriorityLogic.oldestPosition && '✓'}
                  </button>
                ) : (
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                    editSettings.dcaPriorityLogic.oldestPosition
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {editSettings.dcaPriorityLogic.oldestPosition && '✓'}
                  </div>
                )}
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mt-4">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800 dark:text-blue-300">
                  <div className="font-medium mb-1">When multiple positions are eligible for DCA today</div>
                  <div className="text-blue-700 dark:text-blue-400">
                    This setting decides which position gets DCA priority: <span className="font-medium">{getActivePriorityText()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeManagement;
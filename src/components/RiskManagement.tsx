import React, { useState } from 'react';
import { Shield, AlertTriangle, Clock, TrendingDown, BarChart3, Edit3 } from 'lucide-react';

interface RiskManagementProps {
  stopLossPercent?: number;
  stopLossEnabled?: boolean;
  lifetimeMode?: string;
  recoveryDrip?: boolean;
  timeBasedExit?: boolean;
  maxDrawdownStop?: boolean;
  rangeExit?: boolean;
  recoveryDripDays?: number;
  recoveryDripMonths?: number;
  timeBasedExitDays?: number;
  timeBasedExitMonths?: number;
  maxDrawdownPercent?: number;
  rangeExitDays?: number;
  rangeExitMonths?: number;
  rangeLowerPercent?: number;
  rangeUpperPercent?: number;
  riskFeaturePriorities?: {
    recoveryDrip: number;
    timeBasedExit: number;
    maxDrawdownStop: number;
    rangeExit: number;
  };
  onUpdateSettings?: (settings: {
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
  }) => void;
  botType?: string;
}

const RiskManagement: React.FC<RiskManagementProps> = ({
  stopLossPercent = 50,
  stopLossEnabled = false,
  lifetimeMode = "After Full Deploy", // This is now informative only
  recoveryDrip = true,
  timeBasedExit = true,
  maxDrawdownStop = true,
  rangeExit = false,
  recoveryDripDays = 30,
  recoveryDripMonths = 15,
  timeBasedExitDays = 0,
  timeBasedExitMonths = 12,
  maxDrawdownPercent = 50,
  rangeExitDays = 0,
  rangeExitMonths = 6,
  rangeLowerPercent = -10,
  rangeUpperPercent = 10,
  riskFeaturePriorities = {
    recoveryDrip: 1,
    timeBasedExit: 2,
    maxDrawdownStop: 3,
    rangeExit: 4
  },
  onUpdateSettings,
  botType = "RSI Compounder"
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editSettings, setEditSettings] = useState({
    stopLossPercent,
    stopLossEnabled,
    lifetimeMode: "After Full Deploy", // Fixed value, not editable
    recoveryDrip,
    timeBasedExit,
    maxDrawdownStop,
    rangeExit,
    recoveryDripDays,
    recoveryDripMonths,
    timeBasedExitDays,
    timeBasedExitMonths,
    maxDrawdownPercent,
    rangeExitDays,
    rangeExitMonths,
    rangeLowerPercent,
    rangeUpperPercent,
    riskFeaturePriorities
  });

  // Handle priority changes with duplicate prevention
  const handlePriorityChange = (feature: keyof typeof riskFeaturePriorities, newPriority: number) => {
    const currentPriorities = editSettings.riskFeaturePriorities;
    
    // Get list of enabled features to determine valid priority range
    const enabledFeatures = Object.keys(currentPriorities).filter(
      key => editSettings[key as keyof typeof editSettings] === true
    );
    
    // Only allow priorities within the range of enabled features
    if (newPriority < 1 || newPriority > enabledFeatures.length) {
      return; // Invalid priority, don't update
    }
    
    // Find if any other feature has this priority
    const conflictingFeature = Object.entries(currentPriorities).find(
      ([key, priority]) => key !== feature && priority === newPriority
    );
    
    if (conflictingFeature) {
      // Swap priorities
      const [conflictingKey] = conflictingFeature;
      const oldPriority = currentPriorities[feature];
      
      setEditSettings({
        ...editSettings,
        riskFeaturePriorities: {
          ...currentPriorities,
          [feature]: newPriority,
          [conflictingKey]: oldPriority
        }
      });
    } else {
      // No conflict, just update
      setEditSettings({
        ...editSettings,
        riskFeaturePriorities: {
          ...currentPriorities,
          [feature]: newPriority
        }
      });
    }
  };

  const handleSaveChanges = () => {
    // Validate that enabled features have consecutive priorities starting from 1
    const enabledFeatures = Object.entries(editSettings.riskFeaturePriorities)
      .filter(([key]) => editSettings[key as keyof typeof editSettings] === true)
      .map(([key, priority]) => ({ key, priority }))
      .sort((a, b) => a.priority - b.priority);
    
    // Check if priorities are consecutive starting from 1
    const expectedPriorities = enabledFeatures.map((_, index) => index + 1);
    const actualPriorities = enabledFeatures.map(f => f.priority);
    
    const isConsecutive = expectedPriorities.every((expected, index) => 
      expected === actualPriorities[index]
    );
    
    if (!isConsecutive) {
      // Auto-fix priorities to be consecutive
      const fixedPriorities = { ...editSettings.riskFeaturePriorities };
      enabledFeatures.forEach((feature, index) => {
        fixedPriorities[feature.key as keyof typeof fixedPriorities] = index + 1;
      });
      
      setEditSettings({
        ...editSettings,
        riskFeaturePriorities: fixedPriorities
      });
      
      // Don't save yet, let user see the auto-corrected values
      return;
    }
    
    if (onUpdateSettings) {
      onUpdateSettings(editSettings);
    }
    setIsEditing(false);
  };

  const getLifetimeModeDescription = (mode: string) => {
    switch (mode) {
      case "After Full Deploy":
        return "Activate risk management after all capital is deployed";
      case "Immediate":
        return "Activate risk management from first trade";
      case "Custom Delay":
        return "Activate after specified time period";
      default:
        return "After Full Deploy";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Risk Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configure risk protection mechanisms</p>
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
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {isEditing ? 'Save Changes' : 'Edit Settings'}
        </button>
      </div>

      {isEditing ? (
        /* Edit Form */
        <div className="space-y-6">
          {/* Stop Loss */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center mr-2">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Stop Loss</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Maximum loss %</p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => setEditSettings({...editSettings, stopLossEnabled: !editSettings.stopLossEnabled})}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      editSettings.stopLossEnabled ? 'bg-red-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                      editSettings.stopLossEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>
              
              {editSettings.stopLossEnabled && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-3">
                  <div className="flex items-start">
                    <div className="text-yellow-600 dark:text-yellow-400 mr-2">⚠️</div>
                    <div>
                      <div className="text-yellow-800 dark:text-yellow-300 font-medium text-xs">
                        CNC/SPOT Market Advisory
                      </div>
                      <div className="text-yellow-700 dark:text-yellow-400 text-xs mt-1">
                        CNC/SPOT losses are virtual. Exiting early not advised as stocks can recover.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`relative ${!editSettings.stopLossEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                {editSettings.stopLossEnabled && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-3">
                    <div className="flex items-start">
                      <div className="text-red-600 dark:text-red-400 mr-2">⚠️</div>
                      <div>
                        <div className="text-red-800 dark:text-red-300 font-medium text-xs">
                          Stop Loss Override Warning
                        </div>
                        <div className="text-red-700 dark:text-red-400 text-xs mt-1 space-y-1">
                          <div>• Stop Loss will OVERRIDE all other Risk Management Features</div>
                          <div>• Stop Loss is calculated from average price (not entry price)</div>
                          <div>• Recovery Drip, Time Exit, Max Drawdown, and Range Exit will be ignored</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <input
                  type="number"
                  step="1"
                  min="10"
                  max="90"
                  value={editSettings.stopLossPercent}
                  onChange={(e) => setEditSettings({...editSettings, stopLossPercent: Number(e.target.value)})}
                  disabled={!editSettings.stopLossEnabled}
                  className="w-full px-3 pr-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {editSettings.stopLossEnabled ? 'Maximum acceptable loss threshold' : 'Stop loss is disabled (recommended for CNC/SPOT)'}
              </div>
            </div>

            {/* Lifetime Mode - Informative Only */}
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center mr-2">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Lifetime Mode</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Activation timing</p>
                </div>
              </div>
              
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-3">
                <div className="font-medium text-indigo-800 dark:text-indigo-300 mb-1 text-sm">After Full Deploy</div>
                <div className="text-xs text-indigo-700 dark:text-indigo-400">
                  Features activate after full capital deployment per trade
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                ℹ️ Optimized for deployment strategy
              </div>
            </div>
          </div>

          {/* Risk Management Features - Expanded */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center mr-2">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Risk Management Features</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Protection mechanisms (Active after full capital deployment per trade)</p>
              </div>
            </div>
            
            {/* Priority System - Only show if multiple features are enabled */}
            {(() => {
              const enabledCount = [
                editSettings.recoveryDrip,
                editSettings.timeBasedExit,
                editSettings.maxDrawdownStop,
                editSettings.rangeExit
              ].filter(Boolean).length;
              
              if (enabledCount > 1) {
                return (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center mr-2">
                        <span className="text-white text-xs">#</span>
                      </div>
                      <span className="text-blue-800 dark:text-blue-300 font-medium text-sm">Execution Priority</span>
                      <span className="ml-2 text-blue-600 dark:text-blue-400 text-xs">({enabledCount} features enabled)</span>
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 mb-3">
                      Set the order in which risk features should be checked (1 = highest priority)
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {editSettings.recoveryDrip && (
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-lg p-2">
                          <span className="text-gray-900 dark:text-gray-100 text-xs font-medium">💧 Recovery Drip</span>
                          <select
                            value={editSettings.riskFeaturePriorities.recoveryDrip}
                            onChange={(e) => handlePriorityChange('recoveryDrip', Number(e.target.value))}
                            className="w-12 px-1 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {(() => {
                              const enabledCount = [
                                editSettings.recoveryDrip,
                                editSettings.timeBasedExit,
                                editSettings.maxDrawdownStop,
                                editSettings.rangeExit
                              ].filter(Boolean).length;
                              
                              return Array.from({ length: enabledCount }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                              ));
                            })()}
                          </select>
                        </div>
                      )}
                      
                      {editSettings.timeBasedExit && (
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-lg p-2">
                          <span className="text-gray-900 dark:text-gray-100 text-xs font-medium">⏰ Time Exit</span>
                          <select
                            value={editSettings.riskFeaturePriorities.timeBasedExit}
                            onChange={(e) => handlePriorityChange('timeBasedExit', Number(e.target.value))}
                            className="w-12 px-1 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {(() => {
                              const enabledCount = [
                                editSettings.recoveryDrip,
                                editSettings.timeBasedExit,
                                editSettings.maxDrawdownStop,
                                editSettings.rangeExit
                              ].filter(Boolean).length;
                              
                              return Array.from({ length: enabledCount }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                              ));
                            })()}
                          </select>
                        </div>
                      )}
                      
                      {editSettings.maxDrawdownStop && (
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-lg p-2">
                          <span className="text-gray-900 dark:text-gray-100 text-xs font-medium">📉 Max Drawdown</span>
                          <select
                            value={editSettings.riskFeaturePriorities.maxDrawdownStop}
                            onChange={(e) => handlePriorityChange('maxDrawdownStop', Number(e.target.value))}
                            className="w-12 px-1 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {(() => {
                              const enabledCount = [
                                editSettings.recoveryDrip,
                                editSettings.timeBasedExit,
                                editSettings.maxDrawdownStop,
                                editSettings.rangeExit
                              ].filter(Boolean).length;
                              
                              return Array.from({ length: enabledCount }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                              ));
                            })()}
                          </select>
                        </div>
                      )}
                      
                      {editSettings.rangeExit && (
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-lg p-2">
                          <span className="text-gray-900 dark:text-gray-100 text-xs font-medium">📊 Range Exit</span>
                          <select
                            value={editSettings.riskFeaturePriorities.rangeExit}
                            onChange={(e) => handlePriorityChange('rangeExit', Number(e.target.value))}
                            className="w-12 px-1 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {(() => {
                              const enabledCount = [
                                editSettings.recoveryDrip,
                                editSettings.timeBasedExit,
                                editSettings.maxDrawdownStop,
                                editSettings.rangeExit
                              ].filter(Boolean).length;
                              
                              return Array.from({ length: enabledCount }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                              ));
                            })()}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recovery Drip */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center mr-2">
                      <span className="text-white text-xs">💧</span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium text-xs">Recovery Drip</span>
                  </div>
                  <button
                    onClick={() => setEditSettings({...editSettings, recoveryDrip: !editSettings.recoveryDrip})}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      editSettings.recoveryDrip ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 ${
                      editSettings.recoveryDrip ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                {editSettings.recoveryDrip && (
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Days
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="365"
                          value={editSettings.recoveryDripDays}
                          onChange={(e) => setEditSettings({...editSettings, recoveryDripDays: Number(e.target.value)})}
                          className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Months
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={editSettings.recoveryDripMonths}
                          onChange={(e) => setEditSettings({...editSettings, recoveryDripMonths: Number(e.target.value)})}
                          className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Buy 1% more every {editSettings.recoveryDripDays} days for {editSettings.recoveryDripMonths} months, then exit if target not hit.
                    </div>
                  </div>
                )}
                {!editSettings.recoveryDrip && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Buy 1% more monthly for 15 months, then exit if target not hit.
                  </div>
                )}
              </div>

              {/* Time-Based Exit */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center mr-2">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium text-xs">Time-Based Exit</span>
                  </div>
                  <button
                    onClick={() => setEditSettings({...editSettings, timeBasedExit: !editSettings.timeBasedExit})}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      editSettings.timeBasedExit ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 ${
                      editSettings.timeBasedExit ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                {editSettings.timeBasedExit && (
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Days
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="365"
                          value={editSettings.timeBasedExitDays}
                          onChange={(e) => setEditSettings({...editSettings, timeBasedExitDays: Number(e.target.value)})}
                          className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Months
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={editSettings.timeBasedExitMonths}
                          onChange={(e) => setEditSettings({...editSettings, timeBasedExitMonths: Number(e.target.value)})}
                          className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Auto-exit if target not hit within {editSettings.timeBasedExitMonths} months of full deployment.
                    </div>
                  </div>
                )}
                {!editSettings.timeBasedExit && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Auto-exit if target not hit within 12 months of full deployment.
                  </div>
                )}
              </div>

              {/* Max Drawdown Stop */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center mr-2">
                      <TrendingDown className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium text-xs">Max Drawdown Stop</span>
                  </div>
                  <button
                    onClick={() => setEditSettings({...editSettings, maxDrawdownStop: !editSettings.maxDrawdownStop})}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      editSettings.maxDrawdownStop ? 'bg-red-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 ${
                      editSettings.maxDrawdownStop ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                {editSettings.maxDrawdownStop && (
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        max="90"
                        value={editSettings.maxDrawdownPercent}
                        onChange={(e) => setEditSettings({...editSettings, maxDrawdownPercent: Number(e.target.value)})}
                        className="w-full px-2 pr-6 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">%</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                      Cut losses if stock falls &gt;{editSettings.maxDrawdownPercent}% from initial entry price.
                    </div>
                  </div>
                )}
                {!editSettings.maxDrawdownStop && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Cut losses if stock falls &gt;50% from initial entry price.
                  </div>
                )}
              </div>

              {/* Range-Bound Exit */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-yellow-600 rounded flex items-center justify-center mr-2">
                      <span className="text-white text-xs">📊</span>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium text-xs">Range-Bound Exit</span>
                  </div>
                  <button
                    onClick={() => setEditSettings({...editSettings, rangeExit: !editSettings.rangeExit})}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      editSettings.rangeExit ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 ${
                      editSettings.rangeExit ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                {editSettings.rangeExit && (
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Lower %
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="-50"
                            max="0"
                            value={editSettings.rangeLowerPercent}
                            onChange={(e) => setEditSettings({...editSettings, rangeLowerPercent: Number(e.target.value)})}
                            className="w-full px-2 pr-6 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          />
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Upper %
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={editSettings.rangeUpperPercent}
                            onChange={(e) => setEditSettings({...editSettings, rangeUpperPercent: Number(e.target.value)})}
                            className="w-full px-2 pr-6 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          />
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Months
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={editSettings.rangeExitMonths}
                          onChange={(e) => setEditSettings({...editSettings, rangeExitMonths: Number(e.target.value)})}
                          className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Exit if stuck between {editSettings.rangeLowerPercent}% to {editSettings.rangeUpperPercent}% for {editSettings.rangeExitMonths} months.
                    </div>
                  </div>
                )}
                {!editSettings.rangeExit && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Exit if stuck between {editSettings.rangeLowerPercent}% to {editSettings.rangeUpperPercent}% for {editSettings.rangeExitMonths} months.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Display Mode - Cards */
        <div className="space-y-6">
          {/* Stop Loss Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center mr-2">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Stop Loss</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Maximum loss %</p>
                </div>
                <div className="ml-auto">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    editSettings.stopLossEnabled 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500'
                  }`}>
                    {editSettings.stopLossEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
              
              {editSettings.stopLossEnabled ? (
                <>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {editSettings.stopLossPercent}%
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Maximum acceptable loss threshold
                  </div>
                </>
              ) : (
                <>
                  <div className="text-base font-bold text-gray-600 dark:text-gray-400 mb-1">
                    Disabled
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Recommended for CNC/SPOT markets
                  </div>
                </>
              )}
            </div>

            {/* Lifetime Mode Display - Informative Only */}
            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center mr-2">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Lifetime Mode</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Activation timing</p>
                </div>
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                After Full Deploy
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Features activate after full capital deployment per trade
              </div>
            </div>
          </div>

          {/* Risk Features Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center mr-2">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Active Risk Features</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Protection mechanisms (Active after full capital deployment per trade)</p>
              </div>
            </div>
            
            {/* Priority Display - Only show if multiple features are enabled */}
            {(() => {
              const enabledFeatures = [
                { name: 'Recovery Drip', enabled: editSettings.recoveryDrip, priority: editSettings.riskFeaturePriorities.recoveryDrip, icon: '💧' },
                { name: 'Time Exit', enabled: editSettings.timeBasedExit, priority: editSettings.riskFeaturePriorities.timeBasedExit, icon: '⏰' },
                { name: 'Max Drawdown', enabled: editSettings.maxDrawdownStop, priority: editSettings.riskFeaturePriorities.maxDrawdownStop, icon: '📉' },
                { name: 'Range Exit', enabled: editSettings.rangeExit, priority: editSettings.riskFeaturePriorities.rangeExit, icon: '📊' }
              ].filter(f => f.enabled).sort((a, b) => a.priority - b.priority);
              
              if (enabledFeatures.length > 1) {
                return (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-3">
                      <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center mr-2">
                        <span className="text-white text-xs">#</span>
                      </div>
                      <span className="text-blue-800 dark:text-blue-300 font-medium text-sm">Execution Priority</span>
                      <span className="ml-2 text-blue-600 dark:text-blue-400 text-xs">({enabledFeatures.length} features enabled)</span>
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-400 mb-3">
                      Features will be checked in this order:
                    </div>
                    <div className="space-y-2">
                      {enabledFeatures.map((feature, index) => (
                        <div key={feature.name} className="flex items-center bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-600 rounded-lg p-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mr-3 text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="text-lg mr-2">{feature.icon}</div>
                          <span className="text-gray-900 dark:text-gray-100 font-medium text-sm">{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`text-center p-3 rounded-lg ${
                editSettings.recoveryDrip 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
                  : 'bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500'
              }`}>
                <div className="text-lg mb-1">💧</div>
                <div className={`text-xs font-medium mb-1 ${
                  editSettings.recoveryDrip ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Recovery Drip
                </div>
                <div className={`text-xs ${
                  editSettings.recoveryDrip ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {editSettings.recoveryDrip ? 'Active' : 'Disabled'}
                </div>
              </div>

              <div className={`text-center p-3 rounded-lg ${
                editSettings.timeBasedExit 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
                  : 'bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500'
              }`}>
                <div className="text-lg mb-1">⏰</div>
                <div className={`text-xs font-medium mb-1 ${
                  editSettings.timeBasedExit ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Time Exit
                </div>
                <div className={`text-xs ${
                  editSettings.timeBasedExit ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {editSettings.timeBasedExit ? 'Active' : 'Disabled'}
                </div>
              </div>

              <div className={`text-center p-3 rounded-lg ${
                editSettings.maxDrawdownStop 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
                  : 'bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500'
              }`}>
                <div className="text-lg mb-1">📉</div>
                <div className={`text-xs font-medium mb-1 ${
                  editSettings.maxDrawdownStop ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Max Drawdown
                </div>
                <div className={`text-xs ${
                  editSettings.maxDrawdownStop ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {editSettings.maxDrawdownStop ? 'Active' : 'Disabled'}
                </div>
              </div>

              <div className={`text-center p-3 rounded-lg ${
                editSettings.rangeExit 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
                  : 'bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500'
              }`}>
                <div className="text-lg mb-1">📊</div>
                <div className={`text-xs font-medium mb-1 ${
                  editSettings.rangeExit ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Range Exit
                </div>
                <div className={`text-xs ${
                  editSettings.rangeExit ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {editSettings.rangeExit ? 'Active' : 'Disabled'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskManagement;
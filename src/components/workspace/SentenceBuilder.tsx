import React from 'react';
import { Zap, BarChart3, Settings, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { EntryRulesV2 } from '../../types/entry';
import SentenceComposer from './SentenceComposer';
import ConditionBuilderV2 from '../entry/ConditionBuilderV2';

interface SentenceBuilderProps {
  value: EntryRulesV2;
  onChange: (entry: EntryRulesV2) => void;
  mode: 'simple' | 'advanced';
  onModeChange: (mode: 'simple' | 'advanced') => void;
  className?: string;
}

const SentenceBuilder: React.FC<SentenceBuilderProps> = ({
  value,
  onChange,
  mode,
  onModeChange,
  className = ''
}) => {
  const activeTriggers = value.mainTriggers.filter(t => t !== null);
  const totalSupportingConditions = (value.supporting.setA?.conditions.length || 0) + 
                                   (value.supporting.setB?.conditions.length || 0);

  const handleMainTriggerChange = (index: 0 | 1, trigger: any) => {
    const newTriggers: [any, any] = [...value.mainTriggers];
    newTriggers[index] = trigger;
    onChange({ ...value, mainTriggers: newTriggers });
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Entry Rules</h3>
            <p className="text-sm text-gray-500">
              {activeTriggers.length} trigger{activeTriggers.length !== 1 ? 's' : ''} • {totalSupportingConditions} supporting
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Mode:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onModeChange('simple')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                mode === 'simple'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Simple</span>
            </button>
            <button
              onClick={() => onModeChange('advanced')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                mode === 'advanced'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Advanced</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {mode === 'simple' ? (
          /* Simple Mode - Sentence Composer */
          <div className="space-y-6">
            {/* Main Triggers */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Main Trigger</h4>
                  <p className="text-xs text-gray-600">Primary entry signal</p>
                </div>
              </div>

              <SentenceComposer
                value={activeTriggers[0]}
                onChange={(trigger) => handleMainTriggerChange(0, trigger)}
              />
            </div>

            {/* Optional Second Trigger */}
            {value.mainTriggers[1] ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Alternative Trigger</h4>
                      <p className="text-xs text-gray-600">Secondary entry option</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMainTriggerChange(1, null)}
                    className="text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    Remove
                  </button>
                </div>

                <SentenceComposer
                  value={value.mainTriggers[1]}
                  onChange={(trigger) => handleMainTriggerChange(1, trigger)}
                />
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-gray-500 text-sm mb-3">Add alternative trigger</p>
                <button
                  onClick={() => {
                    const newTrigger = {
                      id: `trigger-${Date.now()}`,
                      kind: "indicator",
                      timeframe: "15m",
                      left: {
                        name: "RSI",
                        component: "line",
                        settings: { length: 14 }
                      },
                      op: "crossesBelow",
                      right: { type: "value", value: 70 },
                      sequence: 2,
                      staysValidFor: { amount: 5, unit: "bars" }
                    };
                    handleMainTriggerChange(1, newTrigger);
                  }}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
                >
                  Add Trigger 2
                </button>
              </div>
            )}

            {/* Supporting Conditions Summary */}
            {totalSupportingConditions > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">
                    {totalSupportingConditions} Supporting Condition{totalSupportingConditions !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-emerald-700">
                  Switch to Advanced mode to edit supporting conditions
                </p>
              </div>
            )}

            {/* Switch to Advanced Hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-800">Need more control?</div>
                  <div className="text-xs text-blue-700 mt-1">
                    Switch to Advanced mode for supporting conditions, timing settings, and technical details
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Advanced Mode - Existing Technical UI */
          <div className="space-y-6">
            {/* Main Triggers */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Main Triggers</h4>
              <div className="space-y-4">
                <ConditionBuilderV2
                  value={activeTriggers[0]}
                  onChange={(trigger) => handleMainTriggerChange(0, trigger)}
                  showRemove={false}
                />
                
                {value.mainTriggers[1] && (
                  <ConditionBuilderV2
                    value={value.mainTriggers[1]}
                    onChange={(trigger) => handleMainTriggerChange(1, trigger)}
                    onRemove={() => handleMainTriggerChange(1, null)}
                  />
                )}
              </div>
            </div>

            {/* Supporting Conditions */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Supporting Conditions</h4>
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-gray-500 text-sm">Supporting conditions builder coming soon</p>
              </div>
            </div>

            {/* Timing Settings */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Timing Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Trigger Timing</label>
                  <select
                    value={value.triggerTiming}
                    onChange={(e) => onChange({ 
                      ...value, 
                      triggerTiming: e.target.value as "onBarClose" | "nextBarOpen" 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="onBarClose">On Bar Close</option>
                    <option value="nextBarOpen">Next Bar Open</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cooldown (bars)</label>
                  <input
                    type="number"
                    min="0"
                    value={value.cooldownBars || ''}
                    onChange={(e) => onChange({ 
                      ...value, 
                      cooldownBars: Number(e.target.value) || undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="No cooldown"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentenceBuilder;
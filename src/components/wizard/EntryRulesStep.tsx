import React from 'react';
import { Zap, BarChart3, X, Settings } from 'lucide-react';
import { EntryRulesV2 } from '../../types/entry';
import TriggerBuilder from '../entry/TriggerBuilder';
import ConditionGroupBuilder from '../entry/ConditionGroupBuilder';

// Import missing types
import type { TriggerCondition, ConditionGroup, TimeWindow } from '../../types/entry';

interface EntryRulesStepProps {
  data: EntryRulesV2;
  onChange: (data: EntryRulesV2) => void;
  botType: "Spot" | "Futures";
  direction?: "Long" | "Short";
}

const EntryRulesStep: React.FC<EntryRulesStepProps> = ({ 
  data, 
  onChange, 
  botType, 
  direction 
}) => {
  const getTotalConditions = () => {
    const mainTriggers = data.mainTriggers.filter(t => t !== null).length;
    const supportingConditions = (data.supporting.setA?.conditions.length || 0) + 
                                (data.supporting.setB?.conditions.length || 0);
    return mainTriggers + supportingConditions;
  };

  const getQualityScore = () => {
    let score = 0;
    const maxScore = 100;
    
    // Base score for having main triggers
    const activeTriggers = data.mainTriggers.filter(t => t !== null);
    score += activeTriggers.length * 25; // 25 points per trigger, max 50
    
    // Points for supporting conditions
    const supportingCount = (data.supporting.setA?.conditions.length || 0) + 
                           (data.supporting.setB?.conditions.length || 0);
    score += Math.min(supportingCount * 5, 25); // 5 points per condition, max 25
    
    // Points for timeframe diversity
    const allConditions = [
      ...activeTriggers.filter(t => t.kind === 'indicator'),
      ...(data.supporting.setA?.conditions || []),
      ...(data.supporting.setB?.conditions || [])
    ];
    
    const timeframes = new Set(allConditions.map(c => (c as any).timeframe).filter(Boolean));
    score += Math.min(timeframes.size * 5, 15); // 5 points per unique timeframe, max 15
    
    // Points for advanced features
    if (data.timeWindow?.enabled) score += 5;
    if (data.cooldownBars) score += 5;
    
    return Math.min(score, maxScore);
  };

  const qualityScore = getQualityScore();

  return (
    <div className="space-y-4">
      {/* Quality Indicator Header */}
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                qualityScore >= 80 ? 'bg-green-500' :
                qualityScore >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-700">Strategy Quality: {qualityScore}%</span>
            </div>
            <div className="text-sm text-gray-500">
              {getTotalConditions()} total conditions
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Main: {data.mainTriggers.filter(t => t !== null).length}/2</span>
            <span>Supporting: {(data.supporting.setA?.conditions.length || 0) + (data.supporting.setB?.conditions.length || 0)}/10</span>
          </div>
        </div>
      </div>

      {/* 2-Column Layout for Main Triggers and Supporting Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Main Triggers */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Main Triggers</h3>
              <p className="text-gray-600 text-xs">Primary entry signals (max 2)</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Trigger 1 */}
            <TriggerBuilder
              value={data.mainTriggers[0]}
              onChange={(trigger) => {
                const newTriggers: [TriggerCondition, (TriggerCondition | null)] = [...data.mainTriggers];
                newTriggers[0] = trigger;
                onChange({ ...data, mainTriggers: newTriggers });
              }}
              triggerNumber={1}
            />

            {/* Trigger 2 (Optional) */}
            {data.mainTriggers[1] ? (
              <div className="relative">
                <TriggerBuilder
                  value={data.mainTriggers[1]}
                  onChange={(trigger) => {
                    const newTriggers: [TriggerCondition, (TriggerCondition | null)] = [...data.mainTriggers];
                    newTriggers[1] = trigger;
                    onChange({ ...data, mainTriggers: newTriggers });
                  }}
                  triggerNumber={2}
                />
                <button
                  onClick={() => {
                    const newTriggers: [TriggerCondition, (TriggerCondition | null)] = [...data.mainTriggers];
                    newTriggers[1] = null;
                    onChange({ ...data, mainTriggers: newTriggers });
                  }}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-gray-500 text-sm mb-3">Add second trigger for alternative entry</p>
                <button
                  onClick={() => {
                    const newTrigger: TriggerCondition = {
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
                    const newTriggers: [TriggerCondition, (TriggerCondition | null)] = [...data.mainTriggers];
                    newTriggers[1] = newTrigger;
                    onChange({ ...data, mainTriggers: newTriggers });
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                >
                  Add Trigger 2
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Supporting Conditions */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-md flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Supporting Conditions</h3>
              <p className="text-gray-600 text-xs">Additional filters ({getTotalConditions() - data.mainTriggers.filter(t => t !== null).length}/10)</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Set A */}
            {data.supporting.setA ? (
              <ConditionGroupBuilder
                value={data.supporting.setA}
                onChange={(group) => {
                  onChange({
                    ...data,
                    supporting: {
                      ...data.supporting,
                      setA: group
                    }
                  });
                }}
                onRemove={() => {
                  onChange({
                    ...data,
                    supporting: {
                      ...data.supporting,
                      setA: undefined
                    }
                  });
                }}
                groupName="Set A"
                maxConditions={10 - (data.supporting.setB?.conditions.length || 0)}
              />
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-gray-500 text-sm mb-3">No supporting conditions</p>
                <button
                  onClick={() => {
                    const newGroup: ConditionGroup = {
                      id: `setA-${Date.now()}`,
                      logic: "AND",
                      conditions: []
                    };
                    onChange({
                      ...data,
                      supporting: {
                        ...data.supporting,
                        setA: newGroup
                      }
                    });
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                >
                  Add Set A
                </button>
              </div>
            )}

            {/* Set B */}
            {data.supporting.setB ? (
              <ConditionGroupBuilder
                value={data.supporting.setB}
                onChange={(group) => {
                  onChange({
                    ...data,
                    supporting: {
                      ...data.supporting,
                      setB: group
                    }
                  });
                }}
                onRemove={() => {
                  onChange({
                    ...data,
                    supporting: {
                      ...data.supporting,
                      setB: undefined
                    }
                  });
                }}
                groupName="Set B"
                maxConditions={10 - (data.supporting.setA?.conditions.length || 0)}
              />
            ) : data.supporting.setA && (
              <div className="text-center py-4 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-gray-500 text-sm mb-2">Add Set B for OR logic</p>
                <button
                  onClick={() => {
                    const newGroup: ConditionGroup = {
                      id: `setB-${Date.now()}`,
                      logic: "AND",
                      conditions: []
                    };
                    onChange({
                      ...data,
                      supporting: {
                        ...data.supporting,
                        setB: newGroup
                      }
                    });
                  }}
                  disabled={getTotalConditions() >= 12} // 2 main + 10 supporting
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    getTotalConditions() >= 12
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Add Set B
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Section - Full Width Below */}
      <div className="space-y-4">
        {/* Timing & Window Settings */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md flex items-center justify-center">
              <Settings className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Timing & Window Settings</h3>
              <p className="text-gray-600 text-xs">Configure execution timing and validity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Trigger Timing */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Trigger Timing</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onChange({ ...data, triggerTiming: 'onBarClose' })}
                  className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    data.triggerTiming === 'onBarClose'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Bar Close
                </button>
                <button
                  onClick={() => onChange({ ...data, triggerTiming: 'nextBarOpen' })}
                  className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    data.triggerTiming === 'nextBarOpen'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Next Open
                </button>
              </div>
            </div>

            {/* Cooldown Bars */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cooldown (bars)</label>
              <input
                type="number"
                min="0"
                value={data.cooldownBars || ''}
                onChange={(e) => onChange({ ...data, cooldownBars: Number(e.target.value) || undefined })}
                className="w-full h-8 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="No cooldown"
              />
            </div>

            {/* Reset If Stale */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-gray-700">Reset if stale</label>
                <p className="text-xs text-gray-500">Reset if conditions expire</p>
              </div>
              <button
                onClick={() => onChange({ ...data, resetIfStale: !data.resetIfStale })}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  data.resetIfStale ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                  data.resetIfStale ? 'translate-x-4' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>

            {/* Time Window */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-700">Time Window</label>
                <button
                  onClick={() => onChange({
                    ...data,
                    timeWindow: {
                      ...data.timeWindow,
                      enabled: !data.timeWindow?.enabled
                    } as TimeWindow
                  })}
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    data.timeWindow?.enabled ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                    data.timeWindow?.enabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
              
              {data.timeWindow?.enabled && (
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="time"
                    value={data.timeWindow.start || '09:15'}
                    onChange={(e) => onChange({
                      ...data,
                      timeWindow: {
                        ...data.timeWindow,
                        start: e.target.value
                      } as TimeWindow
                    })}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="time"
                    value={data.timeWindow.end || '15:30'}
                    onChange={(e) => onChange({
                      ...data,
                      timeWindow: {
                        ...data.timeWindow,
                        end: e.target.value
                      } as TimeWindow
                    })}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Summary */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h4 className="text-base font-semibold text-purple-900 mb-3">Step 2 Summary</h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <span className="text-purple-700 font-medium">Main Triggers:</span>
              <span className="ml-2 text-purple-900">
                {data.mainTriggers.filter(t => t !== null).length}/2
              </span>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Supporting Conditions:</span>
              <span className="ml-2 text-purple-900">
                {(data.supporting.setA?.conditions.length || 0) + (data.supporting.setB?.conditions.length || 0)}/10
              </span>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Supporting Sets:</span>
              <span className="ml-2 text-purple-900">
                {[data.supporting.setA, data.supporting.setB].filter(Boolean).length}/2
              </span>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Trigger Timing:</span>
              <span className="ml-2 text-purple-900">
                {data.triggerTiming === 'onBarClose' ? 'On Bar Close' : 'Next Bar Open'}
              </span>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Time Window:</span>
              <span className="ml-2 text-purple-900">
                {data.timeWindow?.enabled ? `${data.timeWindow.start}-${data.timeWindow.end}` : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Cooldown:</span>
              <span className="ml-2 text-purple-900">
                {data.cooldownBars ? `${data.cooldownBars} bars` : 'None'}
              </span>
            </div>
          </div>
          
          {/* Strategy Preview */}
          <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
            <h5 className="text-sm font-medium text-purple-800 mb-2">Strategy Preview:</h5>
            <p className="text-sm text-purple-700 leading-relaxed">
              {generateStrategyPreview(data, botType, direction)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate strategy preview
const generateStrategyPreview = (entry: EntryRulesV2, botType: "Spot" | "Futures", direction?: "Long" | "Short") => {
  const activeTriggers = entry.mainTriggers.filter(t => t !== null);
  if (activeTriggers.length === 0) return "No entry conditions configured.";

  let preview = `Enter ${direction?.toLowerCase() || 'long'} ${botType.toLowerCase()} position when `;
  
  // Main triggers
  if (activeTriggers.length === 1) {
    const trigger = activeTriggers[0];
    if (trigger.kind === 'indicator') {
      preview += `${trigger.left.name}(${trigger.left.settings?.length || ''}) on ${trigger.timeframe} ${trigger.op === 'crossesAbove' ? 'crosses above' : trigger.op === 'crossesBelow' ? 'crosses below' : trigger.op} ${trigger.right.type === 'value' ? trigger.right.value : 'its ' + trigger.right.indicator.component}`;
    } else {
      preview += `webhook ${trigger.match.key} equals ${trigger.match.equals}`;
    }
  } else {
    preview += `(${activeTriggers.map(t => 
      t.kind === 'indicator' 
        ? `${t.left.name} ${t.op} ${t.right.type === 'value' ? t.right.value : 'component'}`
        : `webhook ${t.match.key}=${t.match.equals}`
    ).join(' OR ')})`;
  }
  
  // Supporting conditions
  const supportingParts = [];
  if (entry.supporting.setA && entry.supporting.setA.conditions.length > 0) {
    supportingParts.push(`Set A (${entry.supporting.setA.conditions.length} conditions)`);
  }
  if (entry.supporting.setB && entry.supporting.setB.conditions.length > 0) {
    supportingParts.push(`Set B (${entry.supporting.setB.conditions.length} conditions)`);
  }
  
  if (supportingParts.length > 0) {
    preview += ` AND (${supportingParts.join(' OR ')})`;
  }
  
  // Timing
  preview += ` on ${entry.triggerTiming === 'onBarClose' ? 'bar close' : 'next bar open'}`;
  
  if (entry.timeWindow?.enabled) {
    preview += `, during ${entry.timeWindow.start}-${entry.timeWindow.end}`;
  }
  
  return preview + '.';
};

export default EntryRulesStep;
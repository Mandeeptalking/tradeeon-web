import React from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { EntryRulesV2, ConditionGroup } from '../../types/entry';
import ConditionBuilderV2 from '../entry/ConditionBuilderV2';
import ConditionGroupBuilder from '../entry/ConditionGroupBuilder';

interface AdvancedBuilderProps {
  value: EntryRulesV2;
  onChange: (entry: EntryRulesV2) => void;
  className?: string;
}

const AdvancedBuilder: React.FC<AdvancedBuilderProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const activeTriggers = value.mainTriggers.filter(t => t !== null);

  const handleMainTriggerChange = (index: 0 | 1, trigger: any) => {
    const newTriggers: [any, any] = [...value.mainTriggers];
    newTriggers[index] = trigger;
    onChange({ ...value, mainTriggers: newTriggers });
  };

  const handleSupportingSetChange = (setName: 'setA' | 'setB', group: ConditionGroup | undefined) => {
    onChange({
      ...value,
      supporting: {
        ...value.supporting,
        [setName]: group
      }
    });
  };

  const handleAddSupportingSet = (setName: 'setA' | 'setB') => {
    const newGroup: ConditionGroup = {
      id: `${setName}-${Date.now()}`,
      logic: "AND",
      conditions: []
    };
    
    handleSupportingSetChange(setName, newGroup);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Triggers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Main Triggers</h4>
              <p className="text-xs text-gray-600">Primary entry signals (max 2)</p>
            </div>
          </div>
          
          {value.mainTriggers[1] === null && (
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
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Trigger 2</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Trigger 1 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <span className="text-sm font-medium text-blue-800">Trigger 1</span>
            </div>
            
            <ConditionBuilderV2
              value={activeTriggers[0]}
              onChange={(trigger) => handleMainTriggerChange(0, trigger)}
              showRemove={false}
            />
          </div>

          {/* Trigger 2 (Optional) */}
          {value.mainTriggers[1] && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <span className="text-sm font-medium text-purple-800">Trigger 2</span>
                </div>
                <button
                  onClick={() => handleMainTriggerChange(1, null)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <ConditionBuilderV2
                value={value.mainTriggers[1]}
                onChange={(trigger) => handleMainTriggerChange(1, trigger)}
                showRemove={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Supporting Conditions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Supporting Conditions</h4>
              <p className="text-xs text-gray-600">Additional filters and confirmations</p>
            </div>
          </div>
        </div>

        {/* Set A */}
        {value.supporting.setA ? (
          <div className="mb-4">
            <ConditionGroupBuilder
              value={value.supporting.setA}
              onChange={(group) => handleSupportingSetChange('setA', group)}
              onRemove={() => handleSupportingSetChange('setA', undefined)}
              groupName="Set A"
              maxConditions={10 - (value.supporting.setB?.conditions.length || 0)}
            />
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg mb-4">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-gray-500 text-sm mb-3">No supporting conditions</p>
            <button
              onClick={() => handleAddSupportingSet('setA')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Set A
            </button>
          </div>
        )}

        {/* Set B */}
        {value.supporting.setB ? (
          <ConditionGroupBuilder
            value={value.supporting.setB}
            onChange={(group) => handleSupportingSetChange('setB', group)}
            onRemove={() => handleSupportingSetChange('setB', undefined)}
            groupName="Set B"
            maxConditions={10 - (value.supporting.setA?.conditions.length || 0)}
          />
        ) : value.supporting.setA && (
          <div className="text-center py-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500 text-sm mb-2">Add Set B for OR logic</p>
            <button
              onClick={() => handleAddSupportingSet('setB')}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors"
            >
              Add Set B
            </button>
          </div>
        )}
      </div>

      {/* Timing & Window Settings */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Timing & Window</h4>
            <p className="text-xs text-gray-600">Configure execution timing and validity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trigger Timing */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Trigger Timing</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onChange({ ...value, triggerTiming: 'onBarClose' })}
                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  value.triggerTiming === 'onBarClose'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                On Bar Close
              </button>
              <button
                onClick={() => onChange({ ...value, triggerTiming: 'nextBarOpen' })}
                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  value.triggerTiming === 'nextBarOpen'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Next Bar Open
              </button>
            </div>
          </div>

          {/* Cooldown Bars */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="No cooldown"
            />
          </div>

          {/* Reset If Stale */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-medium text-gray-700">Reset if stale</label>
              <p className="text-xs text-gray-500">Reset setup if conditions expire</p>
            </div>
            <button
              onClick={() => onChange({ ...value, resetIfStale: !value.resetIfStale })}
              className={`w-8 h-4 rounded-full transition-colors relative ${
                value.resetIfStale ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                value.resetIfStale ? 'translate-x-4' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          {/* Time Window */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">Time Window</label>
              <button
                onClick={() => onChange({
                  ...value,
                  timeWindow: {
                    ...value.timeWindow,
                    enabled: !value.timeWindow?.enabled
                  } as any
                })}
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  value.timeWindow?.enabled ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                  value.timeWindow?.enabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}></div>
              </button>
            </div>
            
            {value.timeWindow?.enabled && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={value.timeWindow.start || '09:15'}
                  onChange={(e) => onChange({
                    ...value,
                    timeWindow: {
                      ...value.timeWindow,
                      start: e.target.value
                    } as any
                  })}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="time"
                  value={value.timeWindow.end || '15:30'}
                  onChange={(e) => onChange({
                    ...value,
                    timeWindow: {
                      ...value.timeWindow,
                      end: e.target.value
                    } as any
                  })}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Strategy Notes</label>
        <textarea
          value={value.notes || ''}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          placeholder="Add notes about this entry strategy..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={3}
        />
      </div>
    </div>
  );
};

export default AdvancedBuilder;
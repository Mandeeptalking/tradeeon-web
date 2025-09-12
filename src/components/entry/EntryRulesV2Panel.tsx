import React, { useState, useEffect } from 'react';
import { Plus, Copy, Save, CheckCircle, AlertCircle, Lightbulb, Clock, Zap, Settings } from 'lucide-react';
import { EntryRulesV2, TriggerCondition, ConditionGroup, TimeWindow } from '../../types/entry';
import { loadEntryDraft, saveEntryDraft, getDefaultEntryRules, validateEntryRules, generateTriggerId, generateGroupId } from '../../lib/entryDraft';
import TriggerBuilder from './TriggerBuilder';
import ConditionGroupBuilder from './ConditionGroupBuilder';

interface EntryRulesV2PanelProps {
  initial?: EntryRulesV2;
  onChange?: (entry: EntryRulesV2) => void;
  className?: string;
}

export default function EntryRulesV2Panel({ 
  initial, 
  onChange, 
  className = "" 
}: EntryRulesV2PanelProps) {
  const [entryRules, setEntryRules] = useState<EntryRulesV2>(() => {
    if (initial) return initial;
    
    const draft = loadEntryDraft();
    if (draft) return draft;
    
    return getDefaultEntryRules();
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showJsonCopy, setShowJsonCopy] = useState(false);

  // Auto-save to localStorage on changes
  useEffect(() => {
    saveEntryDraft(entryRules);
    if (onChange) {
      onChange(entryRules);
    }
    
    // Validate rules
    const errors = validateEntryRules(entryRules);
    setValidationErrors(errors);
  }, [entryRules, onChange]);

  const handleMainTriggerChange = (index: 0 | 1, trigger: TriggerCondition | null) => {
    const newTriggers: [TriggerCondition, (TriggerCondition | null)] = [...entryRules.mainTriggers];
    newTriggers[index] = trigger;
    setEntryRules(prev => ({ ...prev, mainTriggers: newTriggers }));
  };

  const handleAddMainTrigger = () => {
    if (entryRules.mainTriggers[1] !== null) return;

    const newTrigger: TriggerCondition = {
      id: generateTriggerId(),
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
  };

  const handleRemoveMainTrigger = (index: 1) => {
    handleMainTriggerChange(index, null);
  };

  const handleSupportingSetChange = (setName: 'setA' | 'setB', group: ConditionGroup | undefined) => {
    setEntryRules(prev => ({
      ...prev,
      supporting: {
        ...prev.supporting,
        [setName]: group
      }
    }));
  };

  const handleAddSupportingSet = (setName: 'setA' | 'setB') => {
    const newGroup: ConditionGroup = {
      id: generateGroupId(),
      logic: "AND",
      conditions: []
    };
    
    handleSupportingSetChange(setName, newGroup);
  };

  const handleTimingChange = (field: string, value: any) => {
    if (field === 'triggerTiming') {
      setEntryRules(prev => ({ ...prev, triggerTiming: value }));
    } else if (field === 'cooldownBars') {
      setEntryRules(prev => ({ ...prev, cooldownBars: value > 0 ? value : undefined }));
    } else if (field === 'resetIfStale') {
      setEntryRules(prev => ({ ...prev, resetIfStale: value }));
    }
  };

  const handleTimeWindowChange = (timeWindow: TimeWindow) => {
    setEntryRules(prev => ({ ...prev, timeWindow }));
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(entryRules, null, 2));
      setShowJsonCopy(true);
      setTimeout(() => setShowJsonCopy(false), 2000);
    } catch (error) {
      console.error('Failed to copy JSON:', error);
    }
  };

  const generateFullSentence = () => {
    const activeTriggers = entryRules.mainTriggers.filter(t => t !== null);
    if (activeTriggers.length === 0) return "No entry conditions configured.";

    let sentence = "Enter when ";
    
    // Main triggers
    if (activeTriggers.length === 1) {
      sentence += renderConditionText(activeTriggers[0]);
    } else {
      sentence += `(${activeTriggers.map(renderConditionText).join(' OR ')})`;
    }
    
    // Supporting conditions
    const supportingParts = [];
    if (entryRules.supporting.setA && entryRules.supporting.setA.conditions.length > 0) {
      const setAText = entryRules.supporting.setA.conditions.length === 1
        ? renderConditionText(entryRules.supporting.setA.conditions[0])
        : `(${entryRules.supporting.setA.conditions.map(renderConditionText).join(entryRules.supporting.setA.logic === 'AND' ? ' AND ' : ' OR ')})`;
      supportingParts.push(setAText);
    }
    
    if (entryRules.supporting.setB && entryRules.supporting.setB.conditions.length > 0) {
      const setBText = entryRules.supporting.setB.conditions.length === 1
        ? renderConditionText(entryRules.supporting.setB.conditions[0])
        : `(${entryRules.supporting.setB.conditions.map(renderConditionText).join(entryRules.supporting.setB.logic === 'AND' ? ' AND ' : ' OR ')})`;
      supportingParts.push(setBText);
    }
    
    if (supportingParts.length > 0) {
      sentence += ` AND (${supportingParts.join(' OR ')})`;
    }
    
    // Timing details
    sentence += ` on ${entryRules.triggerTiming === 'onBarClose' ? 'bar close' : 'next bar open'}`;
    
    if (entryRules.cooldownBars) {
      sentence += `, cooldown ${entryRules.cooldownBars} bars`;
    }
    
    if (entryRules.timeWindow?.enabled) {
      sentence += `, window ${entryRules.timeWindow.start}–${entryRules.timeWindow.end}`;
      if (entryRules.timeWindow.timezone) {
        sentence += ` ${entryRules.timeWindow.timezone}`;
      }
    }
    
    return sentence + ".";
  };

  const renderConditionText = (condition: TriggerCondition): string => {
    if (condition.kind === 'webhook') {
      return `webhook ${condition.match.key}=${condition.match.equals}`;
    }
    
    const { left, op, right, timeframe } = condition;
    const leftText = `${left.name}${left.settings?.length ? `(${left.settings.length})` : ''}`;
    const opText = op === 'crossesAbove' ? 'crosses above' : 
                   op === 'crossesBelow' ? 'crosses below' :
                   op === '>' ? '>' :
                   op === '<' ? '<' :
                   op === '>=' ? '>=' :
                   op === '<=' ? '<=' :
                   op === '=' ? '=' :
                   op === '!=' ? '!=' : op;
    
    let rightText = '';
    if (right.type === 'value') {
      rightText = right.value.toString();
    } else {
      rightText = `its ${right.indicator.component}`;
    }
    
    return `${leftText} on ${timeframe} ${opText} ${rightText}`;
  };

  const getTotalSupportingConditions = () => {
    return (entryRules.supporting.setA?.conditions.length || 0) + 
           (entryRules.supporting.setB?.conditions.length || 0);
  };

  const getQualityScore = () => {
    let score = 0;
    const maxScore = 100;
    
    // Base score for having main triggers
    const activeTriggers = entryRules.mainTriggers.filter(t => t !== null);
    score += activeTriggers.length * 25; // 25 points per trigger, max 50
    
    // Points for supporting conditions
    const supportingCount = getTotalSupportingConditions();
    score += Math.min(supportingCount * 5, 25); // 5 points per condition, max 25
    
    // Points for timeframe diversity
    const allConditions = [
      ...activeTriggers.filter(t => t.kind === 'indicator'),
      ...(entryRules.supporting.setA?.conditions || []),
      ...(entryRules.supporting.setB?.conditions || [])
    ];
    
    const timeframes = new Set(allConditions.map(c => (c as any).timeframe).filter(Boolean));
    score += Math.min(timeframes.size * 5, 15); // 5 points per unique timeframe, max 15
    
    // Points for advanced features
    if (entryRules.timeWindow?.enabled) score += 5;
    if (entryRules.cooldownBars) score += 5;
    
    return Math.min(score, maxScore);
  };

  const qualityScore = getQualityScore();

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Entry Rules v2</h2>
            <p className="text-sm text-gray-600">Configure main triggers and supporting conditions</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Quality Score */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                qualityScore >= 80 ? 'bg-green-500' :
                qualityScore >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">Quality: {qualityScore}%</span>
            </div>
            
            <button
              onClick={handleCopyJson}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
            >
              {showJsonCopy ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              <span>{showJsonCopy ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Rule Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Triggers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Main Triggers (max 2)</h3>
                  <p className="text-xs text-gray-600">Whichever hits first enters the trade</p>
                </div>
                {entryRules.mainTriggers[1] === null && (
                  <button
                    onClick={handleAddMainTrigger}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Trigger 2</span>
                  </button>
                )}
              </div>

              {/* Trigger 1 */}
              <TriggerBuilder
                value={entryRules.mainTriggers[0]}
                onChange={(trigger) => handleMainTriggerChange(0, trigger)}
                triggerNumber={1}
              />

              {/* Trigger 2 (Optional) */}
              {entryRules.mainTriggers[1] && (
                <div className="relative">
                  <TriggerBuilder
                    value={entryRules.mainTriggers[1]}
                    onChange={(trigger) => handleMainTriggerChange(1, trigger)}
                    triggerNumber={2}
                  />
                  <button
                    onClick={() => handleRemoveMainTrigger(1)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Supporting Conditions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Supporting Conditions</h3>
                  <p className="text-xs text-gray-600">
                    Additional filters ({getTotalSupportingConditions()}/10 conditions)
                  </p>
                </div>
              </div>

              {/* Set A */}
              {entryRules.supporting.setA ? (
                <ConditionGroupBuilder
                  value={entryRules.supporting.setA}
                  onChange={(group) => handleSupportingSetChange('setA', group)}
                  onRemove={() => handleSupportingSetChange('setA', undefined)}
                  groupName="Set A"
                  maxConditions={10 - (entryRules.supporting.setB?.conditions.length || 0)}
                />
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-gray-500 text-sm mb-3">No supporting conditions</p>
                  <button
                    onClick={() => handleAddSupportingSet('setA')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Add Set A
                  </button>
                </div>
              )}

              {/* Set B */}
              {entryRules.supporting.setB ? (
                <ConditionGroupBuilder
                  value={entryRules.supporting.setB}
                  onChange={(group) => handleSupportingSetChange('setB', group)}
                  onRemove={() => handleSupportingSetChange('setB', undefined)}
                  groupName="Set B"
                  maxConditions={10 - (entryRules.supporting.setA?.conditions.length || 0)}
                />
              ) : entryRules.supporting.setA && (
                <div className="text-center py-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-gray-500 text-sm mb-2">Add Set B for OR logic</p>
                  <button
                    onClick={() => handleAddSupportingSet('setB')}
                    disabled={getTotalSupportingConditions() >= 10}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      getTotalSupportingConditions() >= 10
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    Add Set B
                  </button>
                </div>
              )}
            </div>

            {/* Timing & Window Settings */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Timing & Window</h3>
                  <p className="text-xs text-gray-600">Configure execution timing and validity</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trigger Timing */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Trigger Timing</label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => handleTimingChange('triggerTiming', 'onBarClose')}
                      className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        entryRules.triggerTiming === 'onBarClose'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      On Bar Close
                    </button>
                    <button
                      onClick={() => handleTimingChange('triggerTiming', 'nextBarOpen')}
                      className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        entryRules.triggerTiming === 'nextBarOpen'
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
                    value={entryRules.cooldownBars || ''}
                    onChange={(e) => handleTimingChange('cooldownBars', Number(e.target.value) || 0)}
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
                    onClick={() => handleTimingChange('resetIfStale', !entryRules.resetIfStale)}
                    className={`w-8 h-4 rounded-full transition-colors relative ${
                      entryRules.resetIfStale ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                      entryRules.resetIfStale ? 'translate-x-4' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>

                {/* Time Window */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700">Time Window</label>
                    <button
                      onClick={() => handleTimeWindowChange({
                        ...entryRules.timeWindow,
                        enabled: !entryRules.timeWindow?.enabled
                      } as TimeWindow)}
                      className={`w-8 h-4 rounded-full transition-colors relative ${
                        entryRules.timeWindow?.enabled ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${
                        entryRules.timeWindow?.enabled ? 'translate-x-4' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                  
                  {entryRules.timeWindow?.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={entryRules.timeWindow.start || '09:15'}
                        onChange={(e) => handleTimeWindowChange({
                          ...entryRules.timeWindow,
                          start: e.target.value
                        } as TimeWindow)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="time"
                        value={entryRules.timeWindow.end || '15:30'}
                        onChange={(e) => handleTimeWindowChange({
                          ...entryRules.timeWindow,
                          end: e.target.value
                        } as TimeWindow)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Natural Language Preview */}
          <div className="space-y-6">
            {/* Natural Language Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Natural Language</h3>
              <div className="prose prose-sm text-gray-700">
                <p className="leading-relaxed">{generateFullSentence()}</p>
              </div>
            </div>

            {/* Validation Status */}
            <div className={`border rounded-xl p-4 ${
              validationErrors.length === 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {validationErrors.length === 0 ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  validationErrors.length === 0 ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationErrors.length === 0 ? 'Valid Configuration' : 'Issues Found'}
                </span>
              </div>
              
              {validationErrors.length > 0 && (
                <ul className="text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Strategy Stats */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Strategy Stats</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-700">Main Triggers:</span>
                  <span className="font-medium text-blue-900">
                    {entryRules.mainTriggers.filter(t => t !== null).length}/2
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Supporting Conditions:</span>
                  <span className="font-medium text-blue-900">
                    {getTotalSupportingConditions()}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Supporting Sets:</span>
                  <span className="font-medium text-blue-900">
                    {[entryRules.supporting.setA, entryRules.supporting.setB].filter(Boolean).length}/2
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Time Window:</span>
                  <span className="font-medium text-blue-900">
                    {entryRules.timeWindow?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Smart Hints */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Smart Hints</h4>
                  <div className="text-xs text-yellow-700 space-y-1">
                    {entryRules.mainTriggers[0]?.kind === 'indicator' && 
                     entryRules.mainTriggers[0].left.name === 'RSI' && 
                     entryRules.mainTriggers[0].op === 'crossesAbove' && (
                      <p>• Consider adding "EMA(50) &gt; EMA(200)" for trend confirmation</p>
                    )}
                    {getTotalSupportingConditions() === 0 && (
                      <p>• Add supporting conditions to reduce false signals</p>
                    )}
                    {entryRules.mainTriggers.filter(t => t !== null).length === 1 && (
                      <p>• Add a second trigger for alternative entry scenarios</p>
                    )}
                    {!entryRules.timeWindow?.enabled && (
                      <p>• Enable time window to trade only during market hours</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={() => saveEntryDraft(entryRules)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>
              
              <button
                onClick={handleCopyJson}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                {showJsonCopy ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{showJsonCopy ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Strategy Notes</label>
              <textarea
                value={entryRules.notes || ''}
                onChange={(e) => setEntryRules(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this entry strategy..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
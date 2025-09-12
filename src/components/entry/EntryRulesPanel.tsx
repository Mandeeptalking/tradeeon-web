import React, { useState, useEffect } from 'react';
import { Plus, Copy, Save, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { EntryRuleSet, ConditionGroup, Condition, IndicatorCondition } from '../../types/strategy';
import { loadDraft, saveDraft, generateConditionId, generateGroupId, validateIndicatorCondition } from '../../lib/strategyDraft';
import ConditionBuilder from './ConditionBuilder';
import ConditionRow from './ConditionRow';
import GroupLogicToggle from './GroupLogicToggle';
import TriggerConditionCard from './TriggerConditionCard';
import NaturalSentence from './NaturalSentence';

interface EntryRulesPanelProps {
  initial?: EntryRuleSet;
  onChange?: (entry: EntryRuleSet) => void;
  className?: string;
}

export default function EntryRulesPanel({ 
  initial, 
  onChange, 
  className = "" 
}: EntryRulesPanelProps) {
  const [entryRules, setEntryRules] = useState<EntryRuleSet>(() => {
    if (initial) return initial;
    
    const draft = loadDraft();
    if (draft?.entry) return draft.entry;
    
    // Default entry rules
    return {
      main: {
        id: "main-1",
        kind: "indicator",
        timeframe: "15m",
        left: {
          name: "RSI",
          component: "line",
          settings: { length: 14 }
        },
        op: "crossesAbove",
        right: { type: "value", value: 30 }
      },
      supporting: [
        {
          id: "group-1",
          logic: "AND",
          conditions: [
            {
              id: "support-1",
              kind: "indicator",
              timeframe: "1h",
              left: {
                name: "EMA",
                component: "line",
                settings: { length: 50 }
              },
              op: ">",
              right: {
                type: "indicator",
                indicator: {
                  name: "EMA",
                  component: "line",
                  settings: { length: 200 }
                }
              }
            }
          ]
        }
      ],
      notes: ""
    };
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showJsonCopy, setShowJsonCopy] = useState(false);

  // Auto-save to localStorage on changes
  useEffect(() => {
    saveDraft({ entry: entryRules });
    if (onChange) {
      onChange(entryRules);
    }
    validateRules();
  }, [entryRules, onChange]);

  const validateRules = () => {
    const errors: string[] = [];
    
    // Main condition is required
    if (!entryRules.main) {
      errors.push("Main condition is required");
    } else {
      // Validate main condition
      const mainErrors = validateIndicatorCondition(entryRules.main);
      errors.push(...mainErrors.map(err => `Main condition: ${err}`));
    }
    
    // Check for empty groups
    entryRules.supporting.forEach((group, index) => {
      if (group.conditions.length === 0) {
        errors.push(`Supporting group ${index + 1} is empty`);
      }
      
      // Validate each condition in the group
      group.conditions.forEach((condition, condIndex) => {
        if (condition.kind === 'indicator') {
          const condErrors = validateIndicatorCondition(condition);
          errors.push(...condErrors.map(err => `Group ${index + 1}, Condition ${condIndex + 1}: ${err}`));
        }
      });
    });
    
    // Validate trigger condition
    if (entryRules.trigger && entryRules.trigger.kind === 'indicator') {
      const triggerErrors = validateIndicatorCondition(entryRules.trigger);
      errors.push(...triggerErrors.map(err => `Trigger condition: ${err}`));
    }
    
    // Check for contradictory conditions (basic heuristic)
    const allConditions = [
      entryRules.main,
      ...entryRules.supporting.flatMap(g => g.conditions),
      entryRules.trigger
    ].filter(Boolean) as Condition[];
    
    const indicatorConditions = allConditions.filter(c => c.kind === 'indicator') as IndicatorCondition[];
    
    // Check for RSI contradictions on same timeframe
    const rsiConditions = indicatorConditions.filter(c => 
      c.left.name === 'RSI' && c.right.type === 'value'
    );
    
    const rsiByTimeframe = new Map<string, IndicatorCondition[]>();
    rsiConditions.forEach(cond => {
      const key = cond.timeframe;
      if (!rsiByTimeframe.has(key)) {
        rsiByTimeframe.set(key, []);
      }
      rsiByTimeframe.get(key)!.push(cond);
    });
    
    rsiByTimeframe.forEach((conditions, timeframe) => {
      const hasLow = conditions.some(c => c.op === '<' && (c.right as any).value < 50);
      const hasHigh = conditions.some(c => c.op === '>' && (c.right as any).value > 50);
      if (hasLow && hasHigh) {
        errors.push(`Contradictory RSI conditions on ${timeframe}: both low and high thresholds`);
      }
    });
    
    setValidationErrors(errors);
  };

  const handleMainChange = (main: IndicatorCondition) => {
    setEntryRules(prev => ({ ...prev, main }));
  };

  const handleAddSupportingGroup = () => {
    const newGroup: ConditionGroup = {
      id: generateGroupId(),
      logic: "AND",
      conditions: [
        {
          id: generateConditionId(),
          kind: "indicator",
          timeframe: "1h",
          left: {
            name: "EMA",
            component: "line",
            settings: { length: 20 }
          },
          op: ">",
          right: { type: "value", value: 0 }
        }
      ]
    };
    
    setEntryRules(prev => ({
      ...prev,
      supporting: [...prev.supporting, newGroup]
    }));
  };

  const handleSupportingGroupChange = (groupIndex: number, group: ConditionGroup) => {
    setEntryRules(prev => ({
      ...prev,
      supporting: prev.supporting.map((g, i) => i === groupIndex ? group : g)
    }));
  };

  const handleRemoveSupportingGroup = (groupIndex: number) => {
    setEntryRules(prev => ({
      ...prev,
      supporting: prev.supporting.filter((_, i) => i !== groupIndex)
    }));
  };

  const handleAddConditionToGroup = (groupIndex: number) => {
    const newCondition: IndicatorCondition = {
      id: generateConditionId(),
      kind: "indicator",
      timeframe: "15m",
      left: {
        name: "RSI",
        component: "line",
        settings: { length: 14 }
      },
      op: ">",
      right: { type: "value", value: 50 }
    };

    setEntryRules(prev => ({
      ...prev,
      supporting: prev.supporting.map((group, i) => 
        i === groupIndex 
          ? { ...group, conditions: [...group.conditions, newCondition] }
          : group
      )
    }));
  };

  const handleRemoveConditionFromGroup = (groupIndex: number, conditionIndex: number) => {
    setEntryRules(prev => {
      const newSupporting = prev.supporting.map((group, i) => 
        i === groupIndex 
          ? { ...group, conditions: group.conditions.filter((_, ci) => ci !== conditionIndex) }
          : group
      );
      
      // Remove empty groups
      return {
        ...prev,
        supporting: newSupporting.filter(group => group.conditions.length > 0)
      };
    });
  };

  const handleTriggerChange = (trigger: Condition | undefined) => {
    setEntryRules(prev => ({ ...prev, trigger }));
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
    let sentence = "Enter when ";
    
    // Main condition
    sentence += `${renderConditionText(entryRules.main)}`;
    
    // Supporting conditions
    if (entryRules.supporting.length > 0) {
      entryRules.supporting.forEach((group, groupIndex) => {
        if (group.conditions.length > 0) {
          sentence += groupIndex === 0 ? " and " : " and ";
          
          if (group.conditions.length === 1) {
            sentence += renderConditionText(group.conditions[0]);
          } else {
            const groupSentences = group.conditions.map(renderConditionText);
            const connector = group.logic === "AND" ? " and " : " or ";
            sentence += `(${groupSentences.join(connector)})`;
          }
        }
      });
    }
    
    // Trigger condition
    if (entryRules.trigger) {
      sentence += ` and finally ${renderConditionText(entryRules.trigger)}`;
    }
    
    return sentence + ".";
  };

  const renderConditionText = (condition: Condition): string => {
    if (condition.kind === 'webhook') {
      return `webhook ${condition.match.key} equals ${condition.match.equals}`;
    }
    
    const { left, op, right, timeframe } = condition;
    const leftText = `${left.name}${left.settings?.length ? `(${left.settings.length})` : ''}`;
    const opText = op === 'crossesAbove' ? 'crosses above' : 
                   op === 'crossesBelow' ? 'crosses below' :
                   op === '>' ? 'is greater than' :
                   op === '<' ? 'is less than' :
                   op === '>=' ? 'is greater than or equal to' :
                   op === '<=' ? 'is less than or equal to' :
                   op === '=' ? 'equals' :
                   op === '!=' ? 'does not equal' :
                   op === 'increasesByPct' ? 'increases by' :
                   op === 'decreasesByPct' ? 'decreases by' : op;
    
    let rightText = '';
    if (right.type === 'value') {
      rightText = right.value.toString();
      if (op === 'increasesByPct' || op === 'decreasesByPct') {
        rightText += '%';
      }
    } else {
      rightText = `${right.indicator.name}${right.indicator.settings?.length ? `(${right.indicator.settings.length})` : ''}`;
    }
    
    return `${leftText} on ${timeframe} ${opText} ${rightText}`;
  };

  const getQualityScore = () => {
    let score = 0;
    const maxScore = 100;
    
    // Base score for having main condition
    score += 30;
    
    // Points for supporting conditions
    score += Math.min(entryRules.supporting.length * 15, 45);
    
    // Points for trigger condition
    if (entryRules.trigger) score += 15;
    
    // Points for timeframe diversity
    const timeframes = new Set([
      entryRules.main.timeframe,
      ...entryRules.supporting.flatMap(g => 
        g.conditions.filter(c => c.kind === 'indicator').map(c => (c as IndicatorCondition).timeframe)
      ),
      ...(entryRules.trigger?.kind === 'indicator' ? [(entryRules.trigger as IndicatorCondition).timeframe] : [])
    ]);
    score += Math.min(timeframes.size * 5, 10);
    
    return Math.min(score, maxScore);
  };

  const qualityScore = getQualityScore();

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Entry Rules</h2>
            <p className="text-sm text-gray-600">Configure when to enter trades</p>
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
            {/* Main Condition */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Main Condition</h3>
                  <p className="text-xs text-gray-600">Primary entry signal (required)</p>
                </div>
              </div>
              
              <ConditionBuilder
                value={entryRules.main}
                onChange={handleMainChange}
              />
            </div>

            {/* Supporting Conditions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Supporting Conditions</h3>
                  <p className="text-xs text-gray-600">Additional filters and confirmations</p>
                </div>
                <button
                  onClick={handleAddSupportingGroup}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Group</span>
                </button>
              </div>

              {entryRules.supporting.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-3xl mb-3">📊</div>
                  <p className="text-gray-600 text-sm mb-4">No supporting conditions</p>
                  <button
                    onClick={handleAddSupportingGroup}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Add First Group
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {entryRules.supporting.map((group, groupIndex) => (
                    <div key={group.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">Group {groupIndex + 1}</span>
                          <GroupLogicToggle
                            value={group.logic}
                            onChange={(logic) => handleSupportingGroupChange(groupIndex, { ...group, logic })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAddConditionToGroup(groupIndex)}
                            className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                          <button
                            onClick={() => handleRemoveSupportingGroup(groupIndex)}
                            className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-xs transition-colors"
                          >
                            Remove Group
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {group.conditions.map((condition, conditionIndex) => (
                          <ConditionRow
                            key={condition.id}
                            value={condition}
                            onChange={(updatedCondition) => {
                              const updatedGroup = {
                                ...group,
                                conditions: group.conditions.map((c, i) => 
                                  i === conditionIndex ? updatedCondition : c
                                )
                              };
                              handleSupportingGroupChange(groupIndex, updatedGroup);
                            }}
                            onRemove={() => handleRemoveConditionFromGroup(groupIndex, conditionIndex)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trigger Condition */}
            <TriggerConditionCard
              value={entryRules.trigger}
              onChange={handleTriggerChange}
            />

            {/* Smart Hints */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Smart Hints</h4>
                  <div className="text-xs text-yellow-700 space-y-1">
                    {entryRules.main.left.name === 'RSI' && entryRules.main.op === 'crossesAbove' && (
                      <p>• Consider adding "Price above EMA(200)" for trend confirmation</p>
                    )}
                    {!entryRules.supporting.some(g => g.conditions.some(c => 
                      c.kind === 'indicator' && (c as IndicatorCondition).left.name === 'MACD'
                    )) && (
                      <p>• MACD histogram can provide momentum confirmation</p>
                    )}
                    {entryRules.supporting.length === 0 && (
                      <p>• Add supporting conditions to reduce false signals</p>
                    )}
                    {entryRules.main.left.name === 'EMA' && entryRules.main.right.type === 'value' && (
                      <p>• EMA vs value comparisons work best with price crossovers</p>
                    )}
                    {entryRules.main.left.name === 'MACD' && !entryRules.main.right.type === 'indicator' && (
                      <p>• Consider comparing MACD line to Signal line for crossover signals</p>
                    )}
                  </div>
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

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={() => saveDraft({ entry: entryRules })}
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
              <label className="block text-xs font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={entryRules.notes || ''}
                onChange={(e) => setEntryRules(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this strategy..."
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
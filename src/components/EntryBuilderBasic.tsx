import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import { EntryRuleGroup, EntryRule, MatchOp, RuleType } from '../types/bot';

interface EntryBuilderBasicProps {
  value: EntryRuleGroup;
  onChange: (group: EntryRuleGroup) => void;
  botType: "Spot" | "Futures";
  direction?: "Long" | "Short";
}

const ruleTemplates = [
  { type: 'RSI' as RuleType, label: 'RSI Indicator' },
  { type: 'EMA_CROSS' as RuleType, label: 'EMA Crossover' },
  { type: 'PRICE_CHANGE' as RuleType, label: 'Price Change %' },
  { type: 'BREAKOUT' as RuleType, label: 'Breakout Level' }
];

export default function EntryBuilderBasic({ value, onChange, botType, direction }: EntryBuilderBasicProps) {
  const [showAddRule, setShowAddRule] = useState(false);

  // Auto-adjust default rule based on direction
  useEffect(() => {
    if (value.rules.length === 1 && value.rules[0].type === 'RSI') {
      const currentRule = value.rules[0];
      const shouldBeShort = botType === 'Futures' && direction === 'Short';
      
      if (shouldBeShort && currentRule.op === '<' && currentRule.value === 30) {
        // Auto-adjust to Short direction
        const newRule = { ...currentRule, op: '>' as const, value: 70 };
        onChange({ ...value, rules: [newRule] });
        
        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = 'Adjusted RSI for Short direction';
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      } else if (!shouldBeShort && currentRule.op === '>' && currentRule.value === 70) {
        // Auto-adjust to Long direction
        const newRule = { ...currentRule, op: '<' as const, value: 30 };
        onChange({ ...value, rules: [newRule] });
      }
    }
  }, [botType, direction, value, onChange]);

  const addRule = (type: RuleType) => {
    let newRule: EntryRule;
    
    switch (type) {
      case 'RSI':
        const isShort = botType === 'Futures' && direction === 'Short';
        newRule = {
          type: 'RSI',
          period: 14,
          op: isShort ? '>' : '<',
          value: isShort ? 70 : 30
        };
        break;
      case 'EMA_CROSS':
        newRule = {
          type: 'EMA_CROSS',
          fast: 9,
          slow: 21,
          dir: 'ABOVE'
        };
        break;
      case 'PRICE_CHANGE':
        newRule = {
          type: 'PRICE_CHANGE',
          window: { value: 1, unit: 'h' },
          op: '<=',
          percent: -2
        };
        break;
      case 'BREAKOUT':
        newRule = {
          type: 'BREAKOUT',
          side: 'ABOVE',
          lookbackDays: 5,
          ref: 'HIGH'
        };
        break;
    }
    
    onChange({
      ...value,
      rules: [...value.rules, newRule]
    });
    setShowAddRule(false);
  };

  const updateRule = (index: number, updatedRule: EntryRule) => {
    const newRules = [...value.rules];
    newRules[index] = updatedRule;
    onChange({ ...value, rules: newRules });
  };

  const removeRule = (index: number) => {
    onChange({
      ...value,
      rules: value.rules.filter((_, i) => i !== index)
    });
  };

  const generatePreview = () => {
    if (value.rules.length === 0) return "No entry conditions set";
    
    const ruleTexts = value.rules.map(rule => {
      switch (rule.type) {
        case 'RSI':
          return `RSI(${rule.period}) ${rule.op} ${rule.value}`;
        case 'EMA_CROSS':
          return `EMA(${rule.fast}) crosses ${rule.dir.toLowerCase()} EMA(${rule.slow})`;
        case 'PRICE_CHANGE':
          return `Price change ${rule.window.value}${rule.window.unit} ${rule.op} ${rule.percent}%`;
        case 'BREAKOUT':
          return `Breakout ${rule.side.toLowerCase()} last ${rule.lookbackDays}-day ${rule.ref.toLowerCase()}`;
        default:
          return 'Unknown rule';
      }
    });
    
    const connector = value.match === 'ANY' ? ' OR ' : ' AND ';
    return `Enter ${direction?.toLowerCase() || 'long'} when ${ruleTexts.join(connector)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Entry Conditions</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Match:</span>
          <select
            value={value.match}
            onChange={(e) => onChange({ ...value, match: e.target.value as MatchOp })}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="ANY">ANY</option>
            <option value="ALL">ALL</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {value.rules.map((rule, index) => (
          <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            {rule.type === 'RSI' && (
              <>
                <span className="text-sm font-medium">RSI(</span>
                <input
                  type="number"
                  value={rule.period}
                  onChange={(e) => updateRule(index, { ...rule, period: parseInt(e.target.value) || 14 })}
                  className="w-12 text-sm border border-gray-300 rounded px-1 py-0.5"
                  min="1"
                  max="100"
                />
                <span className="text-sm font-medium">)</span>
                <select
                  value={rule.op}
                  onChange={(e) => updateRule(index, { ...rule, op: e.target.value as '>' | '<' })}
                  className="text-sm border border-gray-300 rounded px-1 py-0.5"
                >
                  <option value="<">below</option>
                  <option value=">">above</option>
                </select>
                <input
                  type="number"
                  value={rule.value}
                  onChange={(e) => updateRule(index, { ...rule, value: parseInt(e.target.value) || 30 })}
                  className="w-12 text-sm border border-gray-300 rounded px-1 py-0.5"
                  min="0"
                  max="100"
                />
              </>
            )}

            {rule.type === 'EMA_CROSS' && (
              <>
                <span className="text-sm font-medium">EMA(</span>
                <input
                  type="number"
                  value={rule.fast}
                  onChange={(e) => updateRule(index, { ...rule, fast: parseInt(e.target.value) || 9 })}
                  className="w-12 text-sm border border-gray-300 rounded px-1 py-0.5"
                  min="1"
                />
                <span className="text-sm font-medium">) crosses</span>
                <select
                  value={rule.dir}
                  onChange={(e) => updateRule(index, { ...rule, dir: e.target.value as 'ABOVE' | 'BELOW' })}
                  className="text-sm border border-gray-300 rounded px-1 py-0.5"
                >
                  <option value="ABOVE">above</option>
                  <option value="BELOW">below</option>
                </select>
                <span className="text-sm font-medium">EMA(</span>
                <input
                  type="number"
                  value={rule.slow}
                  onChange={(e) => updateRule(index, { ...rule, slow: parseInt(e.target.value) || 21 })}
                  className="w-12 text-sm border border-gray-300 rounded px-1 py-0.5"
                  min="1"
                />
                <span className="text-sm font-medium">)</span>
              </>
            )}

            {rule.type === 'PRICE_CHANGE' && (
              <>
                <span className="text-sm font-medium">Price change</span>
                <input
                  type="number"
                  value={rule.window.value}
                  onChange={(e) => updateRule(index, { 
                    ...rule, 
                    window: { ...rule.window, value: parseInt(e.target.value) || 1 }
                  })}
                  className="w-12 text-sm border border-gray-300 rounded px-1 py-0.5"
                  min="1"
                />
                <select
                  value={rule.window.unit}
                  onChange={(e) => updateRule(index, { 
                    ...rule, 
                    window: { ...rule.window, unit: e.target.value as 'm' | 'h' | 'd' }
                  })}
                  className="text-sm border border-gray-300 rounded px-1 py-0.5"
                >
                  <option value="m">min</option>
                  <option value="h">hr</option>
                  <option value="d">day</option>
                </select>
                <select
                  value={rule.op}
                  onChange={(e) => updateRule(index, { ...rule, op: e.target.value as '<=' | '>=' })}
                  className="text-sm border border-gray-300 rounded px-1 py-0.5"
                >
                  <option value="<=">≤</option>
                  <option value=">=">≥</option>
                </select>
                <input
                  type="number"
                  value={rule.percent}
                  onChange={(e) => updateRule(index, { ...rule, percent: parseFloat(e.target.value) || 0 })}
                  className="w-16 text-sm border border-gray-300 rounded px-1 py-0.5"
                  step="0.1"
                />
                <span className="text-sm font-medium">%</span>
              </>
            )}

            {rule.type === 'BREAKOUT' && (
              <>
                <span className="text-sm font-medium">Breakout</span>
                <select
                  value={rule.side}
                  onChange={(e) => updateRule(index, { ...rule, side: e.target.value as 'ABOVE' | 'BELOW' })}
                  className="text-sm border border-gray-300 rounded px-1 py-0.5"
                >
                  <option value="ABOVE">above</option>
                  <option value="BELOW">below</option>
                </select>
                <span className="text-sm font-medium">last</span>
                <input
                  type="number"
                  value={rule.lookbackDays}
                  onChange={(e) => updateRule(index, { ...rule, lookbackDays: parseInt(e.target.value) || 5 })}
                  className="w-12 text-sm border border-gray-300 rounded px-1 py-0.5"
                  min="1"
                />
                <span className="text-sm font-medium">-day</span>
                <select
                  value={rule.ref}
                  onChange={(e) => updateRule(index, { ...rule, ref: e.target.value as 'HIGH' | 'LOW' })}
                  className="text-sm border border-gray-300 rounded px-1 py-0.5"
                >
                  <option value="HIGH">high</option>
                  <option value="LOW">low</option>
                </select>
              </>
            )}

            <button
              onClick={() => removeRule(index)}
              className="ml-auto p-1 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <button
          onClick={() => setShowAddRule(!showAddRule)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add rule
          <ChevronDown className={`w-4 h-4 transition-transform ${showAddRule ? 'rotate-180' : ''}`} />
        </button>

        {showAddRule && (
          <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
            {ruleTemplates.map((template) => (
              <button
                key={template.type}
                onClick={() => addRule(template.type)}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {template.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">Preview:</p>
        <p className="text-sm text-blue-700 mt-1">{generatePreview()}</p>
      </div>
    </div>
  );
}
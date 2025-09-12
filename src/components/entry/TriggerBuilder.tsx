import React, { useState } from 'react';
import { Zap, Webhook, BarChart3, Clock, Hash, ChevronDown } from 'lucide-react';
import { TriggerCondition, IndicatorCondition, WebhookTrigger, Timeframe, Operator } from '../../types/entry';
import { TIMEFRAMES, getTimeframeColor } from '../../config/timeframePresets';
import { OPERATOR_LABELS } from '../../config/operatorConfigs';
import { useIndicatorList, useIndicatorDef, getValidOperators, getDefaultsFromDefinition } from '../../features/createBot/hooks/useIndicatorDefs';
import { migrateConditionToSemantics } from '../../lib/entryDraft';
import CompareWithPickerV2 from './CompareWithPickerV2';
import NaturalSentenceV2 from './NaturalSentenceV2';

interface TriggerBuilderProps {
  value: TriggerCondition;
  onChange: (trigger: TriggerCondition) => void;
  triggerNumber: 1 | 2;
  className?: string;
}

export default function TriggerBuilder({ 
  value, 
  onChange, 
  triggerNumber,
  className = "" 
}: TriggerBuilderProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { indicators } = useIndicatorList();
  const { definition } = useIndicatorDef(value.kind === "indicator" ? value.left.name : null);

  const handleTypeChange = (type: "indicator" | "webhook") => {
    if (type === "indicator" && value.kind === "webhook") {
      const newCondition: IndicatorCondition = {
        id: value.id,
        kind: "indicator",
        timeframe: "15m",
        left: {
          name: "RSI",
          component: "line",
          settings: { length: 14 }
        },
        op: "crossesAbove",
        right: { type: "value", value: 30 },
        sequence: triggerNumber,
        staysValidFor: { amount: 5, unit: "bars" }
      };
      onChange(newCondition);
    } else if (type === "webhook" && value.kind === "indicator") {
      const newCondition: WebhookTrigger = {
        id: value.id,
        kind: "webhook",
        match: { key: "signal", equals: "BUY" },
        sequence: triggerNumber,
        staysValidFor: { amount: 10, unit: "bars" }
      };
      onChange(newCondition);
    }
  };

  const handleIndicatorChange = (field: string, newValue: any) => {
    if (value.kind === "indicator") {
      if (field === "indicator") {
        // Will trigger useEffect to load definition and migrate
        const updatedCondition: IndicatorCondition = {
          ...value,
          left: {
            name: newValue,
            component: "line", // Will be updated by migration
            settings: {} // Will be updated by migration
          }
        };
        onChange(updatedCondition);
      } else if (field === "timeframe") {
        onChange({ ...value, timeframe: newValue });
      } else if (field === "operator") {
        onChange({ ...value, op: newValue });
      } else if (field === "component") {
        onChange({
          ...value,
          left: { ...value.left, component: newValue }
        });
      } else if (field === "compareWith") {
        onChange({ ...value, right: newValue });
      } else if (field === "sequence") {
        onChange({ ...value, sequence: newValue > 0 ? newValue : undefined });
      } else if (field === "mustOccurWithin") {
        onChange({ ...value, mustOccurWithin: newValue });
      } else if (field === "staysValidFor") {
        onChange({ ...value, staysValidFor: newValue });
      }
    }
  };

  const handleWebhookChange = (field: string, newValue: any) => {
    if (value.kind === "webhook") {
      if (field === "key") {
        onChange({ ...value, match: { ...value.match, key: newValue } });
      } else if (field === "equals") {
        onChange({ ...value, match: { ...value.match, equals: newValue } });
      } else if (field === "sequence") {
        onChange({ ...value, sequence: newValue > 0 ? newValue : undefined });
      } else if (field === "mustOccurWithin") {
        onChange({ ...value, mustOccurWithin: newValue });
      } else if (field === "staysValidFor") {
        onChange({ ...value, staysValidFor: newValue });
      }
    }
  };

  const handleSettingChange = (settingKey: string, settingValue: any) => {
    if (value.kind === "indicator") {
      onChange({
        ...value,
        left: {
          ...value.left,
          settings: {
            ...value.left.settings,
            [settingKey]: settingValue
          }
        }
      });
    }
  };

  // Get valid operators with fallback
  const validOperators = (() => {
    if (value.kind === "indicator" && definition && value.subject && value.target) {
      const ops = getValidOperators(definition, value.subject, value.target);
      if (ops.length > 0) return ops;
    }
    
    // Fallback operators
    const fallbackOps: Record<string, Operator[]> = {
      MACD: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="],
      RSI: [">", "<", ">=", "<=", "=", "!=", "crossesAbove", "crossesBelow"],
      EMA: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="],
      BBANDS: ["crossesAbove", "crossesBelow", ">", "<"],
      ADX: [">", "<", ">=", "<=", "=", "!="],
      DI: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="],
      VWAP: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="]
    };
    
    return value.kind === "indicator" 
      ? fallbackOps[value.left.name] || [">", "<", ">=", "<=", "crossesAbove", "crossesBelow"]
      : [];
  })();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-900">Main Trigger {triggerNumber}</span>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTypeChange("indicator")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              value.kind === "indicator"
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Indicator
          </button>
          <button
            onClick={() => handleTypeChange("webhook")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              value.kind === "webhook"
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Webhook
          </button>
        </div>
      </div>

      {/* Condition Content */}
      {value.kind === "indicator" ? (
        <div className="space-y-4">
          {/* Indicator Selection Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Indicator</label>
              <select
                value={value.left.name}
                onChange={(e) => handleIndicatorChange("indicator", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {indicators.map(indicator => (
                  <option key={indicator.id} value={indicator.id}>
                    {indicator.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Timeframe</label>
              <select
                value={value.timeframe}
                onChange={(e) => handleIndicatorChange("timeframe", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TIMEFRAMES.map(tf => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Component Selection (if multiple components in definition) */}
          {definition && definition.components.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Component</label>
              <div className="flex flex-wrap gap-2">
                {definition.components.map(componentId => (
                  <button
                    key={componentId}
                    onClick={() => handleIndicatorChange("component", componentId)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors border ${
                      value.left.component === componentId
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {componentId.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {definition && Object.keys(definition.settings).length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Settings</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(definition.settings).map(([key, config]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
                    <input
                      type="number"
                      min={config.min}
                      max={config.max}
                      value={value.left.settings?.[key] || config.default}
                      onChange={(e) => handleSettingChange(key, Number(e.target.value) || config.default)}
                      className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operator Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Operator</label>
            <div className="relative">
              <select
                value={value.op}
                onChange={(e) => handleIndicatorChange("operator", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {validOperators.map(op => (
                  <option key={op} value={op}>
                    {OPERATOR_LABELS[op as keyof typeof OPERATOR_LABELS] || op}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {validOperators.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">
                No valid operators for current configuration
              </p>
            )}
          </div>

          {/* Compare With */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Compare With</label>
            <CompareWithPickerV2
              value={value.right}
              onChange={(compareWith) => handleIndicatorChange("compareWith", compareWith)}
              leftIndicatorName={value.left.name}
              parentTimeframe={value.timeframe}
              definition={definition}
              subject={value.subject}
              target={value.target}
            />
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
            </button>
            
            {showAdvanced && (
              <div className="mt-3 grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                {/* Sequence */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Hash className="w-3 h-3 inline mr-1" />
                    Sequence
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={value.sequence || ''}
                    onChange={(e) => handleIndicatorChange("sequence", Number(e.target.value) || undefined)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Auto"
                  />
                </div>

                {/* Must Occur Within */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Must Occur Within
                  </label>
                  <div className="flex space-x-1">
                    <input
                      type="number"
                      min="1"
                      value={value.mustOccurWithin?.amount || ''}
                      onChange={(e) => {
                        const amount = Number(e.target.value);
                        if (amount > 0) {
                          handleIndicatorChange("mustOccurWithin", {
                            amount,
                            unit: value.mustOccurWithin?.unit || "bars"
                          });
                        } else {
                          handleIndicatorChange("mustOccurWithin", undefined);
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="∞"
                    />
                    <select
                      value={value.mustOccurWithin?.unit || "bars"}
                      onChange={(e) => {
                        if (value.mustOccurWithin) {
                          handleIndicatorChange("mustOccurWithin", {
                            ...value.mustOccurWithin,
                            unit: e.target.value as "bars" | "minutes"
                          });
                        }
                      }}
                      className="px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="bars">bars</option>
                      <option value="minutes">min</option>
                    </select>
                  </div>
                </div>

                {/* Stays Valid For */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Stays Valid For
                  </label>
                  <div className="flex space-x-1">
                    <input
                      type="number"
                      min="1"
                      value={value.staysValidFor?.amount || ''}
                      onChange={(e) => {
                        const amount = Number(e.target.value);
                        if (amount > 0) {
                          handleIndicatorChange("staysValidFor", {
                            amount,
                            unit: value.staysValidFor?.unit || "bars"
                          });
                        } else {
                          handleIndicatorChange("staysValidFor", undefined);
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="∞"
                    />
                    <select
                      value={value.staysValidFor?.unit || "bars"}
                      onChange={(e) => {
                        if (value.staysValidFor) {
                          handleIndicatorChange("staysValidFor", {
                            ...value.staysValidFor,
                            unit: e.target.value as "bars" | "minutes"
                          });
                        }
                      }}
                      className="px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="bars">bars</option>
                      <option value="minutes">min</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Webhook Content */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Key</label>
              <input
                type="text"
                value={value.match.key}
                onChange={(e) => handleWebhookChange("key", e.target.value)}
                placeholder="signal"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Equals</label>
              <input
                type="text"
                value={String(value.match.equals)}
                onChange={(e) => {
                  const val = e.target.value;
                  // Try to parse as number or boolean, otherwise keep as string
                  if (val === 'true') handleWebhookChange("equals", true);
                  else if (val === 'false') handleWebhookChange("equals", false);
                  else if (!isNaN(Number(val)) && val !== '') handleWebhookChange("equals", Number(val));
                  else handleWebhookChange("equals", val);
                }}
                placeholder="BUY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Advanced Settings for Webhook */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
            </button>
            
            {showAdvanced && (
              <div className="mt-3 grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                {/* Sequence */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Hash className="w-3 h-3 inline mr-1" />
                    Sequence
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={value.sequence || ''}
                    onChange={(e) => handleWebhookChange("sequence", Number(e.target.value) || undefined)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Auto"
                  />
                </div>

                {/* Must Occur Within */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Must Occur Within
                  </label>
                  <div className="flex space-x-1">
                    <input
                      type="number"
                      min="1"
                      value={value.mustOccurWithin?.amount || ''}
                      onChange={(e) => {
                        const amount = Number(e.target.value);
                        if (amount > 0) {
                          handleWebhookChange("mustOccurWithin", {
                            amount,
                            unit: value.mustOccurWithin?.unit || "bars"
                          });
                        } else {
                          handleWebhookChange("mustOccurWithin", undefined);
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="∞"
                    />
                    <select
                      value={value.mustOccurWithin?.unit || "bars"}
                      onChange={(e) => {
                        if (value.mustOccurWithin) {
                          handleWebhookChange("mustOccurWithin", {
                            ...value.mustOccurWithin,
                            unit: e.target.value as "bars" | "minutes"
                          });
                        }
                      }}
                      className="px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="bars">bars</option>
                      <option value="minutes">min</option>
                    </select>
                  </div>
                </div>

                {/* Stays Valid For */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Stays Valid For
                  </label>
                  <div className="flex space-x-1">
                    <input
                      type="number"
                      min="1"
                      value={value.staysValidFor?.amount || ''}
                      onChange={(e) => {
                        const amount = Number(e.target.value);
                        if (amount > 0) {
                          handleWebhookChange("staysValidFor", {
                            amount,
                            unit: value.staysValidFor?.unit || "bars"
                          });
                        } else {
                          handleWebhookChange("staysValidFor", undefined);
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="∞"
                    />
                    <select
                      value={value.staysValidFor?.unit || "bars"}
                      onChange={(e) => {
                        if (value.staysValidFor) {
                          handleWebhookChange("staysValidFor", {
                            ...value.staysValidFor,
                            unit: e.target.value as "bars" | "minutes"
                          });
                        }
                      }}
                      className="px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="bars">bars</option>
                      <option value="minutes">min</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Natural Language Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <label className="block text-xs font-medium text-blue-800 mb-1">Preview</label>
        <NaturalSentenceV2 condition={value} className="text-sm text-blue-700" />
      </div>
    </div>
  );
}
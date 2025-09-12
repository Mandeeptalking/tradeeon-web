import React from 'react';
import { ChevronDown } from 'lucide-react';
import { IndicatorCondition, Timeframe, Operator } from '../../types/strategy';
import { INDICATORS, IndicatorConfig } from '../../config/indicatorConfigs';
import { TIMEFRAMES } from '../../config/timeframePresets';
import { OPERATOR_LABELS } from '../../config/operatorConfigs';
import CompareWithPicker from './CompareWithPicker';
import NaturalSentence from './NaturalSentence';
import { validateIndicatorCondition } from '../../lib/strategyDraft';

interface ConditionBuilderProps {
  value: IndicatorCondition;
  onChange: (condition: IndicatorCondition) => void;
  className?: string;
}

export default function ConditionBuilder({ value, onChange, className = "" }: ConditionBuilderProps) {
  const selectedIndicator = INDICATORS.find(ind => ind.id === value.left.name);
  const validationErrors = validateIndicatorCondition(value);

  const handleIndicatorChange = (indicatorId: string) => {
    const indicator = INDICATORS.find(ind => ind.id === indicatorId);
    if (!indicator) return;

    const newCondition: IndicatorCondition = {
      ...value,
      left: {
        name: indicatorId,
        component: indicator.defaultComponent,
        settings: Object.fromEntries(
          Object.entries(indicator.settings).map(([key, config]) => [key, config.default])
        )
      },
      op: indicator.allowedOps[0] as Operator,
      right: indicator.compareMode === "selfOnly" && indicator.selfComparableComponents?.[0]
        ? {
            type: "indicator",
            indicator: {
              name: indicatorId,
              component: indicator.selfComparableComponents[0],
              settings: Object.fromEntries(
                Object.entries(indicator.settings).map(([key, config]) => [key, config.default])
              )
            }
          }
        : { type: "value", value: 0 }
    };

    onChange(newCondition);
  };

  const handleComponentChange = (component: string) => {
    onChange({
      ...value,
      left: { ...value.left, component }
    });
  };

  const handleTimeframeChange = (timeframe: Timeframe) => {
    onChange({ ...value, timeframe });
  };

  const handleOperatorChange = (op: Operator) => {
    onChange({ ...value, op });
  };

  const handleSettingChange = (settingKey: string, settingValue: any) => {
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
  };

  const handleCompareWithChange = (compareWith: any) => {
    onChange({ ...value, right: compareWith });
  };

  const allowedOperators = selectedIndicator?.allowedOps || [];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Indicator Selection Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Indicator</label>
          <div className="relative">
            <select
              value={value.left.name}
              onChange={(e) => handleIndicatorChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              {INDICATORS.map(indicator => (
                <option key={indicator.id} value={indicator.id}>
                  {indicator.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Timeframe</label>
          <div className="relative">
            <select
              value={value.timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value as Timeframe)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              {TIMEFRAMES.map(tf => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Component Selection (if multiple components) */}
      {selectedIndicator && selectedIndicator.components.length > 1 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Component</label>
          <div className="flex flex-wrap gap-2">
            {selectedIndicator.components.map(component => (
              <button
                key={component.id}
                onClick={() => handleComponentChange(component.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors border ${
                  (value.left.component || selectedIndicator.defaultComponent) === component.id
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {component.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      {selectedIndicator && Object.keys(selectedIndicator.settings).length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Settings</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(selectedIndicator.settings).map(([key, config]) => (
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
            onChange={(e) => handleOperatorChange(e.target.value as Operator)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
          >
            {allowedOperators.map(op => (
              <option key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Compare With */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Compare With</label>
        <CompareWithPicker
          value={value.right}
          onChange={handleCompareWithChange}
          leftIndicatorName={value.left.name}
          parentTimeframe={value.timeframe}
        />
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-xs font-medium text-red-800 mb-1">Validation Issues:</div>
          <ul className="text-xs text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Natural Language Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <label className="block text-xs font-medium text-blue-800 mb-1">Preview</label>
        <NaturalSentence condition={value} className="text-sm text-blue-700" />
      </div>
    </div>
  );
}
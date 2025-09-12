import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CompareWith, IndicatorRef, Timeframe } from '../../types/strategy';
import { INDICATORS, IndicatorConfig } from '../../config/indicatorConfigs';
import { TIMEFRAMES } from '../../config/timeframePresets';

interface CompareWithPickerProps {
  value: CompareWith;
  onChange: (compareWith: CompareWith) => void;
  leftIndicatorName: string;
  parentTimeframe: Timeframe;
  className?: string;
}

export default function CompareWithPicker({ 
  value, 
  onChange, 
  leftIndicatorName,
  parentTimeframe, 
  className = "" 
}: CompareWithPickerProps) {
  // Get indicator config to determine comparison rules
  const cfg = INDICATORS.find(i => i.id === leftIndicatorName);
  const compareMode = cfg?.compareMode ?? "valueOnly";
  
  const canCompareValue = compareMode === "valueOnly" || compareMode === "valueOrSelf";
  const canCompareSelf = compareMode === "selfOnly" || compareMode === "valueOrSelf";

  const handleTypeChange = (type: "value" | "indicator") => {
    if (type === "value" && canCompareValue) {
      onChange({ type: "value", value: 0 });
    } else if (type === "indicator" && canCompareSelf) {
      onChange({
        type: "indicator",
        indicator: {
          name: leftIndicatorName, // Lock to same indicator family
          component: cfg?.selfComparableComponents?.[0] || "line",
          settings: cfg?.settings ? Object.fromEntries(
            Object.entries(cfg.settings).map(([key, config]) => [key, config.default])
          ) : {}
        }
      });
    }
  };

  const handleValueChange = (newValue: number) => {
    if (value.type === "value") {
      onChange({ ...value, value: newValue });
    }
  };

  const handleIndicatorChange = (field: keyof IndicatorRef, newValue: any) => {
    if (value.type === "indicator") {
      const updated = { ...value.indicator, [field]: newValue };
      
      // For self-comparison, name is always locked to leftIndicatorName
      updated.name = leftIndicatorName;
      
      onChange({ ...value, indicator: updated });
    }
  };

  const handleSettingChange = (settingKey: string, settingValue: any) => {
    if (value.type === "indicator") {
      onChange({
        ...value,
        indicator: {
          ...value.indicator,
          name: leftIndicatorName, // Ensure name stays locked
          settings: {
            ...value.indicator.settings,
            [settingKey]: settingValue
          }
        }
      });
    }
  };

  // Build available tabs based on compare mode
  const availableTabs = [
    ...(canCompareValue ? [{ id: "value", label: "Value" }] : []),
    ...(canCompareSelf ? [{ id: "indicator", label: `${leftIndicatorName} Component` }] : [])
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Type Toggle */}
      {availableTabs.length > 1 && (
        <div className="flex bg-gray-100 rounded-lg p-1">
          {availableTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTypeChange(tab.id as "value" | "indicator")}
              className={`flex-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                value.type === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Value Input */}
      {value.type === "value" && canCompareValue && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
          <input
            type="number"
            step="0.01"
            value={value.value}
            onChange={(e) => handleValueChange(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter value..."
          />
        </div>
      )}

      {/* Indicator Configuration */}
      {value.type === "indicator" && canCompareSelf && (
        <div className="space-y-3">
          {/* Indicator Selection - Locked to same family */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Indicator</label>
            <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              <span className="text-sm text-gray-700">{cfg?.label || leftIndicatorName}</span>
              <span className="text-xs text-gray-500 ml-2">(locked to same indicator)</span>
            </div>
          </div>

          {/* Component Selection */}
          {cfg && cfg.selfComparableComponents && cfg.selfComparableComponents.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Component</label>
              <div className="relative">
                <select
                  value={value.indicator.component || cfg.selfComparableComponents[0]}
                  onChange={(e) => handleIndicatorChange("component", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  {cfg.selfComparableComponents.map(componentId => {
                    const component = cfg.components.find(c => c.id === componentId);
                    return (
                      <option key={componentId} value={componentId}>
                        {component?.label || componentId}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Settings */}
          {cfg && Object.keys(cfg.settings).length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">Settings</label>
              {Object.entries(cfg.settings).map(([key, config]) => (
                <div key={key}>
                  <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
                  <input
                    type="number"
                    min={config.min}
                    max={config.max}
                    value={value.indicator.settings?.[key] || config.default}
                    onChange={(e) => handleSettingChange(key, Number(e.target.value) || config.default)}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Show restriction message if no tabs available */}
      {availableTabs.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            {cfg?.label || leftIndicatorName} has restricted comparison options.
          </p>
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CompareWith, IndicatorRef, Timeframe, TargetV2 } from '../../types/entry';
import { IndicatorDef, Target } from '../../types/indicators';
import { getValidTargets, getTargetLabel } from '../../features/createBot/hooks/useIndicatorDefs';

interface CompareWithPickerV2Props {
  value: CompareWith;
  onChange: (compareWith: CompareWith) => void;
  leftIndicatorName: string;
  parentTimeframe: Timeframe;
  definition?: IndicatorDef | null;
  subject?: any; // SubjectV2 from parent
  target?: TargetV2; // Current target from parent
  className?: string;
}

export default function CompareWithPickerV2({ 
  value, 
  onChange, 
  leftIndicatorName,
  parentTimeframe,
  definition,
  subject,
  target,
  className = "" 
}: CompareWithPickerV2Props) {
  // If we have definition and subject, get valid targets
  const validTargets = definition && subject ? getValidTargets(definition, subject) : [];

  const handleTypeChange = (type: "value" | "indicator") => {
    if (type === "value") {
      onChange({ type: "value", value: 0 });
    } else if (type === "indicator" && validTargets.length > 0) {
      // Find first component target
      const componentTarget = validTargets.find(t => t.target.kind === "component");
      if (componentTarget) {
        onChange({
          type: "indicator",
          indicator: {
            component: componentTarget.target.component!,
            settings: {}
          }
        });
      }
    }
  };

  const handleValueChange = (newValue: number) => {
    if (value.type === "value") {
      onChange({ ...value, value: newValue });
    }
  };

  const handleComponentChange = (component: string) => {
    if (value.type === "indicator") {
      onChange({
        ...value,
        indicator: {
          ...value.indicator,
          component
        }
      });
    }
  };

  // Determine available tabs based on valid targets
  const hasValueTargets = validTargets.some(t => t.target.kind === "value");
  const hasComponentTargets = validTargets.some(t => t.target.kind === "component");
  const hasZeroTargets = validTargets.some(t => t.target.kind === "zero");

  const availableTabs = [
    ...(hasValueTargets ? [{ id: "value", label: "Value" }] : []),
    ...(hasComponentTargets ? [{ id: "indicator", label: "Component" }] : [])
  ];

  // If only zero targets available, show read-only zero
  if (!hasValueTargets && !hasComponentTargets) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
          <span className="text-sm text-gray-700">No valid targets</span>
        </div>
      </div>
    );
  }

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
      {value.type === "value" && hasValueTargets && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
          <input
            type="number"
            step={target?.kind === "value" ? target.step || 0.01 : 0.01}
            min={target?.kind === "value" ? target.min : undefined}
            max={target?.kind === "value" ? target.max : undefined}
            value={value.value}
            onChange={(e) => handleValueChange(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter value..."
          />
          {target?.kind === "value" && (target.min !== undefined || target.max !== undefined) && (
            <div className="text-xs text-gray-500 mt-1">
              Range: {target.min || 0} - {target.max || 100}
            </div>
          )}
        </div>
      )}

      {/* Component Selection */}
      {value.type === "indicator" && hasComponentTargets && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Component</label>
          <div className="flex flex-wrap gap-2">
            {validTargets
              .filter(t => t.target.kind === "component")
              .map((targetEntry, index) => (
                <button
                  key={index}
                  onClick={() => handleComponentChange(targetEntry.target.component!)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors border ${
                    value.indicator.component === targetEntry.target.component
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {getTargetLabel(targetEntry.target, leftIndicatorName)}
                </button>
              ))}
          </div>
        </div>
      )}
      
      {/* Show restriction message if no valid targets */}
      {validTargets.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            No valid targets available for this indicator configuration.
          </p>
        </div>
      )}
    </div>
  );
}
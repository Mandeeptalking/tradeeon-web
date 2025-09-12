import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Condition, IndicatorCondition, WebhookCondition } from '../../types/strategy';
import ConditionBuilder from './ConditionBuilder';
import WebhookRuleCard from './WebhookRuleCard';
import { generateConditionId } from '../../lib/strategyDraft';

interface ConditionRowProps {
  value: Condition;
  onChange: (condition: Condition) => void;
  onRemove: () => void;
  className?: string;
}

export default function ConditionRow({ 
  value, 
  onChange, 
  onRemove, 
  className = "" 
}: ConditionRowProps) {
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
        op: ">",
        right: { type: "value", value: 30 }
      };
      onChange(newCondition);
    } else if (type === "webhook" && value.kind === "indicator") {
      const newCondition: WebhookCondition = {
        id: value.id,
        kind: "webhook",
        match: { key: "signal", equals: "BUY" }
      };
      onChange(newCondition);
    }
  };

  return (
    <div className={`group relative ${className}`}>
      {/* Drag Handle */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        {/* Header with Type Toggle and Remove */}
        <div className="flex items-center justify-between mb-4">
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

          <button
            onClick={onRemove}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Condition Content */}
        {value.kind === "indicator" ? (
          <ConditionBuilder
            value={value}
            onChange={onChange as (condition: IndicatorCondition) => void}
          />
        ) : (
          <WebhookRuleCard
            value={value}
            onChange={onChange as (condition: WebhookCondition) => void}
          />
        )}
      </div>
    </div>
  );
}
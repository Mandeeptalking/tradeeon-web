import React from 'react';
import { Zap, X } from 'lucide-react';
import { Condition, IndicatorCondition, WebhookCondition } from '../../types/strategy';
import ConditionBuilder from './ConditionBuilder';
import WebhookRuleCard from './WebhookRuleCard';

interface TriggerConditionCardProps {
  value?: Condition;
  onChange: (condition: Condition | undefined) => void;
  className?: string;
}

export default function TriggerConditionCard({ 
  value, 
  onChange, 
  className = "" 
}: TriggerConditionCardProps) {
  const handleAdd = (type: "indicator" | "webhook") => {
    if (type === "indicator") {
      const newCondition: IndicatorCondition = {
        id: `trigger-${Date.now()}`,
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
      onChange(newCondition);
    } else {
      const newCondition: WebhookCondition = {
        id: `trigger-${Date.now()}`,
        kind: "webhook",
        match: { key: "confirm", equals: "true" }
      };
      onChange(newCondition);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  const handleTypeChange = (type: "indicator" | "webhook") => {
    if (!value) return;
    
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
        right: { type: "value", value: 50 }
      };
      onChange(newCondition);
    } else if (type === "webhook" && value.kind === "indicator") {
      const newCondition: WebhookCondition = {
        id: value.id,
        kind: "webhook",
        match: { key: "confirm", equals: "true" }
      };
      onChange(newCondition);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-yellow-600 rounded-md flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Trigger Condition</h3>
            <p className="text-xs text-gray-600">Optional final confirmation before entry</p>
          </div>
        </div>
        {value && (
          <button
            onClick={handleRemove}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!value ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-3">⚡</div>
          <p className="text-gray-600 text-sm mb-4">Add a final trigger condition</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => handleAdd("indicator")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Indicator
            </button>
            <button
              onClick={() => handleAdd("webhook")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Webhook
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4 w-fit">
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
      )}
    </div>
  );
}
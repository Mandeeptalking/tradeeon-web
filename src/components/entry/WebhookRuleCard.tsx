import React from 'react';
import { Webhook, Trash2 } from 'lucide-react';
import { WebhookCondition } from '../../types/strategy';
import NaturalSentence from './NaturalSentence';

interface WebhookRuleCardProps {
  value: WebhookCondition;
  onChange: (condition: WebhookCondition) => void;
  onRemove?: () => void;
  className?: string;
}

export default function WebhookRuleCard({ 
  value, 
  onChange, 
  onRemove, 
  className = "" 
}: WebhookRuleCardProps) {
  const handleKeyChange = (key: string) => {
    onChange({
      ...value,
      match: { ...value.match, key }
    });
  };

  const handleValueChange = (equals: string | number | boolean) => {
    onChange({
      ...value,
      match: { ...value.match, equals }
    });
  };

  const handleCooldownChange = (cooldownBars: number) => {
    onChange({
      ...value,
      cooldownBars: cooldownBars > 0 ? cooldownBars : undefined
    });
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
            <Webhook className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-900">Webhook Condition</span>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Key Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Key</label>
          <input
            type="text"
            value={value.match.key}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="signal"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Value Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Equals</label>
          <input
            type="text"
            value={String(value.match.equals)}
            onChange={(e) => {
              const val = e.target.value;
              // Try to parse as number or boolean, otherwise keep as string
              if (val === 'true') handleValueChange(true);
              else if (val === 'false') handleValueChange(false);
              else if (!isNaN(Number(val)) && val !== '') handleValueChange(Number(val));
              else handleValueChange(val);
            }}
            placeholder="BUY"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Cooldown (Optional) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Cooldown Bars (Optional)</label>
          <input
            type="number"
            min="0"
            value={value.cooldownBars || ''}
            onChange={(e) => handleCooldownChange(Number(e.target.value) || 0)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Natural Language Preview */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <label className="block text-xs font-medium text-purple-800 mb-1">Preview</label>
          <NaturalSentence condition={value} className="text-sm text-purple-700" />
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { ConditionGroup, Condition, IndicatorCondition } from '../../types/entry';
import GroupLogicToggleV2 from './GroupLogicToggleV2';
import ConditionBuilderV2 from './ConditionBuilderV2';

interface ConditionGroupBuilderProps {
  value: ConditionGroup;
  onChange: (group: ConditionGroup) => void;
  onRemove?: () => void;
  groupName: string;
  maxConditions?: number;
  className?: string;
}

export default function ConditionGroupBuilder({ 
  value, 
  onChange, 
  onRemove,
  groupName,
  maxConditions = 10,
  className = "" 
}: ConditionGroupBuilderProps) {
  const handleLogicChange = (logic: "AND" | "OR") => {
    onChange({ ...value, logic });
  };

  const handleAddCondition = () => {
    if (value.conditions.length >= maxConditions) return;

    const newCondition: IndicatorCondition = {
      id: `condition-${Date.now()}`,
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

    onChange({
      ...value,
      conditions: [...value.conditions, newCondition]
    });
  };

  const handleConditionChange = (index: number, condition: Condition) => {
    const newConditions = [...value.conditions];
    newConditions[index] = condition;
    onChange({ ...value, conditions: newConditions });
  };

  const handleRemoveCondition = (index: number) => {
    const newConditions = value.conditions.filter((_, i) => i !== index);
    onChange({ ...value, conditions: newConditions });
  };

  const canAddMore = value.conditions.length < maxConditions;

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
            <span className="text-sm font-medium text-gray-700">{groupName}</span>
            <span className="text-xs text-gray-500">({value.conditions.length} conditions)</span>
          </div>
          
          <GroupLogicToggleV2
            value={value.logic}
            onChange={handleLogicChange}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddCondition}
            disabled={!canAddMore}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              canAddMore
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
          
          {onRemove && (
            <button
              onClick={onRemove}
              className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-xs transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Conditions */}
      {value.conditions.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-gray-500 text-sm mb-3">No conditions in this group</p>
          <button
            onClick={handleAddCondition}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
          >
            Add First Condition
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {value.conditions.map((condition, index) => (
            <div key={condition.id} className="relative group">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
              </div>
              
              <ConditionBuilderV2
                value={condition}
                onChange={(updatedCondition) => handleConditionChange(index, updatedCondition)}
                onRemove={() => handleRemoveCondition(index)}
                showRemove={value.conditions.length > 1}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add More Button */}
      {value.conditions.length > 0 && canAddMore && (
        <div className="mt-3 text-center">
          <button
            onClick={handleAddCondition}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors mx-auto"
          >
            <Plus className="w-3 h-3" />
            <span>Add Another Condition</span>
          </button>
        </div>
      )}

      {/* Limit Warning */}
      {!canAddMore && (
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <p className="text-xs text-yellow-800 text-center">
            Maximum {maxConditions} conditions reached
          </p>
        </div>
      )}
    </div>
  );
}
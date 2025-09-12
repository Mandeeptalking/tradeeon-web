import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown, Clock, Hash, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Condition, IndicatorCondition, Timeframe, Operator, SubjectV2, TargetV2 } from '../../types/entry';
import { ConditionPayload, ValidationResult, SentenceResult } from '../../types/indicators';
import { TIMEFRAMES } from '../../config/timeframePresets';
import { OPERATOR_LABELS } from '../../config/operatorConfigs';
import { useIndicatorList, useIndicatorDef, getValidSubjects, getValidTargets, getValidOperators, getSubjectLabel, getTargetLabel, getDefaultsFromDefinition } from '../../features/createBot/hooks/useIndicatorDefs';
import { validateCondition, getSentence } from '../../api/indicators';
import { validateIndicatorCondition } from '../../lib/entryDraft';

interface ConditionBuilderV2Props {
  value: Condition;
  onChange: (condition: Condition) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  className?: string;
}

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ConditionBuilderV2({ 
  value, 
  onChange, 
  onRemove,
  showRemove = true,
  className = "" 
}: ConditionBuilderV2Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [backendValidation, setBackendValidation] = useState<ValidationResult | null>(null);
  const [backendSentence, setBackendSentence] = useState<SentenceResult | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [sentenceLoading, setSentenceLoading] = useState(false);
  
  const { indicators, isOffline: indicatorsOffline } = useIndicatorList();
  const { definition, loading: defLoading, isOffline: defOffline } = useIndicatorDef(value.left.name);
  
  const isOffline = indicatorsOffline || defOffline;

  // Create condition payload for backend calls
  const createConditionPayload = (): ConditionPayload | null => {
    if (!value.subject || !value.target) return null;
    
    return {
      indicatorId: value.left.name,
      timeframe: value.timeframe,
      settings: value.left.settings,
      subject: value.subject,
      target: value.target,
      operator: value.op,
      value: value.right.type === 'value' ? value.right.value : undefined,
      priceSource: value.priceSource
    };
  };

  // Debounced payload for backend calls
  const debouncedPayload = useDebounce(createConditionPayload(), 300);

  // Backend validation
  useEffect(() => {
    if (!debouncedPayload || isOffline || defLoading) {
      setBackendValidation(null);
      return;
    }

    const validate = async () => {
      try {
        setValidationLoading(true);
        const result = await validateCondition(debouncedPayload);
        setBackendValidation(result);
      } catch (error) {
        console.error('Backend validation failed:', error);
        setBackendValidation(null);
      } finally {
        setValidationLoading(false);
      }
    };

    validate();
  }, [debouncedPayload, isOffline, defLoading]);

  // Backend sentence generation
  useEffect(() => {
    if (!debouncedPayload || isOffline || defLoading) {
      setBackendSentence(null);
      return;
    }

    const generateSentence = async () => {
      try {
        setSentenceLoading(true);
        const result = await getSentence(debouncedPayload);
        setBackendSentence(result);
      } catch (error) {
        console.error('Backend sentence generation failed:', error);
        setBackendSentence(null);
      } finally {
        setSentenceLoading(false);
      }
    };

    generateSentence();
  }, [debouncedPayload, isOffline, defLoading]);

  // Force migration on mount and when indicator changes
  useEffect(() => {
    if (!definition) return;
    
    // Check if migration is needed
    if (!value.subject || !value.target) {
      migrateCondition();
    } else {
      // Validate current subject/target against definition
      const validSubjects = getValidSubjects(definition);
      const isValidSubject = validSubjects.some(s => 
        s.kind === value.subject?.kind &&
        (s.kind !== "indicator" || s.component === value.subject.component) &&
        (s.kind !== "derived" || s.id === value.subject.id)
      );
      
      if (!isValidSubject) {
        migrateCondition();
      }
    }
  }, [value.left.name, definition]);

  const migrateCondition = () => {
    if (!definition) return;

    const defaults = getDefaultsFromDefinition(definition);
    
    // Try to preserve existing right field data
    let migratedTarget = defaults.target;
    let migratedOperator = defaults.operator;
    let migratedRight = value.right;

    // Map existing right field to semantics
    if (value.right) {
      if (value.right.type === "value") {
        // Find a value target in the pairings
        const valueTargetEntry = getValidTargets(definition, defaults.subject).find(t => t.target.kind === "value");
        if (valueTargetEntry) {
          migratedTarget = valueTargetEntry.target;
          migratedRight = value.right;
        }
      } else if (value.right.type === "indicator" && value.right.indicator.component) {
        // Find a component target that matches
        const componentTargetEntry = getValidTargets(definition, defaults.subject).find(t => 
          t.target.kind === "component" && t.target.component === value.right.indicator.component
        );
        if (componentTargetEntry) {
          migratedTarget = componentTargetEntry.target;
        }
      }
    }

    // Ensure operator is valid for the target
    const validOps = getValidOperators(definition, defaults.subject, migratedTarget);
    if (validOps.length > 0 && !validOps.includes(migratedOperator)) {
      migratedOperator = validOps[0];
    }

    const updatedCondition = {
      ...value,
      subject: defaults.subject,
      target: migratedTarget,
      op: migratedOperator,
      right: migratedRight,
      priceSource: defaults.priceSource
    };

    onChange(updatedCondition);
  };

  const handleIndicatorChange = (indicatorId: string) => {
    const indicator = indicators.find(ind => ind.id === indicatorId);
    if (!indicator) return;

    // Will trigger useEffect to load definition and migrate
    const newCondition: IndicatorCondition = {
      ...value,
      left: {
        name: indicatorId,
        component: "line", // Will be updated by migration
        settings: {} // Will be updated by migration
      }
    };

    onChange(newCondition);
  };

  const handleSubjectChange = (newSubject: SubjectV2) => {
    if (!definition) return;

    // Find valid targets for this subject
    const validTargets = getValidTargets(definition, newSubject);
    if (validTargets.length === 0) return;

    const defaultTargetEntry = validTargets[0];
    const defaultTarget = defaultTargetEntry.target;
    const defaultOperator = defaultTargetEntry.operators[0];

    // Update price source if subject is price
    let priceSource = value.priceSource;
    if (newSubject.kind === "price") {
      priceSource = newSubject.source || "close";
    }

    // Create backward-compatible right field
    let rightField: any;
    if (defaultTarget.kind === "value") {
      rightField = { type: "value", value: value.right.type === "value" ? value.right.value : 0 };
    } else if (defaultTarget.kind === "component") {
      rightField = {
        type: "indicator",
        indicator: {
          component: defaultTarget.component,
          settings: value.left.settings || {}
        }
      };
    } else if (defaultTarget.kind === "zero") {
      rightField = { type: "value", value: 0 };
    }

    onChange({
      ...value,
      subject: newSubject,
      target: defaultTarget,
      op: defaultOperator,
      right: rightField,
      priceSource
    });
  };

  const handleTargetChange = (newTarget: TargetV2) => {
    if (!definition || !value.subject) return;

    const validOperators = getValidOperators(definition, value.subject, newTarget);
    const defaultOperator = validOperators[0] || value.op;

    // Create backward-compatible right field
    let rightField: any;
    if (newTarget.kind === "value") {
      rightField = { type: "value", value: value.right.type === "value" ? value.right.value : 0 };
    } else if (newTarget.kind === "component") {
      rightField = {
        type: "indicator",
        indicator: {
          component: newTarget.component,
          settings: value.left.settings || {}
        }
      };
    } else if (newTarget.kind === "zero") {
      rightField = { type: "value", value: 0 };
    }

    onChange({
      ...value,
      target: newTarget,
      op: defaultOperator,
      right: rightField
    });
  };

  const handleOperatorChange = (op: Operator) => {
    onChange({ ...value, op });
  };

  const handlePriceSourceChange = (source: string) => {
    if (!value.subject || value.subject.kind !== "price") return;

    const updatedSubject = { ...value.subject, source: source as any };
    onChange({
      ...value,
      subject: updatedSubject,
      priceSource: source
    });
  };

  const handleValueChange = (newValue: number) => {
    if (value.target?.kind === "value") {
      const rightField = { type: "value", value: newValue };
      onChange({ ...value, right: rightField });
    }
  };

  const handleTimeframeChange = (timeframe: Timeframe) => {
    onChange({ ...value, timeframe });
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

  const handleSequenceChange = (sequence: number) => {
    onChange({ ...value, sequence: sequence > 0 ? sequence : undefined });
  };

  const handleMustOccurWithinChange = (mustOccurWithin: { amount: number; unit: "bars" | "minutes" } | undefined) => {
    onChange({ ...value, mustOccurWithin });
  };

  const handleStaysValidForChange = (staysValidFor: { amount: number; unit: "bars" | "minutes" } | undefined) => {
    onChange({ ...value, staysValidFor });
  };

  // Get current valid options based on definition
  const validSubjects = definition ? getValidSubjects(definition) : [];
  const validTargets = definition && value.subject ? getValidTargets(definition, value.subject) : [];
  
  // Get valid operators with robust fallback
  const validOperators = (() => {
    if (definition && value.subject && value.target) {
      const ops = getValidOperators(definition, value.subject, value.target);
      if (ops.length > 0) return ops;
    }
    
    // Fallback: use basic operators for the indicator
    const fallbackOps: Record<string, Operator[]> = {
      MACD: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="],
      RSI: [">", "<", ">=", "<=", "=", "!=", "crossesAbove", "crossesBelow"],
      EMA: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="],
      BBANDS: ["crossesAbove", "crossesBelow", ">", "<"],
      ADX: [">", "<", ">=", "<=", "=", "!="],
      DI: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="],
      VWAP: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="]
    };
    
    return fallbackOps[value.left.name] || [">", "<", ">=", "<=", "crossesAbove", "crossesBelow"];
  })();

  // Local validation (fallback when backend is offline)
  const localValidationErrors = validateIndicatorCondition(value);

  // Combined validation errors
  const allValidationErrors = [
    ...(backendValidation?.errors || []),
    ...(isOffline ? localValidationErrors : [])
  ];

  if (defLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!definition) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">Failed to load indicator definition</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Offline Banner */}
      {isOffline && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Backend offline - using cached definitions
            </span>
          </div>
        </div>
      )}

      {/* Header with Remove Button */}
      {showRemove && onRemove && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onRemove}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Indicator and Timeframe Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Indicator</label>
            <div className="relative">
              <select
                value={value.left.name}
                onChange={(e) => handleIndicatorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                {indicators.map(indicator => (
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

        {/* Subject Selection */}
        {validSubjects.length > 1 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
            <div className="flex flex-wrap gap-2">
              {validSubjects.map((subject, index) => (
                <button
                  key={index}
                  onClick={() => handleSubjectChange(subject)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors border ${
                    value.subject && 
                    value.subject.kind === subject.kind && 
                    (subject.kind !== "indicator" || value.subject.component === subject.component) &&
                    (subject.kind !== "derived" || value.subject.id === subject.id)
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {getSubjectLabel(subject)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Source Selection (only for price subjects) */}
        {value.subject?.kind === "price" && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Price Source</label>
            <div className="flex flex-wrap gap-2">
              {["close", "open", "high", "low", "hl2", "hlc3", "ohlc4"].map((source) => (
                <button
                  key={source}
                  onClick={() => handlePriceSourceChange(source)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors border ${
                    (value.priceSource || "close") === source
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {source.toUpperCase()}
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
              onChange={(e) => handleOperatorChange(e.target.value as Operator)}
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

        {/* Target Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
          
          {validTargets.length > 1 ? (
            <div className="flex flex-wrap gap-2 mb-2">
              {validTargets.map((targetEntry, index) => (
                <button
                  key={index}
                  onClick={() => handleTargetChange(targetEntry.target)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors border ${
                    value.target && 
                    value.target.kind === targetEntry.target.kind &&
                    (targetEntry.target.kind !== "component" || value.target.component === targetEntry.target.component)
                      ? 'bg-purple-50 border-purple-200 text-purple-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {getTargetLabel(targetEntry.target, value.left.name)}
                </button>
              ))}
            </div>
          ) : null}

          {/* Target Value Input (only for value targets) */}
          {value.target?.kind === "value" && (
            <div className="relative">
              <input
                type="number"
                step={value.target.step || 0.01}
                min={value.target.min}
                max={value.target.max}
                value={value.right.type === "value" ? value.right.value : 0}
                onChange={(e) => handleValueChange(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter value..."
              />
              {(value.target.min !== undefined || value.target.max !== undefined) && (
                <div className="text-xs text-gray-500 mt-1">
                  Range: {value.target.min || 0} - {value.target.max || 100}
                </div>
              )}
            </div>
          )}

          {/* Target Component Display (for component/zero targets) */}
          {value.target?.kind === "component" && (
            <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              <span className="text-sm text-gray-700">
                {value.target.component === "zero" ? "Zero line" : value.target.component?.toUpperCase()}
              </span>
            </div>
          )}

          {/* No valid targets warning */}
          {validTargets.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                No valid targets available for this indicator configuration.
              </p>
            </div>
          )}
        </div>

        {/* UI Hint */}
        {definition && value.subject && (
          (() => {
            const pairing = definition.pairings.find(p => 
              p.subject.kind === value.subject?.kind &&
              (value.subject?.kind !== "indicator" || p.subject.component === value.subject.component) &&
              (value.subject?.kind !== "derived" || p.subject.id === value.subject.id)
            );
            
            if (pairing?.ui?.hint) {
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs text-blue-700">{pairing.ui.hint}</p>
                </div>
              );
            }
            return null;
          })()
        )}

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
                  onChange={(e) => handleSequenceChange(Number(e.target.value) || 0)}
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
                        handleMustOccurWithinChange({
                          amount,
                          unit: value.mustOccurWithin?.unit || "bars"
                        });
                      } else {
                        handleMustOccurWithinChange(undefined);
                      }
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="∞"
                  />
                  <select
                    value={value.mustOccurWithin?.unit || "bars"}
                    onChange={(e) => {
                      if (value.mustOccurWithin) {
                        handleMustOccurWithinChange({
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
                        handleStaysValidForChange({
                          amount,
                          unit: value.staysValidFor?.unit || "bars"
                        });
                      } else {
                        handleStaysValidForChange(undefined);
                      }
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="∞"
                  />
                  <select
                    value={value.staysValidFor?.unit || "bars"}
                    onChange={(e) => {
                      if (value.staysValidFor) {
                        handleStaysValidForChange({
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

        {/* Validation Errors */}
        {allValidationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-800">
                {validationLoading ? 'Validating...' : 'Validation Issues:'}
              </span>
            </div>
            <ul className="text-xs text-red-700 space-y-1">
              {allValidationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Natural Language Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            {isOffline ? (
              <WifiOff className="w-4 h-4 text-blue-600" />
            ) : (
              <Wifi className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-xs font-medium text-blue-800">
              {sentenceLoading ? 'Generating...' : 'Preview'}
            </span>
            {isOffline && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                Offline
              </span>
            )}
          </div>
          
          <div className="text-sm text-blue-700">
            {sentenceLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Generating natural language...</span>
              </div>
            ) : backendSentence ? (
              backendSentence.text
            ) : isOffline ? (
              // Fallback to local sentence generation when offline
              `${value.left.name}${value.left.settings?.length ? `(${value.left.settings.length})` : ''} on ${value.timeframe} ${OPERATOR_LABELS[value.op as keyof typeof OPERATOR_LABELS] || value.op} ${
                value.right.type === 'value' ? value.right.value : 
                value.right.type === 'indicator' ? `${value.left.name} ${value.right.indicator.component}` : 
                'target'
              }`
            ) : (
              'Unable to generate preview'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
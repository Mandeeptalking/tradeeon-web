import React, { useState, useEffect } from 'react';
import { ChevronDown, Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { IndicatorCondition, Timeframe, Operator } from '../../types/entry';
import { ConditionPayload, ValidationResult, SentenceResult, Subject, Target } from '../../types/indicators';
import { TIMEFRAMES, getTimeframeColor } from '../../config/timeframePresets';
import { useIndicatorDef, getValidSubjects, getValidTargets, getValidOperators, getSubjectLabel, getTargetLabel } from '../../features/createBot/hooks/useIndicatorDefs';
import { validateCondition, getSentence } from '../../api/indicators';
import MACDIllustration from './MACDIllustration';

interface SentenceComposerProps {
  value: IndicatorCondition;
  onChange: (condition: IndicatorCondition) => void;
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

const SentenceComposer: React.FC<SentenceComposerProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [backendValidation, setBackendValidation] = useState<ValidationResult | null>(null);
  const [backendSentence, setBackendSentence] = useState<SentenceResult | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [sentenceLoading, setSentenceLoading] = useState(false);
  
  const { definition, loading: defLoading, isOffline } = useIndicatorDef(value.left.name);

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
    if (!debouncedPayload || isOffline) {
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
  }, [debouncedPayload, isOffline]);

  // Backend sentence generation
  useEffect(() => {
    if (!debouncedPayload || isOffline) {
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
  }, [debouncedPayload, isOffline]);

  // Get current valid options based on definition
  const validSubjects = definition ? getValidSubjects(definition) : [];
  const validTargets = definition && value.subject ? getValidTargets(definition, value.subject) : [];
  const validOperators = definition && value.subject && value.target ? getValidOperators(definition, value.subject, value.target) : [];

  // Handle changes
  const handleSubjectChange = (newSubject: Subject) => {
    if (!definition) return;

    const targets = getValidTargets(definition, newSubject);
    if (targets.length === 0) return;

    const defaultTargetEntry = targets[0];
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

  const handleTargetChange = (newTarget: Target) => {
    if (!definition || !value.subject) return;

    const validOps = getValidOperators(definition, value.subject, newTarget);
    const defaultOperator = validOps[0] || value.op;

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

  const handleTimeframeChange = (timeframe: Timeframe) => {
    onChange({ ...value, timeframe });
  };

  const handleValueChange = (newValue: number) => {
    if (value.target?.kind === "value") {
      const rightField = { type: "value", value: newValue };
      onChange({ ...value, right: rightField });
    }
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

  // Template handlers for MACD
  const handleTemplate = (template: 'bullish_cross' | 'momentum_positive' | 'signal_loss') => {
    if (!definition) return;

    let newSubject: Subject;
    let newTarget: Target;
    let newOperator: Operator;

    switch (template) {
      case 'bullish_cross':
        newSubject = { kind: "indicator", component: "macd" };
        newTarget = { kind: "component", component: "signal" };
        newOperator = "crossesAbove";
        break;
      case 'momentum_positive':
        newSubject = { kind: "indicator", component: "macd" };
        newTarget = { kind: "component", component: "zero" };
        newOperator = "crossesAbove";
        break;
      case 'signal_loss':
        newSubject = { kind: "indicator", component: "histogram" };
        newTarget = { kind: "component", component: "zero" };
        newOperator = "crossesBelow";
        break;
    }

    // Create right field
    const rightField = {
      type: "indicator",
      indicator: {
        component: newTarget.component,
        settings: value.left.settings || {}
      }
    };

    onChange({
      ...value,
      subject: newSubject,
      target: newTarget,
      op: newOperator,
      right: rightField
    });
  };

  // Get friendly labels
  const getOperatorLabel = (op: Operator): string => {
    const labels: Record<Operator, string> = {
      ">": "is above",
      "<": "is below", 
      ">=": "is at or above",
      "<=": "is at or below",
      "=": "equals",
      "!=": "does not equal",
      "crossesAbove": "crosses above",
      "crossesBelow": "crosses below"
    };
    return labels[op] || op;
  };

  const getTargetDisplayLabel = (target: Target): string => {
    if (target.kind === "component") {
      if (target.component === "zero") return "Zero line (0)";
      if (target.component === "signal") return "Signal line";
      if (target.component === "line") return "Line";
      return target.component.charAt(0).toUpperCase() + target.component.slice(1);
    }
    if (target.kind === "value") return "Value";
    return "Unknown";
  };

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
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Templates for MACD */}
      {value.left.name === 'MACD' && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Quick Templates</span>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Templates set the sentence for you; you can tweak anything
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTemplate('bullish_cross')}
              className="px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
            >
              📈 Bullish MACD cross
            </button>
            <button
              onClick={() => handleTemplate('momentum_positive')}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
            >
              ⚡ Momentum turns positive
            </button>
            <button
              onClick={() => handleTemplate('signal_loss')}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
            >
              📉 Signal loss
            </button>
          </div>
        </div>
      )}

      {/* Sentence Builder */}
      <div className="space-y-4">
        <div className="text-lg text-gray-900 leading-relaxed">
          <span className="text-gray-600">When </span>
          
          {/* Subject Chip */}
          <div className="inline-block relative group">
            <button className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-full text-sm font-medium transition-colors">
              <span>{value.subject ? getSubjectLabel(value.subject) : 'Select line'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {/* Subject Dropdown */}
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Which line?</div>
                {validSubjects.map((subject, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubjectChange(subject)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      value.subject && 
                      value.subject.kind === subject.kind && 
                      (subject.kind !== "indicator" || value.subject.component === subject.component) &&
                      (subject.kind !== "derived" || value.subject.id === subject.id)
                        ? 'bg-blue-50 text-blue-800'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {getSubjectLabel(subject)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <span className="mx-2">
            {/* Operator Chip */}
            <div className="inline-block relative group">
              <button className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-full text-sm font-medium transition-colors">
                <span>{getOperatorLabel(value.op)}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Operator Dropdown */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                <div className="p-2">
                  {validOperators.map((op) => (
                    <button
                      key={op}
                      onClick={() => handleOperatorChange(op)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        value.op === op
                          ? 'bg-purple-50 text-purple-800'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {getOperatorLabel(op)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </span>

          {/* Target Chip */}
          <div className="inline-block relative group">
            <button className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-full text-sm font-medium transition-colors">
              <span>
                {value.target ? getTargetDisplayLabel(value.target) : 'Select target'}
                {value.target?.kind === "value" && value.right.type === "value" && (
                  <span className="ml-1 font-mono">({value.right.value})</span>
                )}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {/* Target Dropdown */}
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Compare to</div>
                {validTargets.map((targetEntry, index) => (
                  <button
                    key={index}
                    onClick={() => handleTargetChange(targetEntry.target)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      value.target && 
                      value.target.kind === targetEntry.target.kind &&
                      (targetEntry.target.kind !== "component" || value.target.component === targetEntry.target.component)
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {getTargetDisplayLabel(targetEntry.target)}
                  </button>
                ))}
                
                {/* Value input for value targets */}
                {value.target?.kind === "value" && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <input
                      type="number"
                      step={value.target.step || 0.01}
                      min={value.target.min}
                      max={value.target.max}
                      value={value.right.type === "value" ? value.right.value : 0}
                      onChange={(e) => handleValueChange(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter value..."
                      onClick={(e) => e.stopPropagation()}
                    />
                    {(value.target.min !== undefined || value.target.max !== undefined) && (
                      <div className="text-xs text-gray-500 mt-1">
                        Range: {value.target.min || 0} - {value.target.max || 100}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <span className="mx-2 text-gray-600">on</span>

          {/* Timeframe Chip */}
          <div className="inline-block relative group">
            <button className={`inline-flex items-center space-x-1 px-3 py-1 border rounded-full text-sm font-medium transition-colors ${getTimeframeColor(value.timeframe)}`}>
              <span>{value.timeframe}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {/* Timeframe Dropdown */}
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
              <div className="p-2">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => handleTimeframeChange(tf.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      value.timeframe === tf.value
                        ? 'bg-blue-50 text-blue-800'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <span className="text-gray-600">.</span>
        </div>

        {/* Price Source Selection (only for price subjects) */}
        {value.subject?.kind === "price" && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">Price Source</label>
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

        {/* MACD Illustration */}
        {value.left.name === 'MACD' && value.subject && value.target && (
          <div className="mt-4">
            <MACDIllustration
              subject={value.subject}
              target={value.target}
              operator={value.op}
            />
          </div>
        )}

        {/* Backend Sentence */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
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
            ) : (
              // Fallback sentence
              `${getSubjectLabel(value.subject || { kind: "indicator", component: "line" })} on ${value.timeframe} ${getOperatorLabel(value.op)} ${value.target ? getTargetDisplayLabel(value.target) : 'target'}`
            )}
          </div>
        </div>

        {/* Validation Errors */}
        {(backendValidation && !backendValidation.ok) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-800">
                {validationLoading ? 'Validating...' : 'Validation Issues:'}
              </span>
            </div>
            <ul className="text-xs text-red-700 space-y-1">
              {backendValidation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

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
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-700">{pairing.ui.hint}</p>
                </div>
              );
            }
            return null;
          })()
        )}
      </div>
    </div>
  );
};

export default SentenceComposer;
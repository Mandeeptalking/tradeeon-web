import { useState, useEffect } from 'react';
import { IndicatorListItem, IndicatorDef, Subject, Target, Operator } from '../../../types/indicators';
import { getIndicators, getIndicatorDef, checkApiHealth } from '../../../api/indicators';

interface UseIndicatorListResult {
  indicators: IndicatorListItem[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  refetch: () => void;
}

interface UseIndicatorDefResult {
  definition: IndicatorDef | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
}

// Cache for indicator definitions
const defCache = new Map<string, IndicatorDef>();

export function useIndicatorList(): UseIndicatorListResult {
  const [indicators, setIndicators] = useState<IndicatorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check API health first
      const healthy = await checkApiHealth();
      setIsOffline(!healthy);
      
      if (!healthy) {
        // Use fallback data when offline
        const fallbackIndicators: IndicatorListItem[] = [
          { id: 'RSI', label: 'RSI', version: '1.0.0' },
          { id: 'EMA', label: 'EMA', version: '1.0.0' },
          { id: 'BBANDS', label: 'Bollinger Bands', version: '1.0.0' },
          { id: 'MACD', label: 'MACD', version: '1.0.0' },
          { id: 'ADX', label: 'ADX', version: '1.0.0' },
          { id: 'DI', label: 'Directional Index', version: '1.0.0' },
          { id: 'VWAP', label: 'VWAP', version: '1.0.0' }
        ];
        setIndicators(fallbackIndicators);
        return;
      }

      const data = await getIndicators();
      setIndicators(data);
      setIsOffline(false);
    } catch (err) {
      console.error('Failed to fetch indicators:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch indicators');
      setIsOffline(true);
      
      // Use fallback data on error
      const fallbackIndicators: IndicatorListItem[] = [
        { id: 'RSI', label: 'RSI', version: '1.0.0' },
        { id: 'EMA', label: 'EMA', version: '1.0.0' },
        { id: 'BBANDS', label: 'Bollinger Bands', version: '1.0.0' },
        { id: 'MACD', label: 'MACD', version: '1.0.0' },
        { id: 'ADX', label: 'ADX', version: '1.0.0' },
        { id: 'DI', label: 'Directional Index', version: '1.0.0' },
        { id: 'VWAP', label: 'VWAP', version: '1.0.0' }
      ];
      setIndicators(fallbackIndicators);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, []);

  return {
    indicators,
    loading,
    error,
    isOffline,
    refetch: fetchIndicators
  };
}

export function useIndicatorDef(id: string | null): UseIndicatorDefResult {
  const [definition, setDefinition] = useState<IndicatorDef | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!id) {
      setDefinition(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Check cache first
    const cached = defCache.get(id);
    if (cached) {
      setDefinition(cached);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchDefinition = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check API health
        const healthy = await checkApiHealth();
        setIsOffline(!healthy);
        
        if (!healthy) {
          // Use fallback definition when offline
          const fallbackDef = getFallbackDefinition(id);
          if (fallbackDef) {
            setDefinition(fallbackDef);
            defCache.set(id, fallbackDef);
          } else {
            setError('Indicator definition not available offline');
          }
          return;
        }

        const def = await getIndicatorDef(id);
        setDefinition(def);
        defCache.set(id, def);
        setIsOffline(false);
      } catch (err) {
        console.error(`Failed to fetch indicator definition for ${id}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to fetch definition');
        setIsOffline(true);
        
        // Try fallback
        const fallbackDef = getFallbackDefinition(id);
        if (fallbackDef) {
          setDefinition(fallbackDef);
          defCache.set(id, fallbackDef);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDefinition();
  }, [id]);

  return {
    definition,
    loading,
    error,
    isOffline
  };
}

// Fallback definitions for offline mode
function getFallbackDefinition(id: string): IndicatorDef | null {
  const fallbackDefs: Record<string, IndicatorDef> = {
    RSI: {
      id: "RSI",
      label: "RSI",
      version: "1.0.0",
      settings: {
        length: { type: "number", default: 14, min: 2, max: 200 }
      },
      components: ["line", "ema"],
      pairings: [
        {
          subject: { kind: "indicator", component: "line" },
          targets: [
            { 
              target: { kind: "value", min: 0, max: 100, step: 0.1 },
              operators: [">", "<", ">=", "<=", "=", "!=", "crossesAbove", "crossesBelow"]
            }
          ]
        },
        {
          subject: { kind: "indicator", component: "line" },
          targets: [
            {
              target: { kind: "component", component: "ema" },
              operators: [">", "<", ">=", "<=", "crossesAbove", "crossesBelow"]
            }
          ]
        }
      ]
    },
    EMA: {
      id: "EMA",
      label: "EMA",
      version: "1.0.0",
      settings: {
        length: { type: "number", default: 50, min: 2, max: 500 }
      },
      components: ["line"],
      pairings: [
        {
          subject: { kind: "price" },
          targets: [
            {
              target: { kind: "component", component: "line" },
              operators: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="]
            }
          ],
          ui: { defaultPriceSource: "close", hint: "Typical: Close crosses above EMA(50)" }
        }
      ]
    },
    BBANDS: {
      id: "BBANDS",
      label: "Bollinger Bands",
      version: "1.0.0",
      settings: {
        length: { type: "number", default: 20, min: 2, max: 200 },
        std: { type: "number", default: 2, min: 0.1, max: 5 }
      },
      components: ["upper", "middle", "lower"],
      pairings: [
        {
          subject: { kind: "price" },
          targets: [
            { target: { kind: "component", component: "upper" }, operators: ["crossesAbove", "crossesBelow", ">", "<"] },
            { target: { kind: "component", component: "middle" }, operators: ["crossesAbove", "crossesBelow", ">", "<"] },
            { target: { kind: "component", component: "lower" }, operators: ["crossesAbove", "crossesBelow", ">", "<"] }
          ],
          ui: { defaultPriceSource: "close", hint: "Price vs Upper/Middle/Lower band" }
        },
        {
          subject: { kind: "derived", id: "%B", label: "%B" },
          targets: [
            {
              target: { kind: "value", min: 0, max: 1, step: 0.01 },
              operators: ["crossesAbove", "crossesBelow", ">", "<", "=", "!="]
            }
          ]
        }
      ]
    },
    MACD: {
      id: "MACD",
      label: "MACD",
      version: "1.0.0",
      settings: {
        fast: { type: "number", default: 12, min: 2, max: 100 },
        slow: { type: "number", default: 26, min: 2, max: 100 },
        signal: { type: "number", default: 9, min: 2, max: 100 }
      },
      components: ["macd", "signal", "histogram"],
      pairings: [
        {
          subject: { kind: "indicator", component: "macd" },
          targets: [
            { target: { kind: "component", component: "signal" }, operators: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="] },
            { target: { kind: "component", component: "zero" }, operators: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="] }
          ]
        },
        {
          subject: { kind: "indicator", component: "histogram" },
          targets: [
            { target: { kind: "component", component: "zero" }, operators: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="] }
          ]
        }
      ]
    },
    ADX: {
      id: "ADX",
      label: "ADX",
      version: "1.0.0",
      settings: {
        length: { type: "number", default: 14, min: 2, max: 100 }
      },
      components: ["adx"],
      pairings: [
        {
          subject: { kind: "indicator", component: "adx" },
          targets: [
            {
              target: { kind: "value", min: 0, max: 100, step: 0.1 },
              operators: [">", "<", ">=", "<=", "=", "!="]
            }
          ]
        }
      ]
    },
    DI: {
      id: "DI",
      label: "Directional Index",
      version: "1.0.0",
      settings: {
        length: { type: "number", default: 14, min: 2, max: 100 }
      },
      components: ["+di", "-di"],
      pairings: [
        {
          subject: { kind: "indicator", component: "+di" },
          targets: [
            {
              target: { kind: "component", component: "-di" },
              operators: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="]
            }
          ]
        }
      ]
    },
    VWAP: {
      id: "VWAP",
      label: "VWAP",
      version: "1.0.0",
      settings: {},
      components: ["line"],
      pairings: [
        {
          subject: { kind: "price" },
          targets: [
            {
              target: { kind: "component", component: "line" },
              operators: ["crossesAbove", "crossesBelow", ">", "<", ">=", "<="]
            }
          ],
          ui: { defaultPriceSource: "close", hint: "Intraday price vs VWAP" }
        }
      ]
    }
  };

  return fallbackDefs[id] || null;
}

// Helper functions for working with definitions
export function getValidSubjects(def: IndicatorDef): Subject[] {
  return def.pairings.map(p => p.subject);
}

export function getValidTargets(def: IndicatorDef, subject: Subject): Array<{ target: Target; operators: Operator[] }> {
  const pairing = def.pairings.find(p => 
    p.subject.kind === subject.kind && 
    (subject.kind !== "indicator" || p.subject.component === subject.component) &&
    (subject.kind !== "derived" || p.subject.id === subject.id)
  );
  
  return pairing?.targets || [];
}

export function getValidOperators(def: IndicatorDef, subject: Subject, target: Target): Operator[] {
  const targets = getValidTargets(def, subject);
  const targetEntry = targets.find(t => 
    t.target.kind === target.kind &&
    (target.kind !== "component" || t.target.component === target.component)
  );
  
  return targetEntry?.operators || [];
}

export function getSubjectLabel(subject: Subject): string {
  switch (subject.kind) {
    case "price":
      return subject.source ? subject.source.toUpperCase() : "CLOSE";
    case "indicator":
      return subject.component.toUpperCase();
    case "derived":
      return subject.label;
    default:
      return "Unknown";
  }
}

export function getTargetLabel(target: Target, indicatorId?: string): string {
  switch (target.kind) {
    case "component":
      return target.component === "zero" ? "Zero line" : target.component.toUpperCase();
    case "value":
      return "Value";
    default:
      return "Unknown";
  }
}

export function getDefaultsFromDefinition(def: IndicatorDef): {
  subject: Subject;
  target: Target;
  operator: Operator;
  priceSource?: string;
} {
  const firstPairing = def.pairings[0];
  const firstTarget = firstPairing.targets[0];
  
  let priceSource: string | undefined;
  if (firstPairing.subject.kind === "price") {
    priceSource = firstPairing.ui?.defaultPriceSource || "close";
  }
  
  return {
    subject: firstPairing.subject,
    target: firstTarget.target,
    operator: firstTarget.operators[0],
    priceSource
  };
}
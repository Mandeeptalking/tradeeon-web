import { StrategyDraft, EntryRuleSet, IndicatorCondition } from '../types/strategy';
import { INDICATORS } from '../config/indicatorConfigs';

const STORAGE_KEY = 'strategyDraft';

export function loadDraft(): StrategyDraft | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return parsed as StrategyDraft;
  } catch (error) {
    console.warn('Failed to load strategy draft:', error);
    return null;
  }
}

export function saveDraft(partial: Partial<StrategyDraft>): void {
  try {
    const existing = loadDraft() || getDefaultDraft();
    const updated = { ...existing, ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save strategy draft:', error);
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear strategy draft:', error);
  }
}

export function getDefaultDraft(): StrategyDraft {
  return {
    symbols: [],
    exchange: "BINANCE_COM",
    entry: {
      main: {
        id: "main-1",
        kind: "indicator",
        timeframe: "15m",
        left: {
          name: "RSI",
          component: "line",
          settings: { length: 14 }
        },
        op: "crossesAbove",
        right: { type: "value", value: 30 }
      },
      supporting: [
        {
          id: "group-1",
          logic: "AND",
          conditions: [
            {
              id: "support-1",
              kind: "indicator",
              timeframe: "1h",
              left: {
                name: "EMA",
                component: "line",
                settings: { length: 50 }
              },
              op: ">",
              right: {
                type: "indicator",
                indicator: {
                  name: "EMA",
                  component: "line",
                  settings: { length: 200 }
                }
              }
            }
          ]
        }
      ],
      notes: ""
    }
  };
}

export function generateConditionId(): string {
  return `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateGroupId(): string {
  return `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function validateIndicatorCondition(c: IndicatorCondition): string[] {
  const errs: string[] = [];
  const cfg = INDICATORS.find(i => i.id === c.left.name);
  if (!cfg) { 
    errs.push("Unknown indicator"); 
    return errs; 
  }

  // operator gating
  if (!cfg.allowedOps.includes(c.op)) {
    errs.push(`${c.left.name} does not support operator '${c.op}'`);
  }

  // compare mode gating
  if (c.right.type === "indicator") {
    if (cfg.compareMode === "valueOnly") {
      errs.push(`${c.left.name} can only be compared to a value.`);
    } else {
      // selfOnly/valueOrSelf: must be the same indicator family
      const rightIndicatorName = c.right.indicator.name || c.left.name;
      if (rightIndicatorName !== c.left.name) {
        errs.push(`Comparison must remain within ${c.left.name}.`);
      }
      const comp = c.right.indicator?.component;
      if (!comp || !(cfg.selfComparableComponents ?? []).includes(comp)) {
        errs.push(`Invalid component for ${c.left.name} comparison.`);
      }
      // extra: crosses* cannot be component-to-component unless meaningful
      if ((c.op === "crossesAbove" || c.op === "crossesBelow") && !comp) {
        errs.push("Cross comparisons require a valid target component.");
      }
    }
  } else {
    // value
    if (cfg.compareMode === "selfOnly") {
      errs.push(`${c.left.name} must be compared to its own component (not a static value).`);
    }
  }

  return errs;
}
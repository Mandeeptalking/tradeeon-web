import { EntryRulesV2, TriggerCondition, IndicatorCondition, WebhookTrigger } from '../types/entry';
import { IndicatorDef, ConditionPayload } from '../types/indicators';
import { getIndicatorDef } from '../api/indicators';

const STORAGE_KEY = 'strategyDraft';

export function loadEntryDraft(): EntryRulesV2 | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    const draft = parsed.entryV2 as EntryRulesV2;
    
    // Migrate zero targets in main triggers
    if (draft.mainTriggers) {
      draft.mainTriggers = draft.mainTriggers.map(trigger => 
        trigger && trigger.kind === 'indicator' ? migrateZeroTargets(trigger) : trigger
      ) as [TriggerCondition, (TriggerCondition | null)];
    }
    
    // Migrate zero targets in supporting conditions
    if (draft.supporting?.setA?.conditions) {
      draft.supporting.setA.conditions = draft.supporting.setA.conditions.map(migrateZeroTargets);
    }
    if (draft.supporting?.setB?.conditions) {
      draft.supporting.setB.conditions = draft.supporting.setB.conditions.map(migrateZeroTargets);
    }
    
    return draft;
  } catch (error) {
    console.warn('Failed to load entry draft:', error);
    return null;
  }
}

export function saveEntryDraft(entryRules: EntryRulesV2): void {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const updated = { ...existing, entryV2: entryRules };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save entry draft:', error);
  }
}

export function clearEntryDraft(): void {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete existing.entryV2;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.warn('Failed to clear entry draft:', error);
  }
}

export function getDefaultEntryRules(): EntryRulesV2 {
  const defaultTrigger: IndicatorCondition = {
    id: "trigger-1",
    kind: "indicator",
    timeframe: "15m",
    left: {
      name: "RSI",
      component: "line",
      settings: { length: 14 }
    },
    op: "crossesAbove",
    right: { type: "value", value: 30 },
    subject: { kind: "indicator", component: "line" },
    target: { kind: "value", min: 0, max: 100, step: 0.1 },
    sequence: 1,
    staysValidFor: { amount: 5, unit: "bars" }
  };

  return {
    mainTriggers: [defaultTrigger, null],
    supporting: {
      setA: {
        id: "setA",
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
            right: { type: "value", value: 0 }
          }
        ]
      }
    },
    triggerTiming: "onBarClose",
    cooldownBars: 5,
    timeWindow: {
      enabled: false,
      start: "09:15",
      end: "15:30",
      timezone: "Asia/Kolkata"
    },
    resetIfStale: true,
    notes: ""
  };
}

export function generateConditionId(): string {
  return `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateTriggerId(): string {
  return `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateGroupId(): string {
  return `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function validateIndicatorCondition(c: IndicatorCondition): string[] {
  const errs: string[] = [];
  
  // Basic validation that doesn't require backend
  if (!c.left.name) {
    errs.push("Indicator name is required");
    return errs;
  }
  
  if (!c.timeframe) {
    errs.push("Timeframe is required");
    return errs;
  }
  
  if (!c.op) {
    errs.push("Operator is required");
    return errs;
  }
  
  if (!c.right) {
    errs.push("Comparison target is required");
    return errs;
  }

  // Semantic validation (requires subject/target from new format)
  if (c.subject && c.target) {
    // Validate value ranges for value targets
    if (c.target.kind === "value" && c.right.type === "value") {
      const value = c.right.value;
      if (c.target.min !== undefined && value < c.target.min) {
        errs.push(`Value ${value} is below minimum ${c.target.min}`);
      }
      if (c.target.max !== undefined && value > c.target.max) {
        errs.push(`Value ${value} is above maximum ${c.target.max}`);
      }
    }
    
    // Validate price source for price subjects
    if (c.subject.kind === "price" && !c.priceSource) {
      errs.push("Price source is required for price-based conditions");
    }
  }

  // sequence validation
  if (c.sequence !== undefined && (c.sequence < 1 || c.sequence > 10)) {
    errs.push("Sequence must be between 1 and 10");
  }

  // timing validation
  if (c.mustOccurWithin && c.mustOccurWithin.amount <= 0) {
    errs.push("Must occur within amount must be positive");
  }

  if (c.staysValidFor && c.staysValidFor.amount <= 0) {
    errs.push("Stays valid for amount must be positive");
  }

  return errs;
}

// Migration helper for existing conditions
export function migrateConditionToSemantics(
  condition: IndicatorCondition, 
  definition: IndicatorDef
): IndicatorCondition {
  // If already has subject/target, return as-is
  if (condition.subject && condition.target) {
    return condition;
  }

  // Get defaults from definition
  const firstPairing = definition.pairings[0];
  const firstTarget = firstPairing.targets[0];
  
  let subject = firstPairing.subject;
  let target = firstTarget.target;
  let operator = firstTarget.operators[0];
  let priceSource: string | undefined;

  // Set price source for price subjects
  if (subject.kind === "price") {
    priceSource = firstPairing.ui?.defaultPriceSource || "close";
  }

  // Try to preserve existing right field data
  if (condition.right) {
    if (condition.right.type === "value") {
      // Find a value target
      const valueTargetEntry = firstPairing.targets.find(t => t.target.kind === "value");
      if (valueTargetEntry) {
        target = valueTargetEntry.target;
        operator = valueTargetEntry.operators.includes(condition.op) ? condition.op : valueTargetEntry.operators[0];
      }
    } else if (condition.right.type === "indicator" && condition.right.indicator.component) {
      // Find matching component target
      const componentTargetEntry = firstPairing.targets.find(t => 
        t.target.kind === "component" && t.target.component === condition.right.indicator.component
      );
      if (componentTargetEntry) {
        target = componentTargetEntry.target;
        operator = componentTargetEntry.operators.includes(condition.op) ? condition.op : componentTargetEntry.operators[0];
      }
    }
  }

  return {
    ...condition,
    subject,
    target,
    op: operator,
    priceSource
  };
}

export function validateEntryRules(rules: EntryRulesV2): string[] {
  const errors: string[] = [];

  // Main triggers validation
  const activeTriggers = rules.mainTriggers.filter(t => t !== null);
  if (activeTriggers.length === 0) {
    errors.push("At least one main trigger is required");
  }

  // Validate each trigger
  activeTriggers.forEach((trigger, index) => {
    if (trigger.kind === 'indicator') {
      const triggerErrors = validateIndicatorCondition(trigger);
      errors.push(...triggerErrors.map(err => `Main Trigger ${index + 1}: ${err}`));
    }
  });

  // Supporting conditions count
  const totalSupportingConditions = 
    (rules.supporting.setA?.conditions.length || 0) + 
    (rules.supporting.setB?.conditions.length || 0);
  
  if (totalSupportingConditions > 10) {
    errors.push(`Too many supporting conditions: ${totalSupportingConditions}/10`);
  }

  // Validate supporting conditions
  if (rules.supporting.setA) {
    rules.supporting.setA.conditions.forEach((condition, index) => {
      const condErrors = validateIndicatorCondition(condition);
      errors.push(...condErrors.map(err => `Set A, Condition ${index + 1}: ${err}`));
    });
  }

  if (rules.supporting.setB) {
    rules.supporting.setB.conditions.forEach((condition, index) => {
      const condErrors = validateIndicatorCondition(condition);
      errors.push(...condErrors.map(err => `Set B, Condition ${index + 1}: ${err}`));
    });
  }

  // Time window validation
  if (rules.timeWindow?.enabled) {
    const start = rules.timeWindow.start;
    const end = rules.timeWindow.end;
    
    if (!start || !end) {
      errors.push("Time window start and end times are required");
    } else {
      const startTime = new Date(`2000-01-01T${start}:00`);
      const endTime = new Date(`2000-01-01T${end}:00`);
      
      if (startTime >= endTime) {
        errors.push("Time window start must be before end time");
      }
    }
  }

  // Sequence validation within triggers
  const triggerSequences = activeTriggers
    .filter(t => t.sequence !== undefined)
    .map(t => t.sequence!);
  
  const duplicateSequences = triggerSequences.filter((seq, index) => 
    triggerSequences.indexOf(seq) !== index
  );
  
  if (duplicateSequences.length > 0) {
    errors.push(`Duplicate trigger sequences: ${duplicateSequences.join(', ')}`);
  }

  return errors;
}

// Migration helper for old entry rules
export function migrateFromV1(oldEntry: any): EntryRulesV2 {
  const defaultRules = getDefaultEntryRules();
  
  try {
    if (oldEntry?.main) {
      defaultRules.mainTriggers[0] = {
        ...oldEntry.main,
        sequence: 1,
        staysValidFor: { amount: 5, unit: "bars" }
      };
    }
    
    if (oldEntry?.supporting?.length > 0) {
      const firstGroup = oldEntry.supporting[0];
      if (firstGroup?.conditions?.length > 0) {
        defaultRules.supporting.setA = {
          id: "setA",
          logic: firstGroup.logic || "AND",
          conditions: firstGroup.conditions
        };
      }
    }
    
    if (oldEntry?.notes) {
      defaultRules.notes = oldEntry.notes;
    }
  } catch (error) {
    console.warn('Migration failed, using defaults:', error);
  }
  
  return defaultRules;
}
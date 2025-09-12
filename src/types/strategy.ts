export type Timeframe = "1m"|"3m"|"5m"|"15m"|"30m"|"1h"|"2h"|"4h"|"1d"|"1w";

export type Operator =
  | ">"
  | "<"
  | ">="
  | "<="
  | "="
  | "!="
  | "crossesAbove"
  | "crossesBelow"
  | "increasesByPct"
  | "decreasesByPct";

export type CompareWith =
  | { type: "value"; value: number }
  | {
      type: "indicator";
      // NOTE: restricted by compareMode. When allowed, MUST be the same indicator family as `left.name`.
      indicator: Omit<IndicatorRef, "name"> & { name?: string };
      // If compareMode === "selfOnly" we force `name` to match left.name in validation.
    };

export type CompareMode = "valueOnly" | "selfOnly" | "valueOrSelf";

export type IndicatorRef = {
  name: string;                 // "RSI" | "EMA" | ...
  component?: string;           // e.g. "line"|"signal"|"histogram"|"upper"|"lower"
  settings?: Record<string, number|string|boolean>;
};

export type IndicatorCondition = {
  id: string;
  kind: "indicator";
  timeframe: Timeframe;
  left: IndicatorRef;
  op: Operator;
  right: CompareWith;
  note?: string;
};

export type WebhookCondition = {
  id: string;
  kind: "webhook";
  match: { key: string; equals: string | number | boolean };
  cooldownBars?: number;
};

export type Condition = IndicatorCondition | WebhookCondition;

export type ConditionGroup = {
  id: string;
  logic: "AND" | "OR";
  conditions: Condition[];
};

export type EntryRuleSet = {
  main: IndicatorCondition;        // single required
  supporting: ConditionGroup[];    // 0..n groups
  trigger?: Condition;             // optional final confirmation
  notes?: string;
};

export type StrategyDraft = {
  symbols: string[];               // already filled elsewhere
  exchange: "BINANCE_COM" | "BINANCE_US" | "BINANCE_TESTNET";
  entry: EntryRuleSet;
  // additional sections exist but out of scope here
};
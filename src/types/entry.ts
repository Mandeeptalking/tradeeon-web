export type Timeframe = "1m"|"3m"|"5m"|"15m"|"30m"|"1h"|"2h"|"4h"|"1d"|"1w";
export type Operator = ">"|"<"|">="|"<="|"="|"!="|"crossesAbove"|"crossesBelow";
export type CompareMode = "valueOnly"|"selfOnly"|"valueOrSelf";

export type IndicatorRef = {
  name: "RSI"|"EMA"|"SMA"|"MACD"|"BBANDS"|"ADX"|"OBV"|"MFI"|"VWAP"|"STOCH"|string;
  component?: string; // e.g., "line","ema","signal","histogram"
  settings?: Record<string, number|string|boolean>;
};

export type CompareWith =
  | { type: "value"; value: number }
  | { type: "indicator"; indicator: { component: string; settings?: Record<string, number|string|boolean> } }; // self-family only

export type IndicatorCondition = {
  id: string;
  kind: "indicator";
  timeframe: Timeframe;
  left: IndicatorRef;
  op: Operator;
  right: CompareWith;
  // New semantics fields (optional for backward compatibility)
  subject?: SubjectV2;
  target?: TargetV2;
  priceSource?: string;
  // context
  sequence?: number;          // 1,2,3…; lower = must occur earlier
  mustOccurWithin?: { amount: number; unit: "bars" | "minutes" };
  staysValidFor?: { amount: number; unit: "bars" | "minutes" };
  note?: string;
};

// New semantics types
export type SubjectV2 =
  | { kind: "price"; source?: "close"|"open"|"high"|"low"|"hl2"|"hlc3"|"ohlc4" }
  | { kind: "indicator"; component: string }
  | { kind: "derived"; id: string; label: string };

export type TargetV2 =
  | { kind: "component"; component: string }
  | { kind: "value"; min?: number; max?: number; step?: number }
  | { kind: "zero" };

export type WebhookTrigger = {
  id: string;
  kind: "webhook";
  match: { key: string; equals: string|number|boolean };
  sequence?: number;
  mustOccurWithin?: { amount: number; unit: "bars" | "minutes" };
  staysValidFor?: { amount: number; unit: "bars" | "minutes" };
};

export type TriggerCondition = IndicatorCondition | WebhookTrigger;

export type Condition = IndicatorCondition;

export type ConditionGroup = {
  id: string;
  logic: "AND" | "OR";     // inside this group
  conditions: Condition[];
};

export type SupportingSets = {
  setA?: ConditionGroup;   // optional; treated as satisfied if undefined
  setB?: ConditionGroup;   // optional
  // Overall logic: (setA ? satisfied(setA) : true) OR (setB ? satisfied(setB) : false)
};

export type TimeWindow = {
  enabled: boolean;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  timezone?: string; // "Asia/Kolkata" etc.
};

export type EntryRulesV2 = {
  mainTriggers: [TriggerCondition, (TriggerCondition | null)]; // max 2
  supporting: SupportingSets;      // total conditions across A+B <= 10
  triggerTiming: "onBarClose" | "nextBarOpen";
  cooldownBars?: number;
  timeWindow?: TimeWindow;
  resetIfStale: boolean;           // if any validity expires before trigger, reset
  notes?: string;
};
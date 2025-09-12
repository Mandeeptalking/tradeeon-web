export type Operator = ">" | "<" | ">=" | "<=" | "=" | "!=" | "crossesAbove" | "crossesBelow";

export type Subject = 
  | { kind: "price"; source?: "close" | "open" | "high" | "low" | "hl2" | "hlc3" | "ohlc4" }
  | { kind: "indicator"; component: string }
  | { kind: "derived"; id: string; label: string };

export type Target = 
  | { kind: "component"; component: string }
  | { kind: "value"; min?: number; max?: number; step?: number }
  // Note: "zero" is now represented as { kind: "component", component: "zero" }

export type Pairing = {
  subject: Subject;
  targets: Array<{ target: Target; operators: Operator[] }>;
  ui?: { defaultPriceSource?: string; hint?: string };
};

export type IndicatorDef = {
  id: "RSI" | "EMA" | "BBANDS" | "MACD" | "ADX" | "DI" | "VWAP";
  label: string;
  version: string;
  settings: Record<string, {
    type: "number" | "select" | "boolean";
    default: any;
    min?: number;
    max?: number;
    options?: string[];
  }>;
  components: string[];
  pairings: Pairing[];
};

export type ConditionPayload = {
  indicatorId: string;
  timeframe: string;
  settings?: Record<string, any>;
  subject: Subject;
  target: Target;
  operator: Operator;
  value?: number;
  priceSource?: string;
};

export type IndicatorListItem = {
  id: string;
  label: string;
  version: string;
};

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

export type SentenceResult = {
  text: string;
};
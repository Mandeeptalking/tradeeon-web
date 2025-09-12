export type MatchOp = "ANY" | "ALL";
export type RuleType = "RSI" | "EMA_CROSS" | "PRICE_CHANGE" | "BREAKOUT";

export type EntryRule =
  | { type: "RSI"; period: number; op: ">" | "<"; value: number }
  | { type: "EMA_CROSS"; fast: number; slow: number; dir: "ABOVE" | "BELOW" }
  | { type: "PRICE_CHANGE"; window: { value: number; unit: "m" | "h" | "d" }; op: "<=" | ">="; percent: number }
  | { type: "BREAKOUT"; side: "ABOVE" | "BELOW"; lookbackDays: number; ref: "HIGH" | "LOW" };

export interface EntryRuleGroup {
  match: MatchOp;
  rules: EntryRule[];
}
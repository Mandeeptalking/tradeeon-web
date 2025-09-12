import { Operator } from '../types/strategy';

export const OPERATOR_LABELS: Record<Operator, string> = {
  ">": "is greater than",
  "<": "is less than",
  ">=": "is greater than or equal to",
  "<=": "is less than or equal to",
  "=": "equals",
  "!=": "does not equal",
  "crossesAbove": "crosses above",
  "crossesBelow": "crosses below",
  "increasesByPct": "increases by",
  "decreasesByPct": "decreases by"
};

export const OPERATOR_SYMBOLS: Record<Operator, string> = {
  ">": ">",
  "<": "<",
  ">=": "≥",
  "<=": "≤",
  "=": "=",
  "!=": "≠",
  "crossesAbove": "↗",
  "crossesBelow": "↘",
  "increasesByPct": "+%",
  "decreasesByPct": "-%"
};

export const CROSSING_OPERATORS: Operator[] = ["crossesAbove", "crossesBelow"];
export const PERCENTAGE_OPERATORS: Operator[] = ["increasesByPct", "decreasesByPct"];
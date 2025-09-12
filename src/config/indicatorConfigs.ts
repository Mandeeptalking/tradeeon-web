export type IndicatorConfig = {
  id: string;
  label: string;
  components: { id: string; label: string }[];
  settings: Record<
    string,
    { type: "number" | "select" | "boolean"; min?: number; max?: number; default: number | string | boolean; options?: string[] }
  >;
  defaultComponent: string;
  allowedOps: string[];
  compareMode: "valueOnly" | "selfOnly" | "valueOrSelf";
  // When self comparison is allowed, list components that are valid RHS choices
  selfComparableComponents?: string[]; // e.g. ["ema","signal"]
};

export const INDICATORS: IndicatorConfig[] = [
  {
    id: "RSI",
    label: "RSI",
    components: [
      { id: "line", label: "RSI" },
      { id: "ema", label: "RSI EMA" },          // MA of RSI (internal)
      { id: "overbought", label: "Overbought" },// 70
      { id: "oversold", label: "Oversold" },    // 30
      { id: "middle", label: "Middle (50)" }
    ],
    settings: { length: { type: "number", min: 2, max: 200, default: 14 } },
    defaultComponent: "line",
    allowedOps: ["<", ">", "=", "!=", "crossesAbove", "crossesBelow"],
    compareMode: "valueOrSelf",
    selfComparableComponents: ["ema"] // RSI line can be compared to RSI EMA
  },
  {
    id: "EMA",
    label: "EMA",
    components: [{ id: "line", label: "EMA" }],
    settings: { length: { type: "number", min: 2, max: 500, default: 50 } },
    defaultComponent: "line",
    allowedOps: [">","<",">=","<=","=","!=","crossesAbove","crossesBelow"],
    compareMode: "valueOnly" // no cross-indicator compare
  },
  {
    id: "SMA",
    label: "SMA",
    components: [{ id: "line", label: "SMA" }],
    settings: { length: { type: "number", min: 2, max: 500, default: 20 } },
    defaultComponent: "line",
    allowedOps: [">","<",">=","<=","=","!=","crossesAbove","crossesBelow"],
    compareMode: "valueOnly"
  },
  {
    id: "MACD",
    label: "MACD",
    components: [
      { id: "macd", label: "MACD Line" },
      { id: "signal", label: "Signal Line" },
      { id: "histogram", label: "Histogram" }
    ],
    settings: { 
      fast: { type: "number", min: 2, max: 100, default: 12 },
      slow: { type: "number", min: 2, max: 100, default: 26 },
      signal: { type: "number", min: 2, max: 100, default: 9 }
    },
    defaultComponent: "macd",
    allowedOps: [">","<",">=","<=","=","!=","crossesAbove","crossesBelow"],
    compareMode: "valueOrSelf",
    selfComparableComponents: ["signal"] // e.g., MACD crosses above Signal
  },
  {
    id: "BBANDS",
    label: "Bollinger Bands",
    components: [
      { id: "upper", label: "Upper Band" },
      { id: "middle", label: "Middle Band" },
      { id: "lower", label: "Lower Band" }
    ],
    settings: { 
      length: { type: "number", min: 2, max: 200, default: 20 },
      std: { type: "number", min: 0.1, max: 5, default: 2 }
    },
    defaultComponent: "middle",
    allowedOps: [">","<",">=","<=","crossesAbove","crossesBelow"],
    compareMode: "valueOnly"
  },
  {
    id: "ADX",
    label: "ADX",
    components: [
      { id: "adx", label: "ADX" },
      { id: "plusDI", label: "+DI" },
      { id: "minusDI", label: "-DI" }
    ],
    settings: { length: { type: "number", min: 2, max: 100, default: 14 } },
    defaultComponent: "adx",
    allowedOps: [">","<",">=","<=","=","!=","crossesAbove","crossesBelow"],
    compareMode: "valueOnly"
  },
  {
    id: "OBV",
    label: "OBV",
    components: [{ id: "line", label: "OBV" }],
    settings: {},
    defaultComponent: "line",
    allowedOps: [">","<",">=","<=","crossesAbove","crossesBelow","increasesByPct","decreasesByPct"],
    compareMode: "valueOnly"
  },
  {
    id: "MFI",
    label: "MFI",
    components: [{ id: "line", label: "MFI" }],
    settings: { length: { type: "number", min: 2, max: 200, default: 14 } },
    defaultComponent: "line",
    allowedOps: ["<", ">", "=", "!=", "crossesAbove", "crossesBelow"],
    compareMode: "valueOnly"
  },
  {
    id: "VWAP",
    label: "VWAP",
    components: [{ id: "line", label: "VWAP" }],
    settings: {},
    defaultComponent: "line",
    allowedOps: [">","<",">=","<=","crossesAbove","crossesBelow"],
    compareMode: "valueOnly"
  },
  {
    id: "STOCH",
    label: "Stochastic",
    components: [
      { id: "k", label: "%K" },
      { id: "d", label: "%D" }
    ],
    settings: { 
      kLength: { type: "number", min: 2, max: 100, default: 14 },
      dLength: { type: "number", min: 2, max: 50, default: 3 }
    },
    defaultComponent: "k",
    allowedOps: ["<", ">", "=", "!=", "crossesAbove", "crossesBelow"],
    compareMode: "valueOrSelf",
    selfComparableComponents: ["d"] // %K can be compared to %D
  }
]

export type IndicatorId = typeof INDICATORS[number]['id'];
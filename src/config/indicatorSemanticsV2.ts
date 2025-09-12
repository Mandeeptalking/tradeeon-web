export type PriceSource = "close" | "open" | "high" | "low" | "hl2" | "hlc3" | "ohlc4";
export type Operator = ">" | "<" | ">=" | "<=" | "=" | "!=" | "crossesAbove" | "crossesBelow";

export type Subject =
  | { kind: "price"; source?: PriceSource }
  | { kind: "indicator"; component: string }   // e.g., "line","ema","macd","signal","histogram","+di","-di","adx"
  | { kind: "derived"; id: string; label: string }; // e.g., "%B"

export type Target =
  | { kind: "component"; component: string }   // e.g., "upper","middle","lower","signal","-di"
  | { kind: "value"; min?: number; max?: number; step?: number }
  | { kind: "zero" };

export type Pairing = {
  subject: Subject;
  targets: Array<{ target: Target; operators: Operator[] }>;
  ui?: { defaultPriceSource?: PriceSource; hint?: string };
};

export type IndicatorSemantics = {
  id: "RSI" | "EMA" | "BBANDS" | "MACD" | "ADX" | "DI" | "VWAP";
  label: string;
  pairings: Pairing[];
};

export const SEMANTICS: IndicatorSemantics[] = [
  // RSI
  {
    id: "RSI",
    label: "RSI",
    pairings: [
      { 
        subject: { kind: "indicator", component: "line" },
        targets: [
          { 
            target: { kind: "value", min: 0, max: 100, step: 0.1 },
            operators: [">","<",">=","<=","=","!=","crossesAbove","crossesBelow"] 
          }
        ] 
      },
      { 
        subject: { kind: "indicator", component: "line" },
        targets: [
          { 
            target: { kind: "component", component: "ema" },
            operators: [">","<",">=","<=","crossesAbove","crossesBelow"] 
          }
        ] 
      },
      { 
        subject: { kind: "indicator", component: "ema" },
        targets: [
          { 
            target: { kind: "value", min: 0, max: 100, step: 0.1 },
            operators: [">","<",">=","<=","=","!="] 
          }
        ] 
      }
    ]
  },
  // EMA — Price vs EMA only
  {
    id: "EMA",
    label: "EMA",
    pairings: [
      { 
        subject: { kind: "price" },
        targets: [
          { 
            target: { kind: "component", component: "line" },
            operators: ["crossesAbove","crossesBelow",">","<",">=","<="] 
          }
        ],
        ui: { defaultPriceSource: "close", hint: "Typical: Close crosses above EMA(50)" } 
      }
    ]
  },
  // BBANDS — Price vs Bands, or %B vs value
  {
    id: "BBANDS",
    label: "Bollinger Bands",
    pairings: [
      { 
        subject: { kind: "price" },
        targets: [
          { target: { kind: "component", component: "upper"  }, operators: ["crossesAbove","crossesBelow",">","<"] },
          { target: { kind: "component", component: "middle" }, operators: ["crossesAbove","crossesBelow",">","<"] },
          { target: { kind: "component", component: "lower"  }, operators: ["crossesAbove","crossesBelow",">","<"] }
        ],
        ui: { defaultPriceSource: "close", hint: "Price vs Upper/Middle/Lower band" } 
      },
      { 
        subject: { kind: "derived", id: "%B", label: "%B" },
        targets: [
          { 
            target: { kind: "value", min: 0, max: 1, step: 0.01 },
            operators: ["crossesAbove","crossesBelow",">","<","=","!="] 
          }
        ] 
      }
    ]
  },
  // MACD — MACD vs Signal/0, Histogram vs 0
  {
    id: "MACD",
    label: "MACD",
    pairings: [
      { subject: { kind: "indicator", component: "macd" },      
        targets: [
          { target: { kind: "component", component: "signal" }, operators: ["crossesAbove","crossesBelow",">","<",">=","<="] },
          { target: { kind: "component", component: "zero" }, operators: ["crossesAbove","crossesBelow",">","<",">=","<="] }
        ] 
      },
      { subject: { kind: "indicator", component: "histogram" }, 
        targets: [{ target: { kind: "component", component: "zero" }, operators: ["crossesAbove","crossesBelow",">","<",">=","<="] }] 
      },
      { 
        subject: { kind: "indicator", component: "macd" },      
        targets: [
          { 
            target: { kind: "component", component: "signal" }, 
            operators: ["crossesAbove","crossesBelow",">","<",">=","<="] 
          }
        ] 
      },
      { 
        subject: { kind: "indicator", component: "macd" },      
        targets: [
          { 
            target: { kind: "zero" },                      
            operators: ["crossesAbove","crossesBelow",">","<",">=","<="] 
          }
        ] 
      },
      { 
        subject: { kind: "indicator", component: "histogram" }, 
        targets: [
          { 
            target: { kind: "zero" },                      
            operators: ["crossesAbove","crossesBelow",">","<",">=","<="] 
          }
        ] 
      }
    ]
  },
  // ADX
  {
    id: "ADX",
    label: "ADX",
    pairings: [
      { 
        subject: { kind: "indicator", component: "adx" },
        targets: [
          { 
            target: { kind: "value", min: 0, max: 100, step: 0.1 },
            operators: [">","<",">=","<=","=","!="] 
          }
        ] 
      }
    ]
  },
  // DI
  {
    id: "DI",
    label: "Directional Index",
    pairings: [
      { 
        subject: { kind: "indicator", component: "+di" },
        targets: [
          { 
            target: { kind: "component", component: "-di" },
            operators: ["crossesAbove","crossesBelow",">","<",">=","<="] 
          }
        ] 
      }
    ]
  },
  // VWAP — Price vs VWAP
  {
    id: "VWAP",
    label: "VWAP",
    pairings: [
      { 
        subject: { kind: "price" },
        targets: [
          { 
            target: { kind: "component", component: "line" },
            operators: ["crossesAbove","crossesBelow",">","<",">=","<="] 
          }
        ],
        ui: { defaultPriceSource: "close", hint: "Intraday price vs VWAP" } 
      }
    ]
  }
];

export function getSemantics(id: IndicatorSemantics["id"]) {
  return SEMANTICS.find(s => s.id === id);
}

// Helper functions for UI components
export function getValidSubjects(indicatorId: IndicatorSemantics["id"]): Subject[] {
  const semantics = getSemantics(indicatorId);
  if (!semantics) return [];
  return semantics.pairings.map(p => p.subject);
}

export function getValidTargets(indicatorId: IndicatorSemantics["id"], subject: Subject): Array<{ target: Target; operators: Operator[] }> {
  const semantics = getSemantics(indicatorId);
  if (!semantics) return [];
  
  const pairing = semantics.pairings.find(p => 
    p.subject.kind === subject.kind && 
    (subject.kind !== "indicator" || p.subject.component === subject.component) &&
    (subject.kind !== "derived" || p.subject.id === subject.id)
  );
  
  return pairing?.targets || [];
}

export function getValidOperators(indicatorId: IndicatorSemantics["id"], subject: Subject, target: Target): Operator[] {
  const targets = getValidTargets(indicatorId, subject);
  const targetEntry = targets.find(t => 
    t.target.kind === target.kind &&
    (target.kind !== "component" || t.target.component === target.component) &&
    (target.kind !== "value" || true) && // value targets always match
    (target.kind !== "zero" || true) // zero targets always match
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
      return target.component.toUpperCase();
    case "value":
      return "Value";
    case "zero":
      return "0";
    default:
      return "Unknown";
  }
}
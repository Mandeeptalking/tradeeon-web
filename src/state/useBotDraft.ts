import { useState, useEffect } from 'react';
import { EntryRulesV2 } from '../types/entry';

interface BotDraft {
  // Basic Details
  name: string;
  market: "Indian Equity" | "Crypto" | "US Stocks";
  type: "Spot" | "Futures";
  direction?: "Long" | "Short";
  
  // Exchange (for Crypto)
  exchangeId: string | null;
  exchange: "binance" | "binanceus" | "binance_testnet" | null;
  region: "COM" | "US" | "TESTNET" | null;
  
  // Symbols & Entry
  symbols: string[];
  entry: EntryRulesV2;
  
  // Current workspace context
  currentSymbol?: string;
  currentTimeframe?: string;
}

const STORAGE_KEY = 'botDraft';

const getDefaultDraft = (): BotDraft => ({
  name: 'My Trading Bot',
  market: 'Indian Equity',
  type: 'Spot',
  direction: 'Long',
  exchangeId: null,
  exchange: null,
  region: null,
  symbols: [],
  entry: {
    mainTriggers: [
      {
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
        sequence: 1,
        staysValidFor: { amount: 5, unit: "bars" }
      },
      null
    ],
    supporting: {
      setA: {
        id: "setA",
        logic: "AND",
        conditions: []
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
  },
  currentSymbol: 'BTCUSDT',
  currentTimeframe: '15m'
});

export function useBotDraft() {
  const [draft, setDraft] = useState<BotDraft>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...getDefaultDraft(), ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load bot draft:', error);
    }
    return getDefaultDraft();
  });

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.warn('Failed to save bot draft:', error);
    }
  }, [draft]);

  // Auto-save with debounce
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        console.log('Auto-saved bot draft');
      } catch (error) {
        console.warn('Failed to auto-save bot draft:', error);
      }
    }, 2000);
    
    return () => clearTimeout(saveTimer);
  }, [draft.entry, draft.symbols, draft.currentSymbol, draft.currentTimeframe]);

  const updateDraft = (updates: Partial<BotDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const updateEntry = (entry: EntryRulesV2) => {
    setDraft(prev => ({ ...prev, entry }));
  };

  const setCurrentSymbol = (symbol: string) => {
    setDraft(prev => ({ ...prev, currentSymbol: symbol }));
  };

  const setCurrentTimeframe = (timeframe: string) => {
    setDraft(prev => ({ ...prev, currentTimeframe: timeframe }));
  };

  const clearDraft = () => {
    setDraft(getDefaultDraft());
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    draft,
    updateDraft,
    updateEntry,
    setCurrentSymbol,
    setCurrentTimeframe,
    clearDraft
  };
}
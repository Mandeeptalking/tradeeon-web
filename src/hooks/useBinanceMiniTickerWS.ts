import { useEffect, useMemo, useRef, useState } from "react";

type Region = "COM" | "US" | "TESTNET";

const WS_BASE: Record<Region, string> = {
  COM:     "wss://stream.binance.com:9443/stream",
  US:      "wss://stream.binance.us:9443/stream",
  TESTNET: "wss://testnet.binance.vision/stream",
};

export type Ticker = {
  symbol: string;          // e.g. BTCUSDT
  last: number;            // c
  open: number;            // o
  high: number;            // h
  low: number;             // l
  volume: number;          // v
  changePct: number;       // (c-o)/o * 100
  eventTime: number;       // E
};

function toStreamName(sym: string) {
  return `${sym.toLowerCase()}@miniticker`; // lightweight; last/open/high/low/vol
}

export function useBinanceMiniTickerWS(symbols: string[], region: Region) {
  const [data, setData] = useState<Record<string, Ticker>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);

  const url = useMemo(() => {
    const streams = symbols
      .map(s => s.trim())
      .filter(Boolean)
      .map(toStreamName)
      .join("/");
    const base = WS_BASE[region];
    return streams ? `${base}?streams=${streams}` : null;
  }, [symbols, region]);

  useEffect(() => {
    if (!url) return;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => { retryRef.current = 0; };

      ws.onmessage = (ev) => {
        // Combined stream payload shape: { stream, data }
        const msg = JSON.parse(ev.data);
        const d = msg?.data ?? msg; // be lenient
        // miniTicker fields: { s, c, o, h, l, v, E }
        if (d && d.s && d.c && d.o) {
          setData(prev => {
            const last = Number(d.c);
            const open = Number(d.o);
            const t: Ticker = {
              symbol: d.s,
              last,
              open,
              high: Number(d.h),
              low: Number(d.l),
              volume: Number(d.v),
              changePct: open ? ((last - open) / open) * 100 : 0,
              eventTime: Number(d.E) || Date.now(),
            };
            return { ...prev, [d.s]: t };
          });
        }
      };

      ws.onclose = () => {
        const timeout = Math.min(1000 * Math.pow(2, retryRef.current++), 15000);
        setTimeout(() => connect(), timeout);
      };

      ws.onerror = () => {
        try { ws.close(); } catch {}
      };
    };

    connect();
    return () => { try { wsRef.current?.close(); } catch {} };
  }, [url]);

  return data; // map: SYMBOL -> Ticker
}
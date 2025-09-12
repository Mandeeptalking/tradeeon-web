import { OHLCVData } from '../api/market';

import { wsUrl } from './base';

import { wsUrl } from './base';

export interface LiveOHLCVData extends OHLCVData {
  closed: boolean;
}

export interface OHLCVSubscription {
  symbol: string;
  timeframe: string;
  region?: string;
  onData: (data: LiveOHLCVData) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class OHLCVWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, OHLCVSubscription>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private firstMessageTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      // Build URL with required query parameters
      const params = new URLSearchParams();
      if (this.subscriptions.size > 0) {
        const firstSub = Array.from(this.subscriptions.values())[0];
        params.set('symbol', firstSub.symbol);
        params.set('tf', firstSub.timeframe);
        params.set('region', firstSub.region || 'COM');
      }
      
      const url = wsUrl(`/stream/ohlcv?${params.toString()}`);
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('OHLCV WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Start 10s timer for first message
        this.firstMessageTimer = setTimeout(() => {
          console.warn('OHLCV WebSocket: no first message received within 10s');
        }, 10000);
        
        // Resubscribe to all active subscriptions
        this.subscriptions.forEach((sub, key) => {
          this.sendSubscribe(sub.symbol, sub.timeframe, sub.region);
          sub.onConnect?.();
        });
      };

      this.ws.onmessage = (event) => {
        // Clear first message timer
        if (this.firstMessageTimer) {
          clearTimeout(this.firstMessageTimer);
          this.firstMessageTimer = null;
        }
        
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'ohlcv' && message.data) {
            const key = `${message.symbol}:${message.timeframe}:${message.region || 'COM'}`;
            const subscription = this.subscriptions.get(key);
            
            if (subscription) {
              subscription.onData({
                ...message.data,
                closed: message.data.closed || false
              });
            }
          }
        } catch (error) {
          console.error('Failed to parse OHLCV message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('OHLCV WebSocket disconnected');
        if (this.firstMessageTimer) {
          clearTimeout(this.firstMessageTimer);
          this.firstMessageTimer = null;
        }
        this.subscriptions.forEach(sub => sub.onDisconnect?.());
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('OHLCV WebSocket error:', error);
        if (this.firstMessageTimer) {
          clearTimeout(this.firstMessageTimer);
          this.firstMessageTimer = null;
        }
        this.subscriptions.forEach(sub => sub.onError?.(new Error('WebSocket connection error')));
      };
    } catch (error) {
      console.error('Failed to create OHLCV WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const baseDelay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      // Add ±20% jitter
      const jitter = 1 + (Math.random() * 0.4 - 0.2);
      const delay = baseDelay * jitter;
      
      setTimeout(() => {
        console.log(`Reconnecting OHLCV WebSocket (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }

  private sendSubscribe(symbol: string, timeframe: string, region?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      // OHLCV uses query parameters, not JSON payload
      // Connection URL already includes parameters
    }
  }

  private sendUnsubscribe(symbol: string, timeframe: string, region?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      // OHLCV unsubscribe by closing connection
      this.ws.close();
    }
  }

  subscribe(subscription: OHLCVSubscription): () => void {
    const key = `${subscription.symbol}:${subscription.timeframe}:${subscription.region || 'COM'}`;
    this.subscriptions.set(key, subscription);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(subscription.symbol, subscription.timeframe, subscription.region);
    }

    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(key);
      this.sendUnsubscribe(subscription.symbol, subscription.timeframe, subscription.region);
    };
  }

  disconnect() {
    if (this.firstMessageTimer) {
      clearTimeout(this.firstMessageTimer);
      this.firstMessageTimer = null;
    }
    this.subscriptions.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
let ohlcvWS: OHLCVWebSocket | null = null;

export function getOHLCVWebSocket(): OHLCVWebSocket {
  if (!ohlcvWS) {
    ohlcvWS = new OHLCVWebSocket();
  }
  return ohlcvWS;
}
import { wsUrl } from './base';

export interface IndicatorData {
  timestamp: number;
  values: Record<string, number>;
}

export interface IndicatorSubscription {
  symbol: string;
  timeframe: string;
  indicatorId: string;
  settings: Record<string, any>;
  onData: (data: IndicatorData) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class IndicatorWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, IndicatorSubscription>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private firstMessageTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(wsUrl('/v1/indicators/subscribe'));
      
      this.ws.onopen = () => {
        console.log('Indicators WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Start 10s timer for first message
        this.firstMessageTimer = setTimeout(() => {
          console.warn('Indicators WebSocket: no first message received within 10s');
        }, 10000);
        
        // Resubscribe to all active subscriptions
        this.subscriptions.forEach((sub, key) => {
          this.sendSubscribe(sub);
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
          
          if (message.type === 'indicator' && message.data) {
            const key = `${message.symbol}:${message.timeframe}:${message.indicatorId}`;
            const subscription = this.subscriptions.get(key);
            
            if (subscription) {
              subscription.onData(message.data);
            }
          }
        } catch (error) {
          console.error('Failed to parse indicator message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Indicators WebSocket disconnected');
        if (this.firstMessageTimer) {
          clearTimeout(this.firstMessageTimer);
          this.firstMessageTimer = null;
        }
        this.subscriptions.forEach(sub => sub.onDisconnect?.());
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Indicators WebSocket error:', error);
        if (this.firstMessageTimer) {
          clearTimeout(this.firstMessageTimer);
          this.firstMessageTimer = null;
        }
        this.subscriptions.forEach(sub => sub.onError?.(new Error('WebSocket connection error')));
      };
    } catch (error) {
      console.error('Failed to create Indicators WebSocket:', error);
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
        console.log(`Reconnecting Indicators WebSocket (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }

  private sendSubscribe(subscription: IndicatorSubscription) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        symbol: subscription.symbol,
        timeframe: subscription.timeframe,
        indicatorId: subscription.indicatorId,
        settings: subscription.settings,
        region: 'COM'
      }));
    }
  }

  private sendUnsubscribe(subscription: IndicatorSubscription) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        symbol: subscription.symbol,
        timeframe: subscription.timeframe,
        indicatorId: subscription.indicatorId
      }));
    }
  }

  subscribe(subscription: IndicatorSubscription): () => void {
    const key = `${subscription.symbol}:${subscription.timeframe}:${subscription.indicatorId}`;
    this.subscriptions.set(key, subscription);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(subscription);
    }

    // Return unsubscribe function
    return () => {
      const sub = this.subscriptions.get(key);
      if (sub) {
        this.subscriptions.delete(key);
        this.sendUnsubscribe(sub);
      }
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
let indicatorWS: IndicatorWebSocket | null = null;

export function getIndicatorWebSocket(): IndicatorWebSocket {
  if (!indicatorWS) {
    indicatorWS = new IndicatorWebSocket();
  }
  return indicatorWS;
}
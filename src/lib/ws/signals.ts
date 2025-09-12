import { wsUrl } from './base';

export interface SignalData {
  timestamp: number;
  symbol: string;
  timeframe: string;
  entry: any; // EntryRulesV2
  indicators: Array<{ id: string; settings: Record<string, any> }>;
  region?: string;
  triggered: boolean;
  value?: number;
  metadata?: Record<string, any>;
}

export interface SignalSubscription {
  symbol: string;
  timeframe: string;
  entry: any; // EntryRulesV2
  indicators: Array<{ id: string; settings: Record<string, any> }>;
  region?: string;
  onSignal: (data: SignalData) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export class SignalWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, SignalSubscription>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private _subscribed = false;
  private firstMessageTimer: NodeJS.Timeout | null = null;
  private subscribeTimeoutTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(wsUrl('/v1/signals/subscribe'));
      
      this.ws.onopen = () => {
        console.log('Signals WebSocket connected');
        this.reconnectAttempts = 0;
        this._subscribed = false;
        
        // Start 10s timer for first message
        this.firstMessageTimer = setTimeout(() => {
          console.warn('Signals WebSocket: no first message received within 10s');
        }, 10000);
        
        // Resubscribe to all active subscriptions
        this.subscriptions.forEach((sub, key) => {
          this.sendSubscribe(sub, key);
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
          
          // Handle ACK message
          if (message.type === 'ack' && message.ok === true) {
            this._subscribed = true;
            if (this.subscribeTimeoutTimer) {
              clearTimeout(this.subscribeTimeoutTimer);
              this.subscribeTimeoutTimer = null;
            }
            return;
          }
          
          if (message.type === 'signal' && message.data) {
            // Only process signals if we're subscribed
            if (!this._subscribed) return;
            
            const key = `${message.data.symbol}:${message.data.timeframe}:${message.data.region || 'COM'}`;
            const subscription = this.subscriptions.get(key);
            
            if (subscription) {
              subscription.onSignal(message.data);
            }
          }
        } catch (error) {
          console.error('Failed to parse signal message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Signals WebSocket disconnected');
        this._subscribed = false;
        this.clearTimers();
        this.subscriptions.forEach(sub => sub.onDisconnect?.());
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Signals WebSocket error:', error);
        this._subscribed = false;
        this.clearTimers();
        this.subscriptions.forEach(sub => sub.onError?.(new Error('WebSocket connection error')));
      };
    } catch (error) {
      console.error('Failed to create Signals WebSocket:', error);
      this.handleReconnect();
    }
  }

  private clearTimers() {
    if (this.firstMessageTimer) {
      clearTimeout(this.firstMessageTimer);
      this.firstMessageTimer = null;
    }
    if (this.subscribeTimeoutTimer) {
      clearTimeout(this.subscribeTimeoutTimer);
      this.subscribeTimeoutTimer = null;
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
        console.log(`Reconnecting Signals WebSocket (attempt ${this.reconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }

  private sendSubscribe(subscription: SignalSubscription, key: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const payload = {
        action: 'subscribe',
        region: subscription.region || 'COM',
        symbol: subscription.symbol,
        tfPrimary: subscription.timeframe,
        entry: subscription.entry,
        indicators: subscription.indicators
      };
      
      this.ws.send(JSON.stringify(payload));
      
      // Start 3s timeout for ACK
      this.subscribeTimeoutTimer = setTimeout(() => {
        console.warn('Signals WebSocket: subscribe timeout - no ACK received within 3s');
        this.subscriptions.forEach(sub => sub.onError?.(new Error('Subscribe timeout')));
        this.ws?.close();
      }, 3000);
    }
  }

  private sendUnsubscribe(subscription: SignalSubscription) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        symbol: subscription.symbol,
        timeframe: subscription.timeframe,
        region: subscription.region || 'COM'
      }));
    }
  }

  subscribe(subscription: SignalSubscription): () => void {
    const key = `${subscription.symbol}:${subscription.timeframe}:${subscription.region || 'COM'}`;
    this.subscriptions.set(key, subscription);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(subscription, key);
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
    this.clearTimers();
    this.subscriptions.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
let signalWS: SignalWebSocket | null = null;

export function getSignalWebSocket(): SignalWebSocket {
  if (!signalWS) {
    signalWS = new SignalWebSocket();
  }
  return signalWS;
}
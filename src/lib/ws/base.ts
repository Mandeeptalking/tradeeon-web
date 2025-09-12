// Enhanced WebSocket URL construction utility with better diagnostics
const loggedUrls = new Set<string>();

export function wsUrl(path: string, options?: {
  diagnostic?: boolean;
  fallback?: string;
}): string {
  const base = import.meta.env.VITE_API_BASE_URL;
  
  if (!base) {
    console.error('[WS] VITE_API_BASE_URL not defined');
    return options?.fallback || 'ws://localhost:8000';
  }
  
  const u = new URL(path, base);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  
  const wsUrlString = u.toString();
  
  // Enhanced diagnostic logging
  const shouldLog = options?.diagnostic ?? import.meta.env.VITE_WS_DIAGNOSTIC_MODE;
  if (shouldLog && !loggedUrls.has(wsUrlString)) {
    console.log(`[WS] Constructed URL: ${wsUrlString}`);
    console.log(`[WS] Base URL: ${base}`);
    console.log(`[WS] Path: ${path}`);
    console.log(`[WS] Protocol: ${u.protocol}`);
    loggedUrls.add(wsUrlString);
  }
  
  return wsUrlString;
}

// Convenience functions for specific endpoints
export const wsEndpoints = {
  ohlcv: (symbol: string, timeframe: string, region = 'COM') => 
    wsUrl(`/stream/ohlcv?symbol=${symbol}&tf=${timeframe}&region=${region}`),
  
  indicators: () => 
    wsUrl('/v1/indicators/subscribe'),
  
  signals: () => 
    wsUrl('/v1/signals/subscribe'),
} as const;

// Type-safe WebSocket connection manager
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastMessageTime = 0;
  private heartbeatTimeout = 30000;

  constructor(
    private url: string,
    private options?: {
      onMessage?: (data: any) => void;
      onOpen?: () => void;
      onClose?: (event: CloseEvent) => void;
      onError?: (error: Event) => void;
    }
  ) {}

  connect(): void {
    if (this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) {
      console.warn('[WS] Already connected or connecting');
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
      this.startHeartbeat();
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[WS] Connected');
      this.reconnectAttempts = 0;
      this.lastMessageTime = Date.now();
      this.options?.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      this.lastMessageTime = Date.now();
      try {
        const data = JSON.parse(event.data);
        this.options?.onMessage?.(data);
      } catch (error) {
        console.error('[WS] Failed to parse message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`[WS] Closed: ${event.code} - ${event.reason}`);
      this.stopHeartbeat();
      this.options?.onClose?.(event);
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('[WS] Error:', error);
      this.options?.onError?.(error);
    };
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime;
      if (timeSinceLastMessage > this.heartbeatTimeout) {
        console.warn('[WS] No messages received, reconnecting...');
        this.ws?.close();
      }
    }, 10000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
          this.connect();
        }
      }, delay);
    } else {
      console.error('[WS] Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// React hook for WebSocket connections
export function useWebSocket(url: string, options?: {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  autoConnect?: boolean;
}) {
  const [wsManager] = useState(() => new WebSocketManager(url, options));
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (options?.autoConnect !== false) {
      wsManager.connect();
    }

    return () => wsManager.disconnect();
  }, [wsManager, options?.autoConnect]);

  useEffect(() => {
    const originalOnOpen = wsManager.options?.onOpen;
    const originalOnClose = wsManager.options?.onClose;
    const originalOnMessage = wsManager.options?.onMessage;

    wsManager.options = {
      ...wsManager.options,
      onOpen: () => {
        setIsConnected(true);
        originalOnOpen?.();
      },
      onClose: (event) => {
        setIsConnected(false);
        originalOnClose?.(event);
      },
      onMessage: (data) => {
        setLastMessage(data);
        originalOnMessage?.(data);
      },
    };
  }, [wsManager]);

  return {
    wsManager,
    isConnected,
    lastMessage,
    connect: () => wsManager.connect(),
    disconnect: () => wsManager.disconnect(),
  };
}
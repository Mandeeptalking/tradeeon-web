const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketDataRequest {
  symbol: string;
  timeframe: string;
  region?: string;
  limit?: number;
  startTime?: number;
  endTime?: number;
}

export async function getOHLCV(request: MarketDataRequest): Promise<OHLCVData[]> {
  try {
    const params = new URLSearchParams({
      symbol: request.symbol,
      tf: request.timeframe,
      ...(request.region && { region: request.region }),
      ...(request.limit && { limit: request.limit.toString() }),
      ...(request.startTime && { startTime: request.startTime.toString() }),
      ...(request.endTime && { endTime: request.endTime.toString() })
    });

    const response = await fetch(`${API_BASE_URL}/market/ohlcv?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch OHLCV data:', error);
    
    // Return mock data for development
    return generateMockOHLCV(request.symbol, request.limit || 100);
  }
}

// Mock data generator for development/offline mode
function generateMockOHLCV(symbol: string, count: number): OHLCVData[] {
  const data: OHLCVData[] = [];
  const now = Date.now();
  const interval = 15 * 60 * 1000; // 15 minutes
  
  let price = symbol.includes('BTC') ? 45000 : 
              symbol.includes('ETH') ? 2800 : 
              symbol.includes('ADA') ? 0.5 : 100;
  
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - (i * interval);
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * volatility;
    
    const open = price;
    const close = price * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.random() * 1000000;
    
    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume
    });
    
    price = close;
  }
  
  return data;
}
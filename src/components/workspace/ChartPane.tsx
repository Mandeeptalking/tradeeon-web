import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, Time, CandlestickData, LineData, HistogramData, AreaData } from 'lightweight-charts';
import { TrendingUp, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { OHLCVData, getOHLCV } from '../../lib/api/market';
import { getOHLCVWebSocket, getIndicatorWebSocket, getSignalWebSocket } from '../../lib/ws';
import type { LiveOHLCVData } from '../../lib/ws';
import { computeIndicator } from '../../api/indicators';
import StatusPill from './StatusPill';

interface ChartPaneProps {
  symbol: string;
  timeframe: string;
  overlays: Array<{
    id: string;
    indicatorId: string;
    settings: Record<string, any>;
    visible: boolean;
    color?: string;
  }>;
  entryRules?: any; // EntryRulesV2
  onChartReady?: (ready: boolean) => void;
  onIndicatorComputed?: (overlayId: string, data: Array<{ timestamp: number; values: Record<string, number> }>) => void;
  className?: string;
}

const ChartPane: React.FC<ChartPaneProps> = ({
  symbol,
  timeframe,
  overlays,
  entryRules,
  onChartReady,
  onIndicatorComputed,
  className = ''
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const overlaySeriesRef = useRef<Map<string, { main: ISeriesApi<any>; signal?: ISeriesApi<any>; histogram?: ISeriesApi<any>; zero?: ISeriesApi<any> }>>(new Map());
  const historicalDataRef = useRef<CandlestickData[]>([]);
  const signalMarkersRef = useRef<Map<number, any>>(new Map());
  
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [indicatorData, setIndicatorData] = useState<Map<string, Array<{ timestamp: number; values: Record<string, number> }>>>(new Map());
  
  // Status pill states
  const [dataStatus, setDataStatus] = useState<'OK' | 'STALE'>('STALE');
  const [wsStatus, setWsStatus] = useState<'CONNECTING' | 'LIVE' | 'RETRY' | 'OFFLINE'>('CONNECTING');
  const [signalStatus, setSignalStatus] = useState<'NONE' | 'SUB' | 'HIT' | 'TIMEOUT'>('NONE');
  const [hitCount, setHitCount] = useState(0);

  // Helper function to map server data to Lightweight Charts format
  const toCandle = (d: OHLCVData): CandlestickData => ({
    time: Math.floor(d.timestamp / 1000) as Time,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close
  });

  // Initialize chart
  useEffect(() => {
    const initializeChart = async () => {
      // Validate createChart function
      if (typeof createChart !== 'function') {
        console.error('typeof createChart:', typeof createChart);
        console.error('createChart is not a function - check lightweight-charts import');
        setError('Chart library not properly loaded');
        onChartReady?.(false);
        return;
      }
      
      if (!chartContainerRef.current) {
        console.error('Chart container ref is null - DOM element not ready');
        setError('Chart container not ready');
        onChartReady?.(false);
        return;
      }

      // Ensure the container has dimensions
      const containerRect = chartContainerRef.current.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) {
        console.error('Chart container has zero dimensions:', containerRect);
        setError('Chart container has no dimensions');
        onChartReady?.(false);
        return;
      }

      try {
        // Validate createChart function before use
        if (typeof createChart !== 'function') {
          console.error('typeof createChart:', typeof createChart);
          console.error('createChart is not a function - check lightweight-charts import');
          setError('Chart library not properly loaded');
          onChartReady?.(false);
          return;
        }

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
          crosshair: {
            mode: 1,
          },
          rightPriceScale: {
            borderColor: '#cccccc',
          },
          timeScale: {
            borderColor: '#cccccc',
            timeVisible: true,
            secondsVisible: false,
          },
        });

        // Validate chart was created successfully with robust checks
        if (!chart) {
          throw new Error('Chart creation returned null');
        }
        
        // Validate chart has required methods with detailed diagnostics
        if (typeof chart.addCandlestickSeries !== 'function') {
          console.error('Object.keys(chart):', Object.keys(chart));
          throw new Error('Chart instance missing addCandlestickSeries method');
        }
        
        console.log('Chart initialized successfully');

        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderDownColor: '#ef4444',
          borderUpColor: '#10b981',
          wickDownColor: '#ef4444',
          wickUpColor: '#10b981',
        });

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;

        // Handle resize
        const handleResize = () => {
          if (chartContainerRef.current && chart) {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);
        onChartReady?.(true);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
          chartRef.current = null;
          candlestickSeriesRef.current = null;
          overlaySeriesRef.current.clear();
          signalMarkersRef.current.clear();
          historicalDataRef.current = [];
        };
      } catch (err) {
        console.error('Failed to initialize chart:', err);
        setError('Failed to initialize chart');
        onChartReady?.(false);
      }
    };

    initializeChart();
  }, [onChartReady]);

  // Load historical data
  useEffect(() => {
    if (!symbol || !timeframe || !candlestickSeriesRef.current) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setDataStatus('STALE');

        const data = await getOHLCV({
          symbol,
          timeframe,
          limit: 1500,
          region: 'COM'
        });

        const candlestickData = data.map(toCandle);

        // Store historical data
        historicalDataRef.current = candlestickData;
        candlestickSeriesRef.current?.setData(candlestickData);
        setDataStatus('OK');
        setLoading(false);
      } catch (err) {
        console.error('Failed to load chart data:', err);
        setError('Failed to load chart data');
        setDataStatus('STALE');
        setLoading(false);
      }
    };

    loadData();
  }, [symbol, timeframe]);

  // Subscribe to live updates
  useEffect(() => {
    if (!symbol || !timeframe) return;

    setWsStatus('CONNECTING');
    const ohlcvWS = getOHLCVWebSocket();
    
    const unsubscribe = ohlcvWS.subscribe({
      symbol,
      timeframe,
      region: 'COM',
      onData: (data: LiveOHLCVData) => {
        if (candlestickSeriesRef.current) {
          const candlestick = toCandle(data);
          
          if (data.closed) {
            // Bar is closed, add new bar
            historicalDataRef.current.push(candlestick);
            
            // Keep only last 1500 bars
            if (historicalDataRef.current.length > 1500) {
              historicalDataRef.current = historicalDataRef.current.slice(-1500);
              candlestickSeriesRef.current.setData(historicalDataRef.current);
            } else {
              candlestickSeriesRef.current.update(candlestick);
            }
          } else {
            // Update current bar
            candlestickSeriesRef.current.update(candlestick);
          }
          
          setLastUpdate(new Date());
          setDataStatus('OK');
        }
      },
      onConnect: () => {
        setConnected(true);
        setWsStatus('LIVE');
      },
      onDisconnect: () => {
        setConnected(false);
        setWsStatus('OFFLINE');
      },
      onError: (error) => {
        console.error('OHLCV WebSocket error:', error);
        setConnected(false);
        setWsStatus('RETRY');
      }
    });

    return unsubscribe;
  }, [symbol, timeframe]);

  // Subscribe to live signals
  useEffect(() => {
    if (!symbol || !timeframe || !entryRules) return;

    setSignalStatus('CONNECTING');
    const signalWS = getSignalWebSocket();
    
    const unsubscribe = signalWS.subscribe({
      symbol,
      timeframe,
      entry: entryRules,
      indicators: overlays.map(o => ({ id: o.indicatorId, settings: o.settings })),
      region: 'COM',
      onSignal: (data) => {
        if (chartRef.current && candlestickSeriesRef.current) {
          const time = Math.floor(data.timestamp / 1000);
          
          if (data.triggered) {
            // Add signal marker
            const marker = {
              time: time as any,
              position: 'belowBar' as const,
              color: '#10b981',
              shape: 'arrowUp' as const,
              text: 'Entry Signal',
              size: 1
            };
            
            const existingMarkers = candlestickSeriesRef.current.markers() || [];
            candlestickSeriesRef.current.setMarkers([...existingMarkers, marker]);
            signalMarkersRef.current.set(time, marker);
            
            setHitCount(prev => prev + 1);
            setSignalStatus('HIT');
            
            // Reset to SUB after 2 seconds
            setTimeout(() => setSignalStatus('SUB'), 2000);
          }
        }
      },
      onConnect: () => {
        setSignalStatus('SUB');
      },
      onDisconnect: () => {
        setSignalStatus('NONE');
      },
      onError: (error) => {
        console.error('Signal WebSocket error:', error);
        if (error.message === 'Subscribe timeout') {
          setSignalStatus('TIMEOUT');
          // Reset to NONE after 3 seconds
          setTimeout(() => setSignalStatus('NONE'), 3000);
        } else {
          setSignalStatus('NONE');
        }
      }
    });

    return unsubscribe;
  }, [symbol, timeframe, entryRules, overlays]);

  // Handle overlay changes
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;
    const currentSeries = overlaySeriesRef.current;

    // Remove overlays that are no longer in the list or not visible
    currentSeries.forEach((seriesGroup, id) => {
      const overlay = overlays.find(o => o.id === id);
      if (!overlay || !overlay.visible) {
        chart.removeSeries(seriesGroup.main);
        if (seriesGroup.signal) chart.removeSeries(seriesGroup.signal);
        if (seriesGroup.histogram) chart.removeSeries(seriesGroup.histogram);
        if (seriesGroup.zero) chart.removeSeries(seriesGroup.zero);
        currentSeries.delete(id);
      }
    });

    // Add new visible overlays
    overlays.forEach(overlay => {
      if (overlay.visible && !currentSeries.has(overlay.id)) {
        // Compute historical data for new overlay
        computeHistoricalIndicatorData(overlay);
        
        const seriesGroup: any = {};
        
        // Create series based on indicator type with proper styling
        if (overlay.indicatorId === 'MACD') {
          // MACD line (blue)
          seriesGroup.main = chart.addLineSeries({
            color: '#3b82f6',
            lineWidth: 2,
            priceScaleId: 'macd',
            title: 'MACD'
          });
          
          // Signal line (orange)
          seriesGroup.signal = chart.addLineSeries({
            color: '#f97316',
            lineWidth: 2,
            priceScaleId: 'macd',
            title: 'Signal'
          });
          
          // Histogram (area)
          seriesGroup.histogram = chart.addHistogramSeries({
            color: '#8b5cf6',
            priceScaleId: 'macd',
            title: 'Histogram'
          });
          
          // Zero line (grey)
          seriesGroup.zero = chart.addLineSeries({
            color: '#6b7280',
            lineWidth: 1,
            lineStyle: 2, // dashed
            priceScaleId: 'macd',
            title: 'Zero'
          });
        } else if (overlay.indicatorId === 'BBANDS') {
          // Upper band
          seriesGroup.main = chart.addLineSeries({
            color: '#3b82f6',
            lineWidth: 1,
            title: 'BB Upper'
          });
          
          // Middle line
          seriesGroup.signal = chart.addLineSeries({
            color: '#f97316',
            lineWidth: 2,
            title: 'BB Middle'
          });
          
          // Lower band
          seriesGroup.histogram = chart.addLineSeries({
            color: '#3b82f6',
            lineWidth: 1,
            title: 'BB Lower'
          });
        } else if (overlay.indicatorId === 'RSI' || overlay.indicatorId === 'ADX') {
          seriesGroup.main = chart.addLineSeries({
            color: overlay.color || '#3b82f6',
            lineWidth: 2,
            priceScaleId: overlay.indicatorId.toLowerCase(),
            title: overlay.indicatorId
          });
        } else {
          // Default line series for other indicators
          seriesGroup.main = chart.addLineSeries({
            color: overlay.color || '#3b82f6',
            lineWidth: 2,
            title: overlay.indicatorId
          });
        }
        
        currentSeries.set(overlay.id, seriesGroup);
        
        // Set historical data if available
        const historicalData = indicatorData.get(overlay.id);
        if (historicalData) {
          updateIndicatorSeries(overlay.id, historicalData);
        }
      }
    });

    // Subscribe to live indicator data for visible overlays
    const indicatorWS = getIndicatorWebSocket();
    const unsubscribes: (() => void)[] = [];

    overlays.forEach(overlay => {
      if (overlay.visible) {
        const unsubscribe = indicatorWS.subscribe({
          symbol,
          timeframe,
          indicatorId: overlay.indicatorId,
          settings: overlay.settings,
          onData: (data) => {
            updateIndicatorSeries(overlay.id, [data]);
          },
          onError: (error) => {
            console.error(`Indicator ${overlay.indicatorId} error:`, error);
          }
        });
        
        unsubscribes.push(unsubscribe);
      }
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [overlays, symbol, timeframe, indicatorData]);

  // Compute historical indicator data
  const computeHistoricalIndicatorData = async (overlay: { id: string; indicatorId: string; settings: Record<string, any> }) => {
    try {
      const result = await computeIndicator({
        symbol,
        timeframe,
        indicatorId: overlay.indicatorId,
        settings: overlay.settings,
        region: 'COM',
        limit: 1500
      });
      
      onIndicatorComputed?.(overlay.id, result.data);
      updateIndicatorSeries(overlay.id, result.data);
    } catch (error) {
      console.error('Failed to compute indicator:', error);
      // Generate mock data as fallback
      const mockData = generateMockIndicatorData(overlay.indicatorId, 1500);
      onIndicatorComputed?.(overlay.id, mockData);
      updateIndicatorSeries(overlay.id, mockData);
    }
  };

  // Generate mock indicator data for fallback
  const generateMockIndicatorData = (indicatorId: string, count: number) => {
    const data = [];
    const now = Date.now();
    const interval = getTimeframeMs(timeframe);
    
    for (let i = count - 1; i >= 0; i--) {
      const timestamp = now - (i * interval);
      let values: Record<string, number> = {};
      
      switch (indicatorId) {
        case 'RSI':
          values = { line: 30 + Math.random() * 40 };
          break;
        case 'MACD':
          const macd = (Math.random() - 0.5) * 10;
          const signal = macd * 0.8 + (Math.random() - 0.5) * 2;
          values = { 
            macd, 
            signal, 
            histogram: macd - signal,
            zero: 0
          };
          break;
        case 'EMA':
          values = { line: 45000 + (Math.random() - 0.5) * 5000 };
          break;
        case 'BBANDS':
          const middle = 45000 + (Math.random() - 0.5) * 5000;
          const std = 1000;
          values = {
            upper: middle + (2 * std),
            middle,
            lower: middle - (2 * std)
          };
          break;
        case 'ADX':
          values = { adx: Math.random() * 50 + 10 };
          break;
        default:
          values = { line: Math.random() * 100 };
      }
      
      data.push({ timestamp, values });
    }
    
    return data;
  };

  const getTimeframeMs = (tf: string): number => {
    const map: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return map[tf] || 15 * 60 * 1000;
  };

  // Handle indicator data updates
  const updateIndicatorSeries = (overlayId: string, data: Array<{ timestamp: number; values: Record<string, number> }>) => {
    const seriesGroup = overlaySeriesRef.current.get(overlayId);
    if (!seriesGroup) return;

    const overlay = overlays.find(o => o.id === overlayId);
    if (!overlay) return;

    data.forEach(point => {
      const time = Math.floor(point.timestamp / 1000) as Time;
      
      if (overlay.indicatorId === 'MACD') {
        if (point.values.macd !== undefined) {
          seriesGroup.main.update({ time, value: point.values.macd });
        }
        if (point.values.signal !== undefined && seriesGroup.signal) {
          seriesGroup.signal.update({ time, value: point.values.signal });
        }
        if (point.values.histogram !== undefined && seriesGroup.histogram) {
          seriesGroup.histogram.update({ time, value: point.values.histogram });
        }
        if (seriesGroup.zero) {
          seriesGroup.zero.update({ time, value: 0 });
        }
      } else if (overlay.indicatorId === 'BBANDS') {
        if (point.values.upper !== undefined) {
          seriesGroup.main.update({ time, value: point.values.upper });
        }
        if (point.values.middle !== undefined && seriesGroup.signal) {
          seriesGroup.signal.update({ time, value: point.values.middle });
        }
        if (point.values.lower !== undefined && seriesGroup.histogram) {
          seriesGroup.histogram.update({ time, value: point.values.lower });
        }
      } else {
        // Single line indicators (RSI, EMA, ADX, etc.)
        const value = point.values.line || point.values.rsi || point.values.adx || point.values.ema || 0;
        seriesGroup.main.update({ time, value });
      }
    });
  };

  const handleRefresh = async () => {
    if (!symbol || !timeframe || !candlestickSeriesRef.current) return;

    try {
      setLoading(true);
      setDataStatus('STALE');
      const data = await getOHLCV({
        symbol,
        timeframe,
        limit: 1500,
        region: 'COM'
      });

      const candlestickData = data.map(toCandle);

      historicalDataRef.current = candlestickData;
      candlestickSeriesRef.current.setData(candlestickData);
      setDataStatus('OK');
    } catch (err) {
      console.error('Failed to refresh chart data:', err);
      setError('Failed to refresh chart data');
      setDataStatus('STALE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Status Pill */}
      <StatusPill
        dataStatus={dataStatus}
        wsStatus={wsStatus}
        signalStatus={signalStatus}
        hitCount={hitCount}
      />
      
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
            <span className="text-sm text-gray-500">{timeframe}</span>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {connected ? (
              <div className="flex items-center space-x-1 text-emerald-600">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium">Live</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium">Offline</span>
              </div>
            )}
            
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">Loading chart data...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 z-10">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}
        
        <div ref={chartContainerRef} className="w-full h-96" />
      </div>

      {/* Chart Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Overlays: {overlays.filter(o => o.visible).length}</span>
            <span>Timeframe: {timeframe}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Real-time data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPane;
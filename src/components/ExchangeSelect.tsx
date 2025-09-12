import React, { useState, useEffect } from 'react';
import { ChevronDown, Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface Connection {
  id: string;
  name: string;
  exchange: 'binance' | 'binanceus' | 'binance_testnet';
  region: 'COM' | 'US' | 'TESTNET';
  status: 'active' | 'error' | 'inactive';
  label: string;
}

interface ExchangeSelectProps {
  value: {
    exchangeId: string | null;
    exchange: 'binance' | 'binanceus' | 'binance_testnet' | null;
    region: 'COM' | 'US' | 'TESTNET' | null;
  };
  onChange: (selection: {
    exchangeId: string | null;
    exchange: 'binance' | 'binanceus' | 'binance_testnet' | null;
    region: 'COM' | 'US' | 'TESTNET' | null;
  }) => void;
  market: string;
  className?: string;
}

const ExchangeSelect: React.FC<ExchangeSelectProps> = ({
  value,
  onChange,
  market,
  className = ''
}) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, [market]);

  const loadConnections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/connections?type=exchange&status=active&market=${market.toLowerCase()}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockConnections: Connection[] = [
        {
          id: '1',
          name: 'Binance Main',
          exchange: 'binance',
          region: 'COM',
          status: 'active',
          label: 'Binance Global'
        },
        {
          id: '2',
          name: 'Binance US',
          exchange: 'binanceus',
          region: 'US',
          status: 'active',
          label: 'Binance US'
        },
        {
          id: '3',
          name: 'Binance Testnet',
          exchange: 'binance_testnet',
          region: 'TESTNET',
          status: 'active',
          label: 'Binance Testnet'
        }
      ];
      
      setConnections(mockConnections);
    } catch (err) {
      setError('Failed to load connections');
      console.error('Error loading connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (connection) {
      onChange({
        exchangeId: connection.id,
        exchange: connection.exchange,
        region: connection.region
      });
    } else {
      onChange({
        exchangeId: null,
        exchange: null,
        region: null
      });
    }
  };

  const getProviderLabel = (exchange: string) => {
    switch (exchange) {
      case 'binance': return 'Binance';
      case 'binanceus': return 'Binance US';
      case 'binance_testnet': return 'Binance Testnet';
      default: return 'Unknown';
    }
  };

  const getRegionLabel = (region: string) => {
    switch (region) {
      case 'COM': return 'Global';
      case 'US': return 'US';
      case 'TESTNET': return 'Testnet';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Wifi className="w-3 h-3 text-emerald-500" />;
      case 'error':
        return <WifiOff className="w-3 h-3 text-red-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Exchange Connection
        </label>
        <div className="h-9 bg-gray-100 border border-gray-200 rounded-md animate-pulse"></div>
        <p className="text-[11px] text-gray-500 mt-1">Loading connections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Exchange Connection
        </label>
        <div className="h-9 bg-red-50 border border-red-200 rounded-md flex items-center px-3">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
          <span className="text-sm text-red-700">Failed to load</span>
        </div>
        <p className="text-[11px] text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className={className}>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Exchange Connection
        </label>
        <div className="h-9 bg-yellow-50 border border-yellow-200 rounded-md flex items-center px-3">
          <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
          <span className="text-sm text-yellow-700">No connections</span>
        </div>
        <p className="text-[11px] text-yellow-600 mt-1">Add a connection first</p>
      </div>
    );
  }

  const selectedConnection = connections.find(c => c.id === value.exchangeId);

  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Exchange Connection
      </label>
      <div className="relative">
        <select
          value={value.exchangeId || ''}
          onChange={(e) => handleSelectionChange(e.target.value)}
          className="w-full h-9 pl-3 pr-8 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
        >
          <option value="">Select exchange...</option>
          {connections.map((connection) => (
            <option key={connection.id} value={connection.id}>
              {getProviderLabel(connection.exchange)} • {getRegionLabel(connection.region)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      
      {selectedConnection && (
        <div className="flex items-center space-x-2 mt-1">
          {getStatusIcon(selectedConnection.status)}
          <p className="text-[11px] text-gray-500">
            {selectedConnection.label} • {selectedConnection.status}
          </p>
        </div>
      )}
      
      {!selectedConnection && (
        <p className="text-[11px] text-gray-500 mt-1">Choose your trading connection</p>
      )}
    </div>
  );
};

export default ExchangeSelect;
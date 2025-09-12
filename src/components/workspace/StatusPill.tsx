import React from 'react';

interface StatusPillProps {
  dataStatus: 'OK' | 'STALE';
  wsStatus: 'CONNECTING' | 'LIVE' | 'RETRY' | 'OFFLINE';
  signalStatus: 'NONE' | 'SUB' | 'HIT' | 'TIMEOUT';
  hitCount: number;
}

const StatusPill: React.FC<StatusPillProps> = ({
  dataStatus,
  wsStatus,
  signalStatus,
  hitCount
}) => {
  // Only render if diagnostic UI is enabled
  if (import.meta.env.VITE_DIAGNOSTIC_UI_ENABLED !== 'true') {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
      case 'LIVE':
      case 'SUB':
      case 'HIT':
        return 'bg-green-500 text-white';
      case 'STALE':
      case 'CONNECTING':
      case 'RETRY':
      case 'NONE':
        return 'bg-yellow-500 text-white';
      case 'OFFLINE':
      case 'TIMEOUT':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-sm">
      <div className="flex items-center space-x-2 text-xs font-mono">
        <div className="flex items-center space-x-1">
          <span className="text-gray-600">DATA:</span>
          <span className={`px-1 py-0.5 rounded ${getStatusColor(dataStatus)}`}>
            {dataStatus}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-gray-600">WS:</span>
          <span className={`px-1 py-0.5 rounded ${getStatusColor(wsStatus)}`}>
            {wsStatus}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-gray-600">SIG:</span>
          <span className={`px-1 py-0.5 rounded ${getStatusColor(signalStatus)} ${
            signalStatus === 'TIMEOUT' ? 'animate-pulse' : ''
          }`}>
            {signalStatus}
            {signalStatus === 'HIT' && hitCount > 0 && ` (${hitCount})`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusPill;
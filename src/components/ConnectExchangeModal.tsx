import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Key, 
  TestTube,
  ExternalLink,
  Wifi,
  Settings,
  Eye,
  Trash2,
  BarChart3
} from 'lucide-react';

interface ConnectExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRegion?: 'com' | 'us' | 'testnet';
}

interface EgressIP {
  ip: string;
  region: string;
}

interface ClockData {
  server_time: number;
  drift_ms: number;
  drift_hint: string;
}

interface ConnectionTest {
  status: 'success' | 'error';
  code?: string;
  server_time_offset?: number;
  message?: string;
}

interface Connection {
  id: string;
  name: string;
  exchange: string;
  region: string;
  status: string;
  created_at: string;
}

const ConnectExchangeModal: React.FC<ConnectExchangeModalProps> = ({
  isOpen,
  onClose,
  preselectedRegion
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedExchange, setSelectedExchange] = useState('BINANCE');
  const [selectedRegion, setSelectedRegion] = useState(preselectedRegion || 'com');
  const [connectionName, setConnectionName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [ipWhitelisted, setIpWhitelisted] = useState(false);
  const [egressIPs, setEgressIPs] = useState<EgressIP[]>([]);
  const [clockData, setClockData] = useState<ClockData | null>(null);
  const [testResult, setTestResult] = useState<ConnectionTest | null>(null);
  const [createdConnection, setCreatedConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIP, setCopiedIP] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadEgressIPs();
      loadClockData();
      
      // Set default connection name based on region
      if (!connectionName) {
        const regionName = selectedRegion === 'com' ? 'Global' : 
                          selectedRegion === 'us' ? 'US' : 'Testnet';
        setConnectionName(`Binance ${regionName}`);
      }
    }
  }, [isOpen, selectedRegion]);

  // Update connection name when region changes
  useEffect(() => {
    if (selectedRegion) {
      const regionName = selectedRegion === 'com' ? 'Global' : 
                        selectedRegion === 'us' ? 'US' : 'Testnet';
      setConnectionName(`Binance ${regionName}`);
    }
  }, [selectedRegion]);

  const loadEgressIPs = async () => {
    try {
      // Mock API call - replace with actual API
      const mockIPs: EgressIP[] = [
        { ip: '52.89.214.238', region: 'us-west-2' },
        { ip: '54.218.53.128', region: 'us-west-2' },
        { ip: '52.32.178.7', region: 'us-west-2' },
        { ip: '18.236.146.177', region: 'us-west-2' }
      ];
      setEgressIPs(mockIPs);
    } catch (error) {
      console.error('Failed to load egress IPs');
    }
  };

  const loadClockData = async () => {
    try {
      // Mock API call - replace with actual API
      const mockClock: ClockData = {
        server_time: Date.now(),
        drift_ms: -150,
        drift_hint: 'Your system clock is 150ms behind server time. This is within acceptable range.'
      };
      setClockData(mockClock);
    } catch (error) {
      console.error('Failed to load clock data');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIP(text);
      setTimeout(() => setCopiedIP(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard');
    }
  };

  const handleCreateConnection = async () => {
    if (!connectionName || !apiKey || !apiSecret) return;

    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const mockConnection: Connection = {
        id: Date.now().toString(),
        name: connectionName,
        exchange: selectedExchange,
        region: selectedRegion,
        status: 'created',
        created_at: new Date().toISOString()
      };
      
      setCreatedConnection(mockConnection);
      setCurrentStep(4); // Move to test step
    } catch (error) {
      console.error('Failed to create connection');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!createdConnection) return;

    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const mockTestResult: ConnectionTest = {
        status: Math.random() > 0.3 ? 'success' : 'error',
        code: Math.random() > 0.3 ? undefined : ['IP_NOT_WHITELISTED', 'INVALID_SIGNATURE', 'TIMESTAMP_DRIFT', 'RATE_LIMITED'][Math.floor(Math.random() * 4)],
        server_time_offset: -150,
        message: Math.random() > 0.3 ? 'Connection successful' : 'Connection failed'
      };
      
      setTestResult(mockTestResult);
      
      if (mockTestResult.status === 'success') {
        setCurrentStep(5); // Move to done step
      }
    } catch (error) {
      console.error('Failed to test connection');
    } finally {
      setLoading(false);
    }
  };

  const getErrorHint = (code: string) => {
    switch (code) {
      case 'IP_NOT_WHITELISTED':
        return 'Your IP address is not whitelisted on Binance. Please add our egress IPs to your API whitelist.';
      case 'INVALID_SIGNATURE':
        return 'API signature validation failed. Please check your API key and secret are correct.';
      case 'TIMESTAMP_DRIFT':
        return 'Server time drift detected. Please sync your system clock or contact support.';
      case 'RATE_LIMITED':
        return 'API rate limit exceeded. Please wait a moment and try again.';
      default:
        return 'An unknown error occurred. Please check your configuration.';
    }
  };

  const exchanges = [
    { 
      id: 'BINANCE', 
      name: 'Binance', 
      regions: [
        { id: 'com', name: 'Binance.com (Global)', recommended: true },
        { id: 'us', name: 'Binance.US', recommended: false },
        { id: 'testnet', name: 'Testnet (Demo)', recommended: false }
      ]
    }
  ];

  const steps = [
    { number: 1, title: 'Choose Exchange', description: 'Select your trading platform' },
    { number: 2, title: 'Whitelist IPs', description: 'Configure API access' },
    { number: 3, title: 'Enter Keys', description: 'Provide API credentials' },
    { number: 4, title: 'Test Connection', description: 'Verify configuration' },
    { number: 5, title: 'Done', description: 'Connection ready' }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedExchange && selectedRegion && selectedRegion !== '';
      case 2: return ipWhitelisted;
      case 3: return connectionName && apiKey && apiSecret;
      case 4: return testResult?.status === 'success';
      default: return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;
    
    if (currentStep === 3) {
      handleCreateConnection();
    } else if (currentStep === 4 && !testResult) {
      handleTestConnection();
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedExchange('BINANCE');
    setSelectedRegion(preselectedRegion || 'com');
    setConnectionName('');
    setApiKey('');
    setApiSecret('');
    setDryRun(true);
    setIpWhitelisted(false);
    setTestResult(null);
    setCreatedConnection(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Connect Exchange
            </h2>
            <p className="text-gray-400 mt-1">Set up secure API connection to your trading account</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  currentStep > step.number 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : currentStep === step.number
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-600 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* Step 1: Choose Exchange/Region */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Choose Exchange & Region</h3>
                <p className="text-gray-400">Select your trading platform and regional endpoint</p>
              </div>

              <div className="space-y-4">
                {exchanges.map((exchange) => (
                  <div key={exchange.id} className="space-y-3">
                    <div className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedExchange === exchange.id
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/50'
                    }`}
                    onClick={() => setSelectedExchange(exchange.id)}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">B</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{exchange.name}</h4>
                          <p className="text-sm text-gray-400">World's largest cryptocurrency exchange</p>
                        </div>
                      </div>
                    </div>

                    {selectedExchange === exchange.id && (
                      <div className="ml-4 space-y-2">
                        <p className="text-sm font-medium text-gray-300">Select Region:</p>
                        {exchange.regions.map((region) => (
                          <div
                            key={region.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedRegion === region.id
                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30'
                            }`}
                            onClick={() => setSelectedRegion(region.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-white font-medium">{region.name}</span>
                                {region.recommended && (
                                  <span className="ml-2 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              {selectedRegion === region.id && (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Whitelist IPs */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Whitelist IP Addresses</h3>
                <p className="text-gray-400">Add these IP addresses to your Binance API whitelist for secure access</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-300 mb-1">Security Notice</h4>
                    <p className="text-blue-200 text-sm">
                      IP whitelisting ensures only our servers can access your API. This is a critical security measure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Egress IP Addresses:</h4>
                {egressIPs.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="font-mono text-white">{ip.ip}</span>
                      <span className="text-xs text-gray-400">({ip.region})</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(ip.ip)}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      {copiedIP === ip.ip ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-300 mb-2">How to whitelist IPs on Binance:</h4>
                    <ol className="text-yellow-200 text-sm space-y-1 list-decimal list-inside">
                      <li>Go to Binance API Management</li>
                      <li>Select your API key</li>
                      <li>Click "Edit restrictions"</li>
                      <li>Add each IP address above</li>
                      <li>Save changes</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="ip-whitelisted"
                  checked={ipWhitelisted}
                  onChange={(e) => setIpWhitelisted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="ip-whitelisted" className="text-white font-medium">
                  I have whitelisted all IP addresses on Binance
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Enter Keys */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Enter API Credentials</h3>
                <p className="text-gray-400">Provide your Binance API key and secret for secure connection</p>
              </div>

              {clockData && (
                <div className={`border rounded-xl p-4 ${
                  Math.abs(clockData.drift_ms) > 1000 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : 'bg-green-500/10 border-green-500/20'
                }`}>
                  <div className="flex items-start space-x-3">
                    <Clock className={`w-5 h-5 mt-0.5 ${
                      Math.abs(clockData.drift_ms) > 1000 ? 'text-red-400' : 'text-green-400'
                    }`} />
                    <div>
                      <h4 className={`font-medium mb-1 ${
                        Math.abs(clockData.drift_ms) > 1000 ? 'text-red-300' : 'text-green-300'
                      }`}>
                        System Clock Status
                      </h4>
                      <p className={`text-sm ${
                        Math.abs(clockData.drift_ms) > 1000 ? 'text-red-200' : 'text-green-200'
                      }`}>
                        {clockData.drift_hint}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Connection Name</label>
                  <input
                    type="text"
                    value={connectionName}
                    onChange={(e) => setConnectionName(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="My Binance Account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none font-mono"
                    placeholder="Enter your Binance API key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">API Secret</label>
                  <input
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none font-mono"
                    placeholder="Enter your Binance API secret"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Dry Run Mode</h4>
                    <p className="text-sm text-gray-400">Test without executing real trades</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Key className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-300 mb-1">API Security</h4>
                    <p className="text-gray-400 text-sm">
                      Your API credentials are encrypted at rest and never logged. We only execute trades from whitelisted IP addresses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Test Connection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Test Connection</h3>
                <p className="text-gray-400">Verify your API configuration is working correctly</p>
              </div>

              {createdConnection && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">B</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{createdConnection.name}</h4>
                      <p className="text-sm text-gray-400">
                        {selectedExchange} • {selectedRegion.toUpperCase()} • {dryRun ? 'Dry Run' : 'Live Trading'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!testResult ? (
                <div className="text-center py-8">
                  <TestTube className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">Ready to Test</h4>
                  <p className="text-gray-400 mb-6">Click the button below to verify your connection</p>
                  <button
                    onClick={handleTestConnection}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Testing Connection...</span>
                      </div>
                    ) : (
                      'Test Connection'
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`border rounded-xl p-4 ${
                    testResult.status === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {testResult.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                      )}
                      <div>
                        <h4 className={`font-medium mb-1 ${
                          testResult.status === 'success' ? 'text-emerald-300' : 'text-red-300'
                        }`}>
                          {testResult.status === 'success' ? 'Connection Successful' : 'Connection Failed'}
                        </h4>
                        <p className={`text-sm ${
                          testResult.status === 'success' ? 'text-emerald-200' : 'text-red-200'
                        }`}>
                          {testResult.message}
                        </p>
                        {testResult.code && (
                          <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-300 font-mono">Error Code: {testResult.code}</p>
                            <p className="text-xs text-gray-400 mt-1">{getErrorHint(testResult.code)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {testResult.status === 'error' && (
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setTestResult(null);
                          handleTestConnection();
                        }}
                        disabled={loading}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Retry Test
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Done */}
          {currentStep === 5 && createdConnection && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Connection Ready!</h3>
                <p className="text-gray-400">Your exchange connection has been successfully configured</p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">B</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{createdConnection.name}</h4>
                    <p className="text-gray-400">
                      {selectedExchange} • {selectedRegion.toUpperCase()} • {dryRun ? 'Dry Run Mode' : 'Live Trading'}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30">
                      Connected
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <Wifi className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-white">Status</div>
                    <div className="text-xs text-emerald-400">Active</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <div className="text-sm font-medium text-white">Latency</div>
                    <div className="text-xs text-blue-400">~50ms</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-3 rounded-lg font-medium transition-colors">
                    <TestTube className="w-4 h-4" />
                    <span>Test Again</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 px-4 py-3 rounded-lg font-medium transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Configure</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-4 py-3 rounded-lg font-medium transition-colors">
                    <BarChart3 className="w-4 h-4" />
                    <span>View Portfolio</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-3 rounded-lg font-medium transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Revoke</span>
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleClose}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 px-8 py-3 rounded-lg font-medium transition-all"
                >
                  Continue to Dashboard
                </button>
                
                <button
                  onClick={handleTestAgain}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4" />
                      <span>Test Again</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700/50 bg-gray-800/30 flex-shrink-0">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-sm text-gray-400 font-medium">
            Step {currentStep} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all text-white ${
              !canProceed() || loading
                ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 hover:scale-105'
            }`}
          >
            <span>
              {currentStep === 3 ? 'Create Connection' : 
               currentStep === 4 ? 'Test Connection' : 
               currentStep === 5 ? 'Finish' : 'Next'}
            </span>
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectExchangeModal;
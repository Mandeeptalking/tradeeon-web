import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Play, Pause, Bot, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewCapitalManagement from '../components/NewCapitalManagement';
import NewOrderAndDCAManagement from '../components/NewOrderAndDCAManagement';
import NewRiskManagement from '../components/NewRiskManagement';
import NewTradeManagement from '../components/NewTradeManagement';
import SymbolPicker from '../components/SymbolPicker';
import EntryRulesV2Panel from '../components/entry/EntryRulesV2Panel';
import ExchangeSelect from '../components/ExchangeSelect';
import CompoundingTableModal from '../components/CompoundingTableModal';
import DeploymentPlanModal from '../components/DeploymentPlanModal';
import { useBinanceMiniTickerWS } from '../hooks/useBinanceMiniTickerWS';
import { EntryRulesV2 } from '../types/entry';

interface BotForm {
  // Basic Details
  name: string;
  market: "Indian Equity" | "Crypto" | "US Stocks";
  type: "Spot" | "Futures";
  direction?: "Long" | "Short";
  status: 'draft' | 'active' | 'paused';
  
  // Exchange (for Crypto)
  exchangeId: string | null;
  exchange: "binance" | "binanceus" | "binance_testnet" | null;
  region: "COM" | "US" | "TESTNET" | null;
  
  // Symbols & Entry
  symbols: string[];
  entry: EntryRulesV2;
  
  // Capital Management
  capital: {
    capital: number;
    currency: 'INR' | 'USD' | 'EUR' | 'AUD' | 'GBP' | 'AED';
    stepMode: 'percent' | 'fixed';
    stepPercent: number;
    stepFixed: number;
    deployPlan: string;
    reinvestEnabled: boolean;
    reinvestPercent: number;
    dcaEnabled: boolean;
    maxPositions: number;
  };
  
  // Order & DCA Management
  orderDca: {
    orderType: 'amo' | 'market';
    takeProfitPercent: number;
    dcaEnabled: boolean;
    dcaConditions: 'lastEntry' | 'averagePrice' | 'positionLoss';
    dcaPercentage: number;
    dcaAmountType: 'ratio' | 'fixed' | 'multiplier';
    dcaFixedAmount: number;
    dcaMultiplier: number;
    tradingIndex: 'NIFTY50' | 'NEXT50' | 'NIFTY250';
    maxDcaOrders: number;
    dcaPerPosition: number;
  };
  
  // Risk Management
  risk: {
    stopLossPercent: number;
    stopLossEnabled: boolean;
    lifetimeMode: string;
    recoveryDrip: boolean;
    timeBasedExit: boolean;
    maxDrawdownStop: boolean;
    rangeExit: boolean;
    recoveryDripDays: number;
    recoveryDripMonths: number;
    timeBasedExitDays: number;
    timeBasedExitMonths: number;
    maxDrawdownPercent: number;
    rangeExitDays: number;
    rangeExitMonths: number;
    rangeLowerPercent: number;
    rangeUpperPercent: number;
    riskFeaturePriorities: {
      recoveryDrip: number;
      timeBasedExit: number;
      maxDrawdownStop: number;
      rangeExit: number;
    };
  };
  
  // Trade Management
  tradeMgmt: {
    maxNewPositionsPerDay: number;
    maxDcaExecutionsPerDay: number;
    dcaNewEntrySameDay: boolean;
    maxDcaPerStockPerWeek: number;
    reEntryCooldownDays: number;
    reEntryCooldownEnabled: boolean;
    maxOpenPositions: number;
    dcaPriorityLogic: {
      highestDrawdown: boolean;
      longestTimeSinceLastDca: boolean;
      oldestPosition: boolean;
    };
  };
}

const NewBotPage = () => {
  const [form, setForm] = useState<BotForm>({
    // Basic Details
    name: 'My Trading Bot',
    market: 'Indian Equity',
    type: 'Spot',
    direction: 'Long',
    status: 'draft',
    
    // Exchange
    exchangeId: null,
    exchange: null,
    region: null,
    
    // Symbols & Entry
    symbols: [],
    entry: {
      mainTriggers: [
        {
          id: "trigger-1",
          kind: "indicator",
          timeframe: "15m",
          left: {
            name: "RSI",
            component: "line",
            settings: { length: 14 }
          },
          op: "crossesAbove",
          right: { type: "value", value: 30 },
          sequence: 1,
          staysValidFor: { amount: 5, unit: "bars" }
        },
        null
      ],
      supporting: {
        setA: {
          id: "setA",
          logic: "AND",
          conditions: []
        }
      },
      triggerTiming: "onBarClose",
      cooldownBars: 5,
      timeWindow: {
        enabled: false,
        start: "09:15",
        end: "15:30",
        timezone: "Asia/Kolkata"
      },
      resetIfStale: true,
      notes: ""
    },
    
    // Capital Management
    capital: {
      capital: 100000,
      currency: 'INR',
      stepMode: 'percent',
      stepPercent: 10,
      stepFixed: 10000,
      deployPlan: 'Safest: 10%/10%/10%/10%/50%',
      reinvestEnabled: true,
      reinvestPercent: 98,
      dcaEnabled: true,
      maxPositions: 50
    },
    
    // Order & DCA Management
    orderDca: {
      orderType: 'amo',
      takeProfitPercent: 6.28,
      dcaEnabled: true,
      dcaConditions: 'lastEntry',
      dcaPercentage: 5,
      dcaAmountType: 'ratio',
      dcaFixedAmount: 10000,
      dcaMultiplier: 1.0,
      tradingIndex: 'NIFTY50',
      maxDcaOrders: 10,
      dcaPerPosition: 10
    },
    
    // Risk Management
    risk: {
      stopLossPercent: 50,
      stopLossEnabled: false,
      lifetimeMode: 'After Full Deploy',
      recoveryDrip: true,
      timeBasedExit: true,
      maxDrawdownStop: true,
      rangeExit: false,
      recoveryDripDays: 30,
      recoveryDripMonths: 15,
      timeBasedExitDays: 0,
      timeBasedExitMonths: 12,
      maxDrawdownPercent: 50,
      rangeExitDays: 0,
      rangeExitMonths: 6,
      rangeLowerPercent: -10,
      rangeUpperPercent: 10,
      riskFeaturePriorities: {
        recoveryDrip: 1,
        timeBasedExit: 2,
        maxDrawdownStop: 3,
        rangeExit: 4
      }
    },
    
    // Trade Management
    tradeMgmt: {
      maxNewPositionsPerDay: 1,
      maxDcaExecutionsPerDay: 1,
      dcaNewEntrySameDay: false,
      maxDcaPerStockPerWeek: 1,
      reEntryCooldownDays: 30,
      reEntryCooldownEnabled: false,
      maxOpenPositions: 50,
      dcaPriorityLogic: {
        highestDrawdown: true,
        longestTimeSinceLastDca: false,
        oldestPosition: false
      }
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCompoundingTable, setShowCompoundingTable] = useState(false);
  const [showDeploymentPlan, setShowDeploymentPlan] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // WebSocket price data for crypto symbols
  const prices = useBinanceMiniTickerWS(
    form.market === 'Crypto' ? form.symbols : [],
    form.region || 'COM'
  );

  // Mock user data
  const user = { isPro: false };

  // Update entry rules when type/direction changes
  useEffect(() => {
    if (form.type === 'Futures' && form.direction === 'Short') {
      // Auto-adjust for Short direction
      setForm(prev => ({
        ...prev,
        entry: prev.entry.mainTriggers[0] && prev.entry.mainTriggers[0].left.name === 'RSI' ? {
          ...prev.entry,
          mainTriggers: [
            prev.entry.mainTriggers[0] ? {
              ...prev.entry.mainTriggers[0],
              op: 'crossesBelow',
              right: { type: 'value', value: 70 }
            } : null,
            prev.entry.mainTriggers[1]
          ]
        } : prev.entry
      }));
    } else {
      // Default for Long or Spot
      setForm(prev => ({
        ...prev,
        entry: prev.entry.mainTriggers[0] && prev.entry.mainTriggers[0].left.name === 'RSI' ? {
          ...prev.entry,
          mainTriggers: [
            prev.entry.mainTriggers[0] ? {
              ...prev.entry.mainTriggers[0],
              op: 'crossesAbove',
              right: { type: 'value', value: 30 }
            } : null,
            prev.entry.mainTriggers[1]
          ]
        } : prev.entry
      }));
    }
  }, [form.type, form.direction]);

  // Validation
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!form.name.trim()) {
      errors.push('Bot name is required');
    }
    
    if (form.market === 'Crypto' && !form.exchangeId) {
      errors.push('Exchange connection is required for crypto trading');
    }
    
    if (form.symbols.length === 0) {
      errors.push('At least one symbol is required');
    }
    
    // Update validation for v2 entry rules
    const activeTriggers = form.entry.mainTriggers.filter(t => t !== null);
    if (activeTriggers.length === 0) {
      errors.push('At least one main trigger is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      // Scroll to first error
      if (form.symbols.length === 0) {
        document.getElementById('symbols-section')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setIsSaving(true);
    try {
      // Prepare payload
      const payload = {
        name: form.name,
        market: form.market,
        type: form.type,
        direction: form.type === 'Futures' ? form.direction : undefined,
        exchange: form.exchangeId ? {
          id: form.exchangeId,
          provider: form.exchange,
          region: form.region
        } : undefined,
        symbols: form.symbols,
        entry: form.entry,
        capital: form.capital,
        orderDca: form.orderDca,
        risk: form.risk,
        tradeMgmt: form.tradeMgmt
      };
      
      console.log('Saving bot configuration:', payload);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/bots', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving bot configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBot = () => {
    setForm(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'paused' : 'active'
    }));
    setHasUnsavedChanges(true);
  };

  const formatCurrency = (amount: number) => {
    const symbol = form.capital.currency === 'INR' ? '₹' : '$';
    if (amount >= 10000000) {
      return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `${symbol}${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    } else {
      return `${symbol}${amount.toFixed(0)}`;
    }
  };

  const stepSizeAmount = form.capital.stepMode === 'percent' 
    ? (form.capital.stepPercent / 100) * form.capital.capital
    : form.capital.stepFixed;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard/bots">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Create Trading Bot</h1>
                  <p className="text-gray-600 text-sm mt-1">Configure your automated trading strategy</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-2 text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span>Unsaved changes</span>
                </div>
              )}
              
              {validationErrors.length > 0 && (
                <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50 px-2 py-1 rounded-md border border-red-200">
                  <AlertCircle className="w-3 h-3" />
                  <span>{validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}</span>
                </div>
              )}
              
              <button
                onClick={handleToggleBot}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center space-x-2 shadow-sm text-sm ${
                  form.status === 'active' 
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300' 
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300 hover:scale-105'
                }`}
              >
                {form.status === 'active' ? (
                  <>
                    <Pause className="w-3 h-3" />
                    <span>Pause Bot</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>Start Bot</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving || validationErrors.length > 0}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center space-x-2 shadow-sm text-sm ${
                  isSaving || validationErrors.length > 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    <span>Save & Deploy</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => window.open('/dashboard/bots/workspace', '_blank')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 text-white"
              >
                🚀 Live Chart Workspace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Basic Details - Full Width */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Basic Details</h2>
                <p className="text-gray-600 text-xs">Configure your bot's fundamental settings</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bot Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Bot Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, name: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter bot name..."
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">Give your bot a memorable name</p>
              </div>

              {/* Market */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Market</label>
                <select
                  value={form.market}
                  onChange={(e) => {
                    const market = e.target.value as "Indian Equity" | "Crypto" | "US Stocks";
                    setForm(prev => ({ 
                      ...prev, 
                      market,
                      // Reset exchange when market changes
                      exchangeId: null,
                      exchange: null,
                      region: null,
                      symbols: []
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Indian Equity">Indian Equity</option>
                  <option value="Crypto">Cryptocurrency</option>
                  <option value="US Stocks">US Stocks</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">Choose your trading market</p>
              </div>

              {/* Exchange Select - Only for Crypto */}
              {form.market === 'Crypto' && (
                <ExchangeSelect
                  value={{
                    exchangeId: form.exchangeId,
                    exchange: form.exchange,
                    region: form.region
                  }}
                  onChange={(selection) => {
                    setForm(prev => ({ 
                      ...prev, 
                      exchangeId: selection.exchangeId,
                      exchange: selection.exchange,
                      region: selection.region,
                      symbols: [] // Reset symbols when exchange changes
                    }));
                    setHasUnsavedChanges(true);
                  }}
                  market={form.market}
                />
              )}

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, type: e.target.value as "Spot" | "Futures" }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Spot">Spot Trading</option>
                  <option value="Futures">Futures Trading</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">Trading instrument type</p>
              </div>

              {/* Direction - Only for Futures */}
              {form.type === 'Futures' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Direction</label>
                  <select
                    value={form.direction}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, direction: e.target.value as "Long" | "Short" }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full h-9 px-3 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Long">Long (Buy)</option>
                    <option value="Short">Short (Sell)</option>
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">Trading direction</p>
                </div>
              )}
            </div>
          </div>

          {/* Symbols & Universe - Full Width */}
          <div className="space-y-6">
            <div id="symbols-section">
              <SymbolPicker
                market={form.market}
                exchangeId={form.market === 'Crypto' ? form.exchangeId : undefined}
                quote={form.market === 'Crypto' ? 'USDT' : form.market === 'Indian Equity' ? 'INR' : 'USD'}
                type="spot"
                value={form.symbols}
                onChange={(symbols) => {
                  setForm(prev => ({ ...prev, symbols }));
                  setHasUnsavedChanges(true);
                }}
                freeLimit={3}
                isPro={user.isPro}
                onPriceData={(priceData) => {
                  // Store price data for use in other components
                  console.log('Live price data:', priceData);
                }}
              />
            </div>

            {/* Entry Conditions - Full Width */}
            <div>
              <EntryRulesV2Panel
                value={form.entry}
                onChange={(entry) => {
                  setForm(prev => ({ ...prev, entry }));
                  setHasUnsavedChanges(true);
                }}
              />
            </div>
          </div>

          {/* Management Sections - 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Capital Management */}
              <NewCapitalManagement
                value={form.capital}
                onChange={(capital) => {
                  setForm(prev => ({ ...prev, capital }));
                  setHasUnsavedChanges(true);
                }}
                onOpenCompounding={() => setShowCompoundingTable(true)}
                onOpenDeployment={() => setShowDeploymentPlan(true)}
              />

              {/* Order & DCA Management */}
              <NewOrderAndDCAManagement
                value={form.orderDca}
                onChange={(orderDca) => {
                  setForm(prev => ({ ...prev, orderDca }));
                  setHasUnsavedChanges(true);
                }}
                deployCapital={form.capital.deployPlan}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Risk Management */}
              <NewRiskManagement
                value={form.risk}
                onChange={(risk) => {
                  setForm(prev => ({ ...prev, risk }));
                  setHasUnsavedChanges(true);
                }}
              />

              {/* Trade Management */}
              <NewTradeManagement
                value={form.tradeMgmt}
                onChange={(tradeMgmt) => {
                  setForm(prev => ({ ...prev, tradeMgmt }));
                  setHasUnsavedChanges(true);
                }}
              />
            </div>
          </div>

          {/* Bot Summary - Bottom */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Bot Summary</h2>
                <p className="text-gray-600 text-xs">Configuration overview and validation</p>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-1">Please fix these issues:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bot Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Bot Info</span>
                </div>
                <div className="space-y-1 text-xs text-blue-700">
                  <div><strong>Name:</strong> {form.name || 'Unnamed Bot'}</div>
                  <div><strong>Market:</strong> {form.market}</div>
                  <div><strong>Type:</strong> {form.type}</div>
                  {form.type === 'Futures' && (
                    <div><strong>Direction:</strong> {form.direction}</div>
                  )}
                  {form.market === 'Crypto' && form.exchange && (
                    <div><strong>Exchange:</strong> {form.exchange} ({form.region})</div>
                  )}
                </div>
              </div>

              {/* Symbols Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Symbols</span>
                </div>
                <div className="space-y-1 text-xs text-emerald-700">
                  <div><strong>Count:</strong> {form.symbols.length}</div>
                  <div><strong>Symbols:</strong> {form.symbols.length > 0 ? form.symbols.slice(0, 3).join(', ') + (form.symbols.length > 3 ? '...' : '') : 'None selected'}</div>
                  <div><strong>Entry Rules:</strong> {form.entry.mainTriggers.filter(t => t !== null).length + ((form.entry.supporting.setA?.conditions.length || 0) + (form.entry.supporting.setB?.conditions.length || 0))}</div>
                </div>
              </div>

              {/* Capital Card */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-orange-800">Capital</span>
                </div>
                <div className="space-y-1 text-xs text-orange-700">
                  <div><strong>Total:</strong> {formatCurrency(form.capital.capital)}</div>
                  <div><strong>Step Size:</strong> {formatCurrency(stepSizeAmount)}</div>
                  <div><strong>Take Profit:</strong> {form.orderDca.takeProfitPercent}%</div>
                  <div><strong>Reinvest:</strong> {form.capital.reinvestEnabled ? `${form.capital.reinvestPercent}%` : 'Disabled'}</div>
                </div>
              </div>

              {/* Trade Limits Card */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-purple-800">Trade Limits</span>
                </div>
                <div className="space-y-1 text-xs text-purple-700">
                  <div><strong>New/Day:</strong> {form.tradeMgmt.maxNewPositionsPerDay}</div>
                  <div><strong>DCA/Day:</strong> {form.tradeMgmt.maxDcaExecutionsPerDay}</div>
                  <div><strong>Max Positions:</strong> {form.tradeMgmt.maxOpenPositions}</div>
                  <div><strong>Same Day DCA:</strong> {form.tradeMgmt.dcaNewEntrySameDay ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CompoundingTableModal
        isOpen={showCompoundingTable}
        onClose={() => setShowCompoundingTable(false)}
        startingCapital={form.capital.capital}
        stepSizePercentage={form.capital.stepPercent}
        takeProfitPercent={form.orderDca.takeProfitPercent}
        reinvestMode={form.capital.reinvestPercent}
        botName={form.name}
      />

      <DeploymentPlanModal
        isOpen={showDeploymentPlan}
        onClose={() => setShowDeploymentPlan(false)}
        deployCapital={form.capital.deployPlan}
        startingCapital={form.capital.capital}
        stepSizePercentage={form.capital.stepPercent}
        takeProfitPercent={form.orderDca.takeProfitPercent}
        botName={form.name}
      />
    </div>
  );
};

export default NewBotPage;
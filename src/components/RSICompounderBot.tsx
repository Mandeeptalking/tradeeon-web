import React, { useState } from 'react';
import { Bot, Play, Pause, Settings, Save, ArrowLeft, TrendingUp, Activity, DollarSign, Target } from 'lucide-react';
import CapitalManagement from './CapitalManagement';
import OrderAndDCAManagement from './OrderAndDCAManagement';
import RiskManagement from './RiskManagement';
import TradeManagement from './TradeManagement';

interface RSICompounderBotProps {
  onBack?: () => void;
  onSave?: (botConfig: any) => void;
  initialConfig?: any;
}

interface BotTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  config: Partial<BotConfig>;
}

interface BotConfig {
  // Bot Info
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused';
  
  // Capital Management
  startingCapital: number;
  stepSizePercentage: number;
  reinvestMode: number;
  deployCapital: string;
  dcaEnabled: boolean;
  
  // Order & DCA Management
  orderType: string;
  takeProfitPercent: number;
  dcaConditions: string;
  dcaPercentage: number;
  tradingIndex: string;
  dcaAmountType: string;
  dcaFixedAmount: number;
  dcaMultiplier: number;
  dcaOrdersCount: number;
  dcaPerPosition: number;
  
  // Risk Management
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
  
  // Trade Management
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
}

const RSICompounderBot: React.FC<RSICompounderBotProps> = ({
  onBack,
  onSave,
  initialConfig
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('rsi_compounder');
  const [botConfig, setBotConfig] = useState<BotConfig>({
    // Bot Info
    name: initialConfig?.name || 'RSI Compounder Bot',
    description: initialConfig?.description || 'Advanced RSI-based compounding strategy for Indian equity markets',
    status: initialConfig?.status || 'draft',
    
    // Capital Management
    startingCapital: initialConfig?.startingCapital || 100000,
    stepSizePercentage: initialConfig?.stepSizePercentage || 10,
    reinvestMode: initialConfig?.reinvestMode || 98,
    deployCapital: initialConfig?.deployCapital || 'Safest: 10%/10%/10%/10%/50%',
    dcaEnabled: initialConfig?.dcaEnabled ?? true,
    
    // Order & DCA Management
    orderType: initialConfig?.orderType || 'AMO Order',
    takeProfitPercent: initialConfig?.takeProfitPercent || 6.28,
    dcaConditions: initialConfig?.dcaConditions || 'From Last Entry',
    dcaPercentage: initialConfig?.dcaPercentage || 5,
    tradingIndex: initialConfig?.tradingIndex || 'Nifty 50 Stocks',
    dcaAmountType: initialConfig?.dcaAmountType || 'ratio',
    dcaFixedAmount: initialConfig?.dcaFixedAmount || 10000,
    dcaMultiplier: initialConfig?.dcaMultiplier || 1.0,
    dcaOrdersCount: initialConfig?.dcaOrdersCount || 10,
    dcaPerPosition: initialConfig?.dcaPerPosition || 10,
    
    // Risk Management
    stopLossPercent: initialConfig?.stopLossPercent || 50,
    stopLossEnabled: initialConfig?.stopLossEnabled ?? false,
    lifetimeMode: initialConfig?.lifetimeMode || 'After Full Deploy',
    recoveryDrip: initialConfig?.recoveryDrip ?? true,
    timeBasedExit: initialConfig?.timeBasedExit ?? true,
    maxDrawdownStop: initialConfig?.maxDrawdownStop ?? true,
    rangeExit: initialConfig?.rangeExit ?? false,
    recoveryDripDays: initialConfig?.recoveryDripDays || 30,
    recoveryDripMonths: initialConfig?.recoveryDripMonths || 15,
    timeBasedExitDays: initialConfig?.timeBasedExitDays || 0,
    timeBasedExitMonths: initialConfig?.timeBasedExitMonths || 12,
    maxDrawdownPercent: initialConfig?.maxDrawdownPercent || 50,
    rangeExitDays: initialConfig?.rangeExitDays || 0,
    rangeExitMonths: initialConfig?.rangeExitMonths || 6,
    rangeLowerPercent: initialConfig?.rangeLowerPercent || -10,
    rangeUpperPercent: initialConfig?.rangeUpperPercent || 10,
    riskFeaturePriorities: initialConfig?.riskFeaturePriorities || {
      recoveryDrip: 1,
      timeBasedExit: 2,
      maxDrawdownStop: 3,
      rangeExit: 4
    },
    
    // Trade Management
    maxNewPositionsPerDay: initialConfig?.maxNewPositionsPerDay || 1,
    maxDcaExecutionsPerDay: initialConfig?.maxDcaExecutionsPerDay || 1,
    dcaNewEntrySameDay: initialConfig?.dcaNewEntrySameDay ?? false,
    maxDcaPerStockPerWeek: initialConfig?.maxDcaPerStockPerWeek || 1,
    reEntryCooldownDays: initialConfig?.reEntryCooldownDays || 30,
    reEntryCooldownEnabled: initialConfig?.reEntryCooldownEnabled ?? false,
    maxOpenPositions: initialConfig?.maxOpenPositions || 50,
    dcaPriorityLogic: initialConfig?.dcaPriorityLogic || {
      highestDrawdown: true,
      longestTimeSinceLastDca: false,
      oldestPosition: false
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const templates: BotTemplate[] = [
    {
      id: 'rsi_compounder',
      name: 'RSI Compounder',
      description: 'Advanced RSI-based compounding strategy for Indian equity markets with intelligent capital deployment',
      icon: '🤖',
      color: 'from-purple-500 to-pink-500',
      config: {
        startingCapital: 100000,
        stepSizePercentage: 10,
        reinvestMode: 98,
        deployCapital: 'Safest: 10%/10%/10%/10%/50%',
        dcaEnabled: true,
        orderType: 'AMO Order',
        takeProfitPercent: 6.28,
        dcaConditions: 'From Last Entry',
        dcaPercentage: 5,
        tradingIndex: 'Nifty 50 Stocks',
        dcaAmountType: 'ratio',
        stopLossEnabled: false,
        recoveryDrip: true,
        timeBasedExit: true,
        maxDrawdownStop: true,
        rangeExit: false,
        maxNewPositionsPerDay: 1,
        maxDcaExecutionsPerDay: 1,
        dcaNewEntrySameDay: false,
        maxOpenPositions: 50
      }
    },
    {
      id: 'dca_bot',
      name: 'DCA Bot',
      description: 'Dollar Cost Averaging strategy that buys at regular intervals to reduce market timing risk',
      icon: '📈',
      color: 'from-emerald-500 to-green-500',
      config: {
        startingCapital: 50000,
        stepSizePercentage: 20,
        reinvestMode: 50,
        deployCapital: 'Equal: 25%/25%/25%/25%',
        dcaEnabled: true,
        orderType: 'Market Order',
        takeProfitPercent: 10,
        dcaConditions: 'From Average Price',
        dcaPercentage: 3,
        tradingIndex: 'Nifty 50 Stocks',
        dcaAmountType: 'fixed',
        dcaFixedAmount: 10000,
        stopLossEnabled: false,
        recoveryDrip: false,
        timeBasedExit: true,
        maxDrawdownStop: false,
        rangeExit: false,
        maxNewPositionsPerDay: 2,
        maxDcaExecutionsPerDay: 3,
        dcaNewEntrySameDay: true,
        maxOpenPositions: 20
      }
    },
    {
      id: 'arbitrage_bot',
      name: 'Arbitrage Bot',
      description: 'Exploits price differences across exchanges for risk-free profits with high-frequency execution',
      icon: '⚡',
      color: 'from-blue-500 to-cyan-500',
      config: {
        startingCapital: 200000,
        stepSizePercentage: 5,
        reinvestMode: 100,
        deployCapital: 'Aggressive: 40%/30%/20%/10%',
        dcaEnabled: false,
        orderType: 'Market Order',
        takeProfitPercent: 2,
        dcaConditions: 'Position Loss',
        dcaPercentage: 1,
        tradingIndex: 'Nifty 250',
        dcaAmountType: 'multiplier',
        dcaMultiplier: 0.5,
        stopLossEnabled: true,
        stopLossPercent: 10,
        recoveryDrip: false,
        timeBasedExit: false,
        maxDrawdownStop: true,
        maxDrawdownPercent: 15,
        rangeExit: false,
        maxNewPositionsPerDay: 10,
        maxDcaExecutionsPerDay: 5,
        dcaNewEntrySameDay: true,
        maxOpenPositions: 100
      }
    },
    {
      id: 'blank_bot',
      name: 'Blank Bot',
      description: 'Start from scratch and build your own custom trading strategy with full control over all parameters',
      icon: '📝',
      color: 'from-gray-500 to-gray-600',
      config: {
        startingCapital: 100000,
        stepSizePercentage: 10,
        reinvestMode: 50,
        deployCapital: 'Equal: 25%/25%/25%/25%',
        dcaEnabled: true,
        orderType: 'AMO Order',
        takeProfitPercent: 5,
        dcaConditions: 'From Last Entry',
        dcaPercentage: 5,
        tradingIndex: 'Nifty 50 Stocks',
        dcaAmountType: 'ratio',
        stopLossEnabled: false,
        recoveryDrip: false,
        timeBasedExit: false,
        maxDrawdownStop: false,
        rangeExit: false,
        maxNewPositionsPerDay: 1,
        maxDcaExecutionsPerDay: 1,
        dcaNewEntrySameDay: false,
        maxOpenPositions: 50
      }
    }
  ];

  const handleCapitalUpdate = (settings: any) => {
    setBotConfig(prev => ({ ...prev, ...settings }));
    setHasUnsavedChanges(true);
  };

  const handleOrderUpdate = (settings: any) => {
    setBotConfig(prev => ({ ...prev, ...settings }));
    setHasUnsavedChanges(true);
  };

  const handleRiskUpdate = (settings: any) => {
    setBotConfig(prev => ({ ...prev, ...settings }));
    setHasUnsavedChanges(true);
  };

  const handleTradeUpdate = (settings: any) => {
    setBotConfig(prev => ({ ...prev, ...settings }));
    setHasUnsavedChanges(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setBotConfig(prev => ({
        ...prev,
        ...template.config,
        name: prev.name // Keep the user's custom name
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSave) {
        onSave(botConfig);
      }
      
      setHasUnsavedChanges(false);
      console.log('Bot configuration saved:', botConfig);
    } catch (error) {
      console.error('Error saving bot configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBot = () => {
    setBotConfig(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'paused' : 'active'
    }));
    setHasUnsavedChanges(true);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${amount.toFixed(0)}`;
    }
  };

  const stepSizeAmount = (botConfig.stepSizePercentage / 100) * botConfig.startingCapital;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Create Your Bot
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">Choose a template or build your own strategy</p>
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
              
              <button
                onClick={handleToggleBot}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center space-x-2 shadow-sm text-sm ${
                  botConfig.status === 'active' 
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300' 
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300 hover:scale-105'
                }`}
              >
                {botConfig.status === 'active' ? (
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
                disabled={isSaving || !hasUnsavedChanges}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center space-x-2 shadow-sm text-sm ${
                  isSaving || !hasUnsavedChanges
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
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-4">
            {/* Template Selection */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Choose Template</h2>
                  <p className="text-gray-600 text-xs">Select a pre-configured strategy or start from scratch</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Radio Button */}
                    <div className="absolute top-2 right-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedTemplate === template.id && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* Template Icon */}
                    <div className={`w-8 h-8 bg-gradient-to-r ${template.color} rounded-md flex items-center justify-center text-lg mb-2`}>
                      {template.icon}
                    </div>
                    
                    {/* Template Info */}
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-gray-600 text-xs leading-relaxed">{template.description}</p>
                    
                    {/* Selected Indicator */}
                    {selectedTemplate === template.id && (
                      <div className="absolute inset-0 bg-blue-500/5 rounded-lg pointer-events-none"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bot Name Input */}
            <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Bot Details</h2>
                  <p className="text-gray-600 text-xs">Customize your bot's name and basic settings</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
                  <input
                    type="text"
                    value={botConfig.name}
                    onChange={(e) => {
                      setBotConfig(prev => ({ ...prev, name: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Enter your bot name..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-gray-500 text-xs mt-1">Give your bot a memorable name</p>
                </div>
              </div>
            </div>

            {/* Capital Management */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <CapitalManagement
                startingCapital={botConfig.startingCapital}
                stepSizePercentage={botConfig.stepSizePercentage}
                reinvestMode={botConfig.reinvestMode}
                takeProfitPercent={botConfig.takeProfitPercent}
                botName={botConfig.name}
                deployCapital={botConfig.deployCapital}
                dcaEnabled={botConfig.dcaEnabled}
                onUpdateSettings={handleCapitalUpdate}
                botType="RSI Compounder"
              />
            </div>

            {/* Order & DCA Management */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <OrderAndDCAManagement
                orderType={botConfig.orderType}
                takeProfitPercent={botConfig.takeProfitPercent}
                dcaConditions={botConfig.dcaConditions}
                dcaPercentage={botConfig.dcaPercentage}
                tradingIndex={botConfig.tradingIndex}
                dcaAmountType={botConfig.dcaAmountType}
                dcaFixedAmount={botConfig.dcaFixedAmount}
                dcaMultiplier={botConfig.dcaMultiplier}
                dcaOrdersCount={botConfig.dcaOrdersCount}
                dcaPerPosition={botConfig.dcaPerPosition}
                deployCapital={botConfig.deployCapital}
                dcaEnabled={botConfig.dcaEnabled}
                onUpdateSettings={handleOrderUpdate}
                botType="RSI Compounder"
              />
            </div>

            {/* Risk Management */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <RiskManagement
                stopLossPercent={botConfig.stopLossPercent}
                stopLossEnabled={botConfig.stopLossEnabled}
                lifetimeMode={botConfig.lifetimeMode}
                recoveryDrip={botConfig.recoveryDrip}
                timeBasedExit={botConfig.timeBasedExit}
                maxDrawdownStop={botConfig.maxDrawdownStop}
                rangeExit={botConfig.rangeExit}
                recoveryDripDays={botConfig.recoveryDripDays}
                recoveryDripMonths={botConfig.recoveryDripMonths}
                timeBasedExitDays={botConfig.timeBasedExitDays}
                timeBasedExitMonths={botConfig.timeBasedExitMonths}
                maxDrawdownPercent={botConfig.maxDrawdownPercent}
                rangeExitDays={botConfig.rangeExitDays}
                rangeExitMonths={botConfig.rangeExitMonths}
                rangeLowerPercent={botConfig.rangeLowerPercent}
                rangeUpperPercent={botConfig.rangeUpperPercent}
                riskFeaturePriorities={botConfig.riskFeaturePriorities}
                onUpdateSettings={handleRiskUpdate}
                botType="RSI Compounder"
              />
            </div>

            {/* Trade Management */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <TradeManagement
                maxNewPositionsPerDay={botConfig.maxNewPositionsPerDay}
                maxDcaExecutionsPerDay={botConfig.maxDcaExecutionsPerDay}
                dcaNewEntrySameDay={botConfig.dcaNewEntrySameDay}
                maxDcaPerStockPerWeek={botConfig.maxDcaPerStockPerWeek}
                reEntryCooldownDays={botConfig.reEntryCooldownDays}
                reEntryCooldownEnabled={botConfig.reEntryCooldownEnabled}
                maxOpenPositions={botConfig.maxOpenPositions}
                dcaPriorityLogic={botConfig.dcaPriorityLogic}
                onUpdateSettings={handleTradeUpdate}
                botType="RSI Compounder"
              />
            </div>
          </div>

          {/* Sticky Right Sidebar - Bot Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-3">
              {/* Bot Summary Card */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                    <span className="text-2xl">{templates.find(t => t.id === selectedTemplate)?.icon || '🤖'}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Bot Summary</h3>
                    <p className="text-gray-600 text-sm">Configuration overview</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Bot Name */}
                  <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-1">Bot Name</div>
                    <div className="text-sm font-bold text-gray-900">{botConfig.name || 'Unnamed Bot'}</div>
                  </div>

                  {/* Template */}
                  <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-1">Template</div>
                    <div className="text-sm font-bold text-gray-900">
                      {templates.find(t => t.id === selectedTemplate)?.name || 'RSI Compounder'}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-1">Status</div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      botConfig.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                        : botConfig.status === 'paused'
                        ? 'bg-amber-100 text-amber-700 border border-amber-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}>
                      {botConfig.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Card */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <h4 className="text-base font-bold text-gray-900 mb-3">Key Metrics</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Total Capital</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(botConfig.startingCapital)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-md border border-emerald-200">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-700">Step Size</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{formatCurrency(stepSizeAmount)}</div>
                      <div className="text-xs text-gray-500">{botConfig.stepSizePercentage}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded-md border border-orange-200">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Take Profit</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{botConfig.takeProfitPercent}%</span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-md border border-purple-200">
                    <div className="flex items-center space-x-1">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Max Positions</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{botConfig.maxOpenPositions}</span>
                  </div>
                </div>
              </div>

              {/* Configuration Summary Card */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <h4 className="text-base font-bold text-gray-900 mb-3">Configuration</h4>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="font-medium text-blue-600 mb-1">Capital Settings</div>
                    <div className="space-y-0.5 text-gray-700 pl-2 border-l-2 border-blue-200">
                      <div>Deploy: {botConfig.deployCapital}</div>
                      <div>Reinvest: {botConfig.reinvestMode}%</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-emerald-600 mb-1">Order Settings</div>
                    <div className="space-y-0.5 text-gray-700 pl-2 border-l-2 border-emerald-200">
                      <div>Type: {botConfig.orderType}</div>
                      <div>Index: {botConfig.tradingIndex}</div>
                      <div>DCA: {botConfig.dcaEnabled ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-red-600 mb-1">Risk Management</div>
                    <div className="space-y-0.5 text-gray-700 pl-2 border-l-2 border-red-200">
                      <div>Stop Loss: {botConfig.stopLossEnabled ? `${botConfig.stopLossPercent}%` : 'Disabled'}</div>
                      <div>Features: {[
                        botConfig.recoveryDrip && 'Recovery Drip',
                        botConfig.timeBasedExit && 'Time Exit',
                        botConfig.maxDrawdownStop && 'Max Drawdown',
                        botConfig.rangeExit && 'Range Exit'
                      ].filter(Boolean).join(', ') || 'None'}</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-purple-600 mb-1">Trade Limits</div>
                    <div className="space-y-0.5 text-gray-700 pl-2 border-l-2 border-purple-200">
                      <div>New/Day: {botConfig.maxNewPositionsPerDay}</div>
                      <div>DCA/Day: {botConfig.maxDcaExecutionsPerDay}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                <div className="space-y-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !hasUnsavedChanges}
                    className={`w-full py-2 rounded-md font-medium text-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm ${
                      isSaving || !hasUnsavedChanges
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Configuration...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3" />
                        <span>Save & Deploy Bot</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleToggleBot}
                    className={`w-full py-2 rounded-md font-medium text-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm ${
                      botConfig.status === 'active' 
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300' 
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300'
                    }`}
                  >
                    {botConfig.status === 'active' ? (
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSICompounderBot;
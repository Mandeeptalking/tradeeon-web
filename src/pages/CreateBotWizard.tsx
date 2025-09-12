import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, CheckCircle, AlertCircle, Bot } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { EntryRulesV2 } from '../types/entry';

// Step Components
import BotBasicsStep from '../components/wizard/BotBasicsStep';
import EntryRulesStep from '../components/wizard/EntryRulesStep';
import ManagementStep from '../components/wizard/ManagementStep';

interface WizardData {
  // Step 1: Basic Details & Symbols
  basics: {
    name: string;
    market: "Indian Equity" | "Crypto" | "US Stocks";
    type: "Spot" | "Futures";
    direction?: "Long" | "Short";
    exchangeId: string | null;
    exchange: "binance" | "binanceus" | "binance_testnet" | null;
    region: "COM" | "US" | "TESTNET" | null;
    symbols: string[];
  };
  
  // Step 2: Entry Rules
  entry: EntryRulesV2;
  
  // Step 3: Management Settings
  management: {
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
  };
}

const STORAGE_KEY = 'botWizardDraft';

const CreateBotWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load wizard draft:', error);
    }
    
    // Default data
    return {
      basics: {
        name: 'My Trading Bot',
        market: 'Indian Equity',
        type: 'Spot',
        direction: 'Long',
        exchangeId: null,
        exchange: null,
        region: null,
        symbols: []
      },
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
      management: {
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
      }
    };
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wizardData));
    } catch (error) {
      console.warn('Failed to save wizard draft:', error);
    }
  }, [wizardData]);

  // Pure validation function that doesn't update state
  const getErrorsForCurrentStep = (data: WizardData, step: number) => {
    const errors: string[] = [];
    
    switch (step) {
      case 1:
        if (!data.basics.name.trim()) {
          errors.push('Bot name is required');
        }
        if (data.basics.market === 'Crypto' && !data.basics.exchangeId) {
          errors.push('Exchange connection is required for crypto trading');
        }
        if (data.basics.symbols.length === 0) {
          errors.push('At least one symbol is required');
        }
        break;
        
      case 2:
        const activeTriggers = data.entry.mainTriggers.filter(t => t !== null);
        if (activeTriggers.length === 0) {
          errors.push('At least one main trigger is required');
        }
        break;
        
      case 3:
        if (data.management.capital.capital <= 0) {
          errors.push('Starting capital must be greater than 0');
        }
        if (data.management.orderDca.takeProfitPercent <= 0) {
          errors.push('Take profit percentage must be greater than 0');
        }
        break;
    }
    
    return errors;
  };

  // Validate current step
  const validateCurrentStep = () => {
    const errors = getErrorsForCurrentStep(wizardData, currentStep);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Update data for specific step
  const updateStepData = (step: number, data: any) => {
    setWizardData(prev => {
      switch (step) {
        case 1:
          return { ...prev, basics: { ...prev.basics, ...data } };
        case 2:
          return { ...prev, entry: { ...prev.entry, ...data } };
        case 3:
          return { ...prev, management: { ...prev.management, ...data } };
        default:
          return prev;
      }
    });
  };

  // Navigation handlers
  const handleNext = () => {
    const errors = getErrorsForCurrentStep(wizardData, currentStep);
    setValidationErrors(errors);
    if (errors.length === 0 && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    // Allow going back to previous steps, but validate before going forward
    if (step < currentStep || (step === currentStep + 1 && validateCurrentStep())) {
      setCurrentStep(step);
    }
  };

  // Save and finish
  const handleSaveBot = async () => {
    const errors = getErrorsForCurrentStep(wizardData, currentStep);
    setValidationErrors(errors);
    if (errors.length > 0) return;

    setIsSaving(true);
    try {
      // Combine all wizard data into final bot config
      const botConfig = {
        name: wizardData.basics.name,
        market: wizardData.basics.market,
        type: wizardData.basics.type,
        direction: wizardData.basics.direction,
        exchange: wizardData.basics.exchangeId ? {
          id: wizardData.basics.exchangeId,
          provider: wizardData.basics.exchange,
          region: wizardData.basics.region
        } : undefined,
        symbols: wizardData.basics.symbols,
        entry: wizardData.entry,
        ...wizardData.management
      };
      
      console.log('Saving bot configuration:', botConfig);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear wizard draft
      localStorage.removeItem(STORAGE_KEY);
      
      // Navigate back to bots page
      navigate('/dashboard/bots');
    } catch (error) {
      console.error('Error saving bot configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basics & Symbols', description: 'Configure bot details and trading symbols' },
    { number: 2, title: 'Entry Rules', description: 'Define when to enter trades' },
    { number: 3, title: 'Management', description: 'Set capital, risk, and trade management' }
  ];

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const canProceed = () => {
    const errors = getErrorsForCurrentStep(wizardData, currentStep);
    return errors.length === 0;
  };

  // Update validation errors when step or data changes
  useEffect(() => {
    const errors = getErrorsForCurrentStep(wizardData, currentStep);
    setValidationErrors(errors);
  }, [currentStep, wizardData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard/bots">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Create Trading Bot</h1>
                  <p className="text-gray-600 text-xs">Step-by-step bot configuration wizard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {validationErrors.length > 0 && (
                <div className="flex items-center space-x-2 text-red-600 text-xs bg-red-50 px-3 py-2 rounded-md border border-red-200">
                  <AlertCircle className="w-3 h-3" />
                  <span>{validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}</span>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step.number);
              return (
                <div key={step.number} className="flex items-center">
                  <button
                    onClick={() => handleStepClick(step.number)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                      status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white cursor-pointer hover:bg-emerald-600'
                        : status === 'current'
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 text-gray-400 hover:border-gray-400 cursor-pointer'
                    }`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{step.number}</span>
                    )}
                  </button>
                  <div className="ml-2 hidden sm:block">
                    <div className={`text-xs font-medium ${
                      status === 'current' ? 'text-blue-600' : 
                      status === 'completed' ? 'text-emerald-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400">{step.description}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-12 h-0.5 mx-3 ${
                      status === 'completed' ? 'bg-emerald-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
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

        {/* Step 1: Basics & Symbols */}
        {currentStep === 1 && (
          <BotBasicsStep
            data={wizardData.basics}
            onChange={(data) => updateStepData(1, data)}
          />
        )}

        {/* Step 2: Entry Rules */}
        {currentStep === 2 && (
          <EntryRulesStep
            data={wizardData.entry}
            onChange={(data) => updateStepData(2, data)}
            botType={wizardData.basics.type}
            direction={wizardData.basics.direction}
          />
        )}

        {/* Step 3: Management */}
        {currentStep === 3 && (
          <ManagementStep
            data={wizardData.management}
            onChange={(data) => updateStepData(3, data)}
            deployCapital={wizardData.management.capital.deployPlan}
          />
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {currentStep} of {steps.length} steps completed
              </span>
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    !canProceed()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                  }`}
                >
                  {currentStep === 2 && (
                    <div className="flex items-center space-x-3 mb-4">
                      <button
                        type="button"
                        onClick={() => window.open('/dashboard/bots/workspace', '_blank')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 text-white"
                      >
                        🚀 Open Live Chart Workspace
                      </button>
                      <span className="text-sm text-gray-500">Build rules with visual feedback</span>
                    </div>
                  )}
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSaveBot}
                  disabled={!canProceed() || isSaving}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    !canProceed() || isSaving
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white transform hover:scale-105'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Bot...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Bot</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBotWizard;
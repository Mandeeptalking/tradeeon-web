import React from 'react';
import { DollarSign, TrendingUp, RefreshCw, BarChart3, Edit3, PieChart, Target } from 'lucide-react';
import CompoundingTableModal from './CompoundingTableModal';
import DeploymentPlanModal from './DeploymentPlanModal';

interface CapitalManagementProps {
  startingCapital: number;
  stepSizePercentage: number;
  reinvestMode: number;
  takeProfitPercent?: number;
  botName?: string;
  deployCapital?: string;
  dcaEnabled?: boolean;
  onUpdateSettings?: (settings: {
    startingCapital: number;
    stepSizePercentage: number;
    reinvestMode: number;
    deployCapital: string;
    dcaEnabled: boolean;
  }) => void;
  botType?: string;
}

const CapitalManagement: React.FC<CapitalManagementProps> = ({
  startingCapital,
  stepSizePercentage,
  reinvestMode,
  takeProfitPercent = 6.28,
  botName = "RSI Compounder",
  deployCapital = "Safest: 10%/10%/10%/10%/50%",
  dcaEnabled = true,
  onUpdateSettings,
  botType = "RSI Compounder"
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [showCompoundingTable, setShowCompoundingTable] = React.useState(false);
  const [showDeploymentPlan, setShowDeploymentPlan] = React.useState(false);
  const [editSettings, setEditSettings] = React.useState({
    startingCapital,
    stepSizePercentage,
    reinvestMode,
    deployCapital,
    dcaEnabled
  });
  const [stepSizeType, setStepSizeType] = React.useState<'amount' | 'percentage'>('percentage');
  const [deployCapitalOption, setDeployCapitalOption] = React.useState('ratio');
  const [reinvestModeOption, setReinvestModeOption] = React.useState(reinvestMode.toString()); // Use actual reinvestMode value
  const [validationError, setValidationError] = React.useState('');

  // Calculate step size amount based on percentage and starting capital
  const stepSizeAmount = Math.round((editSettings.stepSizePercentage / 100) * editSettings.startingCapital);

  // Auto-set fixed amount when switching to fixed type
  React.useEffect(() => {
    if (deployCapitalOption === 'fixed' && !editSettings.deployCapital.startsWith('Fixed:')) {
      setEditSettings({...editSettings, deployCapital: `Fixed: ₹${stepSizeAmount.toLocaleString()}`});
    }
    // Update fixed amount when step size changes
    if (deployCapitalOption === 'fixed' && editSettings.deployCapital.startsWith('Fixed:')) {
      setEditSettings({...editSettings, deployCapital: `Fixed: ₹${stepSizeAmount.toLocaleString()}`});
    }
  }, [deployCapitalOption, stepSizeAmount]);

  // Validate custom ratio input
  const validateCustomRatio = (input: string): { isValid: boolean; error: string } => {
    if (!input.trim()) {
      return { isValid: false, error: 'Custom ratio cannot be empty' };
    }

    // Check if input contains % signs
    if (!input.includes('%')) {
      return { isValid: false, error: 'Percentages must include % sign (e.g., 25%/25%/25%/25%)' };
    }

    // Split by / and validate each percentage
    const parts = input.split('/');
    
    if (parts.length < 2) {
      return { isValid: false, error: 'Please enter at least 2 percentages separated by /' };
    }

    let total = 0;
    for (const part of parts) {
      const trimmed = part.trim();
      
      // Check if part ends with %
      if (!trimmed.endsWith('%')) {
        return { isValid: false, error: 'Each percentage must end with % sign' };
      }

      // Extract number and validate
      const numberStr = trimmed.slice(0, -1);
      const number = parseFloat(numberStr);
      
      if (isNaN(number) || number < 0) {
        return { isValid: false, error: 'Invalid percentage value: ' + trimmed };
      }

      if (number > 100) {
        return { isValid: false, error: 'Individual percentage cannot exceed 100%: ' + trimmed };
      }

      total += number;
    }

    // Check if total equals 100%
    if (Math.abs(total - 100) > 0.01) { // Allow small floating point differences
      return { isValid: false, error: `Total must equal 100%. Current total: ${total.toFixed(1)}%` };
    }

    return { isValid: true, error: '' };
  };

  // Handle custom ratio input change with real-time validation
  const handleCustomRatioChange = (value: string) => {
    setEditSettings({...editSettings, deployCapital: `Custom: ${value}`});
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  // Format currency values
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

  // Get reinvest mode text
  const getReinvestModeText = (mode: number) => {
    switch (mode) {
      case 50: return '50% Reinvest / 50% Withdraw';
      case 98: return '98% Reinvest / 2% Expense';
      case 100: return '100% Reinvest (Maximum Speed)';
      default: return `${mode}% Reinvest / ${100 - mode}% Withdraw`;
    }
  };

  const handleSaveChanges = () => {
    // Validate custom ratio if it's being used
    if (deployCapitalOption === 'ratio' && editSettings.deployCapital.startsWith('Custom:')) {
      const customRatio = editSettings.deployCapital.replace('Custom: ', '');
      const validation = validateCustomRatio(customRatio);
      
      if (!validation.isValid) {
        setValidationError(validation.error);
        return; // Don't save if validation fails
      }
    }

    // Clear any previous validation errors
    setValidationError('');

    const reinvestValue = reinvestModeOption === 'custom' ? editSettings.reinvestMode : parseInt(reinvestModeOption);

    const updatedSettings = {
      ...editSettings,
      reinvestMode: reinvestValue,
      deployCapital: editSettings.deployCapital,
      dcaEnabled: editSettings.dcaEnabled
    };

    if (onUpdateSettings) {
      onUpdateSettings(updatedSettings);
    }
    
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Capital Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configure capital allocation and deployment</p>
          </div>
        </div>
        {/* Show validation error in header if exists */}
        {validationError && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-600/50 rounded-lg px-3 py-2 mr-3">
            <div className="text-red-700 dark:text-red-400 text-xs font-medium">⚠️ {validationError}</div>
          </div>
        )}
        <button
          onClick={() => {
            if (isEditing) {
              handleSaveChanges();
            } else {
              setIsEditing(true);
              setValidationError(''); // Clear errors when starting to edit
            }
          }}
          className={`flex items-center px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm ${
            validationError 
              ? 'bg-red-600 hover:bg-red-700 text-white cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          }`}
          disabled={isEditing && validationError}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          {isEditing ? (validationError ? 'Fix Errors to Save' : 'Save Changes') : 'Edit Settings'}
        </button>
      </div>

      {isEditing ? (
        /* Edit Form */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Starting Capital */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mr-2">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Starting Capital</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Total funds</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
              <input
                type="number"
                value={editSettings.startingCapital}
                onChange={(e) => setEditSettings({...editSettings, startingCapital: Number(e.target.value)})}
                className="w-full pl-8 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Starting Step Size */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center mr-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Step Size</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Per trade</p>
              </div>
            </div>
            
            {/* Amount/Percentage Toggle */}
            <div className="flex bg-gray-200 dark:bg-gray-600 rounded-md p-1 mb-3">
              <button
                onClick={() => setStepSizeType('amount')}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  stepSizeType === 'amount'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Amount
              </button>
              <button
                onClick={() => setStepSizeType('percentage')}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  stepSizeType === 'percentage'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Percentage
              </button>
            </div>
            
            <div className="relative">
              {stepSizeType === 'amount' && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
              )}
              <input
                type="number"
                value={stepSizeType === 'percentage' ? editSettings.stepSizePercentage : stepSizeAmount}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (stepSizeType === 'percentage') {
                    setEditSettings({...editSettings, stepSizePercentage: value});
                  } else {
                    const percentage = (value / editSettings.startingCapital) * 100;
                    setEditSettings({...editSettings, stepSizePercentage: percentage});
                  }
                }}
                className={`w-full ${stepSizeType === 'amount' ? 'pl-8' : 'pl-4'} pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm`}
              />
              {stepSizeType === 'percentage' && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
              )}
            </div>
            
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {stepSizeType === 'percentage' ? 
                `Amount: ₹${stepSizeAmount.toLocaleString()}` : 
                `Percentage: ${((stepSizeAmount / editSettings.startingCapital) * 100).toFixed(2)}%`
              }
            </div>
          </div>

          {/* Deploy Capital */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center mr-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Deploy Capital</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Distribution</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {/* Deployment Type Selection */}
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <div className="flex bg-gray-200 dark:bg-gray-600 rounded-md p-1">
                  <button
                    onClick={() => setDeployCapitalOption('ratio')}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      deployCapitalOption === 'ratio'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Ratio
                  </button>
                  <button
                    onClick={() => setDeployCapitalOption('fixed')}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      deployCapitalOption === 'fixed'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    Fixed
                  </button>
                </div>
              </div>

              {deployCapitalOption === 'ratio' ? (
                <>
                  {/* Preset Ratios */}
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Presets
                    </label>
                    <div className="space-y-1">
                      <button
                        onClick={() => setEditSettings({...editSettings, deployCapital: 'Safest: 10%/10%/10%/10%/50%'})}
                        className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                          editSettings.deployCapital === 'Safest: 10%/10%/10%/10%/50%'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="font-medium">Safest</div>
                        <div className="text-xs opacity-75 mt-1">10%/10%/10%/10%/50%</div>
                      </button>
                      
                      <button
                        onClick={() => setEditSettings({...editSettings, deployCapital: 'Equal: 25%/25%/25%/25%'})}
                        className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                          editSettings.deployCapital === 'Equal: 25%/25%/25%/25%'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="font-medium">Equal</div>
                        <div className="text-xs opacity-75 mt-1">25%/25%/25%/25%</div>
                      </button>
                      
                      <button
                        onClick={() => setEditSettings({...editSettings, deployCapital: 'Aggressive: 40%/30%/20%/10%'})}
                        className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                          editSettings.deployCapital === 'Aggressive: 40%/30%/20%/10%'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="font-medium">Aggressive</div>
                        <div className="text-xs opacity-75 mt-1">40%/30%/20%/10%</div>
                      </button>
                    </div>
                  </div>

                  {/* Custom Ratio Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Custom
                    </label>
                    <input
                      type="text"
                      placeholder="20%/30%/25%/25%"
                      value={editSettings.deployCapital.startsWith('Custom:') ? editSettings.deployCapital.replace('Custom: ', '') : ''}
                      onChange={(e) => handleCustomRatioChange(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg text-orange-200 placeholder-orange-400 focus:outline-none focus:ring-2 transition-colors ${
                        validationError && editSettings.deployCapital.startsWith('Custom:')
                          ? 'bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 focus:ring-red-500'
                          : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-orange-500 focus:border-transparent'
                      }`}
                    />
                  </div>
                </>
              ) : (
                /* Fixed Amount Options */
                <div className="space-y-2">
                  {/* Info Message for Fixed Amount */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-3">
                    <div className="flex items-start">
                      <div className="text-blue-600 dark:text-blue-400 mr-2">ℹ️</div>
                      <div>
                        <div className="text-blue-800 dark:text-blue-300 font-medium text-xs">
                          Fixed Amount Mode
                        </div>
                        <div className="text-blue-700 dark:text-blue-400 text-xs mt-1">
                          Each order will be placed for fixed amount: ₹{stepSizeAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fixed Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                      <input
                        type="number"
                        placeholder={stepSizeAmount.toString()}
                        value={editSettings.deployCapital.startsWith('Fixed:') ? editSettings.deployCapital.replace('Fixed: ₹', '').replace(/,/g, '') : stepSizeAmount}
                        onChange={(e) => {
                          const amount = Number(e.target.value);
                          setEditSettings({...editSettings, deployCapital: `Fixed: ₹${amount.toLocaleString()}`});
                        }}
                        className="w-full pl-8 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  
                </div>
              )}
            </div>
          </div>

          {/* Reinvest Mode */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center mr-2">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Reinvest Mode</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Strategy</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setReinvestModeOption('50')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  reinvestModeOption === '50'
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">50% Reinvest</div>
              </button>
              
              <button
                onClick={() => setReinvestModeOption('98')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  reinvestModeOption === '98'
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">98% Reinvest</div>
              </button>
              
              <button
                onClick={() => setReinvestModeOption('100')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  reinvestModeOption === '100'
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">100% Reinvest</div>
              </button>
              
              <button
                onClick={() => setReinvestModeOption('custom')}
                className={`w-full p-2 rounded-md text-left transition-colors text-xs border ${
                  reinvestModeOption === 'custom'
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium">Custom</div>
              </button>
            </div>
            
            {/* Custom Percentage Input */}
            {reinvestModeOption === 'custom' && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editSettings.reinvestMode}
                    onChange={(e) => {
                      const value = Math.max(0, Math.min(100, Number(e.target.value)));
                      setEditSettings({...editSettings, reinvestMode: value});
                    }}
                    className="w-full px-3 pr-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    placeholder="75"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
                </div>
                
                {/* Warning for low reinvest percentage */}
                {editSettings.reinvestMode < 50 && (
                  <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-2">
                    <div className="flex items-start">
                      <div>
                        <div className="text-yellow-800 dark:text-yellow-300 font-medium text-xs">
                          Low Reinvestment
                        </div>
                        <div className="text-yellow-700 dark:text-yellow-400 text-xs mt-1">
                          Suggest 50%+ for better growth
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Display Mode - Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Starting Capital */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mr-2">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Capital</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Total funds</p>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(editSettings.startingCapital)}
            </div>
          </div>

          {/* Starting Step Size */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center mr-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Step Size</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Per trade</p>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              {formatCurrency(Math.round((editSettings.stepSizePercentage / 100) * editSettings.startingCapital))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {editSettings.stepSizePercentage}% of capital
            </div>
            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-3 h-3 mr-1" />
              <button
                onClick={() => setShowCompoundingTable(true)}
                className="hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
              >
                Compounding Table
              </button>
            </div>
          </div>

          {/* Deploy Capital */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-orange-600 rounded-md flex items-center justify-center mr-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Deploy Capital</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Distribution</p>
              </div>
            </div>
            {(editSettings.deployCapital.startsWith('Fixed:') || editSettings.deployCapital.startsWith('Custom Fixed:')) ? (
              <div className="bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 mb-2">
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  Plan N/A
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded px-2 py-1 mb-2">
                <div className="flex items-center text-xs text-green-700 dark:text-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Plan Available
                </div>
              </div>
            )}
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
              {editSettings.deployCapital}
            </div>
            {(editSettings.deployCapital.startsWith('Fixed:') || editSettings.deployCapital.startsWith('Custom Fixed:')) ? (
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                <span>
                  Plan N/A for Fixed
                </span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                <button
                  onClick={() => setShowDeploymentPlan(true)}
                  className="hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
                >
                  View Plan
                </button>
              </div>
            )}
          </div>

          {/* Reinvest Mode */}
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center mr-2">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-gray-900 dark:text-gray-100 font-medium text-sm">Reinvest Mode</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Strategy</p>
              </div>
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
              {getReinvestModeText(reinvestMode)}
            </div>
          </div>
        </div>
      )}

      {/* Compounding Table Modal */}
      <CompoundingTableModal
        isOpen={showCompoundingTable}
        onClose={() => setShowCompoundingTable(false)}
        startingCapital={editSettings.startingCapital}
        stepSizePercentage={editSettings.stepSizePercentage}
        takeProfitPercent={takeProfitPercent}
        reinvestMode={reinvestMode}
        botName={botName}
      />

      {/* Deployment Plan Modal */}
      <DeploymentPlanModal
        isOpen={showDeploymentPlan}
        onClose={() => setShowDeploymentPlan(false)}
        deployCapital={editSettings.deployCapital}
        startingCapital={startingCapital}
        stepSizePercentage={stepSizePercentage}
        takeProfitPercent={takeProfitPercent}
        botName={botName}
      />
    </div>
  );
};

export default CapitalManagement;
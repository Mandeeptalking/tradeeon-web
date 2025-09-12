import React from 'react';
import { X, Target } from 'lucide-react';

interface DeploymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployCapital: string;
  startingCapital: number;
  stepSizePercentage: number;
  takeProfitPercent: number;
  botName: string;
}

interface DeploymentStep {
  step: number;
  stepAmount: number;
  semiStep1: number;
  semiStep2: number;
  semiStep3: number;
  semiStep4: number;
  semiStep5: number;
  semiStep6: number;
}

const DeploymentPlanModal: React.FC<DeploymentPlanModalProps> = ({
  isOpen,
  onClose,
  deployCapital,
  startingCapital,
  stepSizePercentage,
  takeProfitPercent,
  botName
}) => {
  if (!isOpen) return null;

  // Parse deployment strategy
  const parseDeploymentStrategy = () => {
    if (deployCapital.includes('Safest:')) {
      return [10, 10, 10, 10, 50, 10]; // 6 semi-steps for safest
    } else if (deployCapital.includes('Equal:')) {
      return [25, 25, 25, 25, 0, 0]; // 4 semi-steps for equal
    } else if (deployCapital.includes('Aggressive:')) {
      return [40, 30, 20, 10, 0, 0]; // 4 semi-steps for aggressive
    } else if (deployCapital.includes('Custom:')) {
      // Parse custom ratio
      const ratioStr = deployCapital.replace('Custom: ', '');
      const ratios = ratioStr.split('/').map(r => parseFloat(r.replace('%', '')));
      // Pad with zeros if less than 6 entries
      while (ratios.length < 6) ratios.push(0);
      return ratios.slice(0, 6);
    } else if (deployCapital.includes('Fixed:')) {
      // Fixed amount - equal distribution
      return [25, 25, 25, 25, 0, 0];
    }
    return [10, 10, 10, 10, 50, 10]; // Default safest
  };

  const deploymentRatios = parseDeploymentStrategy();
  const stepSizeAmount = (stepSizePercentage / 100) * startingCapital;

  // Calculate deployment steps
  const calculateDeploymentSteps = (): DeploymentStep[] => {
    const steps: DeploymentStep[] = [];
    let currentStepAmount = stepSizeAmount;
    
    for (let i = 1; i <= 5; i++) {
      // Calculate semi-step amounts based on current step amount
      const semiStep1 = (deploymentRatios[0] / 100) * currentStepAmount;
      const semiStep2 = (deploymentRatios[1] / 100) * currentStepAmount;
      const semiStep3 = (deploymentRatios[2] / 100) * currentStepAmount;
      const semiStep4 = (deploymentRatios[3] / 100) * currentStepAmount;
      const semiStep5 = (deploymentRatios[4] / 100) * currentStepAmount;
      const semiStep6 = (deploymentRatios[5] / 100) * currentStepAmount;
      
      steps.push({
        step: i,
        stepAmount: currentStepAmount,
        semiStep1,
        semiStep2,
        semiStep3,
        semiStep4,
        semiStep5,
        semiStep6
      });
      
      // Calculate next step amount (current step + take profit %)
      currentStepAmount = currentStepAmount * (1 + takeProfitPercent / 100);
    }
    
    return steps;
  };

  const steps = calculateDeploymentSteps();
  const finalStepAmount = steps[steps.length - 1].stepAmount * (1 + takeProfitPercent / 100);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${Math.round(amount)}`;
    }
  };

  // Get deployment strategy name
  const getStrategyName = () => {
    if (deployCapital.includes('Safest:')) return 'Safest: 10%/10%/10%/10%/50%';
    if (deployCapital.includes('Equal:')) return 'Equal: 25%/25%/25%/25%';
    if (deployCapital.includes('Aggressive:')) return 'Aggressive: 40%/30%/20%/10%';
    if (deployCapital.includes('Custom:')) return deployCapital;
    return 'Safest: 10%/10%/10%/10%/50%';
  };

  // Get column headers based on strategy
  const getColumnHeaders = () => {
    const strategy = getStrategyName();
    if (strategy.includes('Safest:')) {
      return [
        'SEMI STEP 1 (10%)',
        'SEMI STEP 2 (10%)',
        'SEMI STEP 3 (10%)',
        'SEMI STEP 4 (10%)',
        'SEMI STEP 5 (10%)',
        'SEMI STEP 6 (50%)'
      ];
    } else if (strategy.includes('Equal:')) {
      return [
        'SEMI STEP 1 (25%)',
        'SEMI STEP 2 (25%)',
        'SEMI STEP 3 (25%)',
        'SEMI STEP 4 (25%)',
        '',
        ''
      ];
    } else if (strategy.includes('Aggressive:')) {
      return [
        'SEMI STEP 1 (40%)',
        'SEMI STEP 2 (30%)',
        'SEMI STEP 3 (20%)',
        'SEMI STEP 4 (10%)',
        '',
        ''
      ];
    }
    return [
      'SEMI STEP 1 (10%)',
      'SEMI STEP 2 (10%)',
      'SEMI STEP 3 (10%)',
      'SEMI STEP 4 (10%)',
      'SEMI STEP 5 (10%)',
      'SEMI STEP 6 (50%)'
    ];
  };

  const columnHeaders = getColumnHeaders();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  🎯 Deployment Plan - First 5 Steps
                </h2>
                <p className="text-gray-400">
                  Capital deployment breakdown using {getStrategyName()} strategy
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Summary Stats */}
          <div className="p-6 border-b border-gray-700">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400">
                  {formatCurrency(stepSizeAmount)}
                </div>
                <div className="text-gray-400 text-sm">Starting Step Size</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {formatCurrency(finalStepAmount)}
                </div>
                <div className="text-gray-400 text-sm">Step 5 Amount</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {getStrategyName()}
                </div>
                <div className="text-gray-400 text-sm">Deployment Strategy</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">STEP</th>
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">STEP AMOUNT</th>
                    {columnHeaders.map((header, index) => (
                      header && (
                        <th key={index} className="text-left py-3 px-2 text-gray-300 font-semibold">
                          {header}
                        </th>
                      )
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step, index) => (
                    <tr 
                      key={step.step} 
                      className="border-b border-gray-800 hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-2 text-white font-medium">Step {step.step}</td>
                      <td className="py-3 px-2 text-white font-semibold">{formatCurrency(step.stepAmount)}</td>
                      {deploymentRatios[0] > 0 && (
                        <td className="py-3 px-2 text-orange-400">{formatCurrency(step.semiStep1)}</td>
                      )}
                      {deploymentRatios[1] > 0 && (
                        <td className="py-3 px-2 text-orange-400">{formatCurrency(step.semiStep2)}</td>
                      )}
                      {deploymentRatios[2] > 0 && (
                        <td className="py-3 px-2 text-orange-400">{formatCurrency(step.semiStep3)}</td>
                      )}
                      {deploymentRatios[3] > 0 && (
                        <td className="py-3 px-2 text-orange-400">{formatCurrency(step.semiStep4)}</td>
                      )}
                      {deploymentRatios[4] > 0 && (
                        <td className="py-3 px-2 text-orange-400">{formatCurrency(step.semiStep5)}</td>
                      )}
                      {deploymentRatios[5] > 0 && (
                        <td className="py-3 px-2 text-orange-400">{formatCurrency(step.semiStep6)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer with other strategies */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="text-center space-y-2">
              <div className="text-gray-300 text-sm font-medium">Other Available Strategies:</div>
              <div className="flex justify-center space-x-6 text-xs text-gray-400">
                <span>Equal: 25%/25%/25%/25%</span>
                <span>Aggressive: 40%/30%/20%/10%</span>
              </div>
              <p className="text-gray-400 text-xs mt-4">
                Each step amount increases by {takeProfitPercent}% take profit from previous step
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentPlanModal;
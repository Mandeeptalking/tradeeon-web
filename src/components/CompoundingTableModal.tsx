import React from 'react';
import { X, BarChart3 } from 'lucide-react';

interface CompoundingTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  startingCapital: number;
  stepSizePercentage: number;
  takeProfitPercent: number;
  reinvestMode: number;
  botName: string;
}

interface CompoundingStep {
  step: number;
  capital: number;
  targetProfit: number;
  brokerage: number;
  netProfit: number;
  tax: number;
  afterTax: number;
  selfDividend: number;
  growthCapital: number;
  nextCapital: number;
}

const CompoundingTableModal: React.FC<CompoundingTableModalProps> = ({
  isOpen,
  onClose,
  startingCapital,
  stepSizePercentage,
  takeProfitPercent,
  reinvestMode,
  botName
}) => {
  if (!isOpen) return null;

  // Calculate compounding steps
  const calculateCompoundingSteps = (): CompoundingStep[] => {
    const steps: CompoundingStep[] = [];
    // Use step size amount as the starting capital for compounding
    const stepSizeAmount = (stepSizePercentage / 100) * startingCapital;
    let currentCapital = stepSizeAmount;
    
    for (let i = 1; i <= 50; i++) {
      // Step 1: Target profit (using user's take profit % of capital)
      const targetProfit = currentCapital * (takeProfitPercent / 100);
      
      // Step 2: Brokerage (0.5157% of capital)
      const brokerage = currentCapital * 0.005157;
      
      // Step 3: Net profit (Target - Brokerage)
      const netProfit = targetProfit - brokerage;
      
      // Step 4: Tax (20.7% of net profit)
      const tax = netProfit * 0.207;
      
      // After-tax profit
      const afterTax = netProfit - tax;
      
      // Step 5: Self dividend (based on reinvest mode)
      const dividendPercent = reinvestMode === 50 ? 48 : (reinvestMode === 98 ? 2 : 0);
      const selfDividend = afterTax * (dividendPercent / 100);
      
      // Step 6: Expense (2% of after-tax)
      const expense = afterTax * 0.02;
      
      // Step 7: Growth capital (remaining after dividend and expense)
      const growthCapital = afterTax - selfDividend - expense;
      
      // Next capital
      const nextCapital = currentCapital + growthCapital;
      
      steps.push({
        step: i,
        capital: currentCapital,
        targetProfit,
        brokerage,
        netProfit,
        tax,
        afterTax,
        selfDividend,
        growthCapital,
        nextCapital
      });
      
      currentCapital = nextCapital;
    }
    
    return steps;
  };

  const steps = calculateCompoundingSteps();
  const finalStep = steps[steps.length - 1];
  const totalDividends = steps.reduce((sum, step) => sum + step.selfDividend, 0);
  const stepSizeAmount = (stepSizePercentage / 100) * startingCapital;
  const totalGrowth = finalStep.nextCapital - stepSizeAmount;
  const growthPercentage = ((finalStep.nextCapital - stepSizeAmount) / stepSizeAmount) * 100;

  // Format currency
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

  const formatDetailedCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₹${Math.round(amount)}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-gray-900 rounded-2xl shadow-2xl border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  🇫🇷 Compounding Table - First 50 Steps
                </h2>
                <p className="text-gray-400">
                  Step-by-step capital growth with {takeProfitPercent}% target profit
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
                <div className="text-3xl font-bold text-green-400">
                  {formatCurrency(stepSizeAmount)}
                </div>
                <div className="text-gray-400 text-sm">Starting Step Size</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {formatCurrency(totalDividends)}
                </div>
                <div className="text-gray-400 text-sm">Total Dividends</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {growthPercentage.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">Growth Percentage</div>
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
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">CAPITAL</th>
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">TARGET PROFIT</th>
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">BROKERAGE</th>
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">NET PROFIT</th>
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">TAX (20.7%)</th>
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">AFTER TAX</th>
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">SELF DIVIDEND</th>
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">GROWTH CAPITAL</th>
                    <th className="text-left py-3 px-2 text-gray-300 font-semibold">NEXT CAPITAL</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step, index) => (
                    <tr 
                      key={step.step} 
                      className={`border-b border-gray-800 hover:bg-gray-800/50 ${
                        index < 12 ? '' : 'opacity-60'
                      }`}
                    >
                      <td className="py-3 px-2 text-white font-medium">{step.step}</td>
                      <td className="py-3 px-2 text-white">{formatDetailedCurrency(step.capital)}</td>
                      <td className="py-3 px-2 text-green-400">{formatDetailedCurrency(step.targetProfit)}</td>
                      <td className="py-3 px-2 text-red-400">{formatDetailedCurrency(step.brokerage)}</td>
                      <td className="py-3 px-2 text-blue-400">{formatDetailedCurrency(step.netProfit)}</td>
                      <td className="py-3 px-2 text-orange-400">{formatDetailedCurrency(step.tax)}</td>
                      <td className="py-3 px-2 text-yellow-400">{formatDetailedCurrency(step.afterTax)}</td>
                      <td className="py-3 px-2 text-cyan-400">{formatDetailedCurrency(step.selfDividend)}</td>
                      <td className="py-3 px-2 text-green-400">{formatDetailedCurrency(step.growthCapital)}</td>
                      <td className="py-3 px-2 text-white font-semibold">{formatDetailedCurrency(step.nextCapital)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">
                Formula: Target Profit → Brokerage → Net Profit → Tax → After Tax → Self Dividend → Growth Capital → Next Capital
              </p>
              <p className="text-gray-300 text-sm">
                Reinvest Mode: {reinvestMode === 50 ? '50% Reinvest / 50% Withdraw' : 
                                reinvestMode === 98 ? '98% Reinvest / 2% Expense' : 
                                '100% Reinvest (Maximum Speed)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompoundingTableModal;
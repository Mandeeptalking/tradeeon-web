import React, { useState } from 'react';
import { Settings, DollarSign, Shield, BarChart3 } from 'lucide-react';
import NewCapitalManagement from '../NewCapitalManagement';
import NewOrderAndDCAManagement from '../NewOrderAndDCAManagement';
import NewRiskManagement from '../NewRiskManagement';
import NewTradeManagement from '../NewTradeManagement';
import CompoundingTableModal from '../CompoundingTableModal';
import DeploymentPlanModal from '../DeploymentPlanModal';

interface ManagementStepProps {
  data: {
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
  onChange: (data: Partial<ManagementStepProps['data']>) => void;
  deployCapital: string;
}

const ManagementStep: React.FC<ManagementStepProps> = ({ data, onChange, deployCapital }) => {
  const [showCompoundingTable, setShowCompoundingTable] = useState(false);
  const [showDeploymentPlan, setShowDeploymentPlan] = useState(false);

  const formatCurrency = (amount: number) => {
    const symbol = data.capital.currency === 'INR' ? '₹' : '$';
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

  const stepSizeAmount = data.capital.stepMode === 'percent' 
    ? (data.capital.stepPercent / 100) * data.capital.capital
    : data.capital.stepFixed;

  const enabledRiskFeatures = [
    data.risk.recoveryDrip && 'Recovery Drip',
    data.risk.timeBasedExit && 'Time Exit',
    data.risk.maxDrawdownStop && 'Max Drawdown',
    data.risk.rangeExit && 'Range Exit'
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Management Settings</h2>
        <p className="text-gray-600 text-sm">Configure capital allocation, risk management, and trade execution</p>
      </div>

      {/* Management Sections - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Capital Management */}
          <NewCapitalManagement
            value={data.capital}
            onChange={(capital) => onChange({ capital })}
            onOpenCompounding={() => setShowCompoundingTable(true)}
            onOpenDeployment={() => setShowDeploymentPlan(true)}
          />

          {/* Order & DCA Management */}
          <NewOrderAndDCAManagement
            value={data.orderDca}
            onChange={(orderDca) => onChange({ orderDca })}
            deployCapital={deployCapital}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Risk Management */}
          <NewRiskManagement
            value={data.risk}
            onChange={(risk) => onChange({ risk })}
          />

          {/* Trade Management */}
          <NewTradeManagement
            value={data.tradeMgmt}
            onChange={(tradeMgmt) => onChange({ tradeMgmt })}
          />
        </div>
      </div>

      {/* Step Summary */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <h4 className="text-base font-semibold text-emerald-900 mb-3">Step 3 Summary</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Capital Summary */}
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center space-x-2 mb-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Capital</span>
            </div>
            <div className="space-y-2 text-xs text-emerald-700">
              <div><strong>Total:</strong> {formatCurrency(data.capital.capital)}</div>
              <div><strong>Step Size:</strong> {formatCurrency(stepSizeAmount)}</div>
              <div><strong>Deploy:</strong> {data.capital.deployPlan.split(':')[0]}</div>
              <div><strong>Reinvest:</strong> {data.capital.reinvestEnabled ? `${data.capital.reinvestPercent}%` : 'Disabled'}</div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Orders</span>
            </div>
            <div className="space-y-2 text-xs text-emerald-700">
              <div><strong>Type:</strong> {data.orderDca.orderType === 'amo' ? 'AMO' : 'Market'}</div>
              <div><strong>Take Profit:</strong> {data.orderDca.takeProfitPercent}%</div>
              <div><strong>DCA:</strong> {data.orderDca.dcaEnabled ? 'Enabled' : 'Disabled'}</div>
              <div><strong>Index:</strong> {data.orderDca.tradingIndex.replace('NIFTY', 'Nifty ')}</div>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Risk</span>
            </div>
            <div className="space-y-2 text-xs text-emerald-700">
              <div><strong>Stop Loss:</strong> {data.risk.stopLossEnabled ? `${data.risk.stopLossPercent}%` : 'Disabled'}</div>
              <div><strong>Features:</strong> {enabledRiskFeatures.length}</div>
              <div><strong>Active:</strong> {enabledRiskFeatures.slice(0, 2).join(', ')}</div>
              {enabledRiskFeatures.length > 2 && (
                <div><strong>More:</strong> +{enabledRiskFeatures.length - 2} others</div>
              )}
            </div>
          </div>

          {/* Trade Summary */}
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center space-x-2 mb-3">
              <Settings className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Trade Limits</span>
            </div>
            <div className="space-y-2 text-xs text-emerald-700">
              <div><strong>New/Day:</strong> {data.tradeMgmt.maxNewPositionsPerDay}</div>
              <div><strong>DCA/Day:</strong> {data.tradeMgmt.maxDcaExecutionsPerDay}</div>
              <div><strong>Max Positions:</strong> {data.tradeMgmt.maxOpenPositions}</div>
              <div><strong>Same Day DCA:</strong> {data.tradeMgmt.dcaNewEntrySameDay ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CompoundingTableModal
        isOpen={showCompoundingTable}
        onClose={() => setShowCompoundingTable(false)}
        startingCapital={data.capital.capital}
        stepSizePercentage={data.capital.stepPercent}
        takeProfitPercent={data.orderDca.takeProfitPercent}
        reinvestMode={data.capital.reinvestPercent}
        botName="Wizard Bot"
      />

      <DeploymentPlanModal
        isOpen={showDeploymentPlan}
        onClose={() => setShowDeploymentPlan(false)}
        deployCapital={data.capital.deployPlan}
        startingCapital={data.capital.capital}
        stepSizePercentage={data.capital.stepPercent}
        takeProfitPercent={data.orderDca.takeProfitPercent}
        botName="Wizard Bot"
      />
    </div>
  );
};

export default ManagementStep;
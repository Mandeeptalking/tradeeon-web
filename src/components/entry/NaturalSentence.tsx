import React from 'react';
import { Condition, IndicatorCondition, WebhookCondition } from '../../types/strategy';
import { OPERATOR_LABELS } from '../../config/operatorConfigs';
import { getTimeframeLabel, getTimeframeColor } from '../../config/timeframePresets';

interface NaturalSentenceProps {
  condition: Condition;
  className?: string;
}

export default function NaturalSentence({ condition, className = "" }: NaturalSentenceProps) {
  const renderIndicatorCondition = (cond: IndicatorCondition) => {
    const { left, op, right, timeframe } = cond;
    
    // Build left side
    const leftText = `${left.name}${left.settings?.length ? `(${left.settings.length})` : ''}${left.component && left.component !== 'line' ? ` ${left.component}` : ''}`;
    
    // Build operator
    const opText = OPERATOR_LABELS[op];
    
    // Build right side
    let rightText = '';
    if (right.type === 'value') {
      rightText = right.value.toString();
      if (op === 'increasesByPct' || op === 'decreasesByPct') {
        rightText += '%';
      }
    } else {
      const rightIndicator = right.indicator;
      const indicatorName = rightIndicator.name || leftText.split('(')[0]; // Use same indicator name
      const componentLabel = rightIndicator.component && rightIndicator.component !== 'line' 
        ? ` ${rightIndicator.component}` 
        : '';
      const settingsText = rightIndicator.settings?.length ? `(${rightIndicator.settings.length})` : '';
      rightText = `its ${rightIndicator.component || 'line'}${settingsText}`;
    }
    
    return (
      <span className={className}>
        <span className="font-medium">{leftText}</span>
        <span className="mx-1">on</span>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getTimeframeColor(timeframe)}`}>
          {timeframe}
        </span>
        <span className="mx-1">{opText}</span>
        <span className="font-medium">{rightText}</span>
      </span>
    );
  };

  const renderWebhookCondition = (cond: WebhookCondition) => {
    return (
      <span className={className}>
        <span className="font-medium">Webhook</span>
        <span className="mx-1">arrives with</span>
        <span className="font-mono bg-gray-100 px-1 rounded">{cond.match.key}</span>
        <span className="mx-1">==</span>
        <span className="font-mono bg-gray-100 px-1 rounded">{String(cond.match.equals)}</span>
        {cond.cooldownBars && (
          <>
            <span className="mx-1">with</span>
            <span className="font-medium">{cond.cooldownBars} bar cooldown</span>
          </>
        )}
      </span>
    );
  };

  if (condition.kind === 'indicator') {
    return renderIndicatorCondition(condition);
  } else {
    return renderWebhookCondition(condition);
  }
}
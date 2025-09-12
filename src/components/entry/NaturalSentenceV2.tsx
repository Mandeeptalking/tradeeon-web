import React from 'react';
import { TriggerCondition, IndicatorCondition, WebhookTrigger } from '../../types/entry';
import { OPERATOR_LABELS } from '../../config/operatorConfigs';
import { getTimeframeLabel, getTimeframeColor } from '../../config/timeframePresets';
import { getSubjectLabel, getTargetLabel } from '../../features/createBot/hooks/useIndicatorDefs';

interface NaturalSentenceV2Props {
  condition: TriggerCondition;
  className?: string;
}

export default function NaturalSentenceV2({ condition, className = "" }: NaturalSentenceV2Props) {
  const renderIndicatorCondition = (cond: IndicatorCondition) => {
    const { left, op, right, timeframe, sequence, mustOccurWithin, staysValidFor } = cond;
    
    // Use subject/target for better phrasing if available
    let leftText = '';
    if (cond.subject) {
      if (cond.subject.kind === "price") {
        leftText = `${getSubjectLabel(cond.subject)} price`;
      } else if (cond.subject.kind === "indicator") {
        leftText = `${left.name}${left.settings?.length ? `(${left.settings.length})` : ''}`;
        if (cond.subject.component !== 'line') {
          leftText += ` ${cond.subject.component}`;
        }
      } else if (cond.subject.kind === "derived") {
        leftText = cond.subject.label;
      }
    } else {
      // Fallback to old format
      leftText = `${left.name}${left.settings?.length ? `(${left.settings.length})` : ''}${left.component && left.component !== 'line' ? ` ${left.component}` : ''}`;
    }
    
    // Build operator
    const opText = OPERATOR_LABELS[op];
    
    // Build right side using target
    let rightText = '';
    if (cond.target) {
      if (cond.target.kind === "value") {
        rightText = right.type === 'value' ? right.value.toString() : '0';
      } else if (cond.target.kind === "component") {
        rightText = cond.target.component === "zero" ? "zero line" : `${left.name} ${getTargetLabel(cond.target, left.name)}`;
      }
    } else {
      // Fallback to old format
      if (right.type === 'value') {
        rightText = right.value.toString();
      } else {
        const rightIndicator = right.indicator;
        const componentLabel = rightIndicator.component && rightIndicator.component !== 'line' 
          ? ` ${rightIndicator.component}` 
          : '';
        const settingsText = rightIndicator.settings?.length ? `(${rightIndicator.settings.length})` : '';
        rightText = `its ${rightIndicator.component || 'line'}${settingsText}`;
      }
    }
    
    // Build timing context
    let timingText = '';
    if (sequence) {
      timingText += ` (sequence ${sequence}`;
    }
    if (mustOccurWithin) {
      timingText += `${sequence ? ', ' : ' ('}within ${mustOccurWithin.amount} ${mustOccurWithin.unit}`;
    }
    if (staysValidFor) {
      timingText += `${sequence || mustOccurWithin ? ', ' : ' ('}valid ${staysValidFor.amount} ${staysValidFor.unit}`;
    }
    if (timingText) {
      timingText += ')';
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
        {timingText && <span className="text-gray-600">{timingText}</span>}
      </span>
    );
  };

  const renderWebhookCondition = (cond: WebhookTrigger) => {
    let timingText = '';
    if (cond.sequence) {
      timingText += ` (sequence ${cond.sequence}`;
    }
    if (cond.mustOccurWithin) {
      timingText += `${cond.sequence ? ', ' : ' ('}within ${cond.mustOccurWithin.amount} ${cond.mustOccurWithin.unit}`;
    }
    if (cond.staysValidFor) {
      timingText += `${cond.sequence || cond.mustOccurWithin ? ', ' : ' ('}valid ${cond.staysValidFor.amount} ${cond.staysValidFor.unit}`;
    }
    if (timingText) {
      timingText += ')';
    }

    return (
      <span className={className}>
        <span className="font-medium">Webhook</span>
        <span className="mx-1">arrives with</span>
        <span className="font-mono bg-gray-100 px-1 rounded">{cond.match.key}</span>
        <span className="mx-1">==</span>
        <span className="font-mono bg-gray-100 px-1 rounded">{String(cond.match.equals)}</span>
        {timingText && <span className="text-gray-600">{timingText}</span>}
      </span>
    );
  };

  if (condition.kind === 'indicator') {
    return renderIndicatorCondition(condition);
  } else {
    return renderWebhookCondition(condition);
  }
}
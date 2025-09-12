import React from 'react';
import { Subject, Target, Operator } from '../../types/indicators';

interface MACDIllustrationProps {
  subject: Subject;
  target: Target;
  operator: Operator;
  className?: string;
}

const MACDIllustration: React.FC<MACDIllustrationProps> = ({
  subject,
  target,
  operator,
  className = ''
}) => {
  // Determine what to highlight based on subject/target/operator
  const getIllustrationConfig = () => {
    const config = {
      highlightMacdLine: false,
      highlightSignalLine: false,
      highlightHistogram: false,
      highlightZeroLine: false,
      showCrossUp: false,
      showCrossDown: false,
      showAbove: false,
      showBelow: false
    };

    // Highlight subject
    if (subject.kind === "indicator") {
      if (subject.component === "macd") {
        config.highlightMacdLine = true;
      } else if (subject.component === "histogram") {
        config.highlightHistogram = true;
      }
    }

    // Highlight target and show interaction
    if (target.kind === "component") {
      if (target.component === "signal") {
        config.highlightSignalLine = true;
        if (operator === "crossesAbove") config.showCrossUp = true;
        if (operator === "crossesBelow") config.showCrossDown = true;
        if (operator === ">" || operator === ">=") config.showAbove = true;
        if (operator === "<" || operator === "<=") config.showBelow = true;
      } else if (target.component === "zero") {
        config.highlightZeroLine = true;
        if (operator === "crossesAbove") config.showCrossUp = true;
        if (operator === "crossesBelow") config.showCrossDown = true;
        if (operator === ">" || operator === ">=") config.showAbove = true;
        if (operator === "<" || operator === "<=") config.showBelow = true;
      }
    }

    return config;
  };

  const config = getIllustrationConfig();

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="text-xs font-medium text-gray-700 mb-3 text-center">MACD Visualization</div>
      
      <svg width="100%" height="120" viewBox="0 0 300 120" className="border border-gray-300 rounded bg-white">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Zero line */}
        <line 
          x1="20" y1="60" x2="280" y2="60" 
          stroke={config.highlightZeroLine ? "#6b7280" : "#d1d5db"} 
          strokeWidth={config.highlightZeroLine ? "3" : "2"}
          strokeDasharray={config.highlightZeroLine ? "none" : "5,5"}
        />
        <text x="285" y="65" fontSize="10" fill="#6b7280">Zero line (0)</text>
        
        {/* MACD Line (blue, wavy) */}
        <path 
          d="M 20 70 Q 60 50 100 65 T 180 55 Q 220 45 260 50 L 280 52" 
          fill="none" 
          stroke={config.highlightMacdLine ? "#2563eb" : "#60a5fa"} 
          strokeWidth={config.highlightMacdLine ? "3" : "2"}
        />
        <text x="285" y="55" fontSize="10" fill="#2563eb">MACD</text>
        
        {/* Signal Line (orange, smoother) */}
        <path 
          d="M 20 75 Q 60 55 100 68 T 180 58 Q 220 48 260 53 L 280 55" 
          fill="none" 
          stroke={config.highlightSignalLine ? "#f97316" : "#fb923c"} 
          strokeWidth={config.highlightSignalLine ? "3" : "2"}
        />
        <text x="285" y="70" fontSize="10" fill="#f97316">Signal</text>
        
        {/* Histogram bars */}
        {[40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260].map((x, i) => {
          const height = Math.sin(i * 0.5) * 15 + 5;
          const isPositive = height > 0;
          const barY = isPositive ? 60 - height : 60;
          const barHeight = Math.abs(height);
          
          return (
            <rect
              key={x}
              x={x - 2}
              y={barY}
              width="4"
              height={barHeight}
              fill={config.highlightHistogram ? (isPositive ? "#10b981" : "#ef4444") : (isPositive ? "#86efac" : "#fca5a5")}
              opacity={config.highlightHistogram ? "1" : "0.6"}
            />
          );
        })}
        
        {/* Cross indicators */}
        {config.showCrossUp && (
          <g>
            <circle cx="150" cy="58" r="4" fill="#10b981" stroke="white" strokeWidth="2"/>
            <path d="M 145 63 L 155 53" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M 145 53 L 155 63" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </g>
        )}
        
        {config.showCrossDown && (
          <g>
            <circle cx="150" cy="62" r="4" fill="#ef4444" stroke="white" strokeWidth="2"/>
            <path d="M 147 59 L 153 65" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M 147 65 L 153 59" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </g>
        )}
        
        {/* Above/Below indicators */}
        {config.showAbove && (
          <polygon points="200,45 205,55 195,55" fill="#10b981" />
        )}
        
        {config.showBelow && (
          <polygon points="200,75 195,65 205,65" fill="#ef4444" />
        )}
      </svg>
      
      <div className="text-xs text-gray-600 mt-2 text-center">
        {config.highlightMacdLine && "MACD Line highlighted"}
        {config.highlightSignalLine && "Signal Line highlighted"}
        {config.highlightHistogram && "Histogram highlighted"}
        {config.highlightZeroLine && "Zero Line highlighted"}
      </div>
    </div>
  );
};

export default MACDIllustration;
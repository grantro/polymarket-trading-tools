// src/components/IndicatorsPanel.js

import React, { useState } from 'react';

const INDICATORS = [
  { id: 'SMA_10', label: 'SMA (10)', type: 'SMA', period: 10 },
  { id: 'SMA_20', label: 'SMA (20)', type: 'SMA', period: 20 },
  { id: 'SMA_50', label: 'SMA (50)', type: 'SMA', period: 50 },
  { id: 'EMA_12', label: 'EMA (12)', type: 'EMA', period: 12 },
  { id: 'EMA_26', label: 'EMA (26)', type: 'EMA', period: 26 },
  { id: 'RSI_14', label: 'RSI (14)', type: 'RSI', period: 14 },
  { id: 'BB_20', label: 'Bollinger Bands (20)', type: 'BB', period: 20 }
];

const INDICATOR_COLORS = {
  SMA: ['#2196F3', '#1976D2', '#0D47A1'],
  EMA: ['#F44336', '#D32F2F', '#B71C1C'],
  RSI: ['#4CAF50', '#388E3C', '#1B5E20'],
  BB: ['#9C27B0', '#7B1FA2', '#4A148C']
};

function IndicatorsPanel({ activeIndicators, onIndicatorAdd, onIndicatorRemove }) {
  const handleIndicatorSelect = (e) => {
    const indicator = INDICATORS.find(i => i.id === e.target.value);
    if (indicator && !activeIndicators.some(i => i.id === indicator.id)) {
      onIndicatorAdd({
        ...indicator,
        color: INDICATOR_COLORS[indicator.type][
          activeIndicators.filter(i => i.type === indicator.type).length % 3
        ]
      });
    }
  };

  return (
    <div className="indicators-panel">
      <select
        className="indicator-select"
        onChange={handleIndicatorSelect}
        value=""
      >
        <option value="" disabled>Add Indicator</option>
        {INDICATORS.map(indicator => (
          <option 
            key={indicator.id} 
            value={indicator.id}
            disabled={activeIndicators.some(i => i.id === indicator.id)}
          >
            {indicator.label}
          </option>
        ))}
      </select>

      <div className="active-indicators">
        {activeIndicators.map(indicator => (
          <div
            key={indicator.id}
            className="indicator-chip"
            style={{ borderLeft: `3px solid ${indicator.color}` }}
          >
            <span>{indicator.label}</span>
            <button
              onClick={() => onIndicatorRemove(indicator.id)}
              className="remove-indicator-btn"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndicatorsPanel;
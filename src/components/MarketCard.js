import React, { useState } from 'react';
import TradingViewChart from './TradingViewChart';

const MarketCard = ({ 
  market, 
  expandedMarkets, 
  onToggleExpand,
}) => {
  const [currentOutcome, setCurrentOutcome] = useState('YES');
  
  const priceData = {
    YES: market?.priceData?.Yes || market?.priceData?.YES,
    NO: market?.priceData?.No || market?.priceData?.NO
  };
  
  const currentPriceData = priceData[currentOutcome];
  const containerId = `tv_chart_${market?.market_slug || market?.conditionId}`;
  
  const handleOutcomeChange = (outcome) => {
    setCurrentOutcome(outcome);
  };

  return (
    <div className="mb-8 w-full">
      <div 
        className="flex items-center px-4 py-3 bg-gray-50 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => onToggleExpand(market?.conditionId)}
      >
        <div className="flex items-center flex-1">
          <div 
            className="arrow-icon mr-2"
            style={{ 
              transform: expandedMarkets[market?.conditionId] ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            ▶
          </div>
          <h3 className="market-title">
            {market?.question || 'Unnamed Market'}
          </h3>
        </div>
      </div>

      {expandedMarkets[market?.conditionId] && (
        <div className="chart-wrapper">
          {currentPriceData && (
            <TradingViewChart
              data={currentPriceData}
              containerId={containerId}
              symbol={market?.market_slug}
              onOutcomeChange={handleOutcomeChange}
              currentOutcome={currentOutcome}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MarketCard;
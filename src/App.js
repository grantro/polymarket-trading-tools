import React, { useState } from 'react';
import TradingViewChart from './components/TradingViewChart';
import { useAppContext } from './context/AppContext';
import API from './services/api';
import './App.css';

function App() {
  const { 
    eventData, 
    setEventData, 
    marketsData, 
    setMarketsData,
    expandedMarkets, 
    setExpandedMarkets 
  } = useAppContext();
  
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeIndicators, setActiveIndicators] = useState([]);

const handleIndicatorAdd = (indicator) => {
  setActiveIndicators(prev => [...prev, indicator]);
};

const handleIndicatorRemove = (indicatorId) => {
  setActiveIndicators(prev => prev.filter(ind => ind.id !== indicatorId));
};

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setEventData(null);
    setMarketsData([]);
    
    try {
      const event = await API.fetchEvent(slug);
      if (event && event.length > 0) {
        setEventData(event[0]);

        if (event[0].markets && event[0].markets.length > 0) {
          const marketsPromises = event[0].markets.map(async (market) => {
            const marketData = await API.fetchMarketData(market.conditionId);
            const priceDataPromises = marketData.tokens.map(token => 
              API.fetchPriceHistory(token.token_id).then(data => ({ [token.outcome]: data }))
            );
            const priceDataResults = await Promise.all(priceDataPromises);
            const combinedPriceData = Object.assign({}, ...priceDataResults);
            
            return {
              ...marketData,
              priceData: combinedPriceData
            };
          });

          const allMarketsData = await Promise.all(marketsPromises);
          console.log("Fetched markets data:", allMarketsData);
          setMarketsData(allMarketsData);

          setExpandedMarkets(
            allMarketsData.reduce((acc, market) => {
              acc[market.conditionId] = false;
              return acc;
            }, {})
          );

        } else {
          setError('No markets found for this event.');
        }
      } else {
        setError('Event not found.');
      }
    } catch (error) {
      console.error('Error in handleSearch:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMarketExpansion = (conditionId) => {
    setExpandedMarkets(prev => ({
      ...prev,
      [conditionId]: !prev[conditionId]
    }));
  };

  return (
    <div className="App">
      <header>
        <h1>Polymarket Visualizer</h1>
      </header>
      <main>
        <div className="search-container">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Enter event slug..."
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
        
        {error && <p className="error">{error}</p>}
        
        {eventData && (
          <div className="event-info">
            <h2>{eventData.title}</h2>
            <p>{eventData.description}</p>
          </div>
        )}
        
        {marketsData.length > 0 && (
          <div className="markets-container">
            {marketsData.map((market) => (
              <div key={market.conditionId} className="market-container">
                <div 
                  className="market-header"
                  onClick={() => toggleMarketExpansion(market.conditionId)}
                >
                  <h3>{market.question}</h3>
                  <span className="expand-icon">
                    {expandedMarkets[market.conditionId] ? '▼' : '▶'}
                  </span>
                </div>
                {expandedMarkets[market.conditionId] && (
                  <div className="outcomes-container">
                    {market.tokens.map(token => (
                      <div key={token.token_id} className="outcome-chart">
                        <h4 className={`outcome-header ${token.outcome.toLowerCase()}`}>
                          {token.outcome}
                        </h4>
                        <TradingViewChart
                          data={market.priceData[token.outcome]}
                          tokenId={token.token_id}
                          activeIndicators={activeIndicators}
                          onIndicatorAdd={handleIndicatorAdd}
                          onIndicatorRemove={handleIndicatorRemove}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
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
    setExpandedMarkets 
  } = useAppContext();
  
  const [selectedMarket, setSelectedMarket] = useState(null)

  const handleMarketSelect = (market) => {
    setSelectedMarket(market);
  };

  const [currentOutcome, setCurrentOutcome] = useState('YES');
  const handleOutcomeChange = (outcome) => {
    setCurrentOutcome(outcome);
  };

  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [setIsNetworkError] = useState(false);

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
              API.fetchPriceHistory(token.token_id).then(data => ({ 
                [token.outcome]: data 
              }))
            );
            const priceDataResults = await Promise.all(priceDataPromises);
            const combinedPriceData = Object.assign({}, ...priceDataResults);
            
            return {
              ...marketData,
              priceData: combinedPriceData,
              question: market.question // Ensure we have the question
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
      if (!navigator.onLine) {
        setIsNetworkError(true);
        setError('No internet connection. Please check your network.');
      } else if (error.response?.status === 429) {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Failed to fetch data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Prediction Terminal</h1>
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
          <div className="market-slugs mt-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Markets:</h3>
            <ul className="list-none pl-0">
            {marketsData.map((market) => (
              <li 
                key={market.conditionId} 
                className={`text-sm px-3 py-2 rounded cursor-pointer transition-colors
                  ${selectedMarket?.conditionId === market.conditionId 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => handleMarketSelect(market)}
              >
                {market.market_slug || market.conditionId}
              </li>
            ))}
            </ul>
          </div>
        </div>
      )}
      {selectedMarket && (
        <div className="chart-wrapper mt-4">
          <TradingViewChart
            data={currentOutcome === 'YES' ? 
              (selectedMarket.priceData?.YES || selectedMarket.priceData?.Yes) : 
              (selectedMarket.priceData?.NO || selectedMarket.priceData?.No)}
            containerId={`tv_chart_${selectedMarket.market_slug || selectedMarket.conditionId}`}
            symbol={selectedMarket.market_slug}
            currentOutcome={currentOutcome}
            onOutcomeChange={handleOutcomeChange}
          />
        </div>
      )}
      </main>
    </div>
  );
}

export default App;
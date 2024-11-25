import React, { useState } from 'react';
import MarketCard from './components/MarketCard';
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

  const [isNetworkError, setIsNetworkError] = useState(false);

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

  const toggleMarketExpansion = (conditionId) => {
    setExpandedMarkets(prev => ({
      ...prev,
      [conditionId]: !prev[conditionId]
    }));
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
          </div>
        )}

        {marketsData.length > 0 && (
          <div className="markets-container">
            {marketsData.map((market) => (
              <div key={market.conditionId} className="border border-gray-200 rounded-lg mb-4 bg-white">
                <MarketCard
                  market={market}
                  expandedMarkets={expandedMarkets}
                  onToggleExpand={toggleMarketExpansion}
                  activeIndicators={activeIndicators}
                  onIndicatorAdd={handleIndicatorAdd}
                  onIndicatorRemove={handleIndicatorRemove}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
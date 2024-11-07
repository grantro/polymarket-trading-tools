import axios from 'axios';

const API = {
  fetchEvent: async (eventSlug) => {
    console.log('Fetching event for slug:', eventSlug);
    const baseUrl = "https://gamma-api.polymarket.com";
    const eventsEndpoint = `${baseUrl}/events`;
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
    };

    const params = { slug: eventSlug };

    try {
      const response = await axios.get(eventsEndpoint, { params, headers });
      console.log('Event data received:', response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },

  fetchMarketData: async (conditionId) => {
    console.log('Fetching market data for condition ID:', conditionId);
    const url = `https://clob.polymarket.com/markets/${conditionId}`;
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'PolymarketVisualizer/1.0'
    };

    try {
      const response = await axios.get(url, { headers });
      console.log('Market data received:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching market data for ${conditionId}:`, error);
      throw error;
    }
  },

  fetchPriceHistory: async (tokenId, timeScale = '12h') => {
    const TIME_SCALE_FIDELITY = {
      '1h': 60,
      '6h': 360,
      '12h': 720,
      '1d': 1440
    };

    const fidelity = TIME_SCALE_FIDELITY[timeScale] || 720;
    const url = 'https://clob.polymarket.com/prices-history';
    const params = {
      interval: 'all',
      market: tokenId,
      fidelity
    };

    try {
      const response = await axios.get(url, {
        params,
        headers: {
          'Accept-Encoding': 'gzip',
          'User-Agent': 'PolymarketVisualizer/1.0'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  }
};

export default API;
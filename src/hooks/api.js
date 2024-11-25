import axios from 'axios';

// src/api.js
const API = {
  fetchEvent: async (eventSlug) => {
    const baseUrl = "https://gamma-api.polymarket.com";
    const eventsEndpoint = `${baseUrl}/events`;
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const params = { slug: eventSlug };

    try {
      const response = await axios.get(eventsEndpoint, { params, headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  fetchMarketData: async (conditionId) => {
    const url = `https://clob.polymarket.com/markets/${conditionId}`;
    const headers = {
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
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
      // Remove problematic headers, only keep essential ones
      const response = await axios.get(url, {
        params,
        headers: {
          'Content-Type': 'application/json'
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
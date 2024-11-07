import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://trading-api.kalshi.com/trade-api/v2';
const API_KEY_ID = 'a6147f71-f581-4470-9d57-3ab31f913509';
const SECRET_KEY = 'MIIEpQIBAAKCAQEAxF0cNsFp+tofR8TLqA3C5cuN9M4Jwoa+U1TMKHltDqzMVtWHwQj4wVzeW7Aw7rs1TGxkHIYeKaSQdLL95gm5x3e9BwfxavE4/9rDbIza3A2GkIN4AkBPPLxxj6BM6/U6/ydFLZMIlVISACs5foF+1+S4WyKtuydF9lfr3fTJCHNaj7WhvXgl3zdM610hcNude40hBflqp9tmoZvXiLGv8g5RBpd7u12/7QtvEJmp3hM20+Z179G5VKtJDiiXcxB+D/gKUeaGwlq76A6BmV4QWyvdjbgJ0y2gwQifadlkkhemVYVs3YTV0qQLUDv2N0o0PTDXr0yDNUay5vCYayR4lwIDAQABAoIBAAMee4E/J0DN0Ctiq916gnsF9bZKw4rsev913FxUOXA/PGuwrpxZWSIxKHMKZGyWWq1hF2IAm2AL9iN0aGYMB4BsnXsMHECXnlEqF2qU/jD6ogWPoQtgHCIZ2C/w2ufwmERPSmED8eH1UMXh6eLhibNCNc90yI+tewYDtYJsDfltXIN8R7xbzyBNEt6rvEOdNejD820AlTdZK3oDfVEcQNwNlnm1DCziUN2pxm+BJAEBSCIjUKZokXWQcs1VgRzW5g4++hglLN3DGyaJnpBPQTmhR7A7Shjzrs7tnfXZXUeyU3H9x41E1rAw4YXRnhfE1240Q9HwhTfpvwZwJ3rz9AkCgYEA08PYF72secSlB8pRK9sV4TL+ntSifFVJaPeh51N/SFOLnfqhBTO9oA32F371pP8d75D5FcrA7u4tNlidHrttf66b91qn4v/2a/KgT4crgEFr0ImWio+AjZ9/q7FQC3oBswhiK4LvQLva9SXGHlrQPou/q9Gsxzz1+uAgD/BoZBUCgYEA7WGuBcjScFGbkqfoEkV8kb7gmRMW8E6KaRWyS4qiy+DMWDsM3tDJvvwwnVc3ccbJt4re6yf2go9WY+pXeR/nI3pvavlkQyETrEPvRv3UvKPU4CIjYi/Pj+ghsbNK2m5/5+k9b1QYLNARNfaJic91e/PqKCBuBSWSo9DqIOv++PsCgYEAlXeI4ZDl2PicBvic/FhhhBcLMq4glaNY8ja+1tjPYQxe4j2RQ2u2ru7LwN/CoBfVWE86EFCQhtQjo1U+aP+flNx4h0k8cHN7yctxrVBZuufyIjnKwLfy44MtiNDZD5Co/GWxbMa4+jbdn+RuhuRQUaUvvyV6TxJPCCkDWFy2QdUCgYEA2z7mre0HgDm/iLqP+6A2J562bmtVOmowKFKjtGW9arSbx7nybzFDxKPEeu39BZbm5CDdNzBX28prrijY1cSDhR8mHRVuZxn7w5WTQGxcukZO7RxatesWuAFcbXX9YrXAaP/hgBuZoHokC0VDTwdPqUZlNN6O/y3uvGLOe828V1UCgYEAoT+8Ol3fb2svjcXfYboOBCgFHaf3WBzJge6J1ZyvS11N6M72nzfdI7ZtIETofohcYerPvocil0gic5LhqKIGhJqs9KJGJY7UsxaIDhQ6dEW/vNUQlTaKeTWTmiVus73QXtSC9VV5kEF08U9Kkq9HGJFH/KZf9AOwcYkqpUtAB3k=EY';

const generateAuthHeader = (method, path, body = '') => {
    const timestamp = Date.now().toString();
    const message = `${timestamp}${method}${path}${body}`;
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(message)
      .digest('hex');
  
    return `Kalshi ${API_KEY_ID}:${timestamp}:${signature}`;
  };
  
  const kalshiAPI = {
    findSpecificMarket: async (searchTerm) => {
      const path = '/markets';
      const method = 'GET';
  
      try {
        const response = await axios.get(`${BASE_URL}${path}`, {
          headers: {
            'Authorization': generateAuthHeader(method, path),
          },
          params: {
            title: searchTerm,  // This will search for markets with titles containing the searchTerm
            limit: 100,  // Increase this if necessary
          },
        });
  
        // Filter the results to find the most relevant market
        const markets = response.data.markets;
        const exactMatch = markets.find(market => market.title.toLowerCase() === searchTerm.toLowerCase());
        
        if (exactMatch) {
          return exactMatch;
        } else if (markets.length > 0) {
          // Return the first market if no exact match is found
          return markets[0];
        } else {
          throw new Error('No matching market found');
        }
      } catch (error) {
        console.error('Error finding specific Kalshi market:', error);
        throw error;
      }
    },
  
    fetchMarketPriceHistory: async (marketId) => {
      const path = `/markets/${marketId}/price_history`;
      const method = 'GET';
  
      try {
        const response = await axios.get(`${BASE_URL}${path}`, {
          headers: {
            'Authorization': generateAuthHeader(method, path),
          },
        });
  
        // Process and format the data
        const formattedData = processPrice12HourIntervals(response.data.history);
  
        return formattedData;
      } catch (error) {
        console.error('Error fetching Kalshi market price history:', error);
        throw error;
      }
    },
  };
  
  function processPrice12HourIntervals(history) {
    const intervalData = [];
    const millisecondsIn12Hours = 12 * 60 * 60 * 1000;
  
    history.forEach(dataPoint => {
      const timestamp = new Date(dataPoint.ts * 1000);
      const hours = timestamp.getUTCHours();
      
      // Check if the timestamp is at 00:00 UTC or 12:00 UTC
      if (hours === 0 || hours === 12) {
        intervalData.push({
          timestamp: timestamp.getTime(),
          price: dataPoint.yes_price / 100, // Convert cents to dollars
        });
      }
    });
  
    return intervalData;
  }
  
  module.exports = kalshiAPI;
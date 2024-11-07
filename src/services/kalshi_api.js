const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'https://trading-api.kalshi.com/trade-api/v2';

const generateAuthHeader = (apiKey, privateKeyPem, method, path, queryParams) => {
  if (!apiKey || !privateKeyPem) {
    console.error('API Key or Private Key is missing');
    console.log('API Key:', apiKey ? '[REDACTED]' : 'undefined');
    console.log('Private Key:', privateKeyPem ? '[REDACTED PEM]' : 'undefined');
    throw new Error('API Key or Private Key is missing');
  }

  const timestamp = Date.now().toString();
  const message = `${timestamp}${method.toUpperCase()}${path}${queryParams}`;
  console.log('Message to sign:', message);

  try {
    const sign = crypto.createSign('SHA256');
    sign.update(message);
    sign.end();

    const signature = sign.sign({
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    });

    const encodedSignature = signature.toString('base64');

    return {
      'KALSHI-ACCESS-KEY': apiKey,
      'KALSHI-ACCESS-SIGNATURE': encodedSignature,
      'KALSHI-ACCESS-TIMESTAMP': timestamp
    };
  } catch (error) {
    console.error('Error generating auth header:', error);
    throw error;
  }
};

const kalshiApi = {
  getMarketCandlesticks: async ({ series_ticker, ticker, start_ts, end_ts, period_interval }) => {
    const apiKey = process.env.KALSHI_API_KEY;
    const privateKeyPem = process.env.KALSHI_PRIVATE_KEY;

    console.log('API Key:', apiKey ? '[REDACTED]' : 'undefined');
    console.log('Private Key:', privateKeyPem ? '[REDACTED PEM]' : 'undefined');

    const method = 'GET';
    const path = `/series/${series_ticker}/markets/${ticker}/candlesticks`;
    const queryParams = `?ticker=${ticker}&start_ts=${start_ts}&end_ts=${end_ts}&period_interval=${period_interval}`;
    const fullUrl = `${BASE_URL}${path}${queryParams}`;

    console.log('Full URL:', fullUrl);

    try {
      const authHeaders = generateAuthHeader(apiKey, privateKeyPem, method, path, queryParams);
      console.log('Auth Headers:', JSON.stringify({
        ...authHeaders,
        'KALSHI-ACCESS-KEY': '[REDACTED]',
        'KALSHI-ACCESS-SIGNATURE': '[REDACTED]'
      }, null, 2));

      const headers = {
        ...authHeaders,
        'Content-Type': 'application/json'
      };

      const response = await axios.get(fullUrl, { headers });

      return { data: response.data };
    } catch (error) {
      console.error('Error fetching Kalshi market candlesticks:', error.response ? error.response.data : error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      }
      throw error;
    }
  }
};

module.exports = kalshiApi;
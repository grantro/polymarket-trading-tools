require('dotenv').config();
const kalshiApi = require('./kalshi_api');

async function testKalshiAPI() {
  console.log('Environment variables loaded:');
  console.log('KALSHI_API_KEY:', process.env.KALSHI_API_KEY ? '[REDACTED]' : 'undefined');
  console.log('KALSHI_PRIVATE_KEY:', process.env.KALSHI_PRIVATE_KEY ? '[REDACTED PEM]' : 'undefined');

  const series_ticker = 'HIGHMIA';
  const ticker = 'HIGHMIA-24OCT03-B90.5';
  const end_ts = Math.floor(Date.now() / 1000);
  const start_ts = end_ts - (30 * 24 * 60 * 60);
  const period_interval = 1440;

  console.log('Test parameters:');
  console.log('Series Ticker:', series_ticker);
  console.log('Market Ticker:', ticker);
  console.log('Start Timestamp:', start_ts, '(', new Date(start_ts * 1000).toISOString(), ')');
  console.log('End Timestamp:', end_ts, '(', new Date(end_ts * 1000).toISOString(), ')');
  console.log('Period Interval:', period_interval);

  console.log(`\nFetching candlesticks for market: ${ticker}`);

  try {
    const { data } = await kalshiApi.getMarketCandlesticks({
      series_ticker,
      ticker,
      start_ts,
      end_ts,
      period_interval
    });

    console.log(`\nFetched ${data.candlesticks.length} candlesticks`);
    if (data.candlesticks.length > 0) {
      console.log('First candlestick:', JSON.stringify(data.candlesticks[0], null, 2));
      console.log('Last candlestick:', JSON.stringify(data.candlesticks[data.candlesticks.length - 1], null, 2));
    } else {
      console.log('No candlesticks returned. This could be due to no data in the specified time range.');
    }
  } catch (err) {
    console.error("\nError testing Kalshi API:", err.message);
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", JSON.stringify(err.response.data, null, 2));
    }
  }
}

testKalshiAPI();
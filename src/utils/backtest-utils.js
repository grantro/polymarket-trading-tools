// Calculate Simple Moving Average
const calculateSMA = (prices, period) => {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };
  
  // Calculate maximum drawdown
  const calculateMaxDrawdown = (equityCurve) => {
    let maxDrawdown = 0;
    let peak = equityCurve[0];
  
    for (const value of equityCurve) {
      if (value > peak) {
        peak = value;
      }
      const drawdown = (peak - value) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  
    return maxDrawdown;
  };
  
  // Main backtest function
  export const runBacktest = (priceHistory, params) => {
    const { fastPeriod, slowPeriod, capital } = params;
    
    // Extract prices and convert to array
    const prices = priceHistory.map(candle => candle.p);
    const timestamps = priceHistory.map(candle => candle.t);
    
    // Calculate SMAs
    const fastSMA = calculateSMA(prices, fastPeriod);
    const slowSMA = calculateSMA(prices, slowPeriod);
    
    // Initialize variables
    let position = 0; // 1 for long, -1 for short, 0 for no position
    let equity = capital;
    let trades = [];
    let equityCurve = [{
      timestamp: timestamps[slowPeriod - 1],
      value: equity
    }];
    
    // Trading simulation
    for (let i = slowPeriod; i < prices.length; i++) {
      const previousFastSMA = fastSMA[i - slowPeriod];
      const previousSlowSMA = slowSMA[i - slowPeriod];
      const currentFastSMA = fastSMA[i - slowPeriod + 1];
      const currentSlowSMA = slowSMA[i - slowPeriod + 1];
      
      // Check for crossover signals
      if (previousFastSMA <= previousSlowSMA && currentFastSMA > currentSlowSMA) {
        // Bullish crossover
        if (position <= 0) {
          // Close short position if exists and open long
          if (position < 0) {
            const profit = equity * (1 - prices[i] / prices[trades[trades.length - 1].entryPrice]);
            equity += profit;
            trades[trades.length - 1].exitPrice = prices[i];
            trades[trades.length - 1].profit = profit;
          }
          
          // Open long position
          trades.push({
            type: 'long',
            entryPrice: prices[i],
            timestamp: timestamps[i],
          });
          position = 1;
        }
      } else if (previousFastSMA >= previousSlowSMA && currentFastSMA < currentSlowSMA) {
        // Bearish crossover
        if (position >= 0) {
          // Close long position if exists and open short
          if (position > 0) {
            const profit = equity * (prices[i] / prices[trades[trades.length - 1].entryPrice] - 1);
            equity += profit;
            trades[trades.length - 1].exitPrice = prices[i];
            trades[trades.length - 1].profit = profit;
          }
          
          // Open short position
          trades.push({
            type: 'short',
            entryPrice: prices[i],
            timestamp: timestamps[i],
          });
          position = -1;
        }
      }
      
      // Update equity curve
      equityCurve.push({
        timestamp: timestamps[i],
        value: equity
      });
    }
    
    // Close final position if open
    if (position !== 0) {
      const lastPrice = prices[prices.length - 1];
      const lastTrade = trades[trades.length - 1];
      if (position === 1) {
        const profit = equity * (lastPrice / lastTrade.entryPrice - 1);
        equity += profit;
        lastTrade.exitPrice = lastPrice;
        lastTrade.profit = profit;
      } else {
        const profit = equity * (1 - lastPrice / lastTrade.entryPrice);
        equity += profit;
        lastTrade.exitPrice = lastPrice;
        lastTrade.profit = profit;
      }
    }
    
    // Calculate statistics
    const profitableTrades = trades.filter(t => t.profit > 0).length;
    const winningTrades = trades.filter(t => t.profit > 0);
    const losingTrades = trades.filter(t => t.profit <= 0);
    
    return {
      finalValue: equity,
      totalTrades: trades.length,
      profitableTrades,
      avgWin: winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length || 0,
      avgLoss: Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length) || 0,
      maxDrawdown: calculateMaxDrawdown(equityCurve.map(e => e.value)),
      trades,
      equityCurve,
    };
  };
export const calculateSMA = (data, period) => {
    if (!data || !Array.isArray(data) || period <= 0) return [];
    
    const result = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, candle) => acc + candle.value, 0);
      
      // Only add points where we have a full period's worth of data
      result.push({
        time: data[i].time,
        value: sum / period
      });
    }
    
    return result;
  };
  
  export const calculateEMA = (data, period) => {
    if (!data || !Array.isArray(data) || period <= 0) return [];
    
    const k = 2 / (period + 1);
    const result = [];
    
    // Calculate initial SMA
    const firstSMA = data
      .slice(0, period)
      .reduce((acc, candle) => acc + candle.value, 0) / period;
    
    let ema = firstSMA;
    // Start adding EMA values after we have enough data for the initial SMA
    for (let i = period; i < data.length; i++) {
      ema = data[i].value * k + ema * (1 - k);
      result.push({
        time: data[i].time,
        value: ema
      });
    }
    
    return result;
  };
  
  export const calculateRSI = (data, period) => {
    if (!data || !Array.isArray(data) || period <= 0) return [];
    
    const result = [];
    let gains = 0;
    let losses = 0;
    
    // Calculate first average gain/loss
    for (let i = 1; i <= period; i++) {
      const change = data[i].value - data[i - 1].value;
      if (change >= 0) gains += change;
      else losses -= change;
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Start adding RSI values after we have enough data
    let rsi = 100 - (100 / (1 + avgGain / avgLoss));
    result.push({ 
      time: data[period].time,
      value: rsi 
    });
    
    // Calculate remaining RSI values
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i].value - data[i - 1].value;
      const gain = change >= 0 ? change : 0;
      const loss = change < 0 ? -change : 0;
      
      avgGain = ((avgGain * (period - 1)) + gain) / period;
      avgLoss = ((avgLoss * (period - 1)) + loss) / period;
      
      rsi = 100 - (100 / (1 + avgGain / avgLoss));
      result.push({
        time: data[i].time,
        value: rsi
      });
    }
    
    return result;
  };
  
  export const calculateBollingerBands = (data, period, stdDev = 2) => {
    const smaData = calculateSMA(data, period);
    const result = [];
  
    // Start processing after we have enough data for SMA
    for (let i = period - 1; i < data.length; i++) {
      const windowData = data.slice(i - period + 1, i + 1);
      const sma = smaData[i - (period - 1)].value;
      
      // Calculate standard deviation
      const squaredDiffs = windowData.map(d => Math.pow(d.value - sma, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b) / period;
      const sd = Math.sqrt(variance);
      
      result.push({
        time: data[i].time,
        upper: sma + (sd * stdDev),
        middle: sma,
        lower: sma - (sd * stdDev)
      });
    }
  
    return result;
  };
  
  export const formatPolymarketData = (rawData) => {
    if (!rawData?.history || !Array.isArray(rawData.history)) {
      console.warn('Invalid price history data format:', rawData);
      return [];
    }
  
    return rawData.history
      .map(item => ({
        time: item.t,
        value: item.p
      }))
      .sort((a, b) => a.time - b.time);
  };
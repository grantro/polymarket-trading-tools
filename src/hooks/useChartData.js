// src/hooks/useChartData.js
import { useState, useMemo } from 'react';

export const calculateSMA = (data, period) => {
  return data.map((entry, index, arr) => {
    if (index < period - 1) return { ...entry, [`SMA_${period}`]: null };
    const sum = arr.slice(index - period + 1, index + 1).reduce((acc, val) => acc + val.price, 0);
    return { ...entry, [`SMA_${period}`]: sum / period };
  });
};

export const calculateEMA = (data, period) => {
  const k = 2 / (period + 1);
  return data.reduce((acc, entry, index) => {
    if (index === 0) {
      acc.push({ ...entry, [`EMA_${period}`]: entry.price });
    } else {
      const ema = entry.price * k + acc[index - 1][`EMA_${period}`] * (1 - k);
      acc.push({ ...entry, [`EMA_${period}`]: ema });
    }
    return acc;
  }, []);
};

export const calculateRSI = (data, period = 14) => {
  let gains = 0;
  let losses = 0;
  return data.map((entry, index, arr) => {
    if (index < period) {
      return { ...entry, RSI: null };
    }
    if (index === period) {
      for (let i = 1; i <= period; i++) {
        const change = arr[i].price - arr[i - 1].price;
        if (change >= 0) gains += change;
        else losses -= change;
      }
    } else {
      const change = entry.price - arr[index - 1].price;
      if (change >= 0) {
        gains = (gains * (period - 1) + change) / period;
        losses = (losses * (period - 1)) / period;
      } else {
        gains = (gains * (period - 1)) / period;
        losses = (losses * (period - 1) - change) / period;
      }
    }
    const rs = gains / losses;
    const rsi = 100 - (100 / (1 + rs));
    return { ...entry, RSI: rsi };
  });
};

export const calculateBollingerBands = (data, period, stdDev) => {
  return data.map((entry, index, arr) => {
    if (index < period - 1) {
      return { ...entry, [`BB_${period}_upper`]: null, [`BB_${period}_lower`]: null };
    }
    const slice = arr.slice(index - period + 1, index + 1);
    const avg = slice.reduce((sum, e) => sum + e.price, 0) / period;
    const squareDiffs = slice.map(e => Math.pow(e.price - avg, 2));
    const stdDeviation = Math.sqrt(squareDiffs.reduce((sum, sq) => sum + sq, 0) / period);
    return {
      ...entry,
      [`BB_${period}_upper`]: avg + stdDeviation * stdDev,
      [`BB_${period}_lower`]: avg - stdDeviation * stdDev
    };
  });
};

export const calculateAlligator = (data) => {
  const calculateSMA = (period, offset) => {
    return data.map((entry, index, arr) => {
      if (index < period + offset - 1) return { ...entry, [`SMA${period}`]: null };
      const slice = arr.slice(index - period - offset + 1, index - offset + 1);
      const sum = slice.reduce((acc, val) => acc + val.price, 0);
      return { ...entry, [`SMA${period}`]: sum / period };
    });
  };

  const jaw = calculateSMA(13, 8);
  const teeth = calculateSMA(8, 5);
  const lips = calculateSMA(5, 3);

  return data.map((entry, index) => ({
    ...entry,
    alligatorJaw: jaw[index].SMA13,
    alligatorTeeth: teeth[index].SMA8,
    alligatorLips: lips[index].SMA5
  }));
};

export const useChartData = (initialData) => {
    const [indicators, setIndicators] = useState([]);
  
    const processedData = useMemo(() => {
        console.log('Initial data in useChartData:', initialData);

        if (!initialData || !initialData.history) {
            return [];
          }
    
      // Check if initialData has a history property and use that as the base data
      const baseData = initialData.history.map(item => ({
        timestamp: new Date(item.t * 1000).getTime(), // Store as milliseconds
        price: item.p
      }));

      console.log('Converted base data:', baseData[0], baseData[baseData.length - 1]);
    
      return indicators.reduce((acc, indicator) => {
        console.log('Processing indicator:', indicator);
        try {
          const [type, period] = indicator.split('_');
          return calculateIndicator(type, acc, parseInt(period));
        } catch (error) {
          console.error('Error processing indicator:', indicator, error);
          return acc;
        }
      }, baseData);
    }, [initialData, indicators]);

  const addIndicator = (indicator) => {
    if (!indicators.includes(indicator)) {
      setIndicators([...indicators, indicator]);
    }
  };

  const removeIndicator = (indicator) => {
    setIndicators(indicators.filter(i => i !== indicator));
  };

  return { processedData, indicators, addIndicator, removeIndicator };
};

const calculateIndicator = (type, data, period) => {
  switch(type) {
    case 'SMA':
      return calculateSMA(data, period);
    case 'EMA':
      return calculateEMA(data, period);
    case 'RSI':
      return calculateRSI(data, period);
    case 'BB':
      return calculateBollingerBands(data, period);
    case 'MACD':
      return calculateMACD(data);
    case 'Stochastic':
      return calculateStochastic(data, period);
    case 'SuperGuppy':
      return calculateSuperGuppy(data);
    default:
      console.error('Unknown indicator type:', type);
      return data;
  }
};

const calculateMACD = (data) => {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(ema12, 26);
  
  return ema26.map((entry, index) => ({
    ...entry,
    MACD: entry.EMA_12 - entry.EMA_26,
    Signal: calculateEMA(ema26.slice(0, index + 1).map(e => ({ price: e.MACD })), 9).slice(-1)[0].EMA_9
  }));
};

const calculateStochastic = (data, period = 14) => {
  return data.map((entry, index, arr) => {
    if (index < period - 1) {
      return { ...entry, Stochastic: null };
    }
    
    const slice = arr.slice(index - period + 1, index + 1);
    const low = Math.min(...slice.map(e => e.price));
    const high = Math.max(...slice.map(e => e.price));
    const stochastic = ((entry.price - low) / (high - low)) * 100;
    
    return { ...entry, Stochastic: stochastic };
  });
};

const calculateSuperGuppy = (data) => {
  const shortEMAs = [3, 5, 8, 10, 12, 15];
  const longEMAs = [30, 35, 40, 45, 50, 60];

  let result = data;

  shortEMAs.forEach(period => {
    result = calculateEMA(result, period);
  });

  longEMAs.forEach(period => {
    result = calculateEMA(result, period);
  });

  return result.map(entry => ({
    ...entry,
    SuperGuppyShort: shortEMAs.map(period => entry[`EMA_${period}`]),
    SuperGuppyLong: longEMAs.map(period => entry[`EMA_${period}`])
  }));
};
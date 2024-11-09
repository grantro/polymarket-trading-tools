import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { formatPolymarketData, calculateSMA, calculateEMA, calculateRSI } from '../utils/indicator-utils';
import IndicatorsPanel from './IndicatorsPanel';
import TimeScaleSelector from './TimeScaleSelector';
import API from '../services/api';

function TradingViewChart({ 
  data, 
  tokenId, // Add this prop to support refetching
  activeIndicators, 
  onIndicatorAdd, 
  onIndicatorRemove 
}) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [timeScale, setTimeScale] = useState('12h');
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(data);

  // Handle time scale changes
  const handleTimeScaleChange = async (newScale) => {
    setIsLoading(true);
    try {
      const newData = await API.fetchPriceHistory(tokenId, newScale);
      setChartData(newData);
      setTimeScale(newScale);
      
      if (chartRef.current?.mainSeries) {
        const formattedData = formatPolymarketData(newData);
        chartRef.current.mainSeries.setData(formattedData);
        updateIndicators(formattedData);
      }
    } catch (error) {
      console.error('Failed to fetch data for new time scale:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update indicators when data changes
  const updateIndicators = (formattedData) => {
    if (!chartRef.current?.chart) return;

    // Clear existing indicator series
    if (chartRef.current.indicatorSeries) {
      chartRef.current.indicatorSeries.forEach(series => {
        chartRef.current.chart.removeSeries(series);
      });
    }
    chartRef.current.indicatorSeries = [];

    // Add new indicator series
    activeIndicators.forEach(indicator => {
      try {
        let indicatorData;
        
        switch (indicator.type) {
          case 'SMA':
            indicatorData = calculateSMA(formattedData, indicator.period);
            break;
          case 'EMA':
            indicatorData = calculateEMA(formattedData, indicator.period);
            break;
          case 'RSI':
            indicatorData = calculateRSI(formattedData, indicator.period);
            break;
          default:
            return;
        }

        if (indicatorData && indicatorData.length > 0) {
          const series = chartRef.current.chart.addLineSeries({
            color: indicator.color,
            lineWidth: 1,
            title: indicator.label,
          });
          series.setData(indicatorData);
          chartRef.current.indicatorSeries.push(series);
        }
      } catch (error) {
        console.error(`Error adding ${indicator.label}:`, error);
      }
    });
  };

// Move handleResize definition before the event listener setup

useEffect(() => {
  if (!chartContainerRef.current || !data) return;

  // First, define the handleResize function
  const handleResize = () => {
    if (chartRef.current?.chart && chartContainerRef.current) {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    }
  };

  const chart = createChart(chartContainerRef.current, {
    layout: {
      background: { color: '#ffffff' },
      textColor: '#191919',
    },
    grid: {
      vertLines: { color: '#f0f0f0' },
      horzLines: { color: '#f0f0f0' },
    },
    width: chartContainerRef.current.clientWidth,
    height: 300,
    rightPriceScale: {
      borderVisible: false,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false,
    },
    crosshair: {
      mode: 1,
      vertLine: {
        width: 1,
        color: '#758696',
        style: 1,
      },
      horzLine: {
        width: 1,
        color: '#758696',
        style: 1,
      },
    },
  });

  // Add event listener after function is defined
  window.addEventListener('resize', handleResize);

  const mainSeries = chart.addAreaSeries({
    lineColor: '#2962FF',
    topColor: 'rgba(41, 98, 255, 0.3)',
    bottomColor: 'rgba(41, 98, 255, 0)',
    lineWidth: 2,
  });

  const formattedData = formatPolymarketData(data);
  
  if (formattedData.length > 0) {
    mainSeries.setData(formattedData);
    updateIndicators(formattedData);
    chart.timeScale().fitContent();
  }

  chartRef.current = {
    chart,
    mainSeries,
    indicatorSeries: [],
  };

  // Clean up
  return () => {
    window.removeEventListener('resize', handleResize);
    chart.remove();
  };
}, [data, updateIndicators]);

  return (
    <div className="trading-view-chart space-y-4">
      <div className="flex justify-between items-center">
        <TimeScaleSelector 
          currentScale={timeScale} 
          onScaleChange={handleTimeScaleChange}
          disabled={isLoading}
        />
        <IndicatorsPanel 
          activeIndicators={activeIndicators}
          onIndicatorAdd={onIndicatorAdd}
          onIndicatorRemove={onIndicatorRemove}
        />
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <span className="text-gray-600">Loading...</span>
        </div>
      )}
      <div ref={chartContainerRef} className="chart-container relative" />
    </div>
  );
}

export default TradingViewChart;
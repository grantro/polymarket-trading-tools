import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle, ChartOptions, DeepPartial } from 'lightweight-charts';
import './Chart.css';

interface TradingViewChartProps {
  data: Array<{
    time: number;
    value: number;
  }>;
  indicators?: string[];
  onIndicatorAdd: (indicator: string) => void;
  onIndicatorRemove: (indicator: string) => void;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  data, 
  indicators = [], 
  onIndicatorAdd, 
  onIndicatorRemove 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Chart configuration
    const chartOptions: DeepPartial<ChartOptions> = {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    };

    // Create chart
    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    // Add main price series
    const mainSeries = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
      crosshairMarkerVisible: true,
    });
    seriesRef.current = mainSeries;

    // Set the data
    mainSeries.setData(data);

    // Fit the chart to the data
    chart.timeScale().fitContent();

    // Cleanup
    return () => {
      chart.remove();
    };
  }, [data]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <select 
          value=""
          onChange={(e) => onIndicatorAdd(e.target.value)}
          className="indicator-select"
        >
          <option value="">Add Indicator</option>
          <option value="SMA_10">SMA 10</option>
          <option value="SMA_20">SMA 20</option>
          <option value="EMA_12">EMA 12</option>
          <option value="EMA_26">EMA 26</option>
          <option value="RSI_14">RSI 14</option>
        </select>
      </div>
      
      <div className="active-indicators">
        {indicators.map((indicator) => (
          <span key={indicator} className="indicator-chip">
            {indicator}
            <button 
              onClick={() => onIndicatorRemove(indicator)}
              className="remove-indicator-btn"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <div ref={chartContainerRef} />
    </div>
  );
};

export default TradingViewChart;
import React, { useEffect, useRef } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi, 
  LineStyle, 
  ChartOptions, 
  DeepPartial,
  Time,
  UTCTimestamp,
  SingleValueData
} from 'lightweight-charts';
import './Chart.css';

interface PolymarketData {
  history: Array<{
    t: number;
    p: number;
  }>;
}

interface TradingViewChartProps {
  data: PolymarketData;
  tokenId: string;
  activeIndicators: Array<{
    id: string;
    label: string;
  }>;
  onIndicatorAdd: (indicator: any) => void;
  onIndicatorRemove: (indicatorId: string) => void;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  data, 
  tokenId,
  activeIndicators = [], 
  onIndicatorAdd, 
  onIndicatorRemove 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data?.history) return;

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

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const mainSeries = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
      crosshairMarkerVisible: true,
    });
    seriesRef.current = mainSeries;

    // Convert timestamps to the format lightweight-charts expects
    const formattedData: SingleValueData[] = data.history.map(item => ({
      time: item.t as UTCTimestamp,
      value: item.p
    }));

    mainSeries.setData(formattedData);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [data]);

  // Rest of component remains the same...
  
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
        {activeIndicators.map((indicator) => (
          <span key={indicator.id} className="indicator-chip">
            {indicator.label}
            <button 
              onClick={() => onIndicatorRemove(indicator.id)}
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
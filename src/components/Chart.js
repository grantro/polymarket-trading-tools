import React, { useState, useRef, useCallback } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Brush, ReferenceLine } from 'recharts';
import { useChartData } from './hooks/useChartData';
import './Chart.css';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '6px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '12px',
        lineHeight: '1.2',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <p className="tooltip-label" style={{ margin: '0 0 4px', fontWeight: 'bold' }}>
          {new Date(label).toLocaleDateString()}
        </p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ margin: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ marginRight: '8px', color: entry.color }}>{entry.name}:</span>
            <span>{(entry.value * 100).toFixed(2)}¢</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function Chart({ data }) {
    const [selectedIndicator, setSelectedIndicator] = useState('SMA_10');
    const { processedData, indicators, addIndicator, removeIndicator } = useChartData(data);
  
  // New state variables for zooming
  const [visibleDomain, setVisibleDomain] = useState({ min: 'dataMin', max: 'dataMax' });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  
  const chartRef = useRef(null);

  const handleAddIndicator = () => {
    if (!indicators.includes(selectedIndicator)) {
      addIndicator(selectedIndicator);
    }
  };

  const formatYAxis = (value) => `${(value * 100).toFixed(0)}¢`;
  const formatXAxis = (timestamp) => {
    if (!timestamp || isNaN(new Date(timestamp).getTime())) {
      return 'Invalid Date';
    }
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const handleBrushChange = (domain) => {
    if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
      setVisibleDomain({
        min: processedData[domain.startIndex].timestamp,
        max: processedData[domain.endIndex].timestamp
      });
    }
  };

  const formatBrushTick = () => '';

  const handleMouseDown = useCallback((e) => {
    if (chartRef.current) {
      const chartElement = chartRef.current.container;
      const rect = chartElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setIsPanning(true);
      setPanStart(x);
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isPanning && chartRef.current) {
      const chartElement = chartRef.current.container;
      const rect = chartElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const diff = x - panStart;
      const range = visibleDomain.max - visibleDomain.min;
      const panAmount = (diff / rect.width) * range;

      setVisibleDomain(prevDomain => ({
        min: prevDomain.min - panAmount,
        max: prevDomain.max - panAmount
      }));
      setPanStart(x);
    }
  }, [isPanning, panStart, visibleDomain]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  if (!processedData || processedData.length === 0) {
    return <p>No price data available</p>;
  }

  const colors = ['#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#a4de6c', '#82ca9d', '#ffc658'];

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <select 
          value={selectedIndicator} 
          onChange={(e) => setSelectedIndicator(e.target.value)}
          className="indicator-select"
        >
          <option value="SMA_10">SMA 10</option>
          <option value="SMA_20">SMA 20</option>
          <option value="SMA_50">SMA 50</option>
          <option value="EMA_12">EMA 12</option>
          <option value="EMA_26">EMA 26</option>
          <option value="RSI_14">RSI 14</option>
          <option value="BB_20">Bollinger Bands (20, 2)</option>
          <option value="MACD">MACD</option>
          <option value="Stochastic_14">Stochastic (14)</option>
          <option value="SuperGuppy">Super Guppy</option>
        </select>
        <button onClick={handleAddIndicator} className="add-indicator-btn">Add Indicator</button>
      </div>
      <div className="active-indicators">
        {indicators.map((indicator) => (
          <span key={indicator} className="indicator-chip">
            {indicator.replace('_', ' ')}
            <button onClick={() => removeIndicator(indicator)} className="remove-indicator-btn">×</button>
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
          data={processedData}
          ref={chartRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis}
            type="number"
            domain={[visibleDomain.min, visibleDomain.max]}
            allowDataOverflow
          />
          <YAxis 
            tickFormatter={formatYAxis}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} isAnimationActive={false} />
{indicators.map((indicator, index) => {
  if (indicator === 'MACD') {
    return [
      <Line key="MACD" type="monotone" dataKey="MACD" stroke={colors[index % colors.length]} dot={false} />,
      <Line key="Signal" type="monotone" dataKey="Signal" stroke={colors[(index + 1) % colors.length]} dot={false} />
    ];
  } else if (indicator === 'Stochastic_14') {
    return <Line key="Stochastic" type="monotone" dataKey="Stochastic" stroke={colors[index % colors.length]} dot={false} />;
  } else if (indicator === 'SuperGuppy') {
    const shortTermColor = '#ff7300'; // Bright orange
    const longTermColor = '#1e90ff';  // Dodger blue
    return [
      ...Array(6).fill().map((_, i) => (
        <Line 
          key={`SuperGuppyShort${i}`} 
          type="monotone" 
          dataKey={`SuperGuppyShort[${i}]`} 
          stroke={shortTermColor}
          className="superguppy-short"
          dot={false} 
          strokeWidth={2}
        />
      )),
      ...Array(6).fill().map((_, i) => (
        <Line 
          key={`SuperGuppyLong${i}`} 
          type="monotone" 
          dataKey={`SuperGuppyLong[${i}]`} 
          stroke={longTermColor}
          className="superguppy-long"
          dot={false} 
          strokeWidth={2}
        />
      ))
    ];
  } else {
    const [type, period] = indicator.split('_');
    const dataKey = `${type}_${period}`;
    
    if (type === 'BB') {
      return [
        <Line key={`${dataKey}_upper`} type="monotone" dataKey={`${dataKey}_upper`} stroke={colors[index % colors.length]} dot={false} />,
        <Line key={`${dataKey}_lower`} type="monotone" dataKey={`${dataKey}_lower`} stroke={colors[index % colors.length]} dot={false} />
      ];
    } else {
      return <Line key={dataKey} type="monotone" dataKey={dataKey} stroke={colors[index % colors.length]} dot={false} />;
    }
  }
})}
          <Brush
            dataKey="timestamp"
            height={30}
            stroke="#8884d8"
            onChange={handleBrushChange}
            tickFormatter={formatBrushTick}  // Add this line
            ticks={[]}  // Add this line to remove default ticks
          />
          {isPanning && <ReferenceLine x={panStart} stroke="red" strokeDasharray="3 3" />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Chart;
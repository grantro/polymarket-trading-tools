import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

const BacktestPanel = ({ data }) => {
  const [backTestResults, setBackTestResults] = useState(null);
  const [fastSMA, setFastSMA] = useState(10);
  const [slowSMA, setSlowSMA] = useState(20);
  const [initialCapital, setInitialCapital] = useState(1000);

  // Run backtest when parameters change
  useEffect(() => {
    if (data && data.history && data.history.length > 0) {
      const results = runBacktest(data.history, {
        fastPeriod: fastSMA,
        slowPeriod: slowSMA,
        capital: initialCapital
      });
      setBackTestResults(results);
    }
  }, [data, fastSMA, slowSMA, initialCapital]);

  if (!data || !data.history) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded p-4 mb-4">
        <h4 className="font-medium mb-1">No Data Available</h4>
        <p className="text-sm">
          Please ensure price data is loaded before running backtests.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-semibold">SMA Crossover Strategy Backtest</h3>
        
        <div className="flex flex-row space-x-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Fast SMA Period</label>
            <input 
              type="number" 
              value={fastSMA}
              onChange={(e) => setFastSMA(parseInt(e.target.value))}
              className="border rounded p-1 w-24"
              min="1"
              max={slowSMA - 1}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Slow SMA Period</label>
            <input 
              type="number"
              value={slowSMA}
              onChange={(e) => setSlowSMA(parseInt(e.target.value))}
              className="border rounded p-1 w-24"
              min={fastSMA + 1}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Initial Capital</label>
            <input 
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
              className="border rounded p-1 w-24"
              min="0"
            />
          </div>
        </div>
      </div>

      {backTestResults && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h4 className="text-sm font-medium text-gray-600">Total Return</h4>
              <p className="text-2xl font-bold">
                {((backTestResults.finalValue / initialCapital - 1) * 100).toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h4 className="text-sm font-medium text-gray-600">Profitable Trades</h4>
              <p className="text-2xl font-bold">
                {((backTestResults.profitableTrades / backTestResults.totalTrades) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <LineChart
              width={800}
              height={250}
              data={backTestResults.equityCurve}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(val) => new Date(val * 1000).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
                labelFormatter={(val) => new Date(val * 1000).toLocaleDateString()}
              />
              <Legend />
              <ReferenceLine y={initialCapital} stroke="gray" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                dot={false} 
                name="Portfolio Value"
              />
            </LineChart>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Trade Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p>Total Trades: {backTestResults.totalTrades}</p>
                <p>Winning Trades: {backTestResults.profitableTrades}</p>
                <p>Losing Trades: {backTestResults.totalTrades - backTestResults.profitableTrades}</p>
              </div>
              <div>
                <p>Avg. Win: ${backTestResults.avgWin.toFixed(2)}</p>
                <p>Avg. Loss: ${backTestResults.avgLoss.toFixed(2)}</p>
                <p>Max Drawdown: {(backTestResults.maxDrawdown * 100).toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktestPanel;
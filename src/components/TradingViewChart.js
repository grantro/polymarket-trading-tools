import React, { useEffect, useRef } from 'react';

const TradingViewChart = ({ 
  data,
  containerId,
  symbol,  // This is our market slug/ID
  onOutcomeChange,
  currentOutcome = 'YES'
}) => {
  const chartContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);

  useEffect(() => {
    if (!data?.history || !chartContainerRef.current || !window.TradingView) return;

    const datafeed = {
      onReady: (callback) => {
        setTimeout(() => {
          callback({
            supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'],
            supports_time: true,
            supports_marks: false,
            supports_timescale_marks: false,
            supports_search: false
          });
        }, 0);
      },
      searchSymbols: (userInput, exchange, symbolType, onResult) => {
        setTimeout(() => {
          onResult([]);
        }, 0);
      },
      resolveSymbol: (_, onSymbolResolvedCallback, onResolveErrorCallback) => {
        setTimeout(() => {
          if (!symbol) {
            onResolveErrorCallback('Symbol not found');
            return;
          }
      
          onSymbolResolvedCallback({
            name: symbol,             // market_slug as display name
            ticker: symbol,           // market_slug as ticker
            full_name: symbol,        // market_slug as full name
            description: symbol,
            type: 'crypto',
            session: '24x7',
            timezone: 'Etc/UTC',
            minmov: 1,
            pricescale: 10000,
            has_intraday: true,
            has_no_volume: true,
            supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D'],
          });
        }, 0);
      },
      getBars: (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const { from, to } = periodParams;
        
        setTimeout(() => {
          try {
            const bars = data.history
              .filter(item => {
                const timestamp = item.t;
                return timestamp >= from && timestamp <= to;
              })
              .map(item => ({
                time: item.t * 1000,
                open: parseFloat(item.p),
                high: parseFloat(item.p),
                low: parseFloat(item.p),
                close: parseFloat(item.p)
              }));

            onHistoryCallback(bars, {
              noData: bars.length === 0,
              nextTime: bars.length ? undefined : null
            });
          } catch (error) {
            onErrorCallback(error);
          }
        }, 0);
      },
      subscribeBars: () => {},
      unsubscribeBars: () => {},
    };

    const widgetOptions = {
      symbol: symbol,
      interval: '60',
      container: containerId,
      library_path: '/charting_library/',
      locale: 'en',
      theme: 'dark',
      custom_css_url: '/custom-trading-view.css',
      disabled_features: [
        'use_localstorage_for_settings',
        'volume_force_overlay',
        'create_volume_indicator_by_default',
      ],
      enabled_features: [
        'header_widget',
        'timeframes_toolbar',
        'header_settings',
        'show_logo_on_all_charts',
      ],
      loading_screen: { backgroundColor: "#1e222d" },
      toolbar_bg: '#1e222d',
      width: '100%',
      height: '100%',
      autosize: true,
      fullscreen: false,
      overrides: {
        "mainSeriesProperties.style": 2,
        "mainSeriesProperties.lineStyle.linewidth": 2,
      },
      studies_overrides: {},
      datafeed: datafeed,
    };

    try {
      const widget = new window.TradingView.widget(widgetOptions);
      tvWidgetRef.current = widget;

      // Set up the toggle button after the widget is ready
      widget.onChartReady(() => {
        widget.headerReady().then(() => {
          const button = widget.createButton({ align: 'left' });
          
          // Style the button
          button.style.display = 'flex';
          button.style.alignItems = 'center';
          button.style.padding = '0 12px';
          button.style.cursor = 'pointer';
          button.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          button.style.fontSize = '13px';
          button.style.border = 'none';
          button.style.backgroundColor = 'transparent';
          button.style.transition = 'background-color 0.2s ease';

          // Set button content
          button.innerHTML = `
            <span class="yes-text" style="
              color: ${currentOutcome === 'YES' ? '#2962ff' : '#b2b5be'};
              font-weight: ${currentOutcome === 'YES' ? '600' : '400'};
              transition: color 0.2s ease;
            ">YES</span>
            <span style="margin: 0 6px; color: #4f5966;">/</span>
            <span class="no-text" style="
              color: ${currentOutcome === 'NO' ? '#2962ff' : '#b2b5be'};
              font-weight: ${currentOutcome === 'NO' ? '600' : '400'};
              transition: color 0.2s ease;
            ">NO</span>
          `;

          // Add click handler
          button.addEventListener('click', () => {
            const newOutcome = currentOutcome === 'YES' ? 'NO' : 'YES';
            if (onOutcomeChange) {
              onOutcomeChange(newOutcome);
            }
          });

          // Add hover effects
          button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          });
          button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = 'transparent';
          });
        });
      });

    } catch (error) {
      console.error('Error creating TradingView widget:', error);
    }

    return () => {
      if (tvWidgetRef.current) {
        try {
          tvWidgetRef.current.remove();
          tvWidgetRef.current = null;
        } catch (error) {
          console.error('Error cleaning up TradingView widget:', error);
        }
      }
    };
  }, [data, containerId, symbol, currentOutcome, onOutcomeChange]);

  return (
    <div 
      id={containerId}
      ref={chartContainerRef}
      className="w-full h-full"
      style={{
        position: 'relative',
        height: '500px'
      }}
    />
  );
};

export default TradingViewChart;
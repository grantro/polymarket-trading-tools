// src/context/AppContext.js
import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [eventData, setEventData] = useState(null);
  const [marketsData, setMarketsData] = useState([]);
  const [expandedMarkets, setExpandedMarkets] = useState({});

  return (
    <AppContext.Provider value={{ 
      eventData, 
      setEventData, 
      marketsData, 
      setMarketsData,
      expandedMarkets,
      setExpandedMarkets
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
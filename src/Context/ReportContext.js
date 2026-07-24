import { createContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSellOut } from './sellOut';

export const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const { shopinfo, kpiinfo } = useSelector(state => state.GAppState);

  //
  useEffect(() => {
    return () => false;
  }, []);

  return (
    <ReportContext.Provider value={{ sellout: {} }}>
      {children}
    </ReportContext.Provider>
  );
};

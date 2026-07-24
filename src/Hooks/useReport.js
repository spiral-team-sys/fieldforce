import { useContext } from 'react';
import { ReportContext } from '../Context/ReportContext';

const useReport = () => {
  const { sellout } = useContext(ReportContext);
  return { sellout };
};

export default useReport;

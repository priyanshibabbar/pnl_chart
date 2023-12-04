import { createContext, useContext, useState } from "react";

const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [fromTime, setFromTime] = useState();
  const [toTime, setToTime] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selectedClient, setSelectedClient] = useState();
  const [selectedAlgo, setSelectedAlgo] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState();

  const submitData = {
    startDate,
    endDate,
    fromTime,
    toTime,
    selectedClient,
    selectedAlgo,
    selectedSymbol,
  };

  return (
    <DataContext.Provider
      value={{
        fromTime,
        setFromTime,
        toTime,
        setToTime,
        selectedClient,
        setSelectedClient,
        selectedAlgo,
        setSelectedAlgo,
        selectedSymbol,
        setSelectedSymbol,
        submitData,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

const useDataContext = () => {
  return useContext(DataContext);
};

export { DataProvider, useDataContext };

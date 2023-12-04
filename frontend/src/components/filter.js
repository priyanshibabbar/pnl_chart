import React, { useState, useEffect } from "react";
import { useDataContext } from "../Context/DataProvider";
import "./styles.css";
import Select from "react-select";

import axios from "axios";

const Dropdown = () => {
  const {
    selectedClient,
    setSelectedClient,
    selectedAlgo,
    setSelectedAlgo,
    selectedSymbol,
    setSelectedSymbol,
  } = useDataContext();
  const [client, setClient] = useState([]);
  const [algoName, setAlgoName] = useState([]);
  const [symbol, setSymbol] = useState([]);

  useEffect(() => {
    // const uniqueClientIds = [
    //   ...new Set(dummyData.map((item) => item.clientId)),
    // ];
    // const clientObject = uniqueClientIds.map((clientId) => ({
    //   value: clientId,
    //   label: clientId,
    // }));
    // setClient(clientObject);

    // const apiUrl = "http://192.168.1.12:5001";

    const apiUrl = process.env.REACT_APP_API_URL;

    console.log(process.env.REACT_APP_API_URL);

    axios.get(apiUrl + "/distinct_values").then((res) => {
      console.log(res.data);
      const uniqueClientIds = res.data.distinct_clientIDs;
      const uniqueAlgoName = res.data.distinct_algonames;
      const uniqueSymbol = res.data.distinct_symbols;

      const clientObject = uniqueClientIds.map((clientId) => ({
        value: clientId,
        label: clientId,
      }));
      const algoObject = uniqueAlgoName.map((algorithmName) => ({
        value: algorithmName,
        label: algorithmName,
      }));
      const symbolObject = uniqueSymbol.map((symbol) => ({
        value: symbol,
        label: symbol,
      }));
      setClient(clientObject);
      console.log();
      setAlgoName(algoObject);
      setSymbol(symbolObject);
    });
  }, []);

  // const handleClient = (event) => {
  //   setSelectedClient(event.target.value);
  // };

  // const handleAlgo = (selectedOption) => {
  //   setSelectedAlgo(selectedOption ? selectedOption.value : null);
  // };

  // const handleSymbol = (event) => {
  //   setSelectedSymbol(event.target.value);
  // };

  return (
    <div className="filters">
      <div className="custom-dropdown">
        <h3>CLIENT ID</h3>

        <Select
          styles={{ backgroundColor: "blue" }}
          className="drop"
          value={client.find((option) => option.value === selectedClient)} // Set the selected value
          onChange={(selectedOption) =>
            setSelectedClient(selectedOption ? selectedOption.value : null)
          }
          options={client}
        />

        {/* <select className="drop" value={selectedClient} onChange={handleClient}>
          <option>Select Client Id</option>
          {client.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select> */}
      </div>

      <div className="custom-dropdown">
        <h3>ALGO NAME</h3>

        <Select
          className="drop"
          value={client.find((option) => option.value === selectedAlgo)} // Set the selected value
          onChange={(selectedOption) =>
            setSelectedAlgo(selectedOption ? selectedOption.value : null)
          }
          options={algoName}
        />
        {/* <Select id="mySelect" value={selectedAlgo} onChange={handleAlgo}>
          <option>Select Algo Name</option>
          {algoName.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select> */}
      </div>

      <div className="custom-dropdown">
        <h3>SYMBOL</h3>

        <Select
          className="drop"
          value={client.find((option) => option.value === selectedSymbol)}
          onChange={(selectedOption) =>
            setSelectedSymbol(selectedOption ? selectedOption.value : null)
          }
          options={symbol}
        />
        {/* <select className="drop" value={selectedSymbol} onChange={handleSymbol}>
          <option>Select Symbol</option>
          {symbol.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select> */}
      </div>
    </div>
  );
};

export default Dropdown;

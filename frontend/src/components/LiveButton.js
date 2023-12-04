import React, { useEffect, useState } from "react";
import { useDataContext } from "../Context/DataProvider";
import axios from "axios";
import "./styles.css";

const LiveButton = ({ setLiveData }) => {
  const { selectedClient, selectedAlgo, selectedSymbol } = useDataContext();
  const [liveData, setLiveDataInternal] = useState(null);


  const fetchData = async () => {


    const data = {
      clientID: selectedClient,
      algoname: selectedAlgo,
      symbol: selectedSymbol,
    };

    console.log("Live button data sending ---> ", data)

    // const apiUrl = "http://127.0.0.1:5000";

    const apiUrl = process.env.REACT_APP_API_URL;

    axios.post(apiUrl + "/live_pnl", data)
  .then(response => {
    console.log("Data successfully sent to the server!", response.data.live_pnl);
    setLiveDataInternal(response.data.live_pnl);
  })
  .catch(error => {
    console.error("Error sending data:", error);
  });
  };

  useEffect(() => {
    fetchData(); 

    // Interval to fetch data every minute
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);

    // Clean up the interval 
    // return () => clearInterval(intervalId);
  }, []);



  useEffect(() => {
    setLiveData(liveData);
  }, [liveData, setLiveData]);

  return (
    <div className="submit-button">
      <button className="btn" onClick={fetchData}>
        Live Graph
      </button>
    </div>
  );
};

export default LiveButton;

import React from "react";
import { useDataContext } from "../Context/DataProvider";
import "./styles.css";
import axios from "axios";

const SubmitButton = ({setChartData}) => {
  const { selectedClient, selectedAlgo, selectedSymbol, startDate, endDate } = useDataContext();

  const handleSubmit = () => {

    // console.log(selectedClient)
    // console.log(selectedAlgo)
    // console.log(selectedSymbol)
    const apiData = {
      clientID: selectedClient,
      algoname: selectedAlgo,
      symbol: selectedSymbol,
      fromDateTime: startDate,
      toDateTime : endDate,
    };
    console.log("This is apiData ---> ",apiData);

    // const apiUrl = 'http://192.168.1.12:5001';

    const apiUrl = process.env.REACT_APP_API_URL;

    console.log(apiUrl);

    // console.log(...apiData);
    // const query = `?algoname=${selectedAlgo}&symbol=${selectedSymbol}&clientID=${selectedClient}`;

    axios.post(`${apiUrl}/user_pnl`, apiData)
    .then(res => {
      // res.send
      
      console.log(res.data.user_pnl);

      setChartData(res.data.user_pnl);

      // console.log("set chart data",setChartData);
      
    })
    .catch((error)=>{
      console.log(error);
    })

    // submitData();
    // console.log("button to submit data", submitData);
  };
  return (
    <div className="submit-button">
      <button className="btn" onClick={handleSubmit}>Submit Button</button>
    </div>
  );
};

export default SubmitButton;

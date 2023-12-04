import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { useDataContext } from "../Context/DataProvider";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ onDateRangeSelect }) => {
  // const [startDate, setStartDate] = useState(new Date());
  // const [endDate, setEndDate] = useState(new Date());

  const { startDate, setStartDate, endDate, setEndDate } = useDataContext();

  const handleStartDateChange = (date) => {
    setStartDate(date);
    onDateRangeSelect({ startDate: date, endDate });
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    onDateRangeSelect({ startDate, endDate: date });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <label style={{ marginBottom: "8px" }}>From Date:</label>
      <DatePicker
        showIcon
        selected={startDate}
        onChange={handleStartDateChange}
        style={{ marginBottom: "16px", padding: "20px" }}
      />

      <label style={{ marginBottom: "8px", paddingTop: "10px" }}>
        To Date:
      </label>
      <DatePicker
        showIcon
        selected={endDate}
        onChange={handleEndDateChange}
        style={{ marginBottom: "16px", padding: "20px" }}
      />


      {/* <div>
        <p>Start Date: {startDate.toLocaleDateString()}</p>
        <p>End Date: {endDate.toLocaleDateString()}</p>
      </div> */}
    </div>
  );
};

export default DateRangePicker;

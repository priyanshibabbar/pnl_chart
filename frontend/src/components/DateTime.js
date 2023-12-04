import React from "react";
import DatePicker from "react-datepicker";
import { useDataContext } from "../Context/DataProvider";
import "react-datepicker/dist/react-datepicker.css";
import "./styles.css";

const DateTime = ({ onDateRangeSelect }) => {
  const { startDate, setStartDate, endDate, setEndDate } =
    useDataContext() || {};

  const handleStartDateChange = (date) => {
    setStartDate(date);
    onDateRangeSelect({ startDate: date, endDate });
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    onDateRangeSelect({ startDate, endDate: date });
  };

  return (
    <div className="date-time">
      <label className="date-label">FROM DATE</label>
      <DatePicker
        className="date-picker"
        showTimeSelect
        minTime={new Date(0, 0, 0, 9, 15)}
        maxTime={new Date(0, 0, 0, 15, 30)}
        selected={startDate}
        onChange={handleStartDateChange}
        dateFormat="yyyy-MM-dd HH:mm:ss"
      />
      <label className="date-label">TO DATE</label>
      <DatePicker
      className="date-picker"
        showTimeSelect
        minTime={new Date(0, 0, 0, 9, 15)}
        maxTime={new Date(0, 0, 0, 15, 30)}
        selected={endDate}
        onChange={handleEndDateChange}
        dateFormat="yyyy-MM-dd HH:mm:ss"
      />
    </div>
  );
};

export default DateTime;

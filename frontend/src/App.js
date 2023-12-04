// import TimeRangePicker from "./components/timePicker";
// import DateRangePicker from "./components/datePicker";
import Dropdown from "./components/filter";
import { DataProvider } from "./Context/DataProvider";
import SubmitButton from "./components/SubmitButton";
// import SumGraph from "./components/SumGraph";
import Graph from "./components/Graph";
import DateTime from "./components/DateTime";
import { useState } from "react";
import LiveButton from "./components/LiveButton";
import LiveGraph from "./components/LiveGraph";

function App() {

  // console.log(process.env);

  const [chartData, setChartData] = useState();

  const [liveData, setLiveData] = useState();

  const handleDateRangeSelect = ({ startDate, endDate }) => {
    console.log("Selected Date Range:", startDate, endDate);
  };
  // const handleTimeRangeSelect = ({ startTime, endTime }) => {
  //   console.log("Selected Time Range:", startTime, endTime);
  // };

  return (
    <>
      <div className="App">
        <DataProvider>
          {/* <TimeRangePicker onTimeRangeSelect={handleTimeRangeSelect} /> */}

          <DateTime onDateRangeSelect={handleDateRangeSelect} />
          {/* <DateRangePicker onDateRangeSelect={handleDateRangeSelect} /> */}
          <Dropdown />
          <SubmitButton setChartData={setChartData} />


          <LiveButton setLiveData={setLiveData}/>
        </DataProvider>

        <Graph chartData={chartData} />
        <LiveGraph liveData={liveData}/>
      </div>
    </>
  );
}

export default App;



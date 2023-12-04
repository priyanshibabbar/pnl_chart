
import "./styles.css";
import { useDataContext } from "../Context/DataProvider";
import { Timeit } from "react-timeit";

export default function TimeRangePicker() {
  const { fromTime, setFromTime, setToTime } = useDataContext();

  return (
    <div className="App">
      <h3>From</h3>

      <Timeit
        onChange={(fromTimeValue) => {
          console.log(fromTime)
          setFromTime(fromTimeValue);
          console.log("From Time:", fromTimeValue);
          console.log(fromTime)
        }}
      />

      <h3>To</h3>

      <Timeit
        onChange={(toTimeValue) => {
          setToTime(toTimeValue);
          console.log("To Time:", toTimeValue);
        }}
      />
    </div>
  );
}

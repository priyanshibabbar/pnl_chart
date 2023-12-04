import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./styles.css";

const Graph = ({ chartData }) => {
  return (
    <div>
      <LineChart
        className="graph"
        width={1300}
        height={400}
        data={chartData}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <XAxis dataKey="timestamp" />
        <YAxis dataKey="sum" />
        <CartesianGrid strokeDasharray="3 3" />
        <Line type="monotone" dataKey="sum" stroke="#123456" />
        <CartesianGrid stroke="#ccc" />
        <Tooltip />
      </LineChart>
    </div>
  );
};

export default Graph;

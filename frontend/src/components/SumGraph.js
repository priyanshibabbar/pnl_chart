// import React, { useEffect, useState } from "react";
// import { useDataContext } from "../Context/DataProvider";
// import dummyData from "./dummyData";

// const SumGraph = () => {
//   let { fromTime, toTime, selectedClient, selectedAlgo, selectedSymbol } =
//     useDataContext();

//   // const [sum, setSum] = useState();
//   const selectedFromHour = fromTime?.slice(0,2);
//   const selectedFromMin = fromTime?.slice(3,5);
//   const selectedToHour = toTime?.slice(0,2);
//   const selectedToMin = toTime?.slice(3,5);

//   const calculateSum = () => {
//     // console.log(selectedClient, selectedAlgo, selectedSymbol, fromTime, toTime)
//     const filteredData = dummyData.filter(
//       (item) => {
//         let hour = item.time?.slice(-4);



//         let min = item.time?.slice(3,5);

//         let lt = (hour <= selectedToHour) 
//         let gt = (hour >= selectedFromHour) 



//         let rv = lt && gt &&
//         item.clientId === selectedClient &&
//         item.algorithmName === selectedAlgo &&
//         item.symbol === selectedSymbol ;

//         // console.log(item)


//         // item.time >= fromTime &&
//         // item.time <= toTime;
//         console.log(rv);
//         return rv;
//       }
//     );

//     console.log(filteredData);

//     const calculatedSumVal = filteredData.map((item) => {
//       const sum = item.realised + item.unrealised;
//       // const data = {item.time:sum};
//       return sum;

      
//     });

//     // console.log("sum sum - ", calculatedSumVal);
//     return calculatedSumVal;
//   };

//   return <div>{calculateSum()}</div>;
// };

// export default SumGraph;




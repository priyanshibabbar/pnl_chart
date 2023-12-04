import { createContext, useContext, useState } from "react";

import { } from "../Context/";

const GraphContext = createContext();

const GraphDataProvider = ({children}) => {
    const [graphData, setGraphData] = useState([]);
    // const [showGraph, setShowGraph] = useState(false);


    return (
        <GraphContext.Provider>
            value={{
                graphData,
                setGraphData
            }}
    
            {children}
        </GraphContext.Provider>
    )
}




const useGraphContext = () => {
    return useContext(GraphContext);
  };
  

export {GraphDataProvider, useGraphContext};

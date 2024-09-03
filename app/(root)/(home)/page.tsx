"use client";

import { getPrices, Price } from "@/app/service/server";
import { useEffect, useState } from "react";
import CardItems from "../_components/cardItems";
import LoaderPage from "../_components/loader";

function Homepage() {
  const [prices, setPrices] = useState<Price[]>([]);

  useEffect(() => {
    const getAllPrices = () => {
      getPrices().then((response) => setPrices(response));
    };
    getAllPrices();
  }, []);

  return <div>
      {prices.length <= 0 ? <LoaderPage/> : <CardItems prices={prices}/>}
        
    
  </div>;
}

export default Homepage;

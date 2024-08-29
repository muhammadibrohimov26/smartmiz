"use client";

import { getPrices, Price } from "@/app/service/server";
import { useEffect, useState } from "react";
import CardItems from "../_components/cardItems";

function Homepage() {
  const [prices, setPrices] = useState<Price[]>([]);

  useEffect(() => {
    const getAllPrices = () => {
      getPrices().then((response) => setPrices(response));
    };
    getAllPrices();
  }, []);

  return <div>
    <CardItems prices={prices}/>
  </div>;
}

export default Homepage;

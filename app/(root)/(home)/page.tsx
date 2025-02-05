"use client";

import {  Price } from "@/app/service/server";
import { useEffect, useState } from "react";
import CardItems from "../_components/cardItems";
import LoaderPage from "../_components/loader";
import BgArrow from "@/components/shared/bg-arrow";

function Homepage() {



  const [prices, setPrices] = useState<Price[]>([]);

  useEffect(() => {
    fetch("/db.json")
      .then((res) => res.json())
      .then((data) => setPrices(data))
      .catch((err) => console.error("Xatolik:", err));
  }, []);

  return <div>

<div className='max-w-6xl mx-auto'>
			<div className='relative min-h-[60vh] flex items-center justify-center'>
				<h1 className='text-3xl md:text-4xl lg:text-5xl font-creteRound text-center max-w-2xl'>
					Smartmiz o&apos;quv markazi
				</h1>
				<BgArrow/>
			</div>
			<h2 className='text-center text-4xl section-title font-creteRound'>
				<span>Barcha kurslar</span>
			</h2>

			<div className='flex flex-col space-y-24 mt-24'>
      {prices.length <= 0 ? <LoaderPage/> : <CardItems prices={prices}/>}
				
			</div>
		</div>

        
    
  </div>;
}

export default Homepage;

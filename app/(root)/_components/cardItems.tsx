import { Price } from "@/app/service/server"
import  './carditems.css'
import Link from "next/link";

interface PricesItemProps{
    prices: Price[]

}

const CardItems: React.FC<PricesItemProps> = ({ prices }) => {
    return (
      <div className="mt-20 container cardContent">
        {prices.map((price, index) => (
          <div key={index}>
            <div className="card dark:bg-gray-400/40 bg-rose-300">
                <div className="img">
                   <img src={price.image} alt={price.courseName} />
                </div>
                <div className="cardbody">
            <h2>{price.courseName}</h2>
                </div>
                <div className="cardName">

            <p>{price.coursePrice} ming so&apos;m </p>
            <p> {price.courseTime}</p>
                </div>
                <div className="cardType">
                <p> {price.courseType}</p> 
                </div>
                <div className="cardbtn mt-6 mb-1  dark:bg-slate-400/15 bg-slate-800/20  p-2 flex items-center justify-center">
                    <Link className="  text-2xl w-[400px]" href={'/contact'}>&#9742; Bog&apos;lanish </Link>
                </div>
            </div>
          
          </div>
        ))}
      </div>
    );
  };
export default CardItems
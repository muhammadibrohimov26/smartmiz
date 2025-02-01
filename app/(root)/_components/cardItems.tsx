import { Price } from "@/app/service/server"
import Link from "next/link";

interface PricesItemProps{
    prices: Price[]

}

const CardItems: React.FC<PricesItemProps> = ({ prices }) => {
    return (
<div className="mt-20 container mx-auto px-4 mb-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
    {prices.map((price, index) => (
      <div key={index} className=" w-full max-w-xs">
        <div className="card bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          <div className="img">
            <img className="w-full h-48 object-cover" src={price.image} alt={price.courseName} />
          </div>
          <div className="p-6 flex flex-col h-full justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {price.courseName}
              </h2>
              <div className="cardName flex justify-between text-gray-700 dark:text-gray-300 mb-4">
                <p>{price.coursePrice} ming so&apos;m</p>
                <p>{price.courseTime} soat</p>
              </div>
              <div className="cardType text-gray-500 dark:text-gray-400 mb-6">
                <p>{price.courseType}</p>
              </div>
              {/* <div className="cardType text-white dark:text-white mb-6">
                <span>{price.desc}</span>
              </div> */}
            </div>
            <div className="mt-4">
              <Link className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full text-center transition-colors duration-300 w-full inline-block" key={'/contact'} href={'/contact'}>
                &#9742; Bog&apos;lanish
              </Link>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>





    );
  };
export default CardItems
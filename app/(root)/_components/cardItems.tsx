"use client";

import { Price } from "@/app/service/server"
import Link from "next/link";
import { Clock, Phone, Sparkles } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface PricesItemProps{
    prices: Price[]
}

const CardItems: React.FC<PricesItemProps> = ({ prices }) => {
    const { t } = useTranslation();

    return (
        <div className="mt-12 container mx-auto mb-16 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {prices.map((price, index) => (
                    <div 
                        key={index} 
                        className="group relative w-full bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-900/80 rounded-[32px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/5 hover:-translate-y-2 flex flex-col"
                    >
                        {/* Course Image & Hero Area */}
                        <div className="relative h-60 w-full overflow-hidden border-b border-gray-100 dark:border-zinc-900/50 bg-[#FFB800]">
                            <img 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                src={price.image} 
                                alt={price.courseName} 
                            />
                        </div>

                        {/* Card Body */}
                        <div className="p-8 flex flex-col flex-grow">
                            {/* Category & Title */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] uppercase tracking-widest font-extrabold text-gray-400 dark:text-zinc-500">
                                    {t(price.courseType)}
                                </span>
                                {price.chegirma && (
                                    <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-black bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-md border border-yellow-500/20">
                                        <Sparkles className="w-2.5 h-2.5" />
                                        PROMO
                                    </span>
                                )}
                            </div>
                            
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase group-hover:text-yellow-500 transition-colors duration-300 mb-6">
                                {t(price.courseName)}
                            </h2>

                            {/* Pricing Section */}
                            <div className="flex justify-between items-center mb-6 rounded-2xl bg-gray-50 dark:bg-zinc-900/30 p-4 border border-gray-100 dark:border-zinc-900/50">
                                <div>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {price.courseChegirma} <span className="text-xs font-medium text-gray-400">{t("courseCurrency")}</span>
                                    </p>
                                    {price.coursePrice && (
                                        <p className="text-xs font-bold line-through text-gray-400 dark:text-zinc-500 mt-0.5">
                                            {price.coursePrice} {t("courseCurrency")}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs bg-yellow-500 text-black font-extrabold px-3.5 py-2 rounded-xl shadow-md shadow-yellow-500/10">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{price.courseTime} {t("courseTime")}</span>
                                </div>
                            </div>

                            {/* Promotion Banner */}
                            {price.chegirma && (
                                <div className="mb-6 text-xs font-semibold text-yellow-700 dark:text-yellow-400 bg-yellow-500/5 p-3.5 rounded-2xl border border-yellow-500/10 leading-relaxed">
                                    {t(price.chegirma)}
                                </div>
                            )}

                            {/* Enroll Button */}
                            <div className="mt-auto">
                                <Link 
                                    className="w-full py-4 px-6 bg-black dark:bg-white text-white dark:text-black hover:bg-yellow-500 dark:hover:bg-yellow-500 hover:text-black dark:hover:text-black font-bold flex items-center justify-center gap-2 rounded-2xl transition-all duration-300 tracking-wide text-sm shadow-lg shadow-black/5 dark:shadow-white/5 active:scale-[0.98]" 
                                    href={`/contact?course=${encodeURIComponent(price.courseName)}`}
                                >
                                    <Phone className="w-4 h-4" />
                                    {t("btnEnroll")}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default CardItems;
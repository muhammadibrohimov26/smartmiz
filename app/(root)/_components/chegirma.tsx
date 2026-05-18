"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { Percent, Users, Sparkles, Flame, Calculator, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

function ChegirmaPanel() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  // Calculator states
  const [under16, setUnder16] = useState(false);
  const [familyPlan, setFamilyPlan] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);

  // Price calculations
  const basePrice = 450000;
  let currentBase = basePrice;
  let activeDiscountPercent = 0;

  if (under16) {
    currentBase = 315000; // 30% discount
    activeDiscountPercent = 30;
  }

  if (familyPlan) {
    currentBase = 300000; // 33.3% discount
    activeDiscountPercent = 33.3;
  }

  if (under16 && familyPlan) {
    currentBase = 300000; // Take the better offer
    activeDiscountPercent = 33.3;
  }

  const friendDiscountPercent = friendsCount * 5; // 5% per friend
  const totalDiscountPercent = Math.min(activeDiscountPercent + friendDiscountPercent, 70); // Cap at 70% max
  const finalPrice = Math.round(basePrice * (1 - totalDiscountPercent / 100));

  useEffect(() => {
    // Automatically open on first visit
    const isFirstVisit = localStorage.getItem("isFirstVisit");
    if (!isFirstVisit) {
      setOpen(true);
      localStorage.setItem("isFirstVisit", "true");
    }
  }, []);

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="px-3 py-1 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 rounded-full font-black transition-all duration-300 flex items-center gap-1.5 border border-zinc-950 dark:border-white shadow-[1px_1px_0px_0px_rgba(255,184,0,1)] hover:translate-x-[-0.5px] hover:translate-y-[-0.5px] hover:shadow-[2px_2px_0px_0px_rgba(255,184,0,1)] text-[10px] md:text-xs mt-1 md:mt-0 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 yellow-accent animate-pulse" />
            <span>{t("discountBtn")}</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] overflow-y-auto bg-[#fafafa] dark:bg-[#0c0c0c] border-t-4 border-zinc-900 dark:border-white rounded-t-[32px] p-6 md:p-10">
          
          <SheetHeader className="mb-8">
            <SheetTitle className="text-center text-3xl md:text-5xl font-black bw-text tracking-tighter uppercase">
              {t("discountTitle")}
            </SheetTitle>
            <div className="w-24 h-1 bg-[#FFB800] mx-auto mt-2 rounded-full"></div>
          </SheetHeader>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: ACTIVE DISCOUNTS */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Campaign 1 */}
              <div className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl hover:shadow-[4px_4px_0px_0px_rgba(255,184,0,1)] transition-all duration-300">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-700">
                  <Flame className="w-6 h-6 yellow-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-lg bw-text uppercase tracking-tight mb-1">{t("discountCard1")}</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
                    {t("discount1")}
                  </p>
                </div>
              </div>

              {/* Campaign 2 */}
              <div className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl hover:shadow-[4px_4px_0px_0px_rgba(255,184,0,1)] transition-all duration-300">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-700">
                  <Percent className="w-6 h-6 yellow-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-lg bw-text uppercase tracking-tight mb-1">{t("discountCard2")}</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
                    {t("discount2")}
                  </p>
                </div>
              </div>

              {/* Campaign 3 */}
              <div className="flex items-start gap-4 p-5 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl hover:shadow-[4px_4px_0px_0px_rgba(255,184,0,1)] transition-all duration-300">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-700">
                  <Users className="w-6 h-6 yellow-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-lg bw-text uppercase tracking-tight mb-1">{t("discountCard3")}</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
                    {t("discount3")}
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: INTERACTIVE CALCULATOR */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border-4 border-zinc-900 dark:border-zinc-700 rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]">
              
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 yellow-accent" />
                <h3 className="font-black text-xl bw-text uppercase tracking-tight">{t("calcTitle")}</h3>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-6">{t("calcDesc")}</p>

              {/* Form Controls */}
              <div className="space-y-5 mb-8">
                
                {/* Control 1: Under 16 */}
                <label className="flex items-center justify-between p-3 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <span className="text-sm font-bold bw-text">{t("calcUnder16")}</span>
                  <input
                    type="checkbox"
                    checked={under16}
                    onChange={(e) => {
                      setUnder16(e.target.checked);
                      if (e.target.checked) setFamilyPlan(false); // Only one base discount at a time
                    }}
                    className="w-5 h-5 rounded border-2 border-zinc-900 text-[#FFB800] focus:ring-[#FFB800]"
                  />
                </label>

                {/* Control 2: Family Plan */}
                <label className="flex items-center justify-between p-3 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <span className="text-sm font-bold bw-text">{t("calcFamily")}</span>
                  <input
                    type="checkbox"
                    checked={familyPlan}
                    onChange={(e) => {
                      setFamilyPlan(e.target.checked);
                      if (e.target.checked) setUnder16(false); // Only one base discount at a time
                    }}
                    className="w-5 h-5 rounded border-2 border-zinc-900 text-[#FFB800] focus:ring-[#FFB800]"
                  />
                </label>

                {/* Control 3: Invite Friends */}
                <div className="p-4 border-2 border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold bw-text">{t("calcFriends")}</span>
                    <span className="px-2.5 py-0.5 bg-[#FFB800] text-zinc-950 font-black text-xs rounded-full">
                      +{friendsCount * 5}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={friendsCount}
                    onChange={(e) => setFriendsCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#FFB800]"
                  />
                  <div className="flex justify-between text-xs text-zinc-400 font-medium mt-1">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>

              </div>

              {/* RECEIPT / BILL DETAILS */}
              <div className="border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 pt-6 space-y-3">
                
                <div className="flex justify-between text-sm font-semibold text-zinc-500">
                  <span>{t("calcBasePrice")}</span>
                  <span className="line-through">{basePrice.toLocaleString()} UZS</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-emerald-600 dark:text-emerald-500">
                  <span>{t("calcDiscount")}</span>
                  <span>-{totalDiscountPercent}%</span>
                </div>

                <div className="flex justify-between items-end border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <span className="text-base font-black bw-text uppercase tracking-tight">{t("calcFinalPrice")}</span>
                  <div className="text-right">
                    <span className="text-2xl md:text-3xl font-black text-[#FFB800] tracking-tighter drop-shadow-sm">
                      {finalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold bw-text ml-1">{t("calcMonthly")}</span>
                  </div>
                </div>

              </div>

              {/* ACTION BUTTON */}
              <Link 
                href={`/contact?course=AksiyaChegirma&price=${finalPrice}`}
                onClick={() => setOpen(false)}
                className="mt-6 w-full py-4 px-6 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 rounded-2xl font-black text-base flex items-center justify-center gap-2 border-2 border-zinc-950 dark:border-white shadow-[4px_4px_0px_0px_rgba(255,184,0,1)] transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,184,0,1)]"
              >
                <span>{t("calcEnroll")}</span>
                <ArrowRight className="w-5 h-5 yellow-accent" />
              </Link>

            </div>

          </div>

        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ChegirmaPanel;

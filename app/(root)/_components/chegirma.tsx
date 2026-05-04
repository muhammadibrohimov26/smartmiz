import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";

function ChegirmaPanel() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Faqat birinchi kirishda avtomatik ochish
    const isFirstVisit = localStorage.getItem("isFirstVisit");

    if (!isFirstVisit) {
      setOpen(true);
      localStorage.setItem("isFirstVisit", "true");
    }
  }, []);
  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="mt-6">
          <Button variant="outline">Chegirmalar 🎉</Button>
        </SheetTrigger>
        <SheetContent side={"top"}>
          <SheetHeader>
            <SheetTitle className="text-center text-3xl">
              Smartmiz o’quv markazidagi chegirmalar{" "}
            </SheetTitle>
            {/* <SheetDescription>
                Make changes to your profile here. Click save when you are done.
              </SheetDescription> */}
          </SheetHeader>
       <div className="grid gap-4 py-4">
  <div className="grid grid-cols-1 items-center gap-4">
    
    <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200">
      <div className="text-2xl shrink-0">🔥</div>
      <p className="text-gray-700 text-sm md:text-base leading-relaxed m-0">
        16 yoshgacha bo'lgan o'quvchilar uchun barcha kurslar aksiya doirasida 450 000 so'm o'rniga 315 000 so'm.
      </p>
    </div>

    <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200">
      <div className="text-2xl shrink-0">👨‍👩‍👧‍👦</div>
      <p className="text-gray-700 text-sm md:text-base leading-relaxed m-0">
        Bitta oiladan 2 nafar farzand o'qisa yoki 2 va undan ortiq kursda o'qisa – narx 300 000 so'm qilib beriladi.
      </p>
    </div>

    <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-md transition-shadow duration-200">
      <div className="text-2xl shrink-0">🎁</div>
      <p className="text-gray-700 text-sm md:text-base leading-relaxed m-0">
        Do'stlarini yoki sinfdoshlarini taklif qilsa – har bir yangi o'quvchi uchun 5% chegirma taqdim etiladi.
      </p>
    </div>

  </div>
</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ChegirmaPanel;

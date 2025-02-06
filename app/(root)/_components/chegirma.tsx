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
              <p>1 ta do`st taklifi uchun 7 %</p>
              <p> Oilada 2ta farzand uchun 10 % </p>
              <p>Bir vaqtda 2 ta kursda o'qilsa 10 % </p>
              <p> Bir vaqtda 5 ta do`st taklifi uchun 100 % </p>
              <p>Bir vaqtda 8 ta do`st taklifi uchun 2 oylik</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ChegirmaPanel;

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
              <p> Bitta do‘stini taklif qilsa – taklif qilgan o‘quvchiga 15%, yangi kelgan o‘quvchiga 5% chegirma beriladi. </p>
              <p> Bitta oiladan ikki nafar farzand o‘qisa – 10% chegirma beriladi. </p>
              <p> Bir vaqtning o‘zida ikkita kursda o‘qisa – 10% chegirma beriladi. </p>
              {/* <p> Bir vaqtda 5 ta do`st taklifi uchun 100 % </p>
              <p>Bir vaqtda 8 ta do`st taklifi uchun 2 oylik</p> */}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ChegirmaPanel;

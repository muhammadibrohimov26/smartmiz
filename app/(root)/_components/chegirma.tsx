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
            <SheetTitle className="text-center text-3xl">Smartmiz o’quv markazidagi chegirmalar </SheetTitle>
            {/* <SheetDescription>
                Make changes to your profile here. Click save when you are done.
              </SheetDescription> */}
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <p>
              1 ta do’stini olib kelganlar uchun 7 %
              </p>
              <p> 2 ta kursda o’qiganlar uchun 10 % </p>
              <p>  Bir vaqtda 2 ta kursda  aka uka o’qisa 10 %  </p>
              <p>
             Agarda aka ukalar yoki opa singillar  bir kurs uchun guruxda o’qisa 10 %
              </p>
            
       
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ChegirmaPanel;

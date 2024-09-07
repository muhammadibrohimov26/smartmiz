import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function ChegirmaPanel() {
  return (
    <div>
      <Sheet>
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
                1 ta  do’stini olib kelganlar uchun 5 %
              </p>
              <p>2 ta kursda o’qiganlar uchun 10 %</p>
              <p>Bir vaqtda 2 ta kursda aka uka o’qisa 15 %</p>
              <p>
                Agarda aka ukalar yoki opa singillar bir kurs uchun guruxda
                o’qisa 10 %
              </p>
              <p>Ishchi xodim farzandlar uchun 40 %</p>
              <p>
                Kam taminlangan oila uchun 50 % (maxalladan ma’lumotnoma olib
                kelgandan keyin)
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ChegirmaPanel;

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navLink } from "@/constants";
import { cn } from "@/lib/utils";
import { Menu, SeparatorHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Mobile = () => {
    const pathName = usePathname()
  return (
    <Sheet>
      <SheetTrigger asChild className="flex md:hidden">
        <Button size={"icon"} variant={"ghost"}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"}>
        <Link href={"/"}>
          <h1 className="text-4xl font-creteRound">Smartmiz</h1>
        </Link>
      <Separator className="my-3">
      <div className='gap-2 space-y-3 flex flex-col'>
       {navLink.map(nav =>(
        <Link key={nav.route} href={nav.route}
        className={cn(
          'hover:bg-blue-400/20 py-1 px-3 cursor-pointer rounded-sm transition-colors flex gap-2',
          pathName === nav.route && 'text-blue-400 bg-blue-400/20'
        )}>
        <nav.icon className='w-5 h-5'/>
        {nav.name}
      </Link>
       ))}
       </div>
      </Separator>
      </SheetContent>
    </Sheet>
  );
};

export default Mobile;

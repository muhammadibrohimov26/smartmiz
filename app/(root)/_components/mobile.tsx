import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navLink } from "@/constants";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import { Locale } from "@/lib/dictionaries";
import ChegirmaPanel from './chegirma';

const Mobile = () => {
  const pathName = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale } = useTranslation();

  const changeLang = (lang: Locale) => setLocale(lang);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button size={"icon"} variant={"ghost"} onClick={() => setIsOpen(true)}>
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side={"left"}>
          <Link href={"/"} >
            {/* <h1 className="text-4xl font-creteRound">Smartmiz</h1> */}
            <img className="logo" src="/smartlogo.png" alt="smartmiz" />
          </Link>
          <Separator className="my-3">
            <div className='gap-2 space-y-3 flex flex-col'>
              {navLink.map(nav => (
                <Link key={nav.route} href={nav.route} onClick={handleLinkClick}
                  className={cn(
                    'hover:bg-blue-400/20 py-1 px-3 cursor-pointer rounded-sm transition-colors flex gap-2 mt-2',
                    pathName === nav.route && 'text-blue-400 bg-blue-400/20'
                  )}>
                  <nav.icon className='w-5 h-5'/>
                  {nav.name}
                </Link>
              ))}
            </div>
            
            <div className="flex flex-col gap-4 mt-6">
              {/* Language Switcher */}
              <div className="flex items-center justify-between bw-panel px-4 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 font-bold bw-text">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Language:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeLang('uz')} className={`font-bold transition-colors ${locale === 'uz' ? 'bw-text' : 'text-zinc-400'}`}>UZ</button>
                  <span className="text-zinc-200 dark:text-zinc-800">|</span>
                  <button onClick={() => changeLang('ru')} className={`font-bold transition-colors ${locale === 'ru' ? 'bw-text' : 'text-zinc-400'}`}>RU</button>
                  <span className="text-zinc-200 dark:text-zinc-800">|</span>
                  <button onClick={() => changeLang('en')} className={`font-bold transition-colors ${locale === 'en' ? 'bw-text' : 'text-zinc-400'}`}>EN</button>
                </div>
              </div>
              
              <ChegirmaPanel/>
            </div>
          </Separator>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Mobile;

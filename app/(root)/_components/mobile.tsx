import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navLink } from "@/constants";
import { cn } from "@/lib/utils";
import { Menu, Globe, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";
import { Locale } from "@/lib/dictionaries";
import ChegirmaPanel from './chegirma';

const Mobile = () => {
  const pathName = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { locale, setLocale } = useTranslation();

  const changeLang = (lang: Locale) => setLocale(lang);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const getLangName = (code: string) => {
    switch (code) {
      case "uz": return "O'zbekcha";
      case "ru": return "Русский";
      case "en": return "English";
      case "tr": return "Türkçe";
      case "ko": return "한국어";
      case "ar": return "العربية";
      default: return code;
    }
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
            
            <div className="flex flex-col gap-3 mt-6">
              {/* Language Expandable Panel */}
              <div className="flex flex-col bw-panel rounded-xl overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center justify-between px-4 py-2.5 text-xs font-bold bw-text w-full transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 yellow-accent animate-pulse" />
                    <span>Language: <span className="uppercase font-black text-yellow-500">{locale}</span></span>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", langOpen && "rotate-180")} />
                </button>

                {langOpen && (
                  <div className="grid grid-cols-2 gap-1 border-t border-zinc-200 dark:border-zinc-800 p-2 bg-zinc-50/50 dark:bg-zinc-950/50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {[
                      { code: "uz", name: "O'zbek" },
                      { code: "ru", name: "Русский" },
                      { code: "en", name: "English" },
                      { code: "tr", name: "Türkçe" },
                      { code: "ko", name: "한국어" },
                      { code: "ar", name: "العربية" }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLang(lang.code as Locale);
                          setLangOpen(false);
                        }}
                        className={cn(
                          "px-2.5 py-2 text-[11px] font-bold rounded-lg transition-colors text-center border border-transparent",
                          locale === lang.code 
                            ? "bg-yellow-500 text-black font-extrabold border-zinc-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" 
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                        )}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
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

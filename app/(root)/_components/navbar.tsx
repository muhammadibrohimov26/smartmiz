'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navLink } from "../../../constants"
import Mobile from "./mobile"
import ChegirmaPanel from "./chegirma"
import { useTranslation } from "@/context/LanguageContext"
import { Globe, ChevronDown } from "lucide-react"
import { Locale } from "@/lib/dictionaries"
import { useState, useEffect, useRef } from "react"
import ModeToogle from "@/components/shared/mode-toggle"

const Navbar = () => {
    const pathName = usePathname()
    const { locale, setLocale, t } = useTranslation();
    const [langOpen, setLangOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const changeLang = (lang: Locale) => setLocale(lang);

    // Close dropdown on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setLangOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
 
    return (
    <div className='h-[10vh] backdrop:blur-sm border-b fixed z-40 inset-0 bg-background'>
    <div className='container max-w-6xl mx-auto h-[10vh] w-full flex items-center justify-between'>
       <Link href={'/'}>
        {/* <h1 className='text-4xl font-creteRound'>Smartmiz</h1> */}
        <img className="logo" src="/smartlogo.png" alt="smartmiz" />
       </Link>
       <div className='gap-2 hidden md:flex'>
       {navLink.map(nav =>(
        <Link key={nav.route} href={nav.route}
        className={cn(
          'hover:bg-[#FFB800]/20 py-1.5 px-3.5 cursor-pointer rounded-xl transition-all duration-300 font-extrabold text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white',
          pathName === nav.route && 'bg-[#FFB800]/10 text-yellow-600 dark:text-yellow-400 border border-[#FFB800]/20 shadow-[1px_1px_0px_rgba(255,184,0,1)]'
        )}>
        {t(nav.translationKey || nav.name)}
      </Link>
       ))}
       </div>
            <div className="flex items-center gap-4">
              {/* Language Dropdown Switcher */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-black bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer shadow-[1px_1px_0px_rgba(255,184,0,1)] hover:shadow-[2px_2px_0px_rgba(255,184,0,1)] transition-all uppercase tracking-wider text-zinc-900 dark:text-white"
                >
                  <Globe className="w-3.5 h-3.5 yellow-accent" />
                  <span>{locale}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", langOpen && "rotate-180")} />
                </button>

                {langOpen && (
                  <div className="absolute top-11 right-0 w-36 bg-white dark:bg-zinc-950 border border-zinc-900 dark:border-zinc-800 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] py-1.5 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {[
                      { code: "uz", name: "O'zbekcha" },
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
                          "px-3.5 py-2 text-xs font-bold text-left hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center justify-between",
                          locale === lang.code ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-extrabold" : "text-zinc-700 dark:text-zinc-300"
                        )}
                      >
                        <span>{lang.name}</span>
                        <span className="text-[10px] text-zinc-400 uppercase">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ModeToogle />
              <div className="hidden md:block flex items-center">
                <ChegirmaPanel />
              </div>
              <Mobile/>
            </div>
    </div>

    </div>
  )
}

export default Navbar
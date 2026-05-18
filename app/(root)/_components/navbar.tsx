'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navLink } from "../../../constants"
import Mobile from "./mobile"
import ChegirmaPanel from "./chegirma"
import { useTranslation } from "@/context/LanguageContext"
import { Globe } from "lucide-react"
import { Locale } from "@/lib/dictionaries"

const Navbar = () => {
    const pathName = usePathname()
    const { locale, setLocale } = useTranslation();

    const changeLang = (lang: Locale) => setLocale(lang);
 
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
          'hover:bg-blue-400/20 py-1 px-3 cursor-pointer rounded-sm transition-colors',
          pathName === nav.route && 'text-blue-400'
        )}>
        {nav.name}
      </Link>
       ))}
       </div>
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <div className="flex items-center gap-2 bw-panel px-3 py-1.5 rounded-full text-xs">
                <Globe className="w-3.5 h-3.5 bw-text" />
                <button onClick={() => changeLang('uz')} className={`font-bold transition-colors ${locale === 'uz' ? 'bw-text' : 'text-zinc-400 hover:text-zinc-950 dark:hover:text-white'}`}>UZ</button>
                <span className="text-zinc-200 dark:text-zinc-800">|</span>
                <button onClick={() => changeLang('ru')} className={`font-bold transition-colors ${locale === 'ru' ? 'bw-text' : 'text-zinc-400 hover:text-zinc-950 dark:hover:text-white'}`}>RU</button>
                <span className="text-zinc-200 dark:text-zinc-800">|</span>
                <button onClick={() => changeLang('en')} className={`font-bold transition-colors ${locale === 'en' ? 'bw-text' : 'text-zinc-400 hover:text-zinc-950 dark:hover:text-white'}`}>EN</button>
              </div>

              {/* <ModeToogle/> */}
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
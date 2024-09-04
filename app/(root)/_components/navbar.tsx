'use client'
import Link from "next/link"

import {  usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navLink } from "../../../constants"

import Mobile from "./mobile"


const Navbar = () => {
    const pathName = usePathname()
 
    
  return (
    <div className='h-[10vh] backdrop:blur-sm border-b fixed z-40 inset-0 bg-background'>
    <div className='container max-w-6xl mx-auto h-[10vh] w-full flex items-center justify-between'>
       <Link href={'/'}>
        <h1 className='text-4xl font-creteRound'>Smartmiz</h1>
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
            <div className="flex items-center gap-1">
              {/* <ModeToogle/> */}
            
        <Mobile/>
            </div>
    </div>

    </div>
  )
}

export default Navbar
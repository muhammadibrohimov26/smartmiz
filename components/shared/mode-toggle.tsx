'use client'

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const ModeToogle = () => {
    const [mount, setMount] = useState(false)
    const { setTheme, resolvedTheme } = useTheme()
    useEffect(() => setMount(true), [])

    if (!mount) return null;

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                "relative w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                isDark
                    ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-[#FFB800] shadow-[1px_1px_0px_rgba(255,184,0,0.5)]"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-900 shadow-[1px_1px_0px_rgba(0,0,0,0.1)]"
            )}
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="w-4 h-4 text-[#FFB800] animate-in spin-in-90 duration-300" />
            ) : (
                <Moon className="w-4 h-4 text-zinc-700 animate-in spin-in-90 duration-300" />
            )}
        </button>
    )
}

export default ModeToogle
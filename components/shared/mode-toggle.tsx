'use client'

import { useTheme } from "next-themes"
import { Button } from "../ui/button"
import { Moon, Sun, icons } from "lucide-react"
import { useEffect, useState } from "react"

const ModeToogle = () => {
    const [mount, setMount] = useState(false)
    const {setTheme, resolvedTheme} = useTheme()
    useEffect(() => setMount(true), [] )
    

  return mount && resolvedTheme === 'dark' ? (
    <Button size={'icon'} variant={'ghost'} onClick={() => setTheme('light')}>
        <Sun/>
    </Button>
  ) : (
    <Button size={'icon'} variant={'ghost'} onClick={() => setTheme('dark')}>
        <Moon/>
    </Button>
  )
}

export default ModeToogle
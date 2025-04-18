"use client"

import * as React from "react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

const Header = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="w-full border-b shadow-sm bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold ">
         TapToDine
        </Link>

        {/* Desktop Navigation */}
        {/* <nav className="hidden md:flex gap-6 items-center">
          <Link href="/about" className="text-sm font-medium hover:text-blue-500 dark:hover:text-blue-400">
            About
          </Link>
          <Link href="/services" className="text-sm font-medium hover:text-blue-500 dark:hover:text-blue-400">
            Services
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-blue-500 dark:hover:text-blue-400">
            Contact
          </Link>
        </nav> */}

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          {mounted && theme && (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    aria-label="Toggle theme"
  >
    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
  </Button>
)}

          

          {/* Mobile Menu */}
          {/* <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white dark:bg-zinc-900">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/about" className="text-sm font-medium hover:text-blue-500 dark:hover:text-blue-400">
                    About
                  </Link>
                  <Link href="/services" className="text-sm font-medium hover:text-blue-500 dark:hover:text-blue-400">
                    Services
                  </Link>
                  <Link href="/contact" className="text-sm font-medium hover:text-blue-500 dark:hover:text-blue-400">
                    Contact
                  </Link>
                 
                </nav>
              </SheetContent>
            </Sheet>
          </div> */}
        </div>
      </div>
    </header>
  )
}

export default Header

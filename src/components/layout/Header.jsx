import React from 'react'
import { MobileSidebar } from './Sidebar'
import { ThemeToggle } from '@/components/ThemeToggle'


export default function Header({ user }) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 lg:h-[60px]">
      <MobileSidebar user={user} />
      <div className="w-full flex-1">
        
      </div>

      <ThemeToggle />
    </header>
  )
}

import React from 'react'
import { MobileSidebar } from './Sidebar'
import { ThemeToggle } from '@/components/ThemeToggle'


export default function Header({ user, isClubAdmin, isPlatformAdmin }) {
  return (
    <header className="flex sticky top-0 z-50 h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 lg:h-[60px]">
      <MobileSidebar user={user} isClubAdmin={isClubAdmin} isPlatformAdmin={isPlatformAdmin} />
      <div className="w-full flex-1">
        
      </div>

      <ThemeToggle />
    </header>
  )
}

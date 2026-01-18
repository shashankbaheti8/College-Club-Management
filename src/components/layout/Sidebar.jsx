'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  Home,
  Users,
  Settings,
  LogOut,
  PlusCircle,
  Menu
} from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout } from '@/app/auth/actions'

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Clubs', href: '/clubs', icon: Users },
    { name: 'Events', href: '/events', icon: CalendarDays },
    { name: 'Create Club', href: '/clubs/create', icon: PlusCircle },
]

export function Sidebar({ className, user }) {
    const pathname = usePathname()

    const handleLogout = async () => {
        await logout()
    }

    const getInitials = (name) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="flex h-full flex-col gap-2">
             <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                 <Link href="/" className="flex items-center gap-2 font-semibold">
                     <CalendarDays className="h-6 w-6 text-primary" />
                     <span className="text-xl">UniClub</span>
                 </Link>
             </div>
             
             <div className="flex-1 overflow-y-auto">
                 <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1 py-2">
                     {navItems.map((item) => (
                         <Link key={item.href} href={item.href}>
                             <Button 
                                 variant={pathname === item.href ? "secondary" : "ghost"}
                                 className="w-full justify-start font-medium"
                             >
                                 <item.icon className="mr-2 h-4 w-4" />
                                 {item.name}
                             </Button>
                         </Link>
                     ))}
                 </nav>
             </div>
             
             {/* User Profile - Fixed at Bottom */}
             <div className="mt-auto border-t p-4">
                 <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                     <Avatar>
                         <AvatarImage src={user?.avatar_url || ''} />
                         <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                             {getInitials(user?.full_name)}
                         </AvatarFallback>
                     </Avatar>
                     <div className="flex-1 overflow-hidden">
                         <p className="truncate text-sm font-medium">{user?.full_name || 'User'}</p>
                         <p className="truncate text-xs text-muted-foreground">{user?.email || ''}</p>
                     </div>
                     <button 
                        onClick={handleLogout}
                        className="hover:bg-destructive/10 p-2 rounded-md transition-colors"
                        title="Logout"
                     >
                        <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                     </button>
                 </div>
             </div>
        </div>
    )
}

export function MobileSidebar({ user }) {
    const pathname = usePathname()
    
    const handleLogout = async () => {
        await logout()
    }

    const getInitials = (name) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
               <SheetHeader>
                   <SheetTitle className="text-left flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        UniClub
                   </SheetTitle>
               </SheetHeader>
                <div className="px-2 py-6 space-y-4">
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button 
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className="w-full justify-start font-medium"
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.name}
                                </Button>
                            </Link>
                        ))}
                    </div>
                    
                    {/* User Profile in Mobile */}
                    <div className="pt-4 mt-4 border-t">
                        <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                            <Avatar>
                                <AvatarImage src={user?.avatar_url || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {getInitials(user?.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium">{user?.full_name || 'User'}</p>
                                <p className="truncate text-xs text-muted-foreground">{user?.email || ''}</p>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="hover:bg-destructive/10 p-2 rounded-md transition-colors"
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}


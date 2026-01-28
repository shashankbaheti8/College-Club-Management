'use client'

import React, { useState } from 'react'
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
  Menu,
  Megaphone
} from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { logout } from '@/app/auth/actions'

export function Sidebar({ className, user, isClubAdmin, isPlatformAdmin }) {
    const pathname = usePathname()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    const handleLogout = async () => {
        await logout()
        setShowLogoutDialog(false)
    }

    const getInitials = (name) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    // Base navigation items
    let navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: isPlatformAdmin ? 'Clubs' : 'My Clubs', href: '/clubs', icon: Users },
        { name: 'Events', href: '/events', icon: CalendarDays },
    ]

    // Club Admin Links
    if (isClubAdmin) {
        // Add specific tools for club admins if needed, currently Dashboard covers it
        // could add { name: 'Manage Events', href: '/events/manage', ... }
    }

    // Platform Admin Links
    if (isPlatformAdmin) {
        navItems.push({ name: 'Announcements', href: '/announcements', icon: Megaphone })
    }

    return (
        <div className="flex h-full flex-col gap-2">
             <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                 <Link href="/" className="flex items-center gap-2 font-semibold">
                     <CalendarDays className="h-6 w-6 text-primary" />
                     <span className="text-xl">UniClub</span>
                 </Link>
             </div>
             
             <div className="flex-1">
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
                        onClick={() => setShowLogoutDialog(true)}
                        className="hover:bg-destructive/10 p-2 rounded-md transition-colors"
                        title="Logout"
                     >
                        <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                     </button>
                 </div>
                 
                 <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                     <AlertDialogContent>
                         <AlertDialogHeader>
                             <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                             <AlertDialogDescription>
                                 You will be logged out of your account and redirected to the login page.
                             </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                 Logout
                             </AlertDialogAction>
                         </AlertDialogFooter>
                     </AlertDialogContent>
                 </AlertDialog>
             </div>
        </div>
    )
}

export function MobileSidebar({ user, isClubAdmin, isPlatformAdmin }) {
    const pathname = usePathname()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    
    const handleLogout = async () => {
        await logout()
        setShowLogoutDialog(false)
    }

    const getInitials = (name) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    // Base navigation items
    let navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: isPlatformAdmin ? 'Clubs' : 'My Clubs', href: '/clubs', icon: Users },
        { name: 'Events', href: '/events', icon: CalendarDays },
    ]

    // Platform Admin Links
    if (isPlatformAdmin) {
        navItems.push({ name: 'Announcements', href: '/announcements', icon: Megaphone })
        navItems.push({ name: 'Create Club', href: '/clubs/create', icon: PlusCircle })
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
                                onClick={() => setShowLogoutDialog(true)}
                                className="hover:bg-destructive/10 p-2 rounded-md transition-colors"
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </button>
                        </div>
                        
                        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You will be logged out of your account and redirected to the login page.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Logout
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}


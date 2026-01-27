'use client'

import React, { useEffect, Suspense } from 'react'
import { login } from '../auth/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const message = searchParams.get('message')
  
    const toastShownRef = React.useRef(false)
    const router = useRouter()
  
    useEffect(() => {
        // Check if user is already logged in
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                router.push('/dashboard')
            }
        }
        checkAuth()
    }, [router])

    useEffect(() => {
        // Reset ref when params change, or handle dependency correctly
        // Actually, cleaner way:
        if (error && !toastShownRef.current) {
            toast.error(error)
            toastShownRef.current = true
            router.replace('/login') // Clear url
        }
        if (message && !toastShownRef.current) {
            toast.success(message)
            toastShownRef.current = true
             router.replace('/login') // Clear url
        }
        
        // Reset ref if no params (e.g. after clear) so it works again if new params come?
        // No, because this eff runs on param change.
        if (!error && !message) {
            toastShownRef.current = false
        }

    }, [error, message, router])

    return (
        <Card className="w-full max-w-sm mx-auto shadow-none border-0 bg-transparent">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-black">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email to sign in to your account
              </p>
            </div>
            <form action={login} className='grid gap-6'>
                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-black">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        className="border-black text-black"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password" className="text-black">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        className="border-black text-black"
                        placeholder='password'
                        required
                    />
                </div>
                <Button className="w-full bg-black text-white hover:bg-zinc-800">Sign In with Email</Button>
            </form>
            
            <p className="px-8 text-center text-sm text-muted-foreground">
              <Link href="/signup" className="hover:text-zinc-700 underline underline-offset-4">
                Don&apos;t have an account? Sign Up
              </Link>
            </p>
          </div>
        </Card>
    )
}

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background md:grid md:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-black" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          UniClub
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This library has saved me countless hours of work and
              helped me deliver stunning designs to my clients faster than
              ever before.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center justify-center bg-white text-black">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

'use client'

import React, { useEffect, Suspense } from 'react'
import { signup } from '../auth/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function SignupForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

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
        if (error && !toastShownRef.current) {
            toast.error(error)
            toastShownRef.current = true
            router.replace('/signup')
        }
        
         if (!error) {
            toastShownRef.current = false
        }
    }, [error, router])

    return (
        <Card className="w-full max-w-sm mx-auto shadow-none border-0 bg-transparent">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your details below to create your account
              </p>
            </div>
            <form action={signup} className='grid gap-6'>
                <div className="grid gap-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                        id="full_name"
                        name="full_name"
                        placeholder="John Doe"
                        type="text"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                    />
                </div>
                <Button className="w-full bg-white text-black hover:bg-zinc-200">Sign Up with Email</Button>
            </form>
           
            <p className="px-8 text-center text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-zinc-300 underline underline-offset-4">
                Already have an account? Sign In
              </Link>
            </p>
          </div>
        </Card>
    )
}

export default function SignupPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background md:grid md:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-black lg:flex border-r">
        <div className="absolute inset-0 bg-white" /> {/* White background */}
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
              &ldquo;Join thousands of students managing their campus life effortlessly.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center justify-center bg-black text-white">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
            <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}

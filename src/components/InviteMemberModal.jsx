'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { inviteMember } from '@/app/(dashboard)/actions'

export default function InviteMemberModal({ clubId }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')

    async function handleInvite(e) {
        e.preventDefault()
        setLoading(true)

        try {
            await inviteMember(clubId, email)
            toast.success('Member invited successfully!')
            setOpen(false)
            setEmail('')
        } catch (error) {
            toast.error(error.message || 'Failed to invite member')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Member</DialogTitle>
                    <DialogDescription>
                        Directly add a user to this club by their email address. They must already be registered on the platform.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Member
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

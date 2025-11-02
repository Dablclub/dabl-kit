import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import React from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { GithubIcon, TelegramIcon, FarcasterIcon, XIcon } from '../icons'

export default function AddContactModal({
  buttonSize = 'sm',
}: {
  buttonSize?: 'icon' | 'default' | 'sm' | 'lg'
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size={buttonSize}>
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="username" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="flex justify-center">
              <Button size="icon" variant="outline">
                <XIcon />
              </Button>
            </div>
            <div className="flex justify-center">
              <Button size="icon" variant="outline">
                <GithubIcon />
              </Button>
            </div>
            <div className="flex justify-center">
              <Button size="icon" variant="outline">
                <TelegramIcon />
              </Button>
            </div>
            <div className="flex justify-center">
              <Button size="icon" variant="outline">
                <FarcasterIcon />
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


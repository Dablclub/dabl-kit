'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UserWithProfile } from '@/types/db'
import { useUpdateUser } from '@/hooks/users'

const UserFormSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: 'Display name must be at least 2 characters.' })
    .max(50, { message: 'Display name cannot exceed 50 characters.' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, { message: 'Bio cannot exceed 500 characters.' })
    .optional()
    .nullable(),
  website: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .nullable(),
  avatarUrl: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .nullable(),
  bannerUrl: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .nullable(),
})

export function UserForm({ user }: { user: UserWithProfile }) {
  const form = useForm<z.infer<typeof UserFormSchema>>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      displayName: user.displayName,
      email: user.email,
      bio: user.bio,
      website: user.website,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
    },
  })

  const { mutateAsync, status } = useUpdateUser(user.id)

  async function handleUpdateUser(values: z.infer<typeof UserFormSchema>) {
    try {
      await mutateAsync(values)
      toast.success('Profile updated')
    } catch (error) {
      console.error(error)
      toast.warning('Error updating profile')
    }
  }

  // function onSubmit(data: z.infer<typeof UserFormSchema>) {
  //   toast('Profile updated:', {
  //     description: (
  //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
  //         <code className="text-white">{JSON.stringify(data, null, 2)}</code>
  //       </pre>
  //     ),
  //   })
  // }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleUpdateUser)}
        className="grid w-full max-w-2xl gap-6"
      >
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your display name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Your email address will not be displayed publicly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself"
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Brief description for your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://your-website.com"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Your personal or project website.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>URL for your profile picture.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bannerUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/banner.jpg"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                URL for your profile banner image.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={status === 'pending'}>
          {status === 'pending' ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  )
}


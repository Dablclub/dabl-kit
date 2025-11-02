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
import { Switch } from '@/components/ui/switch'
import { UserWithProfile } from '@/types/db'
import { useUpdateProfile } from '@/hooks/profiles'

const ProfileFormSchema = z.object({
  firstName: z
    .string()
    .max(50, { message: 'First name cannot exceed 50 characters.' })
    .optional()
    .nullable(),
  lastName: z
    .string()
    .max(50, { message: 'Last name cannot exceed 50 characters.' })
    .optional()
    .nullable(),
  cityRegion: z
    .string()
    .max(100, { message: 'City/Region cannot exceed 100 characters.' })
    .optional()
    .nullable(),
  country: z
    .string()
    .max(50, { message: 'Country cannot exceed 50 characters.' })
    .optional()
    .nullable(),
  primaryRole: z
    .string()
    .max(50, { message: 'Primary role cannot exceed 50 characters.' })
    .optional()
    .nullable(),
  professionalProfile: z
    .string()
    .max(50, { message: 'Professional profile cannot exceed 50 characters.' })
    .optional()
    .nullable(),
  isStudent: z.boolean().default(false),
})

export function ProfileForm({ user }: { user: UserWithProfile }) {
  const profile = user.profile
  const form = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      cityRegion: profile?.cityRegion || '',
      country: profile?.country || '',
      primaryRole: profile?.primaryRole || '',
      professionalProfile: profile?.professionalProfile || '',
      isStudent: profile?.isStudent || false,
    },
  })

  const { mutateAsync, status } = useUpdateProfile(user.id)

  async function handleUpdateProfile(
    values: z.infer<typeof ProfileFormSchema>,
  ) {
    try {
      await mutateAsync(values)
      toast.success('Profile updated')
    } catch (error) {
      console.error(error)
      toast.warning('Error updating profile')
    }
  }

  // function onSubmit(data: z.infer<typeof ProfileFormSchema>) {
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
        onSubmit={form.handleSubmit(handleUpdateProfile)}
        className="grid w-full max-w-2xl gap-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your first name"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="cityRegion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City/Region</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your city or region"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your country"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="primaryRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Role</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your primary role"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Your main role or profession (e.g., Developer, Designer, etc.)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="professionalProfile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Profile</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your professional profile"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                A brief description of your professional background
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isStudent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Student Status</FormLabel>
                <FormDescription>Are you currently a student?</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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


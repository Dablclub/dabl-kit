'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  DiscordIcon,
  FarcasterIcon,
  GithubIcon,
  TelegramIcon,
  XIcon,
} from '@/components/icons'
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
import { UserWithProfile } from '@/types/db'
import { useUpdateProfile } from '@/hooks/profiles'

const SocialsFormSchema = z.object({
  discordUsername: z
    .string()
    // .regex(/^.{3,32}#[0-9]{4}$/, 'Please enter a valid Discord username')
    .optional()
    .nullable(),
  farcasterUsername: z.string().optional().nullable(),
  githubUsername: z.string().optional().nullable(),
  telegramUsername: z.string().optional().nullable(),
  xUsername: z.string().optional().nullable(),
})

export function SocialsForm({ user }: { user: UserWithProfile }) {
  const profile = user.profile
  const form = useForm<z.infer<typeof SocialsFormSchema>>({
    resolver: zodResolver(SocialsFormSchema),
    defaultValues: {
      discordUsername: profile?.discordUsername || '',
      farcasterUsername: profile?.farcasterUsername || '',
      githubUsername: profile?.githubUsername || '',
      telegramUsername: profile?.telegramUsername || '',
      xUsername: profile?.xUsername || '',
    },
  })

  const { mutateAsync, status } = useUpdateProfile(user.id)

  async function handleUpdateProfile(
    values: z.infer<typeof SocialsFormSchema>,
  ) {
    try {
      await mutateAsync(values)
      toast.success('Profile updated')
    } catch (error) {
      console.error(error)
      toast.warning('Error updating profile')
    }
  }

  // function onSubmit(data: z.infer<typeof SocialsFormSchema>) {
  //   toast('Social links updated:', {
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
        <FormField
          control={form.control}
          name="discordUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discord</FormLabel>
              <FormControl>
                <div className="relative">
                  <DiscordIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="username#0000"
                    className="pl-9"
                    {...field}
                    value={field.value || ''}
                  />
                </div>
              </FormControl>
              <FormDescription>Your Discord username and tag.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="farcasterUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farcaster</FormLabel>
              <FormControl>
                <div className="relative">
                  <FarcasterIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="username"
                    className="pl-9"
                    {...field}
                    value={field.value || ''}
                  />
                </div>
              </FormControl>
              <FormDescription>Your Farcaster handle.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="githubUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub</FormLabel>
              <FormControl>
                <div className="relative">
                  <GithubIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="username"
                    className="pl-9"
                    {...field}
                    value={field.value || ''}
                  />
                </div>
              </FormControl>
              <FormDescription>Your GitHub username.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telegramUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telegram</FormLabel>
              <FormControl>
                <div className="relative">
                  <TelegramIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="username"
                    className="pl-9"
                    {...field}
                    value={field.value || ''}
                  />
                </div>
              </FormControl>
              <FormDescription>Your Telegram username.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="xUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>X (Twitter)</FormLabel>
              <FormControl>
                <div className="relative">
                  <XIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="username"
                    className="pl-9"
                    {...field}
                    value={field.value || ''}
                  />
                </div>
              </FormControl>
              <FormDescription>Your X/Twitter username.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={status === 'pending'}>
          {status === 'pending' ? 'Updating...' : 'Update Social Links'}
        </Button>
      </form>
    </Form>
  )
}

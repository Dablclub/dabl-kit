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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ProjectFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Project name must be at least 2 characters.' })
    .max(50, { message: 'Project name cannot exceed 50 characters.' }),
  wallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: 'Please enter a valid Ethereum address.',
    })
    .optional()
    .nullable(),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .optional()
    .nullable(),
  website: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .nullable(),
  category: z.string().min(1, { message: 'Please select a category.' }),
  description: z
    .string()
    .max(1000, { message: 'Description cannot exceed 1000 characters.' })
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
  tokenAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: 'Please enter a valid token address.',
    })
    .optional()
    .nullable(),
  networks: z.array(z.string()).optional().default([]),
})

const projectCategories = [
  'DeFi',
  'NFT',
  'DAO',
  'Gaming',
  'Infrastructure',
  'Social',
  'Other',
]

export default function CreateProjectForm() {
  const form = useForm<z.infer<typeof ProjectFormSchema>>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      name: '',
      wallet: null,
      email: null,
      website: null,
      category: '',
      description: null,
      avatarUrl: null,
      bannerUrl: null,
      tokenAddress: null,
      networks: [],
    },
  })

  function onSubmit(data: z.infer<typeof ProjectFormSchema>) {
    toast('Project created:', {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-full max-w-2xl gap-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Your project name" {...field} />
              </FormControl>
              <FormDescription>
                The unique name of your project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wallet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Wallet</FormLabel>
              <FormControl>
                <Input
                  placeholder="0x..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                The Ethereum wallet address for your project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projectCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the category that best describes your project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project..."
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Brief description of your project.
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
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="project@example.com"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>Project contact email address.</FormDescription>
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
                  placeholder="https://your-project.com"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>Your project&apos;s website.</FormDescription>
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
              <FormDescription>
                URL for your project&apos;s logo.
              </FormDescription>
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
                URL for your project&apos;s banner image.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tokenAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="0x..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                The Ethereum address of your project&apos;s token (if
                applicable).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Project</Button>
      </form>
    </Form>
  )
}


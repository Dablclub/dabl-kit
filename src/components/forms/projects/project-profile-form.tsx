'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Project } from '@prisma/client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateProject, useUpdateProject } from '@/hooks/projects'

const ProjectFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' })
    .max(500, { message: 'Description cannot exceed 500 characters.' }),
  repositoryUrl: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .nullable(),
  productionUrl: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .nullable(),
  website: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .nullable(),
  stage: z.enum(['IDEATION', 'PROTOTYPE', 'MVP', 'GROWTH', 'FUNDED']),
  category: z
    .string()
    .max(50, { message: 'Category cannot exceed 50 characters.' })
    .optional()
    .nullable(),
  adminId: z.string(),
})

const projectStages = [
  { label: 'Ideation', value: 'IDEATION' },
  { label: 'Prototype', value: 'PROTOTYPE' },
  { label: 'MVP', value: 'MVP' },
  { label: 'Growth', value: 'GROWTH' },
  { label: 'Funded', value: 'FUNDED' },
]

export function ProjectProfileForm({
  project,
  userId,
}: {
  project?: Project
  userId: string
}) {
  const form = useForm<z.infer<typeof ProjectFormSchema>>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      repositoryUrl: project?.repositoryUrl || '',
      productionUrl: project?.productionUrl || '',
      website: project?.website || '',
      stage: project?.stage || 'IDEATION',
      category: project?.category || '',
      adminId: project?.adminId || userId,
    },
  })

  const { mutateAsync: createProject, status: createStatus } =
    useCreateProject()
  const { mutateAsync: updateProject, status: updateStatus } = useUpdateProject(
    project?.id || '',
  )

  async function handleSubmit(values: z.infer<typeof ProjectFormSchema>) {
    try {
      if (!project?.id) {
        await createProject(
          values as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
        )
      } else {
        await updateProject(values)
      }
      toast.success('Project updated successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update project')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid w-full max-w-2xl gap-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
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
                  placeholder="Describe your project"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a clear and concise description of your project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Stage</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectStages.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <FormControl>
                  <Input
                    placeholder="e.g., DeFi, NFT, Gaming"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4">
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repositoryUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repository URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://github.com/your-project"
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
            name="productionUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Production URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://app.your-project.com"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={createStatus === 'pending' || updateStatus === 'pending'}
        >
          {createStatus === 'pending' || updateStatus === 'pending'
            ? 'Updating...'
            : 'Update Project'}
        </Button>
      </form>
    </Form>
  )
}

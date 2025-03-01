'use client'

import { useState } from 'react'
import { useMemories } from '@/hooks/memories'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Brain,
  Flame,
  Blocks,
  Calendar,
  CheckSquare,
  Code,
  CreditCard,
  FileText,
  Mail,
  Phone,
  Search,
  Users,
} from 'lucide-react'
import { Memory } from '@prisma/client'
import { format } from 'date-fns'
import { toast } from 'sonner'
const actions = [
  {
    label: 'Burn',
    icon: Flame,
  },
  {
    label: 'Email',
    icon: Mail,
  },
  {
    label: 'Schedule',
    icon: Calendar,
  },
  {
    label: 'Build',
    icon: Blocks,
  },
  {
    label: 'Pay',
    icon: CreditCard,
  },
  {
    label: 'Invoice',
    icon: FileText,
  },
  {
    label: 'Task',
    icon: CheckSquare,
  },
  {
    label: 'Call',
    icon: Phone,
  },
  {
    label: 'Research',
    icon: Search,
  },
  {
    label: 'Code',
    icon: Code,
  },
  {
    label: 'Meeting',
    icon: Users,
  },
]

export default function MemoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: memoriesData,
    isLoading,
    error,
  } = useMemories({
    limit: pageSize,
    page: currentPage,
    query: searchQuery || undefined,
  })

  const memories = memoriesData?.memories || []
  const metadata = memoriesData?.metadata
  // Format the structured content for display
  const formatStructuredContent = (
    structured: unknown,
  ): {
    title: string
    overview: string
    emoji: string
    category: string
    action_items: {
      description: string
      completed: boolean
    }[]
  } => {
    try {
      // If it's a string, try to parse it
      const content =
        typeof structured === 'string' ? JSON.parse(structured) : structured

      // If there's a title or summary, display that
      // if (content && typeof content === 'object') {
      //   if ('title' in content) return String(content.title)
      //   if ('summary' in content) return String(content.summary)
      // }

      return {
        title: content.title,
        overview: content.overview,
        emoji: content.emoji,
        category: content.category,
        action_items: content.action_items,
      }
    } catch (err: unknown) {
      if (err instanceof Error)
        return {
          title: err.message,
          overview: 'Error parsing memory content',
          emoji: '⚠️',
          category: 'error',
          action_items: [],
        }
      if (err instanceof SyntaxError)
        return {
          title: 'Invalid JSON format',
          overview: 'The memory content could not be parsed',
          emoji: '⚠️',
          category: 'error',
          action_items: [],
        }
      return {
        title: 'Invalid content',
        overview: 'Unknown error parsing memory content',
        emoji: '⚠️',
        category: 'error',
        action_items: [],
      }
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleEdit = (id: string) => {
    console.log(`Editing memory ${id}`)
    // Implement actual edit functionality
  }

  const handleDelete = (id: string) => {
    console.log(`Deleting memory ${id}`)
    // Implement actual delete functionality
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Error loading memories: {(error as Error).message}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
        <h1 className="text-2xl font-bold">Memories</h1>
        <Link href="/memories/create">
          <Button>Create Memory</Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(Number(value))
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Rows per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Content</TableHead>
                  <TableHead className="w-[120px]">UID</TableHead>
                  <TableHead className="w-[180px]">Created At</TableHead>
                  <TableHead className="w-[100px]">Source</TableHead>
                  <TableHead className="w-[100px]">Visibility</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                  <TableHead className="w-[100px]">Controls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memories && memories.length > 0 ? (
                  memories.map((memory: Memory) => (
                    <TableRow key={memory.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/memories/${memory.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {
                            formatStructuredContent(memory.structured || '')
                              .title
                          }
                        </Link>
                      </TableCell>
                      <TableCell>{memory.uid || 'N/A'}</TableCell>
                      <TableCell>
                        {format(new Date(memory.createdAt), 'PPp')}
                      </TableCell>
                      <TableCell>{memory.source}</TableCell>
                      <TableCell>{memory.visibility}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(memory.id)}
                          >
                            <Flame className="mr-1 h-4 w-4" />
                            Burn
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(memory.id)}
                          >
                            <Brain className="mr-1 h-4 w-4" />
                            Memo
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center space-y-2">
                          {(() => {
                            const randomAction =
                              actions[
                                Math.floor(Math.random() * actions.length)
                              ]
                            const Icon = randomAction.icon
                            return (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    toast.info(
                                      `${randomAction.label} action triggered`,
                                    )
                                  }
                                >
                                  <Icon className="mr-1 h-4 w-4" />
                                  {randomAction.label}
                                </Button>
                              </div>
                            )
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No memories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {metadata && (
            <div className="flex flex-col items-center justify-between py-4 sm:flex-row">
              <div className="mb-2 text-sm text-gray-500 sm:mb-0">
                Showing {memories.length} of {metadata.total} memories
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {metadata.pages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage >= (metadata.pages || 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

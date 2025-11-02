'use client'

import { useState } from 'react'
import { useProjects } from '@/hooks/projects'
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
import { HandCoins, Loader2, Megaphone, Briefcase } from 'lucide-react'
import { Project } from '@prisma/client'
import { toast } from 'sonner'

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)

  const {
    data: projects,
    isLoading,
    error,
  } = useProjects({
    take: pageSize,
    skip: currentPage * pageSize,
    query: searchQuery || undefined,
  })

  const getResourceLink = (project: Project) => {
    if (project.productionUrl) {
      return (
        <a
          href={project.productionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Production
        </a>
      )
    }

    if (project.videoUrl) {
      return (
        <a
          href={project.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Video
        </a>
      )
    }

    if (project.pitchDeckUrl) {
      return (
        <a
          href={project.pitchDeckUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Pitch Deck
        </a>
      )
    }

    return 'N/A'
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(0) // Reset to first page on new search
  }

  const handlePowerUp = (projectId: string, powerUp: string) => {
    console.log(`Powering up project ${projectId} with ${powerUp}`)
    toast.info(`${powerUp} initiated`)
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Error loading projects: {error.message}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/projects/create">
          <Button>Create Project</Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(Number(value))
            setCurrentPage(0)
          }}
        >
          <SelectTrigger className="w-[180px]">
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead className="w-[400px]">Description</TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Power</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell className="line-clamp-2">
                        {project.description}
                      </TableCell>
                      <TableCell>{getResourceLink(project)}</TableCell>
                      <TableCell>{project.stage}</TableCell>
                      <TableCell>{project.category || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePowerUp(project.id, 'Influencer Mode')
                            }
                          >
                            <Megaphone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePowerUp(project.id, 'Builder Mode')
                            }
                          >
                            <Briefcase className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePowerUp(project.id, 'Fundraising mode')
                            }
                          >
                            <HandCoins className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No projects found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {projects && projects.length > 0 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!projects || projects.length < pageSize}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}


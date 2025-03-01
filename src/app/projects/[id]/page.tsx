'use client'

import { useParams } from 'next/navigation'
import { useProject } from '@/hooks/projects'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink, GitBranch } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
export default function ProjectPage() {
  const { id } = useParams() as { id: string }
  const { data: project, isLoading, error } = useProject(id)

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Error loading project: {error.message}
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/projects">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-x-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xl font-bold text-primary">
              {project.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.category && (
              <span className="mt-1 inline-flex items-center rounded-md border border-input px-2.5 py-0.5 text-xs font-semibold">
                {project.category}
              </span>
            )}
          </div>
        </div>
        <Link href={`/projects/${id}/edit`}>
          <Button size="sm" variant="outline" className="py-1 text-[0.75rem]">
            Edit
          </Button>
        </Link>
      </div>

      {project.bannerUrl && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <Image
            src={project.bannerUrl}
            alt={`${project.name} banner`}
            width={800}
            height={256}
            className="h-64 w-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{project.description}</p>
            </CardContent>
          </Card>

          {project.repositoryUrl && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Repository
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  {project.repositoryUrl}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Stage
                </h3>
                <p className="mt-1 font-medium">{project.stage}</p>
              </div>

              {project.website && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Website
                  </h3>
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    {project.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {project.email && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Contact
                  </h3>
                  <a
                    href={`mailto:${project.email}`}
                    className="mt-1 block text-blue-600 hover:underline"
                  >
                    {project.email}
                  </a>
                </div>
              )}

              <hr className="my-4 border-t border-border" />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Resources
                </h3>

                {project.productionUrl && (
                  <a
                    href={project.productionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Production Site
                    </Button>
                  </a>
                )}

                {project.videoUrl && (
                  <a
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Demo Video
                    </Button>
                  </a>
                )}

                {project.pitchDeckUrl && (
                  <a
                    href={project.pitchDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Pitch Deck
                    </Button>
                  </a>
                )}
              </div>

              {(project.xUsername ||
                project.farcasterUsername ||
                project.githubUsername ||
                project.telegramUsername) && (
                <>
                  <hr className="my-4 border-t border-border" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Social Media
                    </h3>

                    {project.xUsername && (
                      <a
                        href={`https://x.com/${project.xUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <span className="mr-2 font-bold">𝕏</span>@
                          {project.xUsername}
                        </Button>
                      </a>
                    )}

                    {project.farcasterUsername && (
                      <a
                        href={`https://warpcast.com/${project.farcasterUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <span className="mr-2 font-bold">FC</span>@
                          {project.farcasterUsername}
                        </Button>
                      </a>
                    )}

                    {project.githubUsername && (
                      <a
                        href={`https://github.com/${project.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <GitBranch className="mr-2 h-4 w-4" />
                          {project.githubUsername}
                        </Button>
                      </a>
                    )}

                    {project.telegramUsername && (
                      <a
                        href={`https://t.me/${project.telegramUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                        >
                          <span className="mr-2 font-bold">T</span>@
                          {project.telegramUsername}
                        </Button>
                      </a>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

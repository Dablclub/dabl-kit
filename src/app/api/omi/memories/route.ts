import { createMemory } from '@/server/controllers/memories'
import { NextRequest, NextResponse } from 'next/server'
import { requireOmiWebhookSignature } from '@/lib/omi-webhook'
import { checkOmiWebhookRateLimit } from '@/lib/rate-limit'
import { OmiMemoryWebhookSchema } from '@/types/omi'

interface AgentResponse {
  result: boolean
  places?: Array<{
    name: string
    address: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const uid = searchParams.get('uid')

    // Validate uid parameter is present
    if (!uid) {
      return NextResponse.json(
        { error: 'Missing required uid parameter' },
        { status: 400 },
      )
    }

    // Step 1: Verify webhook signature
    const verification = await requireOmiWebhookSignature(request)
    if (!verification.valid) {
      console.warn(`Webhook verification failed for uid ${uid}: ${verification.error}`)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    // Step 2: Check rate limit
    const rateLimitResult = await checkOmiWebhookRateLimit(uid)
    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for uid ${uid}`)
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }

    // Step 3: Parse and validate webhook format
    let memoryRequest: unknown
    try {
      memoryRequest = await request.json()
    } catch (error) {
      console.warn('Failed to parse webhook body as JSON:', error)
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 },
      )
    }

    // Validate webhook against Omi schema
    const validation = OmiMemoryWebhookSchema.safeParse(memoryRequest)
    if (!validation.success) {
      console.warn('Invalid Omi webhook format:', validation.error.flatten())
      return NextResponse.json(
        {
          error: 'Invalid webhook format',
          details: validation.error.flatten(),
        },
        { status: 400 },
      )
    }

    const memoryData = validation.data

    console.log('Processing valid memory:', memoryData.id)

    // Transform the memoryData to match the expected structure for createMemory
    await createMemory({
      memory: {
        id: memoryData.id,
        startedAt: new Date(memoryData.started_at),
        finishedAt: new Date(memoryData.finished_at),
        createdAt: new Date(memoryData.created_at),
        source: memoryData.source,
        language: memoryData.language,
        structured: JSON.parse(JSON.stringify(memoryData.structured)),
        transcriptSegments: JSON.parse(
          JSON.stringify(memoryData.transcript_segments),
        ),
        geolocation: JSON.parse(JSON.stringify(memoryData.geolocation)),
        photos: memoryData.photos,
        pluginsResults: memoryData.plugins_results
          ? JSON.parse(JSON.stringify(memoryData.plugins_results))
          : null,
        externalData: memoryData.external_data
          ? JSON.parse(JSON.stringify(memoryData.external_data))
          : null,
        discarded: memoryData.discarded,
        deleted: memoryData.deleted,
        visibility: memoryData.visibility,
        processingMemoryId: memoryData.processing_memory_id,
        status: memoryData.status,
        uid,
        participants: [],
        participantPlatform: [],
      },
    })

    const formattedTranscript = memoryData.transcript_segments
      .map((segment) => `${segment.speaker}: ${segment.text}`)
      .join('\n')

    // Additional security: log rate limit status
    console.log(
      `Rate limit status for uid ${uid}: ${rateLimitResult.remaining} requests remaining`,
    )

    const agentRequestBody = {
      user: uid,
      text: JSON.stringify({
        query:
          'Analyze if the user is providing project information, problem and idea validation, description or other relevant details about a project or idea. ' +
          'If the user is describing or registering a project, or jamming about problems and potential technical builds and solutions, return REGISTER_PROJECT. ' +
          'If neither of these cases apply, return NO_ACTION. ' +
          'Just return the string result, no other text or comments.',
        context: {
          userLocation: memoryData?.geolocation?.address,
          conversation: formattedTranscript,
        },
      }),
    }

    console.log('agentRequestBody:', agentRequestBody)

    console.log(
      'process.env.SERVER_ENDPOINT:',
      process.env.SERVER_ENDPOINT,
      'process.env.AGENT_ID_EVALUATOR:',
      process.env.AGENT_ID_EVALUATOR,
    )

    const response = await fetch(
      `${process.env.SERVER_ENDPOINT}/${process.env.AGENT_ID_EVALUATOR}/message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentRequestBody),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      const statusCode = response.status
      let errorMessage = `Agent API request failed with status ${statusCode}`

      switch (statusCode) {
        case 404:
          errorMessage =
            'Agent endpoint not found. Please verify SERVER_ENDPOINT and AGENT_ID configuration'
          break
        case 401:
          errorMessage =
            'Unauthorized access to agent API. Please check authentication credentials'
          break
        case 403:
          errorMessage =
            'Forbidden access to agent API. Please verify permissions'
          break
        case 429:
          errorMessage = 'Rate limit exceeded. Please try again later'
          break
        case 500:
          errorMessage = 'Internal server error occurred in agent API'
          break
      }

      console.error('Agent API Error:', {
        status: statusCode,
        endpoint: `${process.env.SERVER_ENDPOINT}/${process.env.AGENT_ID_EVALUATOR}/message`,
        error: errorText,
        requestBody: agentRequestBody,
      })

      return NextResponse.json(
        {
          error: errorMessage,
          details: {
            status: statusCode,
            message: errorText,
          },
        },
        { status: statusCode },
      )
    }

    const elizaResponse = await response.json()

    console.log('* elizaResponse:', elizaResponse)

    switch (elizaResponse.text) {
      case 'SEARCH_PLACES_NEARBY':
        const agentRequestSearchPlacesNearbyBody = {
          user: uid,
          text: JSON.stringify({
            query:
              'use the action WEB_SEARCH to search in the web for places nearby the user location. return 5 places nearby the user location. return the name and url link of the place. like a comma separated list. ' +
              'Just return the comma separated list, no other text or comments.make sure user is mentioning Aurum.',
            context: {
              userLocation: memoryData?.geolocation?.address,
              conversation: formattedTranscript,
            },
          }),
        }

        console.log(
          'agentRequestSearchPlacesNearbyBody:',
          agentRequestSearchPlacesNearbyBody,
        )

        const response = await fetch(
          `${process.env.SERVER_ENDPOINT}/${process.env.AGENT_ID_EVALUATOR}/message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(agentRequestSearchPlacesNearbyBody),
          },
        )

        const elizaResponseSearchPlacesNearby = await response.json()

        console.log(
          'elizaResponseSearchPlacesNearby:',
          elizaResponseSearchPlacesNearby,
        )

        break
      case 'NOT_ACTION':
        console.log('NOT_ACTION')
        break
    }

    //console.log("response from eliza:", elizaResponse)

    const agentResponse: AgentResponse = elizaResponse

    return NextResponse.json({
      success: true,
      memory_id: memoryData.id,
      status: memoryData.status,
      agent_response: agentResponse,
    })
  } catch (error) {
    console.error('Error processing memory creation:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error'
    const statusCode =
      error instanceof Error && 'status' in error
        ? (error as { status: number }).status
        : 500

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack:
                  process.env.NODE_ENV === 'development'
                    ? error.stack
                    : undefined,
              }
            : undefined,
      },
      { status: statusCode },
    )
  }
}


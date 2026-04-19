import crypto from 'crypto'

/**
 * Creates a mock Request object for testing
 */
export function createMockRequest(
  body: Record<string, unknown> | string = {},
  headers: Record<string, string> = {},
): Request {
  const bodyContent =
    typeof body === 'string' ? body : JSON.stringify(body)

  return new Request('http://localhost:3000/api/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: bodyContent,
  })
}

/**
 * Creates a valid Omi webhook payload with required fields
 */
export function createMockOmiWebhook() {
  return {
    id: 'memory-' + crypto.randomBytes(8).toString('hex'),
    created_at: new Date().toISOString(),
    started_at: new Date(Date.now() - 3600000).toISOString(),
    finished_at: new Date().toISOString(),
    source: 'omi',
    language: 'en',
    structured: {
      title: 'Test Memory',
      overview: 'This is a test memory created during testing',
      emoji: '🧠',
      category: 'general',
      action_items: [
        {
          description: 'Complete test task',
          completed: false,
        },
      ],
      events: [],
    },
    transcript_segments: [
      {
        text: 'Hello, this is a test conversation',
        speaker: 'Speaker 1',
        speakerId: 1,
        is_user: true,
        start: 0,
        end: 5,
      },
      {
        text: 'This is the response',
        speaker: 'Speaker 2',
        speakerId: 2,
        is_user: false,
        start: 5,
        end: 10,
      },
    ],
    geolocation: {
      google_place_id: 'ChIJ1234567890',
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'San Francisco, CA, USA',
      location_type: 'APPROXIMATE',
    },
    photos: [],
    plugins_results: [],
    external_data: null,
    discarded: false,
    deleted: false,
    visibility: 'private',
    processing_memory_id: null,
    status: 'completed',
  }
}

/**
 * Creates a mock project object
 */
export function createMockProject(overrides: Record<string, unknown> = {}) {
  const projectId = 'prj-' + crypto.randomBytes(8).toString('hex')
  return {
    id: projectId,
    name: 'Test Project',
    description: 'A test project for unit testing',
    adminId: 'user-123',
    image: 'https://example.com/image.jpg',
    status: 'active',
    visibility: 'public',
    createdAt: new Date(),
    updatedAt: new Date(),
    admin: {
      id: 'user-123',
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    },
    community: [],
    quests: [],
    badges: [],
    token: null,
    ...overrides,
  }
}

/**
 * Creates a mock memory object
 */
export function createMockMemory(overrides: Record<string, unknown> = {}) {
  const memoryId = 'mem-' + crypto.randomBytes(8).toString('hex')
  return {
    id: memoryId,
    uid: 'user-123',
    source: 'omi',
    title: 'Test Memory',
    content: 'This is test memory content',
    createdAt: new Date(),
    updatedAt: new Date(),
    startedAt: new Date(Date.now() - 3600000),
    finishedAt: new Date(),
    language: 'en',
    status: 'completed',
    visibility: 'private',
    ...overrides,
  }
}

/**
 * Creates a mock user object
 */
export function createMockUser(overrides: Record<string, unknown> = {}) {
  const userId = 'user-' + crypto.randomBytes(8).toString('hex')
  return {
    id: userId,
    email: `user-${userId}@example.com`,
    username: `user_${userId}`,
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    bio: 'Test user bio',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Creates a mock conversation object
 */
export function createMockConversation(overrides: Record<string, unknown> = {}) {
  const conversationId = 'conv-' + crypto.randomBytes(8).toString('hex')
  return {
    id: conversationId,
    userId: 'user-123',
    title: 'Test Conversation',
    description: 'A test conversation',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Generates a valid Omi webhook signature for testing
 */
export function generateOmiSignature(
  body: Record<string, unknown> | string,
  secret: string = process.env.OMI_WEBHOOK_SECRET || 'test-secret-key-123',
): string {
  const bodyContent =
    typeof body === 'string' ? body : JSON.stringify(body)
  return crypto
    .createHmac('sha256', secret)
    .update(bodyContent)
    .digest('hex')
}

/**
 * Mocks a Prisma database call
 */
export function mockPrismaResponse(
  mockFn: any,
  response: unknown,
): void {
  mockFn.mockResolvedValue(response)
}

/**
 * Mocks a Prisma database error
 */
export function mockPrismaError(mockFn: any, error: Error): void {
  mockFn.mockRejectedValue(error)
}

/**
 * Creates a mock fetch response
 */
export function createMockFetchResponse(
  data: unknown,
  options: { status?: number; statusText?: string } = {},
): Response {
  const { status = 200, statusText = 'OK' } = options
  return new Response(JSON.stringify(data), {
    status,
    statusText,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Validates that a request has valid JSON body
 */
export async function getRequestBody(
  request: Request,
): Promise<Record<string, unknown>> {
  return request.json()
}

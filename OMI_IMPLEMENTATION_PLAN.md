# Action Item - Omi Integration Implementation Plan

**Objective**: Fix critical security/stability issues and add Developer API integration  
**Timeline**: 2-3 weeks  
**Priority**: Phase 1 (weeks 1-2) is critical for production readiness

---

## Phase 1: Security & Stability (CRITICAL)

### Issue #1: Remove/Fix Global State in `/api/omi/route.ts`

**Current Code Problem**:
```typescript
// ❌ BROKEN - src/app/api/omi/route.ts
let content = ''
let in_note = false

export async function POST(request: Request) {
  for (const segment of response.segments) {
    if (lowerText.includes('start') && !in_note) {
      in_note = true // Race condition!
    }
    if (in_note) {
      content += ' ' + segment.text
    }
    if (lowerText.includes('finish') && in_note) {
      in_note = false
      await createConversation({...})
      content = ''
    }
  }
}
```

**Decision Matrix**:

| Option | Pros | Cons | Recommendation |
|--------|------|------|---|
| **A: Delete** | Removes bug, simplifies code | Might break streaming feature | ✅ **Try this first** |
| **B: Refactor to DB** | Keeps streaming feature | Complex, needs new schema | If streaming is critical |
| **C: Use Request Context** | Thread-safe, no global state | Requires refactoring | Alternative to B |

**Recommended: Option A (Delete)**

**Steps**:
```bash
1. Check git history for why this endpoint exists
2. Search codebase for references to /api/omi POST
3. Verify /api/omi/memories is the primary endpoint
4. If no references, delete the file
5. Test that memory creation still works
```

**Test Case**:
```typescript
// Test that concurrent requests don't interfere
const test = async () => {
  const request1 = POST(mockRequest('start hello finish'))
  const request2 = POST(mockRequest('start world finish'))
  
  const [r1, r2] = await Promise.all([request1, request2])
  
  // Both should succeed without interference
  expect(r1.content).toContain('hello')
  expect(r2.content).toContain('world')
  // Not mixed!
}
```

---

### Issue #2: Add Webhook Signature Verification

**Why**: Prevent spoofed memories, ensure data comes from Omi

**Implementation**:

```typescript
// src/lib/omi-webhook.ts - NEW FILE
import crypto from 'crypto'

const OMI_WEBHOOK_SECRET = process.env.OMI_WEBHOOK_SECRET || ''

/**
 * Verify that webhook came from Omi
 * Assumes Omi sends X-Omi-Signature header with HMAC-SHA256(body, secret)
 * Adjust based on actual Omi webhook format
 */
export async function verifyOmiWebhookSignature(
  request: Request,
): Promise<boolean> {
  // Get signature from header
  const signature = request.headers.get('X-Omi-Signature')
  if (!signature) {
    console.warn('Missing X-Omi-Signature header')
    return false
  }

  // Get raw body
  const body = await request.clone().text()

  // Calculate expected signature
  const hmac = crypto
    .createHmac('sha256', OMI_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  // Compare (timing-safe comparison)
  const match = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hmac),
  )

  return match
}

/**
 * Middleware wrapper for verifying webhook signatures
 */
export async function requireOmiWebhookSignature(
  request: Request,
): Promise<{ valid: boolean; error?: string }> {
  if (!OMI_WEBHOOK_SECRET) {
    console.error('OMI_WEBHOOK_SECRET not configured')
    return { valid: false, error: 'Webhook verification not configured' }
  }

  try {
    const valid = await verifyOmiWebhookSignature(request)
    if (!valid) {
      return { valid: false, error: 'Invalid webhook signature' }
    }
    return { valid: true }
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return { valid: false, error: 'Signature verification failed' }
  }
}
```

**Update `/api/omi/memories/route.ts`**:
```typescript
import { requireOmiWebhookSignature } from '@/lib/omi-webhook'

export async function POST(request: NextRequest) {
  // NEW: Verify webhook signature first
  const verification = await requireOmiWebhookSignature(request)
  if (!verification.valid) {
    console.warn(`Webhook verification failed: ${verification.error}`)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    )
  }

  try {
    const memoryRequest = await request.json()
    // ... rest of handler
  } catch (error) {
    // ... error handling
  }
}
```

**Testing**:
```typescript
// __tests__/api/omi-memories.test.ts
import { POST } from '@/app/api/omi/memories/route'
import { verifyOmiWebhookSignature } from '@/lib/omi-webhook'

describe('POST /api/omi/memories', () => {
  it('should reject requests without valid signature', async () => {
    const request = new Request('http://localhost:3000/api/omi/memories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 'test' }),
    })

    const response = await POST(request as NextRequest)
    expect(response.status).toBe(401)
  })

  it('should accept requests with valid signature', async () => {
    // Create valid signature
    const body = JSON.stringify({ id: 'test' })
    const hmac = crypto
      .createHmac('sha256', process.env.OMI_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex')

    const request = new Request('http://localhost:3000/api/omi/memories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Omi-Signature': hmac,
      },
      body,
    })

    const response = await POST(request as NextRequest)
    expect(response.status).toNotBe(401)
  })
})
```

---

### Issue #3: Add Rate Limiting

**Why**: Prevent abuse, control Omi API usage

**Implementation**:

```typescript
// src/lib/rate-limit.ts - NEW FILE
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// For local development: simple in-memory implementation
class InMemoryRateLimiter {
  private store = new Map<string, number[]>()

  async limit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
    const now = Date.now()
    const times = this.store.get(key) || []

    // Remove expired entries
    const recent = times.filter(t => now - t < windowMs)

    if (recent.length >= maxRequests) {
      return false
    }

    recent.push(now)
    this.store.set(key, recent)
    return true
  }
}

// Production: Use Upstash Redis
const getRedisClient = () => {
  if (!process.env.REDIS_URL) {
    // Fallback to in-memory
    return new InMemoryRateLimiter()
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      100, // 100 requests
      '1 m' // per minute
    ),
  })
}

export const omiWebhookRateLimiter = getRedisClient()

/**
 * Check if Omi webhook should be allowed
 * Rate limit per user (extracted from uid parameter)
 */
export async function checkOmiWebhookRateLimit(uid: string): Promise<{
  allowed: boolean
  remaining?: number
  resetAt?: number
}> {
  try {
    const result = await omiWebhookRateLimiter.limit(`omi-webhook:${uid}`)

    if (typeof result === 'boolean') {
      // In-memory implementation
      return { allowed: result }
    }

    // Upstash implementation
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.resetAfter,
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open: allow request if check fails
    return { allowed: true }
  }
}
```

**Update `/api/omi/memories/route.ts`**:
```typescript
import { checkOmiWebhookRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const verification = await requireOmiWebhookSignature(request)
  if (!verification.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const uid = searchParams.get('uid')

  if (!uid) {
    return NextResponse.json(
      { error: 'Missing uid parameter' },
      { status: 400 },
    )
  }

  // NEW: Check rate limit
  const rateLimitResult = await checkOmiWebhookRateLimit(uid)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  try {
    const memoryRequest = await request.json()
    // ... rest of handler
  } catch (error) {
    // ... error handling
  }
}
```

---

### Issue #4: Validate Omi Webhook Format

**Why**: Catch malformed requests early, type-safe processing

**Implementation**:

```typescript
// src/types/omi.ts - NEW FILE
import { z } from 'zod'

// Define exact schema for Omi webhooks
export const OmiTranscriptSegmentSchema = z.object({
  text: z.string(),
  speaker: z.string(),
  speaker_id: z.number(),
  is_user: z.boolean(),
  start: z.number(),
  end: z.number(),
})

export const OmiActionItemSchema = z.object({
  description: z.string(),
  completed: z.boolean(),
})

export const OmiStructuredDataSchema = z.object({
  title: z.string(),
  overview: z.string(),
  emoji: z.string(),
  category: z.string(),
  action_items: z.array(OmiActionItemSchema),
  events: z.array(z.unknown()).optional(),
})

export const OmiGeolocationSchema = z.object({
  google_place_id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  location_type: z.string(),
})

export const OmiMemoryWebhookSchema = z.object({
  id: z.string(),
  created_at: z.string().datetime(),
  started_at: z.string().datetime(),
  finished_at: z.string().datetime(),
  source: z.string(),
  language: z.string(),
  structured: OmiStructuredDataSchema,
  transcript_segments: z.array(OmiTranscriptSegmentSchema),
  geolocation: OmiGeolocationSchema,
  photos: z.array(z.string()),
  plugins_results: z.unknown().optional(),
  external_data: z.unknown().optional(),
  discarded: z.boolean(),
  deleted: z.boolean(),
  visibility: z.string(),
  processing_memory_id: z.string().nullable(),
  status: z.string(),
})

export type OmiMemoryWebhook = z.infer<typeof OmiMemoryWebhookSchema>
```

**Update `/api/omi/memories/route.ts`**:
```typescript
import { OmiMemoryWebhookSchema } from '@/types/omi'

export async function POST(request: NextRequest) {
  // ... signature verification, rate limiting ...

  try {
    const rawData = await request.json()

    // NEW: Validate webhook format
    const validation = OmiMemoryWebhookSchema.safeParse(rawData)
    if (!validation.success) {
      console.warn('Invalid Omi webhook format:', validation.error)
      return NextResponse.json(
        {
          error: 'Invalid webhook format',
          details: validation.error.flatten(),
        },
        { status: 400 },
      )
    }

    const memoryData = validation.data

    // Now fully type-safe!
    await createMemory({
      memory: {
        id: memoryData.id,
        startedAt: new Date(memoryData.started_at),
        // ... rest with type safety
      },
    })

    // ... rest of handler
  } catch (error) {
    // ... error handling
  }
}
```

---

## Phase 2: Developer API Integration

### Issue #5: Create Omi API Client

```typescript
// src/lib/omi-client.ts - NEW FILE
import type { OmiMemoryWebhook } from '@/types/omi'

const OMI_API_BASE = 'https://api.omi.me/v1/dev'

export class OmiApiClient {
  private apiKey: string

  constructor(apiKey: string = process.env.OMI_API_KEY || '') {
    if (!apiKey) {
      throw new Error('OMI_API_KEY not configured')
    }
    this.apiKey = apiKey
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${OMI_API_BASE}${path}`

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(
        `Omi API error: ${response.status} - ${error.message || error}`,
      )
    }

    return response.json()
  }

  // Memories
  async getMemories(params?: { limit?: number; offset?: number }) {
    const search = new URLSearchParams()
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.offset) search.set('offset', String(params.offset))

    return this.request('GET', `/memories?${search}`)
  }

  async getMemory(id: string) {
    return this.request('GET', `/memories/${id}`)
  }

  async createMemory(memory: Partial<OmiMemoryWebhook>) {
    return this.request('POST', '/memories', memory)
  }

  async createMemoriesBatch(memories: Partial<OmiMemoryWebhook>[]) {
    if (memories.length > 25) {
      throw new Error('Batch limit is 25 memories')
    }
    return this.request('POST', '/memories/batch', { memories })
  }

  async searchMemories(query: string) {
    const search = new URLSearchParams({ q: query })
    return this.request('GET', `/memories/search?${search}`)
  }

  // Action Items
  async getActionItems(params?: { limit?: number; offset?: number }) {
    const search = new URLSearchParams()
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.offset) search.set('offset', String(params.offset))

    return this.request('GET', `/action-items?${search}`)
  }

  async createActionItem(item: {
    description: string
    completed?: boolean
    memory_id?: string
  }) {
    return this.request('POST', '/action-items', item)
  }

  async createActionItemsBatch(
    items: {
      description: string
      completed?: boolean
      memory_id?: string
    }[],
  ) {
    if (items.length > 50) {
      throw new Error('Batch limit is 50 action items')
    }
    return this.request('POST', '/action-items/batch', { items })
  }

  async updateActionItem(
    id: string,
    update: { completed?: boolean; description?: string },
  ) {
    return this.request('PATCH', `/action-items/${id}`, update)
  }

  // Conversations
  async getConversations(params?: { limit?: number; offset?: number }) {
    const search = new URLSearchParams()
    if (params?.limit) search.set('limit', String(params.limit))
    if (params?.offset) search.set('offset', String(params.offset))

    return this.request('GET', `/conversations?${search}`)
  }

  async createConversation(conversation: { text: string; type?: string }) {
    return this.request('POST', '/conversations', conversation)
  }
}

// Singleton instance
let omiClient: OmiApiClient | null = null

export function getOmiClient(): OmiApiClient {
  if (!omiClient) {
    omiClient = new OmiApiClient()
  }
  return omiClient
}
```

**Testing**:
```typescript
// __tests__/lib/omi-client.test.ts
import { OmiApiClient } from '@/lib/omi-client'

describe('OmiApiClient', () => {
  const client = new OmiApiClient('test-key')

  it('should construct correct request headers', async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ memories: [] }),
      }),
    )

    await client.getMemories()

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
        }),
      }),
    )
  })

  it('should handle batch size limits', async () => {
    const items = Array(51).fill({ description: 'test' })

    await expect(client.createActionItemsBatch(items)).rejects.toThrow(
      'Batch limit is 50',
    )
  })
})
```

---

### Issue #6: Sync Action Items Back to Omi

```typescript
// Update src/app/api/omi/memories/route.ts

import { getOmiClient } from '@/lib/omi-client'

export async function POST(request: NextRequest) {
  // ... verification, rate limiting, validation ...

  try {
    const memoryData = validation.data
    const uid = searchParams.get('uid')!

    // Store in our database
    await createMemory({ memory: {...} })

    // NEW: Sync action items back to Omi
    if (memoryData.structured?.action_items?.length > 0) {
      try {
        const omiClient = getOmiClient()

        const actionItems = memoryData.structured.action_items.map(item => ({
          description: item.description,
          completed: item.completed || false,
          memory_id: memoryData.id,
        }))

        await omiClient.createActionItemsBatch(actionItems)

        console.log(`Synced ${actionItems.length} action items to Omi`)
      } catch (error) {
        // Log error but don't fail the webhook
        console.error('Failed to sync action items to Omi:', error)
        // Could queue for retry later
      }
    }

    return NextResponse.json({
      success: true,
      memory_id: memoryData.id,
    })
  } catch (error) {
    // ... error handling
  }
}
```

---

### Issue #7: Add Memory Search Endpoint

```typescript
// src/app/api/memories/search/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server'
import { getOmiClient } from '@/lib/omi-client'
import prisma from '@/server/prismaClient'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const source = searchParams.get('source') || 'omi'

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 },
      )
    }

    // Search from multiple sources
    const results = {
      omi_memories: [] as any[],
      local_memories: [] as any[],
    }

    // Option 1: Search in Omi via API
    if (source === 'omi' || source === 'all') {
      try {
        const omiClient = getOmiClient()
        const omiResults = await omiClient.searchMemories(query)
        results.omi_memories = omiResults.memories || []
      } catch (error) {
        console.error('Omi search failed:', error)
      }
    }

    // Option 2: Search locally (basic text search)
    if (source === 'local' || source === 'all') {
      const localMemories = await prisma.memory.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        include: {
          user: {
            select: { id: true, username: true, displayName: true },
          },
        },
      })
      results.local_memories = localMemories
    }

    return NextResponse.json({
      query,
      results,
      total: results.omi_memories.length + results.local_memories.length,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 },
    )
  }
}
```

---

## Phase 1 Checklist

```
Security & Stability
─────────────────────
□ Analyze /api/omi/route.ts usage
□ Delete or refactor global state
□ Implement webhook signature verification
□ Add Zod schema validation
□ Create rate limiting library
□ Update /api/omi/memories with all security checks
□ Write unit tests for all new security features
□ Test concurrent requests don't interfere
□ Update .env.example with new variables
□ Document webhook format and signature

Environment Variables
─────────────────────
□ OMI_WEBHOOK_SECRET - Get from Omi dashboard
□ OMI_API_KEY - Get from Omi settings
□ REDIS_URL (optional) - For production rate limiting

Testing
───────
□ Unit tests: rate limiting, webhook verification
□ Integration tests: webhook endpoint
□ E2E test: full webhook flow
□ Load test: concurrent webhook requests
□ Security test: spoofed webhook rejection
```

---

## Phase 2 Checklist

```
Developer API Integration
──────────────────────────
□ Create OmiApiClient class
□ Implement memory operations (get, create, search)
□ Implement action item operations
□ Add batch operation support
□ Update memory webhook to sync back to Omi
□ Create memory search endpoint
□ Add Omi API error handling
□ Write tests for OmiApiClient
□ Test action item syncing

Documentation
──────────────
□ Document Omi webhook format
□ Document OmiApiClient usage
□ Add examples to README
□ Document rate limits and quotas
□ Document webhook verification process
```

---

## Deployment Steps

**After Phase 1 (before pushing to production)**:
1. Generate webhook secret
2. Set `OMI_WEBHOOK_SECRET` in production environment
3. Get API key from Omi dashboard
4. Set `OMI_API_KEY` in production environment
5. Test webhook endpoint with real Omi webhook
6. Monitor logs for verification failures
7. Adjust webhook signature verification if needed

**After Phase 2**:
1. Deploy OmiApiClient
2. Test action item syncing with real Omi account
3. Verify items appear in Omi app
4. Monitor for API rate limit issues
5. Set up alerts for failed API calls

---

## Questions to Answer

1. **Webhook Signature Format**: How does Omi sign webhooks? (HMAC-SHA256? Header name?)
2. **Streaming Endpoint**: Is `/api/omi/route.ts` still needed? Purpose?
3. **Omi Dashboard**: Where to get API key and webhook secret?
4. **Agent IDs**: What are the 3 agent IDs for Builder, Growth, Fundraiser?
5. **Rate Limits**: Confirmed limits from Omi (100 req/min, 10K daily)?
6. **Data Storage**: Should geolocation/transcripts be encrypted at rest?


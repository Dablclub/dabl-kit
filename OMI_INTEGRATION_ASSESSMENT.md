# Action Item - Omi Integration Assessment & Improvement Plan

**Date**: 2026-04-18  
**Current Implementation Status**: Partial (webhook-based only)  
**Omi Docs Reviewed**: 3 official documentation sections

---

## Omi Ecosystem Overview

Omi is "the world's most advanced open-source AI wearable" that captures, transcribes, and processes conversations. The ecosystem has 3 interaction patterns:

```
┌─────────────────────────────────────────┐
│      Omi Wearable Device                │
│  • Real-time conversation capture       │
│  • Speaker identification               │
│  • Bluetooth to mobile app              │
└──────────────┬──────────────────────────┘
               │
               ├─────────────────────────────┬──────────────────────┬──────────────────┐
               ▼                             ▼                      ▼                  ▼
         ┌──────────────┐      ┌──────────────────┐      ┌──────────────┐    ┌──────────────┐
         │ Webhook Push │      │  Developer API   │      │     MCP      │    │  Mobile App  │
         │ (Real-time)  │      │  (Programmatic)  │      │  (AI Tools)  │    │  (User UI)   │
         │              │      │                  │      │              │    │              │
         │ ✅ In Use    │      │ ❌ Not Used      │      │ ❌ Not Used  │    │ ✅ In Use    │
         └──────────────┘      └──────────────────┘      └──────────────┘    └──────────────┘
                │                      │                        │
                │ POST requests         │ GET/POST requests      │ AI assistant
                │ when memories         │ programmatic access    │ context protocol
                │ are created           │ to memories & actions  │
                │                       │                        │
                └───────────────────────┴────────────────────────┘
                        │
                        ▼
            ┌──────────────────────────────┐
            │  Action Item App Backend     │
            │  (Our Next.js Application)  │
            │                              │
            │ /api/omi/memories           │
            │ /api/omi/route.ts           │
            │ /server/controllers/*       │
            │ /prisma/schema.prisma       │
            └──────────────────────────────┘
```

---

## Current Implementation Review

### What's Working ✅

**1. Webhook Integration (Receiving Data)**
- **File**: `src/app/api/omi/memories/route.ts`
- **Capability**: Receives POST requests from Omi when memories are created
- **Data Received**:
  ```typescript
  {
    id: string
    created_at: timestamp
    started_at: timestamp
    finished_at: timestamp
    source: string (e.g., "web")
    language: string
    structured: {
      title: string
      overview: string
      emoji: string
      category: string
      action_items: { description, completed }[]
      events: []
    }
    transcript_segments: {
      text: string
      speaker: string
      speaker_id: number
      is_user: boolean
      start: number
      end: number
    }[]
    geolocation: {
      google_place_id: string
      latitude: number
      longitude: number
      address: string
      location_type: string
    }
    photos: string[]
    plugins_results: unknown[]
    external_data: unknown | null
    visibility: string
  }
  ```
- **Status**: ✅ Properly implemented with validation
- **Features**: Geolocation, action items, transcripts all captured

**2. Agent Integration**
- **File**: `src/app/api/omi/memories/route.ts` (lines 134-260)
- **Purpose**: Route memories through ElizaOS agent for intelligent processing
- **Logic**: Determines if memory is "REGISTER_PROJECT" or "NO_ACTION"
- **Status**: ✅ Working with error handling

**3. Database Storage**
- **File**: `src/server/controllers/memories.ts`
- **Models**: Memory, Conversation, ConversationParticipant
- **Status**: ✅ Storing memories locally

---

### Critical Issues ❌

#### 1. **Global State in Streaming Handler** 🔴 CRITICAL
**File**: `src/app/api/omi/route.ts` (lines 22-54)

```typescript
// ❌ BROKEN
let content = ''
let in_note = false

export async function POST(request: Request) {
  for (const segment of response.segments) {
    if (lowerText.includes('start') && !in_note) {
      in_note = true // Shared across all concurrent requests!
    }
  }
}
```

**Problems**:
- Module-level state in serverless → race conditions
- Multiple concurrent voice streams interfere
- Data gets mixed between users
- Not production-safe

**Reality Check**: This endpoint might not even be needed anymore because:
- Omi webhook sends COMPLETE memories, not streaming segments
- The `/api/omi/memories` endpoint receives full, processed memories
- This "streaming" handler seems to be for a different use case

---

#### 2. **No Omi Developer API Integration** 🟡 MEDIUM
**Gap**: Not using official Omi APIs

The Omi Developer API provides:
```
GET  /api/v1/dev/memories          - List all memories
POST /api/v1/dev/memories          - Create memory
POST /api/v1/dev/memories/batch    - Bulk create (25 at once)

GET  /api/v1/dev/action-items      - List action items
POST /api/v1/dev/action-items      - Create action item
POST /api/v1/dev/action-items/batch - Bulk create (50 at once)

GET  /api/v1/dev/conversations     - Get conversations
POST /api/v1/dev/conversations     - Post conversation

All require Bearer token auth
Rate limits: 100 req/min, 10,000 req/day
```

**Current Status**: Not using at all
**Why Needed**:
- Sync action items back to Omi device
- Retrieve memories for search/filtering
- Export data for analysis
- Integrate with other Omi integrations

---

#### 3. **No MCP (Model Context Protocol) Support** 🟡 MEDIUM
**Gap**: Not enabling AI assistant integration

The Omi MCP server allows:
- Claude, Cursor, other AI tools to access your memories
- Semantic search across memories
- AI-powered memory management
- AI context-aware workflows

**Why Useful**:
- Users can ask Claude about their memories
- Claude can help organize/search memories
- Create AI-powered workflows
- Integration with existing Claude ecosystem

---

#### 4. **Magic String Commands** 🟡 MEDIUM
**File**: `src/app/api/omi/route.ts` (lines 32, 41)

```typescript
if (lowerText.includes('start') && !in_note) { // ❌ Magic string
if (lowerText.includes('finish') && !in_note) { // ❌ Magic string
```

**Issues**:
- Not documented
- Unclear if these are official Omi commands
- No configuration
- Error-prone

---

#### 5. **Agent Response Handling** 🟡 MEDIUM
**File**: `src/app/api/omi/memories/route.ts` (lines 218-260)

```typescript
switch (elizaResponse.text) {
  case 'SEARCH_PLACES_NEARBY':  // ❌ Incomplete implementation
  case 'NOT_ACTION':             // ❌ Not documented
}
```

**Issues**:
- Only 2 of 3 agents handled (Builder, Growth agents not implemented)
- "SEARCH_PLACES_NEARBY" case not finished
- "NOT_ACTION" case has no action
- No documentation of expected agent responses

---

#### 6. **No Webhook Signature Verification** 🔴 CRITICAL
**File**: `src/app/api/omi/memories/route.ts`

**Missing**:
- Webhook signature validation
- No verification that request came from Omi
- Security vulnerability: anyone can post memories

**Required**:
```typescript
// Should verify X-Omi-Signature header or similar
function verifyOmiWebhook(request: Request): boolean {
  const signature = request.headers.get('X-Omi-Signature')
  // Verify signature matches expected value
  // Protect against spoofed webhooks
}
```

---

#### 7. **No Rate Limiting** 🟡 MEDIUM
**File**: All `/api/omi/*` endpoints

**Missing**:
- Rate limiting on webhook endpoints
- Could be abused to spam memories
- No request throttling

---

#### 8. **Incomplete Error Handling** 🟠 MEDIUM
**File**: `src/app/api/omi/memories/route.ts` (lines 272-300)

```typescript
const statusCode =
  error instanceof Error && 'status' in error
    ? (error as { status: number }).status
    : 500

// Generic 500 error, not useful for debugging
```

**Issues**:
- Generic error responses
- No logging to external service
- Hard to debug in production
- No metrics on webhook failures

---

## What's Missing

### 1. Developer API Integration (Not Done)
```
API Endpoint:     https://api.omi.me/v1/dev
Authentication:   Bearer {api_key}
Rate Limits:      100 req/min, 10,000 req/day
Batch Support:    Up to 25 memories, 50 action items

Missing Capabilities:
- [ ] Sync action items back to Omi
- [ ] Search memories via API
- [ ] Retrieve archived memories
- [ ] Export data for analysis
- [ ] Batch operations
```

### 2. MCP Integration (Not Done)
```
Protocol:    Model Context Protocol
Purpose:     AI assistant integration
Tools:       search_memories, create_memory, etc.
Missing:     No support at all
```

### 3. Advanced Features
```
Missing:
- [ ] Webhook signature verification
- [ ] Rate limiting
- [ ] Retry logic for failed webhooks
- [ ] Webhook delivery status tracking
- [ ] Memory search functionality
- [ ] Geolocation processing
- [ ] Photo processing
- [ ] Plugin results handling
- [ ] External data integration
```

### 4. Documentation
```
Missing:
- [ ] Omi webhook format documentation
- [ ] Agent response schema documentation
- [ ] API key setup guide
- [ ] Webhook verification guide
- [ ] Rate limiting strategy
- [ ] Error handling strategy
```

---

## Recommended Architecture

### Current Flow (Partial)
```
Omi Device → Omi Mobile App → Omi Backend → 
  /api/omi/memories webhook → 
    Memory Controller → Prisma → Database
```

### Improved Flow (Complete)
```
┌──────────────────────────────────────────────────────────────┐
│ INBOUND: Receive memories from Omi                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Omi Device → Omi Mobile → Omi Backend                      │
│                              │                              │
│                              ▼                              │
│                   /api/omi/memories POST                    │
│                   (webhook from Omi)                        │
│                              │                              │
│                    ✅ Verify signature                       │
│                    ✅ Rate limiting                          │
│                              │                              │
│                    ▼─────────▼─────────▼                    │
│                    Memory Processor                         │
│                      │         │       │                   │
│          ✅ Validate  ✅ Parse  ✅ Enrich                  │
│                      │         │       │                   │
│                    ▼─────────▼─────────▼                    │
│                    Agent Processing (ElizaOS)              │
│                    (Determine action type)                 │
│                              │                              │
│                    ▼─────────▼─────────▼                    │
│              [Project?] [Growth?] [Other?]                │
│                              │                              │
│                    ▼─────────▼─────────▼                    │
│                    Database Storage                         │
│                    (Memory, Conversation)                   │
│                                                             │
├──────────────────────────────────────────────────────────────┤
│ OUTBOUND: Sync results back to Omi                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ❌ Missing: Sync action items back to Omi API             │
│                                                              │
│  Should: POST /api/v1/dev/action-items                     │
│          with processed items                              │
│                                                              │
│  Benefits:                                                 │
│  - User sees action items in Omi app                       │
│  - Synced across devices                                   │
│  - Consistent state                                        │
│                                                             │
├──────────────────────────────────────────────────────────────┤
│ SEARCH: Retrieve and search memories                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ❌ Missing: Memory search functionality                    │
│                                                              │
│  Should: GET /api/v1/dev/memories?query=...               │
│          to search Omi's memory database                    │
│                                                              │
│  Benefits:                                                 │
│  - Find past memories                                      │
│  - Semantic search                                         │
│  - Analytics queries                                       │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Security & Stability (Weeks 1-2)

#### 1.1: Fix Global State Bug (CRITICAL)
**File**: `src/app/api/omi/route.ts`

**Options**:
A. Remove entire endpoint (if webhook is all we need)
B. Refactor to use database-backed sessions (if streaming is needed)

**Recommendation**: Option A - Remove it
- Omi webhooks already send complete memories
- Streaming handler seems unnecessary
- Removes complexity and bug

**Action**:
```
1. Delete /api/omi/route.ts (unless streaming required)
2. Test that /api/omi/memories still works
3. Document why this endpoint exists (if keeping it)
```

#### 1.2: Add Webhook Verification (CRITICAL)
**File**: Create `src/lib/omi-webhook.ts`

```typescript
// src/lib/omi-webhook.ts
export function verifyOmiWebhookSignature(
  request: Request,
  secret: string,
): boolean {
  const signature = request.headers.get('X-Omi-Signature')
  if (!signature) return false
  
  // Verify signature matches HMAC-SHA256(body, secret)
  // Implementation depends on Omi's spec
}

// src/app/api/omi/memories/route.ts
import { verifyOmiWebhookSignature } from '@/lib/omi-webhook'

export async function POST(request: NextRequest) {
  if (!verifyOmiWebhookSignature(request, process.env.OMI_WEBHOOK_SECRET!)) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 },
    )
  }
  
  // Process memory...
}
```

#### 1.3: Add Rate Limiting
**File**: Create `src/lib/rate-limit.ts`

```typescript
// Simple in-memory rate limiting (for MVP)
// Production: use Redis
const requests = new Map<string, number[]>()

export function checkRateLimit(key: string, limit: number, window: number): boolean {
  const now = Date.now()
  const times = requests.get(key) || []
  
  // Remove old requests outside window
  const recent = times.filter(t => now - t < window)
  
  if (recent.length >= limit) return false
  
  recent.push(now)
  requests.set(key, recent)
  return true
}
```

#### 1.4: Validate & Document Webhook Format
**File**: Create `src/types/omi.ts`

```typescript
// Document exact format Omi sends
export interface OmiMemoryWebhook {
  id: string
  created_at: string
  // ... all fields
}

// Validate in route:
const validated = OmiMemoryWebhookSchema.safeParse(memoryRequest)
if (!validated.success) {
  return NextResponse.json(
    { error: 'Invalid webhook format', details: validated.error },
    { status: 400 },
  )
}
```

---

### Phase 2: Developer API Integration (Weeks 3-4)

#### 2.1: Create Omi API Client
**File**: Create `src/lib/omi-client.ts`

```typescript
export class OmiClient {
  private baseUrl = 'https://api.omi.me/v1/dev'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createMemory(memory: CreateMemoryRequest) {
    return fetch(`${this.baseUrl}/memories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memory),
    })
  }

  async getMemories(params?: { limit?: number; offset?: number }) {
    const url = new URL(`${this.baseUrl}/memories`)
    if (params?.limit) url.searchParams.set('limit', String(params.limit))
    if (params?.offset) url.searchParams.set('offset', String(params.offset))

    return fetch(url, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    })
  }

  async createActionItems(items: CreateActionItemRequest[]) {
    return fetch(`${this.baseUrl}/action-items/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    })
  }

  async searchMemories(query: string) {
    // If Omi supports semantic search
    return fetch(`${this.baseUrl}/memories/search?q=${query}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    })
  }
}
```

#### 2.2: Sync Action Items Back to Omi
**File**: Update `src/app/api/omi/memories/route.ts`

```typescript
import { OmiClient } from '@/lib/omi-client'

export async function POST(request: NextRequest) {
  const memoryData = await request.json()
  
  // Store in our database
  await createMemory(memoryData)
  
  // NEW: Sync action items back to Omi
  if (memoryData.structured?.action_items?.length > 0) {
    const omiClient = new OmiClient(process.env.OMI_API_KEY!)
    
    const actionItems = memoryData.structured.action_items.map(item => ({
      description: item.description,
      completed: item.completed,
      memory_id: memoryData.id,
    }))
    
    try {
      await omiClient.createActionItems(actionItems)
    } catch (error) {
      console.error('Failed to sync action items to Omi:', error)
      // Don't fail the webhook, but log for retry
    }
  }
}
```

#### 2.3: Add Memory Search via Omi API
**File**: Create `src/app/api/memories/search/route.ts`

```typescript
import { OmiClient } from '@/lib/omi-client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query required' },
      { status: 400 },
    )
  }
  
  const omiClient = new OmiClient(process.env.OMI_API_KEY!)
  
  try {
    const results = await omiClient.searchMemories(query)
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 },
    )
  }
}
```

---

### Phase 3: Advanced Features (Weeks 5-6)

#### 3.1: Webhook Delivery Tracking
```
New Prisma model:
model WebhookDelivery {
  id String @id
  omiMemoryId String
  status DeliveryStatus (PENDING, SUCCESS, FAILED)
  attempts Int @default(0)
  lastError String?
  createdAt DateTime
  updatedAt DateTime
}

Enables:
- Retry failed webhooks
- Webhook delivery status page
- Debugging webhook issues
```

#### 3.2: MCP Server Setup (Optional)
```
For supporting Claude Desktop and other AI tools:

Create MCP server that exposes:
- search_memories(query: string)
- create_memory(data: MemoryData)
- list_memories(limit: number)
- get_memory(id: string)

Enables Claude to:
- Ask about your memories
- Create memories programmatically
- Search and retrieve memories
- AI-powered workflows
```

---

## Security Considerations

### 1. API Key Management
```
Current: Environment variables
Recommended: 
  - Separate keys for Omi API (read/write)
  - Webhook signing secret
  - Rate limiting per key
  - Key rotation policy
```

### 2. Data Privacy
```
Current: All memory data stored in database
Issues:
  - Transcripts might contain sensitive info
  - Geolocation exposed to database
  - Photos stored unencrypted

Recommendations:
  - Encrypt sensitive fields at rest
  - Mask PII in transcripts (names, numbers)
  - Optional: federated storage (store in Omi only)
```

### 3. Webhook Security
```
Current: ❌ No verification
Required:
  - ✅ Verify webhook signature
  - ✅ Rate limit by IP/key
  - ✅ Validate request format
  - ✅ SSL/TLS only
```

---

## Estimated Effort & Timeline

| Phase | Tasks | Effort | Timeline |
|-------|-------|--------|----------|
| **1** | Fix global state, verification, rate limiting | 3 days | Weeks 1-2 |
| **2** | Developer API client, sync back, search | 5 days | Weeks 3-4 |
| **3** | Webhook tracking, MCP, advanced features | 4 days | Weeks 5-6 |
| **Total** | | 2.5 weeks | 6 weeks |

Can be done in parallel with codebase refactoring.

---

## Success Criteria

### Phase 1 (Stabilization)
- [ ] No global state in API routes
- [ ] Webhook signature verified
- [ ] Rate limiting working
- [ ] Error logging in place
- [ ] All Omi webhook formats validated

### Phase 2 (API Integration)
- [ ] Omi Developer API client working
- [ ] Action items synced to Omi
- [ ] Memory search via API working
- [ ] Tests for Omi client

### Phase 3 (Advanced)
- [ ] Webhook delivery tracking
- [ ] Retry logic for failed webhooks
- [ ] MCP server (optional)
- [ ] Full documentation

---

## Environment Variables Needed

```env
# Existing
DATABASE_URL=postgresql://...

# For Omi Integration
OMI_API_KEY=your_omi_dev_api_key
OMI_WEBHOOK_SECRET=webhook_signing_secret
OMI_USER_ID=your_omi_user_id (optional)

# For Agents
SERVER_ENDPOINT=https://eliza.example.com
AGENT_ID_EVALUATOR=agent_id
AGENT_ID_BUILDER=agent_id
AGENT_ID_GROWTH=agent_id
```

---

## Questions for Team

1. **Streaming vs Webhook**: Is the `/api/omi/route.ts` endpoint still needed? (For streaming segments or just complete memories?)
2. **Webhook Signature**: Does Omi provide signature verification? (How to validate?)
3. **Action Items**: Should we sync processed action items back to Omi?
4. **Search**: Do users need to search memories from our app?
5. **MCP**: Should we support AI assistants accessing memories?
6. **Sensitive Data**: How should we handle geolocation and transcripts?
7. **Rate Limits**: What rates can the Omi API handle?

---

## Summary

**Current State**: Receiving memories via webhook ✅, basic processing ⚠️, incomplete agent handling ❌

**Main Issues**:
1. Critical: Global state in serverless (remove endpoint)
2. Critical: No webhook verification (add signature check)
3. Medium: No Developer API integration (not syncing back)
4. Medium: Not using MCP (missing AI integration)
5. Medium: Incomplete agent routing (3 agents not all handled)

**Recommendation**: Fix Phase 1 issues immediately (2-3 days), then implement Developer API integration in Phase 2 (1 week).


# Omi Integration - Quick Summary

**Status**: Partial implementation with critical security gaps  
**Priority**: Fix Phase 1 (2 weeks) before production

---

## The Situation

You're using Omi wearable device to capture conversations. Current flow:

```
User speaks → Omi device → Transcription → Omi API → Your webhook → Database
```

**What's working**:
- ✅ Receiving memories via webhook
- ✅ Storing memories in database
- ✅ Agent processing for project detection
- ✅ Rich data capture (transcript, geolocation, action items)

**What's broken**:
- 🔴 Global state in `/api/omi/route.ts` (race conditions)
- 🔴 No webhook signature verification (spoofable)
- 🟡 No rate limiting (can be abused)
- 🟡 Not syncing results back to Omi
- 🟡 Not using Omi Developer API

---

## Three Critical Issues to Fix (Phase 1)

### 1️⃣ Remove Global State
**File**: `src/app/api/omi/route.ts`  
**Issue**: Module-level variables shared between concurrent requests  
**Fix**: Delete the file (appears unused) or refactor to use database sessions  
**Time**: 1 day

### 2️⃣ Verify Webhook Signatures
**File**: `src/app/api/omi/memories/route.ts`  
**Issue**: No verification that memory came from Omi (anyone can post memories)  
**Fix**: Add HMAC-SHA256 signature verification  
**Time**: 1 day

### 3️⃣ Add Rate Limiting
**Issue**: No limits on webhook requests (could spam memories)  
**Fix**: Implement rate limiting (100 req/min per user)  
**Time**: 1 day

**Total Phase 1**: ~2-3 days of work

---

## Omi API Capabilities (Not Used Yet)

Omi provides REST API at `https://api.omi.me/v1/dev`:

```
Endpoints           Max Batch   Rate Limit
──────────────────────────────────────────
POST /memories      1           100/min
POST /memories/batch 25          100/min
POST /action-items  1           100/min
POST /action-items/batch 50     100/min
GET /memories       —           100/min
GET /action-items   —           100/min
POST /conversations 1           100/min
```

**Benefits of using API**:
- Sync action items back to Omi (appears in user's phone)
- Search memories via semantic search
- Export data for analysis
- Batch operations for efficiency

---

## Implementation Roadmap

```
Phase 1 (Weeks 1-2) - CRITICAL
├── Remove/fix global state
├── Add webhook signature verification
├── Add rate limiting
├── Validate webhook format with Zod
└── Write tests for security features

Phase 2 (Weeks 3-4) - NICE TO HAVE
├── Create Omi API client library
├── Sync action items back to Omi
├── Add memory search endpoint
└── Implement retry logic for failed syncs

Phase 3 (Weeks 5-6) - OPTIONAL
├── Webhook delivery tracking
├── MCP support for AI assistants
└── Advanced geolocation processing
```

---

## Documentation Created

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **OMI_INTEGRATION_ASSESSMENT.md** | Current state, issues, gaps | 10 min |
| **OMI_IMPLEMENTATION_PLAN.md** | Code examples, step-by-step | 15 min |
| **OMI_SUMMARY.md** | This file, quick reference | 3 min |

---

## What You Need from Omi

To implement security features:

- [ ] Webhook signature verification method (HMAC? Header name?)
- [ ] API Key (from Omi Settings → Developer)
- [ ] Webhook secret (from Omi dashboard)
- [ ] Documentation on webhook format (we'll infer from observations)

---

## Quick Code Examples

### Before (Vulnerable)
```typescript
// ❌ Current - no verification
export async function POST(request: Request) {
  const data = await request.json()
  await createMemory(data) // Could be spoofed!
}
```

### After (Secure)
```typescript
// ✅ Phase 1 - verified and validated
import { verifyOmiWebhookSignature } from '@/lib/omi-webhook'
import { OmiMemoryWebhookSchema } from '@/types/omi'
import { checkOmiWebhookRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Check signature
  if (!await verifyOmiWebhookSignature(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check rate limit
  const uid = new URL(request.url).searchParams.get('uid')!
  if (!(await checkOmiWebhookRateLimit(uid)).allowed) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
  }
  
  // Validate format
  const data = await request.json()
  const validated = OmiMemoryWebhookSchema.safeParse(data)
  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  }
  
  // Now safe to process
  await createMemory(validated.data)
}
```

### Advanced (Phase 2)
```typescript
// ✅ Phase 2 - sync back to Omi
import { getOmiClient } from '@/lib/omi-client'

const omiClient = getOmiClient()

// After storing memory locally, sync action items to Omi
if (memoryData.structured?.action_items?.length > 0) {
  await omiClient.createActionItemsBatch(
    memoryData.structured.action_items.map(item => ({
      description: item.description,
      completed: item.completed,
      memory_id: memoryData.id,
    }))
  )
}
```

---

## Decision Points

### 1. Keep or Remove `/api/omi/route.ts`?
**Investigation needed**: Why does this streaming endpoint exist?
- Search git history for creation
- Check if anyone references it
- Ask: Are we receiving streaming segments or complete memories?

**Likely answer**: Remove it (Omi sends complete memories via webhook, not streams)

### 2. Implement Phase 2 API Integration?
**Benefits**: 
- Action items appear in Omi app
- Better user experience
- Seamless sync

**Effort**: 1 week

**Decision**: Recommend doing it (Phase 2 is straightforward after Phase 1)

### 3. Implement MCP Protocol?
**Benefits**:
- Claude/Cursor can access your memories
- AI-powered workflows
- Integration with existing Claude tools

**Effort**: 2-3 days

**Decision**: Optional, do if AI assistant access is important

---

## Environment Variables to Add

```env
# Required for Phase 1
OMI_WEBHOOK_SECRET=your_webhook_signing_secret_from_omi

# Required for Phase 2
OMI_API_KEY=your_api_key_from_omi_settings

# Optional for production rate limiting
REDIS_URL=redis://localhost:6379
```

---

## Testing Checklist

**After implementing Phase 1**:
- [ ] Webhook with valid signature: ✅ Success
- [ ] Webhook with invalid signature: ✅ 401 Unauthorized
- [ ] Webhook with rate limit exceeded: ✅ 429 Too Many Requests
- [ ] Webhook with malformed data: ✅ 400 Bad Request
- [ ] Concurrent webhooks: ✅ No interference
- [ ] Webhook with all optional fields: ✅ Success
- [ ] Webhook with missing required fields: ✅ 400 Bad Request

**After implementing Phase 2**:
- [ ] Action items synced to Omi: ✅ Visible in app
- [ ] Memory search works: ✅ Returns results
- [ ] Batch creation (25 items): ✅ Success
- [ ] Rate limiting enforced: ✅ No exceeding quota

---

## Risk Assessment

| Issue | Severity | Impact | Phase |
|-------|----------|--------|-------|
| Global state | 🔴 CRITICAL | Data corruption | 1 |
| No signature verification | 🔴 CRITICAL | Spoofed memories | 1 |
| No rate limiting | 🟡 MEDIUM | Abuse potential | 1 |
| No API integration | 🟡 MEDIUM | One-way sync only | 2 |
| No MCP support | 🟠 LOW | Missing AI integration | 3 |

---

## Success Criteria

### Phase 1 Complete ✅
- [ ] No global state in API routes
- [ ] Webhook signature verified
- [ ] Rate limiting working
- [ ] Input validation with Zod
- [ ] All tests passing
- [ ] Zero security warnings

### Phase 2 Complete ✅
- [ ] Omi API client library created
- [ ] Action items synced back to Omi
- [ ] Memory search endpoint working
- [ ] Batch operations supported
- [ ] Retry logic for failures

### Phase 3 Complete ✅
- [ ] Webhook delivery tracking
- [ ] MCP server implemented
- [ ] Full documentation

---

## Next Steps (Today)

1. **Read** OMI_INTEGRATION_ASSESSMENT.md (10 min) - understand current state
2. **Review** OMI_IMPLEMENTATION_PLAN.md (15 min) - see code examples
3. **Discuss with team**:
   - Approve Phase 1 work
   - Get Omi webhook signature format
   - Decide on Phase 2 timeline
4. **Start Phase 1** (this week):
   - Analyze `/api/omi/route.ts` usage
   - Implement webhook verification
   - Add rate limiting
   - Write tests

---

## Questions?

See OMI_INTEGRATION_ASSESSMENT.md "Questions for Team" section for detailed questions to ask Omi or your team.

---

## Key Files

**Current Omi Integration**:
- `src/app/api/omi/route.ts` - ❌ Has global state, likely removable
- `src/app/api/omi/memories/route.ts` - ✅ Main webhook handler (needs security fixes)
- `src/server/controllers/memories.ts` - ✅ Memory storage logic
- `prisma/schema.prisma` - Check Memory model fields

**To Create (Phase 1)**:
- `src/lib/omi-webhook.ts` - Signature verification
- `src/lib/rate-limit.ts` - Rate limiting
- `src/types/omi.ts` - Webhook schema (Zod)
- `__tests__/api/omi-memories.test.ts` - Tests

**To Create (Phase 2)**:
- `src/lib/omi-client.ts` - API client
- `src/app/api/memories/search/route.ts` - Search endpoint
- `__tests__/lib/omi-client.test.ts` - API tests

---

**Created**: 2026-04-18  
**Status**: Ready for implementation  
**Estimated Phase 1**: 2-3 weeks  
**Estimated Phase 2**: 1 week


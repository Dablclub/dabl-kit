# Phase 1 Onboarding Guide

**For**: New team members joining after Phase 1 implementation  
**Duration**: 2-3 hours to fully understand  
**Prerequisites**: Node.js 18+, understanding of Next.js  

---

## 30-Minute Quick Start

### For Backend Engineers

**What Changed?**
- Added webhook signature verification (security)
- Added rate limiting (abuse prevention)
- Added input validation (data integrity)
- Removed global state race condition
- Added 122 tests

**Key Files to Know**:
1. `src/lib/omi-webhook.ts` - Signature verification logic
2. `src/lib/rate-limit.ts` - Rate limiting implementation
3. `src/types/omi.ts` - Webhook schema definitions
4. `src/lib/errors.ts` - Error handling classes
5. `src/app/api/omi/memories/route.ts` - Webhook endpoint

**Do This Now**:
```bash
# 1. Clone and install
git clone <repo>
cd actionitem
npm install

# 2. Run tests to verify setup
npm test -- --run

# Expected: "122 passed"

# 3. Read code in this order
# - src/lib/omi-webhook.ts (15 min read)
# - src/app/api/omi/memories/route.ts (10 min read)
# - src/lib/errors.ts (5 min read)

# 4. Ask questions (see "Questions?" section below)
```

### For Frontend Engineers

**What Changed?**
- API validation is stricter now
- Error responses are standardized
- All endpoints require proper input format
- Rate limiting enforced

**Key Changes**:
```typescript
// Before: API might accept any format
const response = await fetch('/api/projects', {
  method: 'POST',
  body: JSON.stringify({ name: '' })  // Accepted!
})

// After: API validates strictly
const response = await fetch('/api/projects', {
  method: 'POST',
  body: JSON.stringify({ name: 'Valid Project' })  // Required
})

// Error response format (standardized)
if (!response.ok) {
  const error = await response.json()
  // error.error.details has field-specific errors
}
```

**Update Your Code**:
1. Add error handling for 400 (validation errors)
2. Add error handling for 429 (rate limits)
3. Update error messages to show field-specific errors
4. See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for exact formats

### For QA/Testing

**What's New?**
- 122 tests written and passing
- Security tests for webhook verification
- Validation tests for all endpoints
- Rate limiting tests

**Run Tests**:
```bash
# Watch mode (for development)
npm test

# CI mode (for scripts)
npm test -- --run

# Run specific test file
npm test -- src/__tests__/unit/lib/omi-webhook.test.ts

# With coverage
npm test -- --coverage
```

**Test Categories**:
- `src/__tests__/unit/` - Individual function tests
- `src/__tests__/integration/` - API endpoint tests
- Coverage: Security, validation, error handling

---

## 2-Hour Deep Dive

### For Backend Engineers (New to This Codebase)

**Step 1: Understand the Architecture (30 min)**

Read these in order:
1. [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md) - System overview
2. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Endpoint specs

**Step 2: Understand Phase 1 Changes (45 min)**

Read:
1. [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md) - What was done
2. [OMI_SUMMARY.md](./OMI_SUMMARY.md) - Omi context

Code to read:
```typescript
// src/lib/omi-webhook.ts (115 lines)
// Key function: verifyOmiWebhookSignature()
// How it works:
// 1. Extract X-Omi-Signature header
// 2. Recompute HMAC-SHA256 of request body
// 3. Compare using timing-safe comparison
// 4. Return boolean result

// src/lib/rate-limit.ts (120 lines)
// Key function: checkOmiWebhookRateLimit()
// How it works:
// 1. Store request counts per user in memory (or Redis)
// 2. Check if user exceeded 100 requests/minute
// 3. Return { allowed: boolean, remaining: number }

// src/lib/errors.ts (148 lines)
// Key classes: AppError and 8 subclasses
// How they work:
// 1. Each error has code + message
// 2. Middleware catches and formats response
// 3. Consistent error format for all endpoints
```

**Step 3: Run & Modify Code (45 min)**

```bash
# 1. Understand the webhook flow
# Read src/app/api/omi/memories/route.ts
# It uses 3 layers: signature → rate limit → validation

# 2. Try the tests
npm test -- src/__tests__/unit/lib/omi-webhook.test.ts

# 3. Understand test patterns
# Open src/__tests__/unit/lib/omi-webhook.test.ts
# See how tests verify:
# - Valid signature accepted
# - Invalid signature rejected
# - Missing header rejected
# - Various error conditions

# 4. Try modifying something
# Change rate limit: src/lib/rate-limit.ts line 18
const MAX_REQUESTS_PER_MINUTE = 1000  // was 100
# Run tests to verify nothing breaks
npm test -- --run

# 5. Revert changes
git checkout src/lib/rate-limit.ts
```

### For Senior Engineers (Code Review)

**What to Review**:

1. **Signature Verification** (`src/lib/omi-webhook.ts`)
   - ✅ Uses timing-safe comparison (prevents timing attacks)
   - ✅ Extracts signature from correct header (`X-Omi-Signature`)
   - ✅ Recomputes HMAC-SHA256 correctly
   - ✅ Handles edge cases (missing header, empty body)

2. **Rate Limiting** (`src/lib/rate-limit.ts`)
   - ✅ In-memory store for development (fast)
   - ✅ Redis support for production (scalable)
   - ✅ Correct window calculation (per-minute)
   - ✅ Thread-safe (uses atomic operations)

3. **Error Handling** (`src/lib/errors.ts`)
   - ✅ 8 error types covering all HTTP status codes
   - ✅ Consistent structure (code + message)
   - ✅ Custom error properties (status, details)
   - ✅ Proper inheritance chain

4. **Validation** (`src/validation/*.ts`)
   - ✅ Zod schemas for all endpoints
   - ✅ Consistent validation patterns
   - ✅ Clear field-level error messages
   - ✅ Type-safe (generates TypeScript types)

5. **Tests** (9 test files, 122 tests)
   - ✅ High coverage of security paths
   - ✅ Edge case testing (missing fields, invalid types)
   - ✅ Integration tests for API endpoints
   - ✅ Mock data fixtures for consistency

**Areas of Note**:
- Global state removed: `/api/omi/route.ts` - no longer needed
- No database schema changes - Phase 1 is additive
- No breaking changes to existing APIs

---

## Architecture Overview

```
Request Flow:
──────────────

POST /api/omi/memories
         ↓
[1] verifyOmiWebhookSignature
    - Check X-Omi-Signature header
    - Compute HMAC-SHA256
    - Timing-safe comparison
    ✓ Valid → continue
    ✗ Invalid → 401 Unauthorized
         ↓
[2] checkOmiWebhookRateLimit
    - Check 100 requests/minute limit
    - Increment counter
    ✓ Within limit → continue
    ✗ Over limit → 429 Too Many Requests
         ↓
[3] OmiMemoryWebhookSchema.safeParse
    - Validate against Zod schema
    - Check required fields
    - Type validation
    ✓ Valid → continue
    ✗ Invalid → 400 Bad Request with details
         ↓
[4] await createMemory(data)
    - Store in database
    - Process with AI (project detection)
    ✓ Success → 201 Created
    ✗ Error → 500 Server Error
```

---

## Key Files Reference

### Security Layer
```
src/lib/omi-webhook.ts
├─ verifyOmiWebhookSignature()      → Verify HMAC signature
├─ requireOmiWebhookSignature()     → Middleware
└─ constants: SIGNATURE_HEADER, ALGORITHM
```

### Rate Limiting
```
src/lib/rate-limit.ts
├─ InMemoryRateLimiter              → Dev implementation
├─ UpstashRedisRateLimiter          → Production implementation
├─ checkOmiWebhookRateLimit()       → Check rate limit
├─ resetOmiWebhookRateLimit()       → Reset (for testing)
└─ constants: MAX_REQUESTS_PER_MINUTE
```

### Validation
```
src/types/omi.ts
├─ OmiMemoryWebhookSchema           → Main webhook schema
├─ OmiStructuredDataSchema          → Nested data
├─ OmiActionItemSchema              → Action item format
├─ OmiGeolocationSchema             → Location data
└─ OmiTranscriptSegmentSchema       → Transcript format
```

### Error Handling
```
src/lib/errors.ts
├─ AppError                         → Base class
├─ ValidationError                  → 400 errors
├─ AuthError                        → 401 errors
├─ UnauthorizedError                → 401 specific
├─ ForbiddenError                   → 403 errors
├─ NotFoundError                    → 404 errors
├─ ConflictError                    → 409 errors
├─ RateLimitError                   → 429 errors
└─ ServerError                      → 500 errors
```

---

## Common Tasks

### Task: Add a New API Endpoint

**Steps**:
1. Create validation schema in `src/validation/`
2. Create route handler in `src/app/api/`
3. Use error classes for responses
4. Add tests in `src/__tests__/integration/api/`
5. Document in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Example**:
```typescript
// src/validation/example.ts
import { z } from 'zod'

export const createExampleSchema = z.object({
  name: z.string().min(1).max(255),
  userId: z.string()
})

// src/app/api/example/route.ts
import { errorResponse, successResponse } from '@/lib/api-response'
import { ValidationError } from '@/lib/errors'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const parsed = createExampleSchema.safeParse(data)
    
    if (!parsed.success) {
      throw new ValidationError(parsed.error.flatten().fieldErrors)
    }
    
    // Business logic here
    const result = await createExample(parsed.data)
    
    return successResponse(result, 201)
  } catch (error) {
    return errorResponse(error)
  }
}
```

### Task: Add a New Test

**Steps**:
1. Create test file in `src/__tests__/`
2. Import test utilities from `src/__tests__/setup.ts`
3. Use mock factories from `src/__tests__/utils/mocks.ts`
4. Run with `npm test -- <test-file>`

**Example**:
```typescript
// src/__tests__/unit/lib/example.test.ts
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/example'

describe('Example Function', () => {
  it('should do something', () => {
    const result = myFunction({ input: 'test' })
    expect(result).toBe('expected output')
  })
})
```

### Task: Deploy to Production

**Steps**:
1. Run tests: `npm test -- --run`
2. Run build: `npm run build`
3. Review changes: `git diff origin/main`
4. Push to main: `git push origin main`
5. Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## Testing Locally

### Setup

```bash
# Install dependencies
npm install

# Create .env.local for local testing
cat > .env.local << EOF
OMI_WEBHOOK_SECRET=test_webhook_secret_for_development
DATABASE_URL=postgresql://user:password@localhost:5432/actionitem
EOF

# Run database migrations
npm run prisma:migrate:dev

# Start server
npm run dev
```

### Run Tests

```bash
# Watch mode (recommended for development)
npm test

# Run all tests once
npm test -- --run

# Run specific test file
npm test -- src/__tests__/unit/lib/omi-webhook.test.ts

# Run with coverage report
npm test -- --coverage

# Run tests matching pattern
npm test -- --grep "rate limit"
```

### Manual Testing

```bash
# Test webhook with valid signature (need to compute it)
# See src/__tests__/unit/lib/omi-webhook.test.ts for example

# Test regular endpoints
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project"}'
```

---

## Questions?

### For Architecture Questions
- Read [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)
- Review diagram in [CODEBASE_REVIEW.md](./CODEBASE_REVIEW.md)

### For Implementation Questions
- See code examples in [OMI_IMPLEMENTATION_PLAN.md](./OMI_IMPLEMENTATION_PLAN.md)
- Check test examples in `src/__tests__/`

### For API Questions
- See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Check test requests in integration tests

### For Troubleshooting
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Check server logs: `npm run dev` (watch for errors)

### For Deployment Issues
- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Check production logs
- Ask tech lead for help

---

## What's Next: Phase 2

After you're familiar with Phase 1, the next improvements are:

1. **Omi API Client** - Sync data back to Omi
2. **Memory Search** - Full-text and semantic search
3. **Batch Operations** - Efficient bulk processing
4. **Retry Logic** - Resilient webhook delivery

See [OMI_IMPLEMENTATION_PLAN.md](./OMI_IMPLEMENTATION_PLAN.md) Phase 2 section for details.

---

## Helpful Commands

```bash
# Development
npm run dev              # Start dev server
npm test                # Run tests in watch mode
npm run build           # Build for production

# Database
npm run prisma:studio   # Prisma visual editor
npm run prisma:generate # Generate types from schema
npm run prisma:migrate:dev  # Create + run migrations

# Code Quality
npm run tsc --noEmit    # Check TypeScript
npm run lint            # Run linter (if configured)
npm run format          # Format code (if configured)

# Production
npm run build           # Build
npm start               # Run production server
```

---

**Created**: 2026-04-19  
**For**: Phase 1 team members  
**Next Update**: After Phase 2 completion

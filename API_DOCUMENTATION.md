# API Documentation - Phase 1

**Version**: 1.0.0  
**Status**: Production-ready with security  
**Last Updated**: 2026-04-19  

---

## Base URL

```
https://yourdomain.com/api
```

## Authentication

### Omi Webhook Endpoints
- **Method**: HMAC-SHA256 signature in header
- **Header**: `X-Omi-Signature`
- **Secret**: Environment variable `OMI_WEBHOOK_SECRET`

### Other Endpoints
- **Method**: Bearer token (to be implemented Phase 2)
- **Header**: `Authorization: Bearer <token>`

---

## Omi Integration Endpoints

### POST /omi/memories
Receive memory from Omi wearable device.

**Request**
```bash
curl -X POST https://yourdomain.com/api/omi/memories \
  -H "Content-Type: application/json" \
  -H "X-Omi-Signature: sha256=<signature>" \
  -d '{
    "id": "mem_abc123",
    "transcript": "User's spoken text...",
    "structured": {
      "title": "Meeting with team",
      "action_items": [
        {
          "description": "Review PR #123",
          "completed": false
        }
      ]
    },
    "geolocation": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "place_name": "San Francisco"
    },
    "created_at": "2026-04-18T14:30:00Z"
  }'
```

**Headers Required**
```
Content-Type: application/json
X-Omi-Signature: sha256=<hmac_signature>
```

**Request Body Schema**
```typescript
{
  id: string                           // Unique memory ID from Omi
  transcript: string                   // Full transcription of memory
  structured?: {
    title?: string                     // Auto-detected title
    summary?: string                   // Summary of memory
    action_items?: Array<{
      description: string              // Action item text
      completed: boolean               // Status
    }>
    emotion?: string                   // Detected emotion
  }
  geolocation?: {
    latitude: number
    longitude: number
    place_name?: string
  }
  created_at: string                   // ISO 8601 timestamp
}
```

**Success Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "mem_abc123",
    "userId": "user_123",
    "transcript": "User's spoken text...",
    "projectId": null,
    "createdAt": "2026-04-18T14:30:00Z"
  }
}
```

**Error Responses**

**401 Unauthorized** (Invalid signature)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid webhook signature"
  }
}
```

**429 Too Many Requests** (Rate limited)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Max 100 per minute."
  }
}
```

**400 Bad Request** (Invalid format)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid webhook format",
    "details": {
      "transcript": "Required field missing"
    }
  }
}
```

**500 Server Error** (Database issue)
```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Failed to store memory"
  }
}
```

---

## Core API Endpoints (With Validation)

### POST /projects
Create a new project.

**Request**
```bash
curl -X POST https://yourdomain.com/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Integration",
    "description": "Integrate Claude API",
    "userId": "user_123"
  }'
```

**Request Body**
```typescript
{
  name: string           // 1-255 characters
  description?: string   // Optional project description
  userId: string        // User ID from auth
}
```

**Success Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "proj_123",
    "name": "AI Integration",
    "userId": "user_123",
    "createdAt": "2026-04-19T10:00:00Z"
  }
}
```

**Error Response (400)**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project data",
    "details": {
      "name": "Name is required"
    }
  }
}
```

---

### GET /projects
List user's projects.

**Request**
```bash
curl https://yourdomain.com/api/projects?userId=user_123
```

**Query Parameters**
```
userId: string         // User ID (required)
limit?: number        // Page size (default: 10, max: 100)
offset?: number       // Pagination offset (default: 0)
```

**Success Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_123",
      "name": "AI Integration",
      "userId": "user_123",
      "createdAt": "2026-04-19T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### POST /memories
Create a memory manually.

**Request**
```bash
curl -X POST https://yourdomain.com/api/memories \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Met with Sarah about Q2 planning",
    "userId": "user_123",
    "projectId": "proj_123"
  }'
```

**Request Body**
```typescript
{
  transcript: string     // Memory text (required, 1-10000 chars)
  userId: string        // User ID (required)
  projectId?: string    // Optional project association
  structured?: {
    title?: string
    action_items?: Array<{ description: string; completed: boolean }>
  }
}
```

**Success Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "mem_456",
    "userId": "user_123",
    "projectId": "proj_123",
    "transcript": "Met with Sarah about Q2 planning",
    "createdAt": "2026-04-19T10:00:00Z"
  }
}
```

---

### GET /memories
List user's memories.

**Request**
```bash
curl 'https://yourdomain.com/api/memories?userId=user_123&projectId=proj_123'
```

**Query Parameters**
```
userId: string         // User ID (required)
projectId?: string    // Filter by project
limit?: number        // Page size (default: 20, max: 100)
offset?: number       // Pagination offset
sortBy?: string       // 'created_at' or 'updated_at' (default: 'created_at')
sortOrder?: string    // 'asc' or 'desc' (default: 'desc')
```

**Success Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "mem_456",
      "transcript": "Met with Sarah...",
      "projectId": "proj_123",
      "createdAt": "2026-04-19T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 342,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### POST /conversations
Start a conversation about memories.

**Request**
```bash
curl -X POST https://yourdomain.com/api/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "memoryIds": ["mem_456", "mem_789"],
    "topic": "Q2 Planning"
  }'
```

**Request Body**
```typescript
{
  userId: string        // User ID (required)
  memoryIds: string[]   // Memory IDs to discuss (required, 1-50)
  topic?: string       // Conversation topic
}
```

**Success Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "conv_123",
    "userId": "user_123",
    "topic": "Q2 Planning",
    "memoryIds": ["mem_456", "mem_789"],
    "createdAt": "2026-04-19T10:00:00Z"
  }
}
```

---

### POST /users
Create a user.

**Request**
```bash
curl -X POST https://yourdomain.com/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

**Request Body**
```typescript
{
  email: string         // Valid email (required)
  name?: string        // User's name
  walletAddress?: string // Optional Web3 wallet
}
```

**Success Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-04-19T10:00:00Z"
  }
}
```

---

## Error Codes

| Code | Status | Meaning | Action |
|------|--------|---------|--------|
| `VALIDATION_ERROR` | 400 | Invalid input | Fix request body |
| `UNAUTHORIZED` | 401 | Missing/invalid auth | Add signature or token |
| `FORBIDDEN` | 403 | Insufficient permissions | Check user permissions |
| `NOT_FOUND` | 404 | Resource doesn't exist | Verify ID |
| `CONFLICT` | 409 | Resource already exists | Use different ID |
| `RATE_LIMITED` | 429 | Too many requests | Wait 60 seconds |
| `SERVER_ERROR` | 500 | Server issue | Retry later, contact support |

---

## Rate Limiting

**Per User Per Minute**: 100 requests  
**Per User Per Day**: 10,000 requests  
**Global**: Unlimited

**Headers Returned**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1713607260
```

**When Rate Limited**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Retry after 60 seconds."
  }
}
```

---

## Webhook Signature Verification

### How to Verify

1. Get webhook body as raw bytes (before JSON parsing)
2. Get `X-Omi-Signature` header
3. Compute: `HMAC-SHA256(webhook_body, OMI_WEBHOOK_SECRET)`
4. Compare with signature using timing-safe comparison

### Example (TypeScript)

```typescript
import crypto from 'crypto'

function verifyOmiWebhook(
  body: Buffer,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
}
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fieldName": "Field-specific error message"
    }
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "total": 342,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Testing Endpoints

### Test Webhook Signature Verification

```bash
# Should fail (no signature)
curl -X POST https://yourdomain.com/api/omi/memories \
  -H "Content-Type: application/json" \
  -d '{"transcript": "test"}'
# Response: 401 Unauthorized

# Should succeed (with valid signature)
# Requires computing correct HMAC signature
```

### Test Rate Limiting

```bash
# Send 101 requests quickly (simplified)
for i in {1..101}; do
  curl -X POST https://yourdomain.com/api/projects \
    -H "Content-Type: application/json" \
    -d '{"name": "Project '$i'"}'
done

# Request 101 should return: 429 Too Many Requests
```

---

## Changelog

### Version 1.0.0 (2026-04-19)
- ✅ Webhook signature verification
- ✅ Rate limiting (100 req/min)
- ✅ Input validation (Zod schemas)
- ✅ Standardized error responses
- ✅ Documentation

### Planned for Phase 2
- Omi API client integration
- Memory search endpoint
- Batch operations
- Sync back to Omi

---

## Support

For API issues:
1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review error message and code
3. Check rate limit headers
4. Verify signature format for webhooks
5. Contact support with request ID

---

**Last Updated**: 2026-04-19  
**Next Review**: After Phase 2 completion

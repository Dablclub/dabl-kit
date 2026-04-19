# Action Item - Refactoring Roadmap

## Executive Summary

This document outlines a phased approach to refactoring the Action Item codebase. The project has solid foundations but needs stabilization and optimization before scaling.

**Current State**: Functional MVP with technical debt
**Target State**: Production-ready, maintainable, scalable architecture
**Estimated Timeline**: 6-8 weeks (phased approach)

---

## Phase 1: Stabilization (Weeks 1-2) - CRITICAL

### Goal
Fix production blockers and establish testing infrastructure.

### Tasks

#### 1.1: Remove Global State from API Routes
**File**: `src/app/api/omi/route.ts`
**Severity**: 🔴 CRITICAL
**Effort**: 1-2 days

**Current Problem**:
```typescript
let content = '' // ❌ Global state
let in_note = false

export async function POST(request: Request) {
  // Race conditions in serverless environment
}
```

**Solution**:
- Move state to request body or create session in database
- Create `NoteSession` model in Prisma
- Store transcription state in database instead of memory

**Changes**:
```
models/
  ├── NoteSession (new)
    ├── id: String @id
    ├── content: String
    ├── isActive: Boolean
    ├── createdAt: DateTime
    └── updatedAt: DateTime

route.ts
  ├── Fetch or create NoteSession
  ├── Update session state in database
  └── Clear session when note finished
```

**Testing**: Add concurrency tests to verify thread safety

---

#### 1.2: Add Input Validation Layer
**Files**: All API routes in `src/app/api`
**Severity**: 🔴 CRITICAL
**Effort**: 3-4 days

**Current Problem**:
```typescript
export async function POST(request: Request) {
  const data = await request.json() // ❌ No validation
  await prisma.project.create({ data })
}
```

**Solution**:
- Add Zod schemas for all inputs
- Create validation middleware
- Return 400 with detailed error messages

**Implementation**:
```
src/validation/
  ├── projects.ts (Zod schemas)
  ├── users.ts
  ├── memories.ts
  └── middleware.ts (validation wrapper)

src/lib/
  └── validateRequest.ts (helper function)
```

**Example**:
```typescript
import { z } from 'zod'

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  adminId: z.string().uuid(),
})

export async function POST(request: Request) {
  const body = await validateRequest(request, CreateProjectSchema)
  if (!body.success) return errorResponse(body.errors, 400)
  
  const project = await prisma.project.create({ data: body.data })
  return successResponse(project)
}
```

**Testing**: Unit tests for each schema

---

#### 1.3: Implement Error Handling Standard
**Files**: All API routes, controllers, services
**Severity**: 🟡 HIGH
**Effort**: 2-3 days

**Current Problem**:
```typescript
catch (error) {
  console.error('Error:', error)
  throw new Error('Failed to create project') // ❌ Generic error
}
```

**Solution**:
- Create error class hierarchy
- Implement error middleware
- Structured logging

**Structure**:
```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
  ) {
    super(message)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super(401, 'Unauthorized', 'UNAUTHORIZED')
  }
}
```

**Middleware Usage**:
```typescript
export async function POST(request: Request) {
  try {
    const data = await request.json()
    if (!data.name) throw new ValidationError('Name is required')
    const project = await prisma.project.create({ data })
    return successResponse(project)
  } catch (error) {
    return handleError(error) // Converts to proper response
  }
}
```

---

#### 1.4: Add Testing Infrastructure
**Severity**: 🟡 HIGH
**Effort**: 2-3 days

**Setup**:
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

**Structure**:
```
__tests__/
├── unit/
│   ├── controllers/
│   ├── services/
│   └── utils/
├── integration/
│   ├── api/projects.test.ts
│   └── api/omi.test.ts
└── setup.ts
```

**Example Test**:
```typescript
// __tests__/integration/api/omi.test.ts
import { POST } from '@/app/api/omi/route'

describe('POST /api/omi', () => {
  it('should create conversation when "finish" command received', async () => {
    const request = createMockRequest({
      segments: [
        { text: 'start', speaker: 'SPEAKER_01' },
        { text: 'hello world', speaker: 'USER' },
        { text: 'finish', speaker: 'USER' },
      ],
    })
    
    const response = await POST(request)
    expect(response.status).toBe(200)
  })

  it('should handle concurrent requests safely', async () => {
    const promises = Array(10).fill(null).map(() => POST(mockRequest))
    const responses = await Promise.all(promises)
    expect(responses).toHaveLength(10)
  })
})
```

**Configuration**:
```typescript
// vitest.config.ts
import { getVitestConfig } from 'next/dist/build/swc'

export default getVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

---

### Checklist for Phase 1
- [ ] NoteSession model added to Prisma
- [ ] Global state removed from omi/route.ts
- [ ] Zod schemas created for all API inputs
- [ ] Validation middleware implemented
- [ ] Error class hierarchy created
- [ ] Error handling middleware added to all routes
- [ ] Testing infrastructure set up
- [ ] At least 10 integration tests written
- [ ] All critical paths have error handling
- [ ] Documentation updated

---

## Phase 2: Optimization (Weeks 3-4)

### Goal
Improve performance and reduce unnecessary complexity.

### Tasks

#### 2.1: Simplify Prisma Schema
**Severity**: 🟡 MEDIUM
**Effort**: 3-4 days

**Current Issues**:
- 20+ models with complex relationships
- E-HRBAC-T system incomplete/unclear
- Unclear which relations are actively used

**Audit Process**:
1. Search codebase for model usage
2. Identify unused models
3. Consolidate similar models
4. Add strategic indexes

**Recommendations**:
```
Models to REMOVE (if unused):
- ProofOfCommunity (seems unused)
- Token (duplicated in Project and Community)
- Some UserRole variants

Models to REFACTOR:
- Merge UserCommunity and UserRole concepts
- Simplify RolePermission structure
- Create focused "Admin", "Moderator" models instead of generic Role

Models to KEEP:
- User, Profile, Project, Community
- Memory, Conversation, ConversationParticipant
- Post, Comment, Vote
- Quest, Badge, Reward
```

**Index Strategy**:
```prisma
model User {
  id String @id
  username String @unique
  email String? @unique
  appWallet String? @unique
  
  // Add indexes for common queries
  @@index([email])
  @@index([username])
}

model Project {
  id String @id
  adminId String
  communityId String?
  createdAt DateTime
  
  // Add indexes for pagination/filtering
  @@index([adminId])
  @@index([communityId])
  @@index([createdAt])
}
```

---

#### 2.2: Add Response DTOs & Pagination Helper
**Severity**: 🟡 MEDIUM
**Effort**: 2-3 days

**Problem**: API responses include all fields (data leakage risk)

**Solution**:
```typescript
// src/lib/dtos.ts
export function toProjectDTO(project: Project) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    stage: project.stage,
    admin: {
      id: project.admin.id,
      username: project.admin.username,
      displayName: project.admin.displayName,
    },
    // Exclude: wallet, email, contractAddresses, etc.
  }
}

// src/lib/pagination.ts
export async function paginate<T>(
  model: any,
  params: { take: number; skip: number; cursor?: string },
  where?: any,
) {
  const items = await model.findMany({
    where,
    take: params.take,
    skip: params.skip,
    cursor: params.cursor ? { id: params.cursor } : undefined,
  })
  
  const total = await model.count({ where })
  
  return {
    items: items.map(toDTO),
    metadata: {
      total,
      hasMore: params.skip + params.take < total,
      nextCursor: items[items.length - 1]?.id,
    },
  }
}
```

**Usage**:
```typescript
const { items, metadata } = await paginate(
  prisma.project,
  { take: 10, skip: 0 },
  { admin: { id: userId } },
)

return NextResponse.json({
  projects: items,
  metadata,
})
```

---

#### 2.3: Extract Common API Patterns
**Severity**: 🟡 MEDIUM
**Effort**: 2-3 days

**Problem**: Repetitive boilerplate in every route

**Solution**:
```typescript
// src/lib/api-handler.ts
export async function createApiHandler<T, R>(
  request: Request,
  {
    validateSchema,
    authorize,
    execute,
  }: {
    validateSchema?: z.ZodSchema
    authorize?: (user: User) => boolean
    execute: (data: T) => Promise<R>
  },
): Promise<NextResponse<R | ErrorResponse>> {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    
    if (authorize && !authorize(user)) return forbidden()
    
    let data = await request.json()
    if (validateSchema) {
      const validation = validateSchema.safeParse(data)
      if (!validation.success) return validationError(validation.error)
      data = validation.data
    }
    
    const result = await execute(data)
    return success(result)
  } catch (error) {
    return handleError(error)
  }
}

// Usage:
export async function POST(request: Request) {
  return createApiHandler(request, {
    validateSchema: CreateProjectSchema,
    authorize: (user) => !!user.id,
    execute: (data) => prisma.project.create({ data }),
  })
}
```

---

#### 2.4: Implement Frontend API Client Factory
**Severity**: 🟡 MEDIUM
**Effort**: 2 days

**Problem**: Repeated auth headers and error handling in services

**Solution**:
```typescript
// src/lib/api-client.ts
export function createApiClient(authToken?: string) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  }

  return {
    async get<T>(path: string, params?: Record<string, any>): Promise<T> {
      const url = new URL(path, window.location.origin)
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, String(value))
        })
      }
      
      const response = await fetch(url, { headers: defaultHeaders })
      return handleResponse<T>(response)
    },

    async post<T>(path: string, body: any): Promise<T> {
      const response = await fetch(path, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(body),
      })
      return handleResponse<T>(response)
    },
    
    // ... patch, delete, etc.
  }
}

// Usage:
// src/services/projects-services.tsx
const api = createApiClient(authToken)
export const getProjects = (params) => api.get('/api/projects', params)
```

---

### Checklist for Phase 2
- [ ] Prisma schema audited and simplified
- [ ] Response DTOs created for all models
- [ ] Pagination helper function implemented
- [ ] API handler abstraction created
- [ ] All routes refactored to use handler
- [ ] Frontend API client factory created
- [ ] All services refactored to use client
- [ ] Database indexes added
- [ ] Performance metrics collected (before/after)
- [ ] Documentation updated

---

## Phase 3: Modernization (Weeks 5-6)

### Goal
Improve code organization, testability, and developer experience.

### Tasks

#### 3.1: Implement Service Layer
**Severity**: 🟡 MEDIUM
**Effort**: 3 days

**Problem**: Business logic mixed in controllers

**Solution**:
```
src/services/
├── ProjectService.ts
├── UserService.ts
├── MemoryService.ts
└── ConversationService.ts
```

**Example**:
```typescript
// src/services/ProjectService.ts
export class ProjectService {
  async getProjects(
    userId: string,
    params: GetProjectsParams,
  ) {
    // Authorization
    if (!isAdminOrOwner(userId)) {
      throw new UnauthorizedError()
    }

    // Pagination
    return paginate(prisma.project, params, {
      adminId: userId,
    })
  }

  async createProject(userId: string, data: CreateProjectInput) {
    // Validation (already done by schema)
    
    // Business logic
    const project = await prisma.project.create({
      data: {
        ...data,
        adminId: userId,
      },
    })

    // Side effects
    await this.notifyAdmins(project)
    
    return toProjectDTO(project)
  }
}

// Usage in API route:
const projectService = new ProjectService()
export async function POST(request: Request) {
  const user = await getAuthUser(request)
  const data = await validateRequest(request, CreateProjectSchema)
  
  const project = await projectService.createProject(user.id, data)
  return success(project)
}
```

---

#### 3.2: Add Dependency Injection
**Severity**: 🟠 MEDIUM
**Effort**: 2-3 days

**Problem**: Tight coupling to Prisma

**Solution**:
```typescript
// src/lib/di-container.ts
export class Container {
  private services = new Map<string, any>()

  register<T>(name: string, factory: () => T) {
    this.services.set(name, factory())
  }

  get<T>(name: string): T {
    const service = this.services.get(name)
    if (!service) throw new Error(`Service ${name} not registered`)
    return service
  }
}

export const container = new Container()

// Initialize in app startup:
container.register('prisma', () => prisma)
container.register('projectService', () => new ProjectService())

// Usage:
const projectService = container.get<ProjectService>('projectService')
```

---

#### 3.3: Add Comprehensive Documentation
**Severity**: 🟡 MEDIUM
**Effort**: 3-4 days

**Create**:
- API documentation (OpenAPI/Swagger)
- Architecture decision records (ADRs)
- Deployment guide
- Contributing guide
- Database schema diagram

**Example ADR**:
```markdown
# ADR-001: Global State Removal

## Context
omi/route.ts had module-level state (`let content`, `let in_note`)
causing race conditions in serverless environment.

## Decision
Move state to database with NoteSession model.

## Consequences
- ✅ Thread-safe, scalable
- ✅ Persistent across requests
- ✅ Testable
- ❌ Slight latency increase (database query)
- ❌ More complex recovery logic
```

---

### Checklist for Phase 3
- [ ] Service layer created for all domains
- [ ] Dependency injection configured
- [ ] Controllers refactored to use services
- [ ] API documentation generated
- [ ] ADRs written for major decisions
- [ ] Deployment guide created
- [ ] Contributing guide updated
- [ ] Setup guide tested with fresh clone
- [ ] Onboarding checklist created
- [ ] Team training completed

---

## Phase 4: Enhancement (Weeks 7-8)

### Goal
Add missing features and polish.

### Tasks

#### 4.1: Implement Logging & Monitoring
- [ ] Add structured logging (winston, pino)
- [ ] Add error tracking (Sentry)
- [ ] Add APM (performance monitoring)
- [ ] Create dashboards

#### 4.2: Add Rate Limiting & Security
- [ ] Implement rate limiting middleware
- [ ] Add CORS configuration
- [ ] Add input sanitization
- [ ] Security headers

#### 4.3: Optimize Frontend
- [ ] Code splitting for pages
- [ ] Image optimization
- [ ] Bundle analysis
- [ ] Performance budget

#### 4.4: Improve Test Coverage
- [ ] Aim for 80%+ coverage
- [ ] Add E2E tests
- [ ] Load testing
- [ ] Security testing

---

## Success Metrics

### Code Quality
- [ ] 0 critical vulnerabilities
- [ ] TypeScript strict mode enabled
- [ ] ESLint passing (all rules)
- [ ] Prettier formatting
- [ ] Test coverage > 70%

### Performance
- [ ] API response time < 200ms (p95)
- [ ] Page load time < 3s
- [ ] Lighthouse score > 80
- [ ] Database query optimization (no N+1)

### Developer Experience
- [ ] Fresh clone to dev server in < 5 min
- [ ] Clear code organization
- [ ] Comprehensive documentation
- [ ] Easy to add new features

### Production Readiness
- [ ] All critical flows tested
- [ ] Error handling complete
- [ ] Monitoring/alerting in place
- [ ] Deployment automated

---

## Dependencies to Add

```json
{
  "devDependencies": {
    "vitest": "^latest",
    "@vitest/ui": "^latest",
    "@testing-library/react": "^latest",
    "msw": "^latest"
  },
  "dependencies": {
    "zod": "^3.24.2",
    "pino": "^latest",
    "pino-pretty": "^13.0.0",
    "sentry": "^latest"
  }
}
```

---

## Notes

- This is a living document - update as priorities change
- Each phase builds on previous ones
- Can do phases in parallel with different team members
- Estimated 2-person-weeks of effort
- Review with team before starting Phase 2


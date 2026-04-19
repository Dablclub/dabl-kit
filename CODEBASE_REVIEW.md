# Action Item - Codebase Review & Refactoring Plan

## Project Overview
**Action Item** is a voice-to-action productivity app that captures conversations through an Omi wearable device, transcribes them, generates action items via Claude AI, and integrates with GitHub for project management.

**Tech Stack:**
- Frontend: Next.js 14.2.17, React 18, TypeScript, Tailwind CSS, Framer Motion
- Backend: Node.js, Next.js API Routes
- Database: PostgreSQL with Prisma ORM
- AI: Claude API (@anthropic-ai/sdk), OpenAI
- Web3: wagmi, viem, Dynamic Labs (Ethereum integration)
- UI: Radix UI, shadcn/ui
- Additional: Pinecone (vector DB), Deepgram (transcription)

**Codebase Statistics:**
- ~91 TypeScript/TSX files
- ~1,165 lines in server controllers
- ~250+ line Prisma schema with 20+ models
- 14 API routes

---

## Architecture Overview

### Directory Structure
```
src/
├── app/              # Next.js app router
│   ├── api/         # API routes (13 endpoints)
│   │   ├── omi/     # Omi device webhook integration
│   │   ├── memories/ # Memory CRUD operations
│   │   ├── projects/ # Project management
│   │   ├── profiles/ # User profiles
│   │   ├── users/   # User management
│   │   ├── auth/    # Authentication
│   │   └── conversations/ # Conversation handling
│   ├── projects/    # Projects pages
│   ├── memories/    # Memories pages
│   ├── quests/      # Quests/challenges
│   ├── leaderboard/ # Leaderboard view
│   └── account/     # Account settings
├── components/      # React components
├── server/          # Backend logic
│   ├── controllers/ # Business logic (6 controllers, 1.1K lines)
│   └── prismaClient.ts
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── styles/          # Global styles
└── providers/       # Context providers

prisma/
├── schema.prisma    # Database schema (250+ lines)
└── seed.ts         # Database seeding
```

---

## Key Findings & Issues

### 🔴 Critical Issues

#### 1. **Global State in API Routes** (`src/app/api/omi/route.ts`)
```typescript
// ❌ PROBLEMATIC
let content = ''
let in_note = false

export async function POST(request: Request) {
  // Uses global state - not thread-safe, breaks with serverless
  for (const segment of response.segments) {
    if (lowerText.includes('start') && !in_note) {
      in_note = true
      content = ''
    }
    // ...
  }
}
```
**Issues:**
- Module-level state in serverless environment causes race conditions
- Not scalable across multiple instances
- Testing becomes difficult

---

#### 2. **Complex Prisma Schema with Tight Coupling**
**Schema has 20+ models with interconnected relationships:**
- User → Profile, ProofOfCommunity, UserCommunity, Project, Memory, UserRole, etc.
- Project → Admin, Community, Token, Quests, Badges, Role
- 8+ junction tables (UserCommunity, UserRole, RolePermission, etc.)
- E-HRBAC-T (Entity-based Hierarchical RBAC with Tokens) partially implemented

**Problems:**
- Over-engineered for current feature set
- Difficult to maintain and extend
- N+1 query risks in API routes
- Unclear which fields are actually used

---

#### 3. **Inconsistent Error Handling**
```typescript
// ❌ Example from conversations controller
export async function createConversation(data) {
  try {
    const conversation = await prisma.conversation.create({ data })
    return conversation
  } catch (error) {
    console.error('Error in createConversation:', error)
    throw new Error('Failed to create conversation') // Generic error
  }
}
```
**Issues:**
- Generic error messages hide actual problems
- No error differentiation (validation vs. DB vs. auth)
- Inconsistent logging across codebase

---

#### 4. **Weak Input Validation & Type Safety**
```typescript
// ❌ No validation at API boundary
export async function POST(request: Request) {
  const data = await request.json() // Could be anything
  const project = await prisma.project.create({ data })
  // No schema validation, no type checking
}
```

---

#### 5. **N+1 Query Patterns**
```typescript
// ❌ Multiple overlapping includes
const projects = await prisma.project.findMany({
  include: {
    admin: { select: { ... } },
    community: true,           // Includes all community fields
    quests: true,             // Includes all quest fields
    badges: true,
    token: true,
  },
})
```

---

### 🟡 Moderate Issues

#### 1. **Magic Strings for State Management**
```typescript
// ❌ In omi/route.ts
if (lowerText.includes('start') && !in_note) {
  // No validation, no configuration
}
if (lowerText.includes('finish') && in_note) {
```
Should use enums/constants:
```typescript
enum NoteCommand {
  START = 'start',
  FINISH = 'finish',
}
```

---

#### 2. **Missing Request Validation Layer**
- No input validation at API boundaries
- No rate limiting
- No authentication/authorization checks visible
- Controllers assume valid data

---

#### 3. **Incomplete Database Seeding**
- `prisma/seed.ts` exists but unclear what it does
- No documented database initialization flow

---

#### 4. **API Route Organization**
- Routes handle both GET/POST in same file
- No middleware pattern
- No consistent response format

---

#### 5. **Type Definitions**
- `src/types/` directory exists but unclear coverage
- Potential for untyped imports/exports
- No strict TypeScript configuration visible

---

### 🟢 Strengths

1. **Modern Stack**: Uses latest Next.js, React, TypeScript
2. **Component-Based**: Clear separation between pages and components
3. **Database**: Prisma provides type safety for DB operations
4. **Authentication**: Dynamic Labs integration for Web3 auth
5. **Styling**: Tailwind + shadcn/ui for consistent UI
6. **Development**: Next.js provides good DX

---

## Refactoring Priorities

### Phase 1: Stabilization (Foundation)
**Goal:** Make code production-ready

1. **Remove Global State from API Routes**
   - Move `content` and `in_note` to request context or database
   - Use request-scoped state management
   - Add tests for concurrent requests

2. **Implement Input Validation**
   - Add Zod schemas for all API inputs
   - Create validation middleware
   - Document expected request/response formats

3. **Standardize Error Handling**
   - Create error class hierarchy (ValidationError, AuthError, NotFoundError, etc.)
   - Implement error middleware
   - Add structured logging

4. **Add Authentication Checks**
   - Verify auth middleware exists and is applied
   - Add role-based access control checks
   - Document auth requirements per endpoint

---

### Phase 2: Optimization (Performance & Maintainability)
**Goal:** Improve performance and reduce tech debt

1. **Simplify Prisma Schema**
   - Audit which relations are actually used
   - Remove unused models/fields
   - Create focused queries for each use case
   - Add database indexes

2. **Implement API Response DTOs**
   - Standardize response structure
   - Prevent data leakage
   - Create response transformers

3. **Extract Common Patterns**
   - Create utility functions for pagination
   - Build helpers for common queries
   - Implement request/response middleware

4. **Add Comprehensive Testing**
   - Unit tests for controllers
   - Integration tests for API routes
   - E2E tests for critical flows

---

### Phase 3: Modernization (Architecture)
**Goal:** Improve code organization and scalability

1. **Refactor API Routes to Use Handlers**
   - Create typed handler pattern
   - Separate concerns (validation, auth, logic, response)
   - Enable middleware chaining

2. **Implement Service Layer**
   - Move business logic from controllers to services
   - Make controllers thin (request → service → response)
   - Improve testability

3. **Add Dependency Injection**
   - Remove tight coupling
   - Make code more testable
   - Enable environment-specific configurations

4. **Documentation**
   - API documentation (OpenAPI/Swagger)
   - Architecture decision records (ADRs)
   - Setup and deployment guides

---

## Technical Debt Summary

| Item | Severity | Effort | Impact |
|------|----------|--------|--------|
| Global state in API routes | 🔴 HIGH | Medium | Data corruption, race conditions |
| Input validation missing | 🔴 HIGH | Medium | Security, stability |
| Error handling inconsistent | 🟡 MEDIUM | Low | Debugging difficulty |
| Schema over-engineered | 🟡 MEDIUM | High | Maintenance burden |
| N+1 query patterns | 🟡 MEDIUM | Medium | Performance degradation |
| No API documentation | 🟡 MEDIUM | Medium | Integration difficulties |
| Missing tests | 🟠 MEDIUM | High | Regression risk |
| No rate limiting | 🟡 MEDIUM | Low | Abuse potential |

---

## Recommended Next Steps

1. **Start with Phase 1** - Remove critical blockers
2. **Add tests** - Ensure changes don't break existing functionality
3. **Document as you go** - Update API docs, add architecture notes
4. **Incremental refactoring** - Small, reviewable PRs
5. **Monitor performance** - Track metrics before/after changes

---

---

## Frontend Architecture Analysis

### Data Layer: Services + React Query Pattern
**Structure:**
- `src/services/` - API client layer (5 services: projects, users, memories, profiles, auth)
- `src/hooks/` - React Query hooks that wrap services
- Pages use hooks for data fetching and mutations

**Implementation Example:**
```typescript
// Service (projects-services.tsx)
export async function getProjects(params, authToken) {
  const response = await fetch(`/api/projects?${params}`)
  return response.json()
}

// Hook (hooks/projects.tsx)
export function useProjects(params) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjects(params, authToken),
  })
}

// Page (app/projects/page.tsx)
const { data: projects, isLoading } = useProjects({ take: 10, skip: 0 })
```

**Strengths:**
- Good separation between API calls and React logic
- React Query handles caching and synchronization
- Services layer enables reusability

**Issues:**
1. **Boilerplate-heavy**: 3 layers for simple GET request
2. **Inconsistent error handling**: Services catch but re-throw generic errors
3. **Type safety gaps**: Uses `Prisma.Project` directly, no DTOs for API responses
4. **Auth token repeated**: Every service call manually includes auth header
5. **No API request validation**: Services trust server responses

### Frontend Architecture Opportunities

#### 1. **API Client Factory Pattern**
Instead of repeated fetch + auth headers in every service:
```typescript
// Create reusable API client
const api = createApiClient(authToken)
export const getProjects = (params) => api.get('/projects', params)
```

#### 2. **Type-Safe API Responses**
Use Zod for runtime validation:
```typescript
const ProjectSchema = z.object({ id: z.string(), name: z.string() })
const projects = await response.json().then(ProjectSchema.array().parse)
```

#### 3. **Centralized Error Handling**
```typescript
// Create error boundary + toast notifications
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true,
    },
  },
})

const errorHandler = (error) => {
  if (error.status === 401) toast.error('Please log in')
  if (error.status === 404) toast.error('Not found')
  // ...
}
```

### Component & Page Analysis

**Current Structure:**
- Pages are 'use client' components
- Mix of SSR and client-side data fetching
- Use shadcn/ui + Tailwind CSS
- Framer Motion for animations

**Issues Found:**
1. **Pages contain business logic**: Projects page has conditional rendering, filtering logic
2. **Large page components**: `projects/page.tsx` is 7.5KB
3. **No component library structure**: Every component is standalone
4. **Limited reusability**: Similar patterns repeated across pages

**Example - Projects Page Issues:**
```typescript
// ❌ Logic in page component
const getResourceLink = (project: Project) => {
  if (project.productionUrl) return <a>Production</a>
  if (project.videoUrl) return <a>Video</a>
  // Repeated conditionals
}

// Should be extracted to component
<ProjectResourceLink project={project} />
```

---

## Suggested Frontend Refactoring

### Priority 1: Extract Reusable Patterns
1. **API Client Factory** - Remove fetch boilerplate
2. **Error Boundary** - Centralize error handling
3. **Component Library** - Extract repeated UI patterns
4. **Custom Hooks** - Abstract common data fetching patterns

### Priority 2: Improve Type Safety
1. **API Response DTOs** - Validate against runtime schemas (Zod)
2. **Service Type Exports** - Explicit return types
3. **Component Props** - Strict TypeScript for all components

### Priority 3: Optimize Performance
1. **Code Splitting** - Lazy load heavy components
2. **Image Optimization** - Use Next.js Image component
3. **React Query Optimization** - Stale time, cache time config
4. **Bundle Analysis** - Identify and reduce large dependencies

### Priority 4: Improve Developer Experience
1. **Generator Script** - Scaffold new features (page + hooks + services)
2. **Component Stories** - Document with Storybook
3. **API Mocking** - MSW for local development
4. **Form Library** - Consolidate form handling (react-hook-form setup)

---

## Stack Overview & Dependencies

### Large Dependencies (Consider Impact)
- `@anthropic-ai/sdk` - Claude integration (essential)
- `wagmi` + `viem` + `@dynamic-labs` - Web3 integration (40+ KB combined)
- `@tanstack/react-query` - Data fetching (35+ KB, essential)
- `framer-motion` - Animations (30+ KB, could optimize)
- Radix UI components - Many small packages (consider precompiling)

### Missing Dependencies
- ❌ `zod` - Input validation (should add)
- ❌ Testing library (should add)
- ❌ Logging library (should add)
- ✅ `sonner` - Toast notifications (good)
- ✅ `next-themes` - Dark mode (good)

---

## Deployment & Infrastructure Observations

**From package.json:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
  }
}
```

**Likely Deployment:** Vercel (Next.js native), could also be self-hosted

**Environment Variables Required** (inferred from code):
- `DATABASE_URL` - PostgreSQL connection
- `ANTHROPIC_API_KEY` - Claude AI
- `DYNAMIC_API_KEY` - Web3 auth
- Auth tokens from various services

---

## Questions for Team

1. **Deployment**: What is the current deployment model? (Vercel, self-hosted, etc.)
2. **Scale**: What user load are we expecting? (affects caching strategy, database indexing)
3. **Database**: Which database relations are actively used? (can we simplify schema?)
4. **Auth**: What authentication/authorization model is desired? (currently unclear)
5. **Performance**: Are there specific performance targets? (page load, API response times)
6. **Timeline**: What's the timeline for this refactoring? (phased vs. big bang)
7. **Features**: Are all Prisma models actively used? (E-HRBAC-T system incomplete?)
8. **Testing**: What testing infrastructure exists? (none visible in package.json)
9. **Monitoring**: Is there observability/logging in place? (no logging library visible)
10. **Agents**: How are the 3 agents (Builder, Growth, Fundraiser) implemented? (not yet reviewed)

# Action Item - Architecture Guide

## Quick Reference

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Next.js Pages + Components (React 18, Tailwind CSS)     ││
│  │ - /projects, /memories, /quests, /account, /leaderboard││
│  └──────────────────────────┬──────────────────────────────┘│
└─────────────────────────────┼──────────────────────────────┘
                              │
                    React Query (TanStack)
                              │
┌─────────────────────────────┼──────────────────────────────┐
│                       Service Layer                         │
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │ Fetch-based Services with Auth Headers                 ││
│  │ - /src/services/projects-services.tsx                  ││
│  │ - /src/services/memories-services.tsx                  ││
│  │ - /src/services/users.tsx                              ││
│  └──────────────────────────┬──────────────────────────────┘│
└─────────────────────────────┼──────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ POST   /api/omi            - Voice webhook from Omi     ││
│  │ GET    /api/projects       - List projects             ││
│  │ POST   /api/projects       - Create project            ││
│  │ GET    /api/projects/[id]  - Get project              ││
│  │ PATCH  /api/projects/[id]  - Update project           ││
│  │ DELETE /api/projects/[id]  - Delete project           ││
│  │ GET    /api/memories       - List memories            ││
│  │ POST   /api/memories       - Create memory            ││
│  │ GET    /api/conversations  - List conversations       ││
│  │ ... and more                                           ││
│  └──────────────────────────┬──────────────────────────────┘│
└─────────────────────────────┼──────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────┐
│                    Business Logic                           │
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │ Controllers (src/server/controllers/)                   ││
│  │ - conversations.ts (310 lines)                          ││
│  │ - memories.ts (348 lines)                              ││
│  │ - projects.ts (224 lines)                              ││
│  │ - users.ts, profiles.ts, auth.ts                       ││
│  └──────────────────────────┬──────────────────────────────┘│
└─────────────────────────────┼──────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │ Prisma Client (ORM)                                    ││
│  │ - Prisma schema (250+ lines, 20+ models)              ││
│  │ - Automatic migrations                                ││
│  │ - Type safety for database operations                 ││
│  └──────────────────────────┬──────────────────────────────┘│
└─────────────────────────────┼──────────────────────────────┘
                              │
┌─────────────────────────────┼──────────────────────────────┐
│                    Database                                 │
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │ PostgreSQL                                             ││
│  │ - User, Profile, Project, Community                   ││
│  │ - Memory, Conversation, ConversationParticipant       ││
│  │ - Quest, Badge, Post, Comment, Vote                   ││
│  │ - Role, Permission, UserRole, RoleGrant               ││
│  │ - Token, UserToken, CommunityToken                    ││
│  │ - Reward                                              ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

External Services:
├── Omi Device (Wearable microphone)
│   └── Sends voice segments via webhook
│
├── Claude API / OpenAI
│   └── Process conversations, generate insights
│
├── GitHub
│   └── Create issues from action items
│
├── Deepgram
│   └── Transcription service
│
├── Pinecone
│   └── Vector database for RAG
│
└── Farcaster
    └── Social sharing
```

---

## Data Flow Examples

### Example 1: Creating a Project

```
User clicks "Create Project" button
        ↓
ProjectForm submits (useCreateProject hook)
        ↓
createProject() service function
        ↓
Fetch POST /api/projects with auth token
        ↓
POST /api/projects route handler
        ├─ Get auth from request header
        ├─ Parse & validate request body
        ├─ Create project in database
        └─ Return response
        ↓
Service catches response
        ↓
useCreateProject mutation
        ├─ Invalidates ['projects'] cache
        ├─ Shows success toast
        └─ Navigates to project
        ↓
User sees new project in list
```

### Example 2: Voice Note to Action Item

```
User speaks into Omi device:
"Start... I need to build a dashboard for the project... Finish"
        ↓
Omi mobile app transcribes segments
        ↓
POST /api/omi with segments:
{
  "session_id": "...",
  "segments": [
    { text: "start", speaker: "SPEAKER_01" },
    { text: "I need to build a dashboard...", speaker: "USER" },
    { text: "finish", speaker: "USER" }
  ]
}
        ↓
omi/route.ts receives webhook
        ├─ Detects "start" command
        ├─ Accumulates text
        ├─ Detects "finish" command
        └─ Calls createConversation()
        ↓
createConversation controller
        ├─ Creates Conversation in database
        └─ Triggers downstream processing
        ↓
Claude API processes conversation
        ├─ Extracts action items
        ├─ Generates summary
        └─ Creates Memory record
        ↓
GitHub integration (optional)
        └─ Creates issues for action items
        ↓
User sees memory in /memories page
```

---

## Directory Structure Explained

```
action-item/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes (13 endpoints)
│   │   │   ├── omi/route.ts         # Webhook from Omi device
│   │   │   ├── projects/            # Project CRUD
│   │   │   ├── memories/            # Memory CRUD
│   │   │   ├── conversations/       # Conversation CRUD
│   │   │   ├── users/               # User CRUD
│   │   │   ├── profiles/            # Profile CRUD
│   │   │   └── auth/                # Auth endpoints
│   │   │
│   │   ├── projects/                # Project pages
│   │   │   ├── page.tsx             # List projects (7.5KB)
│   │   │   ├── [id]/page.tsx        # Project details
│   │   │   └── create/page.tsx      # Create project form
│   │   │
│   │   ├── memories/                # Memory pages
│   │   ├── quests/                  # Quest/challenge pages
│   │   ├── leaderboard/             # Leaderboard page
│   │   ├── account/                 # Account settings
│   │   │
│   │   ├── layout.tsx               # Root layout (38 lines)
│   │   ├── page.tsx                 # Home page
│   │   ├── not-found.tsx            # 404 page
│   │   └── icon.ico                 # Favicon
│   │
│   ├── components/                  # Reusable React components
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   └── ... (20+ components)
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   └── base-layout.tsx
│   │   │
│   │   └── landing/                 # Landing page components
│   │       └── hero.tsx
│   │
│   ├── server/                      # Backend-only code
│   │   ├── prismaClient.ts          # Prisma singleton
│   │   └── controllers/             # Business logic (1.1K lines total)
│   │       ├── conversations.ts     # Conversation logic (310 lines)
│   │       ├── memories.ts          # Memory processing (348 lines)
│   │       ├── projects.ts          # Project logic (224 lines)
│   │       ├── users.ts             # User logic (68 lines)
│   │       ├── profiles.ts          # Profile logic (170 lines)
│   │       └── auth.ts              # Auth logic (45 lines)
│   │
│   ├── services/                    # API client layer
│   │   ├── projects-services.tsx    # Project API calls (180 lines)
│   │   ├── memories-services.tsx    # Memory API calls
│   │   ├── users.tsx                # User API calls
│   │   ├── profiles.tsx             # Profile API calls
│   │   └── auth.tsx                 # Auth API calls
│   │
│   ├── hooks/                       # React Query hooks
│   │   ├── projects.tsx             # useProjects, useCreateProject, etc.
│   │   ├── memories.tsx             # useMemories, useCreateMemory, etc.
│   │   ├── users.tsx                # useUsers, useUser, etc.
│   │   └── useCalEmbed.ts           # Cal.com embedding hook
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── models.ts                # Prisma model types
│   │   ├── db.ts                    # Database types
│   │   └── dynamic.ts               # Dynamic Labs types
│   │
│   ├── utils/                       # Utility functions
│   │   └── cn.ts                    # clsx + tailwind-merge
│   │
│   ├── lib/                         # (No lib directory visible)
│   │
│   ├── styles/                      # Global styles
│   │   └── globals.css              # Tailwind + global CSS
│   │
│   ├── providers/                   # Context providers
│   │   └── onchainProvider.tsx      # Web3 provider setup
│   │
│   └── fonts/                       # Web font files
│
├── prisma/                          # Database layer
│   ├── schema.prisma                # Database schema (250+ lines)
│   └── seed.ts                      # Seed data script
│
├── public/                          # Static assets
│   ├── images/                      # Image files
│   │   ├── logos/
│   │   └── ...
│   └── docs/                        # Documentation images
│
├── package.json                     # Dependencies (68 packages)
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind CSS config
├── next.config.js                   # Next.js config
├── .eslintrc.json                   # ESLint config
├── .prettierrc.json                 # Prettier config
├── components.json                  # shadcn/ui config
├── .env.example                     # Environment variables template
└── .env                             # (local, git-ignored)
```

---

## Key Files to Know

### Critical Files (Understand First)
- `src/app/api/omi/route.ts` - **Entrypoint for voice data** (⚠️ has global state)
- `src/server/controllers/memories.ts` - **Core memory processing**
- `prisma/schema.prisma` - **Database schema** (all models)
- `src/hooks/projects.tsx` - **Typical React Query pattern**
- `src/services/projects-services.tsx` - **API client pattern**

### Important Files (For Context)
- `src/app/layout.tsx` - **Root layout, providers**
- `src/app/projects/page.tsx` - **Example of page structure**
- `package.json` - **Dependencies, scripts**
- `src/types/models.ts` - **Type definitions**

### Configuration Files
- `tsconfig.json` - TypeScript strict mode settings
- `next.config.js` - Next.js build configuration
- `.env.example` - Required environment variables

---

## Authentication Flow

```
User logs in via Dynamic Labs (Web3 auth)
        ↓
getAuthToken() from Dynamic SDK
        ↓
Auth token included in every API request:
{
  headers: {
    Authorization: `Bearer ${authToken}`
  }
}
        ↓
Backend receives auth header
        ↓
Auth middleware (location: unclear - needs audit)
        ├─ Validates token
        ├─ Extracts user ID
        └─ Passes to route handler
        ↓
Route proceeds with authenticated user context
```

**⚠️ Issue**: Auth middleware implementation not found in reviewed files. Need to audit `/api` routes for auth checks.

---

## Technology Stack Details

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | Latest | Server runtime |
| **Framework** | Next.js | 14.2.17 | Full-stack React framework |
| **Frontend** | React | 18 | UI library |
| **Language** | TypeScript | 5 | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first CSS |
| **UI Components** | shadcn/ui + Radix UI | Latest | Accessible components |
| **Animations** | Framer Motion | 11.3.29 | Complex animations |
| **Icons** | Lucide React | 0.475.0 | Icon library |
| **Forms** | react-hook-form | 7.54.2 | Form state management |
| **Database** | PostgreSQL | Latest | Relational database |
| **ORM** | Prisma | 6.4.1 | Database abstraction |
| **Data Fetching** | React Query | 5.66.9 | Server state management |
| **Notifications** | Sonner | 2.0.1 | Toast notifications |
| **Themes** | next-themes | 0.4.4 | Dark mode support |
| **Web3** | wagmi, viem | Latest | Blockchain interaction |
| **Web3 Auth** | Dynamic Labs | 3.9.10 | Wallet authentication |
| **AI** | Claude API | Latest | Language model |
| **Vector DB** | Pinecone | - | Vector search |
| **Transcription** | Deepgram | - | Speech-to-text |
| **Social** | Farcaster | - | Social graph |
| **Calendar** | Cal.com | 1.5.0 | Scheduling |
| **Validation** | Zod | 3.24.2 | Runtime schema validation |

---

## Common Tasks & Their Flows

### Task: Add a New Project Field
```
1. Update schema.prisma
   - Add field to Project model
   - Run: npx prisma migrate dev

2. Update API
   - Update POST /api/projects request validation
   - Update database include() in query
   - Update response DTO

3. Update Frontend
   - Update service (projects-services.tsx)
   - Update form component
   - Update display component

4. Test
   - Test API with curl/Postman
   - Test form submission
   - Test display
```

### Task: Add a New API Endpoint
```
1. Create route file
   - src/app/api/my-feature/route.ts

2. Implement handler
   - GET / POST / PATCH / DELETE

3. Add validation
   - Create Zod schema
   - Validate input

4. Add business logic
   - Call Prisma or controller
   - Handle errors

5. Add to frontend
   - Create service function
   - Create hook
   - Use in component

6. Test
   - Unit tests
   - Integration tests
   - E2E tests
```

---

## Performance Considerations

### Current Bottlenecks
1. **N+1 Queries**: Some routes include many relations
2. **No Caching**: Every request hits database
3. **Large Responses**: All fields returned (should use DTOs)
4. **No Pagination**: Some endpoints load all records

### Optimizations Needed
```
Priority 1 (High Impact):
- Add database indexes
- Implement selective queries
- Add response DTOs

Priority 2 (Medium Impact):
- Add caching headers
- Optimize Prisma queries
- Add field pagination

Priority 3 (Low Impact):
- Code splitting frontend
- Image optimization
- CSS purging
```

---

## Error Handling Status

| Component | Error Handling | Status |
|-----------|---|---|
| API Routes | Generic error messages | ❌ Incomplete |
| Controllers | Generic catch-all | ❌ Weak |
| Services | Try-catch with rethrow | ⚠️ Partial |
| Frontend | Sonner toasts | ✅ Good |
| Hooks | No error handling visible | ❌ Missing |

---

## Deployment Readiness

| Area | Status | Notes |
|------|--------|-------|
| Environment Vars | ⚠️ Partial | .env.example exists but unclear which are required |
| Database Migrations | ✅ Good | Prisma handles automatically |
| Secrets Management | ❌ Unknown | Need to verify |
| Error Tracking | ❌ None | No Sentry/equivalent configured |
| Monitoring | ❌ None | No APM/logging visible |
| Rate Limiting | ❌ None | Could be abused |
| CORS | ❌ Unknown | Need to verify |
| HTTPS | ✅ Likely | Vercel handles this |
| Backups | ❌ Unknown | Database backup strategy unclear |

---

## Next Steps for Understanding

1. **Database**: Read `prisma/schema.prisma` completely - understand all 20+ models
2. **API**: Map all 13 endpoints - what they do, auth requirements
3. **Features**: Understand 3 agent systems (Builder, Growth, Fundraiser)
4. **Auth**: Find auth middleware implementation
5. **External**: Set up local Omi emulator for testing


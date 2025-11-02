# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Action Item** is a voice-to-action productivity tool that connects to the Omi wearable device to capture conversations and transform them into structured action items. The application integrates with GitHub for issue creation, uses AI agents for processing, and includes blockchain integration for identity and token gating.

Key integrations:
- **Omi Device**: Real-time audio streaming and memory webhooks
- **GitHub**: Automated issue creation from conversations
- **AI Agents**: ElizaOS-based agents for Builder, Growth, and Fundraiser workflows
- **Blockchain**: Dynamic Labs for wallet authentication, Ethereum/Polygon networks

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API routes, Express-style controllers
- **Database**: PostgreSQL with Prisma ORM
- **AI/ML**: OpenAI, Anthropic Claude, Deepgram (transcription), Pinecone (vector DB)
- **Blockchain**: wagmi, viem, Dynamic Labs SDK
- **State Management**: TanStack Query (React Query)

## Common Commands

### Development
```bash
npm install              # Install dependencies
npm run dev             # Start development server (http://localhost:3000)
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint
```

### Database (Prisma)
```bash
npx prisma generate      # Generate Prisma Client (runs automatically after npm install)
npx prisma migrate dev   # Create and apply migrations
npx prisma migrate reset # Reset database (WARNING: deletes all data)
npx prisma studio        # Open Prisma Studio GUI
npx prisma db seed       # Seed database with test data (uses prisma/seed.ts)
```

### Code Formatting
```bash
npx prettier --write .   # Format all files with Prettier
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API route handlers
│   │   ├── omi/          # Omi device webhook endpoints
│   │   ├── memories/     # Memory CRUD operations
│   │   ├── projects/     # Project management
│   │   ├── users/        # User management
│   │   └── profiles/     # User profile operations
│   ├── account/          # Account management pages
│   ├── memories/         # Memory browsing UI
│   ├── projects/         # Project browsing UI
│   └── quests/           # Quest/gamification UI
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components (navbar, base-layout)
│   ├── forms/           # Form components
│   ├── modals/          # Modal dialogs
│   ├── buttons/         # Button components
│   └── icons/           # Icon components
├── server/              # Server-side logic
│   ├── controllers/     # Business logic controllers
│   │   ├── memories.ts
│   │   ├── projects.ts
│   │   ├── users.ts
│   │   ├── profiles.ts
│   │   ├── conversations.ts
│   │   └── auth.ts
│   └── prismaClient.ts  # Prisma client singleton
├── services/            # Client-side API services
├── hooks/               # Custom React hooks
├── providers/           # React context providers
│   ├── onchainProvider.tsx  # Dynamic Labs + wagmi setup
│   └── theme-provider.tsx
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── lib/                 # Shared libraries
└── styles/              # Global styles

prisma/
├── schema.prisma        # Database schema
└── seed.ts             # Database seeding script
```

### Key Architectural Patterns

#### 1. Three-Layer API Architecture
- **API Routes** (`src/app/api/*/route.ts`): Handle HTTP requests, validate parameters
- **Controllers** (`src/server/controllers/*.ts`): Contain business logic and database operations
- **Services** (`src/services/*.tsx`): Client-side API wrappers using fetch

Example flow: API Route → Controller → Prisma Client → Database

#### 2. Memory Processing Pipeline
When Omi device sends a memory webhook to `/api/omi/memories`:
1. Validate and store memory in database (`createMemory` controller)
2. Format transcript for agent processing
3. Send to ElizaOS agent evaluator to determine action type
4. Execute corresponding agent workflow (REGISTER_PROJECT, SEARCH_PLACES_NEARBY, etc.)
5. Return response to Omi device

Configuration requires:
- `SERVER_ENDPOINT`: ElizaOS server URL
- `AGENT_ID_EVALUATOR`: Agent ID for routing decisions

#### 3. Authentication Flow (Dynamic Labs)
1. User connects wallet via Dynamic Labs modal
2. `onAuthSuccess` event fires in `onchainProvider.tsx`
3. Extract credentials (email, embedded wallet, external wallet) using `getDynamicCredentials`
4. Call `loginUser` service to create/update user in database
5. Redirect to `/account` page

Wallets supported: Embedded wallets, MetaMask, WalletConnect, and other EVM wallets

#### 4. Database Schema Highlights
- **E-HRBAC-T Model**: Enhanced Hierarchical Role-Based Access Control with Token gating
  - `Role` → `UserRole` → `User` (with community/project scope)
  - `Token` → `UserToken` for token balance tracking
  - `CommunityToken` for token-gated communities
- **Memory Model**: Stores Omi device transcriptions with JSON fields for structured data, transcript segments, geolocation, and plugin results
- **Project Model**: Includes stage tracking (IDEATION → PROTOTYPE → MVP → GROWTH → FUNDED)
- **Quest/Badge System**: Gamification with rewards and tier progression

## Environment Variables

Required environment variables:

```bash
# Database (.env file)
DATABASE_URL=                          # PostgreSQL connection string

# Blockchain/Web3 (.env.local file)
NEXT_PUBLIC_ALCHEMY_API_KEY=          # Alchemy API key for RPC
NEXT_PUBLIC_DYNAMIC_ENV_ID=           # Dynamic Labs environment ID
NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS=   # Token contract address

# AI Agents (not in template, but required for Omi integration)
SERVER_ENDPOINT=                       # ElizaOS agent server URL
AGENT_ID_EVALUATOR=                   # Agent ID for memory evaluation
```

See `.env.template` for the baseline configuration.

## Code Style

- **Formatting**: Prettier with Tailwind plugin
  - Single quotes for JS/TS
  - No semicolons
  - 80 character line width
  - 2 space indentation
- **TypeScript**: Strict mode enabled
- **Path Aliases**: Use `@/*` for imports from `src/` directory
- **Component Structure**: Functional components with TypeScript interfaces
- **API Routes**: Use Next.js 14 App Router conventions (`route.ts`)

## Important Notes

### Database
- Prisma generates client automatically on `npm install` (postinstall script)
- Always run `prisma generate` after schema changes
- Use migrations for schema changes, not direct database modifications
- The `Memory` model uses `@map("memories")` for table name

### Blockchain Integration
- Three chains configured: Ethereum Mainnet, Polygon Mainnet, Polygon Amoy (testnet)
- Dynamic Labs handles wallet connection and authentication
- wagmi/viem for blockchain interactions
- User model tracks both embedded wallet (`appWallet`) and external wallet (`extWallet`)

### AI Agent Integration
- Agents are hosted separately using ElizaOS framework
- Communication via POST requests to `{SERVER_ENDPOINT}/{AGENT_ID}/message`
- Agents evaluate memory content and route to appropriate workflows
- Current agent types: Evaluator (routing), Builder (GitHub issues), Growth (promotion), Fundraiser (investment)

### Component Library
- Uses shadcn/ui components in `src/components/ui/`
- Components are configured via `components.json`
- TailwindCSS with dark mode support via `next-themes`

## Testing

No test suite currently configured. When adding tests, consider:
- Unit tests for controllers and utilities
- Integration tests for API routes
- E2E tests for critical user flows (authentication, memory creation, project creation)


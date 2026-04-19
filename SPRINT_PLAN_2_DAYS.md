# Action Item - 2-Day Parallel Sprint Plan

**Objective**: Complete Phase 1 (stabilization) of codebase + Omi integration  
**Duration**: 2 days (48 hours)  
**Team**: 4-5 agents working in parallel  
**Start**: Now  
**Deliverable**: Production-ready Phase 1 fixes

---

## 🎯 Sprint Goals

### Must Complete (Critical Path)
- [ ] Remove/fix global state bugs
- [ ] Add webhook signature verification
- [ ] Add rate limiting
- [ ] Add input validation (Zod schemas)
- [ ] Implement error handling standard
- [ ] Write integration tests
- [ ] All security checks passing

### Nice to Have (If Time)
- [ ] API documentation
- [ ] Full test coverage (70%+)
- [ ] Deployment guide

---

## 👥 Agent Team & Tasks

### Agent 1: Security & Webhooks 🔒
**Agent Focus**: Omi webhook security  
**Timeline**: Day 1 full, Day 2 morning validation  
**Files to Create/Modify**:
- `src/lib/omi-webhook.ts` (NEW)
- `src/types/omi.ts` (NEW)
- `src/app/api/omi/memories/route.ts` (MODIFY)
- `src/lib/rate-limit.ts` (NEW)

**Tasks**:
1. Create `src/lib/omi-webhook.ts` with signature verification
   - HMAC-SHA256 verification
   - Timing-safe comparison
   - Error handling

2. Create `src/types/omi.ts` with Zod schemas
   - All webhook interfaces
   - Validation schemas
   - Export types

3. Update `src/app/api/omi/memories/route.ts`
   - Add signature verification
   - Add rate limiting
   - Add Zod validation
   - Update error handling

4. Create `src/lib/rate-limit.ts`
   - In-memory for dev
   - Upstash Redis for production

5. Create tests: `__tests__/api/omi-memories.test.ts`
   - Signature verification tests
   - Rate limiting tests
   - Validation tests

**Deliverables**:
- ✅ Webhook signature verification working
- ✅ Rate limiting functional
- ✅ Webhook format validated
- ✅ Tests passing (5-10 tests)
- ✅ .env.example updated with new vars

---

### Agent 2: Global State Removal 🧹
**Agent Focus**: Remove critical global state bugs  
**Timeline**: Day 1 morning (4 hours)  
**Files to Modify**:
- `src/app/api/omi/route.ts` (DELETE or REFACTOR)
- `src/server/controllers/conversations.ts` (CHECK impact)

**Tasks**:
1. Investigate `/api/omi/route.ts`
   - Check git history for creation
   - Find all references in codebase
   - Understand purpose

2. Decision tree:
   - If unused: DELETE file
   - If critical: Refactor to use DB sessions
   - If streaming needed: Redesign without global state

3. Verify `/api/omi/memories` works independently

4. Create migration if database schema changes needed

5. Write tests to verify no concurrent request interference
   - Concurrent request test
   - Data isolation test

**Deliverables**:
- ✅ Decision made: keep/delete/refactor
- ✅ Code changed or deleted
- ✅ No global module-level state
- ✅ Tests pass for concurrent requests
- ✅ Documentation of decision

---

### Agent 3: Input Validation & Error Handling 🛡️
**Agent Focus**: API security & debugging  
**Timeline**: Day 1 full, Day 2 morning  
**Files to Create/Modify**:
- `src/validation/` (NEW directory)
- `src/lib/errors.ts` (NEW)
- `src/lib/api-response.ts` (NEW)
- All API routes in `src/app/api/`

**Tasks**:
1. Create `src/lib/errors.ts`
   - Error class hierarchy (AppError, ValidationError, AuthError, NotFoundError, etc.)
   - Error codes and HTTP status codes
   - Custom error messages

2. Create `src/lib/api-response.ts`
   - success() helper
   - errorResponse() helper
   - Standardized response format

3. Create `src/validation/` schemas
   - `projects.ts` - Zod schemas for project endpoints
   - `users.ts` - Zod schemas for user endpoints
   - `memories.ts` - Zod schemas for memory endpoints
   - `conversations.ts` - Zod schemas for conversation endpoints

4. Create validation middleware
   - `src/lib/validateRequest.ts`
   - Reusable validation wrapper

5. Update API routes to use new patterns
   - Start with `/api/projects/route.ts`
   - Then `/api/users/route.ts`
   - Then `/api/memories/route.ts`
   - Then `/api/conversations/route.ts`
   - (Others as time permits)

6. Write tests for error handling
   - Validation error tests
   - 400 Bad Request tests
   - 401 Unauthorized tests
   - 500 Server Error tests

**Deliverables**:
- ✅ Error handling framework created
- ✅ Zod schemas for all major endpoints
- ✅ Consistent error responses
- ✅ 10+ API endpoints updated
- ✅ Tests for error scenarios (10-15 tests)

---

### Agent 4: Testing Infrastructure ✅
**Agent Focus**: Test setup and coverage  
**Timeline**: Day 1 afternoon, Day 2 full  
**Files to Create**:
- `vitest.config.ts` (NEW)
- `__tests__/setup.ts` (NEW)
- `__tests__/unit/` directory structure
- `__tests__/integration/` directory structure

**Tasks**:
1. Set up Vitest
   - Install dependencies
   - Create vitest.config.ts
   - Configure TypeScript support
   - Configure coverage reporting

2. Create test utilities
   - Mock request/response builders
   - Mock Prisma client
   - Mock Omi webhook payloads
   - Test helpers

3. Write integration tests (focus on critical paths)
   - POST /api/omi/memories (signature + validation)
   - POST /api/projects (validation + error handling)
   - POST /api/users (auth + validation)
   - GET /api/projects (pagination + error)
   - GET /api/memories (filtering + error)

4. Write unit tests
   - Error classes
   - Validation schemas
   - Rate limiter
   - Webhook verification

5. Set up coverage reporting
   - Generate baseline coverage
   - Create CI configuration

6. Add test running scripts to package.json
   - npm test
   - npm test:watch
   - npm test:coverage

**Deliverables**:
- ✅ Testing framework set up
- ✅ 20-30 tests written and passing
- ✅ Test coverage > 50% for critical code
- ✅ CI configuration ready
- ✅ README updated with test instructions

---

### Agent 5: Documentation & Integration 📝
**Agent Focus**: Tying everything together  
**Timeline**: Day 2 full  
**Files to Create/Modify**:
- `PHASE_1_COMPLETE.md` (NEW)
- `.env.example` (MODIFY)
- `README.md` (MODIFY)
- API documentation (OPTIONAL)

**Tasks**:
1. Wait for other agents to complete Phase 1 code

2. Create `.env.example` with all new variables
   - OMI_WEBHOOK_SECRET
   - OMI_API_KEY
   - REDIS_URL (optional)
   - Any others from new code

3. Update `README.md`
   - Add security features section
   - Add testing section
   - Add deployment checklist
   - Add environment variables setup

4. Create `PHASE_1_COMPLETE.md`
   - Summary of all Phase 1 changes
   - What was fixed and why
   - Testing results
   - Deployment instructions
   - Next steps (Phase 2)

5. Create deployment checklist
   - Environment variables to set
   - Database migrations needed
   - Webhook configuration needed
   - Verification steps

6. Write API endpoint documentation
   - POST /api/omi/memories - with signature requirements
   - Rate limiting documentation
   - Error codes documentation
   - Example curl requests

**Deliverables**:
- ✅ Complete Phase 1 documentation
- ✅ Updated README with security info
- ✅ Deployment guide ready
- ✅ API documentation complete
- ✅ Onboarding guide for team

---

## 📊 Task Dependency Graph

```
Day 1
├─ Agent 1: Security & Webhooks (full day)
│  ├─ src/lib/omi-webhook.ts
│  ├─ src/types/omi.ts
│  ├─ src/lib/rate-limit.ts
│  └─ Tests for above
│
├─ Agent 2: Global State (morning → 4 hours)
│  ├─ Investigate /api/omi/route.ts
│  ├─ Decision: keep/delete/refactor
│  └─ Implement decision
│
├─ Agent 3: Validation & Errors (full day)
│  ├─ src/lib/errors.ts
│  ├─ src/lib/api-response.ts
│  ├─ src/validation/* schemas
│  ├─ Update API routes (4-5 priority routes)
│  └─ Tests for above
│
└─ Agent 4: Testing (afternoon → full day)
   ├─ vitest.config.ts setup
   ├─ Test utilities created
   ├─ Integration tests for critical paths
   └─ Coverage reporting

Day 2
├─ Agent 1: Final verification (morning)
│  ├─ Test webhook verification thoroughly
│  ├─ Test rate limiting edge cases
│  └─ Verify all security tests passing
│
├─ Agent 2: Final cleanup (morning)
│  ├─ Verify no breaking changes
│  ├─ Run full test suite with global state fix
│  └─ Document any migration needed
│
├─ Agent 3: Final validation (morning)
│  ├─ Update remaining routes (if time)
│  ├─ Verify all error handling consistent
│  └─ Run validation tests
│
├─ Agent 4: Full test suite (full day)
│  ├─ Run all tests
│  ├─ Achieve >50% coverage
│  ├─ Fix any flaky tests
│  └─ Generate coverage report
│
└─ Agent 5: Documentation & Release (full day)
   ├─ Consolidate all changes
   ├─ Create PHASE_1_COMPLETE.md
   ├─ Update README and .env.example
   ├─ Create deployment guide
   └─ Generate API documentation
```

---

## ⏱️ Day-by-Day Timeline

### Day 1 (8 hours)

**9:00am - Start**
- Agent 1: Begin `src/lib/omi-webhook.ts`
- Agent 2: Start investigating `/api/omi/route.ts`
- Agent 3: Create error handling framework
- Agent 4: Set up Vitest, create test utilities

**12:00pm - Checkpoint 1**
- Agent 1: Webhook signature verification done, tests written
- Agent 2: Decision made about global state endpoint
- Agent 3: Error classes and validation schemas in progress
- Agent 4: Testing setup complete, ready for test writing

**3:00pm - Checkpoint 2**
- Agent 1: Rate limiting implementation done, tests passing
- Agent 2: Global state issue resolved, tests passing
- Agent 3: 3-4 API routes updated with new validation
- Agent 4: 10-15 integration tests written

**6:00pm - End of Day 1**
- Agent 1: All webhook code done, 8-10 tests passing ✅
- Agent 2: Global state removed/fixed, verified safe ✅
- Agent 3: Error handling in 5 routes, 10+ tests ✅
- Agent 4: 15-20 tests passing, coverage reporting setup ✅

### Day 2 (8 hours)

**9:00am - Morning Validation (1-2 hours)**
- Agent 1: Verify webhook tests, edge cases
- Agent 2: Run full test suite with changes
- Agent 3: Verify consistent error responses
- Agent 4: Consolidate all tests, run full suite

**11:00am - Integration Work (3-4 hours)**
- Agent 3: Update remaining routes (2-3 more)
- Agent 4: Write additional edge case tests
- Agent 1: Performance test rate limiter
- Agent 2: Document global state changes

**3:00pm - Checkpoint 3**
- All critical tests passing
- Code review ready
- Documentation started

**5:00pm - Documentation Sprint (2-3 hours)**
- Agent 5: Create PHASE_1_COMPLETE.md
- Agent 5: Update README
- Agent 5: Create deployment guide
- All agents: Final verification

**8:00pm - End of Day 2**
- All Phase 1 code complete ✅
- 30-40 tests passing ✅
- Documentation ready ✅
- Deployment guide ready ✅
- Ready to merge to main ✅

---

## 🚨 Critical Dependency Path

**MUST COMPLETE ON DAY 1** (blocking everything):
1. ✅ Webhook signature verification (Agent 1 → 2 hours)
2. ✅ Global state removal decision (Agent 2 → 1 hour)
3. ✅ Error handling framework (Agent 3 → 2 hours)
4. ✅ Testing setup (Agent 4 → 2 hours)

**ON DAY 2** (can run in parallel):
1. ✅ Apply error handling to all routes (Agent 3 → 3 hours)
2. ✅ Write comprehensive tests (Agent 4 → full day)
3. ✅ Verify all security features (Agent 1 → 2 hours)
4. ✅ Documentation & integration (Agent 5 → full day)

**Risk**: If Day 1 critical path takes longer than 8 hours, we slip into Day 2

---

## 📋 Verification Checklist

### By End of Day 1 (Must Have)
- [ ] Agent 1: Webhook signature verification working
- [ ] Agent 1: Rate limiting functional
- [ ] Agent 1: Omi types defined and validated
- [ ] Agent 2: Global state removed/refactored
- [ ] Agent 2: No breaking changes
- [ ] Agent 3: Error classes created
- [ ] Agent 3: 3-5 API routes updated
- [ ] Agent 4: Vitest configured
- [ ] Agent 4: 15+ tests passing
- [ ] All agents: No build errors

### By End of Day 2 (Must Have)
- [ ] All Day 1 items completed ✅
- [ ] 35-40 tests passing
- [ ] >50% code coverage for critical paths
- [ ] All error handling consistent
- [ ] Webhook security tests passing
- [ ] Rate limiting tests passing
- [ ] Global state tests passing
- [ ] PHASE_1_COMPLETE.md created
- [ ] README updated
- [ ] .env.example updated
- [ ] API documentation created
- [ ] Deployment guide created
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Ready for code review ✅

### Testing Coverage Goals
- Webhook verification: 90%+
- Error handling: 85%+
- Rate limiting: 85%+
- API routes (critical 5): 70%+
- Overall: 50%+ (up from 0%)

---

## 🎯 Success Criteria

### Production Readiness
- [ ] 0 critical security issues
- [ ] 0 global state in API routes
- [ ] 100% of endpoints have input validation
- [ ] 100% of endpoints have error handling
- [ ] 35+ tests passing
- [ ] Can deploy to production
- [ ] Webhook secure from spoofing
- [ ] API protected from abuse (rate limiting)

### Code Quality
- [ ] All TypeScript strict mode passing
- [ ] ESLint clean (no warnings)
- [ ] Tests passing
- [ ] Coverage >50% critical paths
- [ ] No console.error without context

### Team Readiness
- [ ] Documentation complete
- [ ] Deployment guide ready
- [ ] Team understands Phase 1 changes
- [ ] Can hand off to next team

---

## 🔄 Agent Handoff Protocol

### At Checkpoints (12pm, 3pm, 6pm Day 1; 11am, 3pm Day 2)

**Each agent must provide**:
1. What was completed
2. What's still in progress
3. What's blocking (if anything)
4. What's ready for other agents

**Format**:
```
Agent [N]: [Topic]
✅ Complete: 
  - Feature X
  - Tests for Feature X

🔄 In Progress:
  - Feature Y
  
⚠️ Blocked by: [other agent if applicable]

📦 Ready for: [dependencies for other agents]
```

### Final Deliverables (End Day 2)

**Agent 1** provides:
- `src/lib/omi-webhook.ts` (with tests)
- `src/lib/rate-limit.ts` (with tests)
- `src/types/omi.ts` (complete)
- Modified `/api/omi/memories/route.ts`
- Test results: ✅ All passing

**Agent 2** provides:
- Decision on `/api/omi/route.ts` (deleted/refactored)
- Verification script
- Concurrent request tests passing
- Documentation of decision

**Agent 3** provides:
- `src/lib/errors.ts` (complete)
- `src/lib/api-response.ts` (complete)
- `src/validation/*` schemas (all major endpoints)
- Updated API routes (5+ endpoints)
- Test results: ✅ All passing

**Agent 4** provides:
- `vitest.config.ts` (configured)
- `__tests__/` directory (fully set up)
- 35-40 tests (all passing)
- Coverage report (>50%)
- CI configuration ready

**Agent 5** provides:
- `PHASE_1_COMPLETE.md` (summary)
- Updated `README.md`
- Updated `.env.example`
- Deployment guide
- API documentation

---

## 🚀 How to Run This

### Option A: Sequential Agents (Safe)
```bash
# Agent 1 starts immediately
npm run agent:security-webhooks

# After Agent 1 checkpoints at 12pm, Agent 2 can finalize
npm run agent:global-state

# After Agent 3 checkpoints, Agent 4 can run tests
npm run agent:testing
```

### Option B: Parallel Agents (Aggressive)
```bash
# All agents start at 9am
npm run agent:security-webhooks &
npm run agent:global-state &
npm run agent:validation-errors &
npm run agent:testing-setup &

# Agent 5 waits until 3pm (when others checkpointing)
# Then runs documentation
sleep 6h && npm run agent:documentation
```

### Option C: This Conversation (What We'll Do)
```
Use Claude Code agents directly in this conversation
Each agent spawned with specific file focus
Real-time coordination via message updates
```

---

## 💡 Tips for Success

1. **Communicate Frequently**: Checkpoints at 12pm, 3pm, 6pm Day 1
2. **Dependencies First**: Complete critical path items before nice-to-haves
3. **Test as You Go**: Write tests while code is fresh
4. **Pair on Blockers**: If someone is blocked, pair with them
5. **Over-communicate**: Tell other agents about your progress
6. **No Perfectionism**: Good enough is done by Day 2 end
7. **Focus on Security**: Webhook verification must be perfect
8. **Accept Rework**: Some code might need 2 iterations
9. **Celebrate Checkpoints**: Mark progress at each checkpoint
10. **Sleep When Done**: Don't work beyond 8 hours/day

---

## 📞 Escalation Path

**If something is blocked**:
1. Try to solve independently (15 min)
2. Reach out to relevant agent (15 min)
3. Escalate to team lead/architect (immediate)

**Common blockers**:
- Agent A needs output from Agent B: Wait for checkpoint or async message
- Conflicting code changes: One agent yields to other
- Unclear requirements: Refer to OMI_IMPLEMENTATION_PLAN.md
- Missing info from Omi docs: Use best guess documented in comments

---

## ✨ Expected Outcome (End of Day 2)

```
Production Ready Phase 1:
├── Security
│   ├── ✅ Webhook signature verification
│   ├── ✅ Rate limiting (100 req/min)
│   ├── ✅ Input validation (Zod)
│   └── ✅ Error handling (typed exceptions)
│
├── Code Quality
│   ├── ✅ No global state in serverless
│   ├── ✅ Consistent error responses
│   ├── ✅ 35-40 tests passing
│   ├── ✅ >50% code coverage
│   └── ✅ TypeScript strict mode
│
├── Documentation
│   ├── ✅ PHASE_1_COMPLETE.md
│   ├── ✅ Deployment guide
│   ├── ✅ API documentation
│   └── ✅ Updated README
│
└── Ready for Merge
    ├── ✅ Code review approved
    ├── ✅ Tests passing
    ├── ✅ No security issues
    └── ✅ Team ready to deploy
```

---

## Ready? Let's Go! 🚀

Spawn all 5 agents now, they coordinate via messages, and by end of Day 2 Phase 1 is complete and ready for production.

Next: Start spawning agents!


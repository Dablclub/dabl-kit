# Deployment Guide - Phase 1

**Target**: Production deployment of security fixes  
**Risk Level**: Low (no schema changes, additive only)  
**Rollback Plan**: Revert commit (no database migrations)  

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All 122 tests passing: `npm test -- --run`
- [ ] No TypeScript errors: `npm run build`
- [ ] Code review approved by tech lead
- [ ] No sensitive data in code (grep for API keys)

### Omi Configuration
- [ ] Obtain `OMI_WEBHOOK_SECRET` from Omi dashboard
- [ ] Obtain `OMI_API_KEY` for Phase 2 (optional now)
- [ ] Verify webhook endpoint URL in Omi: `https://yourdomain.com/api/omi/memories`
- [ ] Test webhook delivery from Omi (send test memory)

### Monitoring Setup
- [ ] Datadog/monitoring configured for HTTP 401 errors (invalid signatures)
- [ ] Alert on HTTP 429 errors (rate limit hits)
- [ ] Log aggregation configured for webhook processing
- [ ] Dashboard for memory ingestion rate

---

## Step 1: Prepare Production Environment

### 1.1 Set Environment Variables

**In your hosting platform (Vercel, AWS, etc):**

```bash
# Required
OMI_WEBHOOK_SECRET=<get_from_omi_dashboard>

# Optional for now (Phase 2)
OMI_API_KEY=<leave_blank_for_now>

# Optional for production
REDIS_URL=redis://your-redis-instance:6379
```

**Where to find `OMI_WEBHOOK_SECRET`:**
1. Go to Omi dashboard: https://dashboard.omi.me
2. Settings → Developer → Webhook signing secret
3. Copy the value (looks like: `whs_abc123def456...`)

### 1.2 Verify Webhook Endpoint URL

In Omi dashboard settings:
- Webhook URL: `https://yourdomain.com/api/omi/memories`
- Verify it's correct for your domain
- Test delivery (Omi provides "Send Test" button)

---

## Step 2: Deploy Code

### 2.1 Via Vercel (Recommended for Next.js)

```bash
# Option A: Deploy from main branch
git push origin main

# Option B: Deploy from CLI
vercel deploy --prod
```

Vercel will automatically:
1. Run `npm install`
2. Run build
3. Deploy to production
4. Set environment variables (if configured in dashboard)

### 2.2 Via Manual SSH/Docker

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run tests to verify
npm test -- --run

# Build
npm run build

# Start production server
npm run start

# Verify it's listening on port 3000
curl http://localhost:3000/health
```

### 2.3 Via GitHub Actions (if configured)

Push to `main` branch - CI/CD will:
1. Run tests
2. Run build
3. Deploy to production
4. Notify Slack on success/failure

---

## Step 3: Verify Deployment

### 3.1 Basic Health Check

```bash
# Verify server is running
curl https://yourdomain.com/api/health

# Should return 200 OK
```

### 3.2 Test Webhook Signature Verification

```bash
# Send unsigned webhook (should be rejected with 401)
curl -X POST https://yourdomain.com/api/omi/memories \
  -H "Content-Type: application/json" \
  -d '{"text": "test"}'

# Expected response: 401 Unauthorized
```

### 3.3 Test with Valid Signature (From Omi)

1. Go to Omi dashboard → Settings → Developer → Send Test Webhook
2. Check application logs for successful memory creation
3. Verify memory appears in database: `SELECT * FROM memories ORDER BY created_at DESC LIMIT 1`

### 3.4 Monitor Initial Traffic

Watch these metrics for 30 minutes:

```
✅ Good signs:
  - HTTP 200 responses for valid webhooks
  - Memory count increasing
  - No HTTP 401 errors (indicates invalid signatures from Omi)

⚠️ Watch for:
  - HTTP 400 errors (malformed webhook)
  - HTTP 429 errors (rate limiting hit)
  - HTTP 500 errors (server issues)
```

---

## Step 4: Rollback Plan (If Issues)

### 4.1 Immediate Rollback

If you see critical errors:

```bash
# Revert to previous version
git revert <commit_hash>
git push origin main

# Or rollback to previous deployment (Vercel)
vercel rollback
```

### 4.2 Why Rollback is Safe

- ✅ No database schema changes
- ✅ No data migrations
- ✅ Pure code changes (additive only)
- ✅ Webhook endpoint still works (just without verification)

**Note**: Temporarily webhooks won't be verified if rolled back, but no data loss.

---

## Troubleshooting

### Issue: HTTP 401 Errors (Unauthorized)

**Symptom**: Omi webhooks failing with "Unauthorized"

**Causes**:
1. `OMI_WEBHOOK_SECRET` not set or incorrect
2. Omi signing method changed
3. Network/proxy stripping headers

**Fix**:
```bash
# 1. Verify environment variable is set
echo $OMI_WEBHOOK_SECRET  # Should not be empty

# 2. Check logs for signature verification failure
# Look for: "Signature verification failed"

# 3. Get new secret from Omi dashboard
# Re-deploy with new value
```

### Issue: HTTP 429 Errors (Rate Limited)

**Symptom**: After ~100 memories in a minute, getting 429 errors

**Causes**:
1. Rate limiting working as intended
2. Testing by sending lots of memories quickly

**Fix**:
```bash
# In development, reset rate limit manually
curl -X POST https://yourdomain.com/api/debug/reset-rate-limit?uid=test-user

# In production, wait 60 seconds for rate limit window to reset
# Or configure higher limits in src/lib/rate-limit.ts
```

### Issue: HTTP 400 Errors (Bad Request)

**Symptom**: Valid-looking memories getting 400 Bad Request

**Causes**:
1. Omi webhook format changed
2. Missing required fields
3. Invalid data types

**Fix**:
```bash
# Check logs for validation error details
# Look for: "Invalid format" + schema errors

# If Omi format changed, update src/types/omi.ts
# Add new fields to OmiMemoryWebhookSchema

# Deploy and test again
```

### Issue: HTTP 500 Errors (Server Error)

**Symptom**: Memories not being stored despite valid signature

**Causes**:
1. Database connection issue
2. Memory validation in createMemory() failing
3. Unexpected runtime error

**Fix**:
```bash
# Check database connectivity
npm run prisma-studio  # Opens Prisma Studio to verify DB access

# Check server logs for stack traces
# Look for database errors or validation issues

# Common issue: Memory model fields don't match webhook data
# See OMI_INTEGRATION_ASSESSMENT.md "Database Schema" section
```

---

## Monitoring & Alerts

### Key Metrics to Track

1. **Webhook Success Rate**
   ```
   (200 + 201 responses) / total webhook requests
   Target: > 95%
   ```

2. **Memory Ingestion Rate**
   ```
   SELECT COUNT(*) FROM memories 
   WHERE created_at > NOW() - INTERVAL '1 hour'
   Target: Matches expected user behavior
   ```

3. **Rate Limit Hits**
   ```
   SELECT COUNT(*) FROM webhook_logs WHERE status_code = 429
   Target: < 1% (indicates good distribution)
   ```

4. **Signature Verification Failures**
   ```
   SELECT COUNT(*) FROM webhook_logs WHERE status_code = 401
   Target: 0 after deployment (unless Omi changes signing)
   ```

### Example Datadog Monitor

```yaml
name: "Omi Webhook - High 401 Error Rate"
query: |
  avg:trace.web.request.count{service:actionitem,endpoint:/api/omi/memories,status:401}
  by {environment}
critical: "> 10"  # Alert if > 10 401 errors in 5 min
```

---

## Performance Baseline

After deployment, establish baseline metrics:

| Metric | Target | Method |
|--------|--------|--------|
| Webhook latency | < 100ms | APM trace sampling |
| Database query | < 50ms | Slow query log |
| Memory ingestion rate | > 95% | Webhook success logs |
| Rate limit effectiveness | < 1% hits | Access logs |

---

## Post-Deployment (24 hours)

### Day 1 Checks

- [ ] No alerts from monitoring
- [ ] Memory count growing steadily
- [ ] No increase in error rates
- [ ] Webhook signature verification working
- [ ] Rate limiting not triggering unexpectedly

### Day 2-7 Checks

- [ ] Performance stable
- [ ] No regressions in other endpoints
- [ ] User feedback: no issues reported
- [ ] Omi integration stable (memories appearing)

---

## Next Steps: Phase 2

After Phase 1 is stable (1 week), begin Phase 2:

1. **Create Omi API Client** (`src/lib/omi-client.ts`)
   - Use `OMI_API_KEY` for authentication
   - Implement batch operations
   - Add retry logic

2. **Sync Back to Omi**
   - Extract action items from memories
   - POST to Omi API
   - Track sync status

3. **Memory Search**
   - Implement semantic search endpoint
   - Use Omi's search capabilities

See [OMI_IMPLEMENTATION_PLAN.md](./OMI_IMPLEMENTATION_PLAN.md) Phase 2 for details.

---

## Emergency Contacts

If deployment fails:

1. **Check logs**: `vercel logs --prod` or server logs
2. **Review recent changes**: `git log --oneline -5`
3. **Rollback if needed**: `git revert <commit>` and redeploy
4. **Contact Omi support**: if webhook signature issues
5. **Check system status**: Vercel status page or hosting provider

---

**Deployment Type**: Blue-green safe (additive changes only)  
**Downtime Required**: None (zero-downtime deployment)  
**Data Loss Risk**: None (no schema changes)  
**Rollback Risk**: Low (revert is safe)

# Troubleshooting Guide

**Version**: 1.0.0  
**Updated**: 2026-04-19  
**For**: Phase 1 (Webhook security & validation)

---

## Omi Webhook Issues

### Issue: Webhooks Failing with 401 Unauthorized

**Symptoms**:
- Omi shows "webhook delivery failed"
- Server logs: "Signature verification failed"
- HTTP response: 401 Unauthorized

**Root Causes**:
1. `OMI_WEBHOOK_SECRET` not set in environment
2. Wrong secret value (copy-paste error)
3. Omi signature format changed
4. Webhook body encoding mismatch

**Diagnosis Steps**:

```bash
# 1. Verify environment variable exists
echo $OMI_WEBHOOK_SECRET
# Should output the secret, not empty

# 2. Check it matches Omi dashboard
# Go to: Omi Dashboard → Settings → Developer
# Copy the webhook signing secret and verify it matches

# 3. Check server logs for exact error
# Look for: "Signature verification failed"
# Note any details about buffer length or format

# 4. Test signature verification locally
npm test -- --run src/__tests__/unit/lib/omi-webhook.test.ts
```

**Solutions**:

```bash
# Solution 1: Set the environment variable
export OMI_WEBHOOK_SECRET="your_secret_from_omi"

# Solution 2: Update in your hosting platform
# Vercel: Dashboard → Project → Settings → Environment Variables
# AWS: Parameters Store or Secrets Manager
# Docker: docker run -e OMI_WEBHOOK_SECRET=xxx

# Solution 3: Verify the value
curl https://yourdomain.com/api/debug/config
# (returns sanitized config - secret will be masked as ****)

# Solution 4: Get fresh secret from Omi
# 1. Go to Omi dashboard
# 2. Settings → Developer → Regenerate webhook secret
# 3. Update environment variable
# 4. Re-test
```

**Expected After Fix**:
- Omi webhook delivery shows "Success"
- HTTP 201 response
- Memory appears in database

---

### Issue: Webhooks Failing with 429 Too Many Requests

**Symptoms**:
- After sending ~100 memories quickly, getting 429 errors
- Server logs: "Rate limit exceeded"
- HTTP response: 429 Too Many Requests

**Root Cause**: Rate limiting is working as intended (100 requests per minute per user)

**Diagnosis**:

```bash
# Check rate limit headers in response
curl -i -X POST https://yourdomain.com/api/omi/memories \
  -H "X-Omi-Signature: valid_signature" \
  -d '{}'

# Headers should show:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: 1713607260 (unix timestamp)
```

**Solutions**:

**For Testing**:
```bash
# Wait 60 seconds for rate limit window to reset
sleep 60

# Or send requests spaced out over time
for i in {1..100}; do
  send_memory_webhook &
  sleep 0.6  # Space them out
done
```

**For Development**:
```bash
# Increase rate limit in src/lib/rate-limit.ts
// Change from 100 to 1000 for development
const MAX_REQUESTS_PER_MINUTE = 1000

# Rebuild and restart
npm run dev
```

**For Production** (if legitimate high volume):
```bash
# Contact Omi support to discuss rate limits
# They may need to:
// - Adjust rate limits for your account
// - Send webhooks batched instead of individually
// - Implement queuing on their end

# Or implement Redis-backed rate limiting (scales better):
// See OMI_IMPLEMENTATION_PLAN.md for Redis setup
```

---

### Issue: Webhooks Failing with 400 Bad Request

**Symptoms**:
- Server logs: "Invalid webhook format"
- HTTP response: 400 Bad Request
- Response includes validation error details

**Root Cause**: Webhook payload doesn't match expected schema

**Diagnosis**:

```bash
# Check error details in response
curl -X POST https://yourdomain.com/api/omi/memories \
  -H "X-Omi-Signature: valid_signature" \
  -d '{}'

# Response might show:
// {
//   "error": {
//     "details": {
//       "transcript": "Required field missing"
//     }
//   }
// }
```

**Solutions**:

**If Omi format changed**:
```bash
# 1. Get example of new webhook from Omi
# Omi Dashboard → Settings → Developer → View Recent Webhooks

# 2. Compare with schema in src/types/omi.ts
// Look for new/renamed fields

# 3. Update schema if needed
// Add new fields to OmiMemoryWebhookSchema

# 4. Update tests
// Add test cases for new fields

# 5. Redeploy
npm run build && npm test -- --run
git push origin main
```

**If you're sending incorrect format**:
```bash
# Review the expected schema:
// GET src/types/omi.ts → OmiMemoryWebhookSchema

# Make sure you have:
// - id (string, required)
// - transcript (string, required)
// - created_at (ISO 8601 string, required)
// - structured (object, optional)

# Retry with correct format
curl -X POST https://yourdomain.com/api/omi/memories \
  -H "X-Omi-Signature: valid_signature" \
  -d '{
    "id": "mem_123",
    "transcript": "This is a test memory",
    "created_at": "2026-04-19T10:00:00Z"
  }'
```

---

## General API Issues

### Issue: All Endpoints Returning 500 Server Error

**Symptoms**:
- All API requests failing with 500
- Server logs show errors
- Application not responding

**Root Causes**:
1. Database not connecting
2. Environment variables not set
3. Server crashed

**Diagnosis**:

```bash
# 1. Check if server is running
curl http://localhost:3000/api/health

# 2. Check logs
# Vercel: vercel logs --prod
# Local: npm run dev (check console output)
# Docker: docker logs <container-id>

# 3. Check database connection
npm run prisma-studio
# Should open Prisma Studio if DB is reachable
```

**Solutions**:

```bash
# Solution 1: Restart server
npm run dev
# or
vercel deploy --prod

# Solution 2: Verify environment variables
echo $DATABASE_URL
echo $OMI_WEBHOOK_SECRET
# Should all be set

# Solution 3: Check database
npm run prisma:generate
npm run prisma:migrate

# Solution 4: Check disk space
df -h
# Should show > 1GB available
```

---

### Issue: Validation Errors on Valid Input

**Symptoms**:
- 400 Bad Request on what looks like valid data
- Error message lists specific field validation failures

**Root Cause**: Schema validation is stricter than expected

**Diagnosis**:

```bash
# Compare your data with schema definition
# File: src/validation/*.ts

# Example error response:
{
  "error": {
    "details": {
      "name": "String must be between 1 and 255 characters",
      "email": "Invalid email format"
    }
  }
}
```

**Solutions**:

```bash
# Solution 1: Fix data format
// Wrong: { "name": "" }  (empty string)
// Right: { "name": "Project Name" }

// Wrong: { "email": "invalid" }
// Right: { "email": "user@example.com" }

// Wrong: { "name": "x".repeat(500) }  (too long)
// Right: { "name": "Project" }  (< 255 chars)

# Solution 2: Check schema in code
# See src/validation/ for exact requirements

# Solution 3: Use browser dev tools to inspect requests
// Chrome: Network tab → see request/response
```

---

## Performance Issues

### Issue: Webhooks Processing Slowly

**Symptoms**:
- Webhook requests taking > 1 second
- Database queries timing out
- High CPU usage

**Diagnosis**:

```bash
# Check webhook processing logs
# Look for duration: "Webhook processed in XXXms"

# Enable slow query logging (if on PostgreSQL)
ALTER SYSTEM SET log_min_duration_statement = 500;

# Check database performance
npm run prisma-studio
# Verify indexes are created
// SELECT * FROM pg_stat_user_indexes;
```

**Solutions**:

```bash
# Solution 1: Add database indexes
// prisma/schema.prisma
// model Memory {
//   @@ index([userId])
//   @@ index([projectId])
//   @@ index([createdAt])
// }

npm run prisma:migrate

# Solution 2: Optimize memory model queries
// Avoid fetching all fields if not needed
// Use select to limit fields

# Solution 3: Scale database
// Move from shared PostgreSQL to dedicated instance
// Check CPU and memory usage

# Solution 4: Enable caching
// In Phase 2, add Redis caching layer
```

---

## Deployment Issues

### Issue: Deployment Failed, Build Errors

**Symptoms**:
- `npm run build` fails
- TypeScript errors
- Module not found errors

**Diagnosis**:

```bash
# Test locally first
npm run build

# Check for specific errors
npm run tsc --noEmit

# Run tests
npm test -- --run
```

**Solutions**:

```bash
# Solution 1: Install missing dependencies
npm install

# Solution 2: Fix TypeScript errors
npm run tsc --noEmit
# Fix reported errors

# Solution 3: Clean cache
rm -rf .next node_modules
npm install
npm run build

# Solution 4: Check Node version
node --version
# Should be 18.x or higher
```

---

### Issue: Environment Variables Not Loading

**Symptoms**:
- `OMI_WEBHOOK_SECRET is undefined` errors
- Webhooks failing after deployment

**Diagnosis**:

```bash
# Check if variables are set in hosting platform
# Vercel: Dashboard → Settings → Environment Variables
# AWS: Parameters Store
# Docker: docker run -e VAR=value

# Test locally
echo $OMI_WEBHOOK_SECRET
```

**Solutions**:

```bash
# Solution 1: Vercel
// 1. Go to Project → Settings
// 2. Click "Environment Variables"
// 3. Add OMI_WEBHOOK_SECRET
// 4. Redeploy

# Solution 2: Docker
docker run -e OMI_WEBHOOK_SECRET=value myapp

# Solution 3: .env.local (development only)
cat > .env.local << EOF
OMI_WEBHOOK_SECRET=test_secret
DATABASE_URL=...
EOF

npm run dev
```

---

## Testing Issues

### Issue: Tests Failing Locally

**Symptoms**:
- `npm test` shows failures
- Different results than CI/CD

**Diagnosis**:

```bash
# Run specific test file
npm test -- src/__tests__/unit/lib/omi-webhook.test.ts

# Run with verbose output
npm test -- --reporter=verbose

# Check Node version compatibility
node --version
```

**Solutions**:

```bash
# Solution 1: Clear test cache
npm test -- --clearCache

# Solution 2: Reinstall dependencies
rm -rf node_modules
npm install

# Solution 3: Update Node version
# Use nvm: nvm install 18.x
# Or download from nodejs.org

# Solution 4: Check jsdom is installed
npm install -D jsdom
```

---

### Issue: Webhook Signature Tests Failing

**Symptoms**:
- Tests in `omi-webhook.test.ts` failing
- "Buffer length mismatch" errors

**Root Cause**: Test setup not matching implementation

**Diagnosis**:

```bash
# Run webhook tests specifically
npm test -- src/__tests__/unit/lib/omi-webhook.test.ts --reporter=verbose

# Check if mock data is valid
grep -A5 "createValidSignature" src/__tests__/unit/lib/omi-webhook.test.ts
```

**Solutions**:

```bash
# Solution 1: Update mock signature generation
// Ensure HMAC is generated with correct algorithm
const signature = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex')

# Solution 2: Check test setup
// Verify src/__tests__/setup.ts is properly configured

# Solution 3: Reinstall Node modules
npm install
npm test -- --clearCache
```

---

## Getting Help

### Before Contacting Support

1. ✅ Check this troubleshooting guide
2. ✅ Review error logs carefully
3. ✅ Test locally to reproduce issue
4. ✅ Check environment variables are set
5. ✅ Verify database connectivity

### If Still Stuck

**Provide this information**:
```
1. Error message (exact text)
2. HTTP status code
3. Timestamp of failure
4. Request body (sanitized - no secrets)
5. Server logs (last 50 lines)
6. Environment: (development/staging/production)
7. Steps to reproduce
```

**Resources**:
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Phase 1 Complete](./PHASE_1_COMPLETE.md)
- [OMI Integration Assessment](./OMI_INTEGRATION_ASSESSMENT.md)

---

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| 401 Unauthorized | Set `OMI_WEBHOOK_SECRET` environment variable |
| 429 Rate Limited | Wait 60 seconds or reduce request frequency |
| 400 Bad Request | Check webhook format matches `OmiMemoryWebhookSchema` |
| 500 Server Error | Check database connection, restart server |
| Tests failing | Run `npm install` and `npm test -- --clearCache` |

---

**Last Updated**: 2026-04-19  
**Next Review**: After Phase 2 launch

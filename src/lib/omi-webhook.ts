import crypto from 'crypto'

const OMI_WEBHOOK_SECRET = process.env.OMI_WEBHOOK_SECRET || ''

/**
 * Verify that a webhook request came from Omi using HMAC-SHA256 signature verification
 * Assumes Omi sends X-Omi-Signature header with HMAC-SHA256(body, secret) in hex format
 *
 * @param request - The incoming webhook request
 * @returns Promise<boolean> - True if signature is valid, false otherwise
 * @throws Will not throw, logs errors instead
 *
 * @example
 * const isValid = await verifyOmiWebhookSignature(request)
 * if (!isValid) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * }
 */
export async function verifyOmiWebhookSignature(
  request: Request,
): Promise<boolean> {
  try {
    // Get signature from header
    const signature = request.headers.get('X-Omi-Signature')
    if (!signature) {
      console.warn('Missing X-Omi-Signature header in webhook request')
      return false
    }

    // Get raw body for signature verification
    const body = await request.clone().text()
    if (!body) {
      console.warn('Empty webhook body')
      return false
    }

    // Calculate expected signature using HMAC-SHA256
    const hmac = crypto
      .createHmac('sha256', OMI_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    // Use timing-safe comparison to prevent timing attacks
    try {
      const match = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(hmac),
      )
      return match
    } catch (error) {
      // timingSafeEqual throws if buffer lengths don't match
      console.warn(
        'Signature verification failed: buffer length mismatch',
        error,
      )
      return false
    }
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Middleware wrapper for webhook signature verification
 * Handles configuration validation and error cases
 *
 * @param request - The incoming webhook request
 * @returns Promise object with { valid: boolean, error?: string }
 *
 * @example
 * const verification = await requireOmiWebhookSignature(request)
 * if (!verification.valid) {
 *   console.warn(`Webhook verification failed: ${verification.error}`)
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 * }
 */
export async function requireOmiWebhookSignature(
  request: Request,
): Promise<{ valid: boolean; error?: string }> {
  if (!OMI_WEBHOOK_SECRET) {
    console.error(
      'OMI_WEBHOOK_SECRET not configured - webhook verification is disabled',
    )
    return {
      valid: false,
      error: 'Webhook verification not configured',
    }
  }

  try {
    const valid = await verifyOmiWebhookSignature(request)
    if (!valid) {
      return {
        valid: false,
        error: 'Invalid webhook signature',
      }
    }
    return { valid: true }
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return {
      valid: false,
      error: 'Signature verification failed',
    }
  }
}

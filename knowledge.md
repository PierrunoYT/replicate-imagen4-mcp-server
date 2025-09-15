# Replicate API Connection Issues - Knowledge Base

## Problem: Connection Closed Error 32400

### Symptoms
- Getting "connection closed" error with code 32400 when calling Replicate API
- Valid API token but requests failing unexpectedly
- Server crashes or timeouts during image generation

### Root Cause
The original implementation used synchronous `replicate.run()` calls with a `wait.timeout` parameter. This approach has several issues:

1. **Synchronous Timeout Limitation**: Replicate enforces a 60-second timeout for synchronous requests
2. **Connection Instability**: Long-running models like `imagen-4-ultra` often exceed this timeout
3. **Poor Error Recovery**: Synchronous calls don't handle network interruptions gracefully

### Solution: Asynchronous Polling Pattern

**Key Changes Made:**
1. Replaced `replicate.run()` with `replicate.predictions.create()` + polling
2. Implemented proper async workflow: create prediction → poll status → get result
3. Added exponential backoff for polling to avoid overwhelming the API
4. Enhanced retry logic for both prediction creation and status polling

**Configuration:**
```typescript
const POLL_INTERVAL_MS = 3000; // 3 seconds between status checks
const MAX_POLL_TIME_MS = 600000; // 10 minutes max wait time
const EXPONENTIAL_BACKOFF_BASE = 1.5;
```

**Implementation Pattern:**
```typescript
// Start prediction (async)
const prediction = await replicate.predictions.create({ model, input });

// Poll for completion
while (status not final) {
  const current = await replicate.predictions.get(prediction.id);
  if (current.status === 'succeeded') return current.output;
  if (current.status === 'failed') throw error;
  // Wait with exponential backoff
  await sleep(backoffDelay);
}
```

### Best Practices for Replicate API

1. **Always Use Async Pattern**: For long-running models, never use synchronous calls
2. **Implement Polling**: Check prediction status every 2-5 seconds
3. **Use Exponential Backoff**: Gradually increase polling intervals to reduce API load
4. **Handle All Status Types**: `starting`, `processing`, `succeeded`, `failed`, `canceled`
5. **Set Reasonable Timeouts**: 10+ minutes for image generation models
6. **Retry on Network Errors**: Network issues are common, implement retries

### Error Handling Strategy

- **Connection Errors**: Retry with exponential backoff
- **Prediction Failures**: Check `prediction.error` for details
- **Timeouts**: Set appropriate max polling time (10+ minutes for imagen)
- **Rate Limiting**: Respect API rate limits with proper delays

### Monitoring

Log key events for debugging:
- Prediction creation with ID
- Status changes during polling
- Retry attempts and reasons
- Final success/failure outcomes

This async polling approach eliminates connection timeout issues and provides much more reliable API interaction.
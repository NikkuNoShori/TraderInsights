# Security Best Practices

This document outlines the security best practices to follow when working with environment variables, API keys, and other sensitive data in the TraderInsights application.

## Environment Variables

### DO

- Use environment variables for all sensitive configuration
- Follow the unified naming approach for environment variables (see ENV_SETUP.md)
- Validate that required environment variables are present at startup
- Store development variables in `.env` files (not committed to version control)
- Use proper secrets management for production environments

### DON'T

- Hard-code sensitive data in your application code
- Commit `.env` files or any file containing real credentials to version control
- Log environment variable values in console output or logs
- Store sensitive values in browser localStorage or sessionStorage

## Logging

### DO

- Use the `safeLogger` utility from `src/lib/utils/security.ts` for all logging
- Mask sensitive data using `maskSensitiveData()` when logging manually
- Process objects with `prepareForLogging()` before logging
- Keep logs focused on non-sensitive operational data

### DON'T

- Log entire API responses that may contain sensitive data
- Include API keys, tokens, or credentials in logs
- Log user identifiable information without proper masking
- Include stack traces in production error responses

## API Handling

### DO

- Validate input data before using it to make API calls
- Use proper error handling that doesn't leak internal details
- Return generic error messages to clients
- Log detailed errors server-side with sensitive data masked

### DON'T

- Return raw error objects from external APIs to clients
- Include API credentials in client-side code
- Pass sensitive data in URL parameters
- Expose internal error details to clients

## Frontend Security

### DO

- Use environment variables for frontend configuration
- Proxy sensitive API requests through your backend
- Validate all user input
- Implement proper CORS policies

### DON'T

- Store API keys or secrets in JavaScript code accessible to clients
- Make direct API calls to services requiring authentication from the frontend
- Trust user input without validation
- Expose detailed error information to users

## Authentication

### DO

- Use secure token storage
- Implement proper logout functionality
- Validate authentication on all protected routes
- Use HTTPS for all communication

### DON'T

- Store sensitive tokens in localStorage
- Send credentials in URL parameters
- Use weak encryption for sensitive data
- Cache sensitive data without proper security measures

## Implementation Examples

### Safely Accessing Environment Variables

```typescript
// Good - using the helper function
import { getEnvVar } from '../utils/env';
const apiKey = getEnvVar('API_KEY');

// Bad - direct access without fallbacks
const apiKey = process.env.API_KEY;
```

### Safe Logging

```typescript
// Good - using the safe logger
import { safeLogger } from '../lib/utils/security';
safeLogger.log('User registration attempt', { userId, email });

// Bad - exposing sensitive data
console.log('User data:', { userId, email, password });
```

### Error Handling

```typescript
// Good - generic error without exposing details
return res.status(500).json({
  error: "An error occurred during processing",
  status: "error"
});

// Bad - exposing internal details
return res.status(500).json({
  error: err.message,
  stack: err.stack,
  details: err
});
``` 
# Security Guidelines

This document outlines security best practices and implementation details for the TraderInsights application.

## Overview

Security is a critical aspect of TraderInsights, especially when dealing with sensitive financial data and user information. This guide covers various security measures implemented across different layers of the application.

## Authentication and Authorization

### Authentication Implementation

TraderInsights uses Supabase for authentication, which provides secure, token-based authentication:

```typescript
// src/services/auth.ts
import { createClient } from '@supabase/supabase-js';
import { User } from '@/types/user';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  });
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user ? mapSupabaseUser(data.user) : null;
}

function mapSupabaseUser(user: any): User {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}
```

### Authorization

Role-based access control is implemented to restrict access to certain features:

```typescript
// src/hooks/useAuthorization.ts
import { useUserStore } from '@/stores/userStore';

type Role = 'admin' | 'premium' | 'basic';

export function useAuthorization() {
  const { user } = useUserStore();
  
  const hasRole = (requiredRole: Role): boolean => {
    if (!user) return false;
    
    const userRoles = user.roles || ['basic'];
    
    // Role hierarchy: admin > premium > basic
    if (requiredRole === 'basic') {
      return true; // All authenticated users have basic access
    }
    
    if (requiredRole === 'premium') {
      return userRoles.includes('premium') || userRoles.includes('admin');
    }
    
    if (requiredRole === 'admin') {
      return userRoles.includes('admin');
    }
    
    return false;
  };
  
  const canAccessFeature = (featureKey: string): boolean => {
    if (!user) return false;
    
    const featureMap: Record<string, Role> = {
      'advanced-charts': 'premium',
      'portfolio-analysis': 'premium',
      'api-integration': 'premium',
      'admin-dashboard': 'admin',
      'user-management': 'admin',
    };
    
    const requiredRole = featureMap[featureKey] || 'basic';
    return hasRole(requiredRole);
  };
  
  return {
    hasRole,
    canAccessFeature,
    isAuthenticated: !!user,
  };
}
```

### Protected Routes

Routes are protected using a higher-order component:

```typescript
// src/components/auth/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthorization } from '@/hooks/useAuthorization';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'premium' | 'basic';
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'basic' 
}: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuthorization();
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!hasRole(requiredRole)) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
}
```

## Data Security

### Secure Storage

Sensitive data is stored securely using appropriate methods:

```typescript
// src/utils/storage.ts
import { encrypt, decrypt } from '@/utils/encryption';

// For non-sensitive data
export const storage = {
  get: (key: string) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error retrieving from storage:', error);
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting to storage:', error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

// For sensitive data
export const secureStorage = {
  get: (key: string, encryptionKey: string) => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      const decryptedValue = decrypt(encryptedValue, encryptionKey);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Error retrieving from secure storage:', error);
      return null;
    }
  },
  
  set: (key: string, value: any, encryptionKey: string) => {
    try {
      const stringValue = JSON.stringify(value);
      const encryptedValue = encrypt(stringValue, encryptionKey);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error setting to secure storage:', error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from secure storage:', error);
    }
  },
};
```

### API Key Security

API keys are securely handled:

```typescript
// src/services/apiKeyManager.ts
import { secureStorage } from '@/utils/storage';

export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private encryptionKey: string;
  
  private constructor() {
    // Derive encryption key from user-specific data
    // This is a simplified example - in production, use a more robust approach
    this.encryptionKey = `${window.location.hostname}-${navigator.userAgent}`;
  }
  
  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    
    return ApiKeyManager.instance;
  }
  
  public storeApiKey(service: string, apiKey: string): void {
    secureStorage.set(`apiKey_${service}`, apiKey, this.encryptionKey);
  }
  
  public getApiKey(service: string): string | null {
    return secureStorage.get(`apiKey_${service}`, this.encryptionKey);
  }
  
  public removeApiKey(service: string): void {
    secureStorage.remove(`apiKey_${service}`);
  }
  
  public clearAllApiKeys(): void {
    const services = ['polygon', 'alphaVantage', 'webull'];
    services.forEach(service => this.removeApiKey(service));
  }
}

// Usage
export const apiKeyManager = ApiKeyManager.getInstance();
```

## Input Validation and Sanitization

### Form Validation

Forms are validated using Zod:

```typescript
// src/schemas/tradeSchema.ts
import { z } from 'zod';

export const tradeSchema = z.object({
  symbol: z.string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be 10 characters or less')
    .regex(/^[A-Z0-9.]+$/, 'Symbol must contain only uppercase letters, numbers, and dots'),
  
  side: z.enum(['Long', 'Short'], {
    errorMap: () => ({ message: 'Side must be either Long or Short' }),
  }),
  
  entry_price: z.number()
    .positive('Entry price must be positive')
    .or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)),
  
  exit_price: z.number()
    .positive('Exit price must be positive')
    .or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number))
    .optional(),
  
  quantity: z.number()
    .positive('Quantity must be positive')
    .or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)),
  
  entry_date: z.date()
    .or(z.string().transform(str => new Date(str)))
    .refine(date => !isNaN(date.getTime()), {
      message: 'Invalid date format',
    }),
  
  exit_date: z.date()
    .or(z.string().transform(str => new Date(str)))
    .refine(date => !isNaN(date.getTime()), {
      message: 'Invalid date format',
    })
    .optional(),
  
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
  
  tags: z.array(z.string()).optional(),
});

export type TradeFormValues = z.infer<typeof tradeSchema>;
```

### Input Sanitization

User inputs are sanitized to prevent XSS attacks:

```typescript
// src/utils/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input.replace(/[<>]/g, '');
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  
  Object.keys(result).forEach(key => {
    const value = result[key];
    
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    }
  });
  
  return result;
}
```

## CSRF Protection

Cross-Site Request Forgery protection is implemented:

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Include cookies in requests
});

// Add CSRF token to requests
api.interceptors.request.use(config => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  
  return config;
});

export default api;
```

## XSS Prevention

Cross-Site Scripting prevention measures:

```typescript
// src/components/ui/RichText.tsx
import { sanitizeHtml } from '@/utils/sanitize';

interface RichTextProps {
  content: string;
  className?: string;
}

export function RichText({ content, className }: RichTextProps) {
  // Sanitize HTML content before rendering
  const sanitizedContent = sanitizeHtml(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
```

## Content Security Policy

A Content Security Policy is implemented to prevent various attacks:

```typescript
// server/index.ts (continued)
import helmet from 'helmet';

// ... other server setup

// Configure Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
      connectSrc: [
        "'self'",
        'https://api.polygon.io',
        'https://www.alphavantage.co',
        'https://*.supabase.co',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  })
);
```

## Secure Headers

Secure HTTP headers are set to enhance security:

```typescript
// server/index.ts (continued)
// ... other server setup

// Set secure headers
app.use(helmet.xssFilter()); // X-XSS-Protection
app.use(helmet.noSniff()); // X-Content-Type-Options
app.use(helmet.frameguard({ action: 'deny' })); // X-Frame-Options
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true })); // Strict-Transport-Security
app.use(helmet.referrerPolicy({ policy: 'same-origin' })); // Referrer-Policy
```

## Rate Limiting

Rate limiting is implemented to prevent abuse:

```typescript
// server/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// General rate limiter
export const generalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});

// Authentication rate limiter (more strict)
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later.',
});

// API key rate limiter
export const apiKeyLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 API key requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many API key requests, please try again later.',
});
```

## Dependency Security

### Dependency Scanning

Regular dependency scanning is performed to identify vulnerabilities:

```json
// package.json (scripts section)
{
  "scripts": {
    // ... other scripts
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "deps:check": "npx depcheck",
    "deps:update": "npx npm-check-updates -u && npm install"
  }
}
```

### Dependency Pinning

Dependencies are pinned to specific versions to prevent unexpected changes:

```json
// package.json (dependencies section)
{
  "dependencies": {
    "@supabase/supabase-js": "2.21.0",
    "axios": "1.3.6",
    "dompurify": "3.0.1",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-router-dom": "6.10.0",
    "zod": "3.21.4",
    "zustand": "4.3.7"
  }
}
```

## Environment Variables

Environment variables are securely handled:

```typescript
// src/utils/env.ts
interface EnvVariables {
  VITE_API_URL: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_POLYGON_API_KEY?: string;
  VITE_ALPHA_VANTAGE_API_KEY?: string;
}

export function getEnvVariables(): EnvVariables {
  const env = import.meta.env;
  
  // Validate required environment variables
  const requiredVars = ['VITE_API_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  
  for (const varName of requiredVars) {
    if (!env[varName]) {
      console.error(`Missing required environment variable: ${varName}`);
    }
  }
  
  return {
    VITE_API_URL: env.VITE_API_URL,
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
    VITE_POLYGON_API_KEY: env.VITE_POLYGON_API_KEY,
    VITE_ALPHA_VANTAGE_API_KEY: env.VITE_ALPHA_VANTAGE_API_KEY,
  };
}
```

## Error Handling

Secure error handling to prevent information leakage:

```typescript
// src/utils/errorHandler.ts
import { captureException } from '@sentry/react';

interface ErrorResponse {
  message: string;
  code?: string;
}

export function handleError(error: unknown): ErrorResponse {
  // Log the full error for debugging
  console.error('Error:', error);
  
  // Report to monitoring service
  if (error instanceof Error) {
    captureException(error);
  }
  
  // Return sanitized error for the user
  if (error instanceof Error) {
    // Custom application errors
    if ('code' in error && typeof error.code === 'string') {
      return {
        message: error.message,
        code: error.code,
      };
    }
    
    // Regular errors
    return {
      message: error.message,
    };
  }
  
  // Unknown errors
  return {
    message: 'An unexpected error occurred',
  };
}
```

## Logging and Monitoring

Secure logging practices:

```typescript
// src/utils/logger.ts
import { getEnvVariables } from '@/utils/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;
  
  private constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    
    return Logger.instance;
  }
  
  public debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...this.sanitizeArgs(args));
    }
  }
  
  public info(message: string, ...args: any[]): void {
    console.info(`[INFO] ${message}`, ...this.sanitizeArgs(args));
  }
  
  public warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...this.sanitizeArgs(args));
  }
  
  public error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...this.sanitizeArgs(args));
  }
  
  private sanitizeArgs(args: any[]): any[] {
    return args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        // Deep clone to avoid modifying the original
        const sanitized = JSON.parse(JSON.stringify(arg));
        
        // Redact sensitive fields
        this.redactSensitiveFields(sanitized);
        
        return sanitized;
      }
      
      return arg;
    });
  }
  
  private redactSensitiveFields(obj: Record<string, any>): void {
    const sensitiveFields = [
      'password', 'token', 'apiKey', 'secret', 'credential',
      'credit_card', 'ssn', 'social_security', 'auth',
    ];
    
    Object.keys(obj).forEach(key => {
      // Check if the key contains any sensitive field name
      const isSensitive = sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );
      
      if (isSensitive) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.redactSensitiveFields(obj[key]);
      }
    });
  }
}

export const logger = Logger.getInstance();
```

## Security Best Practices

### Frontend Security Best Practices

1. **Never Trust User Input**: Always validate and sanitize user input
2. **Use Content Security Policy**: Implement CSP to prevent XSS attacks
3. **Implement Proper Authentication**: Use secure authentication methods
4. **Secure API Calls**: Use HTTPS and proper authentication for API calls
5. **Minimize Use of localStorage**: Avoid storing sensitive data in localStorage
6. **Implement CSRF Protection**: Use CSRF tokens for state-changing operations
7. **Regular Dependency Updates**: Keep dependencies updated to patch vulnerabilities
8. **Secure Form Handling**: Use proper validation and sanitization for forms
9. **Avoid Exposing Sensitive Information**: Don't expose API keys or secrets in client-side code
10. **Implement Proper Error Handling**: Don't expose sensitive information in error messages

### Backend Security Best Practices

1. **Use HTTPS**: Always use HTTPS for all communications
2. **Implement Rate Limiting**: Prevent abuse with rate limiting
3. **Secure Headers**: Use secure HTTP headers
4. **Input Validation**: Validate all inputs on the server side
5. **Proper Authentication and Authorization**: Implement proper auth mechanisms
6. **Secure Password Storage**: Use bcrypt or Argon2 for password hashing
7. **Database Security**: Use parameterized queries to prevent SQL injection
8. **API Security**: Implement proper API authentication and authorization
9. **Logging and Monitoring**: Implement secure logging and monitoring
10. **Regular Security Audits**: Conduct regular security audits

## Security Testing

### Automated Security Testing

Automated security testing is implemented:

```json
// package.json (scripts section)
{
  "scripts": {
    // ... other scripts
    "security:audit": "npm audit",
    "security:snyk": "npx snyk test",
    "security:lint": "npx eslint --config .eslintrc.security.js src/",
    "security:test": "npm run security:audit && npm run security:snyk && npm run security:lint"
  }
}
```

### Manual Security Testing

Regular manual security testing is performed:

1. **Penetration Testing**: Regular penetration testing by security experts
2. **Code Reviews**: Security-focused code reviews
3. **Vulnerability Scanning**: Regular vulnerability scanning
4. **Security Audits**: Regular security audits

## Incident Response

A security incident response plan is in place:

1. **Identification**: Identify the security incident
2. **Containment**: Contain the incident to prevent further damage
3. **Eradication**: Remove the cause of the incident
4. **Recovery**: Restore systems to normal operation
5. **Lessons Learned**: Learn from the incident to prevent future occurrences

## Future Improvements

1. **Implement Two-Factor Authentication**: Add 2FA for enhanced security
2. **Security Headers Audit**: Regularly audit security headers
3. **Implement Security Monitoring**: Add real-time security monitoring
4. **Regular Security Training**: Provide regular security training for developers
5. **Implement Security Bounty Program**: Encourage security researchers to find vulnerabilities 
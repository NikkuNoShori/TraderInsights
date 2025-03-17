# Deployment Guide

This document outlines the deployment procedures and configurations for the TraderInsights application.

## Overview

TraderInsights is designed to be deployed in various environments, from development to production. This guide covers the deployment process, environment configurations, and best practices for each deployment scenario.

## Prerequisites

Before deploying TraderInsights, ensure you have the following:

1. Node.js (v16.x or later)
2. npm (v8.x or later) or yarn (v1.22.x or later)
3. Access to the deployment environment (development, staging, or production)
4. Required environment variables and API keys
5. Database access credentials

## Environment Variables

TraderInsights requires the following environment variables:

```bash
# API URLs
VITE_API_URL=https://api.example.com
VITE_WEBSOCKET_URL=wss://ws.example.com

# Authentication
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# External APIs
VITE_POLYGON_API_KEY=your-polygon-api-key
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

# Feature Flags
VITE_ENABLE_ADVANCED_CHARTS=true
VITE_ENABLE_REAL_TIME_DATA=true

# Analytics
VITE_ANALYTICS_ID=your-analytics-id

# Logging
VITE_LOG_LEVEL=info
VITE_SENTRY_DSN=your-sentry-dsn
```

### Environment Variable Management

For local development, create a `.env.local` file in the project root:

```bash
# .env.local
VITE_API_URL=http://localhost:3001
VITE_WEBSOCKET_URL=ws://localhost:3001
# ... other variables
```

For production, set environment variables in your deployment platform (Vercel, Netlify, AWS, etc.).

## Build Process

### Development Build

For local development:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

For production deployment:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

The production build outputs to the `dist` directory, which can be deployed to any static hosting service.

## Deployment Platforms

### Vercel Deployment

TraderInsights can be deployed to Vercel with the following steps:

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy the application:

```bash
# For development/preview deployment
vercel

# For production deployment
vercel --prod
```

4. Configure environment variables in the Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all required environment variables
   - Redeploy the application if necessary

### Netlify Deployment

To deploy to Netlify:

1. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Login to Netlify:

```bash
netlify login
```

3. Deploy the application:

```bash
# Build the application
npm run build

# Deploy to Netlify
netlify deploy --dir=dist --prod
```

4. Configure environment variables in the Netlify dashboard:
   - Go to Site Settings > Build & Deploy > Environment
   - Add all required environment variables
   - Trigger a new deployment

### AWS S3 and CloudFront Deployment

For AWS deployment:

1. Build the application:

```bash
npm run build
```

2. Deploy to S3:

```bash
# Install AWS CLI if not already installed
pip install awscli

# Configure AWS credentials
aws configure

# Create S3 bucket (if it doesn't exist)
aws s3 mb s3://trader-insights-app

# Upload files to S3
aws s3 sync dist/ s3://trader-insights-app --delete
```

3. Configure CloudFront:
   - Create a CloudFront distribution pointing to the S3 bucket
   - Configure HTTPS and custom domain if needed
   - Set up proper cache control headers

### Docker Deployment

TraderInsights can also be deployed using Docker:

1. Create a Dockerfile in the project root:

```dockerfile
# Dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create an nginx configuration file:

```nginx
# nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

3. Build and run the Docker container:

```bash
# Build the Docker image
docker build -t trader-insights:latest .

# Run the container
docker run -p 8080:80 -e VITE_API_URL=https://api.example.com trader-insights:latest
```

## CI/CD Pipeline

### GitHub Actions

TraderInsights uses GitHub Actions for CI/CD. Here's an example workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist

  deploy-production:
    needs: build-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitLab CI/CD

For GitLab, use the following configuration:

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "16"

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run lint
    - npm test

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy-production:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - npm install -g netlify-cli
    - netlify deploy --dir=dist --prod --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
  only:
    - main
```

## Database Migrations

TraderInsights uses Supabase for database management. To handle migrations:

1. Install Supabase CLI:

```bash
npm install -g supabase
```

2. Login to Supabase:

```bash
supabase login
```

3. Run migrations:

```bash
# Apply migrations
supabase db push

# Generate migration from changes
supabase db diff -f migration_name
```

## Monitoring and Logging

### Sentry Integration

TraderInsights uses Sentry for error tracking:

```typescript
// src/main.tsx
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import App from './App';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.2,
    environment: import.meta.env.MODE,
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### Logging Configuration

Configure logging based on the environment:

```typescript
// src/utils/logger.ts
import * as Sentry from '@sentry/react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  
  private constructor() {
    this.logLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';
  }
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    
    return Logger.instance;
  }
  
  public debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
  
  public info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }
  
  public warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
      
      if (import.meta.env.PROD) {
        Sentry.captureMessage(message, Sentry.Severity.Warning);
      }
    }
  }
  
  public error(message: string, error?: Error, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error, ...args);
      
      if (import.meta.env.PROD && error) {
        Sentry.captureException(error);
      }
    }
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    
    return levels[level] >= levels[this.logLevel];
  }
}

export const logger = Logger.getInstance();
```

## Performance Monitoring

### Web Vitals

TraderInsights tracks Web Vitals for performance monitoring:

```typescript
// src/utils/webVitals.ts
import { ReportHandler } from 'web-vitals';

export function reportWebVitals(onPerfEntry?: ReportHandler) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
}

// Usage in main.tsx
import { reportWebVitals } from './utils/webVitals';

// Send to Google Analytics
reportWebVitals(({ name, delta, id }) => {
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      non_interaction: true,
    });
  }
});
```

## Scaling Considerations

### CDN Configuration

For production deployments, configure a CDN:

1. Set proper cache headers:

```nginx
# Example Nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

location ~* \.(html)$ {
    expires 1h;
    add_header Cache-Control "public, no-transform";
}
```

2. Configure CDN in your hosting provider:
   - Vercel and Netlify provide built-in CDN
   - For AWS, configure CloudFront
   - For custom setups, consider Cloudflare or Fastly

### Load Balancing

For API servers, implement load balancing:

```yaml
# Example Docker Compose configuration with load balancing
version: '3'

services:
  api:
    build: ./api
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
```

## Rollback Procedures

In case of deployment issues, follow these rollback procedures:

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to a specific deployment
vercel alias set <deployment-url> <production-url>
```

### Netlify Rollback

1. Go to the Netlify dashboard
2. Navigate to the Deploys section
3. Find the previous working deployment
4. Click "Publish deploy"

### Manual Rollback

1. Identify the last working version
2. Check out that version in your repository
3. Rebuild and redeploy the application

## Security Considerations

### SSL Configuration

Always use HTTPS in production:

1. Configure SSL certificates:
   - Use Let's Encrypt for free certificates
   - Configure auto-renewal

2. Set up HSTS headers:

```nginx
# Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Environment Variable Security

1. Never commit `.env` files to version control
2. Use environment-specific variables
3. Rotate sensitive credentials regularly

## Deployment Checklist

Before deploying to production, verify the following:

1. **Build Verification**
   - [ ] Application builds without errors
   - [ ] All tests pass
   - [ ] Linting passes

2. **Environment Configuration**
   - [ ] All required environment variables are set
   - [ ] API endpoints are correctly configured
   - [ ] Feature flags are properly set

3. **Performance**
   - [ ] Bundle size is optimized
   - [ ] Images are optimized
   - [ ] Lazy loading is implemented for routes

4. **Security**
   - [ ] HTTPS is enabled
   - [ ] Content Security Policy is configured
   - [ ] Sensitive data is not exposed

5. **Accessibility**
   - [ ] Application passes accessibility checks
   - [ ] Keyboard navigation works correctly
   - [ ] Screen readers can interpret the content

6. **Browser Compatibility**
   - [ ] Application works in all target browsers
   - [ ] Responsive design functions correctly
   - [ ] Fallbacks are in place for unsupported features

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check for syntax errors in the code
   - Verify that all dependencies are installed
   - Check for environment variable issues

2. **Runtime Errors**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check for CORS issues

3. **Performance Issues**
   - Analyze bundle size
   - Check for memory leaks
   - Verify CDN configuration

### Debugging Production Issues

1. Use Sentry for error tracking
2. Implement logging with appropriate levels
3. Use browser developer tools for client-side debugging

## Maintenance

### Regular Updates

1. Keep dependencies updated:

```bash
# Check for outdated dependencies
npm outdated

# Update dependencies
npm update
```

2. Apply security patches promptly
3. Review and update deployment configurations regularly

### Backup Procedures

1. Database backups:

```bash
# Supabase backup
supabase db dump -f backup.sql
```

2. Configuration backups:
   - Back up environment variables
   - Back up deployment configurations

## Future Improvements

1. **Containerization**: Fully containerize the application with Docker
2. **Kubernetes**: Implement Kubernetes for orchestration
3. **Blue-Green Deployments**: Implement blue-green deployment strategy
4. **Canary Releases**: Implement canary releases for gradual rollouts
5. **Infrastructure as Code**: Use Terraform or AWS CDK for infrastructure management 
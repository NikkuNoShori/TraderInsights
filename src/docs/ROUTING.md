# Routing Architecture

This document outlines the routing architecture used in TraderInsights.

## Overview

TraderInsights uses React Router v6 for client-side routing. All routes are defined in `src/App.tsx`, which is the single source of truth for routing in the application.

## Route Structure

The application routes are organized into three main sections:

1. **Public Routes**
   - Accessible without authentication
   - Example: Landing page at `/`

2. **Authentication Routes**
   - Prefix: `/auth`
   - Purpose: Authentication flows such as login, password reset
   - Examples: 
     - `/auth/login`
     - `/auth/request-reset`
     - `/auth/reset-password`

3. **Protected Routes**
   - Prefix: `/app`
   - Requires authentication via `AuthGuard`
   - Examples:
     - `/app/dashboard`
     - `/app/journal`
     - `/app/performance`
     - `/app/settings/*`

## Protected Routes

All protected routes:
- Are prefixed with `/app`
- Are wrapped in the `ProtectedLayout` component which:
  - Verifies authentication status
  - Applies the main application layout
  - Resets filters when navigating

## Navigation Components

The main navigation components are:

1. `MainNav.tsx`: Primary navigation for the application
   - Links to all main sections of the app
   - All links include the `/app` prefix for protected routes

2. `SettingsNav.tsx`: Navigation for settings pages
   - Used within the settings section

## State Management and Routing

While we use Zustand for state management, routing is handled independently by React Router. Zustand stores related to navigation:

- `navStore.ts`: Manages navigation UI state (sidebar collapsed state)
- `navigationStore.ts`: Tracks navigation state (like whether we're navigating)

These stores do not define routes themselves.

## Handling Route Changes

When adding new routes:
1. Add the route to `App.tsx`
2. Update navigation components if needed
3. Create corresponding view components

## Path Consistency

All links to internal pages should use the correct prefixes:
- Use `/auth/*` for authentication pages
- Use `/app/*` for all protected routes

This ensures that the routing system remains consistent and predictable. 
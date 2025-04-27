# TraderInsights Codebase Structure

## Overview

This document outlines the structure and organization of the TraderInsights codebase. The project follows a modular, feature-based architecture with clear separation of concerns.

## Directory Structure

```
src/
├── app/                    # Next.js app directory (if using Next.js)
├── components/            # Reusable UI components
│   ├── common/           # Shared components
│   ├── layout/           # Layout components
│   ├── theme/            # Theme-related components
│   └── [feature]/        # Feature-specific components
├── config/               # Configuration files
├── docs/                 # Project documentation
├── hooks/                # Custom React hooks
├── lib/                  # Third-party library integrations
│   ├── snaptrade/       # SnapTrade SDK integration
│   └── [other-libs]/    # Other library integrations
├── middleware/           # Request/response middleware
├── pages/               # Page components
├── providers/           # Context providers
├── routes/              # Route definitions
├── server/              # Server-side code
├── services/            # Business logic services
├── stores/              # State management
│   ├── theme/          # Theme store
│   └── [other-stores]/ # Other stores
├── styles/              # Global styles and theme
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── views/               # View components
├── App.tsx             # Root application component
├── main.tsx            # Application entry point
└── vite-env.d.ts       # Vite environment declarations
```

## Directory Details

### `/app`
- Next.js app directory (if using Next.js)
- Contains route definitions and page components
- Follows Next.js 13+ app directory conventions

### `/components`
- Reusable UI components
- Organized by feature and type
- Follows atomic design principles
- Each component should be self-contained

### `/config`
- Application configuration
- Environment variables
- Feature flags
- API endpoints

### `/docs`
- Project documentation
- Architecture decisions
- API documentation
- Development guides

### `/hooks`
- Custom React hooks
- Shared logic between components
- State management hooks
- API integration hooks

### `/lib`
- Third-party library integrations
- SDK implementations
- API clients
- External service integrations

### `/middleware`
- Request/response middleware
- Authentication middleware
- Error handling middleware
- Logging middleware

### `/pages`
- Page components
- Route components
- Layout components
- Error pages

### `/providers`
- Context providers
- Theme providers
- Authentication providers
- Feature providers

### `/routes`
- Route definitions
- Route guards
- Route configurations
- Navigation helpers

### `/server`
- Server-side code
- API routes
- Server utilities
- Database operations

### `/services`
- Business logic services
- API services
- Data processing
- Business rules

### `/stores`
- State management
- Theme store
- User store
- Application state

### `/styles`
- Global styles
- Theme variables
- CSS utilities
- Animation definitions

### `/types`
- TypeScript type definitions
- API types
- Component props
- Utility types

### `/utils`
- Utility functions
- Helper methods
- Data transformations
- Common operations

### `/views`
- View components
- Page sections
- Feature views
- Layout views

## File Naming Conventions

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase (e.g., `UserTypes.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- Tests: `.test.ts` or `.spec.ts` suffix
- Styles: `.module.css` for CSS modules

## Import/Export Rules

1. Use absolute imports from `src/`
2. Export named exports for components
3. Use default exports for single-purpose files
4. Group related exports in index files
5. Avoid circular dependencies

## Component Organization

```
components/
├── [Feature]/
│   ├── index.ts
│   ├── [Component].tsx
│   ├── [Component].test.tsx
│   ├── [Component].module.css
│   └── types.ts
└── common/
    ├── Button/
    ├── Input/
    └── ...
```

## State Management

- Use Zustand for global state
- Use React Context for theme and auth
- Use local state for component-specific state
- Use React Query for server state

## Testing Structure

```
__tests__/
├── components/
├── hooks/
├── utils/
└── integration/
```

## Documentation

- Each major feature should have a README
- Complex components should be documented
- API integrations need documentation
- Configuration changes should be documented

## Best Practices

1. Keep components small and focused
2. Use TypeScript for type safety
3. Follow the single responsibility principle
4. Write tests for critical functionality
5. Document complex logic
6. Use proper error handling
7. Follow accessibility guidelines
8. Optimize for performance

## Migration Guidelines

When adding new features:
1. Create appropriate directories
2. Follow naming conventions
3. Add necessary documentation
4. Update relevant index files
5. Add tests
6. Update type definitions

## References

- [Project Conventions](../CONVENTIONS.md)
- [Component Guidelines](../COMPONENT_GUIDELINES.md)
- [Testing Guidelines](../TESTING.md)
- [Documentation Guidelines](../DOCUMENTATION_UPDATES.md)
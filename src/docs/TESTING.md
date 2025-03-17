# Testing Strategy

This document outlines the testing strategy for TraderInsights, including testing approaches, tools, and best practices.

## Overview

TraderInsights implements a comprehensive testing strategy with multiple layers:

1. **Unit Testing**: Testing individual components and functions
2. **Integration Testing**: Testing interactions between components
3. **End-to-End Testing**: Testing complete user flows
4. **Visual Testing**: Ensuring UI consistency

## Testing Tools

### Core Testing Libraries

- **Vitest**: Primary test runner and framework
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking
- **Cypress**: End-to-end testing
- **Playwright**: Cross-browser testing

### Testing Utilities

- **@testing-library/user-event**: Simulating user interactions
- **@testing-library/jest-dom**: Custom DOM matchers
- **vitest-axe**: Accessibility testing
- **vitest-coverage**: Code coverage reporting

## Unit Testing

### Component Testing

Components are tested using React Testing Library to focus on user behavior rather than implementation details:

```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeDisabled();
  });
});
```

### Hook Testing

Custom hooks are tested using React Testing Library's `renderHook`:

```typescript
// Example hook test
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });

  it('should decrement counter', () => {
    const { result } = renderHook(() => useCounter(10));
    act(() => {
      result.current.decrement();
    });
    expect(result.current.count).toBe(9);
  });
});
```

### Utility Function Testing

Pure utility functions are tested with straightforward unit tests:

```typescript
// Example utility function test
import { formatCurrency } from '@/utils/formatters';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1000.5)).toBe('$1,000.50');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-1000)).toBe('-$1,000.00');
    expect(formatCurrency(-1000.5)).toBe('-$1,000.50');
  });

  it('handles zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
```

## Integration Testing

Integration tests verify that different parts of the application work together correctly.

### Store Integration

Testing Zustand stores with components:

```typescript
// Example store integration test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@/stores/authStore';
import { ProfilePage } from '@/pages/ProfilePage';

// Reset the store before each test
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    profile: null,
    isInitialized: true,
    isLoading: false,
    error: null,
  });
});

describe('ProfilePage with AuthStore', () => {
  it('shows login prompt when user is not authenticated', () => {
    render(<ProfilePage />);
    expect(screen.getByText(/please log in to view your profile/i)).toBeInTheDocument();
  });

  it('shows profile data when user is authenticated', () => {
    // Set up the store with a mock user
    useAuthStore.setState({
      user: { id: '123', email: 'test@example.com' },
      profile: { name: 'Test User', avatar: 'avatar.jpg' },
      isInitialized: true,
      isLoading: false,
      error: null,
    });

    render(<ProfilePage />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByAltText('Test User')).toHaveAttribute('src', 'avatar.jpg');
  });
});
```

### API Integration

Testing components that interact with APIs using MSW:

```typescript
// Example API integration test
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { TradeList } from '@/components/trades/TradeList';

// Set up MSW server
const server = setupServer(
  rest.get('/api/trades', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: '1', symbol: 'AAPL', quantity: 10, price: 150 },
        { id: '2', symbol: 'MSFT', quantity: 5, price: 300 },
      ])
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Set up QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('TradeList', () => {
  it('displays trades from API', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TradeList />
      </QueryClientProvider>
    );

    // Initially shows loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for trades to load
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('MSFT')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    // Override the handler to return an error
    server.use(
      rest.get('/api/trades', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    render(
      <QueryClientProvider client={queryClient}>
        <TradeList />
      </QueryClientProvider>
    );

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/error loading trades/i)).toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing

End-to-end tests verify complete user flows using Cypress.

### Cypress Tests

```typescript
// Example Cypress test
describe('Authentication Flow', () => {
  it('allows a user to sign in', () => {
    cy.visit('/login');
    
    // Fill in login form
    cy.findByLabelText(/email/i).type('test@example.com');
    cy.findByLabelText(/password/i).type('password123');
    cy.findByRole('button', { name: /sign in/i }).click();
    
    // Verify successful login
    cy.url().should('include', '/dashboard');
    cy.findByText(/welcome back/i).should('be.visible');
  });
  
  it('shows error message for invalid credentials', () => {
    cy.visit('/login');
    
    // Fill in login form with invalid credentials
    cy.findByLabelText(/email/i).type('test@example.com');
    cy.findByLabelText(/password/i).type('wrongpassword');
    cy.findByRole('button', { name: /sign in/i }).click();
    
    // Verify error message
    cy.findByText(/invalid email or password/i).should('be.visible');
    cy.url().should('include', '/login');
  });
});
```

### Cross-Browser Testing

Playwright is used for cross-browser testing:

```typescript
// Example Playwright test
import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('displays dashboard widgets', async ({ page }) => {
    // Verify dashboard widgets are displayed
    await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="trade-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="market-overview"]')).toBeVisible();
  });

  test('allows widget customization', async ({ page }) => {
    // Open widget settings
    await page.click('[data-testid="widget-settings-button"]');
    
    // Toggle a widget off
    await page.click('[data-testid="toggle-trade-list"]');
    
    // Save settings
    await page.click('[data-testid="save-settings-button"]');
    
    // Verify widget is hidden
    await expect(page.locator('[data-testid="trade-list"]')).not.toBeVisible();
  });
});
```

## Visual Testing

Visual testing ensures UI consistency across changes.

### Storybook Integration

Components are documented and tested visually using Storybook:

```typescript
// Example Storybook story
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'md',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'default',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'default',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'default',
    size: 'md',
    disabled: true,
  },
};
```

## Test Coverage

The project aims for high test coverage:

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Key user flows covered
- **End-to-End Tests**: Critical paths covered

### Coverage Reporting

Coverage reports are generated using Vitest's coverage reporter:

```bash
npm run test:coverage
```

## Testing Best Practices

### Component Testing

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it's implemented
2. **Use Role-Based Queries**: Prefer queries like `getByRole` over `getByTestId`
3. **Test Accessibility**: Ensure components are accessible
4. **Test Edge Cases**: Test loading, error, and empty states

### Integration Testing

1. **Mock External Dependencies**: Use MSW to mock API calls
2. **Test Store Interactions**: Verify components interact correctly with stores
3. **Test Form Submissions**: Verify form validation and submission

### End-to-End Testing

1. **Focus on Critical Paths**: Test the most important user flows
2. **Use Data Attributes**: Add `data-testid` attributes for E2E test selectors
3. **Test Across Browsers**: Verify functionality in multiple browsers

## Continuous Integration

Tests are run automatically in the CI pipeline:

1. **Pull Requests**: All tests run on pull requests
2. **Main Branch**: All tests run on main branch commits
3. **Coverage Reports**: Coverage reports are generated and tracked

## Future Improvements

1. **Visual Regression Testing**: Implement visual regression testing
2. **Performance Testing**: Add performance testing for critical components
3. **Accessibility Testing**: Enhance accessibility testing
4. **Load Testing**: Implement load testing for API endpoints 
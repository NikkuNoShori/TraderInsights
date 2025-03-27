# Component Guidelines

This document outlines the component architecture and guidelines for component development in TraderInsights.

## Atomic Design Structure

TraderInsights follows the Atomic Design methodology, organizing components into a hierarchical structure:

### 1. Atoms

Atoms are the basic building blocks of the UI, representing the smallest functional elements:

- Buttons
- Inputs
- Icons
- Typography elements
- Form controls

**Example:**

```tsx
// src/components/ui/button.tsx
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof buttonVariants;
    size?: keyof typeof buttonSizes;
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
```

### 2. Molecules

Molecules combine atoms to create more complex UI elements:

- Form groups
- Card headers
- Navigation items
- Search bars

**Example:**

```tsx
// src/components/ui/FormInput.tsx
export function FormInput({
  label,
  name,
  register,
  errors,
  type = "text",
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        className={cn(
          "w-full rounded-md border border-border bg-input px-3 py-2",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          errors?.[name] && "border-error focus:ring-error/30"
        )}
        {...register(name)}
        {...props}
      />
      {errors?.[name] && (
        <p className="text-sm text-error">{errors[name]?.message}</p>
      )}
    </div>
  );
}
```

### 3. Organisms

Organisms are complex UI components composed of molecules and atoms:

- Forms
- Navigation menus
- Data tables
- Card layouts

**Example:**

```tsx
// src/components/trades/TradeForm.tsx
export function TradeForm({ onSubmit, initialData }: TradeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Symbol"
          name="symbol"
          register={register}
          errors={errors}
        />
        <FormInput
          label="Quantity"
          name="quantity"
          type="number"
          register={register}
          errors={errors}
        />
        {/* More form fields */}
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Reset
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
```

### 4. Templates

Templates define the layout structure for pages:

- Dashboard layouts
- Authentication layouts
- Settings layouts

**Example:**

```tsx
// src/components/layout/Layout.tsx
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
```

### 5. Pages

Pages are specific instances of templates with real content:

- Dashboard page
- Trading journal page
- Settings page

**Example:**

```tsx
// src/views/Dashboard.tsx
export default function Dashboard() {
  const { user } = useAuthStore();
  const { trades, fetchTrades } = useTradeStore();
  const { filters } = useFilterStore();
  const filteredTrades = useFilteredTrades(trades);

  useEffect(() => {
    if (user?.id) {
      fetchTrades(user.id);
    }
  }, [user?.id, fetchTrades]);

  return (
    <div className="flex-grow p-6">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Dashboard" subtitle="Overview of your trading performance" />
        <FilterBar />
      </div>
      <div className="space-y-6">
        <DashboardCards trades={filteredTrades} timeframe={filters.timeframe || "1M"} />
      </div>
    </div>
  );
}
```

## Component Design Principles

### 1. Composition Over Inheritance

Prefer composing components from smaller ones rather than using inheritance:

```tsx
// Good: Composition
function Card({ title, children }) {
  return (
    <div className="card">
      <CardHeader>{title}</CardHeader>
      <CardContent>{children}</CardContent>
    </div>
  );
}

// Bad: Inheritance
class CustomCard extends BaseCard {
  render() {
    return (
      <div className="custom-card">
        {super.render()}
      </div>
    );
  }
}
```

### 2. Props for Configuration

Use props to configure components rather than global state or context when possible:

```tsx
// Good: Props for configuration
<Button variant="primary" size="large" disabled={isLoading}>
  Submit
</Button>

// Bad: Global configuration
<Button>Submit</Button> // Uses global theme configuration
```

### 3. Container/Presentational Pattern

Separate data fetching and business logic from presentation:

```tsx
// Container component
function TradeListContainer() {
  const { trades, isLoading } = useTradeStore();
  
  if (isLoading) return <LoadingSpinner />;
  
  return <TradeList trades={trades} />;
}

// Presentational component
function TradeList({ trades }) {
  return (
    <ul>
      {trades.map(trade => (
        <TradeListItem key={trade.id} trade={trade} />
      ))}
    </ul>
  );
}
```

### 4. Consistent Naming Conventions

Follow consistent naming conventions:

- **Components**: PascalCase (e.g., `Button`, `TradeList`)
- **Files**: Match component name (e.g., `Button.tsx`, `TradeList.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTradeStore`, `useFilteredTrades`)
- **Props**: camelCase (e.g., `onClick`, `isLoading`)

### 5. Type Safety

Use TypeScript for type safety:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}

function Button({ variant = 'primary', size = 'medium', isLoading, ...props }: ButtonProps) {
  // Implementation
}
```

## Component Documentation

Each component should include:

1. **Interface/Type Definitions**: Define props and state types
2. **JSDoc Comments**: Document component purpose and usage
3. **Default Props**: Set sensible defaults

Example:

```tsx
/**
 * MetricCard displays a single metric with a label, value, and optional icon.
 * Used for displaying key performance indicators on the dashboard.
 */
interface MetricCardProps {
  /** The title or label for the metric */
  label: string;
  /** The value to display */
  value: string | number;
  /** Optional description or context */
  description?: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Optional trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Optional trend value */
  trendValue?: string | number;
}

export function MetricCard({
  label,
  value,
  description,
  icon,
  trend = 'neutral',
  trendValue,
}: MetricCardProps) {
  // Implementation
}
```

## Best Practices

1. **Keep Components Small**: Focus on a single responsibility
2. **Optimize Renders**: Use memoization for expensive components
3. **Consistent Styling**: Use the design system and avoid inline styles
4. **Accessibility**: Ensure components are accessible
5. **Error Handling**: Use error boundaries for component-level errors
6. **Testing**: Write tests for components
7. **Performance**: Avoid unnecessary re-renders

## Component Organization

Components are organized by feature and type:

```
src/
├── components/
│   ├── auth/         # Authentication components
│   ├── dashboard/    # Dashboard components
│   ├── layout/       # Layout components
│   ├── trades/       # Trade-related components
│   ├── ui/           # Reusable UI components
│   └── ...
```

## Styling Guidelines

1. **Use Tailwind CSS**: Prefer utility classes over custom CSS
2. **Theme Variables**: Use theme variables for colors, spacing, etc.
3. **Dark Mode Support**: Ensure components work in both light and dark mode
4. **Responsive Design**: Design components to work on all screen sizes
5. **Animation**: Use consistent animation patterns 
# Component Guidelines

This document outlines the component architecture and guidelines for component development in TraderInsights.

## Atomic Design Structure

TraderInsights follows the Atomic Design methodology, organizing components into a hierarchical structure:

### 1. Atoms

Atoms are the basic building blocks of the UI, representing the smallest functional elements:

- Buttons
- Inputs
- Icons
- Typography elements
- Form controls

**Example:**

```tsx
// src/components/ui/button.tsx
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof buttonVariants;
    size?: keyof typeof buttonSizes;
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
```

### 2. Molecules

Molecules combine atoms to create more complex UI elements:

- Form groups
- Card headers
- Navigation items
- Search bars

**Example:**

```tsx
// src/components/ui/FormInput.tsx
export function FormInput({
  label,
  name,
  register,
  errors,
  type = "text",
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        className={cn(
          "w-full rounded-md border border-border bg-input px-3 py-2",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          errors?.[name] && "border-error focus:ring-error/30"
        )}
        {...register(name)}
        {...props}
      />
      {errors?.[name] && (
        <p className="text-sm text-error">{errors[name]?.message}</p>
      )}
    </div>
  );
}
```

### 3. Organisms

Organisms are complex UI components composed of molecules and atoms:

- Forms
- Navigation menus
- Data tables
- Card layouts

**Example:**

```tsx
// src/components/trades/TradeForm.tsx
export function TradeForm({ onSubmit, initialData }: TradeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Symbol"
          name="symbol"
          register={register}
          errors={errors}
        />
        <FormInput
          label="Quantity"
          name="quantity"
          type="number"
          register={register}
          errors={errors}
        />
        {/* More form fields */}
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Reset
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
```

### 4. Templates

Templates define the layout structure for pages:

- Dashboard layouts
- Authentication layouts
- Settings layouts

**Example:**

```tsx
// src/components/layout/Layout.tsx
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
```

### 5. Pages

Pages are specific instances of templates with real content:

- Dashboard page
- Trading journal page
- Settings page

**Example:**

```tsx
// src/views/Dashboard.tsx
export default function Dashboard() {
  const { user } = useAuthStore();
  const { trades, fetchTrades } = useTradeStore();
  const { filters } = useFilterStore();
  const filteredTrades = useFilteredTrades(trades);

  useEffect(() => {
    if (user?.id) {
      fetchTrades(user.id);
    }
  }, [user?.id, fetchTrades]);

  return (
    <div className="flex-grow p-6">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Dashboard" subtitle="Overview of your trading performance" />
        <FilterBar />
      </div>
      <div className="space-y-6">
        <DashboardCards trades={filteredTrades} timeframe={filters.timeframe || "1M"} />
      </div>
    </div>
  );
}
```

## Component Design Principles

### 1. Composition Over Inheritance

Prefer composing components from smaller ones rather than using inheritance:

```tsx
// Good: Composition
function Card({ title, children }) {
  return (
    <div className="card">
      <CardHeader>{title}</CardHeader>
      <CardContent>{children}</CardContent>
    </div>
  );
}

// Bad: Inheritance
class CustomCard extends BaseCard {
  render() {
    return (
      <div className="custom-card">
        {super.render()}
      </div>
    );
  }
}
```

### 2. Props for Configuration

Use props to configure components rather than global state or context when possible:

```tsx
// Good: Props for configuration
<Button variant="primary" size="large" disabled={isLoading}>
  Submit
</Button>

// Bad: Global configuration
<Button>Submit</Button> // Uses global theme configuration
```

### 3. Container/Presentational Pattern

Separate data fetching and business logic from presentation:

```tsx
// Container component
function TradeListContainer() {
  const { trades, isLoading } = useTradeStore();
  
  if (isLoading) return <LoadingSpinner />;
  
  return <TradeList trades={trades} />;
}

// Presentational component
function TradeList({ trades }) {
  return (
    <ul>
      {trades.map(trade => (
        <TradeListItem key={trade.id} trade={trade} />
      ))}
    </ul>
  );
}
```

### 4. Consistent Naming Conventions

Follow consistent naming conventions:

- **Components**: PascalCase (e.g., `Button`, `TradeList`)
- **Files**: Match component name (e.g., `Button.tsx`, `TradeList.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTradeStore`, `useFilteredTrades`)
- **Props**: camelCase (e.g., `onClick`, `isLoading`)

### 5. Type Safety

Use TypeScript for type safety:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}

function Button({ variant = 'primary', size = 'medium', isLoading, ...props }: ButtonProps) {
  // Implementation
}
```

## Component Documentation

Each component should include:

1. **Interface/Type Definitions**: Define props and state types
2. **JSDoc Comments**: Document component purpose and usage
3. **Default Props**: Set sensible defaults

Example:

```tsx
/**
 * MetricCard displays a single metric with a label, value, and optional icon.
 * Used for displaying key performance indicators on the dashboard.
 */
interface MetricCardProps {
  /** The title or label for the metric */
  label: string;
  /** The value to display */
  value: string | number;
  /** Optional description or context */
  description?: string;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Optional trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Optional trend value */
  trendValue?: string | number;
}

export function MetricCard({
  label,
  value,
  description,
  icon,
  trend = 'neutral',
  trendValue,
}: MetricCardProps) {
  // Implementation
}
```

## Best Practices

1. **Keep Components Small**: Focus on a single responsibility
2. **Optimize Renders**: Use memoization for expensive components
3. **Consistent Styling**: Use the design system and avoid inline styles
4. **Accessibility**: Ensure components are accessible
5. **Error Handling**: Use error boundaries for component-level errors
6. **Testing**: Write tests for components
7. **Performance**: Avoid unnecessary re-renders

## Component Organization

Components are organized by feature and type:

```
src/
├── components/
│   ├── auth/         # Authentication components
│   ├── dashboard/    # Dashboard components
│   ├── layout/       # Layout components
│   ├── trades/       # Trade-related components
│   ├── ui/           # Reusable UI components
│   └── ...
```

## Styling Guidelines

1. **Use Tailwind CSS**: Prefer utility classes over custom CSS
2. **Theme Variables**: Use theme variables for colors, spacing, etc.
3. **Dark Mode Support**: Ensure components work in both light and dark mode
4. **Responsive Design**: Design components to work on all screen sizes
5. **Animation**: Use consistent animation patterns 
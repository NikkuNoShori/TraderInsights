# TraderInsights Full Project Blueprint

This document provides a **step-by-step, self-contained guide** to reconstruct the entire TraderInsights application from scratch. It assumes you have **no codebase, no files, and no prior setup**. Follow each section in order to create all required files, directories, and configurations.

---

## 1. Directory Structure

Create the following directory tree:

```
TraderInsights/
├── dist/
│   └── assets/
├── docs/
│   └── implementation/
│   └── snaptrade/
├── public/
├── scripts/
├── src/
│   ├── app/
│   │   └── broker-connection/
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── broker/
│   │   ├── changelog/
│   │   ├── charts/
│   │   ├── common/
│   │   ├── dashboard/
│   │   │   └── __tests__/
│   │   │       └── __mocks__/
│   │   ├── hoc/
│   │   ├── journal/
│   │   ├── layout/
│   │   ├── market/
│   │   ├── monitoring/
│   │   ├── navigation/
│   │   ├── portfolio/
│   │   ├── reporting/
│   │   ├── routing/
│   │   ├── settings/
│   │   ├── test/
│   │   ├── theme/
│   │   ├── trades/
│   │   ├── transactions/
│   │   ├── ui/
│   │   └── watchlist/
│   ├── config/
│   ├── docs/
│   │   └── implementation/
│   │   └── snaptrade/
│   ├── hooks/
│   ├── lib/
│   │   ├── services/
│   │   ├── snaptrade/
│   │   │   └── __tests__/
│   │   ├── supabase/
│   │   ├── theme/
│   │   └── utils/
│   ├── middleware/
│   ├── pages/
│   │   ├── api/
│   │   │   └── snaptrade/
│   │   └── broker-callback/
│   ├── providers/
│   ├── routes/
│   │   └── api/
│   ├── server/
│   │   ├── api/
│   │   │   ├── snaptrade/
│   │   │   └── webhooks/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── services/
│   ├── stores/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   └── views/
│       ├── admin/
│       ├── analysis/
│       ├── api/
│       │   └── auth/
│       ├── auth/
│       ├── reports/
│       ├── settings/
│       └── TradingJournal/
│           ├── components/
│           └── hooks/
├── supabase/
│   ├── .branches/
│   ├── .temp/
│   ├── backup_migrations/
│   ├── functions/
│   │   ├── snaptrade-accounts/
│   │   │   └── deno.json
│   │   ├── snaptrade-auth/
│   │   │   └── deno.json
│   │   ├── snaptrade-brokers/
│   │   │   └── deno.json
│   │   ├── snaptrade-register/
│   │   ├── snaptrade-sync/
│   │   └── snaptrade-trading/
│   │       └── deno.json
│   ├── migrations/
│   │   ├── backup_old/
│   │   └── current/
│   ├── supabase/
│   │   └── migrations/
│   └── utils/
├── .cursorignore
├── .cursorrules
├── .env
├── .env.example
├── .env.local
├── .gitignore
├── components.json
├── DEVELOPMENT.md
├── eslint.config.js
├── git-cheatsheet.md
├── index.html
├── jest.config.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── RECREATE.md
├── styles.css
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.server.json
└── vite.config.ts
```

---

## 2. Initialize npm and Install Dependencies

Create a `package.json` file with the following content:

```json
{
  "name": "traderinsights",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.1",
    "zustand": "^4.4.1",
    "@supabase/supabase-js": "^2.39.5",
    "snaptrade-typescript-sdk": "^9.0.97"
  },
  "devDependencies": {
    "@types/react": "^18.2.14",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.7.5",
    "@typescript-eslint/parser": "^6.7.5",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.49.0",
    "jest": "^29.6.1",
    "postcss": "^8.4.27",
    "prettier": "^3.0.3",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.2.2",
    "vite": "^4.4.9"
  }
}
```

Install dependencies:

```sh
npm install
```

---

## 3. Environment Variables

Create the following files:

- `.env.example` — Template for required environment variables
- `.env.local` — Your local environment variables (copy from `.env.example` and fill in values)

Example `.env.example`:
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SNAPTRADE_CLIENT_ID=
SNAPTRADE_CONSUMER_KEY=
```

---

## 4. Theming and Styling

### 4.1 Tailwind Configuration
Create `tailwind.config.js`:
```js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Reference CSS variables for theme colors
        default: 'var(--color-default)',
        primary: 'var(--color-primary)',
        // ...add more as needed
      }
    }
  },
  plugins: []
};
```


### 4.3 Main Stylesheet
Create `styles.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './src/styles/theme.css';
/* Add custom base styles, components, and utilities below */
```

---

## 5. State Management (Theme Example)

Create `src/stores/themeStore.ts`:
```ts
import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  setTheme: (theme) => {
    set({ theme });
    updateThemeClass(theme);
  },
  isDark: false
}));

function updateThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
```

---

## 6. Routing

Create `src/App.tsx`:
```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedLayout from './components/layout/ProtectedLayout';
import AuthGuard from './components/AuthGuard';
import MainNav from './components/navigation/MainNav';
// ...import your views

const App = () => (
  <Router>
    <MainNav />
    <Routes>
      <Route path="/auth/*" element={<AuthRoutes />} />
      <Route
        path="/app/*"
        element={
          <ProtectedLayout>
            <AuthGuard>
              <AppRoutes />
            </AuthGuard>
          </ProtectedLayout>
        }
      />
      {/* Add more routes as needed */}
    </Routes>
  </Router>
);

export default App;
```

- All navigation links must match these routes.
- Protected routes go under `/app/*` and use `ProtectedLayout` and `AuthGuard`.

---

## 7. UI Components

Create reusable, theme-aware UI components in `src/components/ui/`.

Example: `src/components/ui/Button.tsx`
```tsx
import React from 'react';
import { useThemeStore } from '../../stores/themeStore';

export const Button = ({ children, ...props }) => {
  const { isDark } = useThemeStore();
  return (
    <button
      className="bg-primary text-default dark:bg-default dark:text-primary px-4 py-2 rounded"
      {...props}
    >
      {children}
    </button>
  );
};
```

- Use Tailwind classes and CSS variables only.
- Never hardcode colors or use inline styles.

---

## 8. Navigation Components

Create `src/components/navigation/MainNav.tsx`:
```tsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const MainNav = () => (
  <nav className="bg-default p-4 flex gap-4">
    <NavLink to="/app/dashboard">Dashboard</NavLink>
    <NavLink to="/app/journal">Journal</NavLink>
    <NavLink to="/app/settings">Settings</NavLink>
    {/* Add more links as needed */}
  </nav>
);

export default MainNav;
```

- All navigation links must match the routes in `App.tsx`.

---

## 9. Settings Components

Create settings-related components in `src/components/settings/` and `src/views/settings/`.

Example: `src/components/settings/ThemeSelector.tsx`
```tsx
import React from 'react';
import { useThemeStore } from '../../stores/themeStore';

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();
  return (
    <select value={theme} onChange={e => setTheme(e.target.value as any)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
};

export default ThemeSelector;
```

---

## 10. Debug/Development Components

Place debug tools in `src/components/common/` or `src/components/test/`.

Example: `src/components/common/ErrorBoundary.tsx`
```tsx
import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { /* log error */ }
  render() {
    if (this.state.hasError) return <div>Something went wrong.</div>;
    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 11. Type Safety

- All types go in `src/types/` and `src/lib/snaptrade/types.ts`.
- For SnapTrade, import and extend types from `snaptrade-typescript-sdk`.
- Example: `src/types/user.ts`
```ts
export interface User {
  id: string;
  email: string;
  // ...other fields
}
```

---

## 12. SnapTrade Integration

Create `src/lib/snaptrade/client.ts`:
```ts
import { SnapTrade, Configuration, SnapTradeError } from 'snaptrade-typescript-sdk';

const config = new Configuration({
  clientId: process.env.SNAPTRADE_CLIENT_ID!,
  consumerKey: process.env.SNAPTRADE_CONSUMER_KEY!
});

export const snaptrade = new SnapTrade(config);
```

- Use only the official SDK for all SnapTrade operations.
- Never make direct HTTP calls to SnapTrade endpoints.

---

## 13. Supabase Functions

For each function in `supabase/functions/`, create a `deno.json` file:

Example: `supabase/functions/snaptrade-accounts/deno.json`
```json
{
  "importMap": "../../import_map.json"
}
```

- Add your Deno function code as needed.

---

## 14. Testing

Create `jest.config.js`:
```js
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
};
```

- Place tests in `__tests__` folders next to components.

---

## 15. Linting and Formatting

Create `eslint.config.js`:
```js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {}
};
```

Add Prettier config as needed.

---

## 16. Scripts

Add scripts to `scripts/` as needed for automation (optional).

---

## 17. Documentation

- Place all documentation in the `docs/` directory.
- For routing, create `src/docs/ROUTING.md` and document all routes and navigation rules.

---

## 18. Final Steps

- Review all files and directories for completeness.
- Run `npm run dev` to start the app.
- Use `npm run lint`, `npm run format`, and `npm test` to ensure code quality.

---

**By following this blueprint, you can reconstruct the entire TraderInsights application from scratch, with all conventions, structure, and critical implementation details.** 
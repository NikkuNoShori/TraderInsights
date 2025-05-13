# TraderInsights Database Schema

## Tables

### profiles

```sql
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  username text UNIQUE,
  username_changes_remaining INTEGER DEFAULT 2,
  last_username_change TIMESTAMPTZ,
  role user_role DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
```

User profiles linked to authentication system. Stores personal information and application role.

### trades

```sql
CREATE TABLE public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('Long', 'Short')),
  date date NOT NULL,
  price numeric NOT NULL,
  quantity numeric NOT NULL,
  total numeric NOT NULL,
  fees numeric DEFAULT 0,
  status text NOT NULL CHECK (status IN ('open', 'closed')),
  notes text,
  exit_date date,
  exit_price numeric,
  exit_quantity numeric,
  strategy text,
  risk_reward numeric,
  target_price numeric,
  stop_loss numeric,
  tags text[],
  risk_amount numeric,
  reward_amount numeric,
  broker_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  pnl DECIMAL(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN status = 'closed' THEN
        CASE 
          WHEN side = 'Long' THEN (total - (quantity * price)) 
          WHEN side = 'Short' THEN ((quantity * price) - total)
        END
      ELSE NULL
    END
  ) STORED
);
```

Trading journal entries to track trade performance. Includes automatic PnL calculation.

### snaptrade_credentials

```sql
CREATE TABLE public.snaptrade_credentials (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    snaptrade_user_id text not null,
    snaptrade_user_secret text not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(user_id)
);
```

Stores SnapTrade integration credentials for brokerage connections.

### sessions

```sql
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Secure session management for authentication state.

### user_data

```sql
CREATE TABLE public.user_data (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_data TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Encrypted storage for sensitive user data.

### auth_attempts

```sql
CREATE TABLE public.auth_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  success boolean NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL
);
```

Security monitoring for authentication attempts.

## Types and Enums

### user_role

```sql
CREATE TYPE public.user_role AS ENUM ('admin', 'user', 'developer');
```

Role-based access control enumeration.

## Functions

### handle_updated_at()

```sql
CREATE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Updates timestamp when records change.

### is_dev_mode()

```sql
CREATE FUNCTION public.is_dev_mode()
RETURNS boolean AS $$
BEGIN
  RETURN current_setting('request.headers', true)::json->>'x-dev-mode' = 'true';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Checks if developer mode is enabled for testing.

### has_role(required_role)

```sql
CREATE FUNCTION public.has_role(required_role user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND (role = required_role OR role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Checks if current user has a specific role.

### get_user_role()

```sql
CREATE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Retrieves current user's role.

### handle_new_user()

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Creates profile when new user registers.

### validate_username()

```sql
CREATE FUNCTION validate_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT NEW.username ~ '^[a-zA-Z0-9_]{3,20}$' THEN
    RAISE EXCEPTION 'Username must be 3-20 characters and contain only letters, numbers, and underscores';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Validates username format.

### track_username_changes()

```sql
CREATE FUNCTION track_username_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.username IS DISTINCT FROM NEW.username THEN
    IF NEW.username_changes_remaining <= 0 THEN
      RAISE EXCEPTION 'No username changes remaining';
    END IF;
    NEW.username_changes_remaining := NEW.username_changes_remaining - 1;
    NEW.last_username_change := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Limits username changes.

### clean_old_auth_attempts()

```sql
CREATE FUNCTION clean_old_auth_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.auth_attempts
  WHERE timestamp < now() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Cleans up old authentication attempts.

### update_updated_at_column()

```sql
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Updates timestamps for secure storage tables.

## Key Relationships

- `profiles.id` → `auth.users.id` (One-to-one)
- `trades.user_id` → `auth.users.id` (Many-to-one)
- `snaptrade_credentials.user_id` → `auth.users.id` (One-to-one)
- `sessions.user_id` → `auth.users.id` (Many-to-one)
- `user_data.user_id` → `auth.users.id` (One-to-one) 
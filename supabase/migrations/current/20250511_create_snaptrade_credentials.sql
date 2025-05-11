-- Migration: Create snaptrade_credentials table for SnapTrade integration
-- Date: 2025-05-11

create table if not exists snaptrade_credentials (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    snaptrade_user_id text not null,
    snaptrade_user_secret text not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(user_id)
);

-- Optional: Add index for quick lookup
create index if not exists idx_snaptrade_credentials_user_id on snaptrade_credentials(user_id);

-- Enable Row Level Security
alter table snaptrade_credentials enable row level security;

-- Drop existing policies if they exist to avoid conflicts
drop policy if exists "Users can view their own SnapTrade credentials" on snaptrade_credentials;
drop policy if exists "Users can insert their own SnapTrade credentials" on snaptrade_credentials;
drop policy if exists "Users can update their own SnapTrade credentials" on snaptrade_credentials;
drop policy if exists "Users can delete their own SnapTrade credentials" on snaptrade_credentials;

-- Create policies for user access with explicit auth.uid() comparison
create policy "Users can view their own SnapTrade credentials"
on snaptrade_credentials for select
using (auth.uid() = user_id);

create policy "Users can insert their own SnapTrade credentials"
on snaptrade_credentials for insert
with check (auth.uid() = user_id);

create policy "Users can update their own SnapTrade credentials"
on snaptrade_credentials for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own SnapTrade credentials"
on snaptrade_credentials for delete
using (auth.uid() = user_id);

-- Grant necessary permissions to authenticated users
grant usage on schema public to authenticated;
grant all privileges on table snaptrade_credentials to authenticated; 
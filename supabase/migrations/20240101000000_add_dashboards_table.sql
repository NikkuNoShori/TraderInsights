-- Create dashboards table
create table if not exists public.dashboards (
    id uuid primary key,
    user_id uuid references auth.users not null,
    name text not null,
    is_default boolean default false,
    layouts jsonb default '[]'::jsonb,
    enabled_cards jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.dashboards enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own dashboards" on public.dashboards;
drop policy if exists "Users can insert their own dashboards" on public.dashboards;
drop policy if exists "Users can update their own dashboards" on public.dashboards;
drop policy if exists "Users can delete their own dashboards" on public.dashboards;

-- Create policies
create policy "Users can view their own dashboards"
    on public.dashboards for select
    using (auth.uid() = user_id);

create policy "Users can insert their own dashboards"
    on public.dashboards for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own dashboards"
    on public.dashboards for update
    using (auth.uid() = user_id);

create policy "Users can delete their own dashboards"
    on public.dashboards for delete
    using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists dashboards_user_id_idx on public.dashboards(user_id);

-- Function to ensure only one default dashboard per user
create or replace function public.ensure_single_default_dashboard()
returns trigger as $$
begin
    if new.is_default then
        update public.dashboards
        set is_default = false
        where user_id = new.user_id
        and id != new.id;
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists
drop trigger if exists ensure_single_default_dashboard_trigger on public.dashboards;

-- Trigger to maintain single default dashboard
create trigger ensure_single_default_dashboard_trigger
    before insert or update on public.dashboards
    for each row
    execute function public.ensure_single_default_dashboard(); 
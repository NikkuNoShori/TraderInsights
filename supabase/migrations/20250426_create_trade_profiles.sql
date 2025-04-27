-- Create enum for trade source types
create type trade_source_type as enum ('API_SYNC', 'SPREADSHEET', 'MANUAL');

-- Create trade_profiles table
create table trade_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  broker_type text not null,
  source_type trade_source_type not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add profile_id to trades table
alter table trades 
  add column profile_id uuid references trade_profiles(id) not null;

-- Create profile stats view
create view profile_stats as
select 
  p.id as profile_id,
  p.name as profile_name,
  p.broker_type,
  p.source_type,
  count(t.id) as total_trades,
  sum(t.pnl) as total_pnl,
  avg(case when t.pnl > 0 then 1 else 0 end) as win_rate,
  max(t.created_at) as last_sync
from trade_profiles p
left join trades t on t.profile_id = p.id
group by p.id, p.name, p.broker_type, p.source_type;

-- Enable RLS on trade_profiles table
alter table trade_profiles enable row level security;

-- Create policies for trade_profiles
create policy "Users can view their own trade profiles"
  on trade_profiles for select
  using (auth.uid() = user_id);

create policy "Users can create their own trade profiles"
  on trade_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trade profiles"
  on trade_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own trade profiles"
  on trade_profiles for delete
  using (auth.uid() = user_id);

-- Update trades policies to include profile_id
create policy "Users can view trades from their profiles"
  on trades for select
  using (
    auth.uid() = user_id and
    profile_id in (
      select id from trade_profiles where user_id = auth.uid()
    )
  );

create policy "Users can insert trades into their profiles"
  on trades for insert
  with check (
    auth.uid() = user_id and
    profile_id in (
      select id from trade_profiles where user_id = auth.uid()
    )
  );

-- Migration script to handle existing trades
do $$
declare
  v_default_profile_id uuid;
begin
  -- Create a default profile for each user with existing trades
  insert into trade_profiles (user_id, name, broker_type, source_type)
  select distinct 
    user_id,
    'Default Profile',
    'manual',
    'MANUAL'::trade_source_type
  from trades
  returning id into v_default_profile_id;

  -- Update existing trades to use the default profile
  update trades
  set profile_id = v_default_profile_id
  where profile_id is null;
end $$; 
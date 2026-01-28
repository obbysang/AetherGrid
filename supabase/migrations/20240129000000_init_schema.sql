-- Create Anomalies Table
create table if not exists anomalies (
  id text primary key,
  timestamp text not null,
  type text not null,
  severity text not null,
  confidence numeric not null,
  description text not null,
  asset_id text not null,
  status text not null,
  recommended_action text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Work Orders Table
create table if not exists work_orders (
  id uuid default gen_random_uuid() primary key,
  anomaly_id text references anomalies(id),
  asset_id text not null,
  strategy_tier text not null,
  cost numeric not null,
  downtime_hours numeric not null,
  life_extension_years numeric not null,
  status text not null default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  justification text
);

-- Create Repair Strategies Table (Optional, but good for reference)
create table if not exists repair_strategies (
  id uuid default gen_random_uuid() primary key,
  tier text unique not null,
  name text not null,
  cost numeric not null,
  downtime_hours numeric not null,
  life_extension_years numeric not null,
  risk_level text not null,
  description text not null,
  is_recommended boolean default false
);

-- Enable RLS
alter table anomalies enable row level security;
alter table work_orders enable row level security;
alter table repair_strategies enable row level security;

-- Create Policies (Public access for demo purposes, restrict in production)
create policy "Enable read access for all users" on anomalies for select using (true);
create policy "Enable insert access for all users" on anomalies for insert with check (true);
create policy "Enable update access for all users" on anomalies for update using (true);

create policy "Enable read access for all users" on work_orders for select using (true);
create policy "Enable insert access for all users" on work_orders for insert with check (true);

create policy "Enable read access for all users" on repair_strategies for select using (true);

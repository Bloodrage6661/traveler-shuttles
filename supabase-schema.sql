-- Run this in your Supabase SQL editor

create type trip_type as enum ('to_airport', 'from_airport', 'point_to_point');
create type customer_tier as enum ('Corporate', 'Hotel/B&B', 'General');
create type pricing_band as enum ('25km', '50km', '75km', 'custom');
create type time_window as enum ('morning', 'midday', 'afternoon', 'evening');
create type booking_status as enum ('pending', 'confirmed', 'cancelled');

create table bookings (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz default now(),

  -- Client
  client_name           text not null,
  client_email          text not null,
  client_cell           text not null,

  -- Customer
  customer_tier         customer_tier not null default 'General',

  -- Trip
  pickup_address        text not null,
  dropoff_address       text not null,
  distance_km           float not null,
  passengers            int not null check (passengers between 1 and 3),
  trip_type             trip_type not null,

  -- Pricing
  pricing_band          pricing_band not null,
  fare_zar              int,

  -- Schedule
  preferred_date        date,
  preferred_time_window time_window,

  -- Status
  status                booking_status not null default 'pending',
  confirm_token         uuid not null default gen_random_uuid(),
  token_used            boolean not null default false
);

-- Dates Greg has marked as unavailable
create table unavailable_dates (
  date        date primary key,
  note        text,
  created_at  timestamptz default now()
);

create index on bookings (confirm_token);
create index on bookings (status);
create index on bookings (preferred_date);

-- RLS
alter table bookings enable row level security;
alter table unavailable_dates enable row level security;

create policy "Anyone can insert a booking"
  on bookings for insert to anon with check (true);

create policy "Service role has full access to bookings"
  on bookings for all to service_role using (true);

create policy "Anyone can read unavailable dates"
  on unavailable_dates for select to anon using (true);

create policy "Service role manages unavailable dates"
  on unavailable_dates for all to service_role using (true);

-- Performance indexes for the bookings table.
-- Safe to run multiple times. Run in the Supabase SQL editor.
-- Negligible effect at current row counts; keeps the admin list and the
-- customer dashboard fast as the table grows.

-- Admin list + overview: ordered by created_at desc.
create index if not exists bookings_created_at_idx
  on public.bookings (created_at desc);

-- Customer dashboard: "my bookings, newest first".
create index if not exists bookings_user_created_idx
  on public.bookings (user_id, created_at desc);

-- Confirm/decline links look up by token.
create index if not exists bookings_confirm_token_idx
  on public.bookings (confirm_token);

-- Adds a drop-off time to bookings so Greg can set both ends of the trip
-- (pickup + drop-off) when rescheduling. Stores "HH:MM" like preferred_time_window.
-- Safe to run multiple times. Run in the Supabase SQL editor.

alter table public.bookings add column if not exists dropoff_time text;

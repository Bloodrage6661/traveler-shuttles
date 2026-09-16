-- Adds a company name to bookings so Greg can record corporate/company bookings
-- (manual admin bookings) and search by company. Stores plain text.
-- Safe to run multiple times. Run in the Supabase SQL editor.

alter table public.bookings add column if not exists company_name text;

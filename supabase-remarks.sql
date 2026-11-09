-- Admin remarks / special instructions sent to the client with the confirmation.
alter table public.bookings add column if not exists remarks text;

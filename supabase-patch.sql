-- Add customer_tier enum
DO $$ BEGIN
  CREATE TYPE customer_tier AS ENUM ('Corporate', 'Hotel/B&B', 'General');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add customer_tier column to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_tier customer_tier NOT NULL DEFAULT 'General';

-- Add unavailable_dates table
CREATE TABLE IF NOT EXISTS unavailable_dates (
  date        date primary key,
  note        text,
  created_at  timestamptz default now()
);

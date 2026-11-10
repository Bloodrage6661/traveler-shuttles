-- Corporate / partnership enquiries (website leads; ready for Zoho CRM later).
create table if not exists public.corporate_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company_name text not null,
  contact_person text not null,
  job_title text,
  email text not null,
  phone text not null,
  location text not null,
  category text not null,
  services text[] not null default '{}',
  monthly_requirements text,
  message text,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  source text not null default 'Website',
  crm_synced_at timestamptz
);
-- Not public: RLS on, no policies (only the server's service role can read/write).
alter table public.corporate_enquiries enable row level security;

-- Admin remarks (from the previous change), in case not yet run:
alter table public.bookings add column if not exists remarks text;

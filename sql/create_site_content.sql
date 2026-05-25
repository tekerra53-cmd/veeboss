-- Run this in the Supabase SQL editor to create the table
CREATE TABLE IF NOT EXISTS site_content (
  id text PRIMARY KEY,
  content jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Optional: create a row for the app to use (replace the JSON with your seed if desired)
INSERT INTO site_content (id, content) VALUES ('veeboss-site', '{"heroSubtitle":"welcome to","heroDescription":"Initial seed content","services":[]}' )
ON CONFLICT (id) DO NOTHING;

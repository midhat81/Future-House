-- Create designs table
CREATE TABLE designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  params jsonb NOT NULL,
  exterior_front_url text,
  exterior_side_url text,
  exterior_aerial_url text,
  interior_living_url text,
  interior_kitchen_url text,
  interior_bedroom_url text
);

-- Enable RLS
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert designs
CREATE POLICY "Allow anon insert" ON designs
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous users to select all designs
CREATE POLICY "Allow anon select" ON designs
  FOR SELECT TO anon USING (true);

-- Allow anonymous users to delete their own designs (by id)
CREATE POLICY "Allow anon delete" ON designs
  FOR DELETE TO anon USING (true);

-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-media', 'generated-media', true);


-- Remove old public-access seed data
DELETE FROM public.applications;

-- Add owner column
ALTER TABLE public.applications
  ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX applications_user_id_idx ON public.applications(user_id);

-- Drop old public policies
DROP POLICY IF EXISTS "Anyone can view applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can update applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can delete applications" ON public.applications;

-- Per-user policies
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.applications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

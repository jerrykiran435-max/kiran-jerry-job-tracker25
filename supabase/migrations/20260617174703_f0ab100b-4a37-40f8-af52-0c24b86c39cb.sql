CREATE TYPE public.application_status AS ENUM ('Applied', 'Assessment', 'Interview', 'HR Round', 'Offer', 'Rejected');

CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  job_title TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
  job_link TEXT NOT NULL DEFAULT '',
  job_portal TEXT NOT NULL DEFAULT '',
  salary TEXT NOT NULL DEFAULT '',
  status public.application_status NOT NULL DEFAULT 'Applied',
  resume_version TEXT NOT NULL DEFAULT '',
  interview_date DATE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX applications_applied_date_idx ON public.applications (applied_date DESC);
CREATE INDEX applications_status_idx ON public.applications (status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view applications"
  ON public.applications FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert applications"
  ON public.applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update applications"
  ON public.applications FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete applications"
  ON public.applications FOR DELETE
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'officer', 'ngo', 'citizen');
CREATE TYPE public.complaint_status AS ENUM ('raised','approved','assigned','in_progress','completed','rejected','reopened');
CREATE TYPE public.complaint_category AS ENUM ('road','garbage','lights','water','park','noise','animal');
CREATE TYPE public.severity AS ENUM ('low','medium','high','critical');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  trust_score INTEGER NOT NULL DEFAULT 50,
  impact_score INTEGER NOT NULL DEFAULT 0,
  badges TEXT[] NOT NULL DEFAULT '{}',
  ward TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles select all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles (separate table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "roles select all" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "roles insert own citizen" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "roles admin manage" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin'));

-- Complaints
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category complaint_category NOT NULL,
  status complaint_status NOT NULL DEFAULT 'raised',
  severity severity NOT NULL DEFAULT 'medium',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address TEXT,
  ward TEXT,
  photo_url TEXT,
  resolved_photo_url TEXT,
  ai_verified BOOLEAN NOT NULL DEFAULT false,
  ai_confidence NUMERIC(4,3) DEFAULT 0,
  ai_reason TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0,
  pressure_score INTEGER NOT NULL DEFAULT 0,
  sla_hours INTEGER NOT NULL DEFAULT 48,
  sla_deadline TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaints public read" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "complaints citizen insert" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "complaints owner update" ON public.complaints FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "complaints officer update" ON public.complaints FOR UPDATE USING (
  public.has_role(auth.uid(),'officer') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'ngo')
);

-- Updates / timeline
CREATE TABLE public.complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  status complaint_status NOT NULL,
  note TEXT,
  actor_id UUID REFERENCES auth.users(id),
  proof_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "updates public read" ON public.complaint_updates FOR SELECT USING (true);
CREATE POLICY "updates auth insert" ON public.complaint_updates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Votes
CREATE TABLE public.complaint_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote','confirm','reject')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (complaint_id, user_id, vote_type)
);
ALTER TABLE public.complaint_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes public read" ON public.complaint_votes FOR SELECT USING (true);
CREATE POLICY "votes auth insert" ON public.complaint_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes auth delete" ON public.complaint_votes FOR DELETE USING (auth.uid() = user_id);

-- Animal rescues
CREATE TABLE public.animal_rescues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id),
  ngo_id UUID REFERENCES auth.users(id),
  animal_type TEXT,
  condition_note TEXT,
  priority severity NOT NULL DEFAULT 'high',
  rescue_status TEXT NOT NULL DEFAULT 'pending',
  eta_minutes INTEGER,
  treatment_photo_url TEXT,
  donations_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.animal_rescues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rescues public read" ON public.animal_rescues FOR SELECT USING (true);
CREATE POLICY "rescues auth insert" ON public.animal_rescues FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "rescues ngo update" ON public.animal_rescues FOR UPDATE USING (
  public.has_role(auth.uid(),'ngo') OR public.has_role(auth.uid(),'admin') OR auth.uid() = ngo_id
);

-- Trigger: auto profile + citizen role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'citizen');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_rescues_updated BEFORE UPDATE ON public.animal_rescues
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for complaint photos
INSERT INTO storage.buckets (id, name, public) VALUES ('complaints','complaints', true);
CREATE POLICY "complaint photos public read" ON storage.objects FOR SELECT USING (bucket_id = 'complaints');
CREATE POLICY "complaint photos auth upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'complaints' AND auth.uid() IS NOT NULL);
CREATE POLICY "complaint photos owner update" ON storage.objects FOR UPDATE USING (bucket_id = 'complaints' AND auth.uid()::text = (storage.foldername(name))[1]);

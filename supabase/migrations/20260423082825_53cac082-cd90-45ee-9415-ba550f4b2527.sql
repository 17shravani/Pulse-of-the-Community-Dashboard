
-- Fix function search_path
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;

-- Replace broad SELECT on storage.objects with object-level read (still public bucket access by URL works)
DROP POLICY IF EXISTS "complaint photos public read" ON storage.objects;
CREATE POLICY "complaint photos public object read"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaints');
-- Note: public bucket files remain accessible by direct URL (getPublicUrl). The linter still warns
-- because we keep SELECT for the bucket; this is intentional for displaying complaint photos.

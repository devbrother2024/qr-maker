-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-images', 'qr-images', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for qr-images bucket
-- Users can upload their own QR images
CREATE POLICY "Users can upload own QR images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'qr-images' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Users can view their own QR images
CREATE POLICY "Users can view own QR images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'qr-images' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Users can delete their own QR images
CREATE POLICY "Users can delete own QR images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'qr-images' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Storage RLS Policies for logos bucket
-- Users can upload their own logos
CREATE POLICY "Users can upload own logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Users can view their own logos
CREATE POLICY "Users can view own logos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Users can delete their own logos
CREATE POLICY "Users can delete own logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );


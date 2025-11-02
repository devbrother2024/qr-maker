-- Create qr_history table
CREATE TABLE IF NOT EXISTS public.qr_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  foreground_color VARCHAR(7) NOT NULL DEFAULT '#000000',
  background_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
  logo_storage_path TEXT,           -- Supabase Storage 로고 파일 경로
  qr_image_storage_path TEXT NOT NULL,  -- Supabase Storage QR 이미지 파일 경로
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to check user QR history limit (100)
CREATE OR REPLACE FUNCTION public.check_qr_history_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.qr_history WHERE user_id = NEW.user_id) >= 100 THEN
    RAISE EXCEPTION 'User cannot have more than 100 QR codes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce limit before insert
CREATE TRIGGER enforce_qr_history_limit
  BEFORE INSERT ON public.qr_history
  FOR EACH ROW
  EXECUTE FUNCTION public.check_qr_history_limit();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_qr_history_user_id ON public.qr_history(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_history_created_at ON public.qr_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.qr_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qr_history table
-- Users can view their own QR history
CREATE POLICY "Users can view own QR history"
  ON public.qr_history FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can insert their own QR history
CREATE POLICY "Users can insert own QR history"
  ON public.qr_history FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can delete their own QR history
CREATE POLICY "Users can delete own QR history"
  ON public.qr_history FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);


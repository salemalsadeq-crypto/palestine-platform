-- فلسطين بلاتفورم V33
-- بوابة تسجيل مقدمي الخدمات: أفراد + شركات
-- آمن لإعادة التشغيل

ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS provider_kind text NOT NULL DEFAULT 'individual';

ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS company_name text;

ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS coverage_area text;

ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS description text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'service_providers_provider_kind_check'
  ) THEN
    ALTER TABLE public.service_providers
    ADD CONSTRAINT service_providers_provider_kind_check
    CHECK (provider_kind IN ('individual','company'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS service_providers_kind_type_idx
ON public.service_providers(provider_kind, service_type, is_active, city);

COMMENT ON COLUMN public.service_providers.provider_kind IS 'individual or company';
COMMENT ON COLUMN public.service_providers.company_name IS 'Company display name when provider_kind=company';
COMMENT ON COLUMN public.service_providers.coverage_area IS 'Service coverage area entered by provider';
COMMENT ON COLUMN public.service_providers.description IS 'Short public description of the provider/service';

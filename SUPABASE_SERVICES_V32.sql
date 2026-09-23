-- فلسطين بلاتفورم V32
-- بيانات مركبة ومقدم خدمة التاكسي/النقل

ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS specialization text;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS passenger_capacity integer;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_providers_passenger_capacity_check') THEN
    ALTER TABLE public.service_providers
      ADD CONSTRAINT service_providers_passenger_capacity_check
      CHECK (passenger_capacity IS NULL OR passenger_capacity BETWEEN 1 AND 100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS service_providers_transport_idx
ON public.service_providers(service_type,is_active,city,passenger_capacity);

-- فلسطين بلاتفورم v24: بيانات مقدم الخدمة المتخصصة + موقع التاكسي
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS vehicle_type text;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS vehicle_number text;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS base_price numeric(12,2);
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS longitude double precision;
CREATE INDEX IF NOT EXISTS service_providers_geo_idx ON public.service_providers(service_type,is_active,latitude,longitude);

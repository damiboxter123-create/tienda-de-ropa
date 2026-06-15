-- Reemplaza <USER_UUID> por el id (uuid) del usuario en Supabase
-- Ejemplo de uso en Supabase SQL editor:
-- INSERT INTO public.admins (id, email) VALUES ('123e4567-e89b-12d3-a456-426614174000', 'damianvazquez0909@gmail.com');

INSERT INTO public.admins (id, email)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'damianvazquez0909@gmail.com')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

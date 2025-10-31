-- =====================================================
-- CREAR USUARIO ADMINISTRADOR POR DEFECTO
-- =====================================================
-- Este script crea un usuario admin con credenciales por defecto
-- IMPORTANTE: Cambia la contraseña después del primer login

-- Nota: Este script debe ejecutarse DESPUÉS de que Supabase Auth esté configurado
-- La forma más fácil es crear el usuario manualmente y luego actualizar su rol

-- OPCIÓN 1: Si ya tienes un usuario creado, actualiza su rol a admin
-- Reemplaza 'admin@cein.com' con el email del usuario que quieres hacer admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@cein.com';

-- OPCIÓN 2: Instrucciones para crear usuario admin manualmente
/*
1. Ve a Supabase Dashboard → Authentication → Users
2. Haz clic en "Add user"
3. Ingresa:
   - Email: admin@cein.com
   - Password: Admin123!CEIN
   - Auto Confirm User: YES (importante)
4. Haz clic en "Create user"

5. Luego ejecuta este SQL para actualizar el rol:
   UPDATE public.profiles
   SET role = 'admin', full_name = 'Administrador CEIN'
   WHERE email = 'admin@cein.com';

CREDENCIALES POR DEFECTO:
Email: admin@cein.com
Password: Admin123!CEIN

IMPORTANTE: Cambia estas credenciales después del primer login por seguridad
*/

-- Verificar que el usuario admin existe
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE role = 'admin';

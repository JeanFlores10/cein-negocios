-- =====================================================
-- FIX PARA INFINITE RECURSION EN RLS POLICIES
-- =====================================================

-- Paso 1: Eliminar todas las políticas problemáticas existentes
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can manage certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;

-- Paso 2: Crear función helper para verificar si un usuario es admin
-- Esta función usa SECURITY DEFINER para evitar recursión
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM public.profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 3: Recrear políticas usando la función helper

-- =====================================================
-- POLÍTICAS RLS PARA PROFILES
-- =====================================================
-- Los admins pueden ver todos los perfiles (usando función helper)
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- Los admins pueden actualizar todos los perfiles
CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

-- =====================================================
-- POLÍTICAS RLS PARA CATEGORIES
-- =====================================================
-- Solo admins pueden insertar/actualizar/eliminar categorías
CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    USING (public.is_admin());

-- =====================================================
-- POLÍTICAS RLS PARA COURSES
-- =====================================================
-- Admins pueden ver todos los cursos
CREATE POLICY "Admins can view all courses"
    ON public.courses FOR SELECT
    USING (public.is_admin());

-- Solo admins pueden insertar/actualizar/eliminar cursos
CREATE POLICY "Admins can manage courses"
    ON public.courses FOR ALL
    USING (public.is_admin());

-- =====================================================
-- POLÍTICAS RLS PARA ENROLLMENTS
-- =====================================================
-- Los admins pueden ver todas las inscripciones
CREATE POLICY "Admins can view all enrollments"
    ON public.enrollments FOR SELECT
    USING (public.is_admin());

-- Los admins pueden gestionar todas las inscripciones
CREATE POLICY "Admins can manage enrollments"
    ON public.enrollments FOR ALL
    USING (public.is_admin());

-- =====================================================
-- POLÍTICAS RLS PARA CERTIFICATES
-- =====================================================
-- Solo admins pueden crear/actualizar/eliminar certificados
CREATE POLICY "Admins can manage certificates"
    ON public.certificates FOR ALL
    USING (public.is_admin());

-- =====================================================
-- POLÍTICAS RLS PARA CONTACT_MESSAGES
-- =====================================================
-- Solo admins pueden ver mensajes de contacto
CREATE POLICY "Admins can view contact messages"
    ON public.contact_messages FOR SELECT
    USING (public.is_admin());

-- Solo admins pueden actualizar mensajes de contacto
CREATE POLICY "Admins can update contact messages"
    ON public.contact_messages FOR UPDATE
    USING (public.is_admin());

-- =====================================================
-- POLÍTICAS RLS PARA TESTIMONIALS
-- =====================================================
-- Solo admins pueden gestionar todos los testimonios
CREATE POLICY "Admins can manage testimonials"
    ON public.testimonials FOR ALL
    USING (public.is_admin());

-- Verificación: Revisar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD PARA SUPABASE STORAGE
-- =====================================================

-- IMPORTANTE: Ejecuta estos comandos en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query

-- =====================================================
-- 1. BUCKET: course-images (Imágenes de cursos)
-- =====================================================

-- Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-images', 'course-images', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir a administradores subir imágenes
CREATE POLICY "Administradores pueden subir imágenes de cursos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'course-images'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a administradores actualizar imágenes
CREATE POLICY "Administradores pueden actualizar imágenes de cursos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'course-images'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a administradores eliminar imágenes
CREATE POLICY "Administradores pueden eliminar imágenes de cursos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'course-images'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a todos ver imágenes (bucket público)
CREATE POLICY "Todos pueden ver imágenes de cursos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-images');

-- =====================================================
-- 2. BUCKET: certificates (Certificados de estudiantes)
-- =====================================================

-- Crear bucket privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Permitir a administradores subir certificados
CREATE POLICY "Administradores pueden subir certificados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'certificates'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a administradores ver todos los certificados
CREATE POLICY "Administradores pueden ver todos los certificados"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'certificates'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a estudiantes ver solo sus propios certificados
CREATE POLICY "Estudiantes pueden ver sus propios certificados"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'certificates'
    AND (storage.foldername(name))[1] = 'students'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Permitir a administradores actualizar certificados
CREATE POLICY "Administradores pueden actualizar certificados"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'certificates'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a administradores eliminar certificados
CREATE POLICY "Administradores pueden eliminar certificados"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'certificates'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =====================================================
-- 3. BUCKET: course-materials (Materiales de curso)
-- =====================================================

-- Crear bucket privado
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Permitir a administradores subir materiales
CREATE POLICY "Administradores pueden subir materiales"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'course-materials'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a administradores ver todos los materiales
CREATE POLICY "Administradores pueden ver todos los materiales"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'course-materials'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a estudiantes inscritos ver materiales de sus cursos
CREATE POLICY "Estudiantes inscritos pueden ver materiales de sus cursos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'course-materials'
    AND EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.user_id = auth.uid()
        AND e.course_id::text = (storage.foldername(name))[2]
        AND e.status = 'active'
    )
);

-- Permitir a administradores actualizar materiales
CREATE POLICY "Administradores pueden actualizar materiales"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'course-materials'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a administradores eliminar materiales
CREATE POLICY "Administradores pueden eliminar materiales"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'course-materials'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =====================================================
-- 4. BUCKET: avatars (Fotos de perfil)
-- =====================================================

-- Crear bucket público
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir a usuarios subir su propio avatar
CREATE POLICY "Usuarios pueden subir su propio avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Permitir a administradores subir avatares para cualquier usuario
CREATE POLICY "Administradores pueden subir avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a todos ver avatares
CREATE POLICY "Todos pueden ver avatares"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Permitir a usuarios actualizar su propio avatar
CREATE POLICY "Usuarios pueden actualizar su propio avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Permitir a administradores actualizar cualquier avatar
CREATE POLICY "Administradores pueden actualizar avatares"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a usuarios eliminar su propio avatar
CREATE POLICY "Usuarios pueden eliminar su propio avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Permitir a administradores eliminar cualquier avatar
CREATE POLICY "Administradores pueden eliminar avatares"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =====================================================
-- 5. BUCKET: site-images (Imágenes del sitio web)
-- =====================================================

-- Crear bucket público para imágenes del sitio
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir a administradores subir imágenes del sitio
CREATE POLICY "Administradores pueden subir imágenes del sitio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'site-images'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a administradores actualizar imágenes del sitio
CREATE POLICY "Administradores pueden actualizar imágenes del sitio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'site-images'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a administradores eliminar imágenes del sitio
CREATE POLICY "Administradores pueden eliminar imágenes del sitio"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'site-images'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Permitir a todos ver imágenes del sitio (bucket público)
CREATE POLICY "Todos pueden ver imágenes del sitio"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-images');

-- =====================================================
-- VERIFICAR QUE LAS POLÍTICAS SE CREARON CORRECTAMENTE
-- =====================================================

-- Ejecuta esta consulta para ver todas las políticas creadas:
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;

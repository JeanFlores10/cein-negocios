-- =====================================================
-- SCHEMA SQL PARA CEIN-NEGOCIOS
-- Base de datos: Supabase PostgreSQL
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: profiles
-- Perfiles de usuario (complementa auth.users de Supabase)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- TABLA: categories
-- Categorías de cursos (técnicos, académicos, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- =====================================================
-- TABLA: courses
-- Cursos ofrecidos por CEIN
-- =====================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    duration TEXT, -- Ejemplo: "Mes y medio", "3 meses"
    modality TEXT NOT NULL DEFAULT 'presencial' CHECK (modality IN ('presencial', 'virtual', 'hibrido')),
    price_enrollment NUMERIC(10, 2),
    price_monthly NUMERIC(10, 2),
    image_url TEXT,
    is_certificate_free BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    whatsapp_link TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para courses
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_active ON public.courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_modality ON public.courses(modality);

-- =====================================================
-- TABLA: enrollments
-- Inscripciones de estudiantes a cursos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Índices para enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- =====================================================
-- TABLA: certificates
-- Certificados emitidos a estudiantes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    certificate_code TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    student_document TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    pdf_url TEXT,
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para certificates
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(certificate_code);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON public.certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_document ON public.certificates(student_document);

-- =====================================================
-- TABLA: contact_messages
-- Mensajes del formulario de contacto
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_interest TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);

-- =====================================================
-- TABLA: testimonials
-- Testimonios y casos de éxito
-- =====================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    company TEXT,
    course_taken TEXT,
    testimonial_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    avatar_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_user ON public.testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(is_published);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials(is_featured);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at en todas las tablas
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA PROFILES
-- =====================================================
-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Los admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA CATEGORIES
-- =====================================================
-- Todos pueden ver categorías activas
CREATE POLICY "Anyone can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = true);

-- Solo admins pueden insertar/actualizar/eliminar categorías
CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA COURSES
-- =====================================================
-- Todos pueden ver cursos activos
CREATE POLICY "Anyone can view active courses"
    ON public.courses FOR SELECT
    USING (is_active = true);

-- Admins pueden ver todos los cursos
CREATE POLICY "Admins can view all courses"
    ON public.courses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden insertar/actualizar/eliminar cursos
CREATE POLICY "Admins can manage courses"
    ON public.courses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA ENROLLMENTS
-- =====================================================
-- Los usuarios pueden ver sus propias inscripciones
CREATE POLICY "Users can view own enrollments"
    ON public.enrollments FOR SELECT
    USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propias inscripciones
CREATE POLICY "Users can create own enrollments"
    ON public.enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Los admins pueden ver todas las inscripciones
CREATE POLICY "Admins can view all enrollments"
    ON public.enrollments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Los admins pueden gestionar todas las inscripciones
CREATE POLICY "Admins can manage enrollments"
    ON public.enrollments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA CERTIFICATES
-- =====================================================
-- Los usuarios pueden ver sus propios certificados
CREATE POLICY "Users can view own certificates"
    ON public.certificates FOR SELECT
    USING (auth.uid() = user_id);

-- Cualquiera puede buscar certificados por código (para validación pública)
CREATE POLICY "Anyone can view certificates by code"
    ON public.certificates FOR SELECT
    USING (true);

-- Solo admins pueden crear/actualizar/eliminar certificados
CREATE POLICY "Admins can manage certificates"
    ON public.certificates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA CONTACT_MESSAGES
-- =====================================================
-- Cualquiera puede insertar mensajes de contacto
CREATE POLICY "Anyone can create contact messages"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

-- Solo admins pueden ver mensajes de contacto
CREATE POLICY "Admins can view contact messages"
    ON public.contact_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden actualizar mensajes de contacto
CREATE POLICY "Admins can update contact messages"
    ON public.contact_messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS RLS PARA TESTIMONIALS
-- =====================================================
-- Todos pueden ver testimonios publicados
CREATE POLICY "Anyone can view published testimonials"
    ON public.testimonials FOR SELECT
    USING (is_published = true);

-- Los usuarios pueden ver sus propios testimonios
CREATE POLICY "Users can view own testimonials"
    ON public.testimonials FOR SELECT
    USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios testimonios
CREATE POLICY "Users can create own testimonials"
    ON public.testimonials FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Solo admins pueden gestionar todos los testimonios
CREATE POLICY "Admins can manage testimonials"
    ON public.testimonials FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- DATOS INICIALES (SEED DATA)
-- =====================================================

-- Insertar categorías iniciales
INSERT INTO public.categories (name, slug, description, icon, display_order) VALUES
    ('Cursos Técnicos', 'cursos-tecnicos', 'Cursos técnicos especializados para emprendedores', 'fas fa-tools', 1),
    ('Cursos Académicos', 'cursos-academicos', 'Cursos académicos para desarrollo profesional', 'fas fa-graduation-cap', 2)
ON CONFLICT (slug) DO NOTHING;

-- Nota: Los cursos se insertarán después manualmente o mediante migración de datos existentes

COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios complementarios a auth.users';
COMMENT ON TABLE public.categories IS 'Categorías de cursos (técnicos, académicos, etc.)';
COMMENT ON TABLE public.courses IS 'Catálogo de cursos ofrecidos por CEIN';
COMMENT ON TABLE public.enrollments IS 'Inscripciones de estudiantes a cursos';
COMMENT ON TABLE public.certificates IS 'Certificados emitidos a estudiantes';
COMMENT ON TABLE public.contact_messages IS 'Mensajes del formulario de contacto del sitio web';
COMMENT ON TABLE public.testimonials IS 'Testimonios y casos de éxito de estudiantes';

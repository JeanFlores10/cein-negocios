-- =====================================================
-- DATOS INICIALES DE CURSOS PARA CEIN-NEGOCIOS
-- Este archivo inserta todos los cursos técnicos y académicos
-- =====================================================

-- Obtener IDs de categorías
DO $$
DECLARE
    cat_tecnico_id UUID;
    cat_academico_id UUID;
BEGIN
    -- Obtener ID de categoría técnica
    SELECT id INTO cat_tecnico_id FROM public.categories WHERE slug = 'cursos-tecnicos';

    -- Obtener ID de categoría académica
    SELECT id INTO cat_academico_id FROM public.categories WHERE slug = 'cursos-academicos';

    -- =====================================================
    -- CURSOS TÉCNICOS
    -- =====================================================

    INSERT INTO public.courses (
        category_id, title, slug, description, short_description,
        duration, modality, image_url, is_certificate_free,
        whatsapp_link, display_order
    ) VALUES
    (
        cat_tecnico_id,
        'ARMADO Y DISEÑO DE MUEBLES EN MELAMINA',
        'armado-diseno-muebles-melamina',
        'Aprende a diseñar y armar muebles profesionales en melamina. Curso práctico donde desarrollarás habilidades para emprender tu propio negocio de carpintería.',
        'Curso práctico de diseño y armado de muebles en melamina',
        'Mes y medio',
        'hibrido',
        'images/talleres/armado_muebles.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20muebles%20en%20melamina',
        1
    ),
    (
        cat_tecnico_id,
        'REPARACIÓN DE CELULARES Y TABLETS',
        'reparacion-celulares-tablets',
        'Domina la reparación de dispositivos móviles. Aprende técnicas de diagnóstico, reparación de hardware y software de celulares y tablets.',
        'Curso completo de reparación de dispositivos móviles',
        '2 meses y medio',
        'hibrido',
        'images/talleres/reparacion_celulares.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20reparación%20de%20celulares',
        2
    ),
    (
        cat_tecnico_id,
        'SERIGRAFÍA, ESTAMPADO, SUBLIMACIÓN Y VINIL TEXTIL',
        'serigrafia-estampado-sublimacion',
        'Curso completo de técnicas de estampado textil. Aprende serigrafía, sublimación y aplicación de vinil textil para emprender en el negocio de estampados.',
        'Técnicas profesionales de estampado textil',
        'Mes y medio',
        'hibrido',
        'images/talleres/estampados.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20serigrafía%20y%20estampado',
        3
    ),
    (
        cat_tecnico_id,
        'INSTALACIONES ELÉCTRICAS DOMICILIARIAS',
        'instalaciones-electricas-domiciliarias',
        'Aprende a realizar instalaciones eléctricas residenciales de forma segura y profesional. Incluye normativa técnica peruana.',
        'Instalaciones eléctricas residenciales profesionales',
        'Mes y medio',
        'hibrido',
        'images/talleres/instalaciones.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20instalaciones%20eléctricas',
        4
    ),
    (
        cat_tecnico_id,
        'INSTALACIONES DE CÁMARA DE SEGURIDAD',
        'instalaciones-camaras-seguridad',
        'Domina la instalación y configuración de sistemas de videovigilancia. Aprende sobre cámaras IP, DVR, NVR y sistemas de seguridad modernos.',
        'Instalación profesional de sistemas de videovigilancia',
        'Mes y medio',
        'hibrido',
        'images/talleres/instalaciones_camaras.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20cámaras%20de%20seguridad',
        5
    ),
    (
        cat_tecnico_id,
        'CONSTRUCCIÓN EN DRYWALL',
        'construccion-drywall',
        'Aprende las técnicas modernas de construcción en seco con drywall. Ideal para emprender en el sector construcción.',
        'Técnicas de construcción en drywall',
        'Mes y medio',
        'hibrido',
        'images/talleres/construccion_drywall.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20construcción%20en%20drywall',
        6
    ),
    (
        cat_tecnico_id,
        'REPARACIÓN Y MANTENIMIENTO DE PC, LAPTOPS E IMPRESORAS',
        'reparacion-mantenimiento-pc-laptops',
        'Curso completo de reparación y mantenimiento de equipos de cómputo. Aprende diagnóstico, reparación de hardware y software.',
        'Reparación profesional de equipos de cómputo',
        'Mes y medio',
        'hibrido',
        'images/talleres/reparacion_mantenimiento.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20reparación%20de%20PC',
        7
    ),
    (
        cat_tecnico_id,
        'CONSTRUCCIÓN EN VIDRIO Y ALUMINIO',
        'construccion-vidrio-aluminio',
        'Domina las técnicas de trabajo con vidrio y aluminio. Aprende a fabricar e instalar ventanas, mamparas y estructuras.',
        'Fabricación e instalación de estructuras de vidrio y aluminio',
        'Mes y medio',
        'hibrido',
        'images/talleres/construcciones_vidrio.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20vidrio%20y%20aluminio',
        8
    ),
    (
        cat_tecnico_id,
        'DISEÑO 3D DE MUEBLES EN MELAMINA EN SKETCHUP',
        'diseno-3d-muebles-sketchup',
        'Aprende a diseñar muebles en 3D usando SketchUp. Ideal para complementar tus habilidades en carpintería y mejorar tus presentaciones a clientes.',
        'Diseño 3D profesional de muebles con SketchUp',
        'Mes y medio',
        'hibrido',
        'images/talleres/diseño_3d.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20diseño%203D',
        9
    ),
    (
        cat_tecnico_id,
        'BARBERÍA PROFESIONAL',
        'barberia-profesional',
        'Conviértete en barbero profesional. Aprende técnicas de corte, afeitado, diseño de barba y atención al cliente.',
        'Curso completo de barbería profesional',
        'Dos meses',
        'presencial',
        'images/talleres/barberia_profesional.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20barbería',
        10
    ),
    (
        cat_tecnico_id,
        'INSTALACIÓN Y MANTENIMIENTO DE AIRE ACONDICIONADO',
        'instalacion-mantenimiento-aire-acondicionado',
        'Aprende a instalar, reparar y dar mantenimiento a sistemas de aire acondicionado residencial y comercial.',
        'Instalación y mantenimiento profesional de aires acondicionados',
        'Mes y medio',
        'hibrido',
        'images/talleres/mantenimiento_aire_acondicionado.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20aire%20acondicionado',
        11
    );

    -- =====================================================
    -- CURSOS ACADÉMICOS
    -- =====================================================

    INSERT INTO public.courses (
        category_id, title, slug, description, short_description,
        duration, modality, image_url, is_certificate_free,
        whatsapp_link, display_order
    ) VALUES
    (
        cat_academico_id,
        'CAMPAÑAS PUBLICITARIAS EN FACEBOOK ADS Y TIKTOK ADS',
        'campanas-publicitarias-facebook-tiktok',
        'Domina la publicidad digital en redes sociales. Aprende a crear campañas efectivas en Facebook Ads y TikTok Ads para hacer crecer tu negocio.',
        'Publicidad digital en Facebook y TikTok',
        'Mes y medio',
        'hibrido',
        'images/cursos/CAMPAÑAS_PUBLICITARIAS.webp',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20campañas%20publicitarias',
        1
    ),
    (
        cat_academico_id,
        'EXCEL NIVEL BÁSICO, INTERMEDIO Y AVANZADO',
        'excel-basico-intermedio-avanzado',
        'Curso completo de Excel desde nivel básico hasta avanzado. Aprende fórmulas, tablas dinámicas, macros y análisis de datos.',
        'Excel completo: básico, intermedio y avanzado',
        '3 meses',
        'hibrido',
        'images/cursos/excel.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20Excel',
        2
    ),
    (
        cat_academico_id,
        'AUTOCAD BÁSICO, INTERMEDIO Y AVANZADO',
        'autocad-basico-intermedio-avanzado',
        'Domina AutoCAD desde cero hasta nivel avanzado. Aprende diseño 2D, 3D y modelado para proyectos de arquitectura e ingeniería.',
        'AutoCAD completo: diseño 2D y 3D profesional',
        '3 meses',
        'hibrido',
        'images/cursos/AUTOCAD.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20AutoCAD',
        3
    ),
    (
        cat_academico_id,
        'LECTURA DE PLANOS PARA LA CONSTRUCCIÓN',
        'lectura-planos-construccion',
        'Aprende a interpretar planos arquitectónicos, estructurales y de instalaciones. Esencial para trabajar en el sector construcción.',
        'Interpretación profesional de planos de construcción',
        'Mes y medio',
        'hibrido',
        'images/cursos/lectura_planos.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20lectura%20de%20planos',
        4
    ),
    (
        cat_academico_id,
        'IMPORTACIONES DEL MUNDO',
        'importaciones-del-mundo',
        'Aprende a importar productos desde cualquier parte del mundo. Incluye logística, trámites aduaneros y estrategias de negocio.',
        'Curso completo de importaciones internacionales',
        'Mes y medio',
        'hibrido',
        'images/cursos/IMPORTACIONES_MUNDO.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20importaciones',
        5
    ),
    (
        cat_academico_id,
        'BOLSA DE VALORES',
        'bolsa-de-valores',
        'Aprende a invertir en la bolsa de valores. Entiende el mercado financiero, análisis de acciones y estrategias de inversión.',
        'Inversiones en bolsa de valores para principiantes',
        'Mes y medio',
        'hibrido',
        'images/cursos/BOLSA_VALORES.jpg',
        true,
        'https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20el%20curso%20de%20bolsa%20de%20valores',
        6
    )
    ON CONFLICT (slug) DO NOTHING;

END $$;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Cursos insertados exitosamente';
END $$;

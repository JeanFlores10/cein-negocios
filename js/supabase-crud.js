// =====================================================
// FUNCIONES CRUD PARA CEIN-NEGOCIOS CON SUPABASE
// Operaciones de Create, Read, Update, Delete
// =====================================================

// =====================================================
// CATEGORÍAS
// =====================================================

/**
 * Obtener todas las categorías activas
 */
async function getCategories(includeInactive = false) {
    try {
        let query = supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (!includeInactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener categorías');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener categoría por slug
 */
async function getCategoryBySlug(slug) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener categoría');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// CURSOS
// =====================================================

/**
 * Obtener todos los cursos activos
 */
async function getCourses(options = {}) {
    try {
        let query = supabase
            .from('courses')
            .select(`
                *,
                category:categories(*)
            `)
            .order('display_order', { ascending: true });

        // Filtrar por categoría si se especifica
        if (options.categoryId) {
            query = query.eq('category_id', options.categoryId);
        }

        // Filtrar por modalidad si se especifica
        if (options.modality) {
            query = query.eq('modality', options.modality);
        }

        // Incluir inactivos solo si se especifica
        if (!options.includeInactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener cursos');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener curso por slug
 */
async function getCourseBySlug(slug) {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                category:categories(*)
            `)
            .eq('slug', slug)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener curso');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener curso por ID
 */
async function getCourseById(id) {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                category:categories(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener curso');
        return { success: false, error: mensaje };
    }
}

/**
 * Crear nuevo curso (solo admin)
 */
async function createCourse(courseData) {
    try {
        const { data, error } = await supabase
            .from('courses')
            .insert([courseData])
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Curso creado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'crear curso');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar curso (solo admin)
 */
async function updateCourse(courseId, updates) {
    try {
        const { data, error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', courseId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Curso actualizado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar curso');
        return { success: false, error: mensaje };
    }
}

/**
 * Eliminar curso (solo admin)
 */
async function deleteCourse(courseId) {
    try {
        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId);

        if (error) throw error;

        return { success: true, message: 'Curso eliminado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'eliminar curso');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// INSCRIPCIONES (ENROLLMENTS)
// =====================================================

/**
 * Inscribir usuario a un curso
 */
async function enrollInCourse(userId, courseId, notes = '') {
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .insert([{
                user_id: userId,
                course_id: courseId,
                status: 'pending',
                notes: notes
            }])
            .select(`
                *,
                course:courses(*),
                user:profiles(*)
            `)
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Inscripción realizada exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'inscribir en curso');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener inscripciones de un usuario
 */
async function getUserEnrollments(userId) {
    try {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                course:courses(
                    *,
                    category:categories(*)
                )
            `)
            .eq('user_id', userId)
            .order('enrolled_at', { ascending: false });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener inscripciones');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar estado de inscripción (solo admin)
 */
async function updateEnrollmentStatus(enrollmentId, status, paymentStatus = null) {
    try {
        const updates = { status };
        if (paymentStatus) {
            updates.payment_status = paymentStatus;
        }
        if (status === 'completed') {
            updates.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('enrollments')
            .update(updates)
            .eq('id', enrollmentId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Inscripción actualizada exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar inscripción');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// CERTIFICADOS
// =====================================================

/**
 * Crear certificado para un estudiante
 */
async function createCertificate(enrollmentId, userId, courseId, studentName, studentDocument) {
    try {
        // Generar código único de certificado
        const certificateCode = `CEIN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const { data, error } = await supabase
            .from('certificates')
            .insert([{
                enrollment_id: enrollmentId,
                user_id: userId,
                course_id: courseId,
                certificate_code: certificateCode,
                student_name: studentName,
                student_document: studentDocument,
                issue_date: new Date().toISOString().split('T')[0]
            }])
            .select(`
                *,
                course:courses(*),
                user:profiles(*)
            `)
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Certificado creado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'crear certificado');
        return { success: false, error: mensaje };
    }
}

/**
 * Buscar certificado por código
 */
async function getCertificateByCode(certificateCode) {
    try {
        const { data, error } = await supabase
            .from('certificates')
            .select(`
                *,
                course:courses(
                    title,
                    category:categories(name)
                ),
                user:profiles(full_name)
            `)
            .eq('certificate_code', certificateCode)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'buscar certificado');
        return { success: false, error: mensaje };
    }
}

/**
 * Buscar certificados por número de documento
 */
async function getCertificatesByDocument(studentDocument) {
    try {
        const { data, error } = await supabase
            .from('certificates')
            .select(`
                *,
                course:courses(
                    title,
                    category:categories(name)
                )
            `)
            .eq('student_document', studentDocument)
            .eq('is_valid', true)
            .order('issue_date', { ascending: false });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'buscar certificados');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener certificados de un usuario
 */
async function getUserCertificates(userId) {
    try {
        const { data, error } = await supabase
            .from('certificates')
            .select(`
                *,
                course:courses(
                    title,
                    category:categories(name)
                )
            `)
            .eq('user_id', userId)
            .eq('is_valid', true)
            .order('issue_date', { ascending: false });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener certificados');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// MENSAJES DE CONTACTO
// =====================================================

/**
 * Crear mensaje de contacto
 */
async function createContactMessage(messageData) {
    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([{
                full_name: messageData.fullName,
                email: messageData.email,
                phone: messageData.phone,
                service_interest: messageData.serviceInterest,
                message: messageData.message,
                ip_address: messageData.ipAddress,
                user_agent: navigator.userAgent
            }])
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Mensaje enviado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'enviar mensaje');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener mensajes de contacto (solo admin)
 */
async function getContactMessages(status = null) {
    try {
        let query = supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener mensajes');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar estado de mensaje (solo admin)
 */
async function updateContactMessageStatus(messageId, status) {
    try {
        const { data, error } = await supabase
            .from('contact_messages')
            .update({ status })
            .eq('id', messageId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Estado actualizado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar mensaje');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// TESTIMONIOS
// =====================================================

/**
 * Obtener testimonios publicados
 */
async function getPublishedTestimonials(featuredOnly = false) {
    try {
        let query = supabase
            .from('testimonials')
            .select('*')
            .eq('is_published', true)
            .order('display_order', { ascending: true });

        if (featuredOnly) {
            query = query.eq('is_featured', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener testimonios');
        return { success: false, error: mensaje };
    }
}

/**
 * Crear testimonio
 */
async function createTestimonial(testimonialData) {
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .insert([testimonialData])
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Testimonio enviado exitosamente. Será revisado por nuestro equipo.' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'crear testimonio');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar testimonio (solo admin)
 */
async function updateTestimonial(testimonialId, updates) {
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .update(updates)
            .eq('id', testimonialId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Testimonio actualizado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar testimonio');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// ESTADÍSTICAS Y REPORTES
// =====================================================

/**
 * Obtener estadísticas del dashboard (solo admin)
 */
async function getDashboardStats() {
    try {
        // Contar cursos activos
        const { count: coursesCount, error: coursesError } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        if (coursesError) throw coursesError;

        // Contar inscripciones activas
        const { count: enrollmentsCount, error: enrollmentsError } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .in('status', ['active', 'pending']);

        if (enrollmentsError) throw enrollmentsError;

        // Contar certificados emitidos
        const { count: certificatesCount, error: certificatesError } = await supabase
            .from('certificates')
            .select('*', { count: 'exact', head: true })
            .eq('is_valid', true);

        if (certificatesError) throw certificatesError;

        // Contar mensajes nuevos
        const { count: messagesCount, error: messagesError } = await supabase
            .from('contact_messages')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'new');

        if (messagesError) throw messagesError;

        return {
            success: true,
            data: {
                activeCourses: coursesCount || 0,
                activeEnrollments: enrollmentsCount || 0,
                certificatesIssued: certificatesCount || 0,
                newMessages: messagesCount || 0
            }
        };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener estadísticas');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// CONTENIDO DE INICIO (HOMEPAGE)
// =====================================================

/**
 * Obtener todo el contenido de homepage
 */
async function getHomepageContent(includeInactive = false) {
    try {
        let query = supabase
            .from('homepage_content')
            .select('*')
            .order('display_order', { ascending: true });

        if (!includeInactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener contenido de inicio');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener contenido por sección
 */
async function getHomepageContentBySection(section) {
    try {
        const { data, error } = await supabase
            .from('homepage_content')
            .select('*')
            .eq('section', section)
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener contenido por sección');
        return { success: false, error: mensaje };
    }
}

/**
 * Crear contenido de homepage
 */
async function createHomepageContent(contentData) {
    try {
        const { data, error } = await supabase
            .from('homepage_content')
            .insert([contentData])
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Contenido creado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'crear contenido');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar contenido de homepage
 */
async function updateHomepageContent(contentId, updates) {
    try {
        const { data, error } = await supabase
            .from('homepage_content')
            .update(updates)
            .eq('id', contentId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Contenido actualizado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar contenido');
        return { success: false, error: mensaje };
    }
}

/**
 * Eliminar contenido de homepage
 */
async function deleteHomepageContent(contentId) {
    try {
        const { error } = await supabase
            .from('homepage_content')
            .delete()
            .eq('id', contentId);

        if (error) throw error;

        return { success: true, message: 'Contenido eliminado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'eliminar contenido');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// NOSOTROS (ABOUT US)
// =====================================================

/**
 * Obtener contenido de Nosotros
 */
async function getAboutUs(includeInactive = false) {
    try {
        let query = supabase
            .from('about_us')
            .select('*')
            .order('display_order', { ascending: true });

        if (!includeInactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener contenido de nosotros');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener contenido por sección
 */
async function getAboutUsBySection(section) {
    try {
        const { data, error } = await supabase
            .from('about_us')
            .select('*')
            .eq('section', section)
            .eq('is_active', true)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener sección de nosotros');
        return { success: false, error: mensaje };
    }
}

/**
 * Crear contenido de Nosotros
 */
async function createAboutUs(contentData) {
    try {
        const { data, error } = await supabase
            .from('about_us')
            .insert([contentData])
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Contenido creado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'crear contenido');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar contenido de Nosotros
 */
async function updateAboutUs(contentId, updates) {
    try {
        const { data, error } = await supabase
            .from('about_us')
            .update(updates)
            .eq('id', contentId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Contenido actualizado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar contenido');
        return { success: false, error: mensaje };
    }
}

/**
 * Eliminar contenido de Nosotros
 */
async function deleteAboutUs(contentId) {
    try {
        const { error } = await supabase
            .from('about_us')
            .delete()
            .eq('id', contentId);

        if (error) throw error;

        return { success: true, message: 'Contenido eliminado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'eliminar contenido');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// EQUIPO (TEAM MEMBERS)
// =====================================================

/**
 * Obtener miembros del equipo
 */
async function getTeamMembers(includeInactive = false) {
    try {
        let query = supabase
            .from('team_members')
            .select('*')
            .order('display_order', { ascending: true });

        if (!includeInactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener miembros del equipo');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener miembro del equipo por ID
 */
async function getTeamMemberById(memberId) {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('id', memberId)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener miembro del equipo');
        return { success: false, error: mensaje };
    }
}

/**
 * Crear miembro del equipo
 */
async function createTeamMember(memberData) {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .insert([memberData])
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Miembro agregado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'agregar miembro');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar miembro del equipo
 */
async function updateTeamMember(memberId, updates) {
    try {
        const { data, error } = await supabase
            .from('team_members')
            .update(updates)
            .eq('id', memberId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Miembro actualizado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar miembro');
        return { success: false, error: mensaje };
    }
}

/**
 * Eliminar miembro del equipo
 */
async function deleteTeamMember(memberId) {
    try {
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', memberId);

        if (error) throw error;

        return { success: true, message: 'Miembro eliminado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'eliminar miembro');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// PRODUCTOS (PRODUCTS)
// =====================================================

/**
 * Obtener productos
 */
async function getProducts(options = {}) {
    try {
        let query = supabase
            .from('products')
            .select('*')
            .order('display_order', { ascending: true });

        // Filtrar por categoría
        if (options.category) {
            query = query.eq('category', options.category);
        }

        // Solo destacados
        if (options.featuredOnly) {
            query = query.eq('is_featured', true);
        }

        // Incluir inactivos
        if (!options.includeInactive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener productos');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener producto por slug
 */
async function getProductBySlug(slug) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener producto');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener producto por ID
 */
async function getProductById(productId) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener producto');
        return { success: false, error: mensaje };
    }
}

/**
 * Crear producto
 */
async function createProduct(productData) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Producto creado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'crear producto');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar producto
 */
async function updateProduct(productId, updates) {
    try {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Producto actualizado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar producto');
        return { success: false, error: mensaje };
    }
}

/**
 * Eliminar producto
 */
async function deleteProduct(productId) {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;

        return { success: true, message: 'Producto eliminado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'eliminar producto');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// ÓRDENES (ORDERS)
// =====================================================

/**
 * Obtener órdenes (solo admin)
 */
async function getOrders(options = {}) {
    try {
        let query = supabase
            .from('orders')
            .select(`
                *,
                order_items:order_items(
                    *,
                    product:products(name, image_url)
                )
            `)
            .order('created_at', { ascending: false });

        if (options.status) {
            query = query.eq('status', options.status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener órdenes');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener orden por ID
 */
async function getOrderById(orderId) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items:order_items(
                    *,
                    product:products(*)
                )
            `)
            .eq('id', orderId)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener orden');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener órdenes de un usuario
 */
async function getUserOrders(userId) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items:order_items(
                    *,
                    product:products(name, image_url)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener órdenes');
        return { success: false, error: mensaje };
    }
}

/**
 * Crear orden
 */
async function createOrder(orderData) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Orden creada exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'crear orden');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar estado de orden
 */
async function updateOrderStatus(orderId, status, paymentStatus = null) {
    try {
        const updates = { status };
        if (paymentStatus) {
            updates.payment_status = paymentStatus;
        }

        const { data, error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Estado actualizado exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar orden');
        return { success: false, error: mensaje };
    }
}

/**
 * Eliminar orden
 */
async function deleteOrder(orderId) {
    try {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) throw error;

        return { success: true, message: 'Orden eliminada exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'eliminar orden');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// ITEMS DE ORDEN
// =====================================================

/**
 * Obtener items de una orden
 */
async function getOrderItems(orderId) {
    try {
        const { data, error } = await supabase
            .from('order_items')
            .select(`
                *,
                product:products(*)
            `)
            .eq('order_id', orderId);

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener items de orden');
        return { success: false, error: mensaje };
    }
}

/**
 * Crear item de orden
 */
async function createOrderItem(itemData) {
    try {
        const { data, error } = await supabase
            .from('order_items')
            .insert([itemData])
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'agregar item a orden');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// SETTINGS (CONFIGURACIÓN)
// =====================================================

/**
 * Obtener todas las configuraciones
 */
async function getAllSettings() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .order('setting_group', { ascending: true });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener configuraciones');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener configuraciones por grupo
 */
async function getSettingsByGroup(group) {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('setting_group', group);

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener configuraciones por grupo');
        return { success: false, error: mensaje };
    }
}

/**
 * Obtener una configuración específica
 */
async function getSetting(key) {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('setting_key', key)
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'obtener configuración');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar una configuración
 */
async function updateSetting(key, value) {
    try {
        const { data, error } = await supabase
            .from('settings')
            .update({ setting_value: value })
            .eq('setting_key', key)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data, message: 'Configuración actualizada exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar configuración');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar múltiples configuraciones
 */
async function updateMultipleSettings(settings) {
    try {
        const promises = Object.entries(settings).map(([key, value]) =>
            supabase
                .from('settings')
                .update({ setting_value: value })
                .eq('setting_key', key)
        );

        const results = await Promise.all(promises);

        // Verificar si alguna tuvo error
        const hasError = results.some(result => result.error);
        if (hasError) {
            throw new Error('Error al actualizar algunas configuraciones');
        }

        return { success: true, message: 'Configuraciones actualizadas exitosamente' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualizar configuraciones');
        return { success: false, error: mensaje };
    }
}

// =====================================================
// STORAGE - GESTIÓN DE IMÁGENES
// =====================================================

/**
 * Subir una imagen a Supabase Storage
 * @param {File} file - Archivo de imagen
 * @param {string} bucket - Nombre del bucket (default: 'course-images')
 * @param {string} folder - Carpeta dentro del bucket (opcional)
 * @returns {Object} - {success, url, path, error}
 */
async function uploadImage(file, bucket = 'course-images', folder = '') {
    try {
        if (!file) {
            throw new Error('No se proporcionó ningún archivo');
        }

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            throw new Error('El archivo debe ser una imagen');
        }

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('La imagen no debe superar los 5MB');
        }

        // Generar nombre único para el archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // Subir archivo a Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            success: true,
            url: publicUrl,
            path: filePath,
            fileName: fileName
        };
    } catch (error) {
        console.error('Error al subir imagen:', error);
        return {
            success: false,
            error: error.message || 'Error al subir la imagen'
        };
    }
}

/**
 * Eliminar una imagen de Supabase Storage
 * @param {string} filePath - Ruta del archivo en el bucket
 * @param {string} bucket - Nombre del bucket
 * @returns {Object} - {success, error}
 */
async function deleteImage(filePath, bucket = 'course-images') {
    try {
        if (!filePath) {
            throw new Error('No se proporcionó la ruta del archivo');
        }

        const { data, error} = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) throw error;

        return {
            success: true,
            message: 'Imagen eliminada correctamente'
        };
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        return {
            success: false,
            error: error.message || 'Error al eliminar la imagen'
        };
    }
}

/**
 * Obtener URL pública de una imagen
 * @param {string} filePath - Ruta del archivo en el bucket
 * @param {string} bucket - Nombre del bucket
 * @returns {string} - URL pública de la imagen
 */
function getImageUrl(filePath, bucket = 'course-images') {
    try {
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error al obtener URL de imagen:', error);
        return null;
    }
}

/**
 * Subir múltiples imágenes a Supabase Storage
 * @param {FileList|Array} files - Lista de archivos
 * @param {string} bucket - Nombre del bucket
 * @param {string} folder - Carpeta dentro del bucket
 * @returns {Object} - {success, results, errors}
 */
async function uploadMultipleImages(files, bucket = 'course-images', folder = '') {
    try {
        const uploadPromises = Array.from(files).map(file =>
            uploadImage(file, bucket, folder)
        );

        const results = await Promise.all(uploadPromises);

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        return {
            success: failed.length === 0,
            results: successful,
            errors: failed,
            total: files.length,
            uploaded: successful.length,
            failed: failed.length
        };
    } catch (error) {
        console.error('Error al subir imágenes:', error);
        return {
            success: false,
            error: error.message || 'Error al subir las imágenes'
        };
    }
}

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================

window.supabaseCRUD = {
    // Categorías
    getCategories,
    getCategoryBySlug,

    // Cursos
    getCourses,
    getCourseBySlug,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,

    // Inscripciones
    enrollInCourse,
    getUserEnrollments,
    updateEnrollmentStatus,

    // Certificados
    createCertificate,
    getCertificateByCode,
    getCertificatesByDocument,
    getUserCertificates,

    // Mensajes de contacto
    createContactMessage,
    getContactMessages,
    updateContactMessageStatus,

    // Testimonios
    getPublishedTestimonials,
    createTestimonial,
    updateTestimonial,

    // Estadísticas
    getDashboardStats,

    // Contenido de Inicio (Homepage)
    getHomepageContent,
    getHomepageContentBySection,
    createHomepageContent,
    updateHomepageContent,
    deleteHomepageContent,

    // Nosotros (About Us)
    getAboutUs,
    getAboutUsBySection,
    createAboutUs,
    updateAboutUs,
    deleteAboutUs,

    // Equipo (Team Members)
    getTeamMembers,
    getTeamMemberById,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,

    // Productos (Products)
    getProducts,
    getProductBySlug,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,

    // Órdenes (Orders)
    getOrders,
    getOrderById,
    getUserOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,

    // Items de Orden
    getOrderItems,
    createOrderItem,

    // Settings (Configuración)
    getAllSettings,
    getSettingsByGroup,
    getSetting,
    updateSetting,
    updateMultipleSettings,

    // Storage (Imágenes)
    uploadImage,
    deleteImage,
    getImageUrl,
    uploadMultipleImages
};

// =====================================================
// CRUD COMPLETO PARA DASHBOARD
// Gestión de cursos, mensajes, certificados, etc.
// =====================================================

document.addEventListener('DOMContentLoaded', async function() {
    // Proteger página - solo admins
    await supabaseAuth.protectPage('admin');

    // Cargar estadísticas del dashboard
    await cargarEstadisticas();

    // Inicializar navegación del sidebar
    inicializarSidebarNavegacion();

    // Guardar contenido original del dashboard
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer && !window.dashboardOriginalContent) {
        window.dashboardOriginalContent = dashboardContainer.innerHTML;
    }

    // Inicializar gestión de cursos
    inicializarGestionCursos();

    // Inicializar gestión de mensajes
    inicializarGestionMensajes();

    // Inicializar gestión de certificados
    inicializarGestionCertificados();

    // Inicializar gestión de testimonios
    inicializarGestionTestimonios();

    // Inicializar gestión de Inicio
    inicializarGestionInicio();

    // Inicializar gestión de Nosotros
    inicializarGestionNosotros();

    // Inicializar gestión de Tienda
    inicializarGestionTienda();
});

// =====================================================
// NAVEGACIÓN DEL SIDEBAR
// =====================================================

function inicializarSidebarNavegacion() {
    const sidebarLinks = document.querySelectorAll('.admin-sidebar-nav .admin-nav-link');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();

            // Remover clase active de todos los links
            sidebarLinks.forEach(l => l.classList.remove('active'));

            // Agregar clase active al link clickeado
            this.classList.add('active');

            // Obtener el href para determinar qué sección cargar
            const href = this.getAttribute('href');

            // Cerrar sidebar en móvil después de click
            const sidebar = document.querySelector('.admin-sidebar');
            if (window.innerWidth <= 992 && sidebar) {
                sidebar.classList.remove('active');
            }

            // Cargar la sección correspondiente
            switch(href) {
                case '#dashboard':
                    mostrarDashboardPrincipal();
                    break;
                case '#inicio':
                    await mostrarGestionInicio();
                    break;
                case '#servicios':
                    await mostrarGestionCursos();
                    break;
                case '#nosotros':
                    await mostrarGestionNosotros();
                    break;
                case '#exito':
                    await mostrarGestionTestimonios();
                    break;
                case '#tienda':
                    await mostrarGestionTienda();
                    break;
                case '#contacto':
                    await mostrarGestionMensajes();
                    break;
                case '#certificados':
                    await mostrarGestionCertificados();
                    break;
                case '#usuarios':
                    await mostrarGestionUsuarios();
                    break;
                case '#configuracion':
                    await mostrarConfiguracion();
                    break;
                default:
                    mostrarDashboardPrincipal();
            }
        });
    });
}

function mostrarDashboardPrincipal() {
    const dashboardContainer = document.querySelector('.dashboard-container');

    if (window.dashboardOriginalContent) {
        dashboardContainer.innerHTML = window.dashboardOriginalContent;

        // Re-inicializar eventos de los cards
        inicializarGestionCursos();
        inicializarGestionMensajes();
        inicializarGestionTestimonios();
        inicializarGestionInicio();
        inicializarGestionNosotros();
        inicializarGestionTienda();
    } else {
        location.reload();
    }
}

// =====================================================
// ESTADÍSTICAS DEL DASHBOARD
// =====================================================

async function cargarEstadisticas() {
    try {
        const result = await supabaseCRUD.getDashboardStats();

        if (result.success) {
            mostrarEstadisticas(result.data);
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

function mostrarEstadisticas(stats) {
    // Actualizar badges en el sidebar si existen
    const serviciosBadge = document.querySelector('a[href="#servicios"] .admin-nav-badge');
    const contactoBadge = document.querySelector('a[href="#contacto"] .admin-nav-badge');

    if (serviciosBadge) {
        serviciosBadge.textContent = stats.activeCourses || 0;
    }

    if (contactoBadge) {
        contactoBadge.textContent = stats.newMessages || 0;
    }

    console.log('Estadísticas cargadas:', stats);
}

// =====================================================
// GESTIÓN DE CURSOS
// =====================================================

function inicializarGestionCursos() {
    // Evento para el card completo de servicios
    const serviciosCard = document.querySelector('.dashboard-card h3 i.fa-concierge-bell');

    if (serviciosCard) {
        const card = serviciosCard.closest('.dashboard-card');
        card.style.cursor = 'pointer';

        // Agregar evento al card completo
        card.addEventListener('click', async function(e) {
            // Solo si no se clickeó un link específico
            if (!e.target.closest('a')) {
                await mostrarGestionCursos();
            }
        });

        // Agregar eventos a los links específicos dentro del card
        const links = card.querySelectorAll('.dashboard-list a');
        links.forEach(link => {
            link.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                const text = this.textContent.trim();

                if (text.includes('Agregar Nuevo Servicio')) {
                    mostrarFormularioCurso();
                } else if (text.includes('Editar Servicios Existentes')) {
                    await mostrarGestionCursos();
                } else if (text.includes('Gestionar Imágenes')) {
                    await mostrarGestionCursos();
                }
            });
        });
    }
}

async function mostrarGestionCursos() {
    try {
        const result = await supabaseCRUD.getCourses({ includeInactive: true });

        if (!result.success) {
            alert('Error al cargar cursos: ' + result.error);
            return;
        }

        renderizarTablaCursos(result.data);
    } catch (error) {
        console.error('Error en mostrarGestionCursos:', error);
        alert('Error al cargar cursos');
    }
}

function renderizarTablaCursos(cursos) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    // Crear barra de búsqueda y filtros
    const searchFilterBar = createSearchFilterBar({
        searchId: 'search-cursos',
        searchPlaceholder: 'Buscar por título, categoría o duración...',
        tableId: 'table-cursos',
        filters: [
            {
                id: 'filter-estado',
                label: 'Estado',
                options: [
                    { value: 'activo', text: 'Activo' },
                    { value: 'inactivo', text: 'Inactivo' }
                ]
            },
            {
                id: 'filter-modalidad',
                label: 'Modalidad',
                options: [
                    { value: 'presencial', text: 'Presencial' },
                    { value: 'virtual', text: 'Virtual' },
                    { value: 'híbrido', text: 'Híbrido' }
                ]
            }
        ]
    });

    // Limpiar dashboard y mostrar tabla de cursos
    const tablaHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Gestión de Cursos</h2>
            <button class="btn" onclick="mostrarFormularioCurso()">
                <i class="fas fa-plus"></i> Nuevo Curso
            </button>
        </div>

        ${searchFilterBar}

        <table class="dashboard-table" id="table-cursos">
            <thead>
                <tr>
                    <th>Título</th>
                    <th>Categoría</th>
                    <th>Duración</th>
                    <th>Modalidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${cursos.map(curso => `
                    <tr>
                        <td>${curso.title}</td>
                        <td>${curso.category?.name || 'Sin categoría'}</td>
                        <td>${curso.duration}</td>
                        <td>${traducirModalidad(curso.modality)}</td>
                        <td>${curso.is_active ? '<span class="badge-success">Activo</span>' : '<span class="badge-inactive">Inactivo</span>'}</td>
                        <td class="table-actions">
                            <button class="btn btn-edit" onclick="editarCurso('${curso.id}')">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-delete" onclick="eliminarCurso('${curso.id}', '${curso.title}')">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="volverDashboard()">
                <i class="fas fa-arrow-left"></i> Volver al Dashboard
            </button>
        </div>
    `;

    // Guardar el contenido original
    if (!window.dashboardOriginalContent) {
        window.dashboardOriginalContent = dashboardContainer.innerHTML;
    }

    dashboardContainer.innerHTML = tablaHTML;

    // Inicializar búsqueda y filtros
    setTimeout(() => {
        initializeTableSearch('table-cursos', 'search-cursos', [0, 1, 2, 3]); // Buscar en título, categoría, duración, modalidad
        initializeTableFilter('table-cursos', 'filter-estado', 4); // Filtrar por estado (columna 4)
        initializeTableFilter('table-cursos', 'filter-modalidad', 3); // Filtrar por modalidad (columna 3)
        updateResultsCount('table-cursos');
    }, 100);
}

function mostrarFormularioCurso(cursoId = null) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const formHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">${cursoId ? 'Editar' : 'Nuevo'} Curso</h2>
        </div>

        <div class="dashboard-form">
            <form id="form-curso" class="form-grid">
                <div class="form-group">
                    <label for="curso-title">Título del Curso *</label>
                    <input type="text" id="curso-title" name="title" required>
                </div>

                <div class="form-group">
                    <label for="curso-category">Categoría *</label>
                    <select id="curso-category" name="category_id" required>
                        <option value="">Seleccione una categoría</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="curso-duration">Duración *</label>
                    <input type="text" id="curso-duration" name="duration" placeholder="Ej: Mes y medio" required>
                </div>

                <div class="form-group">
                    <label for="curso-modality">Modalidad *</label>
                    <select id="curso-modality" name="modality" required>
                        <option value="presencial">Presencial</option>
                        <option value="virtual">Virtual</option>
                        <option value="hibrido">Híbrido (Presencial y Virtual)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="curso-price-enrollment">Precio de Matrícula</label>
                    <input type="number" id="curso-price-enrollment" name="price_enrollment" step="0.01" min="0">
                </div>

                <div class="form-group">
                    <label for="curso-price-monthly">Precio Mensual</label>
                    <input type="number" id="curso-price-monthly" name="price_monthly" step="0.01" min="0">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="curso-short-description">Descripción Corta</label>
                    <input type="text" id="curso-short-description" name="short_description" maxlength="200">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="curso-description">Descripción Completa</label>
                    <textarea id="curso-description" name="description" rows="5"></textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="curso-image-url">URL de Imagen</label>
                    <input type="text" id="curso-image-url" name="image_url" placeholder="images/cursos/mi-curso.jpg">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="curso-whatsapp-link">Enlace de WhatsApp</label>
                    <input type="text" id="curso-whatsapp-link" name="whatsapp_link" placeholder="https://wa.me/...">
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="curso-is-active" name="is_active" checked>
                        Curso Activo
                    </label>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="curso-is-certificate-free" name="is_certificate_free" checked>
                        Certificado Gratuito
                    </label>
                </div>
            </form>

            <div class="form-actions">
                <button type="button" class="btn btn-save" onclick="guardarCurso('${cursoId || ''}')">
                    <i class="fas fa-save"></i> Guardar Curso
                </button>
                <button type="button" class="btn btn-cancel" onclick="mostrarGestionCursos()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = formHTML;

    // Cargar categorías en el select
    cargarCategoriasEnSelect();

    // Si es edición, cargar datos del curso
    if (cursoId) {
        cargarDatosCurso(cursoId);
    }
}

async function cargarCategoriasEnSelect() {
    try {
        const result = await supabaseCRUD.getCategories(true);

        if (result.success) {
            const select = document.getElementById('curso-category');

            result.data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
    }
}

async function cargarDatosCurso(cursoId) {
    try {
        const result = await supabaseCRUD.getCourseById(cursoId);

        if (result.success) {
            const curso = result.data;

            // Llenar formulario
            document.getElementById('curso-title').value = curso.title || '';
            document.getElementById('curso-category').value = curso.category_id || '';
            document.getElementById('curso-duration').value = curso.duration || '';
            document.getElementById('curso-modality').value = curso.modality || '';
            document.getElementById('curso-price-enrollment').value = curso.price_enrollment || '';
            document.getElementById('curso-price-monthly').value = curso.price_monthly || '';
            document.getElementById('curso-short-description').value = curso.short_description || '';
            document.getElementById('curso-description').value = curso.description || '';
            document.getElementById('curso-image-url').value = curso.image_url || '';
            document.getElementById('curso-whatsapp-link').value = curso.whatsapp_link || '';
            document.getElementById('curso-is-active').checked = curso.is_active;
            document.getElementById('curso-is-certificate-free').checked = curso.is_certificate_free;
        }
    } catch (error) {
        console.error('Error al cargar datos del curso:', error);
        alert('Error al cargar datos del curso');
    }
}

async function guardarCurso(cursoId) {
    const form = document.getElementById('form-curso');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Recoger datos del formulario
    const datos = {
        title: document.getElementById('curso-title').value,
        category_id: document.getElementById('curso-category').value,
        duration: document.getElementById('curso-duration').value,
        modality: document.getElementById('curso-modality').value,
        price_enrollment: document.getElementById('curso-price-enrollment').value || null,
        price_monthly: document.getElementById('curso-price-monthly').value || null,
        short_description: document.getElementById('curso-short-description').value || null,
        description: document.getElementById('curso-description').value || null,
        image_url: document.getElementById('curso-image-url').value || null,
        whatsapp_link: document.getElementById('curso-whatsapp-link').value || null,
        is_active: document.getElementById('curso-is-active').checked,
        is_certificate_free: document.getElementById('curso-is-certificate-free').checked
    };

    // Generar slug si es nuevo curso
    if (!cursoId) {
        datos.slug = generarSlug(datos.title);
    }

    try {
        let result;

        if (cursoId) {
            // Actualizar curso existente
            result = await supabaseCRUD.updateCourse(cursoId, datos);
        } else {
            // Crear nuevo curso
            result = await supabaseCRUD.createCourse(datos);
        }

        if (result.success) {
            alert(result.message);
            mostrarGestionCursos();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error al guardar curso:', error);
        alert('Error al guardar curso');
    }
}

async function editarCurso(cursoId) {
    mostrarFormularioCurso(cursoId);
}

async function eliminarCurso(cursoId, titulo) {
    if (!confirm(`¿Estás seguro de eliminar el curso "${titulo}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const result = await supabaseCRUD.deleteCourse(cursoId);

        if (result.success) {
            alert(result.message);
            mostrarGestionCursos();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        alert('Error al eliminar curso');
    }
}

// =====================================================
// GESTIÓN DE MENSAJES DE CONTACTO
// =====================================================

function inicializarGestionMensajes() {
    const contactoCard = document.querySelector('.dashboard-card h3 i.fa-address-book');

    if (contactoCard) {
        const card = contactoCard.closest('.dashboard-card');
        card.style.cursor = 'pointer';

        // Evento al card completo
        card.addEventListener('click', async function(e) {
            if (!e.target.closest('a')) {
                await mostrarGestionMensajes();
            }
        });

        // Eventos a links específicos
        const links = card.querySelectorAll('.dashboard-list a');
        links.forEach(link => {
            link.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                await mostrarGestionMensajes();
            });
        });
    }
}

async function mostrarGestionMensajes() {
    try {
        const result = await supabaseCRUD.getContactMessages();

        if (!result.success) {
            alert('Error al cargar mensajes: ' + result.error);
            return;
        }

        renderizarTablaMensajes(result.data);
    } catch (error) {
        console.error('Error en mostrarGestionMensajes:', error);
        alert('Error al cargar mensajes');
    }
}

function renderizarTablaMensajes(mensajes) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    // Crear barra de búsqueda y filtros
    const searchFilterBar = createSearchFilterBar({
        searchId: 'search-mensajes',
        searchPlaceholder: 'Buscar por nombre, email, servicio o mensaje...',
        tableId: 'table-mensajes',
        filters: [
            {
                id: 'filter-estado-msg',
                label: 'Estado',
                options: [
                    { value: 'nuevo', text: 'Nuevo' },
                    { value: 'leído', text: 'Leído' },
                    { value: 'respondido', text: 'Respondido' },
                    { value: 'archivado', text: 'Archivado' }
                ]
            }
        ]
    });

    const tablaHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Mensajes de Contacto</h2>
        </div>

        ${searchFilterBar}

        <table class="dashboard-table" id="table-mensajes">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Servicio</th>
                    <th>Mensaje</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${mensajes.map(msg => `
                    <tr>
                        <td>${formatearFecha(msg.created_at)}</td>
                        <td>${msg.full_name}</td>
                        <td>${msg.email}</td>
                        <td>${msg.phone || '-'}</td>
                        <td>${msg.service_interest || '-'}</td>
                        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${msg.message}">
                            ${msg.message}
                        </td>
                        <td>${traducirEstadoMensaje(msg.status)}</td>
                        <td class="table-actions">
                            <select onchange="cambiarEstadoMensaje('${msg.id}', this.value)">
                                <option value="">Cambiar estado...</option>
                                <option value="read">Marcar como leído</option>
                                <option value="replied">Marcar como respondido</option>
                                <option value="archived">Archivar</option>
                            </select>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="volverDashboard()">
                <i class="fas fa-arrow-left"></i> Volver al Dashboard
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = tablaHTML;

    // Inicializar búsqueda y filtros
    setTimeout(() => {
        initializeTableSearch('table-mensajes', 'search-mensajes', [1, 2, 4, 5]); // Nombre, email, servicio, mensaje
        initializeTableFilter('table-mensajes', 'filter-estado-msg', 6); // Filtrar por estado (columna 6)
        updateResultsCount('table-mensajes');
    }, 100);
}

async function cambiarEstadoMensaje(mensajeId, nuevoEstado) {
    if (!nuevoEstado) return;

    try {
        const result = await supabaseCRUD.updateContactMessageStatus(mensajeId, nuevoEstado);

        if (result.success) {
            mostrarGestionMensajes(); // Recargar tabla
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar estado del mensaje');
    }
}

// =====================================================
// GESTIÓN DE CERTIFICADOS
// =====================================================

function inicializarGestionCertificados() {
    const certificadosCard = document.querySelector('.dashboard-card h3 i.fa-certificate');

    if (certificadosCard) {
        const card = certificadosCard.closest('.dashboard-card');
        card.style.cursor = 'pointer';

        card.addEventListener('click', async function(e) {
            if (!e.target.closest('a')) {
                await mostrarGestionCertificados();
            }
        });

        const links = card.querySelectorAll('.dashboard-list a');
        links.forEach(link => {
            link.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                await mostrarGestionCertificados();
            });
        });
    }
}

async function mostrarGestionCertificados() {
    try {
        const { data, error } = await supabase
            .from('certificates')
            .select(`
                *,
                user:profiles!certificates_user_id_fkey(full_name, email),
                course:courses!certificates_course_id_fkey(title)
            `)
            .order('issued_date', { ascending: false });

        if (error) throw error;

        renderizarTablaCertificados(data || []);
    } catch (error) {
        console.error('Error al cargar certificados:', error);
        alert('Error al cargar certificados');
    }
}

function renderizarTablaCertificados(certificados) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    // Crear barra de búsqueda
    const searchFilterBar = createSearchFilterBar({
        searchId: 'search-certificados',
        searchPlaceholder: 'Buscar por código, estudiante o curso...',
        tableId: 'table-certificados',
        filters: []
    });

    const tablaHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Gestión de Certificados</h2>
            <button class="btn" onclick="mostrarFormularioCertificado()">
                <i class="fas fa-plus"></i> Nuevo Certificado
            </button>
        </div>

        <div class="stats-grid" style="margin-bottom: 30px;">
            <div class="stat-card">
                <div class="stat-number">${certificados.length}</div>
                <div class="stat-label">Total Certificados</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${new Date().getFullYear()}</div>
                <div class="stat-label">Año Actual</div>
            </div>
        </div>

        ${searchFilterBar}

        <table class="dashboard-table" id="table-certificados">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Estudiante</th>
                    <th>Curso</th>
                    <th>Fecha Emisión</th>
                    <th>Fecha Expiración</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${certificados.length === 0 ? `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px;">
                            No hay certificados registrados
                        </td>
                    </tr>
                ` : certificados.map(cert => `
                    <tr>
                        <td><strong>${cert.certificate_code}</strong></td>
                        <td>${cert.user?.full_name || 'Usuario eliminado'}</td>
                        <td>${cert.course?.title || 'Curso eliminado'}</td>
                        <td>${formatearFecha(cert.issued_date)}</td>
                        <td>${cert.expiration_date ? formatearFecha(cert.expiration_date) : 'Sin expiración'}</td>
                        <td class="table-actions">
                            <button class="btn btn-outline" onclick="verCertificado('${cert.certificate_code}')" title="Ver certificado">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-edit" onclick="editarCertificado('${cert.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-delete" onclick="eliminarCertificado('${cert.id}', '${cert.certificate_code}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="mostrarDashboardPrincipal()">
                <i class="fas fa-arrow-left"></i> Volver al Dashboard
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = tablaHTML;

    // Inicializar búsqueda
    setTimeout(() => {
        initializeTableSearch('table-certificados', 'search-certificados', [0, 1, 2]); // Código, estudiante, curso
        updateResultsCount('table-certificados');
    }, 100);
}

function mostrarFormularioCertificado(certId = null) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const formHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">${certId ? 'Editar' : 'Nuevo'} Certificado</h2>
        </div>

        <div class="dashboard-form">
            <form id="form-certificado" class="form-grid">
                <div class="form-group">
                    <label for="cert-user">Estudiante *</label>
                    <select id="cert-user" name="user_id" required>
                        <option value="">Seleccione estudiante...</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="cert-course">Curso *</label>
                    <select id="cert-course" name="course_id" required>
                        <option value="">Seleccione curso...</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="cert-code">Código del Certificado *</label>
                    <input type="text" id="cert-code" name="certificate_code" required placeholder="CERT-2025-001">
                </div>

                <div class="form-group">
                    <label for="cert-issued">Fecha de Emisión *</label>
                    <input type="date" id="cert-issued" name="issued_date" required value="${new Date().toISOString().split('T')[0]}">
                </div>

                <div class="form-group">
                    <label for="cert-expiration">Fecha de Expiración</label>
                    <input type="date" id="cert-expiration" name="expiration_date">
                    <small>Dejar vacío si no expira</small>
                </div>

                <div class="form-group">
                    <label for="cert-grade">Calificación</label>
                    <input type="number" id="cert-grade" name="grade" min="0" max="20" step="0.1" placeholder="Ej: 18.5">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="cert-url">URL del Certificado PDF</label>
                    <input type="text" id="cert-url" name="certificate_url" placeholder="https://...">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="cert-notes">Notas Adicionales</label>
                    <textarea id="cert-notes" name="notes" rows="3"></textarea>
                </div>
            </form>

            <div class="form-actions">
                <button type="button" class="btn btn-save" onclick="guardarCertificado('${certId || ''}')">
                    <i class="fas fa-save"></i> Guardar Certificado
                </button>
                <button type="button" class="btn btn-cancel" onclick="mostrarGestionCertificados()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = formHTML;

    // Cargar usuarios y cursos
    cargarUsuariosYCursos(certId);
}

async function cargarUsuariosYCursos(certId) {
    try {
        // Cargar usuarios
        const { data: usuarios, error: errorUsuarios } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('role', 'student')
            .order('full_name');

        if (!errorUsuarios && usuarios) {
            const selectUser = document.getElementById('cert-user');
            usuarios.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.full_name} (${user.email})`;
                selectUser.appendChild(option);
            });
        }

        // Cargar cursos
        const { data: cursos, error: errorCursos } = await supabase
            .from('courses')
            .select('id, title')
            .eq('is_active', true)
            .order('title');

        if (!errorCursos && cursos) {
            const selectCourse = document.getElementById('cert-course');
            cursos.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.title;
                selectCourse.appendChild(option);
            });
        }

        // Si es edición, cargar datos
        if (certId) {
            cargarDatosCertificado(certId);
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

async function cargarDatosCertificado(certId) {
    try {
        const { data, error } = await supabase
            .from('certificates')
            .select('*')
            .eq('id', certId)
            .single();

        if (error) throw error;

        if (data) {
            document.getElementById('cert-user').value = data.user_id;
            document.getElementById('cert-course').value = data.course_id;
            document.getElementById('cert-code').value = data.certificate_code;
            document.getElementById('cert-issued').value = data.issued_date.split('T')[0];
            if (data.expiration_date) {
                document.getElementById('cert-expiration').value = data.expiration_date.split('T')[0];
            }
            if (data.grade) {
                document.getElementById('cert-grade').value = data.grade;
            }
            if (data.certificate_url) {
                document.getElementById('cert-url').value = data.certificate_url;
            }
            if (data.notes) {
                document.getElementById('cert-notes').value = data.notes;
            }
        }
    } catch (error) {
        console.error('Error al cargar certificado:', error);
        alert('Error al cargar datos del certificado');
    }
}

async function guardarCertificado(certId) {
    const form = document.getElementById('form-certificado');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const datos = {
        user_id: document.getElementById('cert-user').value,
        course_id: document.getElementById('cert-course').value,
        certificate_code: document.getElementById('cert-code').value,
        issued_date: document.getElementById('cert-issued').value,
        expiration_date: document.getElementById('cert-expiration').value || null,
        grade: document.getElementById('cert-grade').value ? parseFloat(document.getElementById('cert-grade').value) : null,
        certificate_url: document.getElementById('cert-url').value || null,
        notes: document.getElementById('cert-notes').value || null
    };

    try {
        if (certId) {
            // Actualizar
            const { error } = await supabase
                .from('certificates')
                .update(datos)
                .eq('id', certId);

            if (error) throw error;

            alert('Certificado actualizado exitosamente');
        } else {
            // Crear
            const { error } = await supabase
                .from('certificates')
                .insert([datos]);

            if (error) throw error;

            alert('Certificado creado exitosamente');
        }

        mostrarGestionCertificados();
    } catch (error) {
        console.error('Error al guardar certificado:', error);
        alert('Error al guardar certificado: ' + error.message);
    }
}

async function editarCertificado(certId) {
    mostrarFormularioCertificado(certId);
}

async function eliminarCertificado(certId, codigo) {
    if (!confirm(`¿Eliminar el certificado "${codigo}"?\n\nEsta acción no se puede deshacer.`)) return;

    try {
        const { error } = await supabase
            .from('certificates')
            .delete()
            .eq('id', certId);

        if (error) throw error;

        alert('Certificado eliminado exitosamente');
        mostrarGestionCertificados();
    } catch (error) {
        console.error('Error al eliminar certificado:', error);
        alert('Error al eliminar certificado');
    }
}

function verCertificado(codigo) {
    window.open(`certificates.html?code=${codigo}`, '_blank');
}

// =====================================================
// GESTIÓN DE TESTIMONIOS (CASOS DE ÉXITO)
// =====================================================

function inicializarGestionTestimonios() {
    const exitoCard = document.querySelector('.dashboard-card h3 i.fa-trophy');

    if (exitoCard) {
        const card = exitoCard.closest('.dashboard-card');
        card.style.cursor = 'pointer';

        // Evento al card completo
        card.addEventListener('click', async function(e) {
            if (!e.target.closest('a')) {
                await mostrarGestionTestimonios();
            }
        });

        // Eventos a links específicos
        const links = card.querySelectorAll('.dashboard-list a');
        links.forEach(link => {
            link.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                const text = this.textContent.trim();

                if (text.includes('Agregar Testimonio')) {
                    mostrarFormularioTestimonio();
                } else {
                    await mostrarGestionTestimonios();
                }
            });
        });
    }
}

async function mostrarGestionTestimonios() {
    try {
        // Obtener todos los testimonios (publicados y no publicados)
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderizarTablaTestimonios(data || []);
    } catch (error) {
        console.error('Error en mostrarGestionTestimonios:', error);
        alert('Error al cargar testimonios: ' + error.message);
    }
}

function renderizarTablaTestimonios(testimonios) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    // Crear barra de búsqueda y filtros
    const searchFilterBar = createSearchFilterBar({
        searchId: 'search-testimonios',
        searchPlaceholder: 'Buscar por nombre, empresa o curso...',
        tableId: 'table-testimonios',
        filters: [
            {
                id: 'filter-publicado',
                label: 'Publicado',
                options: [
                    { value: 'sí', text: 'Publicado' },
                    { value: 'no', text: 'No publicado' }
                ]
            },
            {
                id: 'filter-destacado',
                label: 'Destacado',
                options: [
                    { value: 'sí', text: 'Destacado' },
                    { value: 'no', text: 'No destacado' }
                ]
            }
        ]
    });

    const tablaHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Casos de Éxito (Testimonios)</h2>
            <button class="btn" onclick="mostrarFormularioTestimonio()">
                <i class="fas fa-plus"></i> Nuevo Testimonio
            </button>
        </div>

        ${searchFilterBar}

        <table class="dashboard-table" id="table-testimonios">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Empresa</th>
                    <th>Curso</th>
                    <th>Rating</th>
                    <th>Publicado</th>
                    <th>Destacado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${testimonios.length === 0 ? `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            No hay testimonios registrados
                        </td>
                    </tr>
                ` : testimonios.map(test => `
                    <tr>
                        <td>${test.full_name}</td>
                        <td>${test.company || '-'}</td>
                        <td>${test.course_taken || '-'}</td>
                        <td>${'⭐'.repeat(test.rating || 0)}</td>
                        <td>${test.is_published ? '<span class="badge-success">Sí</span>' : '<span class="badge-inactive">No</span>'}</td>
                        <td>${test.is_featured ? '<span class="badge-success">Sí</span>' : '<span class="badge-inactive">No</span>'}</td>
                        <td class="table-actions">
                            <button class="btn btn-edit" onclick="editarTestimonio('${test.id}')">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-delete" onclick="eliminarTestimonio('${test.id}', '${test.full_name}')">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="volverDashboard()">
                <i class="fas fa-arrow-left"></i> Volver al Dashboard
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = tablaHTML;

    // Inicializar búsqueda y filtros
    setTimeout(() => {
        initializeTableSearch('table-testimonios', 'search-testimonios', [0, 1, 2]); // Nombre, empresa, curso
        initializeTableFilter('table-testimonios', 'filter-publicado', 4); // Filtrar por publicado
        initializeTableFilter('table-testimonios', 'filter-destacado', 5); // Filtrar por destacado
        updateResultsCount('table-testimonios');
    }, 100);
}

function mostrarFormularioTestimonio(testimonioId = null) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const formHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">${testimonioId ? 'Editar' : 'Nuevo'} Testimonio</h2>
        </div>

        <div class="dashboard-form">
            <form id="form-testimonio" class="form-grid">
                <div class="form-group">
                    <label for="test-full-name">Nombre Completo *</label>
                    <input type="text" id="test-full-name" name="full_name" required>
                </div>

                <div class="form-group">
                    <label for="test-company">Empresa</label>
                    <input type="text" id="test-company" name="company">
                </div>

                <div class="form-group">
                    <label for="test-course">Curso Realizado</label>
                    <input type="text" id="test-course" name="course_taken">
                </div>

                <div class="form-group">
                    <label for="test-rating">Rating (1-5 estrellas) *</label>
                    <select id="test-rating" name="rating" required>
                        <option value="">Seleccione...</option>
                        <option value="5">⭐⭐⭐⭐⭐ (5 estrellas)</option>
                        <option value="4">⭐⭐⭐⭐ (4 estrellas)</option>
                        <option value="3">⭐⭐⭐ (3 estrellas)</option>
                        <option value="2">⭐⭐ (2 estrellas)</option>
                        <option value="1">⭐ (1 estrella)</option>
                    </select>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="test-text">Testimonio *</label>
                    <textarea id="test-text" name="testimonial_text" rows="5" required></textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="test-avatar">URL de Avatar/Foto</label>
                    <input type="text" id="test-avatar" name="avatar_url" placeholder="https://...">
                </div>

                <div class="form-group">
                    <label for="test-order">Orden de Visualización</label>
                    <input type="number" id="test-order" name="display_order" min="0" value="0">
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="test-published" name="is_published">
                        Publicar en sitio web
                    </label>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="test-featured" name="is_featured">
                        Marcar como destacado
                    </label>
                </div>
            </form>

            <div class="form-actions">
                <button type="button" class="btn btn-save" onclick="guardarTestimonio('${testimonioId || ''}')">
                    <i class="fas fa-save"></i> Guardar Testimonio
                </button>
                <button type="button" class="btn btn-cancel" onclick="mostrarGestionTestimonios()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = formHTML;

    // Si es edición, cargar datos del testimonio
    if (testimonioId) {
        cargarDatosTestimonio(testimonioId);
    }
}

async function cargarDatosTestimonio(testimonioId) {
    try {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('id', testimonioId)
            .single();

        if (error) throw error;

        if (data) {
            document.getElementById('test-full-name').value = data.full_name || '';
            document.getElementById('test-company').value = data.company || '';
            document.getElementById('test-course').value = data.course_taken || '';
            document.getElementById('test-rating').value = data.rating || '';
            document.getElementById('test-text').value = data.testimonial_text || '';
            document.getElementById('test-avatar').value = data.avatar_url || '';
            document.getElementById('test-order').value = data.display_order || 0;
            document.getElementById('test-published').checked = data.is_published || false;
            document.getElementById('test-featured').checked = data.is_featured || false;
        }
    } catch (error) {
        console.error('Error al cargar datos del testimonio:', error);
        alert('Error al cargar datos del testimonio');
    }
}

async function guardarTestimonio(testimonioId) {
    const form = document.getElementById('form-testimonio');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Recoger datos del formulario
    const datos = {
        full_name: document.getElementById('test-full-name').value,
        company: document.getElementById('test-company').value || null,
        course_taken: document.getElementById('test-course').value || null,
        rating: parseInt(document.getElementById('test-rating').value),
        testimonial_text: document.getElementById('test-text').value,
        avatar_url: document.getElementById('test-avatar').value || null,
        display_order: parseInt(document.getElementById('test-order').value) || 0,
        is_published: document.getElementById('test-published').checked,
        is_featured: document.getElementById('test-featured').checked
    };

    try {
        if (testimonioId) {
            // Actualizar testimonio existente
            const result = await supabaseCRUD.updateTestimonial(testimonioId, datos);

            if (result.success) {
                alert(result.message);
                mostrarGestionTestimonios();
            } else {
                alert('Error: ' + result.error);
            }
        } else {
            // Crear nuevo testimonio
            const result = await supabaseCRUD.createTestimonial(datos);

            if (result.success) {
                alert(result.message);
                mostrarGestionTestimonios();
            } else {
                alert('Error: ' + result.error);
            }
        }
    } catch (error) {
        console.error('Error al guardar testimonio:', error);
        alert('Error al guardar testimonio');
    }
}

async function editarTestimonio(testimonioId) {
    mostrarFormularioTestimonio(testimonioId);
}

async function eliminarTestimonio(testimonioId, nombre) {
    if (!confirm(`¿Estás seguro de eliminar el testimonio de "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        return;
    }

    try {
        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', testimonioId);

        if (error) throw error;

        alert('Testimonio eliminado exitosamente');
        mostrarGestionTestimonios();
    } catch (error) {
        console.error('Error al eliminar testimonio:', error);
        alert('Error al eliminar testimonio');
    }
}

// =====================================================
// GESTIÓN DE INICIO (HOMEPAGE CONTENT)
// =====================================================

function inicializarGestionInicio() {
    const inicioCard = document.querySelector('.dashboard-card h3 i.fa-home');

    if (inicioCard) {
        const card = inicioCard.closest('.dashboard-card');
        card.style.cursor = 'pointer';

        card.addEventListener('click', async function(e) {
            if (!e.target.closest('a')) {
                await mostrarGestionInicio();
            }
        });

        const links = card.querySelectorAll('.dashboard-list a');
        links.forEach(link => {
            link.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                await mostrarGestionInicio();
            });
        });
    }
}

async function mostrarGestionInicio() {
    try {
        const result = await supabaseCRUD.getHomepageContent(true);

        if (!result.success) {
            alert('Error al cargar contenido: ' + result.error);
            return;
        }

        renderizarTablaInicio(result.data || []);
    } catch (error) {
        console.error('Error en mostrarGestionInicio:', error);
        alert('Error al cargar contenido de inicio');
    }
}

function renderizarTablaInicio(contenidos) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const tablaHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Gestión de Inicio</h2>
            <button class="btn" onclick="mostrarFormularioInicio()">
                <i class="fas fa-plus"></i> Nuevo Contenido
            </button>
        </div>

        <table class="dashboard-table">
            <thead>
                <tr>
                    <th>Sección</th>
                    <th>Título</th>
                    <th>Subtítulo</th>
                    <th>Botón</th>
                    <th>Orden</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${contenidos.length === 0 ? `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            No hay contenido registrado
                        </td>
                    </tr>
                ` : contenidos.map(content => `
                    <tr>
                        <td><span class="badge-section">${traducirSeccionInicio(content.section)}</span></td>
                        <td>${content.title || '-'}</td>
                        <td>${content.subtitle || '-'}</td>
                        <td>${content.button_text || '-'}</td>
                        <td>${content.display_order}</td>
                        <td>${content.is_active ? '<span class="badge-success">Activo</span>' : '<span class="badge-inactive">Inactivo</span>'}</td>
                        <td class="table-actions">
                            <button class="btn btn-edit" onclick="editarInicio('${content.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-delete" onclick="eliminarInicio('${content.id}', '${content.title}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="volverDashboard()">
                <i class="fas fa-arrow-left"></i> Volver
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = tablaHTML;
}

function mostrarFormularioInicio(contentId = null) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const formHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">${contentId ? 'Editar' : 'Nuevo'} Contenido de Inicio</h2>
        </div>

        <div class="dashboard-form">
            <form id="form-inicio" class="form-grid">
                <div class="form-group">
                    <label for="inicio-section">Sección *</label>
                    <select id="inicio-section" name="section" required>
                        <option value="">Seleccione...</option>
                        <option value="hero">Hero Principal</option>
                        <option value="banner">Banner</option>
                        <option value="cta">Call to Action</option>
                        <option value="features">Características</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="inicio-order">Orden</label>
                    <input type="number" id="inicio-order" name="display_order" min="0" value="0">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="inicio-title">Título</label>
                    <input type="text" id="inicio-title" name="title">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="inicio-subtitle">Subtítulo</label>
                    <input type="text" id="inicio-subtitle" name="subtitle">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="inicio-description">Descripción</label>
                    <textarea id="inicio-description" name="description" rows="4"></textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="inicio-image">URL de Imagen</label>
                    <input type="text" id="inicio-image" name="image_url" placeholder="images/...">
                </div>

                <div class="form-group">
                    <label for="inicio-btn-text">Texto del Botón</label>
                    <input type="text" id="inicio-btn-text" name="button_text">
                </div>

                <div class="form-group">
                    <label for="inicio-btn-link">Enlace del Botón</label>
                    <input type="text" id="inicio-btn-link" name="button_link" placeholder="#seccion">
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="inicio-active" name="is_active" checked>
                        Activo
                    </label>
                </div>
            </form>

            <div class="form-actions">
                <button type="button" class="btn btn-save" onclick="guardarInicio('${contentId || ''}')">
                    <i class="fas fa-save"></i> Guardar
                </button>
                <button type="button" class="btn btn-cancel" onclick="mostrarGestionInicio()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = formHTML;

    if (contentId) {
        cargarDatosInicio(contentId);
    }
}

async function cargarDatosInicio(contentId) {
    try {
        const { data, error } = await supabase
            .from('homepage_content')
            .select('*')
            .eq('id', contentId)
            .single();

        if (error) throw error;

        if (data) {
            document.getElementById('inicio-section').value = data.section || '';
            document.getElementById('inicio-order').value = data.display_order || 0;
            document.getElementById('inicio-title').value = data.title || '';
            document.getElementById('inicio-subtitle').value = data.subtitle || '';
            document.getElementById('inicio-description').value = data.description || '';
            document.getElementById('inicio-image').value = data.image_url || '';
            document.getElementById('inicio-btn-text').value = data.button_text || '';
            document.getElementById('inicio-btn-link').value = data.button_link || '';
            document.getElementById('inicio-active').checked = data.is_active;
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar datos');
    }
}

async function guardarInicio(contentId) {
    const form = document.getElementById('form-inicio');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const datos = {
        section: document.getElementById('inicio-section').value,
        title: document.getElementById('inicio-title').value || null,
        subtitle: document.getElementById('inicio-subtitle').value || null,
        description: document.getElementById('inicio-description').value || null,
        image_url: document.getElementById('inicio-image').value || null,
        button_text: document.getElementById('inicio-btn-text').value || null,
        button_link: document.getElementById('inicio-btn-link').value || null,
        display_order: parseInt(document.getElementById('inicio-order').value) || 0,
        is_active: document.getElementById('inicio-active').checked
    };

    try {
        const result = contentId
            ? await supabaseCRUD.updateHomepageContent(contentId, datos)
            : await supabaseCRUD.createHomepageContent(datos);

        if (result.success) {
            alert(result.message);
            mostrarGestionInicio();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar');
    }
}

async function editarInicio(contentId) {
    mostrarFormularioInicio(contentId);
}

async function eliminarInicio(contentId, titulo) {
    if (!confirm(`¿Eliminar "${titulo}"?`)) return;

    try {
        const result = await supabaseCRUD.deleteHomepageContent(contentId);

        if (result.success) {
            alert(result.message);
            mostrarGestionInicio();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar');
    }
}

function traducirSeccionInicio(section) {
    const traducciones = {
        'hero': 'Hero',
        'banner': 'Banner',
        'cta': 'CTA',
        'features': 'Características'
    };
    return traducciones[section] || section;
}

// =====================================================
// GESTIÓN DE NOSOTROS (ABOUT US + TEAM)
// =====================================================

function inicializarGestionNosotros() {
    const nosotrosCard = document.querySelector('.dashboard-card h3 i.fa-users');

    if (nosotrosCard) {
        const card = nosotrosCard.closest('.dashboard-card');
        card.style.cursor = 'pointer';

        card.addEventListener('click', async function(e) {
            if (!e.target.closest('a')) {
                await mostrarGestionNosotros();
            }
        });

        const links = card.querySelectorAll('.dashboard-list a');
        links.forEach(link => {
            link.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                const text = this.textContent.trim();

                if (text.includes('Gestionar Equipo')) {
                    await mostrarGestionEquipo();
                } else {
                    await mostrarGestionNosotros();
                }
            });
        });
    }
}

async function mostrarGestionNosotros() {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const menuHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Gestión de Nosotros</h2>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
            <div class="dashboard-card" onclick="mostrarGestionAboutUs()" style="cursor: pointer;">
                <h3><i class="fas fa-info-circle"></i> Contenido</h3>
                <p>Historia, Misión, Visión, Valores</p>
            </div>

            <div class="dashboard-card" onclick="mostrarGestionEquipo()" style="cursor: pointer;">
                <h3><i class="fas fa-user-friends"></i> Equipo</h3>
                <p>Miembros del equipo</p>
            </div>
        </div>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="volverDashboard()">
                <i class="fas fa-arrow-left"></i> Volver
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = menuHTML;
}

async function mostrarGestionAboutUs() {
    try {
        const result = await supabaseCRUD.getAboutUs(true);

        if (!result.success) {
            alert('Error al cargar contenido: ' + result.error);
            return;
        }

        renderizarTablaAboutUs(result.data || []);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar contenido');
    }
}

function renderizarTablaAboutUs(contenidos) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const tablaHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Contenido de Nosotros</h2>
            <button class="btn" onclick="mostrarFormularioAboutUs()">
                <i class="fas fa-plus"></i> Nuevo
            </button>
        </div>

        <table class="dashboard-table">
            <thead>
                <tr>
                    <th>Sección</th>
                    <th>Título</th>
                    <th>Contenido</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${contenidos.length === 0 ? `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 40px;">
                            No hay contenido registrado
                        </td>
                    </tr>
                ` : contenidos.map(content => `
                    <tr>
                        <td><span class="badge-section">${traducirSeccionNosotros(content.section)}</span></td>
                        <td>${content.title}</td>
                        <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">
                            ${content.content.substring(0, 100)}...
                        </td>
                        <td>${content.is_active ? '<span class="badge-success">Activo</span>' : '<span class="badge-inactive">Inactivo</span>'}</td>
                        <td class="table-actions">
                            <button class="btn btn-edit" onclick="editarAboutUs('${content.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-delete" onclick="eliminarAboutUs('${content.id}', '${content.title}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="mostrarGestionNosotros()">
                <i class="fas fa-arrow-left"></i> Volver
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = tablaHTML;
}

function mostrarFormularioAboutUs(contentId = null) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const formHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">${contentId ? 'Editar' : 'Nuevo'} Contenido</h2>
        </div>

        <div class="dashboard-form">
            <form id="form-about" class="form-grid">
                <div class="form-group">
                    <label for="about-section">Sección *</label>
                    <select id="about-section" name="section" required>
                        <option value="">Seleccione...</option>
                        <option value="historia">Historia</option>
                        <option value="mision">Misión</option>
                        <option value="vision">Visión</option>
                        <option value="valores">Valores</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="about-order">Orden</label>
                    <input type="number" id="about-order" name="display_order" min="0" value="0">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="about-title">Título *</label>
                    <input type="text" id="about-title" name="title" required>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="about-content">Contenido *</label>
                    <textarea id="about-content" name="content" rows="6" required></textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="about-image">URL de Imagen</label>
                    <input type="text" id="about-image" name="image_url">
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="about-active" name="is_active" checked>
                        Activo
                    </label>
                </div>
            </form>

            <div class="form-actions">
                <button type="button" class="btn btn-save" onclick="guardarAboutUs('${contentId || ''}')">
                    <i class="fas fa-save"></i> Guardar
                </button>
                <button type="button" class="btn btn-cancel" onclick="mostrarGestionAboutUs()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = formHTML;

    if (contentId) {
        cargarDatosAboutUs(contentId);
    }
}

async function cargarDatosAboutUs(contentId) {
    try {
        const { data, error } = await supabase
            .from('about_us')
            .select('*')
            .eq('id', contentId)
            .single();

        if (error) throw error;

        if (data) {
            document.getElementById('about-section').value = data.section || '';
            document.getElementById('about-order').value = data.display_order || 0;
            document.getElementById('about-title').value = data.title || '';
            document.getElementById('about-content').value = data.content || '';
            document.getElementById('about-image').value = data.image_url || '';
            document.getElementById('about-active').checked = data.is_active;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos');
    }
}

async function guardarAboutUs(contentId) {
    const form = document.getElementById('form-about');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const datos = {
        section: document.getElementById('about-section').value,
        title: document.getElementById('about-title').value,
        content: document.getElementById('about-content').value,
        image_url: document.getElementById('about-image').value || null,
        display_order: parseInt(document.getElementById('about-order').value) || 0,
        is_active: document.getElementById('about-active').checked
    };

    try {
        const result = contentId
            ? await supabaseCRUD.updateAboutUs(contentId, datos)
            : await supabaseCRUD.createAboutUs(datos);

        if (result.success) {
            alert(result.message);
            mostrarGestionAboutUs();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar');
    }
}

async function editarAboutUs(contentId) {
    mostrarFormularioAboutUs(contentId);
}

async function eliminarAboutUs(contentId, titulo) {
    if (!confirm(`¿Eliminar "${titulo}"?`)) return;

    try {
        const result = await supabaseCRUD.deleteAboutUs(contentId);

        if (result.success) {
            alert(result.message);
            mostrarGestionAboutUs();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar');
    }
}

function traducirSeccionNosotros(section) {
    const traducciones = {
        'historia': 'Historia',
        'mision': 'Misión',
        'vision': 'Visión',
        'valores': 'Valores'
    };
    return traducciones[section] || section;
}

// GESTIÓN DE EQUIPO
async function mostrarGestionEquipo() {
    try {
        const result = await supabaseCRUD.getTeamMembers(true);

        if (!result.success) {
            alert('Error: ' + result.error);
            return;
        }

        renderizarTablaEquipo(result.data || []);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar equipo');
    }
}

function renderizarTablaEquipo(miembros) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const tablaHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Equipo</h2>
            <button class="btn" onclick="mostrarFormularioEquipo()">
                <i class="fas fa-plus"></i> Nuevo Miembro
            </button>
        </div>

        <table class="dashboard-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Cargo</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${miembros.length === 0 ? `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px;">
                            No hay miembros registrados
                        </td>
                    </tr>
                ` : miembros.map(member => `
                    <tr>
                        <td>${member.full_name}</td>
                        <td>${member.position}</td>
                        <td>${member.email || '-'}</td>
                        <td>${member.phone || '-'}</td>
                        <td>${member.is_active ? '<span class="badge-success">Activo</span>' : '<span class="badge-inactive">Inactivo</span>'}</td>
                        <td class="table-actions">
                            <button class="btn btn-edit" onclick="editarMiembroEquipo('${member.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-delete" onclick="eliminarMiembroEquipo('${member.id}', '${member.full_name}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="mostrarGestionNosotros()">
                <i class="fas fa-arrow-left"></i> Volver
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = tablaHTML;
}

function mostrarFormularioEquipo(memberId = null) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const formHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">${memberId ? 'Editar' : 'Nuevo'} Miembro</h2>
        </div>

        <div class="dashboard-form">
            <form id="form-equipo" class="form-grid">
                <div class="form-group">
                    <label for="equipo-name">Nombre Completo *</label>
                    <input type="text" id="equipo-name" name="full_name" required>
                </div>

                <div class="form-group">
                    <label for="equipo-position">Cargo *</label>
                    <input type="text" id="equipo-position" name="position" required>
                </div>

                <div class="form-group">
                    <label for="equipo-email">Email</label>
                    <input type="email" id="equipo-email" name="email">
                </div>

                <div class="form-group">
                    <label for="equipo-phone">Teléfono</label>
                    <input type="text" id="equipo-phone" name="phone">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="equipo-bio">Biografía</label>
                    <textarea id="equipo-bio" name="bio" rows="4"></textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="equipo-photo">URL de Foto</label>
                    <input type="text" id="equipo-photo" name="photo_url">
                </div>

                <div class="form-group">
                    <label for="equipo-linkedin">LinkedIn</label>
                    <input type="text" id="equipo-linkedin" name="linkedin_url">
                </div>

                <div class="form-group">
                    <label for="equipo-order">Orden</label>
                    <input type="number" id="equipo-order" name="display_order" min="0" value="0">
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="equipo-active" name="is_active" checked>
                        Activo
                    </label>
                </div>
            </form>

            <div class="form-actions">
                <button type="button" class="btn btn-save" onclick="guardarMiembroEquipo('${memberId || ''}')">
                    <i class="fas fa-save"></i> Guardar
                </button>
                <button type="button" class="btn btn-cancel" onclick="mostrarGestionEquipo()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = formHTML;

    if (memberId) {
        cargarDatosMiembroEquipo(memberId);
    }
}

async function cargarDatosMiembroEquipo(memberId) {
    try {
        const result = await supabaseCRUD.getTeamMemberById(memberId);

        if (result.success && result.data) {
            const data = result.data;
            document.getElementById('equipo-name').value = data.full_name || '';
            document.getElementById('equipo-position').value = data.position || '';
            document.getElementById('equipo-email').value = data.email || '';
            document.getElementById('equipo-phone').value = data.phone || '';
            document.getElementById('equipo-bio').value = data.bio || '';
            document.getElementById('equipo-photo').value = data.photo_url || '';
            document.getElementById('equipo-linkedin').value = data.linkedin_url || '';
            document.getElementById('equipo-order').value = data.display_order || 0;
            document.getElementById('equipo-active').checked = data.is_active;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos');
    }
}

async function guardarMiembroEquipo(memberId) {
    const form = document.getElementById('form-equipo');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const datos = {
        full_name: document.getElementById('equipo-name').value,
        position: document.getElementById('equipo-position').value,
        email: document.getElementById('equipo-email').value || null,
        phone: document.getElementById('equipo-phone').value || null,
        bio: document.getElementById('equipo-bio').value || null,
        photo_url: document.getElementById('equipo-photo').value || null,
        linkedin_url: document.getElementById('equipo-linkedin').value || null,
        display_order: parseInt(document.getElementById('equipo-order').value) || 0,
        is_active: document.getElementById('equipo-active').checked
    };

    try {
        const result = memberId
            ? await supabaseCRUD.updateTeamMember(memberId, datos)
            : await supabaseCRUD.createTeamMember(datos);

        if (result.success) {
            alert(result.message);
            mostrarGestionEquipo();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar');
    }
}

async function editarMiembroEquipo(memberId) {
    mostrarFormularioEquipo(memberId);
}

async function eliminarMiembroEquipo(memberId, nombre) {
    if (!confirm(`¿Eliminar a "${nombre}"?`)) return;

    try {
        const result = await supabaseCRUD.deleteTeamMember(memberId);

        if (result.success) {
            alert(result.message);
            mostrarGestionEquipo();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar');
    }
}

// =====================================================
// GESTIÓN DE TIENDA (PRODUCTS + ORDERS)
// =====================================================

function inicializarGestionTienda() {
    const tiendaCard = document.querySelector('.dashboard-card h3 i.fa-store');

    if (tiendaCard) {
        const card = tiendaCard.closest('.dashboard-card');
        card.style.cursor = 'pointer';

        card.addEventListener('click', async function(e) {
            if (!e.target.closest('a')) {
                await mostrarGestionTienda();
            }
        });

        const links = card.querySelectorAll('.dashboard-list a');
        links.forEach(link => {
            link.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();

                const text = this.textContent.trim();

                if (text.includes('Agregar Producto')) {
                    mostrarFormularioProducto();
                } else if (text.includes('Ver Órdenes')) {
                    await mostrarGestionOrdenes();
                } else {
                    await mostrarGestionTienda();
                }
            });
        });
    }
}

async function mostrarGestionTienda() {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const menuHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Gestión de Tienda</h2>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
            <div class="dashboard-card" onclick="mostrarGestionProductos()" style="cursor: pointer;">
                <h3><i class="fas fa-box"></i> Productos</h3>
                <p>Gestionar catálogo de productos</p>
            </div>

            <div class="dashboard-card" onclick="mostrarGestionOrdenes()" style="cursor: pointer;">
                <h3><i class="fas fa-shopping-cart"></i> Órdenes</h3>
                <p>Ver y gestionar órdenes de compra</p>
            </div>
        </div>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="volverDashboard()">
                <i class="fas fa-arrow-left"></i> Volver
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = menuHTML;
}

async function mostrarGestionProductos() {
    try {
        const result = await supabaseCRUD.getProducts({ includeInactive: true });

        if (!result.success) {
            alert('Error: ' + result.error);
            return;
        }

        renderizarTablaProductos(result.data || []);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar productos');
    }
}

function renderizarTablaProductos(productos) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    // Crear barra de búsqueda y filtros
    const searchFilterBar = createSearchFilterBar({
        searchId: 'search-productos',
        searchPlaceholder: 'Buscar por nombre o categoría...',
        tableId: 'table-productos',
        filters: [
            {
                id: 'filter-estado-prod',
                label: 'Estado',
                options: [
                    { value: 'activo', text: 'Activo' },
                    { value: 'inactivo', text: 'Inactivo' }
                ]
            },
            {
                id: 'filter-destacado-prod',
                label: 'Destacado',
                options: [
                    { value: '⭐', text: 'Destacado' }
                ]
            }
        ]
    });

    const tablaHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Productos</h2>
            <button class="btn" onclick="mostrarFormularioProducto()">
                <i class="fas fa-plus"></i> Nuevo Producto
            </button>
        </div>

        ${searchFilterBar}

        <table class="dashboard-table" id="table-productos">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th>Destacado</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${productos.length === 0 ? `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            No hay productos registrados
                        </td>
                    </tr>
                ` : productos.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>S/ ${parseFloat(product.price).toFixed(2)}</td>
                        <td>${product.stock}</td>
                        <td>${product.category || '-'}</td>
                        <td>${product.is_featured ? '⭐' : '-'}</td>
                        <td>${product.is_active ? '<span class="badge-success">Activo</span>' : '<span class="badge-inactive">Inactivo</span>'}</td>
                        <td class="table-actions">
                            <button class="btn btn-edit" onclick="editarProducto('${product.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-delete" onclick="eliminarProducto('${product.id}', '${product.name}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="mostrarGestionTienda()">
                <i class="fas fa-arrow-left"></i> Volver
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = tablaHTML;

    // Inicializar búsqueda y filtros
    setTimeout(() => {
        initializeTableSearch('table-productos', 'search-productos', [0, 3]); // Nombre, categoría
        initializeTableFilter('table-productos', 'filter-estado-prod', 5); // Estado
        initializeTableFilter('table-productos', 'filter-destacado-prod', 4); // Destacado
        updateResultsCount('table-productos');
    }, 100);
}

function mostrarFormularioProducto(productId = null) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const formHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">${productId ? 'Editar' : 'Nuevo'} Producto</h2>
        </div>

        <div class="dashboard-form">
            <form id="form-producto" class="form-grid">
                <div class="form-group">
                    <label for="producto-name">Nombre *</label>
                    <input type="text" id="producto-name" name="name" required>
                </div>

                <div class="form-group">
                    <label for="producto-category">Categoría</label>
                    <input type="text" id="producto-category" name="category">
                </div>

                <div class="form-group">
                    <label for="producto-price">Precio *</label>
                    <input type="number" id="producto-price" name="price" step="0.01" min="0" required>
                </div>

                <div class="form-group">
                    <label for="producto-compare-price">Precio Comparación</label>
                    <input type="number" id="producto-compare-price" name="compare_price" step="0.01" min="0">
                </div>

                <div class="form-group">
                    <label for="producto-stock">Stock *</label>
                    <input type="number" id="producto-stock" name="stock" min="0" value="0" required>
                </div>

                <div class="form-group">
                    <label for="producto-order">Orden</label>
                    <input type="number" id="producto-order" name="display_order" min="0" value="0">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="producto-short-desc">Descripción Corta</label>
                    <input type="text" id="producto-short-desc" name="short_description" maxlength="200">
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="producto-description">Descripción Completa</label>
                    <textarea id="producto-description" name="description" rows="5"></textarea>
                </div>

                <div class="form-group" style="grid-column: 1 / -1;">
                    <label for="producto-image">URL de Imagen Principal</label>
                    <input type="text" id="producto-image" name="image_url">
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="producto-featured" name="is_featured">
                        Producto Destacado
                    </label>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="producto-active" name="is_active" checked>
                        Activo
                    </label>
                </div>
            </form>

            <div class="form-actions">
                <button type="button" class="btn btn-save" onclick="guardarProducto('${productId || ''}')">
                    <i class="fas fa-save"></i> Guardar
                </button>
                <button type="button" class="btn btn-cancel" onclick="mostrarGestionProductos()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = formHTML;

    if (productId) {
        cargarDatosProducto(productId);
    }
}

async function cargarDatosProducto(productId) {
    try {
        const result = await supabaseCRUD.getProductById(productId);

        if (result.success && result.data) {
            const data = result.data;
            document.getElementById('producto-name').value = data.name || '';
            document.getElementById('producto-category').value = data.category || '';
            document.getElementById('producto-price').value = data.price || '';
            document.getElementById('producto-compare-price').value = data.compare_price || '';
            document.getElementById('producto-stock').value = data.stock || 0;
            document.getElementById('producto-order').value = data.display_order || 0;
            document.getElementById('producto-short-desc').value = data.short_description || '';
            document.getElementById('producto-description').value = data.description || '';
            document.getElementById('producto-image').value = data.image_url || '';
            document.getElementById('producto-featured').checked = data.is_featured;
            document.getElementById('producto-active').checked = data.is_active;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos');
    }
}

async function guardarProducto(productId) {
    const form = document.getElementById('form-producto');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const datos = {
        name: document.getElementById('producto-name').value,
        category: document.getElementById('producto-category').value || null,
        price: parseFloat(document.getElementById('producto-price').value),
        compare_price: document.getElementById('producto-compare-price').value ? parseFloat(document.getElementById('producto-compare-price').value) : null,
        stock: parseInt(document.getElementById('producto-stock').value),
        short_description: document.getElementById('producto-short-desc').value || null,
        description: document.getElementById('producto-description').value || null,
        image_url: document.getElementById('producto-image').value || null,
        display_order: parseInt(document.getElementById('producto-order').value) || 0,
        is_featured: document.getElementById('producto-featured').checked,
        is_active: document.getElementById('producto-active').checked
    };

    // Generar slug si es nuevo
    if (!productId) {
        datos.slug = generarSlug(datos.name);
    }

    try {
        const result = productId
            ? await supabaseCRUD.updateProduct(productId, datos)
            : await supabaseCRUD.createProduct(datos);

        if (result.success) {
            alert(result.message);
            mostrarGestionProductos();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar');
    }
}

async function editarProducto(productId) {
    mostrarFormularioProducto(productId);
}

async function eliminarProducto(productId, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;

    try {
        const result = await supabaseCRUD.deleteProduct(productId);

        if (result.success) {
            alert(result.message);
            mostrarGestionProductos();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar');
    }
}

// GESTIÓN DE ÓRDENES
async function mostrarGestionOrdenes() {
    try {
        const result = await supabaseCRUD.getOrders();

        if (!result.success) {
            alert('Error: ' + result.error);
            return;
        }

        renderizarTablaOrdenes(result.data || []);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar órdenes');
    }
}

function renderizarTablaOrdenes(ordenes) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    // Crear barra de búsqueda y filtros
    const searchFilterBar = createSearchFilterBar({
        searchId: 'search-ordenes',
        searchPlaceholder: 'Buscar por número de orden o cliente...',
        tableId: 'table-ordenes',
        filters: [
            {
                id: 'filter-estado-orden',
                label: 'Estado',
                options: [
                    { value: 'pendiente', text: 'Pendiente' },
                    { value: 'pagado', text: 'Pagado' },
                    { value: 'procesando', text: 'Procesando' },
                    { value: 'enviado', text: 'Enviado' },
                    { value: 'completado', text: 'Completado' },
                    { value: 'cancelado', text: 'Cancelado' }
                ]
            },
            {
                id: 'filter-pago',
                label: 'Pago',
                options: [
                    { value: 'pendiente', text: 'Pendiente' },
                    { value: 'pagado', text: 'Pagado' },
                    { value: 'fallido', text: 'Fallido' },
                    { value: 'reembolsado', text: 'Reembolsado' }
                ]
            }
        ]
    });

    const tablaHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Órdenes de Compra</h2>
        </div>

        ${searchFilterBar}

        <table class="dashboard-table" id="table-ordenes">
            <thead>
                <tr>
                    <th>N° Orden</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Pago</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${ordenes.length === 0 ? `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px;">
                            No hay órdenes registradas
                        </td>
                    </tr>
                ` : ordenes.map(order => `
                    <tr>
                        <td><strong>${order.order_number}</strong></td>
                        <td>${order.customer_name}</td>
                        <td>S/ ${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td>${traducirEstadoOrden(order.status)}</td>
                        <td>${traducirEstadoPago(order.payment_status)}</td>
                        <td>${formatearFecha(order.created_at)}</td>
                        <td class="table-actions">
                            <select onchange="cambiarEstadoOrden('${order.id}', this.value)">
                                <option value="">Cambiar estado...</option>
                                <option value="pending">Pendiente</option>
                                <option value="paid">Pagado</option>
                                <option value="processing">Procesando</option>
                                <option value="shipped">Enviado</option>
                                <option value="completed">Completado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="mostrarGestionTienda()">
                <i class="fas fa-arrow-left"></i> Volver
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = tablaHTML;

    // Inicializar búsqueda y filtros
    setTimeout(() => {
        initializeTableSearch('table-ordenes', 'search-ordenes', [0, 1]); // N° orden, cliente
        initializeTableFilter('table-ordenes', 'filter-estado-orden', 3); // Estado
        initializeTableFilter('table-ordenes', 'filter-pago', 4); // Pago
        updateResultsCount('table-ordenes');
    }, 100);
}

async function cambiarEstadoOrden(orderId, nuevoEstado) {
    if (!nuevoEstado) return;

    try {
        const paymentStatus = nuevoEstado === 'paid' ? 'paid' : null;
        const result = await supabaseCRUD.updateOrderStatus(orderId, nuevoEstado, paymentStatus);

        if (result.success) {
            mostrarGestionOrdenes();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar estado');
    }
}

function traducirEstadoOrden(status) {
    const traducciones = {
        'pending': '<span class="badge-new">Pendiente</span>',
        'paid': '<span class="badge-success">Pagado</span>',
        'processing': '<span class="badge-read">Procesando</span>',
        'shipped': '<span class="badge-read">Enviado</span>',
        'completed': '<span class="badge-success">Completado</span>',
        'cancelled': '<span class="badge-inactive">Cancelado</span>',
        'refunded': '<span class="badge-inactive">Reembolsado</span>'
    };
    return traducciones[status] || status;
}

function traducirEstadoPago(status) {
    const traducciones = {
        'pending': '<span class="badge-new">Pendiente</span>',
        'paid': '<span class="badge-success">Pagado</span>',
        'failed': '<span class="badge-inactive">Fallido</span>',
        'refunded': '<span class="badge-inactive">Reembolsado</span>'
    };
    return traducciones[status] || status;
}

// =====================================================
// GESTIÓN DE USUARIOS
// =====================================================

async function mostrarGestionUsuarios() {
    try {
        // Obtener todos los usuarios (perfiles)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderizarTablaUsuarios(data || []);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        alert('Error al cargar usuarios');
    }
}

function renderizarTablaUsuarios(usuarios) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    // Crear barra de búsqueda y filtros
    const searchFilterBar = createSearchFilterBar({
        searchId: 'search-usuarios',
        searchPlaceholder: 'Buscar por nombre, email o teléfono...',
        tableId: 'table-usuarios',
        filters: [
            {
                id: 'filter-rol',
                label: 'Rol',
                options: [
                    { value: 'administrador', text: 'Administrador' },
                    { value: 'estudiante', text: 'Estudiante' },
                    { value: 'instructor', text: 'Instructor' }
                ]
            }
        ]
    });

    const tablaHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Gestión de Usuarios</h2>
            <button class="btn" onclick="mostrarFormularioUsuario()">
                <i class="fas fa-plus"></i> Nuevo Usuario
            </button>
        </div>

        <div class="stats-grid" style="margin-bottom: 30px;">
            <div class="stat-card">
                <div class="stat-number">${usuarios.length}</div>
                <div class="stat-label">Total Usuarios</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${usuarios.filter(u => u.role === 'admin').length}</div>
                <div class="stat-label">Administradores</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${usuarios.filter(u => u.role === 'student').length}</div>
                <div class="stat-label">Estudiantes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${usuarios.filter(u => u.role === 'instructor').length}</div>
                <div class="stat-label">Instructores</div>
            </div>
        </div>

        ${searchFilterBar}

        <table class="dashboard-table" id="table-usuarios">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Registrado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${usuarios.length === 0 ? `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px;">
                            No hay usuarios registrados
                        </td>
                    </tr>
                ` : usuarios.map(user => `
                    <tr>
                        <td>${user.full_name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || '-'}</td>
                        <td>${traducirRol(user.role)}</td>
                        <td>${formatearFecha(user.created_at)}</td>
                        <td class="table-actions">
                            <button class="btn btn-edit" onclick="editarUsuario('${user.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${user.role !== 'admin' ? `
                                <button class="btn btn-delete" onclick="eliminarUsuario('${user.id}', '${user.full_name}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <button class="btn btn-outline" onclick="mostrarDashboardPrincipal()">
                <i class="fas fa-arrow-left"></i> Volver al Dashboard
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = tablaHTML;

    // Inicializar búsqueda y filtros
    setTimeout(() => {
        initializeTableSearch('table-usuarios', 'search-usuarios', [0, 1, 2]); // Nombre, email, teléfono
        initializeTableFilter('table-usuarios', 'filter-rol', 3); // Rol
        updateResultsCount('table-usuarios');
    }, 100);
}

function mostrarFormularioUsuario(userId = null) {
    const dashboardContainer = document.querySelector('.dashboard-container');

    const formHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">${userId ? 'Editar' : 'Nuevo'} Usuario</h2>
        </div>

        <div class="dashboard-form">
            <form id="form-usuario" class="form-grid">
                <div class="form-group">
                    <label for="user-fullname">Nombre Completo *</label>
                    <input type="text" id="user-fullname" name="full_name" required>
                </div>

                <div class="form-group">
                    <label for="user-email">Email *</label>
                    <input type="email" id="user-email" name="email" required ${userId ? 'readonly' : ''}>
                </div>

                <div class="form-group">
                    <label for="user-phone">Teléfono</label>
                    <input type="text" id="user-phone" name="phone">
                </div>

                <div class="form-group">
                    <label for="user-role">Rol *</label>
                    <select id="user-role" name="role" required>
                        <option value="">Seleccione...</option>
                        <option value="student">Estudiante</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                ${!userId ? `
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="user-password">Contraseña *</label>
                        <input type="password" id="user-password" name="password" required minlength="6">
                        <small>Mínimo 6 caracteres</small>
                    </div>
                ` : ''}
            </form>

            <div class="form-actions">
                <button type="button" class="btn btn-save" onclick="guardarUsuario('${userId || ''}')">
                    <i class="fas fa-save"></i> Guardar
                </button>
                <button type="button" class="btn btn-cancel" onclick="mostrarGestionUsuarios()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `;

    dashboardContainer.innerHTML = formHTML;

    if (userId) {
        cargarDatosUsuario(userId);
    }
}

async function cargarDatosUsuario(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        if (data) {
            document.getElementById('user-fullname').value = data.full_name || '';
            document.getElementById('user-email').value = data.email || '';
            document.getElementById('user-phone').value = data.phone || '';
            document.getElementById('user-role').value = data.role || '';
        }
    } catch (error) {
        console.error('Error al cargar usuario:', error);
        alert('Error al cargar datos del usuario');
    }
}

async function guardarUsuario(userId) {
    const form = document.getElementById('form-usuario');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const datos = {
        full_name: document.getElementById('user-fullname').value,
        email: document.getElementById('user-email').value,
        phone: document.getElementById('user-phone').value || null,
        role: document.getElementById('user-role').value
    };

    try {
        if (userId) {
            // Actualizar usuario existente
            const result = await supabaseUtils.updateProfile(userId, datos);

            if (result.success) {
                alert('Usuario actualizado exitosamente');
                mostrarGestionUsuarios();
            } else {
                alert('Error: ' + result.error);
            }
        } else {
            // Crear nuevo usuario
            const password = document.getElementById('user-password').value;

            const result = await supabaseAuth.signUp(
                datos.email,
                password,
                datos.full_name,
                datos.role
            );

            if (result.success) {
                alert('Usuario creado exitosamente. Se ha enviado un email de confirmación.');
                mostrarGestionUsuarios();
            } else {
                alert('Error: ' + result.error);
            }
        }
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        alert('Error al guardar usuario');
    }
}

async function editarUsuario(userId) {
    mostrarFormularioUsuario(userId);
}

async function eliminarUsuario(userId, nombre) {
    if (!confirm(`¿Eliminar al usuario "${nombre}"?\n\nEsta acción no se puede deshacer.`)) return;

    try {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;

        alert('Usuario eliminado exitosamente');
        mostrarGestionUsuarios();
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar usuario');
    }
}

function traducirRol(role) {
    const roles = {
        'admin': '<span class="badge-success">Administrador</span>',
        'instructor': '<span class="badge-read">Instructor</span>',
        'student': '<span class="badge-new">Estudiante</span>'
    };
    return roles[role] || role;
}

// =====================================================
// CONFIGURACIÓN
// =====================================================

async function mostrarConfiguracion() {
    const dashboardContainer = document.querySelector('.dashboard-container');

    // Cargar configuraciones desde Supabase
    const result = await supabaseCRUD.getAllSettings();
    const settings = {};

    if (result.success && result.data) {
        result.data.forEach(setting => {
            settings[setting.setting_key] = setting.setting_value;
        });
    }

    const configHTML = `
        <div class="dashboard-header">
            <h2 class="dashboard-title">Configuración del Sistema</h2>
        </div>

        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
            <div class="dashboard-card">
                <h3><i class="fas fa-building"></i> Información de la Empresa</h3>
                <form id="form-empresa" class="form-grid" style="margin-top: 20px;">
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="config-nombre">Nombre de la Empresa</label>
                        <input type="text" id="config-nombre" value="${settings.company_name || 'CEIN - Centro Empresarial de Inversiones y Negocios'}">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="config-telefono">Teléfono</label>
                        <input type="text" id="config-telefono" value="${settings.company_phone || '+51 991 403 402'}">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="config-email">Email</label>
                        <input type="email" id="config-email" value="${settings.company_email || 'contacto@cein.com.pe'}">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="config-direccion">Dirección</label>
                        <textarea id="config-direccion" rows="2">${settings.company_address || 'Av. Ejemplo 123, Lima, Perú'}</textarea>
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <button type="button" class="btn btn-save" onclick="guardarConfiguracion('empresa')">
                            <i class="fas fa-save"></i> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>

            <div class="dashboard-card">
                <h3><i class="fas fa-palette"></i> Apariencia</h3>
                <form id="form-apariencia" class="form-grid" style="margin-top: 20px;">
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="config-logo">URL del Logo</label>
                        <input type="text" id="config-logo" value="${settings.logo_url || 'images/logo.png'}">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="config-color">Color Principal</label>
                        <input type="color" id="config-color" value="${settings.primary_color || '#2c5282'}" style="height: 50px; width: 100%;">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <button type="button" class="btn btn-save" onclick="guardarConfiguracion('apariencia')">
                            <i class="fas fa-save"></i> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>

            <div class="dashboard-card">
                <h3><i class="fas fa-share-alt"></i> Redes Sociales</h3>
                <form id="form-redes" class="form-grid" style="margin-top: 20px;">
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="config-facebook">
                            <i class="fab fa-facebook"></i> Facebook
                        </label>
                        <input type="text" id="config-facebook" value="${settings.facebook_url || ''}" placeholder="https://facebook.com/...">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="config-instagram">
                            <i class="fab fa-instagram"></i> Instagram
                        </label>
                        <input type="text" id="config-instagram" value="${settings.instagram_url || ''}" placeholder="https://instagram.com/...">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="config-whatsapp">
                            <i class="fab fa-whatsapp"></i> WhatsApp (número)
                        </label>
                        <input type="text" id="config-whatsapp" value="${settings.whatsapp_number || '51991403402'}" placeholder="51991403402">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <button type="button" class="btn btn-save" onclick="guardarConfiguracion('redes')">
                            <i class="fas fa-save"></i> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>

            <div class="dashboard-card">
                <h3><i class="fas fa-cog"></i> Sistema</h3>
                <div style="margin-top: 20px;">
                    <p><strong>Versión:</strong> 1.0.0</p>
                    <p><strong>Base de Datos:</strong> Supabase</p>
                    <p><strong>Último Backup:</strong> No disponible</p>
                    <hr style="margin: 20px 0;">
                    <button type="button" class="btn btn-outline" onclick="realizarBackup()">
                        <i class="fas fa-database"></i> Hacer Backup
                    </button>
                    <button type="button" class="btn" style="margin-top: 10px; background: #dc3545;" onclick="limpiarCache()">
                        <i class="fas fa-broom"></i> Limpiar Caché
                    </button>
                </div>
            </div>
        </div>

        <div style="margin-top: 30px;">
            <button class="btn btn-outline" onclick="mostrarDashboardPrincipal()">
                <i class="fas fa-arrow-left"></i> Volver al Dashboard
            </button>
        </div>
    `;

    dashboardContainer.innerHTML = configHTML;
}

async function guardarConfiguracion(tipo) {
    try {
        let updates = {};

        if (tipo === 'empresa') {
            updates = {
                'company_name': document.getElementById('config-nombre').value,
                'company_phone': document.getElementById('config-telefono').value,
                'company_email': document.getElementById('config-email').value,
                'company_address': document.getElementById('config-direccion').value
            };
        } else if (tipo === 'apariencia') {
            updates = {
                'logo_url': document.getElementById('config-logo').value,
                'primary_color': document.getElementById('config-color').value
            };
        } else if (tipo === 'redes') {
            updates = {
                'facebook_url': document.getElementById('config-facebook').value,
                'instagram_url': document.getElementById('config-instagram').value,
                'whatsapp_number': document.getElementById('config-whatsapp').value
            };
        }

        const result = await supabaseCRUD.updateMultipleSettings(updates);

        if (result.success) {
            alert(result.message);
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error al guardar configuración:', error);
        alert('Error al guardar configuración');
    }
}

function realizarBackup() {
    alert('Función de backup en desarrollo.\n\nPuedes hacer backup manualmente desde el dashboard de Supabase.');
}

function limpiarCache() {
    if (confirm('¿Limpiar la caché del navegador?\n\nEsto recargará la página.')) {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
    }
}

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function volverDashboard() {
    const dashboardContainer = document.querySelector('.dashboard-container');

    if (window.dashboardOriginalContent) {
        dashboardContainer.innerHTML = window.dashboardOriginalContent;
    } else {
        location.reload();
    }
}

function traducirModalidad(modality) {
    const traducciones = {
        'presencial': 'Presencial',
        'virtual': 'Virtual',
        'hibrido': 'Híbrido'
    };
    return traducciones[modality] || modality;
}

function traducirEstadoMensaje(status) {
    const traducciones = {
        'new': '<span class="badge-new">Nuevo</span>',
        'read': '<span class="badge-read">Leído</span>',
        'replied': '<span class="badge-success">Respondido</span>',
        'archived': '<span class="badge-inactive">Archivado</span>'
    };
    return traducciones[status] || status;
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '-';

    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function generarSlug(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
        .trim()
        .replace(/\s+/g, '-'); // Reemplazar espacios por guiones
}

// Hacer funciones globales para los onclick
// Cursos
window.mostrarGestionCursos = mostrarGestionCursos;
window.mostrarFormularioCurso = mostrarFormularioCurso;
window.guardarCurso = guardarCurso;
window.editarCurso = editarCurso;
window.eliminarCurso = eliminarCurso;

// Mensajes
window.cambiarEstadoMensaje = cambiarEstadoMensaje;

// Testimonios
window.mostrarGestionTestimonios = mostrarGestionTestimonios;
window.mostrarFormularioTestimonio = mostrarFormularioTestimonio;
window.guardarTestimonio = guardarTestimonio;
window.editarTestimonio = editarTestimonio;
window.eliminarTestimonio = eliminarTestimonio;

// Inicio
window.mostrarGestionInicio = mostrarGestionInicio;
window.mostrarFormularioInicio = mostrarFormularioInicio;
window.guardarInicio = guardarInicio;
window.editarInicio = editarInicio;
window.eliminarInicio = eliminarInicio;

// Nosotros
window.mostrarGestionNosotros = mostrarGestionNosotros;
window.mostrarGestionAboutUs = mostrarGestionAboutUs;
window.mostrarFormularioAboutUs = mostrarFormularioAboutUs;
window.guardarAboutUs = guardarAboutUs;
window.editarAboutUs = editarAboutUs;
window.eliminarAboutUs = eliminarAboutUs;

// Equipo
window.mostrarGestionEquipo = mostrarGestionEquipo;
window.mostrarFormularioEquipo = mostrarFormularioEquipo;
window.guardarMiembroEquipo = guardarMiembroEquipo;
window.editarMiembroEquipo = editarMiembroEquipo;
window.eliminarMiembroEquipo = eliminarMiembroEquipo;

// Tienda
window.mostrarGestionTienda = mostrarGestionTienda;
window.mostrarGestionProductos = mostrarGestionProductos;
window.mostrarFormularioProducto = mostrarFormularioProducto;
window.guardarProducto = guardarProducto;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;

// Órdenes
window.mostrarGestionOrdenes = mostrarGestionOrdenes;
window.cambiarEstadoOrden = cambiarEstadoOrden;

// Usuarios
window.mostrarGestionUsuarios = mostrarGestionUsuarios;
window.mostrarFormularioUsuario = mostrarFormularioUsuario;
window.guardarUsuario = guardarUsuario;
window.editarUsuario = editarUsuario;
window.eliminarUsuario = eliminarUsuario;

// Configuración
window.mostrarConfiguracion = mostrarConfiguracion;
window.guardarConfiguracion = guardarConfiguracion;
window.realizarBackup = realizarBackup;
window.limpiarCache = limpiarCache;

// Certificados
window.mostrarGestionCertificados = mostrarGestionCertificados;
window.mostrarFormularioCertificado = mostrarFormularioCertificado;
window.guardarCertificado = guardarCertificado;
window.editarCertificado = editarCertificado;
window.eliminarCertificado = eliminarCertificado;
window.verCertificado = verCertificado;

// Navegación
window.mostrarDashboardPrincipal = mostrarDashboardPrincipal;

// General
window.volverDashboard = volverDashboard;

// Agregar estilos para badges
// =====================================================
// BÚSQUEDA Y FILTROS EN TABLAS
// =====================================================

/**
 * Inicializa la búsqueda en tiempo real para una tabla
 * @param {string} tableId - ID de la tabla
 * @param {string} searchInputId - ID del input de búsqueda
 * @param {Array} columnsToSearch - Índices de las columnas donde buscar
 */
function initializeTableSearch(tableId, searchInputId, columnsToSearch = []) {
    const searchInput = document.getElementById(searchInputId);
    const table = document.getElementById(tableId);

    if (!searchInput || !table) return;

    searchInput.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            let found = false;

            // Si no se especifican columnas, buscar en todas
            const columnsArray = columnsToSearch.length > 0 ? columnsToSearch : [...Array(cells.length).keys()];

            columnsArray.forEach(colIndex => {
                if (cells[colIndex]) {
                    const cellText = cells[colIndex].textContent.toLowerCase();
                    if (cellText.includes(searchTerm)) {
                        found = true;
                    }
                }
            });

            // Mostrar u ocultar la fila
            row.style.display = found ? '' : 'none';
        });

        // Actualizar contador de resultados
        updateResultsCount(tableId);
    });
}

/**
 * Inicializa filtros dropdown para una tabla
 * @param {string} tableId - ID de la tabla
 * @param {string} filterId - ID del select de filtro
 * @param {number} columnIndex - Índice de la columna a filtrar
 */
function initializeTableFilter(tableId, filterId, columnIndex) {
    const filterSelect = document.getElementById(filterId);
    const table = document.getElementById(tableId);

    if (!filterSelect || !table) return;

    filterSelect.addEventListener('change', function() {
        const filterValue = this.value.toLowerCase();
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const cell = cells[columnIndex];

            if (!cell) return;

            const cellText = cell.textContent.toLowerCase();

            // Si filterValue está vacío, mostrar todas las filas
            if (filterValue === '') {
                row.style.display = '';
            } else {
                row.style.display = cellText.includes(filterValue) ? '' : 'none';
            }
        });

        // Actualizar contador de resultados
        updateResultsCount(tableId);
    });
}

/**
 * Actualiza el contador de resultados visibles
 */
function updateResultsCount(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const allRows = tbody.querySelectorAll('tr');
    const visibleRows = tbody.querySelectorAll('tr:not([style*="display: none"])');

    const counterElement = document.getElementById(`${tableId}-results-count`);
    if (counterElement) {
        counterElement.textContent = `Mostrando ${visibleRows.length} de ${allRows.length} registros`;
    }
}

/**
 * Limpia todos los filtros de una tabla
 */
function clearTableFilters(tableId, searchInputId, filterIds = []) {
    // Limpiar búsqueda
    const searchInput = document.getElementById(searchInputId);
    if (searchInput) {
        searchInput.value = '';
    }

    // Limpiar filtros
    filterIds.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.value = '';
        }
    });

    // Mostrar todas las filas
    const table = document.getElementById(tableId);
    if (table) {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            row.style.display = '';
        });
        updateResultsCount(tableId);
    }
}

/**
 * Genera el HTML para la barra de búsqueda y filtros
 */
function createSearchFilterBar(config) {
    const {
        searchId,
        searchPlaceholder = 'Buscar...',
        filters = [], // [{ id, label, options: [{value, text}] }]
        tableId
    } = config;

    const filtersHTML = filters.map(filter => `
        <div class="filter-group">
            <label for="${filter.id}">${filter.label}:</label>
            <select id="${filter.id}" class="filter-select">
                <option value="">Todos</option>
                ${filter.options.map(opt => `
                    <option value="${opt.value}">${opt.text}</option>
                `).join('')}
            </select>
        </div>
    `).join('');

    const filterIds = filters.map(f => f.id);

    return `
        <div class="search-filter-container">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input
                    type="text"
                    id="${searchId}"
                    class="search-input"
                    placeholder="${searchPlaceholder}"
                >
            </div>
            ${filtersHTML}
            ${filters.length > 0 ? `
                <button class="btn btn-outline btn-sm" onclick="clearTableFilters('${tableId}', '${searchId}', ${JSON.stringify(filterIds)})">
                    <i class="fas fa-redo"></i> Limpiar
                </button>
            ` : ''}
        </div>
        <div id="${tableId}-results-count" class="results-count"></div>
    `;
}

if (!document.getElementById('dashboard-styles')) {
    const style = document.createElement('style');
    style.id = 'dashboard-styles';
    style.textContent = `
        .badge-success {
            background-color: #d4edda;
            color: #155724;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
        }

        .badge-inactive {
            background-color: #f8d7da;
            color: #721c24;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
        }

        .badge-new {
            background-color: #fff3cd;
            color: #856404;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
        }

        .badge-read {
            background-color: #d1ecf1;
            color: #0c5460;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
        }

        .table-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        .form-group label {
            margin-bottom: 8px;
            font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }

        .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #eee;
        }

        .badge-section {
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 500;
        }

        /* Estilos para búsqueda y filtros */
        .search-filter-container {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-bottom: 20px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            flex-wrap: wrap;
        }

        .search-box {
            position: relative;
            flex: 1;
            min-width: 250px;
        }

        .search-box i {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
            pointer-events: none;
        }

        .search-input {
            width: 100%;
            padding: 10px 12px 10px 36px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .search-input:focus {
            outline: none;
            border-color: #2c5282;
            box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
        }

        .filter-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .filter-group label {
            font-size: 14px;
            font-weight: 500;
            color: #495057;
            white-space: nowrap;
        }

        .filter-select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 150px;
        }

        .filter-select:focus {
            outline: none;
            border-color: #2c5282;
            box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
        }

        .results-count {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 12px;
            font-weight: 500;
        }

        .btn-sm {
            padding: 8px 12px;
            font-size: 14px;
        }

        @media (max-width: 768px) {
            .search-filter-container {
                flex-direction: column;
                align-items: stretch;
            }

            .search-box {
                min-width: 100%;
            }

            .filter-group {
                flex-direction: column;
                align-items: stretch;
            }

            .filter-select {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}

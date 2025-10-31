// =====================================================
// MOSTRAR CURSOS DINÁMICAMENTE DESDE SUPABASE
// Para index.html
// =====================================================

document.addEventListener('DOMContentLoaded', async function() {
    await cargarCursosTecnicos();
    await cargarCursosAcademicos();
});

/**
 * Cargar y mostrar cursos técnicos
 */
async function cargarCursosTecnicos() {
    try {
        // Obtener categoría de cursos técnicos
        const categoriaResult = await supabaseCRUD.getCategoryBySlug('cursos-tecnicos');

        if (!categoriaResult.success) {
            console.error('Error al cargar categoría técnica:', categoriaResult.error);
            return;
        }

        // Obtener cursos de esa categoría
        const cursosResult = await supabaseCRUD.getCourses({
            categoryId: categoriaResult.data.id
        });

        if (!cursosResult.success) {
            console.error('Error al cargar cursos técnicos:', cursosResult.error);
            return;
        }

        // Renderizar cursos
        renderizarCursos(cursosResult.data, 'cursos-tecnicos');
    } catch (error) {
        console.error('Error en cargarCursosTecnicos:', error);
    }
}

/**
 * Cargar y mostrar cursos académicos
 */
async function cargarCursosAcademicos() {
    try {
        // Obtener categoría de cursos académicos
        const categoriaResult = await supabaseCRUD.getCategoryBySlug('cursos-academicos');

        if (!categoriaResult.success) {
            console.error('Error al cargar categoría académica:', categoriaResult.error);
            return;
        }

        // Obtener cursos de esa categoría
        const cursosResult = await supabaseCRUD.getCourses({
            categoryId: categoriaResult.data.id
        });

        if (!cursosResult.success) {
            console.error('Error al cargar cursos académicos:', cursosResult.error);
            return;
        }

        // Renderizar cursos
        renderizarCursos(cursosResult.data, 'cursos-academicos');
    } catch (error) {
        console.error('Error en cargarCursosAcademicos:', error);
    }
}

/**
 * Renderizar cursos en el DOM
 */
function renderizarCursos(cursos, sectionId) {
    const section = document.getElementById(sectionId);

    if (!section) {
        console.error(`Sección ${sectionId} no encontrada`);
        return;
    }

    // Buscar el contenedor de cursos
    const serviciosGrid = section.querySelector('.servicios-grid');

    if (!serviciosGrid) {
        console.error('Grid de servicios no encontrado en la sección');
        return;
    }

    // Limpiar contenido existente
    serviciosGrid.innerHTML = '';

    // Si no hay cursos, mostrar mensaje
    if (!cursos || cursos.length === 0) {
        serviciosGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No hay cursos disponibles en este momento.</p>';
        return;
    }

    // Renderizar cada curso
    cursos.forEach(curso => {
        const cursoCard = crearCardCurso(curso);
        serviciosGrid.appendChild(cursoCard);
    });
}

/**
 * Crear card HTML para un curso
 */
function crearCardCurso(curso) {
    const card = document.createElement('div');
    card.className = 'servicio-card animate-on-scroll';

    // Determinar icono según categoría
    const icon = curso.category?.icon || 'fas fa-graduation-cap';

    // Traducir modalidad
    const modalidadTexto = {
        'presencial': 'Presencial',
        'virtual': 'Virtual',
        'hibrido': 'Presencial y Virtual'
    }[curso.modality] || curso.modality;

    card.innerHTML = `
        <div class="servicio-img">
            <img src="${curso.image_url || 'images/default-course.jpg'}"
                 alt="${curso.title}"
                 class="servicio-imagen"
                 onerror="this.src='images/default-course.jpg'">
            <div class="servicio-overlay">
                <div class="servicio-icon">
                    <i class="${icon}"></i>
                </div>
            </div>
        </div>
        <div class="servicio-content">
            <h3>${curso.title}</h3>
            <p><span>Duración:</span> ${curso.duration}</p>
            ${curso.price_enrollment ? `<p><span>Inversión:</span> S/ ${curso.price_enrollment}</p>` : '<p><span>Inversión:</span> Matrícula y Mensualidad</p>'}
            <p><span>Certificado:</span> ${curso.is_certificate_free ? 'Gratuito' : 'Incluido'}</p>
            <p><span>Modalidad:</span> ${modalidadTexto}</p>
        </div>
        <div class="servicio-footer">
            ${curso.whatsapp_link ? `
                <a href="${curso.whatsapp_link}"
                   class="btn btn-whatsapp"
                   target="_blank"
                   rel="noopener noreferrer">
                    <i class="fab fa-whatsapp" style="font-size: 1.7em;"></i>
                </a>
            ` : `
                <a href="https://wa.me/51991403402?text=Hola%20CEIN,%20quiero%20información%20sobre%20${encodeURIComponent(curso.title)}"
                   class="btn btn-whatsapp"
                   target="_blank"
                   rel="noopener noreferrer">
                    <i class="fab fa-whatsapp" style="font-size: 1.7em;"></i>
                </a>
            `}
            <a href="#contacto" class="btn">Ver más..</a>
        </div>
    `;

    return card;
}

/**
 * Función auxiliar para formatear precio
 */
function formatearPrecio(precio) {
    if (!precio) return null;
    return `S/ ${parseFloat(precio).toFixed(2)}`;
}

// Exportar funciones para uso global si es necesario
window.cursosDisplay = {
    cargarCursosTecnicos,
    cargarCursosAcademicos,
    renderizarCursos
};

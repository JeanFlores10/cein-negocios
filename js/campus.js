// =====================================================
// CAMPUS VIRTUAL - DASHBOARD PRINCIPAL
// =====================================================

let currentUser = null;
let userEnrollments = [];
let userCertificates = [];

// =====================================================
// INICIALIZACIÓN
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadUserData();
    await loadEnrollments();
    attachEventListeners();
});

// =====================================================
// AUTENTICACIÓN
// =====================================================
async function checkAuth() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            window.location.href = '../login.html';
            return;
        }

        currentUser = user;

        // Cargar perfil del usuario
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            document.getElementById('user-name').textContent = profile.full_name;
            if (profile.avatar_url) {
                document.getElementById('user-avatar').src = profile.avatar_url;
            }
        }
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        window.location.href = '../login.html';
    }
}

async function loadUserData() {
    try {
        // Cargar certificados del usuario
        const { data: certificates } = await supabase
            .from('certificates')
            .select('*')
            .eq('user_id', currentUser.id);

        userCertificates = certificates || [];
        document.getElementById('total-certificates').textContent = userCertificates.length;

    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
    }
}

// =====================================================
// CARGAR INSCRIPCIONES Y CURSOS
// =====================================================
async function loadEnrollments(filter = 'all') {
    try {
        showLoading();

        // Obtener inscripciones del usuario
        let query = supabase
            .from('enrollments')
            .select(`
                *,
                courses (
                    id,
                    title,
                    description,
                    duration,
                    modality,
                    image_url,
                    category_id,
                    categories (name)
                )
            `)
            .eq('user_id', currentUser.id);

        // Aplicar filtro
        if (filter === 'active') {
            query = query.eq('status', 'active');
        } else if (filter === 'completed') {
            query = query.eq('status', 'completed');
        }

        const { data: enrollments, error } = await query.order('enrolled_at', { ascending: false });

        if (error) throw error;

        userEnrollments = enrollments || [];

        // Actualizar estadísticas
        updateStats();

        // Renderizar cursos
        renderCourses(userEnrollments);

    } catch (error) {
        console.error('Error al cargar inscripciones:', error);
        showError('Error al cargar tus cursos');
    }
}

function updateStats() {
    const activeCourses = userEnrollments.filter(e => e.status === 'active').length;
    const completedCourses = userEnrollments.filter(e => e.status === 'completed').length;

    document.getElementById('total-courses').textContent = activeCourses;
    document.getElementById('completed-courses').textContent = completedCourses;

    // Contar materiales (simulado)
    document.getElementById('total-materials').textContent = userEnrollments.length * 5; // 5 materiales por curso aproximadamente
}

function renderCourses(enrollments) {
    const grid = document.getElementById('courses-grid');
    const emptyState = document.getElementById('empty-state');

    if (enrollments.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';

    const coursesHTML = enrollments.map(enrollment => {
        const course = enrollment.courses;
        const progress = calculateProgress(enrollment);
        const statusClass = enrollment.status === 'completed' ? 'completed' : 'active';
        const statusText = enrollment.status === 'completed' ? 'Completado' : 'En curso';

        return `
            <div class="campus-course-card" onclick="goToCourse('${course.id}')">
                <img src="${course.image_url || '../images/cursos/imagen1.jpg'}"
                     alt="${course.title}"
                     class="campus-course-image">

                <div class="campus-course-content">
                    <div class="campus-course-badge ${statusClass}">${statusText}</div>

                    <h3 class="campus-course-title">${course.title}</h3>
                    <p class="campus-course-description">${course.description || 'Curso de ' + course.title}</p>

                    <div class="campus-course-meta">
                        <span><i class="fas fa-clock"></i> ${course.duration || 'Duración variable'}</span>
                        <span><i class="fas fa-signal"></i> ${course.modality || 'Presencial'}</span>
                    </div>

                    <div class="campus-course-progress">
                        <div class="campus-course-progress-text">
                            <span>Progreso</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="campus-course-progress-bar">
                            <div class="campus-course-progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    grid.innerHTML = coursesHTML;
}

function calculateProgress(enrollment) {
    // Por ahora retornamos un progreso simulado basado en el estado
    if (enrollment.status === 'completed') return 100;
    if (enrollment.status === 'active') return Math.floor(Math.random() * 70) + 10; // Entre 10% y 80%
    return 0;
}

function goToCourse(courseId) {
    window.location.href = `course.html?id=${courseId}`;
}

// =====================================================
// FILTROS
// =====================================================
function attachEventListeners() {
    // Filtros
    document.querySelectorAll('.campus-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Actualizar botón activo
            document.querySelectorAll('.campus-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Aplicar filtro
            const filter = this.dataset.filter;
            loadEnrollments(filter);
        });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '../login.html';
    });
}

// =====================================================
// UTILIDADES
// =====================================================
function showLoading() {
    const grid = document.getElementById('courses-grid');
    grid.innerHTML = `
        <div class="campus-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando tus cursos...</p>
        </div>
    `;
}

function showError(message) {
    const grid = document.getElementById('courses-grid');
    grid.innerHTML = `
        <div class="campus-empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn" onclick="loadEnrollments()">Reintentar</button>
        </div>
    `;
}

// Vista de curso individual con materiales
let currentUser = null;
let currentCourse = null;
let enrollment = null;

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadCourse();
    attachEventListeners();
});

async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = '../login.html';
        return;
    }
    currentUser = user;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
        document.getElementById('user-name').textContent = profile.full_name;
        if (profile.avatar_url) document.getElementById('user-avatar').src = profile.avatar_url;
    }
}

async function loadCourse() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (!courseId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Cargar curso
        const { data: course } = await supabase.from('courses').select('*, categories(name)').eq('id', courseId).single();
        currentCourse = course;

        // Cargar inscripción
        const { data: enroll } = await supabase.from('enrollments').select('*').eq('user_id', currentUser.id).eq('course_id', courseId).single();
        enrollment = enroll;

        // Renderizar
        renderCourseHeader(course, enroll);
        await loadCourseMaterials(courseId);
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderCourseHeader(course, enrollment) {
    document.getElementById('course-breadcrumb').textContent = course.title;
    document.getElementById('course-title').textContent = course.title;
    document.getElementById('course-description').textContent = course.description || course.short_description;
    document.getElementById('course-duration').textContent = course.duration || 'Variable';
    document.getElementById('course-modality').textContent = course.modality || 'Presencial';
    if (course.image_url) document.getElementById('course-image').src = course.image_url;

    const enrollDate = new Date(enrollment.enrolled_at).toLocaleDateString('es-PE');
    document.getElementById('enrollment-date').textContent = enrollDate;
}

async function loadCourseMaterials(courseId) {
    const grid = document.getElementById('materials-grid');
    const empty = document.getElementById('materials-empty');

    try {
        const storageManager = new StorageManager();
        const files = await storageManager.listFiles('course-materials', `courses/${courseId}/materials`);

        if (!files || files.length === 0) {
            grid.innerHTML = '';
            empty.style.display = 'flex';
            document.getElementById('materials-count').textContent = '0 archivos';
            return;
        }

        document.getElementById('materials-count').textContent = `${files.length} archivos`;
        empty.style.display = 'none';

        const materialsHTML = files.map(file => {
            const fileType = getFileType(file.name);
            return `
                <div class="material-card">
                    <div class="material-icon ${fileType.class}">
                        <i class="${fileType.icon}"></i>
                    </div>
                    <div class="material-title">${file.name}</div>
                    <div class="material-meta">
                        <i class="fas fa-file"></i> ${formatFileSize(file.metadata?.size || 0)}
                    </div>
                    <div class="material-actions">
                        <button class="material-btn material-btn-primary" onclick="downloadMaterial('${file.name}')">
                            <i class="fas fa-download"></i> Descargar
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        grid.innerHTML = materialsHTML;
    } catch (error) {
        console.error('Error al cargar materiales:', error);
    }
}

async function downloadMaterial(fileName) {
    try {
        const storageManager = new StorageManager();
        const url = await storageManager.getDownloadUrl('course-materials', `courses/${currentCourse.id}/materials/${fileName}`);
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error al descargar:', error);
        alert('Error al descargar el archivo');
    }
}

function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
        pdf: { icon: 'fas fa-file-pdf', class: 'pdf' },
        doc: { icon: 'fas fa-file-word', class: 'doc' },
        docx: { icon: 'fas fa-file-word', class: 'doc' },
        ppt: { icon: 'fas fa-file-powerpoint', class: 'doc' },
        pptx: { icon: 'fas fa-file-powerpoint', class: 'doc' },
        mp4: { icon: 'fas fa-file-video', class: 'video' },
        default: { icon: 'fas fa-file', class: 'doc' }
    };
    return types[ext] || types.default;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function attachEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '../login.html';
    });
}

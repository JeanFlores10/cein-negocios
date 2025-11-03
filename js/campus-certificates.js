// Mis certificados
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadCertificates();
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

async function loadCertificates() {
    const grid = document.getElementById('certificates-grid');
    const empty = document.getElementById('certificates-empty');

    try {
        const { data: certificates, error } = await supabase
            .from('certificates')
            .select('*, courses(title)')
            .eq('user_id', currentUser.id)
            .order('issue_date', { ascending: false });

        if (error) throw error;

        if (!certificates || certificates.length === 0) {
            grid.innerHTML = '';
            empty.style.display = 'flex';
            return;
        }

        empty.style.display = 'none';

        const certificatesHTML = certificates.map(cert => `
            <div class="certificate-card">
                <div class="certificate-header">
                    <div class="certificate-icon">
                        <i class="fas fa-award"></i>
                    </div>
                    <h3>${cert.courses.title}</h3>
                </div>
                <div class="certificate-body">
                    <div class="certificate-info">
                        <div class="certificate-label">Código</div>
                        <div class="certificate-value">${cert.certificate_code}</div>
                    </div>
                    <div class="certificate-info">
                        <div class="certificate-label">Fecha de emisión</div>
                        <div class="certificate-value">${new Date(cert.issue_date).toLocaleDateString('es-PE')}</div>
                    </div>
                    <div class="certificate-info">
                        <div class="certificate-label">Estado</div>
                        <div class="certificate-value">
                            <span style="color: var(--campus-success)">
                                <i class="fas fa-check-circle"></i> Válido
                            </span>
                        </div>
                    </div>
                    <div class="certificate-actions">
                        ${cert.pdf_url ? `
                            <button class="btn" onclick="window.open('${cert.pdf_url}', '_blank')">
                                <i class="fas fa-download"></i> Descargar PDF
                            </button>
                        ` : `
                            <button class="btn btn-outline" disabled>
                                <i class="fas fa-clock"></i> Próximamente
                            </button>
                        `}
                        <button class="btn btn-outline" onclick="window.open('../certificates.html?code=${cert.certificate_code}', '_blank')">
                            <i class="fas fa-external-link-alt"></i> Validar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        grid.innerHTML = certificatesHTML;
    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = `
            <div class="campus-empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error al cargar certificados</h3>
                <p>Intenta recargar la página</p>
            </div>
        `;
    }
}

function attachEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '../login.html';
    });
}

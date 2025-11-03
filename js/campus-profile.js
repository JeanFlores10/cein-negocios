// Perfil del estudiante
let currentUser = null;
let currentProfile = null;

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadProfile();
    attachEventListeners();
});

async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = '../login.html';
        return;
    }
    currentUser = user;
}

async function loadProfile() {
    try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        currentProfile = profile;

        // Llenar formulario
        document.getElementById('profile-name').textContent = profile.full_name;
        document.getElementById('profile-email').textContent = profile.email;
        document.getElementById('user-name').textContent = profile.full_name;
        document.getElementById('full-name').value = profile.full_name;
        document.getElementById('email').value = profile.email;
        document.getElementById('phone').value = profile.phone || '';

        if (profile.avatar_url) {
            document.getElementById('profile-avatar').src = profile.avatar_url;
            document.getElementById('user-avatar').src = profile.avatar_url;
        }

        // Cargar estadísticas
        const { data: enrollments } = await supabase.from('enrollments').select('*').eq('user_id', currentUser.id);
        const { data: certificates } = await supabase.from('certificates').select('*').eq('user_id', currentUser.id);

        document.getElementById('profile-courses').textContent = enrollments?.length || 0;
        document.getElementById('profile-certificates').textContent = certificates?.length || 0;

    } catch (error) {
        console.error('Error al cargar perfil:', error);
    }
}

function attachEventListeners() {
    // Formulario de perfil
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });

    // Cambiar avatar
    document.getElementById('change-avatar-btn').addEventListener('click', () => {
        document.getElementById('avatar-input').click();
    });

    document.getElementById('avatar-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) await uploadAvatar(file);
    });

    // Cambiar contraseña
    document.getElementById('password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await changePassword();
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '../login.html';
    });
}

async function updateProfile() {
    try {
        const fullName = document.getElementById('full-name').value;
        const phone = document.getElementById('phone').value;

        const { error } = await supabase.from('profiles').update({
            full_name: fullName,
            phone: phone
        }).eq('id', currentUser.id);

        if (error) throw error;

        alert('Perfil actualizado correctamente');
        await loadProfile();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar perfil');
    }
}

async function uploadAvatar(file) {
    try {
        const storageManager = new StorageManager();
        const result = await storageManager.uploadAvatar(file, currentUser.id);

        // Actualizar perfil con la nueva URL
        await supabase.from('profiles').update({ avatar_url: result.publicUrl }).eq('id', currentUser.id);

        alert('Avatar actualizado correctamente');
        await loadProfile();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al subir avatar');
    }
}

async function changePassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        alert('Contraseña cambiada correctamente');
        document.getElementById('password-form').reset();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cambiar contraseña');
    }
}

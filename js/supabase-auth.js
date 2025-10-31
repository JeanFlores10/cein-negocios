// =====================================================
// SISTEMA DE AUTENTICACIÓN CON SUPABASE
// Reemplaza el sistema anterior basado en localStorage
// =====================================================

/**
 * Registrar nuevo usuario
 */
async function signUp(email, password, fullName, role = 'student') {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    role: role
                }
            }
        });

        if (error) throw error;

        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'registro');
        return { success: false, error: mensaje };
    }
}

/**
 * Iniciar sesión con email y contraseña
 */
async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'inicio de sesión');
        return { success: false, error: mensaje };
    }
}

/**
 * Cerrar sesión
 */
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        return { success: true };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'cierre de sesión');
        return { success: false, error: mensaje };
    }
}

/**
 * Recuperar contraseña
 */
async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });

        if (error) throw error;

        return { success: true, message: 'Se ha enviado un email con instrucciones para recuperar tu contraseña.' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'recuperación de contraseña');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar contraseña
 */
async function updatePassword(newPassword) {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        return { success: true, message: 'Contraseña actualizada exitosamente.' };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualización de contraseña');
        return { success: false, error: mensaje };
    }
}

/**
 * Actualizar perfil de usuario
 */
async function updateProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, profile: data };
    } catch (error) {
        const mensaje = handleSupabaseError(error, 'actualización de perfil');
        return { success: false, error: mensaje };
    }
}

/**
 * Verificar si el usuario es administrador
 */
async function isAdmin() {
    try {
        const profile = await getCurrentProfile();
        return profile && profile.role === 'admin';
    } catch (error) {
        console.error('Error al verificar rol de admin:', error);
        return false;
    }
}

/**
 * Proteger página - redirigir si no está autenticado
 */
async function protectPage(requiredRole = null) {
    const session = await checkSession();

    if (!session) {
        window.location.href = 'login.html';
        return null;
    }

    // Si se requiere un rol específico
    if (requiredRole) {
        const profile = await getCurrentProfile();

        if (!profile || profile.role !== requiredRole) {
            window.location.href = 'index.html';
            return null;
        }
    }

    return session;
}

/**
 * Redirigir si ya está autenticado
 */
async function redirectIfAuthenticated(redirectTo = 'dashboard.html') {
    const session = await checkSession();

    if (session) {
        window.location.href = redirectTo;
    }
}

// =====================================================
// EVENT LISTENERS Y MANEJO DE FORMULARIOS
// =====================================================

document.addEventListener('DOMContentLoaded', async function() {
    // Manejar formulario de login
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        // Redirigir si ya está autenticado
        await redirectIfAuthenticated();

        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Validación básica
            if (!email || !password) {
                mostrarMensaje('Por favor, complete todos los campos', 'error');
                return;
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                mostrarMensaje('Por favor, ingrese un email válido', 'error');
                return;
            }

            // Deshabilitar botón de submit
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';

            // Intentar iniciar sesión
            const resultado = await signIn(email, password);

            if (resultado.success) {
                mostrarMensaje('¡Bienvenido! Redirigiendo...', 'success');

                // Agregar animación de salida
                document.querySelector('.login-container').style.animation = 'fadeOut 0.5s ease';

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                mostrarMensaje(resultado.error, 'error');
                // Vibrar el formulario
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);

                // Rehabilitar botón
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Event listeners para cerrar sesión
    const logoutButtons = document.querySelectorAll('a[href="#logout"]');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();

            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                const resultado = await signOut();

                if (resultado.success) {
                    window.location.href = 'login.html';
                } else {
                    alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
                }
            }
        });
    });

    // Verificar sesión en dashboard
    if (document.querySelector('.dashboard')) {
        const session = await protectPage();

        if (session) {
            // Actualizar información del usuario en el dashboard
            const profile = await getCurrentProfile();

            if (profile) {
                const userNameElement = document.querySelector('.admin-user-name');
                const userRoleElement = document.querySelector('.admin-user-role');

                if (userNameElement) {
                    userNameElement.textContent = profile.full_name;
                }

                if (userRoleElement) {
                    // Traducir rol al español
                    const roleTranslations = {
                        'admin': 'Administrador',
                        'instructor': 'Instructor',
                        'student': 'Estudiante'
                    };
                    userRoleElement.textContent = roleTranslations[profile.role] || profile.role;
                }
            }
        }
    }

    // Manejar recuperación de contraseña
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async function(e) {
            e.preventDefault();

            const email = prompt('Ingresa tu email para recuperar tu contraseña:');

            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert('Por favor, ingrese un email válido');
                    return;
                }

                const resultado = await resetPassword(email);

                if (resultado.success) {
                    alert(resultado.message);
                } else {
                    alert(resultado.error);
                }
            }
        });
    }
});

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

/**
 * Mostrar mensajes de alerta en el login
 */
function mostrarMensaje(mensaje, tipo) {
    // Eliminar mensaje anterior si existe
    const mensajeAnterior = document.querySelector('.mensaje-alerta');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }

    // Crear nuevo mensaje
    const div = document.createElement('div');
    div.className = `mensaje-alerta mensaje-${tipo}`;
    div.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${mensaje}</span>
    `;

    // Insertar antes del formulario
    const loginContainer = document.querySelector('.login-container');
    const loginForm = document.querySelector('.login-form');

    if (loginContainer && loginForm) {
        loginContainer.insertBefore(div, loginForm);

        // Animar entrada
        setTimeout(() => div.classList.add('show'), 10);

        // Auto eliminar después de 5 segundos
        setTimeout(() => {
            div.classList.remove('show');
            setTimeout(() => div.remove(), 300);
        }, 5000);
    }
}

// Agregar estilos para los mensajes si no existen
if (!document.getElementById('auth-styles')) {
    const style = document.createElement('style');
    style.id = 'auth-styles';
    style.textContent = `
        .mensaje-alerta {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: 500;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        }

        .mensaje-alerta.show {
            opacity: 1;
            transform: translateY(0);
        }

        .mensaje-success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .mensaje-error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .mensaje-alerta i {
            font-size: 1.2rem;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .shake {
            animation: shake 0.5s;
        }

        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: scale(1);
            }
            to {
                opacity: 0;
                transform: scale(0.9);
            }
        }

        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .login-container {
            animation: fadeInScale 0.5s ease;
        }
    `;
    document.head.appendChild(style);
}

// Exportar funciones para uso global
window.supabaseAuth = {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAdmin,
    protectPage,
    redirectIfAuthenticated
};

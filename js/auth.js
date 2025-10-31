// Sistema de Autenticación para CEIN

// Usuarios de ejemplo (en producción esto vendría de una API/Base de datos)
const usuarios = {
    'admin@cein.com': {
        password: 'admin123',
        nombre: 'Jordy Carmin',
        rol: 'Administrador'
    },
    'usuario@cein.com': {
        password: 'user123',
        nombre: 'Usuario Demo',
        rol: 'Usuario'
    }
};

// Función para iniciar sesión
function iniciarSesion(email, password) {
    const usuario = usuarios[email];

    if (usuario && usuario.password === password) {
        // Guardar sesión en localStorage
        const sesion = {
            email: email,
            nombre: usuario.nombre,
            rol: usuario.rol,
            timestamp: new Date().getTime()
        };

        localStorage.setItem('cein_sesion', JSON.stringify(sesion));
        return { success: true, usuario: sesion };
    }

    return { success: false, mensaje: 'Credenciales incorrectas' };
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('cein_sesion');
    window.location.href = 'login.html';
}

// Función para verificar si hay sesión activa
function verificarSesion() {
    const sesionStr = localStorage.getItem('cein_sesion');

    if (!sesionStr) {
        return null;
    }

    const sesion = JSON.parse(sesionStr);
    const tiempoActual = new Date().getTime();
    const tiempoSesion = tiempoActual - sesion.timestamp;

    // Sesión válida por 24 horas
    if (tiempoSesion > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('cein_sesion');
        return null;
    }

    return sesion;
}

// Función para proteger páginas que requieren autenticación
function protegerPagina() {
    const sesion = verificarSesion();

    if (!sesion) {
        window.location.href = 'login.html';
    }

    return sesion;
}

// Función para redirigir si ya está autenticado
function redirigirSiAutenticado() {
    const sesion = verificarSesion();

    if (sesion) {
        window.location.href = 'dashboard.html';
    }
}

// Event listener para el formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        // Redirigir si ya está autenticado
        redirigirSiAutenticado();

        loginForm.addEventListener('submit', function(e) {
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

            // Intentar iniciar sesión
            const resultado = iniciarSesion(email, password);

            if (resultado.success) {
                mostrarMensaje('¡Bienvenido! Redirigiendo...', 'success');

                // Agregar animación de salida
                document.querySelector('.login-container').style.animation = 'fadeOut 0.5s ease';

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                mostrarMensaje(resultado.mensaje, 'error');
                // Vibrar el formulario
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }
        });
    }

    // Event listeners para cerrar sesión
    const logoutButtons = document.querySelectorAll('a[href="#logout"]');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();

            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                cerrarSesion();
            }
        });
    });

    // Verificar sesión en dashboard
    if (document.querySelector('.dashboard')) {
        const sesion = protegerPagina();

        // Actualizar información del usuario en el dashboard
        const userNameElement = document.querySelector('.admin-user-name');
        const userRoleElement = document.querySelector('.admin-user-role');

        if (userNameElement && sesion) {
            userNameElement.textContent = sesion.nombre;
        }

        if (userRoleElement && sesion) {
            userRoleElement.textContent = sesion.rol;
        }
    }
});

// Función para mostrar mensajes
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

// Agregar estilos para los mensajes y animaciones
const style = document.createElement('style');
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

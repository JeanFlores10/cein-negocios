// =====================================================
// CONFIGURACIÓN DE SUPABASE PARA CEIN-NEGOCIOS
// =====================================================

// Obtener credenciales desde variables de entorno
const SUPABASE_URL = 'https://nsrrhwphpevlpwffymqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcnJod3BocGV2bHB3ZmZ5bXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzI0NTksImV4cCI6MjA3NzQ0ODQ1OX0.BBwvqZ2LpQQWiN2RGxjJ6SzU_8sy9vFEDCFyWmFUZ2I';

// Inicializar cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================================
// UTILIDADES PARA MANEJO DE ERRORES
// =====================================================

/**
 * Maneja errores de Supabase y los muestra de forma amigable
 */
function handleSupabaseError(error, context = '') {
    console.error(`Error en ${context}:`, error);

    let mensaje = 'Ha ocurrido un error inesperado';

    if (error.message) {
        // Traducir mensajes comunes de error
        if (error.message.includes('Invalid login credentials')) {
            mensaje = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (error.message.includes('User already registered')) {
            mensaje = 'Este email ya está registrado. Intenta iniciar sesión.';
        } else if (error.message.includes('Email not confirmed')) {
            mensaje = 'Por favor, confirma tu email antes de iniciar sesión.';
        } else if (error.message.includes('rate limit')) {
            mensaje = 'Demasiados intentos. Por favor, espera unos minutos.';
        } else {
            mensaje = error.message;
        }
    }

    return mensaje;
}

/**
 * Verifica si hay una sesión activa
 */
async function checkSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        return session;
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        return null;
    }
}

/**
 * Obtiene el usuario actual
 */
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        return user;
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return null;
    }
}

/**
 * Obtiene el perfil completo del usuario actual
 */
async function getCurrentProfile() {
    try {
        const user = await getCurrentUser();

        if (!user) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        return profile;
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return null;
    }
}

// Exportar para uso global
window.supabaseClient = supabase;
window.supabaseUtils = {
    handleSupabaseError,
    checkSession,
    getCurrentUser,
    getCurrentProfile
};

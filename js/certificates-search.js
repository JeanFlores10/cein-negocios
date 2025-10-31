// =====================================================
// BÚSQUEDA Y VALIDACIÓN DE CERTIFICADOS
// Conectado a Supabase
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    const formConsulta = document.getElementById('form-consulta-certificado');
    const resultadosDiv = document.getElementById('resultados-certificado');

    // Ocultar resultados inicialmente
    if (resultadosDiv) {
        resultadosDiv.style.display = 'none';
    }

    // Manejar envío del formulario
    if (formConsulta) {
        formConsulta.addEventListener('submit', async function(e) {
            e.preventDefault();

            const documento = document.getElementById('documento').value.trim();

            if (!documento) {
                mostrarAlerta('Por favor, ingrese un número de documento o código de certificado', 'error');
                return;
            }

            // Mostrar indicador de carga
            const submitBtn = formConsulta.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';

            try {
                await buscarCertificado(documento);
            } finally {
                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // Animación para la sección
    const certificadoSection = document.querySelector('.consulta-certificados');
    if (certificadoSection) {
        setTimeout(() => {
            certificadoSection.classList.add('visible');
        }, 300);
    }
});

/**
 * Buscar certificado por código o documento
 */
async function buscarCertificado(busqueda) {
    try {
        let resultado;

        // Determinar si es código de certificado o documento
        if (busqueda.toUpperCase().startsWith('CEIN-')) {
            // Buscar por código
            resultado = await supabaseCRUD.getCertificateByCode(busqueda.toUpperCase());
        } else {
            // Buscar por documento (puede retornar múltiples certificados)
            resultado = await supabaseCRUD.getCertificatesByDocument(busqueda);
        }

        if (!resultado.success) {
            mostrarAlerta(resultado.error, 'error');
            ocultarResultados();
            return;
        }

        // Si es búsqueda por documento, tomar el primer certificado
        const certificado = Array.isArray(resultado.data) ? resultado.data[0] : resultado.data;

        if (!certificado) {
            mostrarAlerta('No se encontró ningún certificado con el documento o código proporcionado.', 'error');
            ocultarResultados();
            return;
        }

        // Mostrar certificado
        mostrarCertificado(certificado);

        // Si hay múltiples certificados, informar al usuario
        if (Array.isArray(resultado.data) && resultado.data.length > 1) {
            mostrarAlerta('Se encontraron ' + resultado.data.length + ' certificados. Mostrando el más reciente.', 'info');
        }

    } catch (error) {
        console.error('Error en búsqueda de certificado:', error);
        mostrarAlerta('Ocurrió un error al buscar el certificado. Por favor, intente nuevamente.', 'error');
        ocultarResultados();
    }
}

/**
 * Mostrar datos del certificado en el DOM
 */
function mostrarCertificado(certificado) {
    const resultadosDiv = document.getElementById('resultados-certificado');

    if (!resultadosDiv) return;

    // Formatear fecha
    const fecha = formatearFecha(certificado.issue_date);

    // Actualizar información del certificado
    const nombreElement = document.getElementById('cert-nombre');
    const cursoElement = document.getElementById('cert-curso');
    const fechaElement = document.getElementById('cert-fecha');
    const codigoElement = document.getElementById('cert-codigo');

    if (nombreElement) nombreElement.textContent = certificado.student_name;
    if (cursoElement) cursoElement.textContent = certificado.course?.title || 'Curso';
    if (fechaElement) fechaElement.textContent = fecha;
    if (codigoElement) codigoElement.textContent = certificado.certificate_code;

    // Actualizar estado del certificado
    const estadoDiv = resultadosDiv.querySelector('.estado-certificado');
    if (estadoDiv) {
        if (certificado.is_valid) {
            estadoDiv.className = 'estado-certificado estado-valido';
            estadoDiv.innerHTML = '<i class="fas fa-check-circle"></i> Certificado Válido y Verificado';
        } else {
            estadoDiv.className = 'estado-certificado estado-invalido';
            estadoDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Certificado No Válido';
        }
    }

    // Actualizar enlace de descarga si existe PDF
    const btnDescargar = resultadosDiv.querySelector('.btn-descargar');
    if (btnDescargar && certificado.pdf_url) {
        btnDescargar.href = certificado.pdf_url;
        btnDescargar.style.display = 'inline-flex';
    } else if (btnDescargar) {
        btnDescargar.href = '#';
        btnDescargar.style.display = 'none';
    }

    // Mostrar resultados con animación
    resultadosDiv.style.display = 'block';

    // Scroll suave a resultados
    setTimeout(function() {
        resultadosDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * Ocultar resultados
 */
function ocultarResultados() {
    const resultadosDiv = document.getElementById('resultados-certificado');
    if (resultadosDiv) {
        resultadosDiv.style.display = 'none';
    }
}

/**
 * Formatear fecha para mostrar
 */
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';

    const fecha = new Date(fechaISO);
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };

    return fecha.toLocaleDateString('es-PE', opciones);
}

/**
 * Mostrar alertas al usuario
 */
function mostrarAlerta(mensaje, tipo) {
    // Eliminar alerta anterior si existe
    const alertaAnterior = document.querySelector('.alerta-certificado');
    if (alertaAnterior) {
        alertaAnterior.remove();
    }

    // Crear alerta
    const alerta = document.createElement('div');
    alerta.className = 'alerta-certificado alerta-' + tipo;
    alerta.innerHTML = '<i class="fas fa-' + (tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle') + '"></i>' +
        '<span>' + mensaje + '</span>' +
        '<button class="alerta-cerrar" onclick="this.parentElement.remove()">' +
        '<i class="fas fa-times"></i>' +
        '</button>';

    // Insertar en el DOM
    const container = document.querySelector('.certificado-container');
    const form = document.querySelector('.certificado-form');

    if (container && form) {
        container.insertBefore(alerta, form.nextSibling);

        // Animar entrada
        setTimeout(function() { alerta.classList.add('show'); }, 10);

        // Auto eliminar
        setTimeout(function() {
            alerta.classList.remove('show');
            setTimeout(function() { alerta.remove(); }, 300);
        }, 5000);
    }
}

// Agregar estilos para las alertas
if (!document.getElementById('certificates-styles')) {
    const style = document.createElement('style');
    style.id = 'certificates-styles';
    style.textContent = '.alerta-certificado { display: flex; align-items: center; gap: 12px; padding: 15px 20px; border-radius: 10px; margin: 20px 0; font-weight: 500; opacity: 0; transform: translateY(-10px); transition: all 0.3s ease; } .alerta-certificado.show { opacity: 1; transform: translateY(0); } .alerta-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; } .alerta-error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; } .alerta-info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; } .alerta-certificado i { font-size: 1.2rem; } .alerta-certificado span { flex: 1; } .alerta-cerrar { background: none; border: none; cursor: pointer; font-size: 1.2rem; color: inherit; opacity: 0.7; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; transition: opacity 0.2s; } .alerta-cerrar:hover { opacity: 1; } .estado-invalido { background-color: #f8d7da !important; color: #721c24 !important; border-color: #f5c6cb !important; } .estado-valido { background-color: #d4edda !important; color: #155724 !important; border-color: #c3e6cb !important; }';
    document.head.appendChild(style);
}

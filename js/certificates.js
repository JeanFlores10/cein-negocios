
    const formConsulta = document.getElementById('form-consulta-certificado');
    const resultadosDiv = document.getElementById('resultados-certificado');
    
    // Datos de ejemplo (en una aplicación real, esto vendría de una base de datos)
    const certificadosEjemplo = {
        '12345678': {
            nombre: 'María López Rodríguez',
            curso: 'Marketing Digital para Emprendedores',
            fecha: '15 de Noviembre, 2023',
            codigo: 'CEIN-MD-2023-12345',
            valido: true
        },
        'CERT-12345': {
            nombre: 'María López Rodríguez',
            curso: 'Marketing Digital para Emprendedores',
            fecha: '15 de Noviembre, 2023',
            codigo: 'CEIN-MD-2023-12345',
            valido: true
        },
        '87654321': {
            nombre: 'Carlos Mendoza Silva',
            curso: 'Curso Emprendedor Básico',
            fecha: '10 de Octubre, 2023',
            codigo: 'CEIN-EB-2023-67890',
            valido: true
        }
    };
    
    formConsulta.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const documento = document.getElementById('documento').value.trim();
        
        if (documento) {
            // Simular búsqueda (en una aplicación real, sería una petición AJAX)
            setTimeout(() => {
                const certificado = certificadosEjemplo[documento];
                
                if (certificado) {
                    // Llenar la información del certificado
                    document.getElementById('cert-nombre').textContent = certificado.nombre;
                    document.getElementById('cert-curso').textContent = certificado.curso;
                    document.getElementById('cert-fecha').textContent = certificado.fecha;
                    document.getElementById('cert-codigo').textContent = certificado.codigo;
                    
                    // Actualizar estado
                    const estadoDiv = resultadosDiv.querySelector('.estado-certificado');
                    if (certificado.valido) {
                        estadoDiv.className = 'estado-certificado estado-valido';
                        estadoDiv.innerHTML = '<i class="fas fa-check-circle"></i> Certificado Válido y Verificado';
                    } else {
                        estadoDiv.className = 'estado-certificado estado-invalido';
                        estadoDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Certificado No Válido';
                    }
                    
                    // Mostrar resultados
                    resultadosDiv.style.display = 'block';
                    
                    // Scroll a resultados
                    resultadosDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    alert('No se encontró ningún certificado con el documento o código proporcionado. Por favor, verifica la información e intenta nuevamente.');
                }
            }, 800); // Simular delay de búsqueda
        }
    });
    
    // Animación para la sección
    const certificadoSection = document.querySelector('.consulta-certificados');
    if (certificadoSection) {
        setTimeout(() => {
            certificadoSection.classList.add('visible');
        }, 300);
    }
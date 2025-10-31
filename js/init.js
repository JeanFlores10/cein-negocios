// Navegación móvil y efectos mejorados
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const header = document.querySelector("header");

  // Efecto header al hacer scroll
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScroll = currentScroll;
  });

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.innerHTML = navLinks.classList.contains("active")
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  // Cerrar menú al hacer clic en un enlace
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });

  // Animación al hacer scroll
  function checkScroll() {
    const elements = document.querySelectorAll(".animate-on-scroll");

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;

      if (elementPosition < screenPosition) {
        element.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", checkScroll);
  window.addEventListener("load", checkScroll);

  // Formulario de contacto mejorado con validaciones

  const contactForm = document.getElementById("formulario-contacto");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Obtener valores
      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const servicio = document.getElementById("servicio").value;
      const mensaje = document.getElementById("mensaje").value.trim();

      // Validaciones mejoradas
      if (!nombre || nombre.length < 3) {
        mostrarAlerta("Por favor, ingrese un nombre válido (mínimo 3 caracteres)", "error");
        document.getElementById("nombre").focus();
        return;
      }

      // Validar email con regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        mostrarAlerta("Por favor, ingrese un email válido", "error");
        document.getElementById("email").focus();
        return;
      }

      // Validar teléfono si se proporciona
      if (telefono && telefono.length < 9) {
        mostrarAlerta("Por favor, ingrese un número de teléfono válido", "error");
        document.getElementById("telefono").focus();
        return;
      }

      if (!mensaje || mensaje.length < 10) {
        mostrarAlerta("Por favor, ingrese un mensaje más detallado (mínimo 10 caracteres)", "error");
        document.getElementById("mensaje").focus();
        return;
      }

      // Crear mensaje de WhatsApp
      let whatsappMessage = `*Nuevo contacto desde CEIN*\n\n`;
      whatsappMessage += `*Nombre:* ${nombre}\n`;
      whatsappMessage += `*Email:* ${email}\n`;
      if (telefono) whatsappMessage += `*Teléfono:* ${telefono}\n`;
      if (servicio) whatsappMessage += `*Servicio de interés:* ${servicio}\n`;
      whatsappMessage += `\n*Mensaje:*\n${mensaje}`;

      const whatsappUrl = `https://wa.me/51991403402?text=${encodeURIComponent(
        whatsappMessage
      )}`;

      // Mostrar mensaje de éxito
      mostrarAlerta(`¡Gracias ${nombre}! Redirigiendo a WhatsApp...`, "success");

      // Limpiar formulario
      setTimeout(() => {
        contactForm.reset();
        // Abrir WhatsApp
        window.open(whatsappUrl, "_blank");
      }, 1500);
    });

    // Validación en tiempo real
    document.getElementById("email").addEventListener("blur", function() {
      const email = this.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (email && !emailRegex.test(email)) {
        this.style.borderColor = "#dc3545";
      } else {
        this.style.borderColor = "#eaeaea";
      }
    });
  }

  // Función para mostrar alertas mejoradas
  function mostrarAlerta(mensaje, tipo) {
    // Eliminar alerta anterior si existe
    const alertaAnterior = document.querySelector(".alerta-flotante");
    if (alertaAnterior) {
      alertaAnterior.remove();
    }

    // Crear alerta
    const alerta = document.createElement("div");
    alerta.className = `alerta-flotante alerta-${tipo}`;
    alerta.innerHTML = `
      <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${mensaje}</span>
      <button class="alerta-cerrar" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    document.body.appendChild(alerta);

    // Animar entrada
    setTimeout(() => alerta.classList.add("show"), 10);

    // Auto eliminar
    setTimeout(() => {
      alerta.classList.remove("show");
      setTimeout(() => alerta.remove(), 300);
    }, 5000);
  }

  // Smooth scrolling para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      if (this.getAttribute("href") === "#") return;

      e.preventDefault();

      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });
    let slides = document.querySelectorAll('.hero-slider .slide');
  let current = 0;

  function nextSlide() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }

  setInterval(nextSlide, 5000); // cambia cada 5 segundos

  // Crear y agregar botón back to top
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTop.setAttribute('aria-label', 'Volver arriba');
  document.body.appendChild(backToTop);

  // Crear barra de progreso de scroll
  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  document.body.appendChild(scrollProgress);

  // Manejar scroll para back to top y progress bar
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrolled / height) * 100;

    // Actualizar barra de progreso
    scrollProgress.style.transform = `scaleX(${progress / 100})`;

    // Mostrar/ocultar botón back to top
    if (scrolled > 500) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  });

  // Funcionalidad del botón back to top
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Efecto parallax deshabilitado para evitar conflictos visuales

  // Agregar números de contador animado para estadísticas
  const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 20);
  };

  // Observador para animar contadores cuando son visibles
  const counters = document.querySelectorAll('.stat-number');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          const target = parseInt(entry.target.textContent);
          entry.target.classList.add('animated');
          animateCounter(entry.target, target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }
});

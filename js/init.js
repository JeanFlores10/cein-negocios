// Navegación móvil
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  

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

  // Formulario de contacto

  const contactForm = document.getElementById("formulario-contacto");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Validación básica
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const mensaje = document.getElementById("mensaje").value;

    if (!nombre || !email || !mensaje) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    // Simular envío exitoso
    alert(
      `¡Gracias ${nombre}! Tu mensaje ha sido enviado. Nos contactaremos contigo pronto.`
    );

    // Redirigir a WhatsApp con la información del formulario
    const telefono = document.getElementById("telefono").value;
    const servicio = document.getElementById("servicio").value;

    let whatsappMessage = `Hola, soy ${nombre}. ${mensaje}`;
    if (telefono) whatsappMessage += `. Mi teléfono es: ${telefono}`;
    if (servicio) whatsappMessage += `. Me interesa: ${servicio}`;

    const whatsappUrl = `https://wa.me/51987654321?text=${encodeURIComponent(
      whatsappMessage
    )}`;

    // Limpiar formulario
    contactForm.reset();

    // Abrir WhatsApp
    window.open(whatsappUrl, "_blank");
  });

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

  setInterval(nextSlide, 5000); // cambia cada 6 segundos
});

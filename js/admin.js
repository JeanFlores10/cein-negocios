const sidebarToggle = document.querySelector(".admin-sidebar-toggle");
  const adminSidebar = document.querySelector(".admin-sidebar");
  const adminContent = document.querySelector(".admin-content");

  sidebarToggle.addEventListener("click", function () {
    adminSidebar.classList.toggle("active");
  });

  // Cerrar sidebar al hacer clic fuera de él en mobile
  document.addEventListener("click", function (event) {
    if (window.innerWidth <= 992) {
      const isClickInsideSidebar = adminSidebar.contains(event.target);
      const isClickOnToggle = sidebarToggle.contains(event.target);

      if (
        !isClickInsideSidebar &&
        !isClickOnToggle &&
        adminSidebar.classList.contains("active")
      ) {
        adminSidebar.classList.remove("active");
      }
    }
  });

  // Ajustar en redimensionamiento de ventana
  window.addEventListener("resize", function () {
    if (window.innerWidth > 992) {
      adminSidebar.classList.remove("active");
    }
  });
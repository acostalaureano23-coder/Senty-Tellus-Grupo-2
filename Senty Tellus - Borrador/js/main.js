/* ============================================
   SENTEY TELLUS — JavaScript Principal
   ============================================
   Este archivo controla:
   - Las animaciones al hacer scroll (fade-in)
   - El año dinámico del footer
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===========================================
  // 1) ANIMACIONES AL SCROLL (Fade In)
  // ===========================================
  // Los elementos con clase "fade-in" aparecen
  // suavemente cuando entran en la pantalla.
  const fadeElements = document.querySelectorAll('.fade-in');

  const observerOptions = {
    root: null,           // viewport
    threshold: 0.15,      // 15% visible = se activa
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Una vez que aparece, dejamos de observar
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  // ===========================================
  // 2) AÑO DINÁMICO EN EL FOOTER
  // ===========================================
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ===========================================
  // 3) PROTECCIÓN DE ACCESO: PANEL DE BASE DE DATOS
  // ===========================================
  // Solo los usuarios con rol de 'admin' pueden entrar al panel
  const appLauncher = document.getElementById('btn-app-launcher');
  if (appLauncher) {
    appLauncher.addEventListener('click', (e) => {
      const user = (typeof TellusDB !== 'undefined' && TellusDB.session) ? TellusDB.session.getUser() : null;

      if (!user) {
        // No está logueado
        e.preventDefault();
        if (typeof TellusToast !== 'undefined') {
          TellusToast.show('🔒 Acceso restringido: Iniciá sesión como Administrador para ingresar al panel.', 'warning');
        }
        if (typeof TellusAuth !== 'undefined' && TellusAuth.openAuthModal) {
          TellusAuth.openAuthModal();
        }
      } else if (user.rol !== 'admin') {
        // Está logueado pero no es admin
        e.preventDefault();
        if (typeof TellusToast !== 'undefined') {
          TellusToast.show(`⛔ Acceso denegado: Tu cuenta (${user.nombre.split(' ')[0]}) no tiene permisos de Administrador.`, 'error');
        } else {
          alert('Acceso denegado: Solo cuentas con rol de Administrador pueden ingresar a la base de datos.');
        }
      }
      // Si user.rol === 'admin', el enlace sigue normalmente a admin-db.html
    });
  }

});

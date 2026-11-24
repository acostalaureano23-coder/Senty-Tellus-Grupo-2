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

  // ===========================================
  // 4) MODAL: SOLICITAR UN PROYECTO
  // ===========================================
  const modalOverlay = document.getElementById('project-modal-overlay');
  const btnOpenModal = document.getElementById('btn-open-project-modal');
  const btnCloseModal = document.getElementById('btn-close-project-modal');
  const formProject = document.getElementById('form-solicitar-proyecto');
  const btnSendEmail = document.getElementById('btn-send-email');

  function openProjectModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstInput = document.getElementById('proj-nombre');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function closeProjectModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', openProjectModal);
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeProjectModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeProjectModal();
    }
  });

  // Envío por WhatsApp
  if (formProject) {
    formProject.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('proj-nombre')?.value.trim();
      const contacto = document.getElementById('proj-contacto')?.value.trim();
      const tipo = document.getElementById('proj-tipo')?.value;
      const descripcion = document.getElementById('proj-descripcion')?.value.trim();

      if (!nombre || !contacto || !descripcion) {
        if (typeof TellusToast !== 'undefined') {
          TellusToast.show('Por favor completá todos los campos requeridos.', 'warning');
        } else {
          alert('Por favor completá todos los campos requeridos.');
        }
        return;
      }

      const msg = `¡Hola Senty Tellus! 👋 Quisiera solicitar un presupuesto para un proyecto tecnológico.\n\n👤 *Nombre / Proyecto:* ${nombre}\n📱 *Contacto:* ${contacto}\n🎯 *Tipo de Servicio:* ${tipo}\n📝 *Detalle del Proyecto:* ${descripcion}\n\n¡Espero su respuesta para coordinar!`;
      const waUrl = `https://wa.me/542216427371?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');

      if (typeof TellusToast !== 'undefined') {
        TellusToast.show('✨ ¡Abriendo WhatsApp! Te responderemos a la brevedad.', 'success');
      }

      formProject.reset();
      closeProjectModal();
    });
  }

  // Envío alternativo por Email
  if (btnSendEmail && formProject) {
    btnSendEmail.addEventListener('click', () => {
      const nombre = document.getElementById('proj-nombre')?.value.trim();
      const contacto = document.getElementById('proj-contacto')?.value.trim();
      const tipo = document.getElementById('proj-tipo')?.value;
      const descripcion = document.getElementById('proj-descripcion')?.value.trim();

      if (!nombre || !contacto || !descripcion) {
        if (typeof TellusToast !== 'undefined') {
          TellusToast.show('Por favor completá los campos antes de enviar por correo.', 'warning');
        } else {
          alert('Por favor completá los campos antes de enviar por correo.');
        }
        return;
      }

      const subject = encodeURIComponent(`Solicitud de Proyecto: ${tipo} — ${nombre}`);
      const body = encodeURIComponent(
        `Hola Senty Tellus,\n\nQuisiera solicitar información y presupuesto para el siguiente proyecto:\n\n` +
        `- Nombre/Proyecto: ${nombre}\n` +
        `- Contacto: ${contacto}\n` +
        `- Tipo de Servicio: ${tipo}\n` +
        `- Descripción:\n${descripcion}\n\nSaludos cordiales.`
      );

      window.location.href = `mailto:contacto.senteytellus@gmail.com?subject=${subject}&body=${body}`;

      if (typeof TellusToast !== 'undefined') {
        TellusToast.show('📧 Abriendo tu gestor de correo con el mensaje listo.', 'info');
      }

      formProject.reset();
      closeProjectModal();
    });
  }

});

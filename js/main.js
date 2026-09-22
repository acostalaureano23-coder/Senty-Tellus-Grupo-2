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

});

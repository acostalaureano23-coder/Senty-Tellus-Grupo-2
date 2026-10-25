/**
 * ============================================================
 * SENTEY TELLUS & ANGEL'S WANS — GESTIÓN DE AUTENTICACIÓN Y SESIÓN (Auth.js)
 * ============================================================
 * Controla:
 * - Inicio de sesión y Registro con validaciones.
 * - Inserción y consulta en la tabla 'usuarios' de TellusDB.
 * - Widget dinámico de usuario en el Header.
 * - Modal de "Mis Compras" para ver historial de recibos.
 * - Sistema global de notificaciones Toast.
 * ============================================================
 */

// Sistema de Notificaciones Toast
const TellusToast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'tellus-toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 3500) {
    this.init();
    const icons = {
      success: '✅',
      error: '❌',
      info: '💜',
      warning: '⚠️'
    };
    const toast = document.createElement('div');
    toast.className = `tellus-toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || '💜'}</span> <span>${message}</span>`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

const TellusAuth = (() => {
  let authModal = null;
  let purchasesModal = null;

  function init() {
    renderHeaderWidget();
    createAuthModal();
    createPurchasesModal();

    // Escuchar cambios de autenticación
    window.addEventListener('tellus:auth-change', () => {
      renderHeaderWidget();
    });
  }

  // ==========================================
  // RENDERIZAR WIDGET DE USUARIO EN EL HEADER
  // ==========================================
  function renderHeaderWidget() {
    // Buscar contenedores de iconos de cabecera en las distintas páginas
    let headerIcons = document.querySelector('.aw-header-icons');
    if (!headerIcons) {
      // Si estamos en index.html u otra página
      const siteHeader = document.querySelector('.site-header');
      if (siteHeader) {
        let existing = document.getElementById('tellus-header-actions');
        if (!existing) {
          existing = document.createElement('div');
          existing.id = 'tellus-header-actions';
          existing.className = 'aw-user-nav-actions';
          siteHeader.appendChild(existing);
        }
        headerIcons = existing;
      }
    }

    if (!headerIcons) return;

    // Guardar si ya existía el icono del carrito
    const hadCart = headerIcons.querySelector('.icon-cart') || document.querySelector('.store-main');

    headerIcons.innerHTML = '';
    headerIcons.className = 'aw-header-icons aw-user-nav-actions';

    // 1. Icono del Carrito (si estamos en la tienda o existía)
    if (hadCart) {
      const cartBtn = document.createElement('span');
      cartBtn.className = 'icon-cart';
      cartBtn.innerHTML = '🛒';
      cartBtn.title = 'Ver Carrito / Pagar';
      cartBtn.style.cursor = 'pointer';
      cartBtn.onclick = () => {
        if (typeof TellusStore !== 'undefined') {
          TellusStore.openCheckout();
        }
      };
      headerIcons.appendChild(cartBtn);
    }

    // 2. Widget de Usuario o Botón Iniciar Sesión
    const currentUser = TellusDB.session.getUser();

    if (currentUser) {
      const userContainer = document.createElement('div');
      userContainer.className = 'aw-user-dropdown-container';

      const userPill = document.createElement('button');
      userPill.className = 'aw-user-pill';
      userPill.innerHTML = `<span>👤</span> <span>${currentUser.nombre.split(' ')[0]}</span> <span style="font-size: 0.7rem;">▼</span>`;

      const isAdmin = currentUser.rol === 'admin';

      const dropdown = document.createElement('div');
      dropdown.className = 'aw-user-dropdown';
      dropdown.innerHTML = `
        <div style="padding: 6px 12px; font-size: 0.78rem; color: #94a3b8; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
          Cuenta: <strong style="color: #a78bfa;">${currentUser.mc_nickname || currentUser.nombre}</strong>
        </div>
        <button id="btn-user-my-orders">📦 Mis Compras</button>
        ${isAdmin ? '<a href="admin-db.html" target="_blank" style="color: #c4b5fd;">⚙️ Panel Base de Datos (Admin)</a>' : ''}
        <div class="aw-user-dropdown-divider"></div>
        <button id="btn-user-logout" style="color: #fca5a5;">🚪 Cerrar Sesión</button>
      `;

      userPill.onclick = (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      };

      document.addEventListener('click', () => {
        dropdown.classList.remove('active');
      });

      userContainer.appendChild(userPill);
      userContainer.appendChild(dropdown);
      headerIcons.appendChild(userContainer);

      // Eventos del dropdown
      setTimeout(() => {
        const btnOrders = dropdown.querySelector('#btn-user-my-orders');
        const btnLogout = dropdown.querySelector('#btn-user-logout');

        if (btnOrders) btnOrders.onclick = () => openPurchasesModal();
        if (btnLogout) {
          btnLogout.onclick = () => {
            TellusDB.session.logout();
            TellusToast.show('Has cerrado sesión correctamente.', 'info');
          };
        }
      }, 0);

    } else {
      const authBtn = document.createElement('button');
      authBtn.className = 'btn-header-auth';
      authBtn.innerHTML = '🔑 Ingresar / Registro';
      authBtn.onclick = () => openAuthModal();
      headerIcons.appendChild(authBtn);
    }
  }

  // ==========================================
  // MODAL DE AUTENTICACIÓN (LOGIN & REGISTRO)
  // ==========================================
  function createAuthModal() {
    if (document.getElementById('tellus-auth-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'tellus-auth-modal-overlay';
    overlay.className = 'tellus-modal-overlay';

    overlay.innerHTML = `
      <div class="tellus-modal" onclick="event.stopPropagation()">
        <div class="tellus-modal-header">
          <h2 id="auth-modal-title">🔐 Iniciar Sesión</h2>
          <button class="tellus-modal-close" id="btn-close-auth-modal">&times;</button>
        </div>
        <div class="tellus-modal-body">

          <!-- Selector de Pestañas -->
          <div class="tellus-tabs">
            <button class="tellus-tab-btn active" id="tab-login-btn">Iniciar Sesión</button>
            <button class="tellus-tab-btn" id="tab-register-btn">Registrarse</button>
          </div>

          <!-- FORMULARIO DE INICIO DE SESIÓN -->
          <form id="tellus-login-form">
            <div class="tellus-alert-box">
              <span>💡</span>
              <div>Podés usar <strong>admin@senteytellus.com</strong> con clave <strong>admin</strong> o registrar tu propia cuenta.</div>
            </div>

            <div class="tellus-form-group">
              <label for="login-email">Correo Electrónico:</label>
              <input type="email" id="login-email" class="tellus-input" placeholder="ejemplo@correo.com" required>
            </div>

            <div class="tellus-form-group">
              <label for="login-password">Contraseña:</label>
              <input type="password" id="login-password" class="tellus-input" placeholder="••••••••" required>
            </div>

            <button type="submit" class="tellus-btn-primary" style="margin-top: 10px;">
              🚀 Iniciar Sesión
            </button>
          </form>

          <!-- FORMULARIO DE REGISTRO (Se guarda en la Base de Datos) -->
          <form id="tellus-register-form" style="display: none;">
            <div class="tellus-alert-box no-card-alert">
              <span>🗄️</span>
              <div>Al registrarte, tus datos se guardarán en la tabla <strong>usuarios</strong> de la Base de Datos.</div>
            </div>

            <div class="tellus-form-group">
              <label for="reg-name">Nombre y Apellido:</label>
              <input type="text" id="reg-name" class="tellus-input" placeholder="Tu nombre real" required>
            </div>

            <div class="tellus-form-group">
              <label for="reg-mc-nickname">Nickname de Minecraft:</label>
              <input type="text" id="reg-mc-nickname" class="tellus-input" placeholder="Ej: Steve_Pro24" required>
              <div class="tellus-form-help">Tu nombre dentro del juego para entregarte los ítems de la tienda.</div>
            </div>

            <div class="tellus-form-group">
              <label for="reg-email">Correo Electrónico:</label>
              <input type="email" id="reg-email" class="tellus-input" placeholder="tu-email@gmail.com" required>
            </div>

            <div class="tellus-form-group">
              <label for="reg-password">Contraseña:</label>
              <input type="password" id="reg-password" class="tellus-input" placeholder="Mínimo 3 caracteres" required minlength="3">
            </div>

            <button type="submit" class="tellus-btn-primary" style="margin-top: 10px;">
              ✨ Crear Cuenta y Guardar en BD
            </button>
          </form>

        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    authModal = overlay;

    // Eventos del modal
    overlay.addEventListener('click', closeAuthModal);
    overlay.querySelector('#btn-close-auth-modal').addEventListener('click', closeAuthModal);

    const tabLogin = overlay.querySelector('#tab-login-btn');
    const tabRegister = overlay.querySelector('#tab-register-btn');
    const formLogin = overlay.querySelector('#tellus-login-form');
    const formRegister = overlay.querySelector('#tellus-register-form');
    const modalTitle = overlay.querySelector('#auth-modal-title');

    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.style.display = 'block';
      formRegister.style.display = 'none';
      modalTitle.innerHTML = '🔐 Iniciar Sesión';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formLogin.style.display = 'none';
      formRegister.style.display = 'block';
      modalTitle.innerHTML = '✨ Registrar Nueva Cuenta';
    });

    // Envío del Login
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = overlay.querySelector('#login-email').value;
      const pass = overlay.querySelector('#login-password').value;

      try {
        const user = TellusDB.users.authenticate(email, pass);
        TellusDB.session.setUser(user);
        TellusToast.show(`¡Bienvenido de nuevo, ${user.nombre.split(' ')[0]}!`, 'success');
        closeAuthModal();
        formLogin.reset();
      } catch (err) {
        TellusToast.show(err.message, 'error');
      }
    });

    // Envío del Registro
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = overlay.querySelector('#reg-name').value;
      const mcNick = overlay.querySelector('#reg-mc-nickname').value;
      const email = overlay.querySelector('#reg-email').value;
      const pass = overlay.querySelector('#reg-password').value;

      try {
        const newUser = TellusDB.users.create({
          nombre: name,
          mc_nickname: mcNick,
          email: email,
          password: pass
        });
        TellusDB.session.setUser(newUser);
        TellusToast.show(`¡Cuenta creada con éxito! Bienvenido, ${newUser.nombre}.`, 'success');
        closeAuthModal();
        formRegister.reset();
      } catch (err) {
        TellusToast.show(err.message, 'error');
      }
    });
  }

  function openAuthModal(defaultTab = 'login') {
    if (!authModal) createAuthModal();
    authModal.classList.add('active');
    if (defaultTab === 'register') {
      authModal.querySelector('#tab-register-btn').click();
    } else {
      authModal.querySelector('#tab-login-btn').click();
    }
  }

  function closeAuthModal() {
    if (authModal) {
      authModal.classList.remove('active');
    }
  }

  // ==========================================
  // MODAL DE HISTORIAL DE COMPRAS ("Mis Compras")
  // ==========================================
  function createPurchasesModal() {
    if (document.getElementById('tellus-purchases-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'tellus-purchases-modal-overlay';
    overlay.className = 'tellus-modal-overlay';

    overlay.innerHTML = `
      <div class="tellus-modal tellus-modal-wide" onclick="event.stopPropagation()">
        <div class="tellus-modal-header">
          <h2>📦 Mis Compras y Recibos Digitales</h2>
          <button class="tellus-modal-close" id="btn-close-purchases-modal">&times;</button>
        </div>
        <div class="tellus-modal-body" id="purchases-modal-content">
          <!-- Se llena dinámicamente -->
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    purchasesModal = overlay;

    overlay.addEventListener('click', closePurchasesModal);
    overlay.querySelector('#btn-close-purchases-modal').addEventListener('click', closePurchasesModal);
  }

  function openPurchasesModal() {
    if (!purchasesModal) createPurchasesModal();
    const user = TellusDB.session.getUser();
    const container = purchasesModal.querySelector('#purchases-modal-content');

    if (!user) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px;">
          <p style="margin-bottom: 20px;">Debes iniciar sesión para consultar tu historial de compras.</p>
          <button class="tellus-btn-primary" style="max-width: 200px; margin: 0 auto;" onclick="TellusAuth.openAuthModal('login')">Iniciar Sesión</button>
        </div>
      `;
    } else {
      const orders = TellusDB.orders.getByUserId(user.id);
      if (orders.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 3rem; margin-bottom: 10px;">🛒</div>
            <h3>Todavía no tenés compras registradas</h3>
            <p style="color: #94a3b8; margin: 10px 0 20px;">Explorá la tienda y adquirí rangos, llaves o cosméticos de forma simulada y sin tarjeta.</p>
            <a href="tienda.html" class="tellus-btn-primary" style="display: inline-block; max-width: 220px; text-decoration: none;">Ir a la Tienda</a>
          </div>
        `;
      } else {
        let html = `
          <div style="margin-bottom: 16px; color: #94a3b8; font-size: 0.9rem;">
            Historial de compras registradas para <strong>${user.nombre}</strong> (${orders.length} órdenes en BD):
          </div>
          <div class="db-table-responsive">
            <table class="tellus-db-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Nick Minecraft</th>
                  <th>Ítems</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
        `;

        orders.forEach(o => {
          const itemsSummary = o.items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');
          html += `
            <tr>
              <td><strong>#${o.codigo_recibo}</strong></td>
              <td>${o.fecha}</td>
              <td><span class="tellus-badge tellus-badge-primary">🎮 ${o.mc_nickname}</span></td>
              <td>${itemsSummary}</td>
              <td style="color: #a78bfa; font-weight: bold;">$${o.total.toFixed(2)}</td>
              <td><span class="tellus-badge tellus-badge-success">${o.estado}</span></td>
              <td>
                <button class="tellus-btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="TellusStore.showReceipt('${o.codigo_recibo}')">
                  🧾 Ver Recibo
                </button>
              </td>
            </tr>
          `;
        });

        html += `
              </tbody>
            </table>
          </div>
        `;
        container.innerHTML = html;
      }
    }

    purchasesModal.classList.add('active');
  }

  function closePurchasesModal() {
    if (purchasesModal) purchasesModal.classList.remove('active');
  }

  // Inicializar al cargar el documento
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    openAuthModal,
    closeAuthModal,
    openPurchasesModal,
    closePurchasesModal
  };
})();

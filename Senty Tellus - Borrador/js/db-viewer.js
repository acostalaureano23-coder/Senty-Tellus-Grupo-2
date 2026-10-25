/**
 * ============================================================
 * SENTEY TELLUS & ANGEL'S WANS — VISOR Y GESTOR DE BASE DE DATOS
 * ============================================================
 * Permite visualizar interactivamente las tablas:
 * - 'usuarios'
 * - 'compras'
 * - 'productos'
 *
 * Incluye:
 * - Contador de registros en tiempo real.
 * - Exportación de la base de datos a formato JSON.
 * - Eliminación de registros individuales.
 * - Opción de restaurar datos de muestra originales.
 * ============================================================
 */

const TellusDBViewer = (() => {
  let modal = null;
  let currentTab = 'usuarios';

  function init() {
    createViewerModal();
  }

  function createViewerModal() {
    if (document.getElementById('tellus-db-viewer-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'tellus-db-viewer-overlay';
    overlay.className = 'tellus-modal-overlay';

    overlay.innerHTML = `
      <div class="tellus-modal tellus-modal-wide" onclick="event.stopPropagation()">
        <div class="tellus-modal-header">
          <h2>🗄️ Visor y Gestor de Base de Datos</h2>
          <button class="tellus-modal-close" id="btn-close-db-viewer">&times;</button>
        </div>
        <div class="tellus-modal-body">

          <!-- Barra de Herramientas superior -->
          <div class="db-toolbar">
            <div class="tellus-tabs" style="margin-bottom: 0; flex: 1;">
              <button class="tellus-tab-btn active" id="db-tab-users-btn">👥 Usuarios</button>
              <button class="tellus-tab-btn" id="db-tab-orders-btn">🛒 Compras / Pedidos</button>
              <button class="tellus-tab-btn" id="db-tab-products-btn">📦 Productos</button>
            </div>

            <div class="db-actions-row">
              <button class="tellus-btn-secondary" id="btn-export-db" title="Descargar copia de la BD en JSON">
                📥 Exportar JSON
              </button>
              <button class="tellus-btn-secondary" id="btn-reset-db" style="color: #fca5a5;" title="Restaurar a datos de fábrica">
                🔄 Reiniciar BD
              </button>
            </div>
          </div>

          <!-- Estadísticas rápidas -->
          <div id="db-quick-stats" style="margin: 15px 0 10px; display: flex; gap: 10px; flex-wrap: wrap;"></div>

          <!-- Contenedor dinámico de tablas -->
          <div id="db-table-container"></div>

        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    modal = overlay;

    overlay.addEventListener('click', close);
    overlay.querySelector('#btn-close-db-viewer').addEventListener('click', close);

    const btnUsers = overlay.querySelector('#db-tab-users-btn');
    const btnOrders = overlay.querySelector('#db-tab-orders-btn');
    const btnProducts = overlay.querySelector('#db-tab-products-btn');

    btnUsers.onclick = () => switchTab('usuarios');
    btnOrders.onclick = () => switchTab('compras');
    btnProducts.onclick = () => switchTab('productos');

    overlay.querySelector('#btn-export-db').onclick = exportDB;
    overlay.querySelector('#btn-reset-db').onclick = resetDB;
  }

  function switchTab(tab) {
    currentTab = tab;
    const btnUsers = modal.querySelector('#db-tab-users-btn');
    const btnOrders = modal.querySelector('#db-tab-orders-btn');
    const btnProducts = modal.querySelector('#db-tab-products-btn');

    btnUsers.classList.toggle('active', tab === 'usuarios');
    btnOrders.classList.toggle('active', tab === 'compras');
    btnProducts.classList.toggle('active', tab === 'productos');

    render();
  }

  function render() {
    if (!modal) return;
    const statsContainer = modal.querySelector('#db-quick-stats');
    const tableContainer = modal.querySelector('#db-table-container');

    const users = TellusDB.users.getAll();
    const orders = TellusDB.orders.getAll();
    const products = TellusDB.products.getAll();

    statsContainer.innerHTML = `
      <div class="db-stat-pill">👥 <strong>${users.length}</strong> Usuarios</div>
      <div class="db-stat-pill">🛒 <strong>${orders.length}</strong> Compras Registradas</div>
      <div class="db-stat-pill">📦 <strong>${products.length}</strong> Productos en Catálogo</div>
      <div class="db-stat-pill" style="border-color: rgba(16, 185, 129, 0.4); color: #6ee7b7;">
        ⚡ Motor: <strong>TellusDB LocalStorage</strong>
      </div>
    `;

    if (currentTab === 'usuarios') {
      renderUsersTable(users, tableContainer);
    } else if (currentTab === 'compras') {
      renderOrdersTable(orders, tableContainer);
    } else {
      renderProductsTable(products, tableContainer);
    }
  }

  function renderUsersTable(users, container) {
    if (users.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: #94a3b8;">No hay usuarios registrados.</p>';
      return;
    }

    let html = `
      <div class="db-table-responsive">
        <table class="tellus-db-table">
          <thead>
            <tr>
              <th>ID (PK)</th>
              <th>Nombre</th>
              <th>Nick Minecraft</th>
              <th>Email</th>
              <th>Contraseña</th>
              <th>Rol</th>
              <th>Fecha Registro</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
    `;

    users.forEach(u => {
      html += `
        <tr>
          <td><strong style="color: #a78bfa;">#${u.id}</strong></td>
          <td>${u.nombre}</td>
          <td><span class="tellus-badge tellus-badge-primary">🎮 ${u.mc_nickname}</span></td>
          <td>${u.email}</td>
          <td style="font-family: monospace; color: #94a3b8;">••••••••</td>
          <td><span class="tellus-badge ${u.rol === 'admin' ? 'tellus-badge-warning' : 'tellus-badge-success'}">${u.rol}</span></td>
          <td style="font-size: 0.8rem; color: #94a3b8;">${u.fecha_registro}</td>
          <td>
            <button class="btn-table-action" onclick="TellusDBViewer.deleteUser(${u.id})">Eliminar</button>
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

  function renderOrdersTable(orders, container) {
    if (orders.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: #94a3b8;">No hay compras registradas todavía.</p>';
      return;
    }

    let html = `
      <div class="db-table-responsive">
        <table class="tellus-db-table">
          <thead>
            <tr>
              <th>ID (PK)</th>
              <th>Código Recibo</th>
              <th>Nick Minecraft</th>
              <th>Modalidad</th>
              <th>Ítems Comprados</th>
              <th>Total</th>
              <th>Método</th>
              <th>Fecha</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
    `;

    orders.forEach(o => {
      const itemsList = o.items.map(i => `${i.cantidad}x ${i.nombre}`).join('<br>');
      html += `
        <tr>
          <td><strong style="color: #a78bfa;">#${o.id}</strong></td>
          <td><strong>#${o.codigo_recibo}</strong></td>
          <td><span class="tellus-badge tellus-badge-primary">🎮 ${o.mc_nickname}</span></td>
          <td>${o.modalidad}</td>
          <td style="font-size: 0.8rem;">${itemsList}</td>
          <td style="color: #a78bfa; font-weight: bold;">$${o.total.toFixed(2)}</td>
          <td><span class="tellus-badge tellus-badge-success" style="font-size: 0.7rem;">Sin Tarjeta</span></td>
          <td style="font-size: 0.78rem; color: #94a3b8;">${o.fecha}</td>
          <td style="display: flex; gap: 4px; padding-top: 14px;">
            <button class="tellus-btn-secondary" style="padding: 3px 8px; font-size: 0.75rem;" onclick="TellusStore.showReceipt('${o.codigo_recibo}')">🧾 Recibo</button>
            <button class="btn-table-action" onclick="TellusDBViewer.deleteOrder(${o.id})">❌</button>
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

  function renderProductsTable(products, container) {
    let html = `
      <div class="db-table-responsive">
        <table class="tellus-db-table">
          <thead>
            <tr>
              <th>ID (PK)</th>
              <th>Ícono</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio ($)</th>
              <th>Descripción</th>
              <th>Destacado</th>
            </tr>
          </thead>
          <tbody>
    `;

    products.forEach(p => {
      html += `
        <tr>
          <td><strong style="color: #a78bfa;">#${p.id}</strong></td>
          <td style="font-size: 1.3rem;">${p.icono || '📦'}</td>
          <td><strong>${p.nombre}</strong></td>
          <td><span class="tellus-badge tellus-badge-primary">${p.categoria}</span></td>
          <td style="color: #a78bfa; font-weight: bold;">$${p.precio.toFixed(2)}</td>
          <td style="font-size: 0.8rem; color: #94a3b8; max-width: 250px;">${p.descripcion}</td>
          <td>${p.destacado ? '⭐ Sí' : 'No'}</td>
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

  function deleteUser(id) {
    if (confirm(`¿Estás seguro de que querés eliminar el usuario #${id}?`)) {
      TellusDB.users.delete(id);
      TellusToast.show(`Usuario #${id} eliminado de la base de datos.`, 'info');
      render();
    }
  }

  function deleteOrder(id) {
    if (confirm(`¿Estás seguro de que querés eliminar la compra #${id}?`)) {
      TellusDB.orders.delete(id);
      TellusToast.show(`Orden #${id} eliminada de la base de datos.`, 'info');
      render();
    }
  }

  function exportDB() {
    const data = TellusDB.exportDatabase();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tellus_database_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    TellusToast.show('Copia de la base de datos descargada como JSON.', 'success');
  }

  function resetDB() {
    if (confirm('¿Restaurar la base de datos a sus valores iniciales? Se repondrán los usuarios y compras de muestra.')) {
      TellusDB.resetToDefaults();
      TellusToast.show('Base de datos restaurada correctamente.', 'success');
      render();
    }
  }

  function open(defaultTab = 'usuarios') {
    if (!modal) createViewerModal();
    switchTab(defaultTab);
    modal.classList.add('active');
  }

  function close() {
    if (modal) modal.classList.remove('active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    open,
    close,
    deleteUser,
    deleteOrder
  };
})();

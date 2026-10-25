/**
 * ============================================================
 * SENTEY TELLUS & ANGEL'S WANS — LÓGICA DE TIENDA Y CHECKOUT
 * ============================================================
 * Controla:
 * - Renderizado dinámico del catálogo según categoría.
 * - Carrito de compras reactivo (agregar, cantidades, eliminar, total).
 * - Modal de Checkout Simulado (Sin Tarjeta de Crédito, con Nick de Minecraft).
 * - Generación de Comprobante / Recibo Digital Oficial Gamer.
 * - Guardado automático de la orden en la tabla 'compras' de TellusDB.
 * ============================================================
 */

const TellusStore = (() => {
  // Estado local del carrito
  let cart = []; // [{id, nombre, precio, cantidad, icono}]
  let currentCategory = 'destacados';

  // Referencias a modales
  let checkoutModal = null;
  let receiptModal = null;

  function init() {
    loadCartFromStorage();
    setupCategoryListeners();
    renderProducts();
    renderCart();
    createCheckoutModal();
    createReceiptModal();

    // Actualizar campos al iniciar o cambiar sesión
    window.addEventListener('tellus:auth-change', () => {
      prefillCheckoutNickname();
    });
  }

  // ==========================================
  // PERSISTENCIA DEL CARRITO
  // ==========================================
  function saveCartToStorage() {
    try {
      localStorage.setItem('tellus_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }

  function loadCartFromStorage() {
    try {
      const saved = localStorage.getItem('tellus_cart');
      if (saved) cart = JSON.parse(saved);
    } catch (e) {
      cart = [];
    }
  }

  // ==========================================
  // FILTRADO POR CATEGORÍAS
  // ==========================================
  function setupCategoryListeners() {
    const categoryLinks = document.querySelectorAll('.aw-sidebar-menu a');
    categoryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        categoryLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const text = link.textContent.trim().toLowerCase();
        if (text.includes('destacados')) currentCategory = 'destacados';
        else if (text.includes('globales')) currentCategory = 'rangos-globales';
        else if (text.includes('survival')) currentCategory = 'rangos-survival';
        else if (text.includes('llaves')) currentCategory = 'llaves';
        else if (text.includes('cosméticos') || text.includes('cosmeticos')) currentCategory = 'cosmeticos';
        else if (text.includes('monedas')) currentCategory = 'monedas';
        else currentCategory = 'todos';

        renderProducts();
      });
    });
  }

  // ==========================================
  // RENDERIZADO DE PRODUCTOS
  // ==========================================
  function renderProducts() {
    const gridContainer = document.querySelector('.aw-products-grid');
    if (!gridContainer) return; // Si no estamos en tienda.html

    const products = TellusDB.products.getByCategory(currentCategory);
    gridContainer.innerHTML = '';

    if (products.length === 0) {
      gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">No hay productos en esta categoría.</p>';
      return;
    }

    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'aw-product-card';
      card.innerHTML = `
        <div class="product-image" style="display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
          <div style="font-size: 3rem; margin-bottom: 5px;">${p.icono || '💎'}</div>
          ${p.destacado ? '<span class="tellus-badge tellus-badge-primary" style="position: absolute; top: 8px; right: 8px; font-size: 0.65rem;">Destacado</span>' : ''}
        </div>
        <div class="product-info">
          <h4>${p.nombre}</h4>
          <p style="font-size: 0.78rem; color: #94a3b8; margin-bottom: 10px; height: 38px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
            ${p.descripcion}
          </p>
          <p class="price">$${p.precio.toFixed(2)}</p>
          <button class="btn-buy" onclick="TellusStore.addToCart(${p.id})">Añadir al Carrito</button>
        </div>
      `;
      gridContainer.appendChild(card);
    });

    // Actualizar también el botón del producto destacado inferior si existe
    const featuredBuyBtn = document.querySelector('.aw-card-vertical .btn-buy');
    if (featuredBuyBtn) {
      featuredBuyBtn.onclick = () => {
        addToCart(12); // ID de Caja Misteriosa Épica
      };
    }
  }

  // ==========================================
  // GESTIÓN DEL CARRITO
  // ==========================================
  function addToCart(productId) {
    const product = TellusDB.products.getById(productId);
    if (!product) return;

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.cantidad += 1;
    } else {
      cart.push({
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        icono: product.icono || '📦',
        cantidad: 1
      });
    }

    saveCartToStorage();
    renderCart();
    TellusToast.show(`¡"${product.nombre}" añadido al carrito!`, 'success');
  }

  function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.cantidad += delta;
    if (item.cantidad <= 0) {
      cart = cart.filter(i => i.id !== productId);
    }

    saveCartToStorage();
    renderCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCartToStorage();
    renderCart();
    TellusToast.show('Producto eliminado del carrito.', 'info');
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  function getCartItemCount() {
    return cart.reduce((sum, item) => sum + item.cantidad, 0);
  }

  function renderCart() {
    // 1. Contador en Header (icono carrito)
    const headerCartIcon = document.querySelector('.icon-cart');
    if (headerCartIcon) {
      const count = getCartItemCount();
      let badge = headerCartIcon.querySelector('.cart-badge');
      if (count > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'cart-badge';
          headerCartIcon.appendChild(badge);
        }
        badge.textContent = count;
      } else if (badge) {
        badge.remove();
      }
    }

    // 2. Sidebar de la tienda
    const sidebarTop = document.querySelector('.aw-sidebar-top');
    if (!sidebarTop) return;

    const totalCount = getCartItemCount();
    const totalMoney = getCartTotal();

    // Actualizar texto y lista dentro de sidebar
    let listContainer = sidebarTop.querySelector('.cart-items-container');
    if (!listContainer) {
      listContainer = document.createElement('div');
      listContainer.className = 'cart-items-container';
      sidebarTop.insertBefore(listContainer, sidebarTop.querySelector('.btn-checkout'));
    }

    // Texto de cantidad
    const countP = sidebarTop.querySelector('p');
    if (countP) {
      countP.innerHTML = `<strong>${totalCount}</strong> artículos &bull; Total: <span style="color: #a78bfa; font-weight: bold;">$${totalMoney.toFixed(2)}</span>`;
    }

    // Lista de ítems
    if (cart.length === 0) {
      listContainer.innerHTML = '<p style="color: #64748b; font-size: 0.8rem; text-align: center; margin: 10px 0;">Carrito vacío</p>';
    } else {
      listContainer.innerHTML = '';
      cart.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item-card';
        itemRow.innerHTML = `
          <div class="cart-item-info">
            <h5>${item.nombre}</h5>
            <p>$${(item.precio * item.cantidad).toFixed(2)} ($${item.precio.toFixed(2)} c/u)</p>
          </div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn" onclick="TellusStore.updateQuantity(${item.id}, -1)">-</button>
            <span style="font-size: 0.85rem; font-weight: bold; min-width: 16px; text-align: center;">${item.cantidad}</span>
            <button class="cart-qty-btn" onclick="TellusStore.updateQuantity(${item.id}, 1)">+</button>
            <button class="cart-remove-btn" onclick="TellusStore.removeFromCart(${item.id})" title="Eliminar">🗑️</button>
          </div>
        `;
        listContainer.appendChild(itemRow);
      });
    }

    // Botón de checkout
    const checkoutBtn = sidebarTop.querySelector('.btn-checkout');
    if (checkoutBtn) {
      checkoutBtn.onclick = (e) => {
        e.preventDefault();
        openCheckout();
      };
    }
  }

  // ==========================================
  // MODAL DE CHECKOUT SIMULADO (SIN TARJETA)
  // ==========================================
  function createCheckoutModal() {
    if (document.getElementById('tellus-checkout-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'tellus-checkout-modal-overlay';
    overlay.className = 'tellus-modal-overlay';

    overlay.innerHTML = `
      <div class="tellus-modal" onclick="event.stopPropagation()">
        <div class="tellus-modal-header">
          <h2>🛒 Finalizar Compra Simulación</h2>
          <button class="tellus-modal-close" id="btn-close-checkout-modal">&times;</button>
        </div>
        <div class="tellus-modal-body">

          <!-- Aviso de simulación sin tarjeta -->
          <div class="tellus-alert-box no-card-alert">
            <span style="font-size: 1.4rem;">🎮</span>
            <div>
              <strong>¡Compra Ficticia para Servidor de Minecraft!</strong><br>
              No se requiere tarjeta de crédito ni dinero real. Al confirmar, tu orden se guardará automáticamente en la tabla <strong>compras</strong> de la base de datos.
            </div>
          </div>

          <!-- Resumen de productos en el carrito -->
          <label style="font-size: 0.85rem; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 8px;">
            Resumen de tu pedido:
          </label>
          <div class="checkout-items-list" id="checkout-items-summary"></div>

          <div class="checkout-total-summary">
            <span>Total Ficticio:</span>
            <span id="checkout-total-display">$0.00</span>
          </div>

          <!-- Formulario de entrega -->
          <form id="tellus-checkout-form" style="margin-top: 15px;">
            <div class="tellus-form-group">
              <label for="checkout-mc-nickname">👤 Nickname de Minecraft (Para recibir los ítems):</label>
              <input type="text" id="checkout-mc-nickname" class="tellus-input" placeholder="Ej: Steve_2026" required>
              <div class="tellus-form-help">Ingresá tu nombre de usuario exacto del juego.</div>
            </div>

            <div class="tellus-form-group">
              <label for="checkout-modalidad">Modalidad del Servidor:</label>
              <select id="checkout-modalidad" class="tellus-input">
                <option value="Survival 1.20">Survival 1.20 (Recomendado)</option>
                <option value="Minijuegos BedWars/SkyWars">Minijuegos (BedWars / SkyWars)</option>
                <option value="Global (Todos los servidores)">Global (Todos los modos)</option>
              </select>
            </div>

            <div style="margin: 15px 0 20px; display: flex; align-items: center; gap: 10px;">
              <input type="checkbox" id="checkout-agree" checked required style="accent-color: #8b5cf6; width: 18px; height: 18px;">
              <label for="checkout-agree" style="font-size: 0.82rem; color: #94a3b8; cursor: pointer;">
                Entiendo que es una simulación de compra con entrega digital directa.
              </label>
            </div>

            <button type="submit" class="tellus-btn-primary" style="font-size: 1.05rem;">
              🚀 Confirmar Compra y Generar Recibo
            </button>
          </form>

        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    checkoutModal = overlay;

    overlay.addEventListener('click', closeCheckout);
    overlay.querySelector('#btn-close-checkout-modal').addEventListener('click', closeCheckout);

    // Evento de confirmación de compra
    overlay.querySelector('#tellus-checkout-form').addEventListener('submit', handleCheckoutSubmit);
  }

  function prefillCheckoutNickname() {
    if (!checkoutModal) return;
    const user = TellusDB.session.getUser();
    const nickInput = checkoutModal.querySelector('#checkout-mc-nickname');
    if (user && nickInput && !nickInput.value) {
      nickInput.value = user.mc_nickname || user.nombre;
    }
  }

  function openCheckout() {
    if (cart.length === 0) {
      TellusToast.show('Tu carrito está vacío. ¡Añadí algún producto primero!', 'warning');
      return;
    }

    if (!checkoutModal) createCheckoutModal();

    const summaryContainer = checkoutModal.querySelector('#checkout-items-summary');
    const totalDisplay = checkoutModal.querySelector('#checkout-total-display');

    summaryContainer.innerHTML = '';
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'checkout-item-row';
      row.innerHTML = `
        <div>
          <strong>${item.nombre}</strong> &times; ${item.cantidad}
        </div>
        <div style="color: #a78bfa; font-weight: 600;">
          $${(item.precio * item.cantidad).toFixed(2)}
        </div>
      `;
      summaryContainer.appendChild(row);
    });

    totalDisplay.textContent = `$${getCartTotal().toFixed(2)}`;
    prefillCheckoutNickname();
    checkoutModal.classList.add('active');
  }

  function closeCheckout() {
    if (checkoutModal) checkoutModal.classList.remove('active');
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();

    const nickInput = checkoutModal.querySelector('#checkout-mc-nickname');
    const modSelect = checkoutModal.querySelector('#checkout-modalidad');
    const mcNickname = nickInput.value.trim();
    const modalidad = modSelect.value;

    if (!mcNickname) {
      TellusToast.show('Por favor ingresá tu Nickname de Minecraft.', 'error');
      return;
    }

    const currentUser = TellusDB.session.getUser();

    // Guardar en la tabla 'compras' de TellusDB
    const orderData = {
      usuario_id: currentUser ? currentUser.id : null,
      usuario_nombre: currentUser ? currentUser.nombre : 'Jugador Invitado',
      mc_nickname: mcNickname,
      modalidad: modalidad,
      items: [...cart],
      total: getCartTotal()
    };

    const newOrder = TellusDB.orders.create(orderData);

    // Vaciar carrito
    cart = [];
    saveCartToStorage();
    renderCart();

    closeCheckout();
    TellusToast.show('¡Compra simulada con éxito! Guardada en Base de Datos.', 'success');

    // Mostrar Recibo Digital Oficial
    showReceipt(newOrder.codigo_recibo);
  }

  // ==========================================
  // MODAL DE RECIBO DIGITAL OFICIAL (TICKET GAMER)
  // ==========================================
  function createReceiptModal() {
    if (document.getElementById('tellus-receipt-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'tellus-receipt-modal-overlay';
    overlay.className = 'tellus-modal-overlay';

    overlay.innerHTML = `
      <div class="tellus-modal" style="max-width: 580px;" onclick="event.stopPropagation()">
        <div class="tellus-modal-header">
          <h2>🧾 Comprobante Oficial de Compra</h2>
          <button class="tellus-modal-close" id="btn-close-receipt-modal">&times;</button>
        </div>
        <div class="tellus-modal-body" id="receipt-modal-content">
          <!-- Se inyecta dinámicamente -->
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    receiptModal = overlay;

    overlay.addEventListener('click', closeReceipt);
    overlay.querySelector('#btn-close-receipt-modal').addEventListener('click', closeReceipt);
  }

  function showReceipt(orderReceiptCode) {
    if (!receiptModal) createReceiptModal();

    const order = TellusDB.orders.getByReceipt(orderReceiptCode);
    if (!order) {
      TellusToast.show('No se encontró el recibo especificado.', 'error');
      return;
    }

    const container = receiptModal.querySelector('#receipt-modal-content');

    let itemsTableRows = '';
    order.items.forEach(item => {
      itemsTableRows += `
        <tr>
          <td>${item.cantidad}x ${item.nombre}</td>
          <td>$${item.precio.toFixed(2)}</td>
          <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="digital-receipt-wrapper">
        <div class="receipt-header">
          <div class="receipt-logo">SENTEY <span>TELLUS</span></div>
          <p>Angel's Wans Minecraft Server &bull; mc.angelswans.com</p>
          <div style="margin-top: 8px;">
            <span class="tellus-badge tellus-badge-success">✅ Entrega Acreditada</span>
          </div>
        </div>

        <div class="receipt-meta-grid">
          <div>
            <span>N° de Comprobante:</span>
            <span>#${order.codigo_recibo}</span>
          </div>
          <div>
            <span>Fecha y Hora:</span>
            <span>${order.fecha}</span>
          </div>
          <div>
            <span>Jugador (Nick MC):</span>
            <span style="color: #a78bfa;">${order.mc_nickname}</span>
          </div>
          <div>
            <span>Modalidad Destino:</span>
            <span>${order.modalidad}</span>
          </div>
          <div>
            <span>Método de Pago:</span>
            <span>Simulado (Sin Tarjeta)</span>
          </div>
          <div>
            <span>Registrado en BD:</span>
            <span>Tabla 'compras'</span>
          </div>
        </div>

        <table class="receipt-table">
          <thead>
            <tr>
              <th>Ítem Adquirido</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
          </tbody>
        </table>

        <div class="receipt-total-row">
          <span>TOTAL PAGADO:</span>
          <span style="color: #a78bfa;">$${order.total.toFixed(2)}</span>
        </div>

        <div class="receipt-instructions">
          🎮 <strong>¿Cómo reclamar tus ítems en el juego?</strong><br>
          Entrá al servidor de Minecraft con la IP: <strong>mc.angelswans.com</strong> usando tu Nick <strong>${order.mc_nickname}</strong>.
          Tus ventajas se aplicarán automáticamente o podés escribir <code>/claim</code>.
        </div>

        <div class="receipt-barcode">
          |||||| | |||||||| |||| | |||||||||||| ||||
          <div style="font-size: 0.75rem; letter-spacing: 1px; color: #94a3b8; margin-top: 4px;">
            AUTENTICACIÓN DIGITAL: ${order.codigo_recibo}
          </div>
        </div>
      </div>

      <div class="receipt-buttons-row" style="display: flex; gap: 12px; margin-top: 20px;">
        <button class="tellus-btn-primary" style="flex: 1;" onclick="window.print()">
          🖨️ Imprimir / Guardar PDF
        </button>
        <button class="tellus-btn-secondary" style="flex: 1;" onclick="TellusStore.closeReceipt()">
          Listo, Cerrar
        </button>
      </div>
    `;

    receiptModal.classList.add('active');
  }

  function closeReceipt() {
    if (receiptModal) receiptModal.classList.remove('active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    addToCart,
    updateQuantity,
    removeFromCart,
    openCheckout,
    closeCheckout,
    showReceipt,
    closeReceipt
  };
})();

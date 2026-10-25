/**
 * ============================================================
 * SENTEY TELLUS & ANGEL'S WANS — MOTOR DE BASE DE DATOS (TellusDB)
 * ============================================================
 * Sistema de base de datos relacional y documental basado en
 * localStorage del navegador.
 *
 * Características:
 * - 100% Gratuito y sin necesidad de instalar servidores externos.
 * - Tablas estructuradas: 'usuarios', 'compras' y 'productos'.
 * - Persistencia automática en el navegador.
 * - Soporte para CRUD, claves primarias numéricas y consultas.
 * - Sesión activa persistente.
 * ============================================================
 */

const TellusDB = (() => {
  const STORAGE_KEYS = {
    USERS: 'tellus_db_usuarios',
    ORDERS: 'tellus_db_compras',
    PRODUCTS: 'tellus_db_productos',
    SESSION: 'tellus_db_sesion_activa'
  };

  // Datos iniciales de productos (Catálogo de la Tienda de Angel's Wans)
  const SEED_PRODUCTS = [
    {
      id: 1,
      nombre: 'Rango VIP',
      categoria: 'rangos-globales',
      precio: 5.00,
      descripcion: 'Acceso a /fly en el lobby, prefijo [VIP] en el chat, 2 parcelas y kit VIP semanal.',
      icono: '⭐',
      destacado: true,
      imagen: 'img/Fondop.png'
    },
    {
      id: 2,
      nombre: 'Rango MVP',
      categoria: 'rangos-globales',
      precio: 10.00,
      descripcion: 'Todos los beneficios VIP + entrada prioritaria, kit MVP, comandos especiales y 4 parcelas.',
      icono: '👑',
      destacado: true,
      imagen: 'img/Fondop.png'
    },
    {
      id: 3,
      nombre: 'Rango Elite',
      categoria: 'rangos-globales',
      precio: 15.00,
      descripcion: 'El rango supremo. Color dorado exclusivo en chat, kits élite infinitos y multiplicador x2 de monedas.',
      icono: '🔥',
      destacado: true,
      imagen: 'img/Fondop.png'
    },
    {
      id: 4,
      nombre: 'Kit Guerrero Legendario',
      categoria: 'rangos-survival',
      precio: 7.50,
      descripcion: 'Armadura completa de Netherite con protección IV y espada con Filo V + 32 manzanas doradas.',
      icono: '⚔️',
      destacado: false,
      imagen: 'img/Fondop.png'
    },
    {
      id: 5,
      nombre: 'Pase de Batalla Survival',
      categoria: 'rangos-survival',
      precio: 8.00,
      descripcion: 'Desbloquea más de 50 niveles de recompensas exclusivas, títulos y cosméticos de temporada.',
      icono: '📜',
      destacado: false,
      imagen: 'img/Fondop.png'
    },
    {
      id: 6,
      nombre: 'Pack 5x Llaves Místicas',
      categoria: 'llaves',
      precio: 3.50,
      descripcion: 'Abre cajas de recompensas en el spawn con probabilidad de ítems legendarios y encantamientos únicos.',
      icono: '🗝️',
      destacado: false,
      imagen: 'img/Fondop.png'
    },
    {
      id: 7,
      nombre: 'Pack 10x Llaves Cósmicas',
      categoria: 'llaves',
      precio: 6.00,
      descripcion: 'Llaves de nivel superior con premios asegurados de alto valor y cosméticos permanentes.',
      icono: '🗝️✨',
      destacado: false,
      imagen: 'img/Fondop.png'
    },
    {
      id: 8,
      nombre: 'Alas Cósmicas de Fuego',
      categoria: 'cosmeticos',
      precio: 4.00,
      descripcion: 'Partículas de fuego en forma de alas que te siguen en todos los modos de juego.',
      icono: '🪽',
      destacado: false,
      imagen: 'img/Fondop.png'
    },
    {
      id: 9,
      nombre: 'Aura Divina Purpúrea',
      categoria: 'cosmeticos',
      precio: 4.50,
      descripcion: 'Efecto de luces y estrellas moradas alrededor de tu personaje.',
      icono: '✨',
      destacado: false,
      imagen: 'img/Fondop.png'
    },
    {
      id: 10,
      nombre: 'Bolsa de 1,000 Monedas',
      categoria: 'monedas',
      precio: 2.50,
      descripcion: 'Monedas para la economía interna del servidor. Canjeables en tiendas de aldeanos y subastas.',
      icono: '🪙',
      destacado: false,
      imagen: 'img/Fondop.png'
    },
    {
      id: 11,
      nombre: 'Cofre de 5,000 Monedas',
      categoria: 'monedas',
      precio: 9.99,
      descripcion: '¡La mejor oferta de monedas! Te otorga 5,000 monedas + 500 de regalo para el servidor.',
      icono: '💰',
      destacado: false,
      imagen: 'img/Fondop.png'
    },
    {
      id: 12,
      nombre: 'Caja Misteriosa Épica',
      categoria: 'destacados',
      precio: 2.99,
      descripcion: 'Contiene cosméticos únicos, llaves especiales y una pequeña probabilidad de obtener un rango superior permanente.',
      icono: '🎁',
      destacado: true,
      imagen: 'img/Fondop.png'
    }
  ];

  // Usuarios iniciales para pruebas
  const SEED_USERS = [
    {
      id: 1,
      nombre: 'Admin Sentey',
      email: 'admin@senteytellus.com',
      password: 'admin',
      mc_nickname: 'TellusAdmin',
      fecha_registro: '2026-10-20 10:30',
      rol: 'admin'
    },
    {
      id: 2,
      nombre: 'Laureano Gamer',
      email: 'laureano@example.com',
      password: '123',
      mc_nickname: 'LaureGamer_MC',
      fecha_registro: '2026-10-22 15:45',
      rol: 'usuario'
    }
  ];

  // Compras de prueba iniciales
  const SEED_ORDERS = [
    {
      id: 1,
      codigo_recibo: 'AW-2026-1001',
      usuario_id: 2,
      usuario_nombre: 'Laureano Gamer',
      mc_nickname: 'LaureGamer_MC',
      modalidad: 'Survival 1.20',
      items: [
        { id: 1, nombre: 'Rango VIP', cantidad: 1, precio: 5.00 },
        { id: 6, nombre: 'Pack 5x Llaves Místicas', cantidad: 1, precio: 3.50 }
      ],
      subtotal: 8.50,
      total: 8.50,
      metodo_pago: 'Simulado (Ficticio - Sin Tarjeta)',
      fecha: '2026-10-23 18:20',
      estado: 'Completado y Acreditado'
    }
  ];

  // Inicializar almacenamiento si no existe
  function init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    }
  }

  // Funciones genéricas de persistencia
  function getTable(key) {
    init();
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al leer de la base de datos:', e);
      return [];
    }
  }

  function saveTable(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ==========================================
  // TABLA: USUARIOS
  // ==========================================
  const users = {
    getAll() {
      return getTable(STORAGE_KEYS.USERS);
    },
    getById(id) {
      return this.getAll().find(u => u.id === Number(id));
    },
    getByEmail(email) {
      if (!email) return null;
      return this.getAll().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    },
    create(userData) {
      const list = this.getAll();
      const existing = this.getByEmail(userData.email);
      if (existing) {
        throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
      }

      const nextId = list.length > 0 ? Math.max(...list.map(u => u.id || 0)) + 1 : 1;
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newUser = {
        id: nextId,
        nombre: userData.nombre.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        mc_nickname: (userData.mc_nickname || userData.nombre).trim(),
        fecha_registro: formattedDate,
        rol: 'usuario'
      };

      list.push(newUser);
      saveTable(STORAGE_KEYS.USERS, list);
      return newUser;
    },
    authenticate(email, password) {
      const user = this.getByEmail(email);
      if (!user) {
        throw new Error('No existe ninguna cuenta con ese correo electrónico.');
      }
      if (user.password !== password) {
        throw new Error('Contraseña incorrecta. Por favor verificá tus datos.');
      }
      return user;
    },
    delete(id) {
      let list = this.getAll();
      list = list.filter(u => u.id !== Number(id));
      saveTable(STORAGE_KEYS.USERS, list);
    }
  };

  // ==========================================
  // TABLA: PRODUCTOS
  // ==========================================
  const products = {
    getAll() {
      return getTable(STORAGE_KEYS.PRODUCTS);
    },
    getById(id) {
      return this.getAll().find(p => p.id === Number(id));
    },
    getByCategory(category) {
      const all = this.getAll();
      if (!category || category === 'destacados' || category === 'todos') {
        return all;
      }
      return all.filter(p => p.categoria === category);
    }
  };

  // ==========================================
  // TABLA: COMPRAS / PEDIDOS
  // ==========================================
  const orders = {
    getAll() {
      return getTable(STORAGE_KEYS.ORDERS);
    },
    getById(id) {
      return this.getAll().find(o => o.id === Number(id));
    },
    getByReceipt(code) {
      return this.getAll().find(o => o.codigo_recibo === code);
    },
    getByUserId(userId) {
      return this.getAll().filter(o => o.usuario_id === Number(userId));
    },
    create(orderData) {
      const list = this.getAll();
      const nextId = list.length > 0 ? Math.max(...list.map(o => o.id || 0)) + 1 : 1;

      // Generar código de recibo único: AW-AÑO-RANDOM
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const code = `AW-${new Date().getFullYear()}-${randomSuffix}`;

      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newOrder = {
        id: nextId,
        codigo_recibo: code,
        usuario_id: orderData.usuario_id || null,
        usuario_nombre: orderData.usuario_nombre || 'Invitado',
        mc_nickname: orderData.mc_nickname.trim(),
        modalidad: orderData.modalidad || 'Global / Survival',
        items: orderData.items, // Array [{id, nombre, cantidad, precio}]
        subtotal: Number(orderData.total.toFixed(2)),
        total: Number(orderData.total.toFixed(2)),
        metodo_pago: 'Simulado (Ficticio - Sin Tarjeta)',
        fecha: formattedDate,
        estado: 'Completado y Acreditado'
      };

      list.unshift(newOrder); // Las compras más recientes al principio
      saveTable(STORAGE_KEYS.ORDERS, list);
      return newOrder;
    },
    delete(id) {
      let list = this.getAll();
      list = list.filter(o => o.id !== Number(id));
      saveTable(STORAGE_KEYS.ORDERS, list);
    }
  };

  // ==========================================
  // SESIÓN ACTIVA (Control de Login)
  // ==========================================
  const session = {
    getUser() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    setUser(user) {
      if (!user) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      } else {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      }
      // Emitir evento para actualizar toda la UI
      window.dispatchEvent(new CustomEvent('tellus:auth-change', { detail: user }));
    },
    logout() {
      this.setUser(null);
    }
  };

  // ==========================================
  // UTILIDADES GENERALES DE LA BASE DE DATOS
  // ==========================================
  function exportDatabase() {
    return {
      version: '1.0',
      fecha_exportacion: new Date().toISOString(),
      usuarios: users.getAll(),
      compras: orders.getAll(),
      productos: products.getAll()
    };
  }

  function resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    session.logout();
    window.dispatchEvent(new CustomEvent('tellus:db-reset'));
  }

  // Inicializar al cargar el script
  init();

  return {
    users,
    products,
    orders,
    session,
    exportDatabase,
    resetToDefaults
  };
})();

# 📝 Registro de Cambios — Sentey Tellus & Angel's Wans

Este documento detalla todas las modificaciones, archivos creados y nuevas funciones agregadas al proyecto web para cumplir con los requerimientos solicitados: **Base de Datos local y gratuita**, **Registro e Inicio de Sesión de Usuarios vinculado a Minecraft**, **Carrito Interactivo** y **Sistema de Compra Ficticia (sin tarjeta de crédito)** con generación de comprobantes digitales.

---

## 🚀 Resumen de Nuevas Funciones

1. **Base de Datos 100% Gratuita y sin Servidores (`TellusDB`):**
   - Funciona directo en el navegador utilizando `localStorage`.
   - No requiere instalar MySQL, XAMPP, Node.js ni configurar hosting pago.
   - Guarda y persiste los datos de **usuarios**, **compras realizadas** y **catálogo de productos**.

2. **Panel de Base de Datos Privado (`admin-db.html`):**
   - Página exclusiva y oculta del público general para administrar la base de datos.
   - Solo se accede abriendo directamente el archivo `admin-db.html` desde tu carpeta (o ingresando como administrador). No está visible en el menú principal para que los usuarios comunes no puedan ver los datos ni las compras.
   - Permite consultar las tablas `usuarios`, `compras` y `productos`, buscar registros, ver el archivo JSON crudo, eliminar filas o **descargar una copia de respaldo en `.json`**.

3. **Sistema de Usuarios y Autenticación:**
   - Botón en la cabecera: **`🔑 Ingresar / Registro`**.
   - Pestaña de **Registro**: pide Nombre, Email, Nickname de Minecraft y Contraseña. Se guarda de inmediato en la tabla `usuarios` de la BD.
   - Pestaña de **Inicio de Sesión**: valida credenciales y mantiene la sesión activa.
   - Al estar conectado, muestra tu avatar con menú desplegable: **`📦 Mis Compras`** y **`🚪 Cerrar Sesión`** (si sos admin, también muestra el enlace al panel privado).

4. **Tienda y Carrito Interactivo:**
   - Catálogo dinámico con filtros por categoría: *🔥 Destacados, 👑 Rangos Globales, ⚔️ Rangos Survival, 🗝️ Llaves, 💎 Cosméticos y 🪙 Monedas*.
   - Carrito en la barra lateral con botones para sumar `+`, restar `-`, eliminar y cálculo del total en tiempo real.

5. **Checkout Simulado (Sin Tarjetas de Crédito):**
   - Diseñado específicamente para un servidor de Minecraft: los productos son virtuales.
   - No solicita tarjeta de crédito, débito ni datos bancarios.
   - Solicita el **Nickname de Minecraft** del jugador que recibirá los ítems (se autorrellena si el usuario ya inició sesión).
   - Permite seleccionar la modalidad del servidor (Survival 1.20, Minijuegos o Global).

6. **Comprobante / Recibo Digital Gamer Oficial:**
   - Al confirmar la compra, se guarda automáticamente en la tabla `compras` de la BD.
   - Genera en pantalla un ticket/recibo oficial con código de transacción `#AW-2026-XXXX`, fecha, Nick de Minecraft, lista de ítems, precio y las instrucciones para reclamar las ventajas en el servidor (`mc.angelswans.com` / `/claim`).
   - Incluye botón para **Imprimir o Guardar en PDF**.

---

## 📁 Archivos Creados y Modificados

### 🆕 Archivos Nuevos Creados:

| Archivo | Ubicación | Descripción |
| :--- | :--- | :--- |
| **`admin-db.html`** | Raíz del proyecto | **Panel Privado de Base de Datos:** Página exclusiva (no visible para usuarios comunes) donde podés ver todas las tablas (`usuarios`, `compras`, `productos`), buscar registros, ver el JSON crudo y descargar respaldos. |
| **`db.js`** | `js/db.js` | Motor de base de datos relacional/documental (`TellusDB`). Maneja las tablas `usuarios`, `compras` y `productos`, con métodos de consulta, inserción, eliminación y respaldo. |
| **`auth.js`** | `js/auth.js` | Controla el registro de usuarios, login, manejo de sesiones, notificaciones flotantes (toasts) y el modal de "Mis Compras". |
| **`db-viewer.js`** | `js/db-viewer.js` | Interfaz gráfica del Visor de Base de Datos para consultar y administrar las tablas desde la web. |
| **`store.js`** | `js/store.js` | Lógica de la tienda: carga dinámica de productos, control de cantidades del carrito, modal de checkout sin tarjeta y generador de recibos. |
| **`components.css`**| `css/components.css` | Hoja de estilos con diseño gaming moderno (glassmorphism, neón morado) para modales, recibos oficiales, tablas de BD y toasts. |
| **`Cambios.md`** | Raíz del proyecto | Este documento explicativo de seguimiento de cambios. |

---

### ✏️ Archivos Existentes Actualizados:

1. **`tienda.html`:**
   - Enlazado `components.css` y los scripts `db.js`, `auth.js`, `db-viewer.js` y `store.js`.
   - Se conectó la barra lateral del carrito (`aw-sidebar`) para mostrar cantidades, totales y botón de pago.
   - Se conectó el contenedor de productos para renderizado dinámico con filtros de categorías.

2. **`angels-wans.html`:**
   - Enlazado `components.css`.
   - Agregado el contenedor de acciones en el header (`aw-header-icons`).
   - Enlazados los scripts de base de datos y autenticación.

3. **`novedades.html`:**
   - Enlazado `components.css`.
   - Agregado el contenedor de acciones en el header.
   - Enlazados los scripts de base de datos y autenticación.

4. **`soporte.html`:**
   - Enlazado `components.css`.
   - Agregado el contenedor de acciones en el header.
   - Enlazados los scripts de base de datos y autenticación.

5. **`index.html`:**
   - Enlazado `components.css`.
   - Agregado el widget de usuario y base de datos `#tellus-header-actions` alineado en el header principal.
   - Enlazados los scripts de base de datos y autenticación.

---

## 📊 Estructura de las Tablas en la Base de Datos

### 1. Tabla: `tellus_db_usuarios`
Guarda las cuentas de los usuarios registrados.

| Campo | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `id` | Entero (PK) | Identificador único incremental | `1`, `2` |
| `nombre` | Texto | Nombre y apellido | `"Laureano Gamer"` |
| `email` | Texto | Correo electrónico de acceso | `"laureano@example.com"` |
| `password` | Texto | Contraseña | `"1234"` |
| `mc_nickname` | Texto | Nickname dentro de Minecraft | `"LaureGamer_MC"` |
| `fecha_registro`| Fecha | Fecha y hora en que se creó la cuenta | `"2026-10-25 18:30"` |
| `rol` | Texto | Rol del usuario (`usuario` o `admin`) | `"usuario"` |

### 2. Tabla: `tellus_db_compras`
Guarda cada orden o compra ficticia realizada en la tienda.

| Campo | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `id` | Entero (PK) | Identificador único de orden | `1`, `2` |
| `codigo_recibo` | Texto | Código oficial del comprobante | `"AW-2026-4891"` |
| `usuario_id` | Entero (FK) | ID del usuario que compró (o null si invitado) | `2` |
| `usuario_nombre`| Texto | Nombre de la persona | `"Laureano Gamer"` |
| `mc_nickname` | Texto | Nickname de Minecraft donde se entregan los ítems | `"LaureGamer_MC"` |
| `modalidad` | Texto | Modalidad de servidor seleccionada | `"Survival 1.20"` |
| `items` | Array | Lista de productos, cantidades y precios | `[{"nombre":"Rango VIP", "cantidad":1, "precio":5.00}]` |
| `total` | Decimal | Importe total ficticio | `5.00` |
| `metodo_pago` | Texto | Indicador del método simulado | `"Simulado (Sin Tarjeta)"` |
| `fecha` | Fecha | Fecha y hora exacta de la compra | `"2026-10-25 18:40"` |
| `estado` | Texto | Estado de acreditación | `"Completado y Acreditado"` |

---

## 🧪 ¿Cómo Probar Todo en tu Navegador?

1. **Abrir la Tienda:**
   - Abrí el archivo `tienda.html` con doble clic o con la extensión Live Server.
2. **Abrir el Panel de Base de Datos (Oculto):**
   - Hacé doble clic en el archivo `admin-db.html` en tu carpeta de proyecto.
   - Vas a ver la pantalla de administración con las métricas (KPIs), la tabla de **Usuarios**, la tabla de **Compras** y el visor de **JSON crudo**.
3. **Crear tu Usuario:**
   - En la tienda (`tienda.html`), hacé clic en **`🔑 Ingresar / Registro`** y andá a la pestaña **Registrarse**.
   - Ingresá tus datos con tu Nick de Minecraft preferido y dale a *Crear Cuenta*.
   - Volvé a la pestaña de `admin-db.html` (o dale F5) y vas a ver tu nuevo usuario agregado al instante en la tabla `usuarios`.
4. **Comprar Ítems Ficticios:**
   - Añadí al carrito un Rango VIP o Llaves Místicas.
   - En el carrito de la barra lateral, hacé clic en **`Ir a Pagar`**.
   - Vas a ver que tu Nick de Minecraft ya aparece puesto automáticamente y que **no te pide tarjeta de crédito**.
   - Hacé clic en **`🚀 Confirmar Compra y Generar Recibo`**.
5. **Ver tu Recibo:**
   - Se abrirá el **Recibo Digital Oficial** con tu código de orden, la fecha y el botón para imprimir o guardar en PDF.
   - Si vas a la pestaña de tu usuario en la cabecera y seleccionás **`📦 Mis Compras`**, podés volver a abrir tus comprobantes cuando quieras.

---

## 📞 Actualización de Pie de Página (Footer con Contacto Oficial)
- **Instagram Oficial:** Enlazado a `https://www.instagram.com/senty_tellus_corp/` con apertura en nueva pestaña.
- **WhatsApp Oficial:** Enlazado al número directo `+542216427371` vía `https://wa.me/542216427371`.
- **Gmail de la Empresa (Editable):** Apartado con ícono oficial y correo provisional `contacto.senteytellus@gmail.com` etiquetado con comentarios HTML (`<!-- ✏️ EDITABLE: ... -->`) para modificarlo fácilmente cuando se cree la cuenta oficial.
- **Diseño Unificado & Responsivo:** Estilizado en `components.css` con efecto glow, íconos vectoriales SVG y compatibilidad para móviles en todas las páginas (`index.html`, `angels-wans.html`, `novedades.html`, `soporte.html`, `tienda.html` y `admin-db.html`).

---

## 🎨 Rediseño Corporativo de Senty Tellus (Basado en el Boceto Visual)
- **Paleta Corporativa Calma ("Tranqui"):** Se transformó la página principal (`index.html` y `css/styles.css`) pasando del modo oscuro de gaming a una paleta cálida y empresarial (tonos beige suave `#f8f3ec`, marfil `#fffdfa`, acentos en cuero/terracota `#834f2a` y tipografía café oscuro `#452c1e`), tal como solicitó el docente para la empresa.
- **Fondo con Ondas Orgánicas:** Gráfico vectorial SVG decorativo con curvas bezier fluidas en tonos arena y crema.
- **Nuevo Encabezado & Logo Oficial:** Integración del logo del mundo de Senty Tellus con fondo transparente, tipografía *Outfit*, botón de ingreso/registro estilizado en formato píldora y acceso directo de 9 puntos (App Launcher) al panel del sistema.
- **Hero Card Principal:**
  - Columna izquierda: Presentación formal ("Bienvenido a Senty Tellus"), párrafos corporativos y botón interactivo `Comenzar ➔`.
  - Columna derecha: Tarjeta visual de Angels Wans con la imagen del servidor, etiqueta `🎮 Servidor` y acceso directo a `angels-wans.html`.
- **Sección "Nuestros Módulos":**
  - Contenedor con encabezado iconográfico y botón `Ver todos los módulos ›`.
  - Cuatro tarjetas con íconos vectoriales en círculos cálidos: **Survival** (estadísticas), **Minijuegos** (trofeo), **Tienda** (carrito hacia `tienda.html`) y **Próximamente** (reloj). Cada tarjeta incluye botón de acción circular con flecha interactiva.
- **Footer Corporativo Integrado:** Línea horizontal minimalista con separadores, manteniendo los accesos a Instagram, WhatsApp y el correo Gmail editable.
- **Preservación de Angels Wans:** Las páginas del servidor (`angels-wans.html`, `tienda.html`, `novedades.html`, `soporte.html`) mantienen intacto su estilo gamer inmersivo de Minecraft con fondo oscuro.

## 🔒 Control de Acceso Estricto: Panel de Base de Datos para Rol 'admin'
- **Protección en Senty Tellus (`index.html`):** El botón de menú de 9 puntos (App Launcher) ahora intercepta el clic y comprueba la sesión activa en `TellusDB`. Si el usuario no inició sesión, muestra una advertencia ("Iniciá sesión como Administrador") y despliega el modal de login. Si el usuario está registrado con rol común (`usuario`), se bloquea el acceso con aviso de permisos insuficientes.
- **Protección en el Panel (`admin-db.html`):** Se implementó una barrera de seguridad completa en el propio archivo. Si alguien intenta ingresar directamente sin sesión o con rol común, el contenido de la base de datos (tablas, compras, usuarios, KPIs y JSON) permanece completamente oculto y se muestra una pantalla de **Acceso Restringido 🔒** con opciones para autenticarse o regresar al inicio.
- **Credenciales Oficiales de Administrador:** Cuenta configurada en la BD: Email: `admin@senteytellus.com` | Contraseña: `admin`.

---

## 🌌 Fondos Dinámicos por Categoría e Imágenes Propias en Novedades
- **Fondos por Categoría en la Tienda (`tienda.html`):** Al hacer clic en cada categoría de la barra lateral, el fondo de la pantalla cambia dinámicamente con una transición suave:
  - 🔥 **Destacados:** `bg-cat-destacados.jpg` (Gradiente fuego, púrpura y partículas de brasa).
  - 👑 **Rangos Globales:** `bg-cat-globales.jpg` (Galaxia morada imperial y destellos dorados).
  - ⚔️ **Rangos Survival:** `bg-cat-survival.jpg` (Esmeralda mística y aura verde de obsidiana).
  - 🗝️ **Llaves Místicas:** `bg-cat-llaves.jpg` (Grieta arcana en cian y azul cósmico).
  - 💎 **Cosméticos:** `bg-cat-cosmeticos.jpg` (Nebulosa magenta y polvo de estrellas).
  - 🪙 **Monedas:** `bg-cat-monedas.jpg` (Oro brillante y resplandor de tesoro).
- **Fondos por Sección de Angel's Wans:**
  - `angels-wans.html`: `page-principal` (`Fondop.png`).
  - `tienda.html`: `page-tienda` (Fondo dinámico reactivo por categoría).
  - `novedades.html`: `page-novedades` (`bg-page-novedades.jpg`).
  - `soporte.html`: `page-soporte` (`bg-page-soporte.jpg`).
- **Novedades Renovadas con Gráficos e Íconos Propios:**
  - Se crearon 4 imágenes temáticas de alta resolución (800x480) que reemplazan a `Fondop.png`:
    1. **`noticia-actualizacion.jpg`:** *Actualización 1.20: La Era de las Sombras* con ícono 🔮 y placa púrpura.
    2. **`noticia-torneo.jpg`:** *Torneo Bedwars All-Stars 4v4* con ícono 🏆 y placa naranja.
    3. **`noticia-caja-mistica.jpg`:** *Caja Mística del Vacío* con ícono 🗝️ y placa cian.
    4. **`noticia-mantenimiento.jpg`:** *Optimización & Anti-Lag* con ícono 🛠️ y placa esmeralda.
  - Cada noticia incluye insignias con categoría, fecha de publicación y efectos de sombra y hover.

---
*Fin del registro de cambios. Proyecto Sentey Tellus / Angel's Wans.*

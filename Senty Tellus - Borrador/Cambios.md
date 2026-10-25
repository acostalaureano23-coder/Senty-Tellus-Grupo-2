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
*Fin del registro de cambios. Proyecto Sentey Tellus / Angel's Wans.*

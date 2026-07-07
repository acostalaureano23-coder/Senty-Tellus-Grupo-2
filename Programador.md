# Trabajo Práctico: Conceptos Básicos de HTML, CSS y JavaScript

Este trabajo tiene como objetivo mostrar ejemplos sencillos de las tres tecnologías que se suelen utilizar para crear una página web, explicado de forma algo sencilla.

---

## 1. HTML: Estructurar
HTML nos sirve para armar el "esqueleto" de la web, es decir, definir qué elementos van a aparecer en la pantalla.

 *Código HTML* | Explicación simple de su función 

`<h1>Título</h1>` | Este es el título principal de la página. Se usa uno solo por sección para destacar lo más importante. |

 | `<p>Hello World.</p>` | Sirve para escribir textos comunes o párrafos de lectura dentro de la web. |

| `<button>Tocame</button>` | Crea un botón básico en la pantalla, aunque todavía no hace nada si lo apretás. |

---

## 2. CSS: Visualizar
CSS lo usamos para que el esqueleto de HTML se vea bonito, cambiándole los colores, los tamaños y las formas.

 *Código CSS* | Explicación simple de su función 

```css<br>h1 {<br>  color: darkblue;<br>  text-align: center;<br>}<br>``` | Agarra el título principal, lo pinta de color azul oscuro y lo centra en el medio de la pantalla. |

| ```css<br>p {<br>  font-size: 18px;<br>  line-height: 1.5;<br>}<br>``` | Cambia el tamaño de la letra de los párrafos a 18 píxeles y les da un poco de espacio entre líneas para que se lea mejor. |

| ```css<br>button {<br>  background-color: #4CAF50;<br>  border: none;<br>  color: white;<br>}<br>``` | Al botón le saca el borde gris feo que trae por defecto, lo pinta de verde y le pone el texto en color blanco. |

---

## 3. JavaScript: Interactuar
JavaScript es el que le da "vida" y movimiento a la página, haciendo que las cosas reaccionen cuando alguien interactúa.

 *Código JavaScript* | Explicación simple de su función 

`alert("¡Hola! Gracias por entrar.");` | Hace que aparezca una ventanita flotante arriba en el navegador con un mensaje de bienvenida. |

 ```javascript<br>function cambiarColor() {<br>  document.body.style.backgroundColor = "lightgray";<br>}<br>``` | Es una función que, al ejecutarla, cambia por completo el color de fondo de toda la página a un gris clarito. |

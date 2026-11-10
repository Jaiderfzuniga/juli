# Para ti

Una página-regalo: un polvo de estrellas se junta y forma un corazón que late.
Huye de tu dedo, se convierte en palabras cuando lo tocas y guarda una carta.
Una misma página sirve para muchas personas: cada una recibe su propio enlace con
su nombre, sus textos, su color y su tipo de letra.

## Cómo se vive

1. **Portada** con el nombre. Al pulsar **Abrir**, el polvo de estrellas forma el corazón.
2. **Corazón**: late, tiene un anillo que lo orbita y sus partículas se apartan del cursor.
   Cada toque lo convierte en la siguiente palabra (por ejemplo «Te quiero», el nombre) y
   luego vuelve a ser corazón. Tocar fuera suelta chispas y corazoncitos.
3. **Carta**: crece desde su botón y el mensaje se escribe letra por letra
   (un toque al texto lo completa de una vez).

## Hacer una versión para otra persona

No hace falta tocar código.

1. Abre la página con `?editar` al final de la dirección, por ejemplo
   `https://TU-USUARIO.github.io/juli/?editar`
2. Cambia nombre, color, tipo de letra (seis juegos, también la que dibuja el
   corazón), textos de portada, frase, palabras que forma el corazón
   (una por línea, hasta 4), carta y firma. Todo se ve al instante.
   Escribe `{nombre}` en cualquier texto y se reemplaza por el nombre.
3. Pulsa **Copiar enlace** y envíaselo. Esa persona ve la página final, sin editor.

El contenido viaja dentro del propio enlace (después de `#d=`), así que no se guarda en
ningún servidor. El borrador del editor se guarda solo en tu navegador.

## Cambiar el contenido por defecto

Lo que se ve sin enlace personalizado está en [`js/config.js`](js/config.js), junto con
los colores disponibles y los campos del editor.

## Estructura

```
index.html       estructura de la página
css/app.css      portada, corazón y carta (toda la paleta sale de un tono)
css/editor.css   panel de edición
js/config.js     contenido por defecto, temas y campos del editor
js/store.js      lee el enlace personalizado y lo valida
js/heart.js      canvas: estrellas, corazón de partículas, palabras y chispas
js/main.js       dirige portada, corazón y carta
js/editor.js     panel de edición (solo con ?editar)
```

## Probar en tu PC

```bash
python -m http.server 8000
```

Y abre http://localhost:8000. Si tu equipo tiene activado "reducir movimiento", la
página suaviza las animaciones; añade `?animar` a la dirección para ver la versión completa.

## Publicar

En GitHub: **Settings → Pages → Deploy from a branch → main / (root)**.

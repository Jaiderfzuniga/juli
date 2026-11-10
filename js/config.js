/* ============================================================
   CONTENIDO POR DEFECTO
   Esto es lo que se ve cuando alguien abre la página sin un
   enlace personalizado. Para hacer una versión para otra persona
   NO hace falta tocar este archivo: abre la página con ?editar
   al final de la dirección y usa el editor.
   ============================================================ */
window.GIFT_DEFAULTS = {
  para: 'Juli',
  portada: 'Para',
  botonAbrir: 'Abrir',
  frase: 'Te quiero',
  formas: 'Te quiero\n{nombre}',
  cartaTitulo: 'Para {nombre}',
  cartaTexto:
    'Solo quería crear algo único para ti. Espero que esta sorpresa llene tu día de luz y te recuerde lo especial que eres.',
  firma: 'Con cariño, Jaider',
  tema: 'rosa',
  letra: 'clasica',
};

/* Temas de color. `hue` es el tono (0–360) del que sale toda la paleta. */
window.GIFT_THEMES = {
  rosa:    { nombre: 'Rosa',    color: '#ff2e93', hue: 328 },
  rojo:    { nombre: 'Rojo',    color: '#ff2d4b', hue: 352 },
  violeta: { nombre: 'Violeta', color: '#a35bff', hue: 268 },
  azul:    { nombre: 'Azul',    color: '#3aa0ff', hue: 210 },
  menta:   { nombre: 'Menta',   color: '#2fe0a8', hue: 160 },
  dorado:  { nombre: 'Dorado',  color: '#ffb92e', hue: 40 },
};

/* Juegos de letra. `titulo` es la letra en mayúsculas (frase, carta y
   la que dibuja el corazón) y `mano` la manuscrita (nombre, firma).
   `href` es lo que se pide a Google Fonts; la clásica ya viene cargada. */
window.GIFT_FONTS = {
  clasica:   { nombre: 'Clásica',   titulo: "'Cinzel', Georgia, serif",      peso: 700, mano: "'Pinyon Script', cursive", href: '' },
  romantica: { nombre: 'Romántica', titulo: "'Bodoni Moda', Georgia, serif", peso: 700, mano: "'Great Vibes', cursive",   href: 'family=Bodoni+Moda:wght@700&family=Great+Vibes' },
  elegante:  { nombre: 'Elegante',  titulo: "'Italiana', Georgia, serif",    peso: 400, mano: "'Parisienne', cursive",    href: 'family=Italiana&family=Parisienne' },
  original:  { nombre: 'Original',  titulo: "'Cinzel', Georgia, serif",      peso: 700, mano: "'Great Vibes', cursive",   href: 'family=Great+Vibes' },
  moderna:   { nombre: 'Moderna',   titulo: "'Bricolage Grotesque', system-ui, sans-serif", peso: 700, mano: "'Caveat', cursive", href: 'family=Bricolage+Grotesque:opsz,wght@12..96,700&family=Caveat:wght@600' },
  divertida: { nombre: 'Divertida', titulo: "'Fredoka', system-ui, sans-serif", peso: 600, mano: "'Pacifico', cursive",    href: 'family=Fredoka:wght@600&family=Pacifico' },
};

/* Campos que muestra el editor (en este orden). */
window.GIFT_FIELDS = [
  { grupo: 'Destinatario' },
  { key: 'para', label: 'Nombre de quien lo recibe', max: 18 },
  { key: 'tema', label: 'Color', type: 'tema' },
  { key: 'letra', label: 'Tipo de letra', type: 'fuente' },

  { grupo: 'Portada' },
  { key: 'portada', label: 'Texto sobre el nombre', max: 20 },
  { key: 'botonAbrir', label: 'Texto del botón', max: 18 },

  { grupo: 'Corazón' },
  { key: 'frase', label: 'Frase bajo el corazón', max: 26 },
  {
    key: 'formas',
    label: 'Palabras que forma el corazón',
    type: 'area',
    max: 80,
    ayuda: 'Una por línea, máximo 4. Cada toque al corazón lo convierte en la siguiente y luego vuelve a ser corazón.',
  },

  { grupo: 'Carta' },
  { key: 'cartaTitulo', label: 'Título', max: 30 },
  { key: 'cartaTexto', label: 'Mensaje', type: 'area', max: 500 },
  { key: 'firma', label: 'Firma', max: 30 },
];

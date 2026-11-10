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
  musica: 'musica.mp3',
  tema: 'rosa',
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

/* Campos que muestra el editor (en este orden). */
window.GIFT_FIELDS = [
  { grupo: 'Destinatario' },
  { key: 'para', label: 'Nombre de quien lo recibe', max: 18 },
  { key: 'tema', label: 'Color', type: 'tema' },

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

  { grupo: 'Música' },
  {
    key: 'musica',
    label: 'Canción (archivo o enlace)',
    type: 'url',
    max: 300,
    ayuda: 'Sube un .mp3 al repositorio y escribe su nombre (por ejemplo musica.mp3), o pega un enlace directo a un .mp3. Si no existe, la página funciona en silencio.',
  },
];

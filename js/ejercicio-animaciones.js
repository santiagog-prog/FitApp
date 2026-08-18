// ════════════════════════════════════════════════════════════
// ejercicio-animaciones.js — Animaciones SVG para ejercicios
// Todos los SVGs usan SMIL (sin conflictos CSS) — 64×64 viewBox
// ════════════════════════════════════════════════════════════
(function(){
"use strict";

var B = 'stroke="#4B5563" stroke-width="2.5" stroke-linecap="round" fill="none"';
var M = 'stroke="#9CA3AF" stroke-width="1.8" stroke-linecap="round" fill="none"';
var A = '#C8E000'; // acento lima
var D = '#5A8000'; // lima oscuro

function svg(content){
  return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">' + content + '</svg>';
}

var ANIMS = {};

// ── PRESS (bench press, chest, push, fondos, dips, tricep) ──
ANIMS.press = svg(
  // banco
  '<ellipse cx="32" cy="54" rx="20" ry="7" fill="#E5E5EA" stroke="#9CA3AF" stroke-width="1.5"/>' +
  // brazos estáticos (extendidos al ángulo de toque)
  '<line x1="18" y1="53" x2="20" y2="35" ' + B + '/>' +
  '<line x1="46" y1="53" x2="44" y2="35" ' + B + '/>' +
  // barra (grupo que sube y baja)
  '<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-13;0,0" dur="1.6s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<rect x="8" y="22" width="8" height="15" rx="3" fill="' + D + '"/>' +
  '<rect x="48" y="22" width="8" height="15" rx="3" fill="' + D + '"/>' +
  '<rect x="16" y="26" width="32" height="8" rx="3" fill="' + A + '"/>' +
  '</g>'
);

// ── SQUAT (sentadilla, squat, leg press) ──
ANIMS.squat = svg(
  // piso
  '<line x1="8" y1="60" x2="56" y2="60" ' + M + ' opacity="0.5"/>' +
  // pies (estáticos)
  '<circle cx="22" cy="58" r="3.5" fill="#9CA3AF" opacity="0.7"/>' +
  '<circle cx="42" cy="58" r="3.5" fill="#9CA3AF" opacity="0.7"/>' +
  // cuerpo completo (baja)
  '<g><animateTransform attributeName="transform" type="translate" values="0,0;0,10;0,0" dur="1.8s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<circle cx="32" cy="5" r="5" fill="none" stroke="#4B5563" stroke-width="2"/>' +
  '<line x1="14" y1="13" x2="50" y2="13" stroke="' + A + '" stroke-width="3" stroke-linecap="round"/>' + // barra en hombros
  '<line x1="32" y1="13" x2="32" y2="32" ' + B + '/>' + // torso
  '<line x1="32" y1="32" x2="18" y2="48" ' + B + '/>' + // muslo izq
  '<line x1="32" y1="32" x2="46" y2="48" ' + B + '/>' + // muslo der
  '</g>'
);

// ── DEADLIFT (peso muerto, sumo, rdl, bisagra, hip hinge) ──
ANIMS.deadlift = svg(
  // piso
  '<line x1="4" y1="60" x2="60" y2="60" ' + M + ' opacity="0.5"/>' +
  // cuerpo inclinado (estático)
  '<circle cx="50" cy="22" r="5" fill="none" stroke="#4B5563" stroke-width="2"/>' + // cabeza
  '<line x1="50" y1="28" x2="28" y2="38" ' + B + '/>' + // torso inclinado
  '<line x1="28" y1="38" x2="22" y2="56" ' + B + '/>' + // pierna izq
  '<line x1="28" y1="38" x2="36" y2="56" ' + B + '/>' + // pierna der
  '<line x1="28" y1="38" x2="22" y2="52" ' + M + '/>' + // brazo (tomando barra)
  // barra (sube desde el piso)
  '<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-20;0,0" dur="1.8s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<rect x="4" y="52" width="10" height="9" rx="3" fill="' + D + '"/>' +
  '<rect x="50" y="52" width="10" height="9" rx="3" fill="' + D + '"/>' +
  '<rect x="14" y="55" width="36" height="4" rx="2" fill="' + A + '"/>' +
  '</g>'
);

// ── CURL (bíceps, rosca, curl) ──
ANIMS.curl = svg(
  // hombro y cabeza (estáticos)
  '<circle cx="32" cy="8" r="5" fill="none" stroke="#4B5563" stroke-width="2"/>' +
  '<line x1="30" y1="14" x2="28" y2="28" ' + B + '/>' + // torso arriba
  // brazo superior (estático, diagonal)
  '<line x1="28" y1="20" x2="30" y2="38" ' + B + '/>' +
  // antebrazo + mancuerna (rota alrededor del codo en 30,38)
  '<g><animateTransform attributeName="transform" type="rotate" values="0 30 38;-75 30 38;0 30 38" dur="1.5s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<line x1="30" y1="38" x2="30" y2="56" ' + B + '/>' +
  '<rect x="22" y="53" width="16" height="7" rx="3" fill="' + A + '"/>' +
  '<rect x="18" y="54" width="7" height="5" rx="2" fill="' + D + '"/>' +
  '<rect x="37" y="54" width="7" height="5" rx="2" fill="' + D + '"/>' +
  '</g>'
);

// ── ROW (remo, espalda, jalón, pull, dominada) ──
ANIMS.row = svg(
  // banco / apoyo
  '<line x1="8" y1="28" x2="8" y2="58" ' + M + ' opacity="0.5"/>' +
  '<line x1="8" y1="58" x2="36" y2="58" ' + M + ' opacity="0.5"/>' +
  // cuerpo inclinado con apoyo (estático)
  '<line x1="8" y1="28" x2="46" y2="28" ' + B + '/>' + // torso horizontal
  '<circle cx="52" cy="28" r="5" fill="none" stroke="#4B5563" stroke-width="2"/>' + // cabeza
  '<line x1="8" y1="28" x2="8" y2="42" ' + B + '/>' + // brazo apoyo
  // brazo que jala (anima de extendido a pegado)
  '<g><animateTransform attributeName="transform" type="translate" values="14,0;0,0;14,0" dur="1.5s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<line x1="20" y1="28" x2="0" y2="28" ' + B + '/>' +
  '<rect x="-6" y="23" width="8" height="10" rx="3" fill="' + D + '"/>' +
  '<rect x="-14" y="23" width="8" height="10" rx="3" fill="' + D + '"/>' +
  '<rect x="-14" y="25" width="16" height="6" rx="2" fill="' + A + '"/>' +
  '</g>'
);

// ── SHOULDER (hombros, press militar, elevaciones laterales) ──
ANIMS.shoulder = svg(
  // torso y cabeza (estáticos)
  '<circle cx="32" cy="10" r="5" fill="none" stroke="#4B5563" stroke-width="2"/>' +
  '<line x1="32" y1="16" x2="32" y2="40" ' + B + '/>' +
  // brazo izquierdo (sube)
  '<g><animateTransform attributeName="transform" type="rotate" values="0 32 24;-90 32 24;0 32 24" dur="1.6s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<line x1="32" y1="24" x2="10" y2="24" ' + B + '/>' +
  '<circle cx="7" cy="24" r="5" fill="' + A + '"/>' +
  '</g>' +
  // brazo derecho (sube simétricamente)
  '<g><animateTransform attributeName="transform" type="rotate" values="0 32 24;90 32 24;0 32 24" dur="1.6s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<line x1="32" y1="24" x2="54" y2="24" ' + B + '/>' +
  '<circle cx="57" cy="24" r="5" fill="' + A + '"/>' +
  '</g>'
);

// ── CORE (plancha, abdomen, crunch, oblicuo, sit-up) ──
ANIMS.core = svg(
  // piernas (estáticas)
  '<line x1="32" y1="46" x2="16" y2="58" ' + B + '/>' +
  '<line x1="32" y1="46" x2="48" y2="58" ' + B + '/>' +
  '<line x1="8" y1="60" x2="56" y2="60" ' + M + ' opacity="0.4"/>' +
  // torso + cabeza (rota como crunch)
  '<g><animateTransform attributeName="transform" type="rotate" values="0 32 46;-52 32 46;0 32 46" dur="1.8s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<line x1="32" y1="46" x2="32" y2="26" ' + B + '/>' +
  '<circle cx="32" cy="20" r="5" fill="none" stroke="#4B5563" stroke-width="2"/>' +
  '<line x1="32" y1="38" x2="22" y2="32" ' + B + '/>' + // brazo izq (cruzado)
  '<line x1="32" y1="38" x2="42" y2="32" ' + B + '/>' + // brazo der
  '</g>'
);

// ── CARDIO (correr, cardio, bicicleta, salto, sprint) ──
ANIMS.cardio = svg(
  // cabeza y torso (estáticos, ligeramente inclinados)
  '<circle cx="32" cy="8" r="5" fill="none" stroke="#4B5563" stroke-width="2"/>' +
  '<line x1="32" y1="14" x2="30" y2="34" ' + B + '/>' +
  '<line x1="8" y1="60" x2="56" y2="60" ' + M + ' opacity="0.4"/>' +
  // pierna izquierda (va adelante)
  '<g><animateTransform attributeName="transform" type="rotate" values="28 30 34;-22 30 34;28 30 34" dur="0.7s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<line x1="30" y1="34" x2="26" y2="50" ' + B + '/>' +
  '<line x1="26" y1="50" x2="18" y2="60" ' + B + '/>' +
  '</g>' +
  // pierna derecha (va atrás, fase opuesta)
  '<g><animateTransform attributeName="transform" type="rotate" values="-22 30 34;28 30 34;-22 30 34" dur="0.7s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<line x1="30" y1="34" x2="34" y2="50" ' + B + '/>' +
  '<line x1="34" y1="50" x2="44" y2="60" ' + B + '/>' +
  '</g>' +
  // brazo izquierdo
  '<g><animateTransform attributeName="transform" type="rotate" values="-28 32 22;18 32 22;-28 32 22" dur="0.7s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<line x1="32" y1="22" x2="22" y2="34" ' + B + '/>' +
  '</g>' +
  // brazo derecho (fase opuesta)
  '<g><animateTransform attributeName="transform" type="rotate" values="18 32 22;-28 32 22;18 32 22" dur="0.7s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<line x1="32" y1="22" x2="42" y2="34" ' + B + '/>' +
  '</g>'
);

// ── LUNGE (zancada, lunge, step) ──
ANIMS.lunge = svg(
  '<line x1="8" y1="60" x2="56" y2="60" ' + M + ' opacity="0.4"/>' +
  // pierna trasera (estática)
  '<line x1="32" y1="38" x2="46" y2="46" ' + B + '/>' +
  '<line x1="46" y1="46" x2="46" y2="60" ' + B + '/>' +
  // cuerpo y pierna delantera (baja con la zancada)
  '<g><animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="1.8s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<circle cx="32" cy="8" r="5" fill="none" stroke="#4B5563" stroke-width="2"/>' +
  '<line x1="32" y1="14" x2="32" y2="38" ' + B + '/>' + // torso
  '<line x1="32" y1="24" x2="22" y2="36" ' + M + '/>' + // brazo izq
  '<line x1="32" y1="24" x2="42" y2="36" ' + M + '/>' + // brazo der
  '<line x1="32" y1="38" x2="18" y2="52" ' + B + '/>' + // muslo delantero
  '<line x1="18" y1="52" x2="14" y2="60" ' + B + '/>' + // pantorrilla
  '</g>'
);

// ── DEFAULT (mancuerna genérica) ──
ANIMS.default = svg(
  // mancuerna (sube y baja)
  '<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-10;0,0" dur="1.5s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<rect x="20" y="26" width="24" height="12" rx="4" fill="' + A + '"/>' +
  '<rect x="10" y="22" width="10" height="20" rx="4" fill="' + D + '"/>' +
  '<rect x="44" y="22" width="10" height="20" rx="4" fill="' + D + '"/>' +
  '</g>' +
  // sombra (crece cuando baja)
  '<ellipse cx="32" cy="52" rx="10" ry="3" fill="#9CA3AF" opacity="0.3">' +
  '<animate attributeName="rx" values="10;14;10" dur="1.5s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '<animate attributeName="opacity" values="0.3;0.15;0.3" dur="1.5s" repeatCount="indefinite" calcMode="ease-in-out"/>' +
  '</ellipse>'
);

// ── LOOKUP ────────────────────────────────────────────────
window.getEjercicioSVG = function(nombre){
  var n = (nombre || '').toLowerCase()
    .replace(/[áà]/g,'a').replace(/[éè]/g,'e').replace(/[íì]/g,'i')
    .replace(/[óò]/g,'o').replace(/[úù]/g,'u').replace(/ñ/g,'n');
  var has = function(k){ return n.indexOf(k) !== -1; };

  if(has('hombro') || has('shoulder') || has('militar') || has('ohp') ||
     has('lateral') || has('elevaci') || has('deltoid'))
    return ANIMS.shoulder;

  if(has('press') || has('pecho') || has('chest') || has('fondo') ||
     has('dip') || has('push') || has('empuje'))
    return ANIMS.press;

  if(has('squat') || has('sentadilla') || has('cuclilla') || has('leg press'))
    return ANIMS.squat;

  if(has('deadlift') || has('peso muerto') || has('sumo') || has('rdl') ||
     has('bisagra') || has('hip hinge') || has('good morning'))
    return ANIMS.deadlift;

  if(has('curl') || has('bicep') || has('rosca'))
    return ANIMS.curl;

  if(has('remo') || has('row') || has('jalon') || has('jal') ||
     has('pull') || has('dominad') || has('espalda') || has('lat ') ||
     has('latéral') || has('cable'))
    return ANIMS.row;

  if(has('tricep') || has('extensi') || has('pushdown') || has('fondos'))
    return ANIMS.press;

  if(has('plancha') || has('plank') || has('core') || has('abdomen') ||
     has('abdomin') || has('crunch') || has('sit') || has('oblicuo'))
    return ANIMS.core;

  if(has('cardio') || has('correr') || has('running') || has('bicicleta') ||
     has('salto') || has('sprint') || has('caminata') || has('hiit') ||
     has('eliptica') || has('remo') && has('cardio'))
    return ANIMS.cardio;

  if(has('lunge') || has('zancada') || has('step'))
    return ANIMS.lunge;

  return ANIMS.default;
};

})();

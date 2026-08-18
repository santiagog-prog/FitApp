// ════════════════════════════════════════════════════════════
// ejercicio-animaciones.js — SVG técnicos con CSS keyframes
// ViewBox 0 0 120 140 — CSS prefix único por tipo (sin conflictos)
// ════════════════════════════════════════════════════════════
(function(){
"use strict";

// ── Técnica de cada tipo ──────────────────────────────────
window.TECNICA_EJ = {
  press: {
    musculos: "Pecho · Tríceps · Deltoides anterior",
    pasos: [
      "Hombros atrás y abajo, espalda con arco natural",
      "Baja la barra controlado hasta el esternón inferior",
      "Codos a ~75° del cuerpo — no completamente abiertos"
    ]
  },
  squat: {
    musculos: "Cuádriceps · Glúteos · Isquios",
    pasos: [
      "Pecho erguido, core muy apretado todo el recorrido",
      "Rodillas siguiendo la dirección de los pies",
      "Baja hasta muslos paralelos o más, talones en suelo"
    ]
  },
  deadlift: {
    musculos: "Erector espinal · Glúteos · Isquios · Trapecio",
    pasos: [
      "Espalda plana, barra sobre el medio del pie",
      "Hombros y cadera suben juntos (ni primero uno ni otro)",
      "Desliza la barra pegada a las piernas todo el recorrido"
    ]
  },
  curl: {
    musculos: "Bíceps braquial · Braquialis",
    pasos: [
      "Codos pegados a los lados del cuerpo — no los muevas",
      "Sube en 1 segundo, baja controlado en 2-3 segundos",
      "Supina la muñeca al curvar para máxima contracción"
    ]
  },
  row: {
    musculos: "Dorsal ancho · Romboides · Bíceps",
    pasos: [
      "Bisagra en cadera, espalda completamente plana",
      "Lleva el codo hacia la cadera, no hacia la axila",
      "Retrae el omóplato 1 segundo en la contracción máxima"
    ]
  },
  shoulder: {
    musculos: "Deltoides medial · Trapecio superior",
    pasos: [
      "Codos ligeramente doblados durante todo el recorrido",
      "Sube solo hasta la altura del hombro, no más arriba",
      "Controla la bajada en 2-3 segundos para más trabajo"
    ]
  },
  pull: {
    musculos: "Dorsal ancho · Bíceps · Romboides",
    pasos: [
      "Activa los dorsales antes de jalar — hombros abajo",
      "Lleva el pecho hacia la barra, codos a los lados",
      "Control total en la bajada, brazo casi extendido"
    ]
  },
  ohp: {
    musculos: "Deltoides anterior · Tríceps · Trapecio",
    pasos: [
      "Barra a nivel de clavículas, muñecas rectas",
      "Empuja la cabeza ligeramente atrás al pasar la barra",
      "Bloquea arriba con las orejas entre los brazos"
    ]
  },
  core: {
    musculos: "Recto abdominal · Oblicuos · Transverso",
    pasos: [
      "Lumbar pegada al suelo durante todo el movimiento",
      "Exhala al subir, inhala al bajar — nunca retengas",
      "Mueve el torso, no el cuello — manos detrás de orejas"
    ]
  },
  cardio: {
    musculos: "Sistema cardiovascular · Cuádriceps · Gemelos",
    pasos: [
      "Frecuencia cardíaca en zona aeróbica (60-75% FC max)",
      "Postura erguida, mirada al frente, hombros relajados",
      "Respira rítmicamente — 3 pasos inhalar, 3 pasos exhalar"
    ]
  },
  lunge: {
    musculos: "Cuádriceps · Glúteos · Isquios",
    pasos: [
      "Paso largo hacia adelante, torso erguido",
      "Rodilla trasera desciende cerca del suelo sin tocar",
      "Empuja con el talón delantero para volver al inicio"
    ]
  },
  default: {
    musculos: "Músculos del grupo trabajado",
    pasos: [
      "Controla la fase excéntrica (bajada) en 2-3 segundos",
      "Mantén forma correcta — nunca sacrifiques técnica por peso",
      "Respira correctamente durante todo el movimiento"
    ]
  }
};

// ── Colores ────────────────────────────────────────────────
var C = {
  body:   "#374151",   // gris oscuro — partes del cuerpo
  light:  "#9CA3AF",   // gris medio — elementos secundarios
  accent: "#C8E000",   // lima — peso/movimiento
  dark:   "#5A8000",   // lima oscuro — placas/peso
  muscle: "rgba(200,224,0,0.15)", // zona muscular activa
  floor:  "#D1D5DB"    // suelo
};

// ── Helper SVG wrapper ─────────────────────────────────────
function S(style_content, body_content){
  return '<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">' +
    '<style>' + style_content + '</style>' +
    body_content +
  '</svg>';
}

// Stroke helper
var SB = 'stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"';
var SL = 'stroke="' + C.light + '" stroke-width="2" stroke-linecap="round" fill="none"';

var ANIMS = {};

// ════════════════════════════════════════════════════════════
// BENCH PRESS — Vista lateral, persona acostada
// ════════════════════════════════════════════════════════════
ANIMS.press = S(
  // CSS: grupo barra sube/baja, brazos siguen
  '.bp-bar{animation:bp-bar-mv 1.9s cubic-bezier(0.45,0.05,0.55,0.95) infinite;}' +
  '@keyframes bp-bar-mv{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}' +
  '.bp-arm{animation:bp-arm-mv 1.9s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:33px 78px;}' +
  '@keyframes bp-arm-mv{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-20deg)}}',

  // Banco
  '<rect x="14" y="84" width="90" height="10" rx="5" fill="#E5E5EA" stroke="' + C.light + '" stroke-width="1.5"/>' +
  '<line x1="24" y1="94" x2="20" y2="118" ' + SL + '/>' +
  '<line x1="100" y1="94" x2="104" y2="118" ' + SL + '/>' +
  // Suelo
  '<line x1="8" y1="128" x2="112" y2="128" stroke="' + C.floor + '" stroke-width="2"/>' +
  // Piernas (estáticas, colgando o en suelo)
  '<line x1="62" y1="84" x2="60" y2="110" ' + SB + '/>' +
  '<line x1="60" y1="110" x2="48" y2="128" ' + SB + '/>' +
  '<line x1="60" y1="110" x2="72" y2="128" ' + SB + '/>' +
  // Cabeza
  '<circle cx="104" cy="74" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' +
  // Torso (horizontal acostado)
  '<line x1="104" y1="84" x2="30" y2="84" ' + SB + '/>' +
  // Zona pecho (músculo activo)
  '<ellipse cx="62" cy="78" rx="20" ry="8" fill="' + C.muscle + '" opacity="0"/>' +
  // Brazo: hombro→codo→muñeca (animado)
  '<g class="bp-arm">' +
  '<line x1="33" y1="78" x2="26" y2="66" ' + SB + '/>' +
  '<line x1="26" y1="66" x2="24" y2="58" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '</g>' +
  // Grupo barra (animado: sube)
  '<g class="bp-bar">' +
  '<rect x="6" y="52" width="8" height="16" rx="3" fill="' + C.dark + '"/>' +
  '<rect x="106" y="52" width="8" height="16" rx="3" fill="' + C.dark + '"/>' +
  '<rect x="14" y="56" width="92" height="8" rx="3" fill="' + C.accent + '"/>' +
  '</g>'
);

// ════════════════════════════════════════════════════════════
// SQUAT — Vista lateral, barra en trapecios
// ════════════════════════════════════════════════════════════
ANIMS.squat = S(
  '.sq-up{animation:sq-down 2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;}' +
  '@keyframes sq-down{0%,100%{transform:translateY(0)}50%{transform:translateY(18px)}}' +
  '.sq-shin{animation:sq-shin-mv 2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:48px 98px;}' +
  '@keyframes sq-shin-mv{0%,100%{transform:rotate(0deg)}50%{transform:rotate(10deg)}}',

  // Suelo
  '<line x1="8" y1="132" x2="112" y2="132" stroke="' + C.floor + '" stroke-width="2"/>' +
  // Pies (estáticos en el suelo)
  '<line x1="28" y1="132" x2="54" y2="132" ' + SB + '/>' +
  // Espinillas (animadas: la rodilla se mueve hacia adelante)
  '<g class="sq-shin">' +
  '<line x1="48" y1="98" x2="36" y2="132" ' + SB + '/>' +
  '</g>' +
  // Parte superior (baja con la sentadilla)
  '<g class="sq-up">' +
  // Cabeza
  '<circle cx="68" cy="10" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' +
  // Barra en trapecios
  '<rect x="12" y="21" width="10" height="18" rx="3" fill="' + C.dark + '"/>' +
  '<rect x="98" y="21" width="10" height="18" rx="3" fill="' + C.dark + '"/>' +
  '<rect x="22" y="26" width="76" height="8" rx="3" fill="' + C.accent + '"/>' +
  // Cuello
  '<line x1="68" y1="20" x2="68" y2="26" stroke="' + C.body + '" stroke-width="3" stroke-linecap="round"/>' +
  // Torso con inclinación
  '<line x1="68" y1="26" x2="58" y2="62" ' + SB + '/>' +
  // Brazos sujetando barra
  '<line x1="50" y1="26" x2="58" y2="36" stroke="' + C.body + '" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
  '<line x1="86" y1="26" x2="78" y2="36" stroke="' + C.body + '" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
  // Cadera→rodilla (muslo)
  '<line x1="58" y1="62" x2="48" y2="98" ' + SB + '/>' +
  '</g>'
);

// ════════════════════════════════════════════════════════════
// DEADLIFT — Vista lateral, barra al suelo
// ════════════════════════════════════════════════════════════
ANIMS.deadlift = S(
  '.dl-bar{animation:dl-bar-up 2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;}' +
  '@keyframes dl-bar-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}' +
  '.dl-torso{animation:dl-torso-mv 2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:55px 76px;}' +
  '@keyframes dl-torso-mv{0%,100%{transform:rotate(35deg)}50%{transform:rotate(0deg)}}',

  // Suelo
  '<line x1="8" y1="132" x2="112" y2="132" stroke="' + C.floor + '" stroke-width="2"/>' +
  // Piernas/caderas (estáticas — levemente flexionadas)
  '<line x1="55" y1="76" x2="48" y2="112" ' + SB + '/>' +  // muslo
  '<line x1="48" y1="112" x2="44" y2="132" ' + SB + '/>' + // espinilla
  '<line x1="30" y1="132" x2="58" y2="132" ' + SB + '/>' + // pie
  // Torso (animado: pasa de inclinado a erguido)
  '<g class="dl-torso">' +
  '<circle cx="55" cy="40" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' +  // cabeza
  '<line x1="55" y1="50" x2="55" y2="76" ' + SB + '/>' +  // torso
  // Brazo (tomando barra)
  '<line x1="55" y1="58" x2="42" y2="74" ' + SB + '/>' +
  '</g>' +
  // Barra (animada: sube desde el suelo a la cadera)
  '<g class="dl-bar">' +
  '<rect x="8" y="122" width="12" height="16" rx="3" fill="' + C.dark + '"/>' +
  '<rect x="100" y="122" width="12" height="16" rx="3" fill="' + C.dark + '"/>' +
  '<rect x="20" y="126" width="80" height="8" rx="3" fill="' + C.accent + '"/>' +
  '</g>'
);

// ════════════════════════════════════════════════════════════
// CURL — Vista lateral, antebrazo gira alrededor del codo
// ════════════════════════════════════════════════════════════
ANIMS.curl = S(
  '.cu-fa{animation:cu-curl 1.6s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:62px 74px;}' +
  '@keyframes cu-curl{0%,100%{transform:rotate(10deg)}50%{transform:rotate(-75deg)}}',

  // Figura parado (estática)
  '<circle cx="62" cy="10" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' +
  '<line x1="62" y1="20" x2="62" y2="44" ' + SB + '/>' +   // cuello+torso arriba
  '<line x1="62" y1="44" x2="50" y2="80" ' + SB + '/>' +   // torso abajo
  '<line x1="50" y1="80" x2="38" y2="110" ' + SB + '/>' +  // muslo izq
  '<line x1="38" y1="110" x2="34" y2="132" ' + SB + '/>' + // espinilla izq
  '<line x1="50" y1="80" x2="62" y2="110" ' + SB + '/>' +  // muslo der
  '<line x1="62" y1="110" x2="66" y2="132" ' + SB + '/>' + // espinilla der
  '<line x1="20" y1="132" x2="112" y2="132" stroke="' + C.floor + '" stroke-width="2"/>' +
  // Brazo superior (estático)
  '<line x1="62" y1="34" x2="62" y2="74" ' + SB + '/>' +
  // Antebrazo + mancuerna (rota alrededor del codo)
  '<g class="cu-fa">' +
  '<line x1="62" y1="74" x2="62" y2="108" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '<rect x="52" y="106" width="20" height="8" rx="4" fill="' + C.accent + '"/>' +
  '<rect x="46" y="107" width="8" height="6" rx="3" fill="' + C.dark + '"/>' +
  '<rect x="66" y="107" width="8" height="6" rx="3" fill="' + C.dark + '"/>' +
  '</g>'
);

// ════════════════════════════════════════════════════════════
// ROW (remo inclinado) — Vista lateral, tirando la barra hacia el abdomen
// ════════════════════════════════════════════════════════════
ANIMS.row = S(
  '.ro-arm{animation:ro-pull 1.7s cubic-bezier(0.45,0.05,0.55,0.95) infinite;}' +
  '@keyframes ro-pull{0%,100%{transform:translateX(14px)}50%{transform:translateX(0px)}}',

  // Suelo
  '<line x1="8" y1="130" x2="112" y2="130" stroke="' + C.floor + '" stroke-width="2"/>' +
  // Cuerpo inclinado ~45° (estático)
  '<circle cx="92" cy="30" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' +
  '<line x1="92" y1="40" x2="52" y2="76" ' + SB + '/>' +  // torso inclinado
  '<line x1="52" y1="76" x2="44" y2="110" ' + SB + '/>' + // muslo
  '<line x1="44" y1="110" x2="46" y2="130" ' + SB + '/>' + // espinilla
  '<line x1="52" y1="76" x2="62" y2="108" ' + SB + '/>' + // otro muslo
  '<line x1="62" y1="108" x2="64" y2="130" ' + SB + '/>' +
  '<line x1="28" y1="130" x2="80" y2="130" stroke="' + C.body + '" stroke-width="3" stroke-linecap="round"/>' + // pies
  // Zona dorsal (músculo activo)
  '<ellipse cx="72" cy="56" rx="18" ry="14" fill="' + C.muscle + '"/>' +
  // Brazo + barra (animado: tira hacia el abdomen)
  '<g class="ro-arm">' +
  '<line x1="52" y1="56" x2="22" y2="72" ' + SB + '/>' +  // brazo extendido
  '<rect x="6" y="64" width="10" height="18" rx="3" fill="' + C.dark + '"/>' +
  '<rect x="16" y="68" width="22" height="8" rx="2" fill="' + C.accent + '"/>' +
  '</g>'
);

// ════════════════════════════════════════════════════════════
// OVERHEAD PRESS — Vista lateral, barra desde clavícula a overhead
// ════════════════════════════════════════════════════════════
ANIMS.ohp = S(
  '.ohp-bar{animation:ohp-up 1.9s cubic-bezier(0.45,0.05,0.55,0.95) infinite;}' +
  '@keyframes ohp-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-28px)}}' +
  '.ohp-arm{animation:ohp-arm 1.9s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:60px 50px;}' +
  '@keyframes ohp-arm{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-35deg)}}',

  // Suelo
  '<line x1="8" y1="132" x2="112" y2="132" stroke="' + C.floor + '" stroke-width="2"/>' +
  // Cuerpo (estático)
  '<circle cx="60" cy="12" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' +
  '<line x1="60" y1="22" x2="60" y2="72" ' + SB + '/>' +
  '<line x1="60" y1="72" x2="48" y2="106" ' + SB + '/>' +
  '<line x1="60" y1="72" x2="72" y2="106" ' + SB + '/>' +
  '<line x1="48" y1="106" x2="44" y2="132" ' + SB + '/>' +
  '<line x1="72" y1="106" x2="76" y2="132" ' + SB + '/>' +
  '<line x1="28" y1="132" x2="60" y2="132" ' + SB + '/>' +
  // Brazo (animado: extiende overhead)
  '<g class="ohp-arm">' +
  '<line x1="60" y1="38" x2="60" y2="50" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '<line x1="60" y1="50" x2="42" y2="60" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '</g>' +
  // Barra (animada: sube overhead)
  '<g class="ohp-bar">' +
  '<rect x="10" y="50" width="10" height="18" rx="3" fill="' + C.dark + '"/>' +
  '<rect x="100" y="50" width="10" height="18" rx="3" fill="' + C.dark + '"/>' +
  '<rect x="20" y="54" width="80" height="9" rx="3" fill="' + C.accent + '"/>' +
  '</g>'
);

// ════════════════════════════════════════════════════════════
// LATERAL RAISE / HOMBROS — Vista frontal, brazos suben
// ════════════════════════════════════════════════════════════
ANIMS.shoulder = S(
  '.lr-arm-l{animation:lr-up 1.8s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:38px 46px;}' +
  '@keyframes lr-up{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-78deg)}}' +
  '.lr-arm-r{animation:lr-up 1.8s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:82px 46px;}' +
  '.lr-arm-r{animation:lr-up-r 1.8s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:82px 46px;}' +
  '@keyframes lr-up-r{0%,100%{transform:rotate(0deg)}50%{transform:rotate(78deg)}}',

  // Suelo
  '<line x1="8" y1="132" x2="112" y2="132" stroke="' + C.floor + '" stroke-width="2"/>' +
  // Cuerpo (estático)
  '<circle cx="60" cy="12" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' +
  '<line x1="60" y1="22" x2="60" y2="68" ' + SB + '/>' +   // torso
  '<line x1="60" y1="68" x2="46" y2="104" ' + SB + '/>' +  // pierna izq
  '<line x1="60" y1="68" x2="74" y2="104" ' + SB + '/>' +  // pierna der
  '<line x1="46" y1="104" x2="42" y2="132" ' + SB + '/>' +
  '<line x1="74" y1="104" x2="78" y2="132" ' + SB + '/>' +
  '<line x1="24" y1="132" x2="60" y2="132" ' + SB + '/>' +
  '<line x1="60" y1="132" x2="96" y2="132" ' + SB + '/>' +
  // Deltoides highlight
  '<circle cx="38" cy="36" r="10" fill="' + C.muscle + '"/>' +
  '<circle cx="82" cy="36" r="10" fill="' + C.muscle + '"/>' +
  // Brazo izquierdo (rota desde hombro)
  '<g class="lr-arm-l">' +
  '<line x1="38" y1="46" x2="14" y2="52" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '<circle cx="10" cy="52" r="6" fill="' + C.accent + '"/>' +
  '</g>' +
  // Brazo derecho
  '<g class="lr-arm-r">' +
  '<line x1="82" y1="46" x2="106" y2="52" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '<circle cx="110" cy="52" r="6" fill="' + C.accent + '"/>' +
  '</g>'
);

// ════════════════════════════════════════════════════════════
// PULL / JALÓN / DOMINADAS — Vista frontal, brazos bajan
// ════════════════════════════════════════════════════════════
ANIMS.pull = S(
  '.pu-body{animation:pu-pull 2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;}' +
  '@keyframes pu-pull{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}' +
  '.pu-arm-l{animation:pu-arm 2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:36px 28px;}' +
  '@keyframes pu-arm{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(30deg)}}' +
  '.pu-arm-r{animation:pu-arm-r 2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:84px 28px;}' +
  '@keyframes pu-arm-r{0%,100%{transform:rotate(10deg)}50%{transform:rotate(-30deg)}}',

  // Barra fija (estática arriba)
  '<rect x="14" y="16" width="92" height="6" rx="3" fill="' + C.dark + '"/>' +
  '<line x1="14" y1="4" x2="14" y2="18" ' + SL + '/>' +
  '<line x1="106" y1="4" x2="106" y2="18" ' + SL + '/>' +
  // Brazo izquierdo (rota desde barra)
  '<g class="pu-arm-l">' +
  '<line x1="36" y1="22" x2="36" y2="50" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '</g>' +
  // Brazo derecho
  '<g class="pu-arm-r">' +
  '<line x1="84" y1="22" x2="84" y2="50" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '</g>' +
  // Cuerpo (sube con el jalón)
  '<g class="pu-body">' +
  '<circle cx="60" cy="58" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' +
  '<line x1="60" y1="68" x2="60" y2="98" ' + SB + '/>' +
  // Dorsales highlight
  '<ellipse cx="60" cy="82" rx="22" ry="12" fill="' + C.muscle + '"/>' +
  '<line x1="60" y1="98" x2="46" y2="126" ' + SB + '/>' +
  '<line x1="60" y1="98" x2="74" y2="126" ' + SB + '/>' +
  '</g>'
);

// ════════════════════════════════════════════════════════════
// CORE / CRUNCH — Vista lateral, torso se dobla hacia las rodillas
// ════════════════════════════════════════════════════════════
ANIMS.core = S(
  '.co-up{animation:co-crunch 2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:55px 90px;}' +
  '@keyframes co-crunch{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-44deg)}}',

  // Suelo
  '<line x1="8" y1="128" x2="112" y2="128" stroke="' + C.floor + '" stroke-width="2"/>' +
  // Pelvis y piernas (estáticas, acostado con rodillas dobladas)
  '<rect x="40" y="106" width="36" height="12" rx="6" fill="' + C.light + '" opacity="0.5"/>' + // pelvis
  '<line x1="52" y1="112" x2="38" y2="96" ' + SB + '/>' +  // muslo izq
  '<line x1="64" y1="112" x2="78" y2="96" ' + SB + '/>' +  // muslo der
  '<line x1="38" y1="96" x2="40" y2="126" ' + SB + '/>' +  // espinilla izq
  '<line x1="78" y1="96" x2="80" y2="126" ' + SB + '/>' +  // espinilla der
  // Abdominal highlight
  '<rect x="36" y="82" width="42" height="20" rx="8" fill="' + C.muscle + '"/>' +
  // Torso superior + cabeza (animado: se dobla hacia arriba en crunch)
  '<g class="co-up">' +
  '<line x1="55" y1="90" x2="55" y2="62" ' + SB + '/>' +   // torso
  '<circle cx="55" cy="52" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' + // cabeza
  '<line x1="55" y1="76" x2="44" y2="68" ' + SB + '/>' +   // brazo cruzado izq
  '<line x1="55" y1="76" x2="66" y2="68" ' + SB + '/>' +   // brazo cruzado der
  '</g>'
);

// ════════════════════════════════════════════════════════════
// CARDIO / RUNNING — Vista lateral, piernas alternas
// ════════════════════════════════════════════════════════════
ANIMS.cardio = S(
  '.ca-leg-f{animation:ca-legf 0.65s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:56px 72px;}' +
  '@keyframes ca-legf{0%,100%{transform:rotate(28deg)}50%{transform:rotate(-24deg)}}' +
  '.ca-leg-b{animation:ca-legb 0.65s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:56px 72px;}' +
  '@keyframes ca-legb{0%,100%{transform:rotate(-24deg)}50%{transform:rotate(28deg)}}' +
  '.ca-arm-f{animation:ca-armf 0.65s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:56px 42px;}' +
  '@keyframes ca-armf{0%,100%{transform:rotate(-28deg)}50%{transform:rotate(22deg)}}' +
  '.ca-arm-b{animation:ca-armb 0.65s cubic-bezier(0.45,0.05,0.55,0.95) infinite;transform-origin:56px 42px;}' +
  '@keyframes ca-armb{0%,100%{transform:rotate(22deg)}50%{transform:rotate(-28deg)}}',

  '<line x1="8" y1="132" x2="112" y2="132" stroke="' + C.floor + '" stroke-width="2"/>' +
  // Cabeza y torso (estáticos, ligeramente inclinados)
  '<circle cx="60" cy="12" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' +
  '<line x1="60" y1="22" x2="56" y2="44" ' + SB + '/>' +
  '<line x1="56" y1="44" x2="56" y2="72" ' + SB + '/>' +
  // Brazo delantero (doblado ~90°, alternante)
  '<g class="ca-arm-f">' +
  '<line x1="56" y1="42" x2="40" y2="58" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '<line x1="40" y1="58" x2="28" y2="50" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '</g>' +
  // Brazo trasero
  '<g class="ca-arm-b">' +
  '<line x1="56" y1="42" x2="72" y2="58" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '<line x1="72" y1="58" x2="84" y2="50" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '</g>' +
  // Pierna delantera (rodilla levantada)
  '<g class="ca-leg-f">' +
  '<line x1="56" y1="72" x2="42" y2="98" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '<line x1="42" y1="98" x2="30" y2="120" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '</g>' +
  // Pierna trasera (extendida atrás)
  '<g class="ca-leg-b">' +
  '<line x1="56" y1="72" x2="68" y2="98" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '<line x1="68" y1="98" x2="80" y2="122" stroke="' + C.body + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
  '</g>'
);

// ════════════════════════════════════════════════════════════
// LUNGE — Vista lateral, zancada frontal
// ════════════════════════════════════════════════════════════
ANIMS.lunge = S(
  '.lu-body{animation:lu-down 2s cubic-bezier(0.45,0.05,0.55,0.95) infinite;}' +
  '@keyframes lu-down{0%,100%{transform:translateY(0)}50%{transform:translateY(16px)}}',

  '<line x1="8" y1="132" x2="112" y2="132" stroke="' + C.floor + '" stroke-width="2"/>' +
  // Pierna trasera (estática)
  '<line x1="60" y1="80" x2="80" y2="110" ' + SB + '/>' +
  '<line x1="80" y1="110" x2="82" y2="132" ' + SB + '/>' +
  // Cuerpo completo baja con la zancada
  '<g class="lu-body">' +
  '<circle cx="50" cy="12" r="9" fill="none" stroke="' + C.body + '" stroke-width="3"/>' +
  '<line x1="50" y1="22" x2="52" y2="60" ' + SB + '/>' +
  '<line x1="52" y1="34" x2="40" y2="50" stroke="' + C.body + '" stroke-width="2.5" stroke-linecap="round" fill="none"/>' + // brazo
  '<line x1="52" y1="34" x2="64" y2="50" stroke="' + C.body + '" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
  // Pierna delantera (muslo va adelante)
  '<line x1="52" y1="60" x2="34" y2="94" ' + SB + '/>' +  // muslo
  '<line x1="34" y1="94" x2="32" y2="132" ' + SB + '/>' +  // espinilla
  '<line x1="14" y1="132" x2="48" y2="132" ' + SB + '/>' + // pie
  // Muslo trasero (desde cadera)
  '<line x1="52" y1="60" x2="62" y2="80" ' + SB + '/>' +
  // Glúteos/cuádriceps highlight
  '<ellipse cx="48" cy="76" rx="16" ry="14" fill="' + C.muscle + '"/>' +
  '</g>'
);

// ════════════════════════════════════════════════════════════
// DEFAULT — Mancuerna sube y baja
// ════════════════════════════════════════════════════════════
ANIMS.default = S(
  '.df-db{animation:df-up 1.6s cubic-bezier(0.45,0.05,0.55,0.95) infinite;}' +
  '@keyframes df-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}' +
  '.df-sh{animation:df-shadow 1.6s cubic-bezier(0.45,0.05,0.55,0.95) infinite;}' +
  '@keyframes df-shadow{0%,100%{transform:scaleX(1);opacity:0.3}50%{transform:scaleX(1.6);opacity:0.12}}',

  // Sombra (se achica al subir)
  '<ellipse class="df-sh" cx="60" cy="118" rx="22" ry="5" fill="#9CA3AF"/>' +
  // Mancuerna (sube y baja)
  '<g class="df-db">' +
  '<rect x="36" y="58" width="48" height="18" rx="7" fill="' + C.accent + '"/>' +
  '<rect x="22" y="50" width="18" height="34" rx="7" fill="' + C.dark + '"/>' +
  '<rect x="80" y="50" width="18" height="34" rx="7" fill="' + C.dark + '"/>' +
  '<rect x="36" y="60" width="48" height="4" rx="2" fill="rgba(255,255,255,0.25)"/>' + // brillo
  '</g>' +
  // Flecha dirección
  '<line x1="60" y1="16" x2="60" y2="36" stroke="' + C.accent + '" stroke-width="2.5" stroke-linecap="round"/>' +
  '<polyline points="52,24 60,14 68,24" fill="none" stroke="' + C.accent + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
);

// ── LOOKUP ─────────────────────────────────────────────────
function norm(s){
  return (s||'').toLowerCase()
    .replace(/[áà]/g,'a').replace(/[éè]/g,'e').replace(/[íì]/g,'i')
    .replace(/[óò]/g,'o').replace(/[úù]/g,'u').replace(/ñ/g,'n');
}

window.getEjercicioSVG = function(nombre){
  var n = norm(nombre);
  var h = function(k){ return n.indexOf(k) !== -1; };
  if(h('hombro')||h('shoulder')||h('lateral')||h('elevaci')||h('deltoid')) return ANIMS.shoulder;
  if(h('militar')||h('ohp')||h('press arriba')||h('overhead')) return ANIMS.ohp;
  if(h('press')||h('pecho')||h('chest')||h('fondo')||h('dip')||h('push')) return ANIMS.press;
  if(h('squat')||h('sentadilla')||h('cuclilla')||h('leg press')) return ANIMS.squat;
  if(h('deadlift')||h('peso muerto')||h('sumo')||h('rdl')||h('bisagra')||h('hip hinge')) return ANIMS.deadlift;
  if(h('curl')||h('bicep')||h('rosca')) return ANIMS.curl;
  if(h('jalon')||h('jal')||h('dominad')||h('pull')||h('polea')) return ANIMS.pull;
  if(h('remo')||h('row')||h('espalda')) return ANIMS.row;
  if(h('tricep')||h('extensi')||h('pushdown')||h('fondos')) return ANIMS.press;
  if(h('plancha')||h('plank')||h('core')||h('abdomen')||h('crunch')||h('sit')||h('oblicuo')) return ANIMS.core;
  if(h('cardio')||h('correr')||h('running')||h('bicicleta')||h('salto')||h('sprint')||h('caminata')||h('hiit')) return ANIMS.cardio;
  if(h('lunge')||h('zancada')||h('step')) return ANIMS.lunge;
  return ANIMS.default;
};

window.getEjercicioTecnica = function(nombre){
  var n = norm(nombre);
  var h = function(k){ return n.indexOf(k) !== -1; };
  if(h('hombro')||h('shoulder')||h('lateral')||h('elevaci')||h('deltoid')||h('militar')||h('ohp')||h('overhead')) return TECNICA_EJ.shoulder;
  if(h('press')||h('pecho')||h('chest')||h('fondo')||h('dip')||h('push')) return TECNICA_EJ.press;
  if(h('squat')||h('sentadilla')||h('cuclilla')||h('leg press')) return TECNICA_EJ.squat;
  if(h('deadlift')||h('peso muerto')||h('sumo')||h('rdl')||h('bisagra')) return TECNICA_EJ.deadlift;
  if(h('curl')||h('bicep')||h('rosca')) return TECNICA_EJ.curl;
  if(h('jalon')||h('jal')||h('dominad')||h('pull')||h('polea')) return TECNICA_EJ.pull;
  if(h('remo')||h('row')||h('espalda')) return TECNICA_EJ.row;
  if(h('plancha')||h('plank')||h('core')||h('abdomen')||h('crunch')||h('sit')||h('oblicuo')) return TECNICA_EJ.core;
  if(h('cardio')||h('correr')||h('running')||h('bicicleta')||h('salto')||h('sprint')||h('caminata')||h('hiit')) return TECNICA_EJ.cardio;
  if(h('lunge')||h('zancada')||h('step')) return TECNICA_EJ.lunge;
  if(h('tricep')||h('extensi')||h('pushdown')) return TECNICA_EJ.pull;
  return TECNICA_EJ.default;
};

})();

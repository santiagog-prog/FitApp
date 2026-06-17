// ════════════════════════════════════════════════════════════
// db.js — capa de datos localStorage. IIFE puro, sin dependencias.
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";
  var PREFIX = "fitapp_";

  function get(key){ try{ return JSON.parse(localStorage.getItem(PREFIX + key)); }catch(e){ return null; } }
  function set(key, val){ try{ localStorage.setItem(PREFIX + key, JSON.stringify(val)); return true; }catch(e){ return false; } }

  var MEDALLAS_DEF = [
    { id:"primera_llama", icono:"🔥", nombre:"Primera llama" },
    { id:"racha_3", icono:"📅", nombre:"3 seguidos" },
    { id:"semana_completa", icono:"📅", nombre:"Semana completa" },
    { id:"mes_fuego", icono:"📅", nombre:"Mes de fuego" },
    { id:"hidratado", icono:"💧", nombre:"Hidratado" },
    { id:"decimo_entreno", icono:"🏋️", nombre:"Décimo entreno" },
    { id:"cincuenton", icono:"🏋️", nombre:"Cincuentón" },
    { id:"primera_bajada", icono:"📉", nombre:"Primera bajada" },
    { id:"me_mido", icono:"📏", nombre:"Me mido" },
    { id:"madrugador", icono:"🌅", nombre:"Madrugador" },
    { id:"noctambulo", icono:"🌙", nombre:"Noctámbulo" },
    { id:"semana_limpia", icono:"🥗", nombre:"Semana limpia" },
    { id:"mes_completo", icono:"💪", nombre:"Mes completo" },
    { id:"elite", icono:"🏆", nombre:"Élite" }
  ];

  function generarId(prefix){ return (prefix||"id") + "_" + Date.now() + "_" + Math.random().toString(36).substr(2,5); }
  function fechaHoy(){ return new Date().toISOString().split("T")[0]; }

  var ALIMENTOS_COMUNES = [
    { nombre:"Arroz blanco cocido", cantidad:"150g", calorias:195, proteina:4, carbos:43, grasas:0, icono:"🍚" },
    { nombre:"Pechuga de pollo a la plancha", cantidad:"150g", calorias:165, proteina:33, carbos:0, grasas:4, icono:"🍗" },
    { nombre:"Huevo cocido", cantidad:"50g", calorias:74, proteina:6, carbos:0, grasas:5, icono:"🥚" },
    { nombre:"Plátano", cantidad:"120g", calorias:108, proteina:1, carbos:28, grasas:0, icono:"🍌" },
    { nombre:"Ensalada mixta", cantidad:"100g", calorias:25, proteina:2, carbos:5, grasas:0, icono:"🥗" },
    { nombre:"Pan integral", cantidad:"60g", calorias:150, proteina:6, carbos:28, grasas:2, icono:"🍞" },
    { nombre:"Avena cocida", cantidad:"200g", calorias:150, proteina:5, carbos:27, grasas:3, icono:"🥣" },
    { nombre:"Atún en agua", cantidad:"150g", calorias:150, proteina:33, carbos:0, grasas:1, icono:"🐟" },
    { nombre:"Papa cocida", cantidad:"200g", calorias:154, proteina:4, carbos:36, grasas:0, icono:"🥔" },
    { nombre:"Yogur natural", cantidad:"150g", calorias:90, proteina:8, carbos:10, grasas:2, icono:"🥛" },
    { nombre:"Batido de proteína", cantidad:"30g", calorias:120, proteina:24, carbos:3, grasas:1, icono:"🥤" },
    { nombre:"Aguacate", cantidad:"100g", calorias:160, proteina:2, carbos:9, grasas:15, icono:"🥑" },
    { nombre:"Frutos secos mixtos", cantidad:"30g", calorias:175, proteina:6, carbos:6, grasas:15, icono:"🥜" },
    { nombre:"Pizza (porción)", cantidad:"150g", calorias:380, proteina:15, carbos:42, grasas:17, icono:"🍕" },
    { nombre:"Hamburguesa", cantidad:"200g", calorias:540, proteina:28, carbos:38, grasas:30, icono:"🍔" },
    { nombre:"Ensalada de frutas", cantidad:"150g", calorias:80, proteina:1, carbos:20, grasas:0, icono:"🍓" }
  ];

  var HABITOS_ICONOS = { correr:"🏃", leer:"📖", meditar:"🧘", agua:"💧", dormir:"😴", suplemento:"💊", movilidad:"🤸", sin_azucar:"🚫", escribir:"✍️", caminar:"🚶", estudiar:"📚", default:"✅" };
  var HABITOS_ICONOS_SVG = {
    agua: "<path d='M12 3s7 7.5 7 12a7 7 0 1 1-14 0c0-4.5 7-12 7-12z'/>",
    dormir: "<path d='M21 12.5A8.5 8.5 0 1 1 11.5 3 7 7 0 0 0 21 12.5z'/>",
    suplemento: "<rect x='4' y='10' width='16' height='4' rx='2'/><path d='M9 9v6M15 9v6'/>",
    movilidad: "<circle cx='12' cy='5' r='2'/><path d='M12 7v6M12 13l-4 4M12 13l4 4M8 9l-3 2M16 9l3 2'/>",
    sin_azucar: "<rect x='6' y='6' width='12' height='12' rx='2'/><path d='M4 4l16 16'/>",
    correr: "<circle cx='14' cy='4' r='2'/><path d='M14 6l-3 5 3 2 1 5M11 11l-4 1M9 13l-2 6M15 13l3 3-1 4'/>",
    leer: "<path d='M4 5h7a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z'/><path d='M20 5h-7a3 3 0 0 0-3 3v11a3 3 0 0 1 3-3h7z'/>",
    meditar: "<circle cx='12' cy='5' r='2'/><path d='M12 7v4M6 17c2-3 4-4 6-4s4 1 6 4M8 17h8'/>",
    ahorrar: "<circle cx='12' cy='12' r='8'/><path d='M12 8v8M9.5 10.5h5M9.5 13.5h5'/>",
    escribir: "<path d='M4 20l4-1 11-11-3-3L5 16l-1 4z'/>",
    caminar: "<circle cx='13' cy='4' r='2'/><path d='M13 6l-2 5 3 2v6M11 11l-4 1M8 13l-2 6'/>",
    estudiar: "<path d='M12 3l9 5-9 5-9-5 9-5z'/><path d='M7 11v4c0 1.5 2 3 5 3s5-1.5 5-3v-4'/>",
    default: "<circle cx='12' cy='12' r='9'/><path d='M8 12l3 3 5-6'/>"
  };

  function ytEmbed(url){
    if(!url) return null;
    var m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if(m) return "https://www.youtube.com/embed/" + m[1];
    return null;
  }

  window.db = {
    MEDALLAS_DEF: MEDALLAS_DEF,
    generarId: generarId,
    fechaHoy: fechaHoy,
    ytEmbed: ytEmbed,

    getAlumnos: function(){ return get("alumnos") || []; },
    saveAlumno: function(a){
      var list = this.getAlumnos();
      var idx = list.findIndex(function(x){ return x.id === a.id; });
      if(idx >= 0) list[idx] = a; else list.push(a);
      return set("alumnos", list);
    },
    getAlumnoPorCodigo: function(c){ return this.getAlumnos().filter(function(a){ return a.codigo === c; })[0] || null; },
    getAlumnoPorId: function(id){ return this.getAlumnos().filter(function(a){ return a.id === id; })[0] || null; },
    deleteAlumno: function(id){ return set("alumnos", this.getAlumnos().filter(function(a){ return a.id !== id; })); },

    getRutinas: function(){ return get("rutinas") || []; },
    saveRutina: function(r){
      var list = this.getRutinas();
      var idx = list.findIndex(function(x){ return x.id === r.id; });
      if(idx >= 0) list[idx] = r; else list.push(r);
      return set("rutinas", list);
    },
    getRutinaPorId: function(id){ return this.getRutinas().filter(function(r){ return r.id === id; })[0] || null; },
    deleteRutina: function(id){ return set("rutinas", this.getRutinas().filter(function(r){ return r.id !== id; })); },

    getPlanes: function(){ return get("planes") || []; },
    savePlan: function(p){
      var list = this.getPlanes();
      var idx = list.findIndex(function(x){ return x.id === p.id; });
      if(idx >= 0) list[idx] = p; else list.push(p);
      return set("planes", list);
    },
    getPlanPorId: function(id){ return this.getPlanes().filter(function(p){ return p.id === id; })[0] || null; },
    deletePlan: function(id){ return set("planes", this.getPlanes().filter(function(p){ return p.id !== id; })); },

    getEjercicios: function(){ return get("ejercicios") || window.EJERCICIOS_DEFAULT || []; },
    saveEjercicio: function(e){
      var list = this.getEjercicios();
      var idx = list.findIndex(function(x){ return x.id === e.id; });
      if(idx >= 0) list[idx] = e; else list.push(e);
      return set("ejercicios", list);
    },

    getRegistros: function(alumnoId){ return get("registros_" + alumnoId) || []; },
    saveRegistro: function(alumnoId, reg){
      var list = this.getRegistros(alumnoId);
      list.push(reg);
      set("registros_" + alumnoId, list);
      return this.checkMedallas(alumnoId);
    },

    getPesos: function(alumnoId){ return get("pesos_" + alumnoId) || []; },
    savePeso: function(alumnoId, peso){
      var list = this.getPesos(alumnoId);
      list.push(peso);
      return set("pesos_" + alumnoId, list);
    },

    getMedidas: function(alumnoId){ return get("medidas_" + alumnoId) || []; },
    saveMedidas: function(alumnoId, m){
      var list = this.getMedidas(alumnoId);
      list.push(m);
      return set("medidas_" + alumnoId, list);
    },

    getNutricion: function(alumnoId, fecha){ return get("nutricion_" + alumnoId + "_" + fecha) || { opciones: {}, agua: 0 }; },
    saveNutricion: function(alumnoId, fecha, datos){ return set("nutricion_" + alumnoId + "_" + fecha, datos); },

    getMedallas: function(alumnoId){ return get("medallas_" + alumnoId) || []; },
    desbloquearMedalla: function(alumnoId, medallaId){
      var list = this.getMedallas(alumnoId);
      if(list.indexOf(medallaId) === -1){ list.push(medallaId); set("medallas_" + alumnoId, list); return true; }
      return false;
    },

    getNotas: function(alumnoId){ return get("notas_" + alumnoId) || []; },
    saveNota: function(alumnoId, nota){
      var list = this.getNotas(alumnoId);
      list.push(nota);
      return set("notas_" + alumnoId, list);
    },
    marcarNotasLeidas: function(alumnoId){
      var list = this.getNotas(alumnoId).map(function(n){ n.leida = true; return n; });
      return set("notas_" + alumnoId, list);
    },

    getGymInfo: function(){ return get("gym_info") || { activo: false }; },
    saveGymInfo: function(info){ return set("gym_info", info); },

    ALIMENTOS_COMUNES: ALIMENTOS_COMUNES,
    HABITOS_ICONOS: HABITOS_ICONOS,
    HABITOS_ICONOS_SVG: HABITOS_ICONOS_SVG,

    getFotos: function(alumnoId){ return get("fotos_" + alumnoId) || []; },
    saveFoto: function(alumnoId, foto){
      var list = this.getFotos(alumnoId);
      list.push(foto);
      return set("fotos_" + alumnoId, list);
    },
    deleteFoto: function(alumnoId, id){
      return set("fotos_" + alumnoId, this.getFotos(alumnoId).filter(function(f){ return f.id !== id; }));
    },

    getHabitos: function(alumnoId){ return get("habitos_" + alumnoId) || []; },
    saveHabito: function(alumnoId, habito){
      var list = this.getHabitos(alumnoId);
      var idx = list.findIndex(function(h){ return h.id === habito.id; });
      if(idx >= 0) list[idx] = habito; else list.push(habito);
      return set("habitos_" + alumnoId, list);
    },
    deleteHabito: function(alumnoId, id){
      return set("habitos_" + alumnoId, this.getHabitos(alumnoId).filter(function(h){ return h.id !== id; }));
    },
    getHabitoChecks: function(alumnoId){ return get("habito_checks_" + alumnoId) || {}; },
    toggleHabitoCheck: function(alumnoId, habitoId, fecha){
      var checks = this.getHabitoChecks(alumnoId);
      if(!checks[fecha]) checks[fecha] = {};
      checks[fecha][habitoId] = !checks[fecha][habitoId];
      set("habito_checks_" + alumnoId, checks);
      return checks[fecha][habitoId];
    },
    calcularRachaHabito: function(alumnoId, habitoId){
      var checks = this.getHabitoChecks(alumnoId);
      var fechas = Object.keys(checks).filter(function(f){ return checks[f][habitoId]; }).sort().reverse();
      if(fechas.length === 0) return 0;
      var racha = 1;
      for(var i=0; i<fechas.length-1; i++){
        var diff = (new Date(fechas[i]) - new Date(fechas[i+1])) / 86400000;
        if(diff === 1) racha++; else break;
      }
      return racha;
    },

    getNutricionExtras: function(alumnoId, fecha){
      var data = this.getNutricion(alumnoId, fecha);
      return data.extras || [];
    },
    saveNutricionExtra: function(alumnoId, fecha, extra){
      var data = this.getNutricion(alumnoId, fecha);
      if(!data.extras) data.extras = [];
      data.extras.push(extra);
      this.saveNutricion(alumnoId, fecha, data);
      return data;
    },

    getApiKeyAnthropic: function(){ try{ return localStorage.getItem(PREFIX + "anthropic_key") || ""; }catch(e){ return ""; } },
    setApiKeyAnthropic: function(key){ try{ localStorage.setItem(PREFIX + "anthropic_key", key); return true; }catch(e){ return false; } },

    getAlumnoActual: function(){ return get("alumno_actual"); },
    setAlumnoActual: function(id){ return set("alumno_actual", id); },
    clearSesion: function(){ localStorage.removeItem(PREFIX + "alumno_actual"); },

    calcularRacha: function(alumnoId){
      var registros = this.getRegistros(alumnoId);
      if(registros.length === 0) return 0;
      var fechas = registros.map(function(r){ return r.fecha; });
      fechas = fechas.filter(function(f, i){ return fechas.indexOf(f) === i; }).sort().reverse();
      var racha = 1;
      for(var i=0; i<fechas.length-1; i++){
        var d1 = new Date(fechas[i]), d2 = new Date(fechas[i+1]);
        var diff = (d1 - d2) / 86400000;
        if(diff === 1) racha++; else break;
      }
      return racha;
    },

    checkMedallas: function(alumnoId){
      var self = this;
      var registros = this.getRegistros(alumnoId);
      var nuevas = [];
      if(registros.length >= 1 && self.desbloquearMedalla(alumnoId, "primera_llama")) nuevas.push("primera_llama");
      if(registros.length >= 10 && self.desbloquearMedalla(alumnoId, "decimo_entreno")) nuevas.push("decimo_entreno");
      if(registros.length >= 50 && self.desbloquearMedalla(alumnoId, "cincuenton")) nuevas.push("cincuenton");
      if(this.getMedidas(alumnoId).length >= 1 && self.desbloquearMedalla(alumnoId, "me_mido")) nuevas.push("me_mido");
      var racha = this.calcularRacha(alumnoId);
      if(racha >= 3 && self.desbloquearMedalla(alumnoId, "racha_3")) nuevas.push("racha_3");
      if(racha >= 7 && self.desbloquearMedalla(alumnoId, "semana_completa")) nuevas.push("semana_completa");
      if(racha >= 30 && self.desbloquearMedalla(alumnoId, "mes_fuego")) nuevas.push("mes_fuego");
      if(racha >= 60 && self.desbloquearMedalla(alumnoId, "elite")) nuevas.push("elite");
      return nuevas;
    },

    seedDemo: function(){
      if(this.getAlumnos().length > 0) return;

      var rutina = {
        id: "r_demo1", nombre: "PPL-TP 1 - Santiago",
        descripcion: "Push Pull Legs + Torso Pierna para principiante",
        objetivo: "ganancia_muscular", nivel: "principiante", duracion_semanas: 4,
        mesociclo: "Mesociclo 1 – Push Pull Legs + Torso Pierna – Principiante – 4 semanas",
        dias: [
          { numero:1, nombre:"PUSH - Pecho y Hombros", tipo:"fuerza", ejercicios:[
            { id:"ej_1", nombre:"Press militar en máquina", grupo:"Hombros", series:3, repeticiones:"12/RIR 2", descanso_seg:120, nota_tecnica:"Postura firme, sin balanceo", como_hacer:"1. Ajusta el asiento para que el agarre quede a la altura de los hombros.\n2. Espalda pegada al respaldo, pies firmes en el suelo.\n3. Empuja el agarre hacia arriba sin bloquear los codos del todo.\n4. Baja controlado hasta que el agarre quede a la altura de las orejas.", video_url:"", foto:"" , sets:[{reps:12,peso:30},{reps:12,peso:25},{reps:10,peso:25}] },
            { id:"ej_2", nombre:"Press ligeramente inclinado con mancuerna", grupo:"Pecho", series:2, repeticiones:"12/RIR 1-2", descanso_seg:120, nota_tecnica:"Movimiento limpio, sin rebote", como_hacer:"1. Banco inclinado 15-30°.\n2. Mancuernas a la altura del pecho, codos a 45° del torso.\n3. Empuja hacia arriba sin chocar las mancuernas.\n4. Baja controlado hasta sentir estiramiento en el pecho.", video_url:"", foto:"", sets:[{reps:10,peso:25},{reps:10,peso:25}] },
            { id:"ej_3", nombre:"Peck Deck", grupo:"Pecho", series:2, repeticiones:"12-15/RIR 1", descanso_seg:90, nota_tecnica:"Rango completo, contracción en el pico", como_hacer:"1. Espalda pegada al respaldo, codos ligeramente flexionados.\n2. Junta los brazos al frente apretando el pecho.\n3. Aguanta 1 segundo en la contracción.\n4. Vuelve controlado sin dejar caer el peso.", video_url:"", foto:"", sets:[{reps:13,peso:20},{reps:12,peso:18}] },
            { id:"ej_4", nombre:"Elevaciones laterales en máquina", grupo:"Hombros", series:3, repeticiones:"15/RIR 1", descanso_seg:90, nota_tecnica:"Codos ligeramente flexionados", como_hacer:"1. Codo apoyado en el cojín de la máquina.\n2. Eleva el brazo lateralmente hasta la altura del hombro.\n3. No uses impulso del cuerpo.\n4. Baja controlado sin soltar el peso de golpe.", video_url:"https://www.youtube.com/watch?v=3VcKaXpzqRo", foto:"", sets:[{reps:15,peso:8},{reps:15,peso:8},{reps:12,peso:6}] }
          ]},
          { numero:2, nombre:"PULL - Espalda y Bíceps", tipo:"fuerza", ejercicios:[
            { id:"ej_5", nombre:"Jalón al pecho agarre prono", grupo:"Espalda", series:3, repeticiones:"10-12/RIR 2", descanso_seg:120, nota_tecnica:"Pecho arriba, omóplatos juntos al bajar", como_hacer:"1. Agarre un poco más ancho que los hombros.\n2. Pecho arriba, ligera inclinación hacia atrás.\n3. Lleva la barra hacia la parte alta del pecho juntando los omóplatos.\n4. Sube controlado sin balancear el torso.", video_url:"", foto:"", sets:[{reps:12,peso:40},{reps:11,peso:40},{reps:10,peso:35}] },
            { id:"ej_6", nombre:"Remo con mancuerna", grupo:"Espalda", series:3, repeticiones:"10/RIR 2", descanso_seg:90, nota_tecnica:"Espalda paralela al suelo, sin rotar el torso", como_hacer:"1. Apoya una mano y rodilla en el banco.\n2. Espalda recta y paralela al suelo.\n3. Lleva el codo hacia atrás apretando el omóplato.\n4. Baja controlado sin rotar el torso.", video_url:"", foto:"", sets:[{reps:10,peso:18},{reps:10,peso:18},{reps:10,peso:16}] },
            { id:"ej_7", nombre:"Curl con barra", grupo:"Bíceps", series:3, repeticiones:"12/RIR 1", descanso_seg:90, nota_tecnica:"Sin balanceo de cuerpo, codos fijos", como_hacer:"1. Agarre supino, manos a la anchura de los hombros.\n2. Codos pegados al torso durante todo el recorrido.\n3. Sube la barra contrayendo el bíceps.\n4. Baja controlado sin extender de golpe.", video_url:"", foto:"", sets:[{reps:12,peso:15},{reps:12,peso:15},{reps:10,peso:12}] }
          ]},
          { numero:3, nombre:"LEGS - Piernas", tipo:"fuerza", ejercicios:[
            { id:"ej_8", nombre:"Sentadilla con barra", grupo:"Cuádriceps", series:4, repeticiones:"8-10/RIR 2", descanso_seg:150, nota_tecnica:"Rodillas alineadas con pies, descenso controlado", como_hacer:"1. Barra apoyada en la parte alta de la espalda (trapecio).\n2. Pies a la anchura de los hombros, puntas ligeramente afuera.\n3. Baja controlado manteniendo el pecho arriba y rodillas alineadas con los pies.\n4. Sube empujando con los talones.", video_url:"https://www.youtube.com/watch?v=Dy58u-N5fQ0", foto:"", sets:[{reps:10,peso:50},{reps:9,peso:50},{reps:8,peso:55},{reps:8,peso:55}] },
            { id:"ej_9", nombre:"Prensa de piernas", grupo:"Cuádriceps", series:3, repeticiones:"12/RIR 1", descanso_seg:120, nota_tecnica:"No bloquear rodillas al extender", como_hacer:"1. Pies a la anchura de los hombros en la plataforma.\n2. Baja controlado hasta 90° de flexión de rodilla.\n3. Empuja sin bloquear completamente las rodillas arriba.\n4. Mantén la zona lumbar pegada al respaldo.", video_url:"", foto:"", sets:[{reps:12,peso:80},{reps:12,peso:80},{reps:10,peso:90}] },
            { id:"ej_10", nombre:"Hip thrust con barra", grupo:"Glúteos", series:3, repeticiones:"12-15/RIR 1", descanso_seg:90, nota_tecnica:"Cadera completa arriba, contracción en el pico", como_hacer:"1. Espalda alta apoyada en el banco, barra sobre la cadera.\n2. Pies firmes, rodillas a 90°.\n3. Empuja la cadera hacia arriba apretando el glúteo.\n4. Baja controlado sin tocar el suelo con la cadera.", video_url:"", foto:"", sets:[{reps:15,peso:40},{reps:14,peso:40},{reps:12,peso:45}] }
          ]},
          { numero:4, nombre:"Descanso activo", tipo:"descanso", ejercicios:[] }
        ]
      };

      var plan = {
        id: "p_demo1", nombre: "Plan de alimentación Santiago Guamán",
        objetivo: "ganancia_muscular", calorias_objetivo: 2500,
        macros: { proteina:170, carbohidratos:280, grasas:75 },
        descripcion: "Santi, en esta etapa el enfoque estará puesto en fortalecer progresivamente la masa muscular y disminuir grasa corporal de forma sostenida.",
        comidas: [
          { nombre:"Desayuno", hora:"07:30",
            descripcion:"Opción 1 (lunes a viernes): Humita + huevo + jamón de pavo + piña con granola. Opción 2 (fin de semana): plátano + huevo + queso fresco + uvas.",
            opciones: [
              { nombre:"Opción 1", dias:[0,1,2,3,4], calorias_total:603, alimentos:[
                { nombre:"Humita", cantidad:"140g", calorias:215, proteina:5, carbos:42, grasas:4 },
                { nombre:"QUESO FRESCO BAJO EN GRASA - LA HOLANDESA", cantidad:"15g", calorias:30, proteina:4, carbos:0, grasas:1.5 },
                { nombre:"Huevo de gallina fresco", cantidad:"50g", calorias:74, proteina:6, carbos:0, grasas:5 },
                { nombre:"JAMON DE PECHUGA DE PAVO AHUMADO MARCA MR. PAVO", cantidad:"70g", calorias:140, proteina:18, carbos:2, grasas:6 },
                { nombre:"Piña", cantidad:"150g", calorias:72, proteina:1, carbos:19, grasas:0 },
                { nombre:"GRANOLA CROCANTE MARCA EL TOKTE", cantidad:"15g", calorias:72, proteina:2, carbos:11, grasas:2.5 },
                { nombre:"CREATINA", cantidad:"5g", calorias:0, proteina:0, carbos:0, grasas:0 }
              ]},
              { nombre:"Opción 2", dias:[5,6], calorias_total:533, alimentos:[
                { nombre:"Plátano Maduro", cantidad:"140g", calorias:125, proteina:1, carbos:32, grasas:0 },
                { nombre:"Huevo", cantidad:"150g", calorias:222, proteina:18, carbos:0, grasas:15 },
                { nombre:"QUESO FRESCO BAJO EN GRASA - LA HOLANDESA", cantidad:"55g", calorias:110, proteina:14, carbos:0, grasas:5 },
                { nombre:"Uvas Verdes", cantidad:"50g", calorias:35, proteina:0, carbos:9, grasas:0 },
                { nombre:"CREATINA", cantidad:"5g", calorias:0, proteina:0, carbos:0, grasas:0 }
              ]}
            ]
          },
          { nombre:"Almuerzo", hora:"13:00",
            descripcion:"Opción 1 (lunes, miércoles, viernes): arroz + pollo + brócoli. Opción 2 (martes y jueves): quinua + pescado + ensalada.",
            opciones: [
              { nombre:"Opción 1", dias:[0,2,4,5,6], calorias_total:515, alimentos:[
                { nombre:"Arroz cocido", cantidad:"150g", calorias:195, proteina:4, carbos:43, grasas:0 },
                { nombre:"Pechuga de pollo a la plancha", cantidad:"180g", calorias:198, proteina:40, carbos:0, grasas:4 },
                { nombre:"Brócoli al vapor", cantidad:"100g", calorias:34, proteina:3, carbos:7, grasas:0 },
                { nombre:"Aceite de oliva", cantidad:"10ml", calorias:88, proteina:0, carbos:0, grasas:10 }
              ]},
              { nombre:"Opción 2", dias:[1,3], calorias_total:478, alimentos:[
                { nombre:"Quinua cocida", cantidad:"150g", calorias:170, proteina:6, carbos:32, grasas:2 },
                { nombre:"Filete de pescado blanco", cantidad:"180g", calorias:190, proteina:38, carbos:0, grasas:3 },
                { nombre:"Ensalada mixta", cantidad:"120g", calorias:30, proteina:2, carbos:5, grasas:0 },
                { nombre:"Aceite de oliva", cantidad:"10ml", calorias:88, proteina:0, carbos:0, grasas:10 }
              ]}
            ]
          },
          { nombre:"Post-entreno", hora:"18:30",
            descripcion:"Opción 1: proteína de suero + plátano.",
            opciones: [
              { nombre:"Opción 1", calorias_total:248, alimentos:[
                { nombre:"Proteína de suero (whey)", cantidad:"35g", calorias:140, proteina:30, carbos:5, grasas:2 },
                { nombre:"Plátano", cantidad:"120g", calorias:108, proteina:1, carbos:28, grasas:0 }
              ]}
            ]
          },
          { nombre:"Cena", hora:"20:00",
            descripcion:"Opción 1: atún + papa + ensalada.",
            opciones: [
              { nombre:"Opción 1", calorias_total:334, alimentos:[
                { nombre:"Atún en agua", cantidad:"150g", calorias:150, proteina:33, carbos:0, grasas:1 },
                { nombre:"Papa cocida", cantidad:"200g", calorias:154, proteina:4, carbos:36, grasas:0 },
                { nombre:"Ensalada mixta", cantidad:"150g", calorias:30, proteina:2, carbos:6, grasas:0 }
              ]}
            ]
          }
        ]
      };

      var alumno = {
        id:"a_demo1", codigo:"1111", nombre:"Santiago", apellido:"Guamán", edad:24, genero:"masculino",
        objetivo:"ganancia_muscular", nivel:"principiante", peso_inicial:68.5, peso_actual:70.2, altura:172,
        fecha_inicio:"2026-05-01", rutina_id:"r_demo1", plan_alimentacion_id:"p_demo1", activo:true
      };

      this.saveRutina(rutina);
      this.savePlan(plan);
      this.saveAlumno(alumno);

      var hoy = new Date();
      var pesos = [], regs = [];
      for(var i=9; i>=0; i--){
        var d = new Date(hoy); d.setDate(d.getDate() - i);
        var fecha = d.toISOString().split("T")[0];
        if(i % 3 !== 0){
          regs.push({ fecha: fecha, dia_numero: (i % 3) + 1, sesion_nombre: rutina.dias[i % 3].nombre, duracion_min: 45 + (i % 4) * 5, sensacion: 3 + (i % 3), nota:"" });
        }
        if(i % 2 === 0) pesos.push({ fecha: fecha, kg: (68.5 + (9 - i) * 0.19).toFixed(1) });
      }
      set("registros_a_demo1", regs);
      set("pesos_a_demo1", pesos);
      set("medidas_a_demo1", [{ fecha: "2026-05-01", cuello:38, pecho:96, cintura:80, cadera:94, brazo_izq:32, brazo_der:32.5, muslo_izq:54, muslo_der:54, pantorrilla:36 }]);
      set("notas_a_demo1", [{ fecha: fechaHoy(), texto:"Buena semana Santi, sigue así con la técnica del press militar.", leida:false }]);
      this.checkMedallas("a_demo1");

      var habitos = [
        { id:"h_1", nombre:"Tomar 2 litros de agua", icono:"agua", frecuencia:"diario", creado:"2026-05-01" },
        { id:"h_2", nombre:"Dormir mínimo 7 horas", icono:"dormir", frecuencia:"diario", creado:"2026-05-01" },
        { id:"h_3", nombre:"Tomar creatina", icono:"suplemento", frecuencia:"diario", creado:"2026-05-01" },
        { id:"h_4", nombre:"10 minutos de movilidad post-entreno", icono:"movilidad", frecuencia:"dias_entreno", creado:"2026-05-05" },
        { id:"h_5", nombre:"No consumir azúcar añadida", icono:"sin_azucar", frecuencia:"diario", creado:"2026-05-10" }
      ];
      habitos.forEach(function(h){ window.db.saveHabito("a_demo1", h); });
      var checks = {};
      for(var hi=6; hi>=0; hi--){
        var dh = new Date(hoy); dh.setDate(dh.getDate() - hi);
        var fh = dh.toISOString().split("T")[0];
        checks[fh] = { h_1: hi % 2 === 0, h_2: hi % 3 !== 0, h_3: true, h_4: hi % 3 === 0, h_5: hi < 4 };
      }
      set("habito_checks_a_demo1", checks);

      this.saveGymInfo({
        activo:true, nombre:"TK Fitness Gym", tagline:"Tu mejor versión empieza aquí",
        logo_url:"", direccion:"Av. Principal 123, Guayaquil, Ecuador",
        maps_url:"https://maps.google.com/?q=TK+Fitness+Gym+Guayaquil",
        telefono:"+593991234567", whatsapp:"+593991234567", instagram:"tkfitnessgym",
        horarios_atencion:[
          { dias:"Lunes a Viernes", apertura:"06:00", cierre:"22:00" },
          { dias:"Sábado", apertura:"07:00", cierre:"18:00" },
          { dias:"Domingo", apertura:"08:00", cierre:"14:00" },
          { dias:"Festivos", apertura:"09:00", cierre:"13:00" }
        ],
        clases:[
          { dia:0, hora:"08:00", nombre:"Spinning", instructor:"Carlos R.", duracion_min:45, plazas_total:20, plazas_disponibles:18, tipo:"cardio" },
          { dia:0, hora:"09:00", nombre:"Yoga Flow", instructor:"Laura M.", duracion_min:60, plazas_total:15, plazas_disponibles:12, tipo:"yoga" },
          { dia:0, hora:"18:30", nombre:"Body Pump", instructor:"Marta G.", duracion_min:55, plazas_total:20, plazas_disponibles:15, tipo:"fuerza" },
          { dia:0, hora:"20:00", nombre:"CrossFit WOD", instructor:"Sergio P.", duracion_min:60, plazas_total:12, plazas_disponibles:8, tipo:"crossfit" }
        ],
        servicios:[
          { icono:"pesas", nombre:"Sala de pesas" }, { icono:"spinning", nombre:"Spinning" },
          { icono:"yoga", nombre:"Yoga / Pilates" }, { icono:"vestuarios", nombre:"Vestuarios" },
          { icono:"suplementos", nombre:"Suplementos" }, { icono:"cardio", nombre:"Zona de cardio" }
        ],
        galeria:[],
        anuncios:[ { id:"anuncio_001", titulo:"¡Bienvenido a TK Fitness!", texto:"Estamos felices de tenerte en nuestra familia. Cualquier duda, escríbenos por WhatsApp.", fecha:"2026-06-01", destacado:true } ],
        normas:[ "Trae siempre tu toalla personal.", "Limpia el equipo después de usarlo.", "Respeta los turnos en las máquinas.", "No se permite comida en la sala de pesas.", "Guarda el teléfono durante el entrenamiento.", "El uso de auriculares es obligatorio si escuchas música." ],

        cupones:[
          { id:"cup_1", titulo:"10% en suplementos", descripcion:"Válido en tienda física del gym, no acumulable con otras promos.", descuento:"10%", codigo:"FIT10", vence:"2026-07-31" },
          { id:"cup_2", titulo:"1 clase de invitado gratis", descripcion:"Trae a un amigo a probar una clase dirigida sin costo.", descuento:"100%", codigo:"INVITADO1", vence:"2026-08-31" }
        ],
        promociones:[
          { id:"promo_1", titulo:"Verano sin pereza", descripcion:"Inscríbete este mes y tu segunda mensualidad tiene 20% de descuento.", fecha_fin:"2026-07-15", destacado:true },
          { id:"promo_2", titulo:"Pack pareja", descripcion:"Inscríbanse juntos y cada uno paga solo el 80% de la mensualidad.", fecha_fin:"2026-07-31", destacado:false }
        ],
        referidos:{
          activo:true,
          premio_referidor:"1 semana gratis de membresía",
          premio_referido:"10% de descuento en tu primera mensualidad",
          descripcion:"Comparte tu código personal con un amigo. Cuando se inscriba, ambos reciben su premio."
        },
        puntos_config:{ activo:true, puntos_por_entreno:10, texto_canje:"Acumula puntos por cada entreno y canjéalos por productos de la tienda o sesiones de masaje en recepción." }
      });
    }
  };

  window.db.seedDemo();
})();

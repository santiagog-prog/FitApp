// ════════════════════════════════════════════════════════════
// db.js — capa de datos localStorage
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";
  var PREFIX = "fitapp_";

  function get(key){ try{ return JSON.parse(localStorage.getItem(PREFIX + key)); }catch(e){ return null; } }
  function set(key, val){ try{ localStorage.setItem(PREFIX + key, JSON.stringify(val)); return true; }catch(e){ return false; } }

  var MEDALLAS_DEF = [
    { id:"primera_llama",   icono:"🔥", nombre:"Primera llama" },
    { id:"racha_3",         icono:"📅", nombre:"3 seguidos" },
    { id:"semana_completa", icono:"⚡", nombre:"Semana completa" },
    { id:"mes_fuego",       icono:"🏅", nombre:"Mes de fuego" },
    { id:"hidratado",       icono:"💧", nombre:"Hidratado" },
    { id:"decimo_entreno",  icono:"💪", nombre:"10 entrenos" },
    { id:"cincuenton",      icono:"🏆", nombre:"50 entrenos" },
    { id:"primera_bajada",  icono:"📉", nombre:"Primera bajada" },
    { id:"me_mido",         icono:"📏", nombre:"Me mido" },
    { id:"madrugador",      icono:"🌅", nombre:"Madrugador" },
    { id:"noctambulo",      icono:"🌙", nombre:"Noctámbulo" },
    { id:"semana_limpia",   icono:"🥗", nombre:"Semana limpia" },
    { id:"mes_completo",    icono:"🌟", nombre:"Mes completo" },
    { id:"elite",           icono:"👑", nombre:"Élite" }
  ];

  function generarId(prefix){ return (prefix||"id") + "_" + Date.now() + "_" + Math.random().toString(36).substr(2,5); }
  function fechaHoy(){ return new Date().toISOString().split("T")[0]; }
  function pad2(n){ return n < 10 ? "0"+n : ""+n; }

  var ALIMENTOS_COMUNES = [
    { nombre:"Arroz blanco cocido",           cantidad:"150g", calorias:195, proteina:4,  carbos:43, grasas:0,  icono:"🍚" },
    { nombre:"Pechuga de pollo a la plancha", cantidad:"150g", calorias:165, proteina:33, carbos:0,  grasas:4,  icono:"🍗" },
    { nombre:"Huevo cocido",                  cantidad:"50g",  calorias:74,  proteina:6,  carbos:0,  grasas:5,  icono:"🥚" },
    { nombre:"Plátano",                       cantidad:"120g", calorias:108, proteina:1,  carbos:28, grasas:0,  icono:"🍌" },
    { nombre:"Ensalada mixta",                cantidad:"100g", calorias:25,  proteina:2,  carbos:5,  grasas:0,  icono:"🥗" },
    { nombre:"Pan integral",                  cantidad:"60g",  calorias:150, proteina:6,  carbos:28, grasas:2,  icono:"🍞" },
    { nombre:"Avena cocida",                  cantidad:"200g", calorias:150, proteina:5,  carbos:27, grasas:3,  icono:"🥣" },
    { nombre:"Atún en agua",                  cantidad:"150g", calorias:150, proteina:33, carbos:0,  grasas:1,  icono:"🐟" },
    { nombre:"Papa cocida",                   cantidad:"200g", calorias:154, proteina:4,  carbos:36, grasas:0,  icono:"🥔" },
    { nombre:"Yogur natural",                 cantidad:"150g", calorias:90,  proteina:8,  carbos:10, grasas:2,  icono:"🥛" },
    { nombre:"Batido de proteína",            cantidad:"30g",  calorias:120, proteina:24, carbos:3,  grasas:1,  icono:"🥤" },
    { nombre:"Aguacate",                      cantidad:"100g", calorias:160, proteina:2,  carbos:9,  grasas:15, icono:"🥑" },
    { nombre:"Frutos secos mixtos",           cantidad:"30g",  calorias:175, proteina:6,  carbos:6,  grasas:15, icono:"🥜" }
  ];

  var HABITOS_ICONOS = {
    correr:"🏃", leer:"📖", meditar:"🧘", agua:"💧", dormir:"😴",
    ahorrar:"💰", escribir:"✍️", caminar:"🚶", estudiar:"📚", default:"✅"
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
    ALIMENTOS_COMUNES: ALIMENTOS_COMUNES,
    HABITOS_ICONOS: HABITOS_ICONOS,

    // ── ALUMNOS ──
    getAlumnos: function(){ return get("alumnos") || []; },
    saveAlumno: function(a){
      var list = this.getAlumnos();
      var idx = list.findIndex(function(x){ return x.id === a.id; });
      if(idx >= 0) list[idx] = a; else list.push(a);
      return set("alumnos", list);
    },
    getAlumnoPorCodigo: function(c){ return this.getAlumnos().filter(function(a){ return a.codigo === c; })[0] || null; },
    getAlumnoPorId:     function(id){ return this.getAlumnos().filter(function(a){ return a.id === id; })[0] || null; },
    deleteAlumno: function(id){ return set("alumnos", this.getAlumnos().filter(function(a){ return a.id !== id; })); },

    // ── RUTINAS ──
    getRutinas: function(){ return get("rutinas") || []; },
    saveRutina: function(r){
      var list = this.getRutinas();
      var idx = list.findIndex(function(x){ return x.id === r.id; });
      if(idx >= 0) list[idx] = r; else list.push(r);
      return set("rutinas", list);
    },
    getRutinaPorId: function(id){ return this.getRutinas().filter(function(r){ return r.id === id; })[0] || null; },
    deleteRutina:   function(id){ return set("rutinas", this.getRutinas().filter(function(r){ return r.id !== id; })); },

    // ── PLANES ──
    getPlanes: function(){ return get("planes") || []; },
    savePlan:  function(p){
      var list = this.getPlanes();
      var idx = list.findIndex(function(x){ return x.id === p.id; });
      if(idx >= 0) list[idx] = p; else list.push(p);
      return set("planes", list);
    },
    getPlanPorId: function(id){ return this.getPlanes().filter(function(p){ return p.id === id; })[0] || null; },
    deletePlan:   function(id){ return set("planes", this.getPlanes().filter(function(p){ return p.id !== id; })); },

    // ── EJERCICIOS ──
    getEjercicios: function(){ return get("ejercicios") || window.EJERCICIOS_DEFAULT || []; },
    saveEjercicio: function(e){
      var list = this.getEjercicios();
      var idx = list.findIndex(function(x){ return x.id === e.id; });
      if(idx >= 0) list[idx] = e; else list.push(e);
      return set("ejercicios", list);
    },
    getEjercicioPorNombre: function(nombre){
      return this.getEjercicios().find(function(e){ return e.nombre.toLowerCase() === (nombre||"").toLowerCase(); }) || null;
    },

    // ── REGISTROS ──
    getRegistros:  function(alumnoId){ return get("registros_" + alumnoId) || []; },
    saveRegistro:  function(alumnoId, reg){
      var list = this.getRegistros(alumnoId);
      list.push(reg);
      set("registros_" + alumnoId, list);
      return this.checkMedallas(alumnoId);
    },

    // ── PESOS ──
    getPesos:  function(alumnoId){ return get("pesos_" + alumnoId) || []; },
    savePeso:  function(alumnoId, peso){
      var list = this.getPesos(alumnoId);
      list.push(peso);
      return set("pesos_" + alumnoId, list);
    },

    // ── MEDIDAS ──
    getMedidas:  function(alumnoId){ return get("medidas_" + alumnoId) || []; },
    saveMedidas: function(alumnoId, m){
      var list = this.getMedidas(alumnoId);
      list.push(m);
      return set("medidas_" + alumnoId, list);
    },

    // ── NUTRICIÓN ──
    getNutricion:  function(alumnoId, fecha){ return get("nutricion_" + alumnoId + "_" + fecha) || { opciones:{}, agua:0, alimentos:[] }; },
    saveNutricion: function(alumnoId, fecha, datos){ return set("nutricion_" + alumnoId + "_" + fecha, datos); },
    getNutricionExtras: function(alumnoId, fecha){
      return (this.getNutricion(alumnoId, fecha).extras) || [];
    },
    saveNutricionExtra: function(alumnoId, fecha, extra){
      var data = this.getNutricion(alumnoId, fecha);
      if(!data.extras) data.extras = [];
      data.extras.push(extra);
      this.saveNutricion(alumnoId, fecha, data);
      return data;
    },

    // ── MEDALLAS ──
    getMedallas:       function(alumnoId){ return get("medallas_" + alumnoId) || []; },
    desbloquearMedalla: function(alumnoId, medallaId){
      var list = this.getMedallas(alumnoId);
      if(list.indexOf(medallaId) === -1){ list.push(medallaId); set("medallas_" + alumnoId, list); return true; }
      return false;
    },

    // ── NOTAS ──
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

    // ── GYM INFO ──
    getGymInfo:  function(){ return get("gym_info") || { activo:false }; },
    saveGymInfo: function(info){ return set("gym_info", info); },

    // ── FOTOS ──
    getFotos: function(alumnoId){ return get("fotos_" + alumnoId) || []; },
    saveFoto: function(alumnoId, foto){
      var list = this.getFotos(alumnoId);
      list.push(foto);
      return set("fotos_" + alumnoId, list);
    },
    deleteFoto: function(alumnoId, id){
      return set("fotos_" + alumnoId, this.getFotos(alumnoId).filter(function(f){ return f.id !== id; }));
    },

    // ── HÁBITOS ──
    getHabitos: function(alumnoId){
      return get("habitos_" + alumnoId) || window.__HABITOS_DEMO__ || [];
    },
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
    getHabitosCompletadosHoy: function(alumnoId, fecha){
      var checks = this.getHabitoChecks(alumnoId);
      var diaChecks = checks[fecha] || {};
      return Object.keys(diaChecks).filter(function(k){ return diaChecks[k]; });
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

    // ── SESIÓN ──
    getAlumnoActual: function(){ return get("alumno_actual"); },
    setAlumnoActual: function(id){ return set("alumno_actual", id); },
    clearSesion:     function(){ localStorage.removeItem(PREFIX + "alumno_actual"); },

    // ── RACHAS ──
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

    // ── MEDALLAS ──
    checkMedallas: function(alumnoId){
      var self = this;
      var registros = this.getRegistros(alumnoId);
      var nuevas = [];
      if(registros.length >= 1  && self.desbloquearMedalla(alumnoId,"primera_llama"))   nuevas.push("primera_llama");
      if(registros.length >= 10 && self.desbloquearMedalla(alumnoId,"decimo_entreno"))  nuevas.push("decimo_entreno");
      if(registros.length >= 50 && self.desbloquearMedalla(alumnoId,"cincuenton"))      nuevas.push("cincuenton");
      if(this.getMedidas(alumnoId).length >= 1 && self.desbloquearMedalla(alumnoId,"me_mido")) nuevas.push("me_mido");
      var racha = this.calcularRacha(alumnoId);
      if(racha >= 3  && self.desbloquearMedalla(alumnoId,"racha_3"))          nuevas.push("racha_3");
      if(racha >= 7  && self.desbloquearMedalla(alumnoId,"semana_completa"))  nuevas.push("semana_completa");
      if(racha >= 30 && self.desbloquearMedalla(alumnoId,"mes_fuego"))        nuevas.push("mes_fuego");
      if(racha >= 60 && self.desbloquearMedalla(alumnoId,"elite"))            nuevas.push("elite");
      return nuevas;
    },

    // ── SEED DEMO ──
    seedDemo: function(){
      if(this.getAlumnos().length > 0) return;

      var rutina = {
        id:"r_demo1", nombre:"PPL-TP 1 - Santiago",
        descripcion:"Push Pull Legs + Torso Pierna para principiante",
        objetivo:"ganancia_muscular", nivel:"principiante", duracion_semanas:4,
        mesociclo:"Mesociclo 1 – Push Pull Legs + Torso Pierna – Principiante – 4 semanas",
        dias:[
          { numero:1, nombre:"PUSH - Pecho y Hombros", tipo:"fuerza", ejercicios:[
            { id:"ej_1", nombre:"Press militar en máquina",               grupo:"Hombros", series:3, repeticiones:"12/RIR 2", descanso_seg:120, nota_tecnica:"Postura firme, sin balanceo",                    como_hacer:"1. Ajusta el asiento para que el agarre quede a la altura de los hombros.\n2. Espalda pegada al respaldo, pies firmes.\n3. Empuja hacia arriba sin bloquear los codos.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=Wqbal_-Rrmk", foto:"https://img.youtube.com/vi/Wqbal_-Rrmk/mqdefault.jpg", sets:[{reps:12,peso:30},{reps:12,peso:25},{reps:10,peso:25}] },
            { id:"ej_2", nombre:"Press inclinado con mancuerna",          grupo:"Pecho",   series:2, repeticiones:"12/RIR 1-2", descanso_seg:120, nota_tecnica:"Movimiento limpio, sin rebote",                como_hacer:"1. Banco inclinado 15-30°.\n2. Mancuernas a la altura del pecho.\n3. Empuja sin chocar.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=8iPEnn-ltC8", foto:"https://img.youtube.com/vi/8iPEnn-ltC8/mqdefault.jpg", sets:[{reps:10,peso:25},{reps:10,peso:25}] },
            { id:"ej_3", nombre:"Peck Deck",                              grupo:"Pecho",   series:2, repeticiones:"12-15/RIR 1", descanso_seg:90, nota_tecnica:"Rango completo, contracción en el pico",        como_hacer:"1. Espalda pegada, codos ligeramente flexionados.\n2. Junta los brazos apretando el pecho.\n3. Aguanta 1 segundo.\n4. Vuelve controlado.", video_url:"https://www.youtube.com/watch?v=xUm0BiZCWlQ", foto:"https://img.youtube.com/vi/xUm0BiZCWlQ/mqdefault.jpg", sets:[{reps:13,peso:20},{reps:12,peso:18}] },
            { id:"ej_4", nombre:"Elevaciones laterales en máquina",       grupo:"Hombros", series:3, repeticiones:"15/RIR 1", descanso_seg:90,  nota_tecnica:"Codos ligeramente flexionados",                   como_hacer:"1. Codo apoyado en el cojín.\n2. Eleva lateralmente hasta el hombro.\n3. Sin impulso.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=3VcKaXpzqRo", foto:"https://img.youtube.com/vi/3VcKaXpzqRo/mqdefault.jpg", sets:[{reps:15,peso:8},{reps:15,peso:8},{reps:12,peso:6}] }
          ]},
          { numero:2, nombre:"PULL - Espalda y Bíceps", tipo:"fuerza", ejercicios:[
            { id:"ej_5", nombre:"Jalón al pecho agarre prono",            grupo:"Espalda", series:3, repeticiones:"10-12/RIR 2", descanso_seg:120, nota_tecnica:"Pecho arriba, omóplatos juntos al bajar",      como_hacer:"1. Agarre ancho.\n2. Pecho arriba, ligera inclinación.\n3. Lleva la barra al pecho.\n4. Sube controlado.", video_url:"https://www.youtube.com/watch?v=lueI5PJaGL0", foto:"https://img.youtube.com/vi/lueI5PJaGL0/mqdefault.jpg", sets:[{reps:12,peso:40},{reps:11,peso:40},{reps:10,peso:35}] },
            { id:"ej_6", nombre:"Remo con mancuerna",                     grupo:"Espalda", series:3, repeticiones:"10/RIR 2",    descanso_seg:90,  nota_tecnica:"Espalda paralela al suelo, sin rotar el torso", como_hacer:"1. Apoya una mano en el banco.\n2. Espalda recta.\n3. Lleva el codo hacia atrás.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=pYcpY20QaE8", foto:"https://img.youtube.com/vi/pYcpY20QaE8/mqdefault.jpg", sets:[{reps:10,peso:18},{reps:10,peso:18},{reps:10,peso:16}] },
            { id:"ej_7", nombre:"Curl con barra",                         grupo:"Bíceps",  series:3, repeticiones:"12/RIR 1",    descanso_seg:90,  nota_tecnica:"Sin balanceo, codos fijos",                     como_hacer:"1. Agarre supino.\n2. Codos pegados al torso.\n3. Sube contrayendo el bíceps.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=kwG2ipFRgfo", foto:"https://img.youtube.com/vi/kwG2ipFRgfo/mqdefault.jpg", sets:[{reps:12,peso:15},{reps:12,peso:15},{reps:10,peso:12}] }
          ]},
          { numero:3, nombre:"LEGS - Piernas", tipo:"fuerza", ejercicios:[
            { id:"ej_8", nombre:"Sentadilla con barra",                   grupo:"Cuádriceps", series:4, repeticiones:"8-10/RIR 2", descanso_seg:150, nota_tecnica:"Rodillas alineadas con pies, descenso controlado", como_hacer:"1. Barra en el trapecio.\n2. Pies a la anchura de los hombros.\n3. Baja manteniendo el pecho arriba.\n4. Sube empujando con los talones.", video_url:"https://www.youtube.com/watch?v=Dy58u-N5fQ0", foto:"https://img.youtube.com/vi/Dy58u-N5fQ0/mqdefault.jpg", sets:[{reps:10,peso:50},{reps:9,peso:50},{reps:8,peso:55},{reps:8,peso:55}] },
            { id:"ej_9", nombre:"Prensa de piernas",                      grupo:"Cuádriceps", series:3, repeticiones:"12/RIR 1",   descanso_seg:120, nota_tecnica:"No bloquear rodillas al extender",              como_hacer:"1. Pies a la anchura de los hombros en la plataforma.\n2. Baja hasta 90°.\n3. Empuja sin bloquear las rodillas.\n4. Mantén la zona lumbar pegada.", video_url:"https://www.youtube.com/watch?v=IZxyjW7MPJQ", foto:"https://img.youtube.com/vi/IZxyjW7MPJQ/mqdefault.jpg", sets:[{reps:12,peso:80},{reps:12,peso:80},{reps:10,peso:90}] },
            { id:"ej_10", nombre:"Hip thrust con barra",                  grupo:"Glúteos",    series:3, repeticiones:"12-15/RIR 1", descanso_seg:90, nota_tecnica:"Cadera completa arriba, contracción en el pico", como_hacer:"1. Espalda en el banco, barra sobre la cadera.\n2. Pies firmes, rodillas a 90°.\n3. Empuja la cadera apretando el glúteo.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=SEdqd1n0cvg", foto:"https://img.youtube.com/vi/SEdqd1n0cvg/mqdefault.jpg", sets:[{reps:15,peso:40},{reps:14,peso:40},{reps:12,peso:45}] }
          ]},
          { numero:4, nombre:"Descanso activo", tipo:"descanso", ejercicios:[] }
        ]
      };

      var plan = {
        id:"p_demo1", nombre:"Plan de alimentación Santiago Guamán",
        objetivo:"ganancia_muscular", calorias_objetivo:2500,
        macros:{ proteina:170, carbohidratos:280, grasas:75 },
        descripcion:"Santi, en esta etapa el enfoque estará puesto en fortalecer progresivamente la masa muscular y disminuir grasa corporal de forma sostenida.",
        comidas:[
          { nombre:"Desayuno", hora:"07:30", descripcion:"Opción 1 (lunes a viernes): Humita + huevo + jamón de pavo + piña con granola. Opción 2 (fin de semana): plátano + huevo + queso fresco + uvas.",
            opciones:[
              { nombre:"Opción 1", dias:[0,1,2,3,4], calorias_total:603, alimentos:[ {nombre:"Humita",cantidad:"140g",calorias:215,proteina:5,carbos:42,grasas:4},{nombre:"Queso fresco",cantidad:"15g",calorias:30,proteina:4,carbos:0,grasas:1.5},{nombre:"Huevo de gallina",cantidad:"50g",calorias:74,proteina:6,carbos:0,grasas:5},{nombre:"Jamón de pavo",cantidad:"70g",calorias:140,proteina:18,carbos:2,grasas:6},{nombre:"Piña",cantidad:"150g",calorias:72,proteina:1,carbos:19,grasas:0},{nombre:"Granola",cantidad:"15g",calorias:72,proteina:2,carbos:11,grasas:2.5} ]},
              { nombre:"Opción 2", dias:[5,6],     calorias_total:533, alimentos:[ {nombre:"Plátano Maduro",cantidad:"140g",calorias:125,proteina:1,carbos:32,grasas:0},{nombre:"Huevo",cantidad:"150g",calorias:222,proteina:18,carbos:0,grasas:15},{nombre:"Queso fresco",cantidad:"55g",calorias:110,proteina:14,carbos:0,grasas:5},{nombre:"Uvas Verdes",cantidad:"50g",calorias:35,proteina:0,carbos:9,grasas:0} ]}
            ]},
          { nombre:"Almuerzo", hora:"13:00", descripcion:"Opción 1: arroz + pollo + brócoli. Opción 2: quinua + pescado + ensalada.",
            opciones:[
              { nombre:"Opción 1", dias:[0,2,4,5,6], calorias_total:515, alimentos:[ {nombre:"Arroz cocido",cantidad:"150g",calorias:195,proteina:4,carbos:43,grasas:0},{nombre:"Pechuga de pollo",cantidad:"180g",calorias:198,proteina:40,carbos:0,grasas:4},{nombre:"Brócoli al vapor",cantidad:"100g",calorias:34,proteina:3,carbos:7,grasas:0},{nombre:"Aceite de oliva",cantidad:"10ml",calorias:88,proteina:0,carbos:0,grasas:10} ]},
              { nombre:"Opción 2", dias:[1,3],       calorias_total:478, alimentos:[ {nombre:"Quinua cocida",cantidad:"150g",calorias:170,proteina:6,carbos:32,grasas:2},{nombre:"Filete de pescado",cantidad:"180g",calorias:190,proteina:38,carbos:0,grasas:3},{nombre:"Ensalada mixta",cantidad:"120g",calorias:30,proteina:2,carbos:5,grasas:0},{nombre:"Aceite de oliva",cantidad:"10ml",calorias:88,proteina:0,carbos:0,grasas:10} ]}
            ]},
          { nombre:"Post-entreno", hora:"18:30", descripcion:"Proteína de suero + plátano.",
            opciones:[ { nombre:"Opción 1", calorias_total:248, alimentos:[ {nombre:"Proteína de suero",cantidad:"35g",calorias:140,proteina:30,carbos:5,grasas:2},{nombre:"Plátano",cantidad:"120g",calorias:108,proteina:1,carbos:28,grasas:0} ]} ]},
          { nombre:"Cena", hora:"20:00", descripcion:"Atún + papa + ensalada.",
            opciones:[ { nombre:"Opción 1", calorias_total:334, alimentos:[ {nombre:"Atún en agua",cantidad:"150g",calorias:150,proteina:33,carbos:0,grasas:1},{nombre:"Papa cocida",cantidad:"200g",calorias:154,proteina:4,carbos:36,grasas:0},{nombre:"Ensalada mixta",cantidad:"150g",calorias:30,proteina:2,carbos:6,grasas:0} ]} ]}
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
        var d = new Date(hoy); d.setDate(d.getDate()-i);
        var fecha = d.toISOString().split("T")[0];
        if(i % 3 !== 0){
          regs.push({ id:generarId("reg"), fecha:fecha, dia_numero:(i%3)+1, sesion_nombre:rutina.dias[i%3].nombre, duracion_min:45+(i%4)*5, sensacion:3+(i%3), nota:"", ejercicios_completados:rutina.dias[i%3].ejercicios.length, ejercicios_total:rutina.dias[i%3].ejercicios.length });
        }
        if(i % 2 === 0) pesos.push({ fecha:fecha, kg:(68.5+(9-i)*0.19).toFixed(1) });
      }
      set("registros_a_demo1", regs);
      set("pesos_a_demo1", pesos);
      set("medidas_a_demo1", [{ fecha:"2026-05-01", cuello:38, pecho:96, cintura:80, cadera:94, brazo_izq:32, brazo_der:32.5, muslo_izq:54, muslo_der:54, pantorrilla:36 }]);
      set("notas_a_demo1", [{ fecha:fechaHoy(), texto:"Buena semana Santi, sigue así con la técnica del press militar.", leida:false }]);
      this.checkMedallas("a_demo1");

      var habitos = [
        { id:"h_1", nombre:"Tomar 2L de agua",            icono:"agua",   hora_sugerida:"08:00", racha:7, creado:"2026-05-01" },
        { id:"h_2", nombre:"Tomar creatina",               icono:"default",hora_sugerida:"09:00", racha:7, creado:"2026-05-01" },
        { id:"h_3", nombre:"Ir al gimnasio",               icono:"correr", hora_sugerida:"18:00", racha:3, creado:"2026-05-01" },
        { id:"h_4", nombre:"Movilidad post-entreno 10min", icono:"meditar",hora_sugerida:"19:30", racha:2, creado:"2026-05-10" },
        { id:"h_5", nombre:"Dormir mínimo 7 horas",        icono:"dormir", hora_sugerida:"22:30", racha:5, creado:"2026-05-10" }
      ];
      habitos.forEach(function(h){ window.db.saveHabito("a_demo1", h); });
      var checks = {};
      for(var hi=6; hi>=0; hi--){
        var dh = new Date(hoy); dh.setDate(dh.getDate()-hi);
        var fh = dh.toISOString().split("T")[0];
        checks[fh] = { h_1:hi%2===0, h_2:hi%2===0, h_3:hi%3!==0, h_4:hi<4, h_5:hi<5 };
      }
      set("habito_checks_a_demo1", checks);

      this.saveGymInfo({
        activo:true, nombre:"TK Fitness Gym", tagline:"Tu mejor versión empieza aquí",
        logo_url:"", direccion:"Av. Principal 123, Guayaquil, Ecuador",
        maps_url:"https://maps.google.com/?q=TK+Fitness+Gym+Guayaquil",
        telefono:"+593991234567", whatsapp:"+593991234567", instagram:"tkfitnessgym",
        horarios_atencion:[ {dias:"Lunes a Viernes",apertura:"06:00",cierre:"22:00"},{dias:"Sábado",apertura:"07:00",cierre:"18:00"},{dias:"Domingo",apertura:"08:00",cierre:"14:00"} ],
        clases:[ {dia:0,hora:"08:00",nombre:"Spinning",instructor:"Carlos R.",duracion_min:45,plazas_total:20,plazas_disponibles:18,tipo:"cardio"} ],
        servicios:[ {icono:"pesas",nombre:"Sala de pesas"},{icono:"spinning",nombre:"Spinning"},{icono:"yoga",nombre:"Yoga / Pilates"},{icono:"vestuarios",nombre:"Vestuarios"},{icono:"suplementos",nombre:"Suplementos"},{icono:"cardio",nombre:"Zona de cardio"} ],
        galeria:[], videos_educativos:[], videos_recetas:[],
        anuncios:[ {id:"anuncio_001",titulo:"¡Bienvenido a TK Fitness!",texto:"Estamos felices de tenerte en nuestra familia. Cualquier duda, escríbenos por WhatsApp.",fecha:"2026-06-01",destacado:true} ],
        normas:[ "Trae siempre tu toalla personal.","Limpia el equipo después de usarlo.","Respeta los turnos en las máquinas.","No se permite comida en la sala de pesas." ],
        cupones:[ {id:"cup_1",titulo:"10% en suplementos",descripcion:"Válido en tienda física del gym.",descuento:"10%",codigo:"FIT10",vence:"2026-07-31"} ],
        promociones:[ {id:"promo_1",titulo:"Verano sin pereza",descripcion:"Inscríbete este mes y tu segunda mensualidad tiene 20% de descuento.",fecha_fin:"2026-07-15",destacado:true} ],
        referidos:{ activo:true, premio_referidor:"1 semana gratis", premio_referido:"10% descuento", descripcion:"Comparte tu código con un amigo." },
        puntos_config:{ activo:true, puntos_por_entreno:10, texto_canje:"Acumula puntos y canjéalos en recepción." }
      });
    }
  };

  window.db.seedDemo();
})();

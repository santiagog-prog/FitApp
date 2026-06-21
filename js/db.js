// ════════════════════════════════════════════════════════════
// db.js v3 — Backend en Railway (Express + Postgres + Bucket)
// con capa de caché síncrona.
//
// API_BASE apunta al servicio fitapp-api desplegado en Railway.
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  // ── API BACKEND (Railway) ───────────────────────────────────
  var API_BASE = "https://fitapp-api-production-390d.up.railway.app/api";

  function qs(params){
    var p = new URLSearchParams();
    Object.keys(params||{}).forEach(function(k){ if(params[k] !== undefined && params[k] !== null) p.append(k, params[k]); });
    var s = p.toString();
    return s ? ("?"+s) : "";
  }
  function apiGet(table, params){
    return fetch(API_BASE+"/"+table+qs(params)).then(function(r){ return r.json(); });
  }
  function apiPost(table, body){
    return fetch(API_BASE+"/"+table, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
      .then(function(r){ return r.json(); });
  }
  function apiPatch(table, params, body){
    return fetch(API_BASE+"/"+table+qs(params), { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
      .then(function(r){ return r.json(); });
  }
  function apiDelete(table, params){
    return fetch(API_BASE+"/"+table+qs(params), { method:"DELETE" }).then(function(r){ return r.json(); });
  }
  function apiUploadFile(file, prefix){
    var fd = new FormData();
    fd.append("file", file);
    fd.append("prefix", prefix||"uploads");
    return fetch(API_BASE+"/upload", { method:"POST", body:fd }).then(function(r){ return r.json(); });
  }
  function apiDeleteUpload(path){
    return fetch(API_BASE+"/upload"+qs({ path:path }), { method:"DELETE" }).then(function(r){ return r.json(); });
  }
  // Escritura en background — nunca bloquea la UI
  function apiWrite(fn){
    fn().then(function(r){ if(r && r.error) console.warn("[db:write]", r.error); }).catch(function(e){ console.warn("[db:write]", e.message); });
  }

  // ── SESIÓN en localStorage (no son datos, son estado de UI) ─
  var LS = "fitapp_";
  function lsGet(k){ try{ return JSON.parse(localStorage.getItem(LS+k)); }catch(e){ return null; } }
  function lsSet(k,v){ try{ localStorage.setItem(LS+k,JSON.stringify(v)); return true; }catch(e){ return false; } }

  // ── CACHÉ EN MEMORIA ────────────────────────────────────────
  var C = {
    alumnos:       [],
    rutinas:       [],
    planes:        [],
    ejercicios:    [],
    vinculos:      [],
    gym_info:      null,
    _aid:          null,
    registros:     [],
    pesos:         [],
    medidas:       [],
    medallas:      [],
    notas:         [],
    habitos:       [],
    habito_checks: {},
    nutricion:     {},
    progreso:      {},
    fitscore:      {},
    food_scans:    {},
    objetivos:     [],
    fotos:         []
  };

  // ── CONSTANTES ───────────────────────────────────────────────
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

  // ── UTILIDADES ───────────────────────────────────────────────
  function generarId(prefix){ return (prefix||"id") + "_" + Date.now() + "_" + Math.random().toString(36).substr(2,5); }
  function fechaHoy(){ return new Date().toISOString().split("T")[0]; }
  function pad2(n){ return n < 10 ? "0"+n : ""+n; }
  function dFecha(diasAtras){
    var d = new Date(); d.setDate(d.getDate() - diasAtras);
    return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());
  }
  function ytEmbed(url){
    if(!url) return null;
    var m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if(m) return "https://www.youtube.com/embed/" + m[1];
    return null;
  }
  function rowToNutricion(row){
    return {
      opciones:  row.opciones  || {},
      comidos:   row.comidos   || {},
      agua:      row.agua      || 0,
      alimentos: row.alimentos || [],
      extras:    row.extras    || []
    };
  }

  // ════════════════════════════════════════════════════════════
  // window.db — API pública
  // ════════════════════════════════════════════════════════════
  window.db = {
    MEDALLAS_DEF:      MEDALLAS_DEF,
    ALIMENTOS_COMUNES: ALIMENTOS_COMUNES,
    HABITOS_ICONOS:    HABITOS_ICONOS,
    generarId:         generarId,
    fechaHoy:          fechaHoy,
    ytEmbed:           ytEmbed,

    // ── INIT (LOGIN) ──────────────────────────────────────────
    // Carga solo la lista de alumnos — usado en la pantalla de
    // login (index.html) antes de poder validar el código de 4
    // dígitos. Sin esto, getAlumnoPorCodigo() siempre devuelve
    // null porque el caché empieza vacío.
    initLogin: function(){
      return apiGet("alumnos").then(function(r){
        C.alumnos = r || [];
        if(C.alumnos.length === 0) return window.db.seedDemo();
      });
    },

    // ── INIT (ALUMNO) ─────────────────────────────────────────
    init: function(alumnoId){
      C._aid = alumnoId;
      var minDate = dFecha(180);

      return Promise.all([
        apiGet("alumnos").then(function(r){ C.alumnos = r || []; }),
        apiGet("rutinas").then(function(r){ C.rutinas = r || []; }),
        apiGet("planes").then(function(r){ C.planes = r || []; }),
        apiGet("ejercicios").then(function(r){ C.ejercicios = (r && r.length) ? r : (window.EJERCICIOS_DEFAULT || []); }),
        apiGet("vinculos").then(function(r){ C.vinculos = r || []; }),
        apiGet("gym_info", { id:"main" }).then(function(r){ C.gym_info = (r && r[0] && r[0].data) ? r[0].data : null; }),

        apiGet("registros", { alumno_id:alumnoId }).then(function(r){ C.registros = r || []; }),
        apiGet("pesos", { alumno_id:alumnoId }).then(function(r){ C.pesos = r || []; }),
        apiGet("medidas", { alumno_id:alumnoId }).then(function(r){ C.medidas = r || []; }),
        apiGet("medallas_alumno", { alumno_id:alumnoId }).then(function(r){ C.medallas = (r||[]).map(function(x){ return x.medalla_id; }); }),
        apiGet("notas", { alumno_id:alumnoId }).then(function(r){ C.notas = r || []; }),
        apiGet("habitos", { alumno_id:alumnoId }).then(function(r){ C.habitos = r || []; }),
        apiGet("habito_checks", { alumno_id:alumnoId, fecha_gte:minDate }).then(function(r){
          C.habito_checks = {};
          (r||[]).forEach(function(row){ C.habito_checks[row.fecha] = row.checks || {}; });
        }),
        apiGet("nutricion_diaria", { alumno_id:alumnoId, fecha_gte:minDate }).then(function(r){
          C.nutricion = {};
          (r||[]).forEach(function(row){ C.nutricion[row.fecha] = rowToNutricion(row); });
        }),
        apiGet("progreso_diario", { alumno_id:alumnoId, fecha_gte:minDate }).then(function(r){
          C.progreso = {};
          (r||[]).forEach(function(row){
            C.progreso[row.fecha] = { pasos:row.pasos||0, agua_ml:row.agua_ml||0, sueno_h:row.sueno_h||0, calorias_activas:row.calorias_activas||0 };
          });
        }),
        apiGet("fitscore", { alumno_id:alumnoId, fecha_gte:minDate }).then(function(r){
          C.fitscore = {};
          (r||[]).forEach(function(row){ C.fitscore[row.fecha] = row.score_data; });
        }),
        apiGet("food_scans", { alumno_id:alumnoId, fecha_gte:minDate }).then(function(r){
          C.food_scans = {};
          (r||[]).forEach(function(row){
            if(!C.food_scans[row.fecha]) C.food_scans[row.fecha] = [];
            C.food_scans[row.fecha].push(row.scan_data);
          });
        }),
        apiGet("objetivos", { alumno_id:alumnoId }).then(function(r){ C.objetivos = (r||[]).map(function(row){ return row.data; }); }),
        apiGet("fotos", { alumno_id:alumnoId }).then(function(r){ C.fotos = r || []; })
      ]).then(function(){
        if(C.alumnos.length === 0) return window.db.seedDemo();
      });
    },

    // ── INIT (COACH) ──────────────────────────────────────────
    initCoach: function(){
      return Promise.all([
        apiGet("alumnos").then(function(r){ C.alumnos = r || []; }),
        apiGet("rutinas").then(function(r){ C.rutinas = r || []; }),
        apiGet("planes").then(function(r){ C.planes = r || []; }),
        apiGet("ejercicios").then(function(r){ C.ejercicios = (r && r.length) ? r : (window.EJERCICIOS_DEFAULT || []); }),
        apiGet("gym_info", { id:"main" }).then(function(r){ C.gym_info = (r && r[0] && r[0].data) ? r[0].data : null; })
      ]).then(function(){
        if(C.alumnos.length === 0) return window.db.seedDemo();
      });
    },

    initAlumnoParaCoach: function(alumnoId){
      C._aid = alumnoId;
      return Promise.all([
        apiGet("registros", { alumno_id:alumnoId }).then(function(r){ C.registros = r || []; }),
        apiGet("pesos", { alumno_id:alumnoId }).then(function(r){ C.pesos = r || []; }),
        apiGet("medidas", { alumno_id:alumnoId }).then(function(r){ C.medidas = r || []; }),
        apiGet("notas", { alumno_id:alumnoId }).then(function(r){ C.notas = r || []; }),
        apiGet("medallas_alumno", { alumno_id:alumnoId }).then(function(r){ C.medallas = (r||[]).map(function(x){ return x.medalla_id; }); }),
        apiGet("habitos", { alumno_id:alumnoId }).then(function(r){ C.habitos = r || []; }),
        apiGet("habito_checks", { alumno_id:alumnoId, fecha_gte:dFecha(90) }).then(function(r){
          C.habito_checks = {};
          (r||[]).forEach(function(row){ C.habito_checks[row.fecha] = row.checks || {}; });
        }),
        apiGet("nutricion_diaria", { alumno_id:alumnoId, fecha_gte:dFecha(90) }).then(function(r){
          C.nutricion = {};
          (r||[]).forEach(function(row){ C.nutricion[row.fecha] = rowToNutricion(row); });
        }),
        apiGet("objetivos", { alumno_id:alumnoId }).then(function(r){ C.objetivos = (r||[]).map(function(row){ return row.data; }); }),
        apiGet("fotos", { alumno_id:alumnoId }).then(function(r){ C.fotos = r || []; })
      ]);
    },

    // ── ALUMNOS ──────────────────────────────────────────────
    getAlumnos: function(){ return C.alumnos.slice(); },
    getAlumnoPorCodigo: function(c){ return C.alumnos.find(function(a){ return a.codigo === c; }) || null; },
    getAlumnoPorId:     function(id){ return C.alumnos.find(function(a){ return a.id === id; }) || null; },
    saveAlumno: function(a){
      var idx = C.alumnos.findIndex(function(x){ return x.id === a.id; });
      if(idx >= 0) C.alumnos[idx] = a; else C.alumnos.push(a);
      apiWrite(function(){ return apiPost("alumnos", a); });
    },
    deleteAlumno: function(id){
      C.alumnos = C.alumnos.filter(function(a){ return a.id !== id; });
      apiWrite(function(){ return apiDelete("alumnos", { id:id }); });
    },

    // ── RUTINAS ──────────────────────────────────────────────
    getRutinas: function(){ return C.rutinas.slice(); },
    getRutinaPorId: function(id){ return C.rutinas.find(function(r){ return r.id === id; }) || null; },
    saveRutina: function(r){
      var idx = C.rutinas.findIndex(function(x){ return x.id === r.id; });
      if(idx >= 0) C.rutinas[idx] = r; else C.rutinas.push(r);
      apiWrite(function(){ return apiPost("rutinas", r); });
    },
    deleteRutina: function(id){
      C.rutinas = C.rutinas.filter(function(r){ return r.id !== id; });
      apiWrite(function(){ return apiDelete("rutinas", { id:id }); });
    },

    // ── PLANES ───────────────────────────────────────────────
    getPlanes: function(){ return C.planes.slice(); },
    getPlanPorId: function(id){ return C.planes.find(function(p){ return p.id === id; }) || null; },
    savePlan: function(p){
      var idx = C.planes.findIndex(function(x){ return x.id === p.id; });
      if(idx >= 0) C.planes[idx] = p; else C.planes.push(p);
      apiWrite(function(){ return apiPost("planes", p); });
    },
    deletePlan: function(id){
      C.planes = C.planes.filter(function(p){ return p.id !== id; });
      apiWrite(function(){ return apiDelete("planes", { id:id }); });
    },

    // ── EJERCICIOS ───────────────────────────────────────────
    getEjercicios: function(){ return C.ejercicios.length ? C.ejercicios.slice() : (window.EJERCICIOS_DEFAULT || []); },
    getEjercicioPorNombre: function(nombre){
      return this.getEjercicios().find(function(e){ return e.nombre.toLowerCase() === (nombre||"").toLowerCase(); }) || null;
    },
    saveEjercicio: function(e){
      var idx = C.ejercicios.findIndex(function(x){ return x.id === e.id; });
      if(idx >= 0) C.ejercicios[idx] = e; else C.ejercicios.push(e);
      apiWrite(function(){ return apiPost("ejercicios", e); });
    },

    // ── REGISTROS ────────────────────────────────────────────
    getRegistros: function(alumnoId){
      return alumnoId ? C.registros.filter(function(r){ return r.alumno_id === alumnoId; }) : C.registros.slice();
    },
    saveRegistro: function(alumnoId, reg){
      reg.alumno_id = alumnoId;
      if(!reg.id) reg.id = generarId("reg");
      C.registros.push(reg);
      apiWrite(function(){ return apiPost("registros", reg); });
      return this.checkMedallas(alumnoId);
    },

    // ── PESOS ────────────────────────────────────────────────
    getPesos: function(alumnoId){
      return alumnoId ? C.pesos.filter(function(p){ return p.alumno_id === alumnoId; }) : C.pesos.slice();
    },
    savePeso: function(alumnoId, peso){
      peso.alumno_id = alumnoId;
      C.pesos.push(peso);
      apiWrite(function(){ return apiPost("pesos", { alumno_id:alumnoId, fecha:peso.fecha, kg:peso.kg }); });
    },

    // ── MEDIDAS ──────────────────────────────────────────────
    getMedidas: function(alumnoId){
      return alumnoId ? C.medidas.filter(function(m){ return m.alumno_id === alumnoId; }) : C.medidas.slice();
    },
    saveMedidas: function(alumnoId, m){
      m.alumno_id = alumnoId;
      C.medidas.push(m);
      apiWrite(function(){ return apiPost("medidas", Object.assign({ alumno_id:alumnoId }, m)); });
    },

    // ── NUTRICIÓN ────────────────────────────────────────────
    getNutricion: function(alumnoId, fecha){
      return C.nutricion[fecha]
        ? JSON.parse(JSON.stringify(C.nutricion[fecha]))
        : { opciones:{}, comidos:{}, agua:0, alimentos:[], extras:[] };
    },
    saveNutricion: function(alumnoId, fecha, datos){
      C.nutricion[fecha] = JSON.parse(JSON.stringify(datos));
      apiWrite(function(){
        return apiPost("nutricion_diaria", {
          alumno_id: alumnoId, fecha: fecha,
          opciones:  datos.opciones  || {},
          comidos:   datos.comidos   || {},
          agua:      datos.agua      || 0,
          alimentos: datos.alimentos || [],
          extras:    datos.extras    || []
        });
      });
    },
    getNutricionExtras: function(alumnoId, fecha){
      return (C.nutricion[fecha] && C.nutricion[fecha].extras) || [];
    },
    saveNutricionExtra: function(alumnoId, fecha, extra){
      var data = this.getNutricion(alumnoId, fecha);
      if(!data.extras) data.extras = [];
      data.extras.push(extra);
      this.saveNutricion(alumnoId, fecha, data);
      return data;
    },

    // ── MEDALLAS ─────────────────────────────────────────────
    getMedallas: function(alumnoId){ return C.medallas.slice(); },
    desbloquearMedalla: function(alumnoId, medallaId){
      if(C.medallas.indexOf(medallaId) === -1){
        C.medallas.push(medallaId);
        apiWrite(function(){ return apiPost("medallas_alumno", { alumno_id:alumnoId, medalla_id:medallaId }); });
        return true;
      }
      return false;
    },
    checkMedallas: function(alumnoId){
      var self = this;
      var registros = this.getRegistros(alumnoId);
      var nuevas = [];
      if(registros.length >= 1  && self.desbloquearMedalla(alumnoId,"primera_llama"))  nuevas.push("primera_llama");
      if(registros.length >= 10 && self.desbloquearMedalla(alumnoId,"decimo_entreno")) nuevas.push("decimo_entreno");
      if(registros.length >= 50 && self.desbloquearMedalla(alumnoId,"cincuenton"))     nuevas.push("cincuenton");
      if(this.getMedidas(alumnoId).length >= 1 && self.desbloquearMedalla(alumnoId,"me_mido")) nuevas.push("me_mido");
      var racha = this.calcularRacha(alumnoId);
      if(racha >= 3  && self.desbloquearMedalla(alumnoId,"racha_3"))         nuevas.push("racha_3");
      if(racha >= 7  && self.desbloquearMedalla(alumnoId,"semana_completa")) nuevas.push("semana_completa");
      if(racha >= 30 && self.desbloquearMedalla(alumnoId,"mes_fuego"))       nuevas.push("mes_fuego");
      if(racha >= 60 && self.desbloquearMedalla(alumnoId,"elite"))           nuevas.push("elite");
      return nuevas;
    },

    // ── NOTAS ────────────────────────────────────────────────
    getNotas: function(alumnoId){ return C.notas.slice(); },
    saveNota: function(alumnoId, nota){
      nota.alumno_id = alumnoId;
      C.notas.push(nota);
      apiWrite(function(){ return apiPost("notas", nota); });
    },
    marcarNotasLeidas: function(alumnoId){
      C.notas = C.notas.map(function(n){ n.leida = true; return n; });
      apiWrite(function(){ return apiPatch("notas", { alumno_id:alumnoId }, { leida:true }); });
    },

    // ── GYM INFO ─────────────────────────────────────────────
    getGymInfo:  function(){ return C.gym_info || { activo:false }; },
    saveGymInfo: function(info){
      C.gym_info = info;
      apiWrite(function(){ return apiPost("gym_info", { id:"main", data:info, updated_at:new Date().toISOString() }); });
    },

    // ── FOTOS ────────────────────────────────────────────────
    getFotos: function(alumnoId){ return C.fotos.slice(); },
    saveFoto: function(alumnoId, foto){
      foto.alumno_id = alumnoId;
      C.fotos.push(foto);
      apiWrite(function(){ return apiPost("fotos", foto); });
    },
    deleteFoto: function(alumnoId, id){
      var foto = C.fotos.find(function(f){ return f.id === id; });
      C.fotos = C.fotos.filter(function(f){ return f.id !== id; });
      apiWrite(function(){ return apiDelete("fotos", { id:id }); });
      if(foto && foto.storage_path) apiDeleteUpload(foto.storage_path);
    },
    // Sube un File al bucket de Railway y guarda el registro.
    uploadFoto: function(alumnoId, file, metadata){
      var self = this;
      return apiUploadFile(file, "fotos/"+alumnoId).then(function(r){
        if(r.error) throw new Error(r.error);
        var foto = Object.assign({ id:generarId("foto"), alumno_id:alumnoId, storage_path:r.path, url:r.url }, metadata||{});
        self.saveFoto(alumnoId, foto);
        return foto;
      });
    },

    // ── HÁBITOS ──────────────────────────────────────────────
    getHabitos: function(alumnoId){ return C.habitos.length ? C.habitos.slice() : (window.__HABITOS_DEMO__ || []); },
    saveHabito: function(alumnoId, habito){
      habito.alumno_id = alumnoId;
      var idx = C.habitos.findIndex(function(h){ return h.id === habito.id; });
      if(idx >= 0) C.habitos[idx] = habito; else C.habitos.push(habito);
      apiWrite(function(){ return apiPost("habitos", habito); });
    },
    deleteHabito: function(alumnoId, id){
      C.habitos = C.habitos.filter(function(h){ return h.id !== id; });
      apiWrite(function(){ return apiDelete("habitos", { id:id }); });
    },
    getHabitoChecks: function(alumnoId){ return JSON.parse(JSON.stringify(C.habito_checks)); },
    toggleHabitoCheck: function(alumnoId, habitoId, fecha){
      if(!C.habito_checks[fecha]) C.habito_checks[fecha] = {};
      C.habito_checks[fecha][habitoId] = !C.habito_checks[fecha][habitoId];
      var checks = JSON.parse(JSON.stringify(C.habito_checks[fecha]));
      apiWrite(function(){ return apiPost("habito_checks", { alumno_id:alumnoId, fecha:fecha, checks:checks }); });
      return C.habito_checks[fecha][habitoId];
    },
    getHabitosCompletadosHoy: function(alumnoId, fecha){
      var diaChecks = C.habito_checks[fecha] || {};
      return Object.keys(diaChecks).filter(function(k){ return diaChecks[k]; });
    },
    calcularRachaHabito: function(alumnoId, habitoId){
      var checks = C.habito_checks;
      var fechas = Object.keys(checks).filter(function(f){ return checks[f][habitoId]; }).sort().reverse();
      if(!fechas.length) return 0;
      var racha = 1;
      for(var i=0; i<fechas.length-1; i++){
        if((new Date(fechas[i]) - new Date(fechas[i+1])) / 86400000 === 1) racha++; else break;
      }
      return racha;
    },

    // ── SESIÓN (localStorage — no va al backend) ─────────────
    getAlumnoActual: function(){ return lsGet("alumno_actual"); },
    setAlumnoActual: function(id){ return lsSet("alumno_actual", id); },
    clearSesion:     function(){ localStorage.removeItem(LS+"alumno_actual"); },

    // ── OPENAI KEY (localStorage) ────────────────────────────
    saveOpenAIKey: function(k){ return lsSet("openai_key", k); },
    getOpenAIKey:  function(){ return lsGet("openai_key") || ""; },

    // ── FOOD SCANS ───────────────────────────────────────────
    getFoodScans: function(alumnoId, fecha){
      return (C.food_scans[fecha||fechaHoy()] || []).slice();
    },
    saveFoodScan: function(alumnoId, scan){
      var fecha = scan.fecha || fechaHoy();
      if(!C.food_scans[fecha]) C.food_scans[fecha] = [];
      C.food_scans[fecha].push(scan);
      apiWrite(function(){ return apiPost("food_scans", { alumno_id:alumnoId, fecha:fecha, scan_data:scan }); });
    },
    getFoodScansHistorial: function(alumnoId, dias){
      var result = [];
      for(var i=0; i<(dias||7); i++) result = result.concat(C.food_scans[dFecha(i)] || []);
      return result;
    },

    // ── OBJETIVOS ────────────────────────────────────────────
    getObjetivos: function(alumnoId){ return C.objetivos.slice(); },
    saveObjetivos: function(alumnoId, lista){
      C.objetivos = lista.slice();
      var self = this;
      lista.forEach(function(obj){ self.saveObjetivo(alumnoId, obj); });
    },
    saveObjetivo: function(alumnoId, obj){
      var idx = C.objetivos.findIndex(function(x){ return x.id === obj.id; });
      if(idx >= 0) C.objetivos[idx] = obj; else C.objetivos.push(obj);
      apiWrite(function(){ return apiPost("objetivos", { id:obj.id||generarId("obj"), alumno_id:alumnoId, data:obj }); });
    },
    deleteObjetivo: function(alumnoId, id){
      C.objetivos = C.objetivos.filter(function(o){ return o.id !== id; });
      apiWrite(function(){ return apiDelete("objetivos", { id:id }); });
    },

    // ── PROGRESO DIARIO ──────────────────────────────────────
    getProgresoDiario: function(alumnoId, fecha){
      var f = fecha || fechaHoy();
      return Object.assign({ pasos:0, agua_ml:0, sueno_h:0, calorias_activas:0 }, C.progreso[f] || {});
    },
    saveProgresoDiario: function(alumnoId, fecha, datos){
      var f = fecha || fechaHoy();
      C.progreso[f] = Object.assign({}, datos);
      apiWrite(function(){ return apiPost("progreso_diario", Object.assign({ alumno_id:alumnoId, fecha:f }, datos)); });
    },
    patchProgresoDiario: function(alumnoId, fecha, patch){
      var d = this.getProgresoDiario(alumnoId, fecha);
      Object.keys(patch).forEach(function(k){ d[k] = patch[k]; });
      this.saveProgresoDiario(alumnoId, fecha, d);
    },

    // ── FITSCORE ─────────────────────────────────────────────
    getFitScore: function(alumnoId, fecha){ return C.fitscore[fecha||fechaHoy()] || null; },
    saveFitScore: function(alumnoId, fecha, scoreObj){
      var f = fecha || fechaHoy();
      C.fitscore[f] = scoreObj;
      apiWrite(function(){ return apiPost("fitscore", { alumno_id:alumnoId, fecha:f, score_data:scoreObj }); });
    },
    getFitScoreHistorial: function(alumnoId, dias){
      var result = [];
      for(var i=(dias||7)-1; i>=0; i--){
        var f = dFecha(i);
        var s = C.fitscore[f];
        result.push({ fecha:f, score: s ? s.total : null });
      }
      return result;
    },

    // ── ACTIVIDAD RECIENTE ───────────────────────────────────
    getActividadReciente: function(alumnoId, dias){
      var corte = new Date(); corte.setDate(corte.getDate() - (dias||7));
      return C.registros.filter(function(r){ return new Date(r.fecha) >= corte; });
    },

    // ── RACHAS ───────────────────────────────────────────────
    calcularRacha: function(alumnoId){
      var registros = this.getRegistros(alumnoId);
      if(!registros.length) return 0;
      var fechas = registros.map(function(r){ return r.fecha; });
      fechas = fechas.filter(function(f, i){ return fechas.indexOf(f) === i; }).sort().reverse();
      var racha = 1;
      for(var i=0; i<fechas.length-1; i++){
        var diff = (new Date(fechas[i]) - new Date(fechas[i+1])) / 86400000;
        if(diff === 1) racha++; else break;
      }
      return racha;
    },

    // ── VÍNCULOS ─────────────────────────────────────────────
    vincularAlumnos: function(alumnoId1, alumnoId2){
      var yaExiste = C.vinculos.find(function(v){
        return (v.alumno1===alumnoId1&&v.alumno2===alumnoId2)||(v.alumno1===alumnoId2&&v.alumno2===alumnoId1);
      });
      if(yaExiste) return yaExiste;
      var v = { id:"vinc_"+Date.now(), alumno1:alumnoId1, alumno2:alumnoId2, fecha:fechaHoy(), confirmado_por:[alumnoId1] };
      C.vinculos.push(v);
      apiWrite(function(){ return apiPost("vinculos", v); });
      return v;
    },
    confirmarVinculo: function(vinculoId, alumnoId){
      var v = C.vinculos.find(function(x){ return x.id===vinculoId; });
      if(v && v.confirmado_por.indexOf(alumnoId)===-1){
        v.confirmado_por.push(alumnoId);
        apiWrite(function(){ return apiPatch("vinculos", { id:vinculoId }, { confirmado_por:v.confirmado_por }); });
      }
      return v;
    },
    rechazarVinculo: function(vinculoId){
      C.vinculos = C.vinculos.filter(function(v){ return v.id!==vinculoId; });
      apiWrite(function(){ return apiDelete("vinculos", { id:vinculoId }); });
    },
    getVinculoDe: function(alumnoId){
      return C.vinculos.find(function(v){ return v.alumno1===alumnoId||v.alumno2===alumnoId; })||null;
    },
    vinculoEstaActivo: function(vinculo){ return vinculo && vinculo.confirmado_por.length===2; },

    // ── MIGRACIÓN DESDE localStorage ─────────────────────────
    // Corre UNA SOLA VEZ desde la consola del navegador:
    //   await db.migrarDesdeLocalStorage()
    migrarDesdeLocalStorage: function(){
      var LS2 = "fitapp_";
      function lg(k){ try{ return JSON.parse(localStorage.getItem(LS2+k)); }catch(e){ return null; } }

      var alumnos  = lg("alumnos")  || [];
      var rutinas  = lg("rutinas")  || [];
      var planes   = lg("planes")   || [];
      var gymInfo  = lg("gym_info");
      var vinculos = lg("vinculos") || [];

      var ops = [];
      if(alumnos.length)  ops.push(apiPost("alumnos", alumnos));
      if(rutinas.length)  ops.push(apiPost("rutinas", rutinas));
      if(planes.length)   ops.push(apiPost("planes", planes));
      if(gymInfo)         ops.push(apiPost("gym_info", { id:"main", data:gymInfo }));
      if(vinculos.length) ops.push(apiPost("vinculos", vinculos));

      alumnos.forEach(function(a){
        var aid = a.id;
        var regs = lg("registros_"+aid)||[];
        if(regs.length){ regs.forEach(function(r){ r.alumno_id=aid; if(!r.id) r.id=generarId("reg"); }); ops.push(apiPost("registros", regs)); }

        var pesos = lg("pesos_"+aid)||[];
        if(pesos.length){ pesos.forEach(function(p){ p.alumno_id=aid; }); ops.push(apiPost("pesos", pesos)); }

        var medidas = lg("medidas_"+aid)||[];
        if(medidas.length){ medidas.forEach(function(m){ m.alumno_id=aid; }); ops.push(apiPost("medidas", medidas)); }

        var medallas = lg("medallas_"+aid)||[];
        if(medallas.length){
          ops.push(apiPost("medallas_alumno", medallas.map(function(m){ return { alumno_id:aid, medalla_id:m }; })));
        }

        var notas = lg("notas_"+aid)||[];
        if(notas.length){ notas.forEach(function(n){ n.alumno_id=aid; }); ops.push(apiPost("notas", notas)); }

        var habitos = lg("habitos_"+aid)||[];
        if(habitos.length){ habitos.forEach(function(h){ h.alumno_id=aid; }); ops.push(apiPost("habitos", habitos)); }

        var checksRaw = lg("habito_checks_"+aid)||{};
        var checksRows = Object.keys(checksRaw).map(function(f){ return { alumno_id:aid, fecha:f, checks:checksRaw[f] }; });
        if(checksRows.length) ops.push(apiPost("habito_checks", checksRows));

        var objetivos = lg("objetivos_"+aid)||[];
        if(objetivos.length){
          ops.push(apiPost("objetivos", objetivos.map(function(o){ return { id:o.id||generarId("obj"), alumno_id:aid, data:o }; })));
        }

        var nutRows=[], proRows=[], fsRows=[];
        for(var i=0; i<localStorage.length; i++){
          var k = localStorage.key(i);
          if(!k) continue;
          var val; try{ val = JSON.parse(localStorage.getItem(k)); }catch(e){ continue; }
          var pfx = LS2+"nutricion_"+aid+"_";
          if(k.indexOf(pfx) === 0){
            var f = k.slice(pfx.length);
            nutRows.push({ alumno_id:aid, fecha:f, opciones:val.opciones||{}, comidos:val.comidos||{}, agua:val.agua||0, alimentos:val.alimentos||[], extras:val.extras||[] });
          }
          pfx = LS2+"progreso_"+aid+"_";
          if(k.indexOf(pfx) === 0) proRows.push(Object.assign({ alumno_id:aid, fecha:k.slice(pfx.length) }, val));
          pfx = LS2+"fitscore_"+aid+"_";
          if(k.indexOf(pfx) === 0) fsRows.push({ alumno_id:aid, fecha:k.slice(pfx.length), score_data:val });
        }
        if(nutRows.length) ops.push(apiPost("nutricion_diaria", nutRows));
        if(proRows.length) ops.push(apiPost("progreso_diario", proRows));
        if(fsRows.length)  ops.push(apiPost("fitscore", fsRows));

        console.log("[migración] " + a.nombre + " — " + regs.length + " registros, " + nutRows.length + " días de nutrición");
      });

      return Promise.all(ops)
        .then(function(){ console.log("[migración] ✅ Todo migrado a Railway. Alumnos:", alumnos.length); })
        .catch(function(err){ console.error("[migración] ❌", err); throw err; });
    },

    // ── SEED DEMO ────────────────────────────────────────────
    seedDemo: function(){
      var self = this;
      var rutina = {
        id:"r_demo1", nombre:"PPL-TP 1 - Santiago",
        descripcion:"Push Pull Legs + Torso Pierna para principiante",
        objetivo:"ganancia_muscular", nivel:"principiante", duracion_semanas:4,
        mesociclo:"Mesociclo 1 – Push Pull Legs + Torso Pierna – Principiante – 4 semanas",
        dias:[
          { numero:1, nombre:"PUSH - Pecho y Hombros", tipo:"fuerza", ejercicios:[
            { id:"ej_1", nombre:"Press militar en máquina",         grupo:"Hombros", series:3, repeticiones:"12/RIR 2", descanso_seg:120, nota_tecnica:"Postura firme, sin balanceo", como_hacer:"1. Ajusta el asiento para que el agarre quede a la altura de los hombros.\n2. Espalda pegada al respaldo, pies firmes.\n3. Empuja hacia arriba sin bloquear los codos.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=Wqbal_-Rrmk", foto:"https://img.youtube.com/vi/Wqbal_-Rrmk/mqdefault.jpg", sets:[{reps:12,peso:30},{reps:12,peso:25},{reps:10,peso:25}] },
            { id:"ej_2", nombre:"Press inclinado con mancuerna",    grupo:"Pecho",   series:2, repeticiones:"12/RIR 1-2", descanso_seg:120, nota_tecnica:"Movimiento limpio, sin rebote", como_hacer:"1. Banco inclinado 15-30°.\n2. Mancuernas a la altura del pecho.\n3. Empuja sin chocar.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=8iPEnn-ltC8", foto:"https://img.youtube.com/vi/8iPEnn-ltC8/mqdefault.jpg", sets:[{reps:10,peso:25},{reps:10,peso:25}] },
            { id:"ej_3", nombre:"Peck Deck",                        grupo:"Pecho",   series:2, repeticiones:"12-15/RIR 1", descanso_seg:90,  nota_tecnica:"Rango completo, contracción en el pico", como_hacer:"1. Espalda pegada, codos ligeramente flexionados.\n2. Junta los brazos apretando el pecho.\n3. Aguanta 1 segundo.\n4. Vuelve controlado.", video_url:"https://www.youtube.com/watch?v=xUm0BiZCWlQ", foto:"https://img.youtube.com/vi/xUm0BiZCWlQ/mqdefault.jpg", sets:[{reps:13,peso:20},{reps:12,peso:18}] },
            { id:"ej_4", nombre:"Elevaciones laterales en máquina", grupo:"Hombros", series:3, repeticiones:"15/RIR 1", descanso_seg:90,  nota_tecnica:"Codos ligeramente flexionados", como_hacer:"1. Codo apoyado en el cojín.\n2. Eleva lateralmente hasta el hombro.\n3. Sin impulso.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=3VcKaXpzqRo", foto:"https://img.youtube.com/vi/3VcKaXpzqRo/mqdefault.jpg", sets:[{reps:15,peso:8},{reps:15,peso:8},{reps:12,peso:6}] }
          ]},
          { numero:2, nombre:"PULL - Espalda y Bíceps", tipo:"fuerza", ejercicios:[
            { id:"ej_5", nombre:"Jalón al pecho agarre prono",  grupo:"Espalda", series:3, repeticiones:"10-12/RIR 2", descanso_seg:120, nota_tecnica:"Pecho arriba, omóplatos juntos al bajar", como_hacer:"1. Agarre ancho.\n2. Pecho arriba, ligera inclinación.\n3. Lleva la barra al pecho.\n4. Sube controlado.", video_url:"https://www.youtube.com/watch?v=lueI5PJaGL0", foto:"https://img.youtube.com/vi/lueI5PJaGL0/mqdefault.jpg", sets:[{reps:12,peso:40},{reps:11,peso:40},{reps:10,peso:35}] },
            { id:"ej_6", nombre:"Remo con mancuerna",           grupo:"Espalda", series:3, repeticiones:"10/RIR 2",    descanso_seg:90,  nota_tecnica:"Espalda paralela al suelo, sin rotar el torso", como_hacer:"1. Apoya una mano en el banco.\n2. Espalda recta.\n3. Lleva el codo hacia atrás.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=pYcpY20QaE8", foto:"https://img.youtube.com/vi/pYcpY20QaE8/mqdefault.jpg", sets:[{reps:10,peso:18},{reps:10,peso:18},{reps:10,peso:16}] },
            { id:"ej_7", nombre:"Curl con barra",               grupo:"Bíceps",  series:3, repeticiones:"12/RIR 1",    descanso_seg:90,  nota_tecnica:"Sin balanceo, codos fijos", como_hacer:"1. Agarre supino.\n2. Codos pegados al torso.\n3. Sube contrayendo el bíceps.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=kwG2ipFRgfo", foto:"https://img.youtube.com/vi/kwG2ipFRgfo/mqdefault.jpg", sets:[{reps:12,peso:15},{reps:12,peso:15},{reps:10,peso:12}] }
          ]},
          { numero:3, nombre:"LEGS - Piernas", tipo:"fuerza", ejercicios:[
            { id:"ej_8",  nombre:"Sentadilla con barra", grupo:"Cuádriceps", series:4, repeticiones:"8-10/RIR 2", descanso_seg:150, nota_tecnica:"Rodillas alineadas con pies, descenso controlado", como_hacer:"1. Barra en el trapecio.\n2. Pies a la anchura de los hombros.\n3. Baja manteniendo el pecho arriba.\n4. Sube empujando con los talones.", video_url:"https://www.youtube.com/watch?v=Dy58u-N5fQ0", foto:"https://img.youtube.com/vi/Dy58u-N5fQ0/mqdefault.jpg", sets:[{reps:10,peso:50},{reps:9,peso:50},{reps:8,peso:55},{reps:8,peso:55}] },
            { id:"ej_9",  nombre:"Prensa de piernas",    grupo:"Cuádriceps", series:3, repeticiones:"12/RIR 1",   descanso_seg:120, nota_tecnica:"No bloquear rodillas al extender", como_hacer:"1. Pies a la anchura de los hombros en la plataforma.\n2. Baja hasta 90°.\n3. Empuja sin bloquear las rodillas.\n4. Mantén la zona lumbar pegada.", video_url:"https://www.youtube.com/watch?v=IZxyjW7MPJQ", foto:"https://img.youtube.com/vi/IZxyjW7MPJQ/mqdefault.jpg", sets:[{reps:12,peso:80},{reps:12,peso:80},{reps:10,peso:90}] },
            { id:"ej_10", nombre:"Hip thrust con barra", grupo:"Glúteos",    series:3, repeticiones:"12-15/RIR 1", descanso_seg:90, nota_tecnica:"Cadera completa arriba, contracción en el pico", como_hacer:"1. Espalda en el banco, barra sobre la cadera.\n2. Pies firmes, rodillas a 90°.\n3. Empuja la cadera apretando el glúteo.\n4. Baja controlado.", video_url:"https://www.youtube.com/watch?v=SEdqd1n0cvg", foto:"https://img.youtube.com/vi/SEdqd1n0cvg/mqdefault.jpg", sets:[{reps:15,peso:40},{reps:14,peso:40},{reps:12,peso:45}] }
          ]},
          { numero:4, nombre:"Descanso activo", tipo:"descanso", ejercicios:[] }
        ]
      };

      var plan = {
        id:"p_demo1", nombre:"Plan de alimentación Santiago Guamán",
        objetivo:"perdida_grasa", calorias_objetivo:1760,
        macros:{ proteina:141, carbohidratos:175, grasas:60 },
        descripcion:"Santi, este plan está diseñado para disminuir grasa corporal manteniendo la masa muscular. 3 comidas principales con 5 opciones cada una.",
        comidas:[
          { nombre:"Desayuno", hora:"07:00", descripcion:"Elige una opción. Cada una aporta entre 500-600 kcal.", opciones:[
            { nombre:"Opción 1", calorias_total:602, alimentos:[{nombre:"Humita",cantidad:"140g",calorias:215,proteina:6.3,carbos:21.4,grasas:12.6},{nombre:"Queso fresco bajo en grasa",cantidad:"15g",calorias:30,proteina:3.5,carbos:0,grasas:2},{nombre:"Huevo de gallina fresco",cantidad:"50g",calorias:74,proteina:6.3,carbos:0.4,grasas:5},{nombre:"Jamón de pechuga de pavo",cantidad:"70g",calorias:140,proteina:14,carbos:3.5,grasas:0},{nombre:"Piña",cantidad:"150g",calorias:72,proteina:0.8,carbos:18.9,grasas:0.2},{nombre:"Granola crocante",cantidad:"15g",calorias:72,proteina:1.2,carbos:10.5,grasas:2.7}]},
            { nombre:"Opción 2", calorias_total:533, alimentos:[{nombre:"Plátano Maduro",cantidad:"140g",calorias:171,proteina:1.8,carbos:44.7,grasas:0.6},{nombre:"Huevo",cantidad:"150g",calorias:222,proteina:18.9,carbos:1.2,grasas:14.8},{nombre:"Queso fresco bajo en grasa",cantidad:"55g",calorias:110,proteina:12.8,carbos:0,grasas:7.3},{nombre:"Uvas Verdes",cantidad:"50g",calorias:30,proteina:0.4,carbos:9,grasas:0.1}]},
            { nombre:"Opción 3", calorias_total:563, alimentos:[{nombre:"Leche de Almendras",cantidad:"250g",calorias:41,proteina:1.5,carbos:1.5,grasas:3.8},{nombre:"Moras Congeladas",cantidad:"90g",calorias:58,proteina:1.1,carbos:14.1,grasas:0.4},{nombre:"Nueces",cantidad:"15g",calorias:98,proteina:2.3,carbos:2,grasas:9.8},{nombre:"Pan Integral",cantidad:"60g",calorias:136,proteina:5.5,carbos:27.3,grasas:1.4},{nombre:"Queso fresco bajo en grasa",cantidad:"50g",calorias:100,proteina:11.7,carbos:0,grasas:6.7},{nombre:"Jamón de pavo ahumado",cantidad:"50g",calorias:100,proteina:10,carbos:2.5,grasas:0},{nombre:"Uvas Verdes",cantidad:"50g",calorias:30,proteina:0.4,carbos:9,grasas:0.1}]},
            { nombre:"Opción 4", calorias_total:537, alimentos:[{nombre:"Plátano Verde",cantidad:"190g",calorias:162,proteina:1.9,carbos:41.4,grasas:0.6},{nombre:"Huevo de gallina fresco",cantidad:"150g",calorias:221,proteina:18.9,carbos:1.2,grasas:14.9},{nombre:"Queso fresco bajo en grasa",cantidad:"50g",calorias:100,proteina:11.7,carbos:0,grasas:6.7},{nombre:"Tomate",cantidad:"70g",calorias:13,proteina:0.6,carbos:2.7,grasas:0.1},{nombre:"Cebolla",cantidad:"20g",calorias:8,proteina:0.2,carbos:2,grasas:0.2},{nombre:"Arándanos",cantidad:"60g",calorias:34,proteina:0.4,carbos:8.7,grasas:0.2}]},
            { nombre:"Opción 5", calorias_total:528, alimentos:[{nombre:"Yogurt griego",cantidad:"210g",calorias:168,proteina:25.2,carbos:18.9,grasas:0},{nombre:"Fresas",cantidad:"50g",calorias:16,proteina:0.3,carbos:3.9,grasas:0.1},{nombre:"Piña",cantidad:"80g",calorias:38,proteina:0.4,carbos:10.1,grasas:0.1},{nombre:"Almendras",cantidad:"15g",calorias:87,proteina:3.3,carbos:3,grasas:7.6},{nombre:"Nueces",cantidad:"15g",calorias:98,proteina:2.3,carbos:2,grasas:9.8},{nombre:"Granola crocante",cantidad:"50g",calorias:120,proteina:2,carbos:17.5,grasas:4.5}]}
          ]},
          { nombre:"Comida", hora:"13:00", descripcion:"Comida principal. Elige una opción.", opciones:[
            { nombre:"Opción 1", calorias_total:726, alimentos:[{nombre:"Mote",cantidad:"140g",calorias:158,proteina:4.2,carbos:34.4,grasas:0.8},{nombre:"Huevo de gallina fresco",cantidad:"100g",calorias:147,proteina:12.6,carbos:0.8,grasas:9.9},{nombre:"Pechuga de Pollo",cantidad:"210g",calorias:229,proteina:48.3,carbos:0,grasas:2.5},{nombre:"Pimiento Rojo",cantidad:"80g",calorias:21,proteina:0.8,carbos:4.8,grasas:0.2},{nombre:"Aguacate",cantidad:"40g",calorias:64,proteina:0.8,carbos:3.4,grasas:5.9},{nombre:"Guineo",cantidad:"120g",calorias:107,proteina:1.3,carbos:27.4,grasas:0.4}]},
            { nombre:"Opción 2", calorias_total:730, alimentos:[{nombre:"Arroz Blanco Cocido",cantidad:"130g",calorias:168,proteina:3.3,carbos:36.7,grasas:0.3},{nombre:"Lentejas Cocidas",cantidad:"30g",calorias:27,proteina:2.5,carbos:3.2,grasas:0.1},{nombre:"Pechuga de Pollo",cantidad:"260g",calorias:283,proteina:59.8,carbos:0,grasas:3.1},{nombre:"Aguacate",cantidad:"70g",calorias:112,proteina:1.4,carbos:6,grasas:10.3},{nombre:"Tomate",cantidad:"80g",calorias:14,proteina:0.7,carbos:3.1,grasas:0.2},{nombre:"Aceite de oliva",cantidad:"5g",calorias:44,proteina:0,carbos:0,grasas:5},{nombre:"Pera",cantidad:"140g",calorias:81,proteina:0.5,carbos:21.6,grasas:0.2}]},
            { nombre:"Opción 3", calorias_total:721, alimentos:[{nombre:"Papa Cocida",cantidad:"170g",calorias:136,proteina:3.7,carbos:30.9,grasas:0.2},{nombre:"Lomo de Res magro",cantidad:"270g",calorias:343,proteina:60.2,carbos:0,grasas:9.4},{nombre:"Lechuga",cantidad:"20g",calorias:3,proteina:0.2,carbos:0.6,grasas:0},{nombre:"Aguacate",cantidad:"65g",calorias:104,proteina:1.3,carbos:5.5,grasas:9.5},{nombre:"Zanahoria cruda",cantidad:"70g",calorias:29,proteina:0.7,carbos:6.7,grasas:0.2},{nombre:"Guineo",cantidad:"120g",calorias:107,proteina:1.3,carbos:27.4,grasas:0.4}]},
            { nombre:"Opción 4", calorias_total:733, alimentos:[{nombre:"Pasta Integral Cocida",cantidad:"160g",calorias:198,proteina:8.5,carbos:42.4,grasas:0.8},{nombre:"Carne Molida de Res",cantidad:"220g",calorias:376,proteina:57.9,carbos:0,grasas:14.3},{nombre:"Zanahoria cruda",cantidad:"60g",calorias:25,proteina:0.6,carbos:5.8,grasas:0.1},{nombre:"Pimiento Rojo",cantidad:"60g",calorias:16,proteina:0.6,carbos:3.6,grasas:0.2},{nombre:"Aguacate",cantidad:"30g",calorias:48,proteina:0.6,carbos:2.6,grasas:4.4},{nombre:"Manzana",cantidad:"140g",calorias:70,proteina:0.4,carbos:16.8,grasas:0}]},
            { nombre:"Opción 5", calorias_total:714, alimentos:[{nombre:"Yuca Cocida",cantidad:"110g",calorias:190,proteina:1.4,carbos:41.3,grasas:2.2},{nombre:"Corvina",cantidad:"200g",calorias:296,proteina:44.4,carbos:1,grasas:11.6},{nombre:"Lechuga",cantidad:"20g",calorias:3,proteina:0.2,carbos:0.6,grasas:0},{nombre:"Tomate",cantidad:"50g",calorias:9,proteina:0.4,carbos:2,grasas:0.1},{nombre:"Yogurt griego",cantidad:"160g",calorias:128,proteina:19.2,carbos:14.4,grasas:0},{nombre:"Nueces",cantidad:"8g",calorias:52,proteina:1.2,carbos:1.1,grasas:5.2},{nombre:"Uvas Verdes",cantidad:"60g",calorias:36,proteina:0.5,carbos:10.8,grasas:0.1}]}
          ]},
          { nombre:"Cena", hora:"19:30", descripcion:"Cena ligera rica en proteína.", opciones:[
            { nombre:"Opción 1", calorias_total:483, alimentos:[{nombre:"Isofit Protein",cantidad:"33g",calorias:124,proteina:25.8,carbos:3.1,grasas:2.1},{nombre:"Leche semidescremada",cantidad:"250g",calorias:120,proteina:8,carbos:11,grasas:5},{nombre:"Nueces",cantidad:"10g",calorias:65,proteina:1.5,carbos:1.4,grasas:6.5},{nombre:"Moras Congeladas",cantidad:"100g",calorias:64,proteina:1.2,carbos:15.7,grasas:0.4},{nombre:"Galletas integrales",cantidad:"24g",calorias:110,proteina:2,carbos:17,grasas:4}]},
            { nombre:"Opción 2", calorias_total:479, alimentos:[{nombre:"Yogurt griego",cantidad:"60g",calorias:48,proteina:7.2,carbos:5.4,grasas:0},{nombre:"Isofit Protein",cantidad:"33g",calorias:124,proteina:25.8,carbos:3.1,grasas:2.1},{nombre:"Nueces",cantidad:"18g",calorias:118,proteina:2.7,carbos:2.5,grasas:11.7},{nombre:"Guineo",cantidad:"90g",calorias:80,proteina:1,carbos:20.5,grasas:0.3},{nombre:"Galletas integrales",cantidad:"24g",calorias:110,proteina:2,carbos:17,grasas:4}]},
            { nombre:"Opción 3", calorias_total:505, alimentos:[{nombre:"Leche de Almendras",cantidad:"250g",calorias:41,proteina:1.5,carbos:1.5,grasas:3.8},{nombre:"Isofit Protein",cantidad:"33g",calorias:124,proteina:25.8,carbos:3.1,grasas:2.1},{nombre:"Nueces",cantidad:"15g",calorias:98,proteina:2.3,carbos:2,grasas:9.8},{nombre:"Guineo",cantidad:"110g",calorias:98,proteina:1.2,carbos:25.1,grasas:0},{nombre:"Pan Integral",cantidad:"30g",calorias:68,proteina:2.7,carbos:13.7,grasas:0.7},{nombre:"Jamón de pavo ahumado",cantidad:"25g",calorias:50,proteina:5,carbos:1.3,grasas:0}]},
            { nombre:"Opción 4", calorias_total:466, alimentos:[{nombre:"Yogurt griego",cantidad:"260g",calorias:208,proteina:31.2,carbos:23.4,grasas:0},{nombre:"Almendras",cantidad:"15g",calorias:87,proteina:3.3,carbos:3,grasas:7.6},{nombre:"Nueces",cantidad:"15g",calorias:98,proteina:2.3,carbos:2,grasas:9.8},{nombre:"Piña",cantidad:"150g",calorias:72,proteina:0.8,carbos:18.9,grasas:0.2}]},
            { nombre:"Opción 5", calorias_total:490, alimentos:[{nombre:"Leche semidescremada",cantidad:"250g",calorias:120,proteina:8,carbos:11,grasas:5},{nombre:"Cocoa",cantidad:"15g",calorias:33,proteina:2.9,carbos:8.1,grasas:2},{nombre:"Pan Integral",cantidad:"60g",calorias:136,proteina:5.5,carbos:27.3,grasas:1.4},{nombre:"Queso fresco bajo en grasa",cantidad:"70g",calorias:140,proteina:16.3,carbos:0,grasas:9.3},{nombre:"Jamón de pavo ahumado",cantidad:"30g",calorias:60,proteina:6,carbos:1.5,grasas:0}]}
          ]}
        ]
      };

      var alumno = {
        id:"a_demo1", codigo:"1111", nombre:"Santiago", apellido:"Guamán", edad:24, genero:"masculino",
        objetivo:"ganancia_muscular", nivel:"principiante", peso_inicial:68.5, peso_actual:70.2, altura:172,
        fecha_inicio:"2026-05-01", rutina_id:"r_demo1", plan_alimentacion_id:"p_demo1", activo:true
      };

      self.saveRutina(rutina);
      self.savePlan(plan);
      self.saveAlumno(alumno);

      var hoy = new Date();
      var regs = [];
      for(var i=9; i>=0; i--){
        var d = new Date(hoy); d.setDate(d.getDate()-i);
        var fecha = d.toISOString().split("T")[0];
        if(i % 3 !== 0){
          var diaIdx = i % 3;
          regs.push({ id:generarId("reg"), alumno_id:"a_demo1", fecha:fecha, dia_numero:diaIdx+1, sesion_nombre:rutina.dias[diaIdx].nombre, duracion_min:45+(i%4)*5, sensacion:3+(i%3), nota:"", ejercicios_completados:rutina.dias[diaIdx].ejercicios.length, ejercicios_total:rutina.dias[diaIdx].ejercicios.length });
        }
        if(i % 2 === 0) self.savePeso("a_demo1", { fecha:fecha, kg:parseFloat((68.5+(9-i)*0.19).toFixed(1)) });
      }
      regs.forEach(function(r){ C.registros.push(r); });
      apiWrite(function(){ return apiPost("registros", regs); });

      self.saveMedidas("a_demo1", { fecha:"2026-05-01", cuello:38, pecho:96, cintura:80, cadera:94, brazo_izq:32, brazo_der:32.5, muslo_izq:54, muslo_der:54, pantorrilla:36 });
      self.saveNota("a_demo1", { fecha:fechaHoy(), texto:"Buena semana Santi, sigue así con la técnica del press militar.", leida:false });
      self.checkMedallas("a_demo1");

      var habitos = [
        { id:"h_1", nombre:"Tomar 2L de agua",            icono:"agua",    hora_sugerida:"08:00", racha:7, creado:"2026-05-01" },
        { id:"h_2", nombre:"Tomar creatina",               icono:"default", hora_sugerida:"09:00", racha:7, creado:"2026-05-01" },
        { id:"h_3", nombre:"Ir al gimnasio",               icono:"correr",  hora_sugerida:"18:00", racha:3, creado:"2026-05-01" },
        { id:"h_4", nombre:"Movilidad post-entreno 10min", icono:"meditar", hora_sugerida:"19:30", racha:2, creado:"2026-05-10" },
        { id:"h_5", nombre:"Dormir mínimo 7 horas",        icono:"dormir",  hora_sugerida:"22:30", racha:5, creado:"2026-05-10" }
      ];
      habitos.forEach(function(h){ self.saveHabito("a_demo1", h); });

      var hoyDate = new Date();
      var checkRows = [];
      for(var hi=6; hi>=0; hi--){
        var dh = new Date(hoyDate); dh.setDate(dh.getDate()-hi);
        var fh = dh.toISOString().split("T")[0];
        var checks = { h_1:hi%2===0, h_2:hi%2===0, h_3:hi%3!==0, h_4:hi<4, h_5:hi<5 };
        C.habito_checks[fh] = checks;
        checkRows.push({ alumno_id:"a_demo1", fecha:fh, checks:checks });
      }
      apiWrite(function(){ return apiPost("habito_checks", checkRows); });

      self.saveGymInfo({
        activo:true, nombre:"TK Fitness Gym", tagline:"Tu mejor versión empieza aquí",
        logo_url:"", direccion:"Av. Principal 123, Guayaquil, Ecuador",
        maps_url:"https://maps.google.com/?q=TK+Fitness+Gym+Guayaquil",
        telefono:"+593991234567", whatsapp:"+593991234567", instagram:"tkfitnessgym",
        horarios_atencion:[{dias:"Lunes a Viernes",apertura:"06:00",cierre:"22:00"},{dias:"Sábado",apertura:"07:00",cierre:"18:00"},{dias:"Domingo",apertura:"08:00",cierre:"14:00"}],
        clases:[{dia:0,hora:"08:00",nombre:"Spinning",instructor:"Carlos R.",duracion_min:45,plazas_total:20,plazas_disponibles:18,tipo:"cardio"}],
        servicios:[{icono:"pesas",nombre:"Sala de pesas"},{icono:"spinning",nombre:"Spinning"},{icono:"yoga",nombre:"Yoga / Pilates"},{icono:"vestuarios",nombre:"Vestuarios"},{icono:"suplementos",nombre:"Suplementos"},{icono:"cardio",nombre:"Zona de cardio"}],
        galeria:[], videos_educativos:[], videos_recetas:[],
        anuncios:[{id:"anuncio_001",titulo:"¡Bienvenido a TK Fitness!",texto:"Estamos felices de tenerte en nuestra familia.",fecha:"2026-06-01",destacado:true}],
        normas:["Trae siempre tu toalla personal.","Limpia el equipo después de usarlo.","Respeta los turnos en las máquinas.","No se permite comida en la sala de pesas."],
        cupones:[{id:"cup_1",titulo:"10% en suplementos",descripcion:"Válido en tienda física del gym.",descuento:"10%",codigo:"FIT10",vence:"2026-07-31"}],
        promociones:[{id:"promo_1",titulo:"Verano sin pereza",descripcion:"Inscríbete este mes y tu segunda mensualidad tiene 20% de descuento.",fecha_fin:"2026-07-15",destacado:true}],
        referidos:{ activo:true, premio_referidor:"1 semana gratis", premio_referido:"10% descuento", descripcion:"Comparte tu código con un amigo." },
        puntos_config:{ activo:true, puntos_por_entreno:10, texto_canje:"Acumula puntos y canjéalos en recepción." }
      });
    }
  };
})();

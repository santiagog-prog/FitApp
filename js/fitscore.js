// ════════════════════════════════════════════════════════════
// fitscore.js — Motor de cálculo del FitScore diario (0–100)
// Factores: nutrición, actividad, hábitos, entrenos, agua
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function score(actual, objetivo, peso){
    if(!objetivo || objetivo <= 0) return 0;
    return clamp(actual / objetivo, 0, 1) * peso;
  }

  window.calcularFitScore = function(alumnoId, fecha){
    fecha = fecha || window.db.fechaHoy();
    var alumno   = window.db.getAlumnoPorId(alumnoId);
    if(!alumno) return null;

    var plan      = window.db.getPlanPorId ? window.db.getPlanPorId(alumno.plan_alimentacion_id) : null;
    var nutricion = window.db.getNutricion(alumnoId, fecha);
    var progreso  = window.db.getProgresoDiario(alumnoId, fecha);
    var registros = window.db.getRegistros(alumnoId);
    var habitos   = window.db.getHabitos(alumnoId);
    var checks    = window.db.getHabitoChecks(alumnoId);
    var diaChecks = (checks[fecha] || {});
    var objetivos = window.db.getObjetivos(alumnoId);

    // ── NUTRICIÓN (30 pts) ───────────────────────────────────
    var calObj  = plan ? plan.calorias_objetivo : 2000;
    var protObj = plan && plan.macros ? plan.macros.proteina : 150;
    var aguaObj = 3000; // ml
    var calActual  = 0;
    var protActual = 0;
    if(nutricion.alimentos){
      nutricion.alimentos.forEach(function(a){ calActual += a.calorias||0; protActual += a.proteina||0; });
    }
    if(nutricion.extras){
      nutricion.extras.forEach(function(a){ calActual += a.calorias||0; protActual += a.proteina||0; });
    }
    var foodScans = window.db.getFoodScans(alumnoId, fecha);
    foodScans.forEach(function(s){ calActual += s.calorias||0; protActual += s.proteinas||0; });

    var puntosCal  = score(calActual,  calObj  * 0.85, 12); // llegar al 85% del objetivo ya es bueno
    var puntosProteina = score(protActual, protObj * 0.85, 10);
    var puntosPlan  = nutricion.opciones ? Object.keys(nutricion.opciones).filter(function(k){ return nutricion.opciones[k]; }).length : 0;
    var puntosPlanN = Math.min(8, puntosPlan * 2);
    var nutricionScore = Math.round(puntosCal + puntosProteina + puntosPlanN);

    // ── ACTIVIDAD / PASOS (25 pts) ───────────────────────────
    var pasosObj = 8000;
    var pasosActual = progreso.pasos || 0;
    // También sumar pasos del cardio.js si existe
    try {
      var cardioKey = "fitapp_pasos_" + alumnoId + "_" + fecha.replace(/-/g,"");
      var cp = JSON.parse(localStorage.getItem(cardioKey)||"0");
      pasosActual = Math.max(pasosActual, cp);
    } catch(e){}
    var actividadScore = Math.round(score(pasosActual, pasosObj, 25));

    // ── HIDRATACIÓN (15 pts) ─────────────────────────────────
    var aguaActual = nutricion.agua || progreso.agua_ml || 0;
    var hidratacionScore = Math.round(score(aguaActual, aguaObj, 15));

    // ── HÁBITOS (15 pts) ────────────────────────────────────
    var habitosTotal  = habitos.length;
    var habitosMarcados = Object.keys(diaChecks).filter(function(k){ return diaChecks[k]; }).length;
    var habitosScore = habitosTotal > 0 ? Math.round(score(habitosMarcados, habitosTotal, 15)) : 8;

    // ── ENTRENO (15 pts) ─────────────────────────────────────
    var entrenoHoy = registros.filter(function(r){ return r.fecha === fecha; });
    var entrenoScore = entrenoHoy.length > 0 ? 15 : 0;

    var total = clamp(nutricionScore + actividadScore + hidratacionScore + habitosScore + entrenoScore, 0, 100);

    var scoreObj = {
      total:        total,
      fecha:        fecha,
      factores: {
        nutricion:    nutricionScore,
        actividad:    actividadScore,
        hidratacion:  hidratacionScore,
        habitos:      habitosScore,
        entreno:      entrenoScore
      }
    };

    window.db.saveFitScore(alumnoId, fecha, scoreObj);
    return scoreObj;
  };

  // ── LOGROS / ACHIEVEMENTS ──────────────────────────────────
  var LOGROS_DEF = [
    { id:"pasos_10k",       icono:"👟", nombre:"10,000 pasos",          desc:"Completa 10,000 pasos en un día",    condicion: function(d){ return (d.pasos||0)>=10000; } },
    { id:"pasos_100k",      icono:"🏃", nombre:"100k pasos acumulados", desc:"Acumula 100,000 pasos en total",     condicion: null },
    { id:"pasos_1M",        icono:"🚀", nombre:"1 millón de pasos",     desc:"Acumula 1,000,000 pasos",            condicion: null },
    { id:"racha_7",         icono:"📅", nombre:"7 días de racha",        desc:"Entrena 7 días consecutivos",        condicion: null },
    { id:"racha_30",        icono:"🔥", nombre:"30 días consecutivos",   desc:"Entrena 30 días consecutivos",       condicion: null },
    { id:"fitscore_90",     icono:"⚡", nombre:"FitScore 90+",           desc:"Obtén FitScore ≥90 en un día",       condicion: null },
    { id:"semana_perfecta", icono:"🌟", nombre:"Semana perfecta",        desc:"FitScore ≥80 los 7 días de la semana", condicion: null },
    { id:"nutricion_100",   icono:"🥗", nombre:"Nutrición completa",     desc:"Completa objetivos nutricionales",   condicion: null },
    { id:"hydration_7",     icono:"💧", nombre:"Hidratado x7",           desc:"3L de agua 7 días seguidos",         condicion: null },
    { id:"entrenos_10",     icono:"💪", nombre:"10 entrenos",            desc:"Completa 10 sesiones",               condicion: null },
    { id:"entrenos_50",     icono:"🏅", nombre:"50 entrenos",            desc:"Completa 50 sesiones",               condicion: null },
    { id:"entrenos_100",    icono:"🏆", nombre:"100 entrenos",           desc:"Completa 100 sesiones",              condicion: null },
    { id:"scan_ai_1",       icono:"🤖", nombre:"Food Scanner",           desc:"Escanea tu primera comida con IA",   condicion: null },
    { id:"objetivo_dia",    icono:"🎯", nombre:"Día objetivo",           desc:"Cumple todos los objetivos del día", condicion: null }
  ];

  window.LOGROS_DEF = LOGROS_DEF;

  window.checkLogros = function(alumnoId){
    var nuevos = [];
    var registros  = window.db.getRegistros(alumnoId);
    var racha      = window.db.calcularRacha(alumnoId);
    var scans      = window.db.getFoodScansHistorial(alumnoId, 30);
    var logrosActuales = window.db.getMedallas(alumnoId);

    function unlock(id){
      if(logrosActuales.indexOf(id)===-1){ window.db.desbloquearMedalla(alumnoId,id); nuevos.push(id); }
    }

    if(registros.length>=10)  unlock("entrenos_10");
    if(registros.length>=50)  unlock("entrenos_50");
    if(registros.length>=100) unlock("entrenos_100");
    if(racha>=7)  unlock("racha_7");
    if(racha>=30) unlock("racha_30");
    if(scans.length>=1) unlock("scan_ai_1");

    // Pasos acumulados
    var totalPasos = 0;
    for(var i=0;i<90;i++){
      var d=new Date(); d.setDate(d.getDate()-i);
      var f=d.getFullYear()+"-"+(d.getMonth()<9?"0":"")+(d.getMonth()+1)+"-"+(d.getDate()<10?"0":"")+d.getDate();
      var p=window.db.getProgresoDiario(alumnoId,f);
      totalPasos+=(p.pasos||0);
    }
    if(totalPasos>=100000) unlock("pasos_100k");
    if(totalPasos>=1000000) unlock("pasos_1M");

    return nuevos;
  };

})();

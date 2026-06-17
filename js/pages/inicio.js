// ════════════════════════════════════════════════════════════
// inicio.js — Page Home del alumno — Dark redesign
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  var FRASES = [
    "El único mal entrenamiento es el que no hiciste.",
    "Tu cuerpo puede. Es tu mente la que hay que convencer.",
    "Progreso, no perfección.",
    "Cada repetición te acerca a quien quieres ser.",
    "Disciplina es hacer lo que toca aunque no tengas ganas.",
    "No compitas con otros. Compite con quien eras ayer.",
    "Un día a la vez. Un rep a la vez.",
    "El dolor de hoy es la fuerza de mañana.",
    "Tus resultados son el reflejo de tu consistencia.",
    "Empieza despacio si hace falta. Pero empieza.",
    "La comodidad no construye músculos.",
    "Hoy te vas a agradecer haber entrenado.",
    "No hay atajos. Hay trabajo y tiempo.",
    "Tu mayor competencia está en el espejo.",
    "El gym no cambia tu vida. Tu decisión de ir sí.",
    "Sé el atleta que admiras.",
    "La constancia vence al talento que no trabaja.",
    "Pequeñas mejoras cada día = resultados enormes.",
    "El cuerpo que quieres está al otro lado de la excusa.",
    "Hoy es un gran día para mejorar."
  ];

  function getFraseDelDia(){
    var inicio = new Date(new Date().getFullYear(), 0, 0);
    var diaAnio = Math.floor((new Date() - inicio) / 86400000);
    return FRASES[diaAnio % FRASES.length];
  }

  function saludoHora(){
    var h = new Date().getHours();
    if(h < 12) return "Buenos días";
    if(h < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  function pad2(n){ return n < 10 ? "0"+n : ""+n; }

  // ── ANILLOS SVG ─────────────────────────────────────────
  function renderStatRings(alumnoId){
    var container = document.getElementById("stat-rings");
    if(!container) return;

    var fecha = window.db.fechaHoy();
    var nutricion = window.db.getNutricion(alumnoId, fecha);
    var registros = window.db.getRegistros(alumnoId);
    var alumno    = window.db.getAlumnoPorId(alumnoId);
    var plan      = alumno ? window.db.getPlanPorId(alumno.plan_alimentacion_id) : null;

    // Kcal del día
    var kcalHoy = 0;
    if(nutricion && nutricion.alimentos){
      nutricion.alimentos.forEach(function(a){ kcalHoy += (a.calorias || 0); });
    }
    // sumar extras
    if(nutricion && nutricion.extras){
      nutricion.extras.forEach(function(a){ kcalHoy += (a.calorias || 0); });
    }
    var kcalObj = plan ? (plan.calorias_objetivo || 2000) : 2000;

    // Agua
    var aguaHoy = (nutricion && nutricion.agua) ? nutricion.agua : 0;

    // Ejercicios hoy
    var ejHoy = 0, ejTotal = 1;
    var regHoy = registros.filter(function(r){ return r.fecha === fecha; });
    if(regHoy.length > 0){
      var ultimo = regHoy[regHoy.length-1];
      ejHoy   = ultimo.ejercicios_completados || 0;
      ejTotal = ultimo.ejercicios_total || 1;
    }

    var racha = window.db.calcularRacha(alumnoId);

    var rings = [
      { valor:kcalHoy, maximo:kcalObj, etiqueta:"Calorías", unidad:"kcal", color:"#FF9500" },
      { valor:ejHoy,   maximo:Math.max(ejTotal,1), etiqueta:"Ejercicios", unidad:"/"+ejTotal, color:"#34C759" },
      { valor:racha,   maximo:30, etiqueta:"Racha", unidad:"días", color:"#C8E000" },
      { valor:aguaHoy, maximo:8,  etiqueta:"Agua",  unidad:"/8",  color:"#0A84FF" }
    ];

    container.innerHTML = rings.map(function(ring){
      var pct = Math.min((ring.valor / ring.maximo) * 100, 100);
      var r = 28, circ = 2 * Math.PI * r;
      var offset = circ - (pct / 100) * circ;
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">' +
        '<svg width="72" height="72" viewBox="0 0 72 72">' +
          '<circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="5"/>' +
          '<circle cx="36" cy="36" r="28" fill="none" stroke="' + ring.color + '" stroke-width="5" ' +
            'stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" ' +
            'stroke-dashoffset="' + offset.toFixed(1) + '" transform="rotate(-90 36 36)" ' +
            'style="transition:stroke-dashoffset 0.8s ease;"/>' +
          '<text x="36" y="33" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">' + ring.valor + '</text>' +
          '<text x="36" y="46" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="rgba(255,255,255,0.35)">' + ring.unidad + '</text>' +
        '</svg>' +
        '<span style="font-size:11px;color:rgba(255,255,255,0.4);font-weight:600;text-align:center;">' + ring.etiqueta + '</span>' +
      '</div>';
    }).join("");
  }

  // ── CALENDARIO MES ───────────────────────────────────────
  var _calState = { anio:new Date().getFullYear(), mes:new Date().getMonth() };

  function renderCalendarioMes(alumnoId){
    var container = document.getElementById("month-calendar");
    if(!container) return;

    var hoy = new Date();
    var anio = _calState.anio, mes = _calState.mes;
    var diasEnMes = new Date(anio, mes+1, 0).getDate();
    var registros = window.db.getRegistros(alumnoId);
    var nombresMes = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    var letras = ["D","L","M","X","J","V","S"];

    var headerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:0 20px 10px;">' +
        '<button onclick="window._navegarMes(-1)" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:22px;cursor:pointer;padding:6px;line-height:1;">‹</button>' +
        '<span style="font-size:15px;font-weight:700;color:#FFF;">' + nombresMes[mes] + ' ' + anio + '</span>' +
        '<button onclick="window._navegarMes(1)"  style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:22px;cursor:pointer;padding:6px;line-height:1;">›</button>' +
      '</div>';

    var diasHTML = '<div id="days-scroll" style="display:flex;gap:6px;overflow-x:auto;padding:0 20px 8px;scrollbar-width:none;-webkit-overflow-scrolling:touch;">';
    for(var d=1; d<=diasEnMes; d++){
      var fecha = new Date(anio, mes, d);
      var fechaStr = anio + "-" + pad2(mes+1) + "-" + pad2(d);
      var esHoy = d===hoy.getDate() && mes===hoy.getMonth() && anio===hoy.getFullYear();
      var tieneEntreno = registros.some(function(r){ return r.fecha === fechaStr; });
      var letra = letras[fecha.getDay()];

      var bg        = esHoy ? "#C8E000" : tieneEntreno ? "rgba(52,199,89,0.12)" : "#1C1C1C";
      var textColor = esHoy ? "#1C1C1E"  : tieneEntreno ? "#34C759" : "rgba(255,255,255,0.7)";
      var letraColor= esHoy ? "#1C1C1E"  : "rgba(255,255,255,0.25)";
      var border    = esHoy ? "none"      : tieneEntreno ? "1px solid rgba(52,199,89,0.25)" : "1px solid rgba(255,255,255,0.05)";

      diasHTML += '<div id="day-' + fechaStr + '" ' +
        'style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;' +
        'min-width:44px;height:64px;border-radius:22px;background:' + bg + ';' +
        'border:' + border + ';cursor:pointer;flex-shrink:0;transition:all 0.2s;">' +
        '<span style="font-size:10px;font-weight:600;color:' + letraColor + ';">' + letra + '</span>' +
        '<span style="font-size:17px;font-weight:700;color:' + textColor + ';">' + d + '</span>' +
        (tieneEntreno
          ? '<div style="width:5px;height:5px;border-radius:50%;background:#34C759;"></div>'
          : '<div style="width:5px;height:5px;"></div>') +
      '</div>';
    }
    diasHTML += '</div>';
    container.innerHTML = headerHTML + diasHTML;

    // scroll al hoy
    setTimeout(function(){
      var todayEl = document.getElementById("day-" + hoy.getFullYear() + "-" + pad2(hoy.getMonth()+1) + "-" + pad2(hoy.getDate()));
      if(todayEl) todayEl.scrollIntoView({ behavior:"smooth", block:"nearest", inline:"center" });
    }, 100);
  }

  window._navegarMes = function(dir){
    _calState.mes += dir;
    if(_calState.mes < 0){ _calState.mes = 11; _calState.anio--; }
    if(_calState.mes > 11){ _calState.mes = 0;  _calState.anio++; }
    var alumnoId = window.db.getAlumnoActual();
    renderCalendarioMes(alumnoId);
  };

  // ── INIT ────────────────────────────────────────────────
  window.init_inicio = function(){
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    if(!alumno) return;

    // Header
    var header = document.getElementById("app-header");
    header.innerHTML =
      "<div class='ah-top'>" +
        "<div class='ah-logo'>" +
          "<svg viewBox='0 0 24 24' fill='#1C1C1E'><path d='M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4'/></svg>" +
        "</div>" +
        "<div class='ah-icons'>" +
          "<button class='ah-icon-btn' onclick=\"window.irAPagina('videos')\" style='position:relative;'>" +
            "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round'><polygon points='23 7 16 12 23 17 23 7'/><rect x='1' y='5' width='15' height='14' rx='2'/></svg>" +
          "</button>" +
          "<button class='ah-icon-btn' style='position:relative;'>" +
            "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round'><path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 01-3.46 0'/></svg>" +
            "<span class='badge-dot'></span>" +
          "</button>" +
          "<div class='ah-avatar' id='ah-avatar-btn'>" + alumno.nombre[0] + (alumno.apellido?alumno.apellido[0]:"") + "</div>" +
        "</div>" +
      "</div>";

    document.getElementById("ah-avatar-btn").addEventListener("click", function(){ window.irAPagina("perfil"); });

    var rutina   = window.db.getRutinaPorId(alumno.rutina_id);
    var registros= window.db.getRegistros(alumno.id);
    var hoy      = new Date();
    var diaSemanaIdx = (hoy.getDay() + 6) % 7;
    var diaRutina= rutina ? rutina.dias[diaSemanaIdx % rutina.dias.length] : null;
    var gym      = window.db.getGymInfo();
    var notas    = window.db.getNotas(alumno.id);

    var page = document.getElementById("page-inicio");
    var html = "<div style='padding:16px 0 0;'>";

    // Saludo
    html += "<div style='padding:0 20px 20px;'>" +
      "<div class='home-greeting-label'>" + saludoHora() + "</div>" +
      "<div class='home-greeting-h'>" + alumno.nombre + ", hoy es<br>un gran día para mejorar.</div>" +
    "</div>";

    // ── Progreso semanal (mini-chart + % + métricas) ─────
    var regsSemana = registros.filter(function(r){
      var d = new Date(r.fecha);
      var diffMs = Date.now() - d.getTime();
      return diffMs >= 0 && diffMs < 7*86400000;
    });
    var diasSemana = rutina ? rutina.dias.filter(function(d){ return d.tipo !== "descanso"; }).length : 5;
    var diasHechos = regsSemana.length;
    var pctSemana  = diasSemana > 0 ? Math.min(100, Math.round(diasHechos / diasSemana * 100)) : 0;

    var fechaHoyStr = window.db.fechaHoy();
    var nutriHoy = window.db.getNutricion(alumno.id, fechaHoyStr);
    var planObj  = window.db.getPlanPorId(alumno.plan_alimentacion_id);
    var kcalObj  = planObj ? (planObj.calorias_objetivo || 2000) : 2000;
    var kcalHoy2 = 0;
    if(nutriHoy && nutriHoy.extras) nutriHoy.extras.forEach(function(a){ kcalHoy2 += (a.calorias||0); });
    var pctNutri = Math.min(100, Math.round(kcalHoy2/kcalObj*100));
    var aguaHoy2 = (nutriHoy && nutriHoy.agua) ? nutriHoy.agua : 0;
    var pctAgua  = Math.round(aguaHoy2/8*100);
    var racha2   = window.db.calcularRacha(alumno.id);

    // Mini sparkline (7 días)
    var spark = "";
    for(var si=6; si>=0; si--){
      var dsp = new Date(); dsp.setDate(dsp.getDate()-si);
      var fsp = dsp.getFullYear()+"-"+pad2(dsp.getMonth()+1)+"-"+pad2(dsp.getDate());
      var hasSp = registros.some(function(r){ return r.fecha===fsp; });
      var xsp = ((6-si)/6*80 + 10).toFixed(1);
      spark += '<circle cx="'+xsp+'" cy="'+(hasSp?"8":"16")+'" r="3" fill="'+(hasSp?"#C8E000":"rgba(255,255,255,0.1)")+'"/>';
    }

    html += "<div class='progreso-semanal-card'>" +
      "<div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;'>" +
        "<div>" +
          "<div style='font-size:11px;font-weight:700;color:rgba(255,255,255,.35);letter-spacing:1px;text-transform:uppercase;'>Tu progreso semanal</div>" +
          "<div style='font-size:44px;font-weight:800;color:#C8E000;letter-spacing:-2px;line-height:1;margin-top:4px;'>" + pctSemana + "%</div>" +
          "<div style='font-size:12px;color:rgba(255,255,255,.35);margin-top:4px;'>Objetivo semanal<br>" + diasHechos + "/" + diasSemana + " días completados</div>" +
        "</div>" +
        "<svg width='100' height='36' viewBox='0 0 100 36'>" +
          '<polyline points="10,28 26,20 42,24 58,14 74,10 90,8" fill="none" stroke="#C8E000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M10,28 26,20 42,24 58,14 74,10 90,8 90,36 10,36 Z" fill="rgba(200,224,0,0.12)"/>' +
        "</svg>" +
      "</div>" +
      "<div class='resumen-4grid'>" +
        "<div class='r4-item'><div class='r4-pct' style='color:#C8E000;'>" + pctNutri + "%</div><div class='r4-icon'>🍽️</div><div class='r4-label'>Nutrición</div></div>" +
        "<div class='r4-item'><div class='r4-pct' style='color:#34C759;'>" + pctSemana + "%</div><div class='r4-icon'>💪</div><div class='r4-label'>Entreno</div></div>" +
        "<div class='r4-item'><div class='r4-pct' style='color:#0A84FF;'>" + pctAgua + "%</div><div class='r4-icon'>💧</div><div class='r4-label'>Hidratación</div></div>" +
        "<div class='r4-item'><div class='r4-pct' style='color:#FF9500;'>" + Math.min(100, racha2*3) + "%</div><div class='r4-icon'>😴</div><div class='r4-label'>Recuperación</div></div>" +
      "</div>" +
    "</div>";

    // Stat rings
    html += "<div class='stat-rings-card'>" +
      "<div id='stat-rings' class='stat-rings-inner'></div>" +
    "</div>";

    // Calendario mes
    html += "<div class='month-calendar-wrap'>" +
      "<div id='month-calendar'></div>" +
    "</div>";

    // Sesión de hoy
    if(diaRutina && diaRutina.tipo !== "descanso"){
      var hechoHoy = registros.some(function(r){ return r.fecha === window.db.fechaHoy(); });
      html += "<div class='hoy-card-dark' id='btn-ir-rutina'>" +
        "<div class='hcd-icon'>" +
          "<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#C8E000' stroke-width='2' stroke-linecap='round'><path d='M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4'/></svg>" +
        "</div>" +
        "<div class='hcd-info'>" +
          "<div class='hcd-label'>Tu siguiente acción</div>" +
          "<div class='hcd-nombre'>" + diaRutina.nombre + "</div>" +
          "<div class='hcd-meta'>Hoy · " + diaRutina.ejercicios.length + " ejercicios" + (hechoHoy ? " · ✓ Completado" : "") + "</div>" +
        "</div>" +
        "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2' stroke-linecap='round'><polyline points='9 18 15 12 9 6'/></svg>" +
      "</div>";
    } else {
      html += "<div style='background:#1C1C1C;border-radius:14px;padding:16px 20px;margin:0 20px 12px;border:1px solid rgba(255,255,255,0.06);'>" +
        "<div style='font-size:14px;color:rgba(255,255,255,0.5);'>🌙 Hoy descansas. La recuperación es parte del entreno.</div>" +
      "</div>";
    }

    // Quick links
    html += "<div class='quick-links-row'>";
    html += "<div class='quick-link-card' id='btn-ir-fotos'><div class='qlc-icon'>📸</div><div class='qlc-name'>Foto semanal</div><div class='qlc-sub'>Compara tu evolución</div></div>";
    html += "<div class='quick-link-card' id='btn-ir-habitos'><div class='qlc-icon'>🎯</div><div class='qlc-name'>Mis hábitos</div><div class='qlc-sub'>Constancia diaria</div></div>";
    if(gym.activo){
      html += "<div class='quick-link-card' id='btn-ir-gym'><div class='qlc-icon'>🏢</div><div class='qlc-name'>" + gym.nombre + "</div><div class='qlc-sub'>Horarios y clases</div></div>";
    }
    html += "</div>";

    // Nota del coach
    if(notas.length){
      var ultima = notas[notas.length-1];
      html += "<div class='nota-coach-dark'>" +
        "<div class='nc-label'>Tu entrenador dice</div>" +
        "<div class='nc-texto'>" + ultima.texto + "</div>" +
        "<div class='nc-fecha'>" + ultima.fecha + "</div>" +
      "</div>";
    }

    // Frase motivacional
    html += "<div class='frase-motivacional'>\"" + getFraseDelDia() + "\"</div>";
    html += "</div>";

    page.innerHTML = html;

    // Events
    renderStatRings(alumno.id);
    renderCalendarioMes(alumno.id);

    var btnRutina = document.getElementById("btn-ir-rutina");
    if(btnRutina) btnRutina.addEventListener("click", function(){ window.irAPagina("agenda"); });
    document.getElementById("btn-ir-fotos").addEventListener("click", function(){ window.irAPagina("fotos"); });
    document.getElementById("btn-ir-habitos").addEventListener("click", function(){ window.irAPagina("habitos"); });
    var btnGym = document.getElementById("btn-ir-gym");
    if(btnGym) btnGym.addEventListener("click", function(){ window.irAPagina("gym"); });
  };
})();

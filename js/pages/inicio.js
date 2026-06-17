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

  // ── ANIMAR NÚMERO ───────────────────────────────────────
  function animarNumero(el, valorFinal, duracionMs, sufijo){
    duracionMs = duracionMs || 800;
    sufijo = sufijo || '';
    var startTime = null;
    function paso(timestamp){
      if(!startTime) startTime = timestamp;
      var progreso = Math.min((timestamp - startTime) / duracionMs, 1);
      var easeOut = 1 - Math.pow(1 - progreso, 3);
      el.textContent = Math.round(valorFinal * easeOut) + sufijo;
      if(progreso < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  // ── NOTIFICACIONES ───────────────────────────────────────
  window.abrirNotificaciones = function(){
    var alumnoId = window.db.getAlumnoActual();
    var notas = window.db.getNotas(alumnoId);
    var modal = document.createElement('div');
    modal.className = 'modal-bottom';
    var itemsHTML = notas.length > 0 ?
      notas.slice().reverse().map(function(n){
        return '<div class="notif-item"><div class="notif-icon">📋</div>' +
          '<div><div style="font-size:14px;color:#FFF;line-height:1.4;">' + n.texto + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px;">' + n.fecha + '</div></div></div>';
      }).join('') :
      '<div style="text-align:center;padding:40px 0;color:rgba(255,255,255,0.3);font-size:14px;">No tienes notificaciones nuevas</div>';
    modal.innerHTML =
      '<div class="modal-bottom-sheet">' +
      '<div class="modal-handle"></div>' +
      '<div class="modal-title">Notificaciones' +
        '<button class="modal-close-btn" onclick="this.closest(\'.modal-bottom\').remove()">×</button>' +
      '</div>' + itemsHTML + '</div>';
    modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
  };

  // ── BÚSQUEDA ─────────────────────────────────────────────
  window.abrirBusqueda = function(){
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:#0A0A0A;z-index:9999;padding:calc(env(safe-area-inset-top) + 16px) 20px 20px;';
    modal.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">' +
        '<input id="search-input" class="search-input" placeholder="Buscar ejercicio, rutina, hábito..." autofocus>' +
        '<button onclick="this.closest(\'[style*=fixed]\').remove()" style="background:none;border:none;color:#C8E000;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;white-space:nowrap;">Cancelar</button>' +
      '</div><div id="search-results"></div>';
    document.body.appendChild(modal);
    setTimeout(function(){ var inp=document.getElementById('search-input'); if(inp) inp.focus(); },100);
    document.getElementById('search-input').addEventListener('input', function(e){ buscarEnApp(e.target.value); });
  };

  function buscarEnApp(query){
    if(!query||query.length<2){ document.getElementById('search-results').innerHTML=''; return; }
    query = query.toLowerCase();
    var ejercicios = window.db.getEjercicios ? window.db.getEjercicios() : [];
    ejercicios = ejercicios.filter(function(e){ return e.nombre.toLowerCase().indexOf(query)!==-1; });
    var resultsEl = document.getElementById('search-results');
    if(!resultsEl) return;
    if(ejercicios.length===0){
      resultsEl.innerHTML='<div style="text-align:center;color:rgba(255,255,255,0.3);padding:40px 0;">Sin resultados para "'+query+'"</div>';
      return;
    }
    resultsEl.innerHTML = ejercicios.slice(0,15).map(function(e){
      return '<div class="search-result-row">' +
        '<div class="search-icon-box"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"><path d="M6 4v16M18 4v16M6 12h12"/></svg></div>' +
        '<div><div style="font-size:14px;color:#FFF;font-weight:500;">' + e.nombre + '</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.4);">' + (e.grupo||'Ejercicio') + '</div></div>' +
      '</div>';
    }).join('');
  }

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
    // Onboarding primera vez
    if(window.mostrarBienvenidaPrimeraVez && window.mostrarBienvenidaPrimeraVez(alumno)) return;

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
          "<button class='ah-icon-btn' onclick='window.abrirBusqueda()' style='position:relative;'>" +
            "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round'><circle cx='11' cy='11' r='8'/><path d='M21 21l-4.35-4.35'/></svg>" +
          "</button>" +
          "<button class='ah-icon-btn' onclick='window.abrirNotificaciones()' style='position:relative;'>" +
            "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round'><path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 01-3.46 0'/></svg>" +
            "<span class='badge-dot'></span>" +
          "</button>" +
          "<div class='ah-avatar' id='ah-avatar-btn' style='overflow:hidden;position:relative;'>" +
            "<span id='ah-avatar-initials'>" + alumno.nombre[0] + (alumno.apellido?alumno.apellido[0]:"") + "</span>" +
            "<img id='ah-avatar-img' src='' style='display:none;position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:50%;'>" +
          "</div>" +
        "</div>" +
      "</div>";

    document.getElementById("ah-avatar-btn").addEventListener("click", function(){ window.irAPagina("perfil"); });
    var savedPhoto = localStorage.getItem("fitapp_avatar_" + alumno.id);
    if(savedPhoto){
      document.getElementById("ah-avatar-initials").style.display = "none";
      var ahImg = document.getElementById("ah-avatar-img");
      ahImg.src = savedPhoto;
      ahImg.style.display = "block";
      // Foto de perfil como fondo suave del header
      header.style.backgroundImage = "linear-gradient(rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.98) 100%), url('" + savedPhoto + "')";
      header.style.backgroundSize = "cover";
      header.style.backgroundPosition = "center top";
    }

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

    // ── FitScore widget ──────────────────────────────────
    var fsObj = window.calcularFitScore ? window.calcularFitScore(alumno.id, window.db.fechaHoy()) : null;
    if(fsObj){
      var fsColors = { nutricion:"#0A84FF", actividad:"#C8E000", hidratacion:"#5AC8FA", habitos:"#BF5AF2", entreno:"#30D158" };
      var fsLabels = { nutricion:"Nutrición", actividad:"Actividad", hidratacion:"Agua", habitos:"Hábitos", entreno:"Entreno" };
      html += "<div class='fitscore-home-card'>";
      html += "<div class='fsc-row'>";
      html += "<div class='fsc-left'><div class='fsc-eyebrow'>FitScore</div><div class='fsc-score-big' id='fsc-num'>0</div><div class='fsc-score-label'>Puntuación de hoy</div></div>";
      html += "<div class='fsc-bars'>";
      Object.keys(fsObj.factores).forEach(function(k){
        var pct = Math.round(fsObj.factores[k]);
        html += "<div class='fsc-bar-row'>" +
          "<div class='fsc-bar-name'>" + (fsLabels[k]||k) + "</div>" +
          "<div class='fsc-bar-track'><div class='fsc-bar-fill' style='width:" + pct + "%;background:" + (fsColors[k]||"#C8E000") + ";'></div></div>" +
          "<div class='fsc-bar-val'>" + pct + "</div>" +
        "</div>";
      });
      html += "</div></div></div>";
    }

    // ── Objetivos del día ────────────────────────────────
    var objetivos = window.db.getObjetivos(alumno.id);
    var fechaHoyStr0 = window.db.fechaHoy();
    if(objetivos.length){
      var objColors = { pasos:"#C8E000", agua:"#5AC8FA", proteina:"#0A84FF", calorias:"#FF9F0A", sueno:"#BF5AF2", entreno:"#30D158" };
      var objIcons  = { pasos:"👟", agua:"💧", proteina:"💪", calorias:"🔥", sueno:"😴", entreno:"🏋️" };
      var progDia   = window.db.getProgresoDiario(alumno.id, fechaHoyStr0);
      var nutriObjHoy = window.db.getNutricion(alumno.id, fechaHoyStr0);
      var kcalObjHoy = 0; var protObjHoy = 0;
      if(nutriObjHoy.extras) nutriObjHoy.extras.forEach(function(a){ kcalObjHoy+=(a.calorias||0); protObjHoy+=(a.proteina||0); });
      window.db.getFoodScans(alumno.id, fechaHoyStr0).forEach(function(s){ kcalObjHoy+=(s.calorias||0); protObjHoy+=(s.proteinas||0); });
      var entHoy = window.db.getRegistros(alumno.id).filter(function(r){ return r.fecha===fechaHoyStr0; }).length;

      var actualMap = { pasos: progDia.pasos||0, agua: (nutriObjHoy.agua||0)*375, proteina: protObjHoy, calorias: kcalObjHoy, sueno: progDia.sueno_h||0, entreno: entHoy };

      html += "<div style='padding:0 20px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;'><div style='font-size:16px;font-weight:800;letter-spacing:-0.3px;'>Objetivos de hoy</div></div>";

      objetivos.slice(0,3).forEach(function(obj){
        var actual = actualMap[obj.tipo] || 0;
        var meta   = obj.meta || 1;
        var pct    = Math.min(100, Math.round(actual / meta * 100));
        var color  = objColors[obj.tipo] || "#C8E000";
        var icon   = objIcons[obj.tipo] || "🎯";
        var restante = Math.max(0, meta - actual);
        var prediccion = "";
        if(obj.tipo === "pasos" && actual > 0){
          var hora = new Date().getHours() + new Date().getMinutes()/60;
          var ritmo = actual / Math.max(1, hora);
          var proyectado = Math.round(ritmo * 24);
          prediccion = proyectado >= meta
            ? "Terminarás el día con ~" + proyectado.toLocaleString() + " pasos"
            : "Necesitas " + Math.round((meta - actual) / Math.max(1,(24-hora))).toLocaleString() + " pasos/h";
        }
        html += "<div class='obj-card'>" +
          "<div class='obj-card-header'>" +
            "<div class='obj-card-icon' style='background:rgba(255,255,255,0.05);'>" + icon + "</div>" +
            "<div><div class='obj-card-title'>" + obj.nombre + "</div>" +
            "<div class='obj-card-sub'>" + actual.toLocaleString() + " / " + meta.toLocaleString() + " " + (obj.unidad||"") + "</div></div>" +
            "<div style='margin-left:auto;font-size:28px;font-weight:900;color:" + color + ";'>" + pct + "%</div>" +
          "</div>" +
          "<div class='obj-prog-track'><div class='obj-prog-fill' style='width:" + pct + "%;background:" + color + ";'></div></div>" +
          "<div class='obj-foot'>" +
            "<div class='obj-remaining'>" + (pct>=100 ? "✅ Completado" : "Faltan " + restante.toLocaleString() + " " + (obj.unidad||"")) + "</div>" +
            (prediccion ? "<div class='obj-prediction'>" + prediccion + "</div>" : "") +
          "</div>" +
        "</div>";
      });
    }

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
          "<div id='pct-semanal-num' style='font-size:44px;font-weight:800;color:#C8E000;letter-spacing:-2px;line-height:1;margin-top:4px;'>0%</div>" +
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

    // Quick action cards rediseñadas
    html += "<div class='quick-action-card' id='btn-ir-fotos'>" +
      "<div class='quick-action-icon-bg foto'>📸</div>" +
      "<div><div class='quick-action-title'>Foto semanal</div><div class='quick-action-sub'>Compara tu evolución</div></div>" +
      "<div class='quick-action-arrow'><svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'><polyline points='9 18 15 12 9 6'/></svg></div>" +
    "</div>";
    html += "<div class='quick-action-card' id='btn-ir-habitos'>" +
      "<div class='quick-action-icon-bg habit'>🎯</div>" +
      "<div><div class='quick-action-title'>Mis hábitos</div><div class='quick-action-sub'>Constancia diaria</div></div>" +
      "<div class='quick-action-arrow'><svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'><polyline points='9 18 15 12 9 6'/></svg></div>" +
    "</div>";
    if(gym.activo){
      html += "<div class='quick-action-card' id='btn-ir-gym'>" +
        "<div class='quick-action-icon-bg gym'>🏢</div>" +
        "<div><div class='quick-action-title'>" + gym.nombre + "</div><div class='quick-action-sub'>Horarios y clases</div></div>" +
        "<div class='quick-action-arrow'><svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'><polyline points='9 18 15 12 9 6'/></svg></div>" +
      "</div>";
    }

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

    // Animar FitScore
    var fscEl = document.getElementById("fsc-num");
    if(fscEl && fsObj) animarNumero(fscEl, fsObj.total, 1000, "");

    // Animar % de progreso semanal
    var pctEl = document.getElementById("pct-semanal-num");
    if(pctEl) animarNumero(pctEl, pctSemana, 900, "%");

    // Tarjeta progreso → Evolución
    var cardProg = document.querySelector(".progreso-semanal-card");
    if(cardProg) cardProg.addEventListener("click", function(){ window.irAPagina("evolucion"); });

    var btnRutina = document.getElementById("btn-ir-rutina");
    if(btnRutina) btnRutina.addEventListener("click", function(){ window.irAPagina("agenda"); });
    document.getElementById("btn-ir-fotos").addEventListener("click", function(){ window.irAPagina("fotos"); });
    document.getElementById("btn-ir-habitos").addEventListener("click", function(){ window.irAPagina("habitos"); });
    var btnGym = document.getElementById("btn-ir-gym");
    if(btnGym) btnGym.addEventListener("click", function(){ window.irAPagina("gym"); });
  };
})();

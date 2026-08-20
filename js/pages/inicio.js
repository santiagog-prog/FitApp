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
          '<div><div style="font-size:14px;color:var(--text);line-height:1.4;">' + n.texto + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">' + n.fecha + '</div></div></div>';
      }).join('') :
      '<div style="text-align:center;padding:40px 0;color:var(--text-muted);font-size:14px;">No tienes notificaciones nuevas</div>';
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
    modal.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9999;padding:calc(env(safe-area-inset-top) + 16px) 20px 20px;';
    modal.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">' +
        '<input id="search-input" class="search-input" placeholder="Buscar ejercicio, rutina, hábito..." autofocus>' +
        '<button onclick="this.closest(\'[style*=fixed]\').remove()" style="background:none;border:none;color:var(--accent-text);font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;white-space:nowrap;">Cancelar</button>' +
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
      resultsEl.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:40px 0;">Sin resultados para "'+query+'"</div>';
      return;
    }
    resultsEl.innerHTML = ejercicios.slice(0,15).map(function(e){
      return '<div class="search-result-row">' +
        '<div class="search-icon-box"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><path d="M6 4v16M18 4v16M6 12h12"/></svg></div>' +
        '<div><div style="font-size:14px;color:var(--text);font-weight:500;">' + e.nombre + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);">' + (e.grupo||'Ejercicio') + '</div></div>' +
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
          '<circle cx="36" cy="36" r="28" fill="none" stroke="rgba(0,0,0,0.07)" stroke-width="5"/>' +
          '<circle cx="36" cy="36" r="28" fill="none" stroke="' + ring.color + '" stroke-width="5" ' +
            'stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" ' +
            'stroke-dashoffset="' + offset.toFixed(1) + '" transform="rotate(-90 36 36)" ' +
            'style="transition:stroke-dashoffset 0.8s ease;"/>' +
          '<text x="36" y="33" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="800" fill="#1C1C1E">' + ring.valor + '</text>' +
          '<text x="36" y="46" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="#8E8E93">' + ring.unidad + '</text>' +
        '</svg>' +
        '<span style="font-size:11px;color:var(--text-muted);font-weight:600;text-align:center;">' + ring.etiqueta + '</span>' +
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
        '<button onclick="window._navegarMes(-1)" style="background:none;border:none;color:var(--text-muted);font-size:22px;cursor:pointer;padding:6px;line-height:1;">‹</button>' +
        '<span style="font-size:15px;font-weight:700;color:var(--text);">' + nombresMes[mes] + ' ' + anio + '</span>' +
        '<button onclick="window._navegarMes(1)"  style="background:none;border:none;color:var(--text-muted);font-size:22px;cursor:pointer;padding:6px;line-height:1;">›</button>' +
      '</div>';

    var diasHTML = '<div id="days-scroll" style="display:flex;gap:6px;overflow-x:auto;padding:0 20px 8px;scrollbar-width:none;-webkit-overflow-scrolling:touch;">';
    for(var d=1; d<=diasEnMes; d++){
      var fecha = new Date(anio, mes, d);
      var fechaStr = anio + "-" + pad2(mes+1) + "-" + pad2(d);
      var esHoy = d===hoy.getDate() && mes===hoy.getMonth() && anio===hoy.getFullYear();
      var tieneEntreno = registros.some(function(r){ return r.fecha === fechaStr; });
      var letra = letras[fecha.getDay()];

      var bg        = esHoy ? "#C8E000" : tieneEntreno ? "rgba(52,199,89,0.10)" : "var(--surface)";
      var textColor = esHoy ? "#1C1C1E"  : tieneEntreno ? "#34C759" : "var(--text)";
      var letraColor= esHoy ? "#1C1C1E"  : "var(--text-muted)";
      var border    = esHoy ? "none"      : tieneEntreno ? "1px solid rgba(52,199,89,0.25)" : "1px solid var(--border)";

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
        "<div class='ah-logo' id='ah-logo-btn' style='cursor:pointer;background:linear-gradient(135deg,#C8E000,#8FB200);border-radius:12px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(200,224,0,0.35);'>" +
          "<svg viewBox='0 0 24 24' fill='none' stroke='#1C1C1E' stroke-width='2.2' stroke-linecap='round' width='20' height='20'><path d='M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4'/></svg>" +
        "</div>" +
        "<div class='ah-icons'>" +
          "<button class='ah-icon-btn' id='ah-btn-videos' style='position:relative;'>" +
            "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='var(--text-secondary)' stroke-width='2' stroke-linecap='round'><polygon points='23 7 16 12 23 17 23 7'/><rect x='1' y='5' width='15' height='14' rx='2'/></svg>" +
          "</button>" +
          "<button class='ah-icon-btn' id='ah-btn-busqueda' style='position:relative;'>" +
            "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='var(--text-secondary)' stroke-width='2' stroke-linecap='round'><circle cx='11' cy='11' r='8'/><path d='M21 21l-4.35-4.35'/></svg>" +
          "</button>" +
          "<button class='ah-icon-btn' id='ah-btn-notif' style='position:relative;'>" +
            "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='var(--text-secondary)' stroke-width='2' stroke-linecap='round'><path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 01-3.46 0'/></svg>" +
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

    var fechaHoyStr = window.db.fechaHoy();
    var hechoHoy = registros.some(function(r){ return r.fecha === fechaHoyStr; });
    var racha2 = window.db.calcularRacha ? window.db.calcularRacha(alumno.id) : 0;
    var nutriHoy = window.db.getNutricion(alumno.id, fechaHoyStr);
    var planObj  = window.db.getPlanPorId(alumno.plan_alimentacion_id);
    var kcalHoy2 = 0;
    if(nutriHoy && nutriHoy.extras) nutriHoy.extras.forEach(function(a){ kcalHoy2 += (a.calorias||0); });
    window.db.getFoodScans(alumno.id, fechaHoyStr).forEach(function(s){ kcalHoy2 += (s.calorias||0); });
    var notas = window.db.getNotas(alumno.id);
    var pasosHoy = (function(){
      var d = new Date();
      var fechaISO = d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());
      // Fuente primaria: Supabase (misma que agenda y cardio)
      var prog = window.db.getProgresoDiario(alumno.id, fechaISO);
      if(prog && prog.pasos > 0) return prog.pasos;
      // Fallback: localStorage
      var k = d.getFullYear()+""+pad2(d.getMonth()+1)+""+pad2(d.getDate());
      try{ var dp=JSON.parse(localStorage.getItem("fitapp_pasos_"+alumno.id+"_"+k)||"null"); return dp?(dp.pasos||0):0; }catch(e){ return 0; }
    })();

    var DIAS_ES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
    var MESES_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    var hoyDate = new Date();
    var fechaLegible = DIAS_ES[hoyDate.getDay()] + ", " + hoyDate.getDate() + " de " + MESES_ES[hoyDate.getMonth()];

    var html = "<div style='padding:20px 0 40px;'>";

    // ── SALUDO ─────────────────────────────────────────
    html += "<div style='padding:0 20px 24px;'>" +
      "<div style='font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:4px;'>" + saludoHora() + " · " + fechaLegible + "</div>" +
      "<div style='font-size:26px;font-weight:900;color:var(--text);letter-spacing:-0.8px;line-height:1.2;'>" + alumno.nombre + " 👋</div>" +
      (racha2 > 0 ? "<div style='display:inline-flex;align-items:center;gap:6px;margin-top:8px;background:rgba(200,224,0,0.1);border:1px solid rgba(200,224,0,0.2);border-radius:50px;padding:5px 12px;'>" +
        "<span style='font-size:14px;'>🔥</span>" +
        "<span style='font-size:12px;font-weight:700;color:var(--accent-text);'>" + racha2 + " días de racha</span>" +
      "</div>" : "") +
    "</div>";

    // ── Strip 7 días de la semana con fechas reales ──────
    (function(){
      var hoyD    = new Date();
      var hoyStr  = window.db.fechaHoy();
      var diaSem  = hoyD.getDay();
      var diffLun = (diaSem + 6) % 7;
      var labels  = ["L","M","X","J","V","S","D"];
      html += "<div style='display:flex;gap:0;padding:0 20px 16px;'>";
      for(var wi = 0; wi < 7; wi++){
        var d = new Date(hoyD);
        d.setDate(hoyD.getDate() - diffLun + wi);
        var f = d.getFullYear() + "-" + pad2(d.getMonth()+1) + "-" + pad2(d.getDate());
        var dayNum   = d.getDate();
        var isHoy    = f === hoyStr;
        var tieneEnt = registros.some(function(r){ return r.fecha === f; });
        html += "<div class='dia-strip-item' data-fecha='" + f + "' style='flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;'>" +
          "<div style='font-size:10px;font-weight:600;color:" + (isHoy ? "var(--accent-text)" : "var(--text-muted)") + ";text-transform:uppercase;letter-spacing:0.5px;'>" + labels[wi] + "</div>" +
          "<div class='dia-strip-circulo' style='width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;" +
            (isHoy
              ? "background:#C8E000;color:#1C1C1E;font-weight:900;"
              : tieneEnt
                ? "background:rgba(90,128,0,0.12);color:var(--accent-text);font-weight:700;border:1.5px solid rgba(90,128,0,0.3);"
                : "background:var(--surface);color:var(--text-muted);font-weight:600;border:1px solid var(--border);") +
            "font-size:13px;'>" + dayNum + "</div>" +
          (tieneEnt && !isHoy ? "<div style='width:5px;height:5px;border-radius:50%;background:#C8E000;opacity:0.6;'></div>" : "<div style='width:5px;height:5px;'></div>") +
        "</div>";
      }
      html += "</div>";
    })();

    // ── Entreno de hoy ───────────────────────────────────
    if(diaRutina && diaRutina.tipo !== "descanso"){
      var hechoHoyT = registros.some(function(r){ return r.fecha === fechaHoyStr; });
      html += "<div style='margin:0 20px 16px;background:" + (hechoHoyT ? "rgba(48,209,88,0.08)" : "var(--surface)") + ";border:1.5px solid " + (hechoHoyT ? "rgba(48,209,88,0.25)" : "var(--border)") + ";border-radius:20px;padding:18px 16px;cursor:pointer;' id='btn-ir-rutina'>" +
        "<div style='display:flex;align-items:center;gap:14px;'>" +
          "<div style='width:46px;height:46px;border-radius:14px;background:" + (hechoHoyT ? "rgba(48,209,88,0.15)" : "rgba(200,224,0,0.12)") + ";display:flex;align-items:center;justify-content:center;flex-shrink:0;'>" +
            (hechoHoyT
              ? "<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#30D158' stroke-width='2.5' stroke-linecap='round'><polyline points='20 6 9 17 4 12'/></svg>"
              : "<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#C8E000' stroke-width='2' stroke-linecap='round'><path d='M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4'/></svg>") +
          "</div>" +
          "<div style='flex:1;min-width:0;'>" +
            "<div style='font-size:11px;font-weight:700;color:" + (hechoHoyT ? "#30D158" : "var(--accent-text)") + ";text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;'>" + (hechoHoyT ? "Completado" : "Hoy") + "</div>" +
            "<div style='font-size:17px;font-weight:800;color:var(--text);letter-spacing:-0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>" + diaRutina.nombre + "</div>" +
            "<div style='font-size:12px;color:var(--text-muted);margin-top:2px;'>" + diaRutina.ejercicios.length + " ejercicios" + (hechoHoyT ? " · ✅ ¡Listo!" : " · Toca para empezar") + "</div>" +
          "</div>" +
          "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='var(--text-muted)' stroke-width='2' stroke-linecap='round'><polyline points='9 18 15 12 9 6'/></svg>" +
        "</div>" +
      "</div>";
    } else {
      html += "<div style='margin:0 20px 16px;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:18px 16px;'>" +
        "<div style='font-size:14px;color:var(--text-muted);'>🌙 Día de descanso activo. La recuperación también cuenta.</div>" +
      "</div>";
    }

    // ── Grid de secciones ────────────────────────────────
    var SECCIONES = [
      { tab:"agenda",    icono:"🏋️", nombre:"Entrenar",       color:"#C8E000" },
      { tab:"nutricion", icono:"🥗", nombre:"Nutrición",      color:"#30D158" },
      { tab:"evolucion", icono:"📊", nombre:"Progreso",       color:"#0A84FF" },
      { tab:"habitos",   icono:"🌿", nombre:"Hábitos",        color:"#BF5AF2" }
    ];
    html += "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 20px 10px;'>";
    SECCIONES.forEach(function(s){
      html += "<div class='home-sec-tile' data-tab='" + s.tab + "' style='background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:18px 16px;cursor:pointer;touch-action:manipulation;'>" +
        "<div style='font-size:28px;margin-bottom:10px;'>" + s.icono + "</div>" +
        "<div style='font-size:15px;font-weight:800;color:var(--text);letter-spacing:-0.2px;'>" + s.nombre + "</div>" +
        "<div style='width:28px;height:3px;border-radius:99px;background:" + s.color + ";margin-top:8px;'></div>" +
      "</div>";
    });
    html += "</div>";
    // Cardio/Pasos — tile ancho
    html += "<div class='home-sec-tile' data-tab='cardio' style='display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:16px 18px;margin:0 20px 20px;cursor:pointer;touch-action:manipulation;'>" +
      "<div style='font-size:28px;'>👟</div>" +
      "<div style='flex:1;'>" +
        "<div style='font-size:15px;font-weight:800;color:var(--text);'>Cardio y Pasos</div>" +
        "<div style='font-size:12px;color:var(--text-muted);margin-top:2px;'>Hoy: <strong style='color:var(--accent-text);'>" + (pasosHoy > 0 ? (pasosHoy > 999 ? (Math.round(pasosHoy/100)/10)+"k" : pasosHoy) + " pasos" : "Sin registrar aún") + "</strong></div>" +
      "</div>" +
      "<div style='width:28px;height:3px;border-radius:99px;background:#5AC8FA;'></div>" +
    "</div>";

    // ── Mini stats ───────────────────────────────────────
    var fsObj = window.calcularFitScore ? window.calcularFitScore(alumno.id, window.db.fechaHoy()) : null;
    html += "<div style='display:flex;gap:8px;margin:0 20px 20px;'>";
    html += "<div style='flex:1;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;' id='mini-fitscore'>" +
      "<div style='font-size:22px;font-weight:900;color:#C8E000;letter-spacing:-1px;'>" + (fsObj ? Math.round(fsObj.total) : "—") + "</div>" +
      "<div style='font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-top:3px;'>FitScore</div>" +
    "</div>";
    html += "<div style='flex:1;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;' id='mini-kcal'>" +
      "<div style='font-size:22px;font-weight:900;color:#FF9F0A;letter-spacing:-1px;'>" + (kcalHoy2 > 0 ? kcalHoy2 : "—") + "</div>" +
      "<div style='font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-top:3px;'>Kcal hoy</div>" +
    "</div>";
    html += "<div style='flex:1;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;' id='mini-pasos'>" +
      "<div style='font-size:22px;font-weight:900;color:#5AC8FA;letter-spacing:-1px;'>" + (pasosHoy > 999 ? (Math.round(pasosHoy/100)/10)+"k" : (pasosHoy > 0 ? pasosHoy : "—")) + "</div>" +
      "<div style='font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-top:3px;'>Pasos</div>" +
    "</div>";
    html += "</div>";

    // ── Frase motivacional ───────────────────────────────
    html += "<div style='padding:0 20px 8px;text-align:center;'>" +
      "<div style='font-size:12px;color:var(--text-muted);font-style:italic;line-height:1.6;'>&ldquo;" + getFraseDelDia() + "&rdquo;</div>" +
    "</div>";

    html += "</div>";

    page.innerHTML = html;

    // ── Logo btn ─────────────────────────────────────────
    var ahLogo = document.getElementById("ah-logo-btn");
    if(ahLogo) ahLogo.addEventListener("click", function(){ window.irAPagina("inicio"); });

    // ── Header buttons ────────────────────────────────────
    var ahVideos = document.getElementById("ah-btn-videos");
    if(ahVideos) ahVideos.addEventListener("click", function(){ window.irAPagina("videos"); });
    var ahBusq = document.getElementById("ah-btn-busqueda");
    if(ahBusq) ahBusq.addEventListener("click", function(){ window.abrirBusqueda(); });
    var ahNotif = document.getElementById("ah-btn-notif");
    if(ahNotif) ahNotif.addEventListener("click", function(){ window.abrirNotificaciones(); });
    var ahAvatar = document.getElementById("ah-avatar-btn");
    if(ahAvatar) ahAvatar.addEventListener("click", function(){ window.irAPagina("perfil"); });

    // ── Ir a rutina ──────────────────────────────────────
    var btnRutina = document.getElementById("btn-ir-rutina");
    if(btnRutina) btnRutina.addEventListener("click", function(){ window.irAPagina("agenda"); });

    // ── Tiles de sección ─────────────────────────────────
    document.querySelectorAll(".home-sec-tile").forEach(function(tile){
      tile.addEventListener("click", function(){ window.irAPagina(this.getAttribute("data-tab")); });
    });

    // ── Mini stats ────────────────────────────────────────
    var mFs = document.getElementById("mini-fitscore");
    if(mFs) mFs.addEventListener("click", function(){ window.irAPagina("evolucion"); });
    var mKc = document.getElementById("mini-kcal");
    if(mKc) mKc.addEventListener("click", function(){ window.irAPagina("nutricion"); });
    var mPa = document.getElementById("mini-pasos");
    if(mPa) mPa.addEventListener("click", function(){ window.irAPagina("cardio"); });

    // ── Días de la semana: clic muestra detalle ──────────
    document.querySelectorAll(".dia-strip-item").forEach(function(el){
      el.addEventListener("click", function(){
        var fecha = this.getAttribute("data-fecha");
        // Resetear todos los círculos
        document.querySelectorAll(".dia-strip-item .dia-strip-circulo").forEach(function(c){
          c.style.outline = "none";
        });
        // Resaltar el seleccionado
        var circulo = this.querySelector(".dia-strip-circulo");
        if(circulo) circulo.style.outline = "2px solid #C8E000";
        // Mostrar detalle del día
        var detalle = document.getElementById("detalle-dia-home");
        if(!detalle){
          var cont = document.createElement("div");
          cont.id = "detalle-dia-home";
          cont.style.cssText = "margin:0 20px 14px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06);";
          var statsGrid = document.querySelector("#page-inicio > div > div[style*='grid-template-columns:1fr 1fr 1fr']");
          if(statsGrid) statsGrid.before(cont);
          detalle = cont;
        }
        var regsDelDia = window.db.getRegistros(window.ALUMNO_ID).filter(function(r){ return r.fecha === fecha; });
        var nutDelDia  = window.db.getNutricion(window.ALUMNO_ID, fecha);
        var kcalDia = 0;
        if(nutDelDia && nutDelDia.extras) nutDelDia.extras.forEach(function(a){ kcalDia += (a.calorias||0); });
        if(nutDelDia && nutDelDia.alimentos) nutDelDia.alimentos.forEach(function(a){ kcalDia += (a.calorias||0); });
        var contenido = "";
        if(regsDelDia.length){
          contenido += regsDelDia.map(function(r){ return '<div style="font-size:13px;font-weight:600;color:var(--text);">✅ ' + r.sesion_nombre + (r.duracion_min ? ' · ' + r.duracion_min + ' min' : '') + '</div>'; }).join("");
        } else {
          contenido += '<div style="font-size:13px;color:var(--text-muted);">Sin entrenamiento este día</div>';
        }
        if(kcalDia > 0) contenido += '<div style="font-size:12px;color:var(--accent-text);font-weight:600;margin-top:6px;">' + kcalDia + ' kcal registradas</div>';
        detalle.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">' + fecha + '</div>' + contenido;
      });
    });
  };
})();

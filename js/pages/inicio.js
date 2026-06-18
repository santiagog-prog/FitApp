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
          "<button class='ah-icon-btn' id='ah-btn-videos' style='position:relative;'>" +
            "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round'><polygon points='23 7 16 12 23 17 23 7'/><rect x='1' y='5' width='15' height='14' rx='2'/></svg>" +
          "</button>" +
          "<button class='ah-icon-btn' id='ah-btn-busqueda' style='position:relative;'>" +
            "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round'><circle cx='11' cy='11' r='8'/><path d='M21 21l-4.35-4.35'/></svg>" +
          "</button>" +
          "<button class='ah-icon-btn' id='ah-btn-notif' style='position:relative;'>" +
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
    html += "<div style='padding:0 20px 14px;'>" +
      "<div class='home-greeting-label'>" + saludoHora() + "</div>" +
      "<div class='home-greeting-h'>" + alumno.nombre + ", hoy es<br>un gran día para mejorar.</div>" +
    "</div>";

    // ── Strip 7 días de la semana con fechas reales ──────
    (function(){
      var hoyD    = new Date();
      var hoyStr  = window.db.fechaHoy();
      // Encontrar el lunes de esta semana
      var diaSem  = hoyD.getDay(); // 0=Dom…6=Sab
      var diffLun = (diaSem + 6) % 7; // días desde lunes
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
          "<div style='font-size:10px;font-weight:600;color:" + (isHoy ? "#C8E000" : "rgba(255,255,255,0.35)") + ";text-transform:uppercase;letter-spacing:0.5px;'>" + labels[wi] + "</div>" +
          "<div class='dia-strip-circulo' style='width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;" +
            (isHoy
              ? "background:#C8E000;color:#1C1C1E;font-weight:900;"
              : tieneEnt
                ? "background:rgba(200,224,0,0.15);color:#C8E000;font-weight:700;border:1.5px solid rgba(200,224,0,0.4);"
                : "background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);font-weight:600;") +
            "font-size:13px;'>" + dayNum + "</div>" +
          (tieneEnt && !isHoy ? "<div style='width:5px;height:5px;border-radius:50%;background:#C8E000;opacity:0.6;'></div>" : "<div style='width:5px;height:5px;'></div>") +
        "</div>";
      }
      html += "</div>";
    })();

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

    // ── Donut macros del día ─────────────────────────────
    (function(){
      var fechaMacros = window.db.fechaHoy();
      var nutM = window.db.getNutricion(alumno.id, fechaMacros);
      var protM=0, carbsM=0, grasM=0;
      var sumarAlimentos = function(lista){ if(!lista) return; lista.forEach(function(a){ protM+=(a.proteina||0); carbsM+=(a.carbos||a.carbohidratos||0); grasM+=(a.grasas||0); }); };
      sumarAlimentos(nutM.alimentos); sumarAlimentos(nutM.extras);
      var scansM = window.db.getFoodScans(alumno.id, fechaMacros);
      scansM.forEach(function(s){ protM+=(s.proteinas||0); carbsM+=(s.carbohidratos||0); grasM+=(s.grasas||0); });
      protM = Math.round(protM); carbsM = Math.round(carbsM); grasM = Math.round(grasM);
      var total = protM + carbsM + grasM;

      // Colores
      var cProt = "#60A5FA"; var cCarbs = "#FBBF24"; var cGras = "#A78BFA";

      // SVG donut
      var R = 46, CX = 60, CY = 60, stroke = 10;
      var circ = 2 * Math.PI * R;

      function arcOffset(val){ return total > 0 ? circ - (val/total)*circ : circ; }
      function arcRotate(prevVals){ var s = 0; prevVals.forEach(function(v){ s += v; }); return total > 0 ? -90 + (s/total)*360 : -90; }

      var offProt  = arcOffset(protM);
      var offCarbs = arcOffset(carbsM);
      var offGras  = arcOffset(grasM);
      var rotProt  = arcRotate([]);
      var rotCarbs = arcRotate([protM]);
      var rotGras  = arcRotate([protM, carbsM]);

      var svgDonut = total > 0
        ? '<svg width="120" height="120" viewBox="0 0 120 120">' +
            '<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="'+stroke+'"/>' +
            '<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" fill="none" stroke="'+cProt+'" stroke-width="'+stroke+'" stroke-dasharray="'+circ.toFixed(1)+'" stroke-dashoffset="'+offProt.toFixed(1)+'" transform="rotate('+rotProt+' '+CX+' '+CY+')" stroke-linecap="butt"/>' +
            '<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" fill="none" stroke="'+cCarbs+'" stroke-width="'+stroke+'" stroke-dasharray="'+circ.toFixed(1)+'" stroke-dashoffset="'+offCarbs.toFixed(1)+'" transform="rotate('+rotCarbs+' '+CX+' '+CY+')" stroke-linecap="butt"/>' +
            '<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" fill="none" stroke="'+cGras+'" stroke-width="'+stroke+'" stroke-dasharray="'+circ.toFixed(1)+'" stroke-dashoffset="'+offGras.toFixed(1)+'" transform="rotate('+rotGras+' '+CX+' '+CY+')" stroke-linecap="butt"/>' +
            '<text x="'+CX+'" y="55" text-anchor="middle" font-family="Inter,sans-serif" font-size="16" font-weight="900" fill="#FFF">'+total+'</text>' +
            '<text x="'+CX+'" y="70" text-anchor="middle" font-family="Inter,sans-serif" font-size="9" fill="rgba(255,255,255,0.4)">gramos</text>' +
          '</svg>'
        : '<svg width="120" height="120" viewBox="0 0 120 120">' +
            '<circle cx="'+CX+'" cy="'+CY+'" r="'+R+'" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="'+stroke+'"/>' +
            '<text x="'+CX+'" y="'+CY+'" text-anchor="middle" dominant-baseline="middle" font-family="Inter,sans-serif" font-size="11" fill="rgba(255,255,255,0.3)">Sin datos</text>' +
          '</svg>';

      html += '<div id="macros-home-card" style="background:#141414;border-radius:20px;margin:0 20px 14px;padding:20px;cursor:pointer;">' +
        '<div style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px;">Macros de hoy</div>' +
        '<div style="display:flex;align-items:center;gap:20px;">' +
          svgDonut +
          '<div style="flex:1;display:flex;flex-direction:column;gap:10px;">' +
            '<div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:'+cProt+';flex-shrink:0;"></div><div style="flex:1;"><div style="font-size:12px;color:rgba(255,255,255,0.5);">Proteína</div><div style="font-size:18px;font-weight:800;color:#FFF;">'+protM+'<span style="font-size:11px;font-weight:500;color:rgba(255,255,255,0.4);margin-left:2px;">g</span></div></div></div>' +
            '<div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:'+cCarbs+';flex-shrink:0;"></div><div style="flex:1;"><div style="font-size:12px;color:rgba(255,255,255,0.5);">Carbos</div><div style="font-size:18px;font-weight:800;color:#FFF;">'+carbsM+'<span style="font-size:11px;font-weight:500;color:rgba(255,255,255,0.4);margin-left:2px;">g</span></div></div></div>' +
            '<div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:'+cGras+';flex-shrink:0;"></div><div style="flex:1;"><div style="font-size:12px;color:rgba(255,255,255,0.5);">Grasas</div><div style="font-size:18px;font-weight:800;color:#FFF;">'+grasM+'<span style="font-size:11px;font-weight:500;color:rgba(255,255,255,0.4);margin-left:2px;">g</span></div></div></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    })();

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

    // ── Datos para el resto del home ────────────────────
    var fechaHoyStr = window.db.fechaHoy();
    var racha2 = window.db.calcularRacha(alumno.id);
    var nutriHoy = window.db.getNutricion(alumno.id, fechaHoyStr);
    var planObj  = window.db.getPlanPorId(alumno.plan_alimentacion_id);
    var kcalObj  = planObj ? (planObj.calorias_objetivo || 2000) : 2000;
    var kcalHoy2 = 0;
    if(nutriHoy && nutriHoy.extras) nutriHoy.extras.forEach(function(a){ kcalHoy2 += (a.calorias||0); });
    var pasosHoy = (function(){
      var alumnoId2 = alumno.id;
      var d2 = new Date(); var k2 = d2.getFullYear()+""+pad2(d2.getMonth()+1)+""+pad2(d2.getDate());
      try{ var dp = JSON.parse(localStorage.getItem("fitapp_pasos_"+alumnoId2+"_"+k2)||"null"); return dp?(dp.pasos||0):0; }catch(e){ return 0; }
    })();

    // ── Sesión de hoy ───────────────────────────────────
    if(diaRutina && diaRutina.tipo !== "descanso"){
      var hechoHoy = registros.some(function(r){ return r.fecha === fechaHoyStr; });
      html += "<div class='hoy-card-dark' id='btn-ir-rutina' style='margin-bottom:12px;'>" +
        "<div class='hcd-icon" + (hechoHoy ? "' style='background:rgba(48,209,88,0.15);'" : "'") + ">" +
          (hechoHoy
            ? "<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#30D158' stroke-width='2.5' stroke-linecap='round'><polyline points='20 6 9 17 4 12'/></svg>"
            : "<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#C8E000' stroke-width='2' stroke-linecap='round'><path d='M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4'/></svg>") +
        "</div>" +
        "<div class='hcd-info'>" +
          "<div class='hcd-label'>" + (hechoHoy ? "Completado hoy" : "Tu entreno de hoy") + "</div>" +
          "<div class='hcd-nombre'>" + diaRutina.nombre + "</div>" +
          "<div class='hcd-meta'>" + diaRutina.ejercicios.length + " ejercicios" + (hechoHoy ? " · ✅ ¡Hecho!" : " · Toca para empezar") + "</div>" +
        "</div>" +
        "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.25)' stroke-width='2' stroke-linecap='round'><polyline points='9 18 15 12 9 6'/></svg>" +
      "</div>";
    } else {
      html += "<div style='background:var(--surface);border-radius:var(--radius);padding:16px 20px;margin:0 20px 12px;border:1px solid var(--border);'>" +
        "<div style='font-size:14px;color:var(--text-secondary);'>🌙 Día de descanso. La recuperación es parte del progreso.</div>" +
      "</div>";
    }

    // ── Tabla de progreso semanal ───────────────────────
    (function(){
      var labels7  = ["L","M","X","J","V","S","D"];
      var hoyD7    = new Date();
      var diffLun7 = (hoyD7.getDay() + 6) % 7;
      var semData  = [];
      for(var wi7=0; wi7<7; wi7++){
        var d7 = new Date(hoyD7); d7.setDate(hoyD7.getDate()-diffLun7+wi7);
        var f7 = d7.getFullYear()+"-"+pad2(d7.getMonth()+1)+"-"+pad2(d7.getDate());
        var nutW   = window.db.getNutricion(alumno.id, f7);
        var kcalW  = 0;
        if(nutW.extras) nutW.extras.forEach(function(a){ kcalW+=(a.calorias||0); });
        var scansW = window.db.getFoodScans(alumno.id, f7);
        scansW.forEach(function(s){ kcalW+=(s.calorias||0); });
        var pasosW = (function(){
          var k7 = d7.getFullYear()+""+pad2(d7.getMonth()+1)+""+pad2(d7.getDate());
          try{ var dp7=JSON.parse(localStorage.getItem("fitapp_pasos_"+alumno.id+"_"+k7)||"null"); return dp7?(dp7.pasos||0):0; }catch(e){ return 0; }
        })();
        var entW = registros.filter(function(r){ return r.fecha===f7; }).length;
        var habW = window.db.getHabitoChecks(alumno.id);
        var habHoyW = habW[f7] || {};
        var habDoneW = Object.keys(habHoyW).filter(function(k){ return habHoyW[k]; }).length;
        semData.push({ label:labels7[wi7], dia:d7.getDate(), kcal:kcalW, pasos:pasosW, entreno:entW, habitos:habDoneW, esHoy:wi7===diffLun7 });
      }
      var planObj2 = window.db.getPlanPorId(alumno.plan_alimentacion_id);
      var kcalMeta = planObj2 ? (planObj2.calorias_objetivo||2000) : 2000;

      html += '<div style="margin:0 20px 14px;">';
      html += '<div style="font-size:16px;font-weight:800;letter-spacing:-0.3px;margin-bottom:10px;">Progreso semanal</div>';
      html += '<div style="background:#141414;border-radius:20px;overflow:hidden;">';
      // Header row
      html += '<div style="display:grid;grid-template-columns:36px 1fr 1fr 1fr 1fr;gap:0;border-bottom:1px solid rgba(255,255,255,0.05);">';
      html += '<div style="padding:10px 8px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.25);text-align:center;"></div>';
      ['Kcal','Pasos','Entreno','Hábitos'].forEach(function(h){
        html += '<div style="padding:10px 6px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.35);text-align:center;text-transform:uppercase;letter-spacing:.4px;">'+h+'</div>';
      });
      html += '</div>';
      // Data rows
      semData.forEach(function(row){
        var rowBg = row.esHoy ? 'background:rgba(200,224,0,0.05);' : '';
        var dayColor = row.esHoy ? '#C8E000' : 'rgba(255,255,255,0.6)';
        var kcalPct = Math.min(100, Math.round(row.kcal/kcalMeta*100));
        var pasosPct = Math.min(100, Math.round(row.pasos/10000*100));
        function cell(pct, color, val, fmt){
          var dot = pct>=80 ? '●' : pct>=40 ? '◐' : pct>0 ? '○' : '·';
          var dc  = pct>=80 ? color : pct>=40 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)';
          return '<div style="padding:10px 6px;text-align:center;">' +
            '<div style="font-size:11px;color:'+dc+';font-weight:700;">'+(pct>0?fmt:'—')+'</div>' +
          '</div>';
        }
        html += '<div style="display:grid;grid-template-columns:36px 1fr 1fr 1fr 1fr;gap:0;border-bottom:1px solid rgba(255,255,255,0.04);'+rowBg+'">';
        html += '<div style="padding:10px 0;text-align:center;"><div style="font-size:10px;font-weight:700;color:'+dayColor+';">'+row.label+'</div><div style="font-size:9px;color:rgba(255,255,255,0.2);">'+row.dia+'</div></div>';
        html += cell(kcalPct, '#FF9F0A', row.kcal, row.kcal>0?(row.kcal>999?(Math.round(row.kcal/100)/10)+'k':row.kcal):'—');
        html += cell(pasosPct,'#5AC8FA', row.pasos, row.pasos>0?(row.pasos>999?(Math.round(row.pasos/100)/10)+'k':row.pasos):'—');
        html += '<div style="padding:10px 6px;text-align:center;"><div style="font-size:14px;">'+(row.entreno>0?'✅':'·')+'</div></div>';
        html += '<div style="padding:10px 6px;text-align:center;"><div style="font-size:11px;font-weight:700;color:'+(row.habitos>0?'#BF5AF2':'rgba(255,255,255,0.15)')+';">'+(row.habitos>0?row.habitos:'—')+'</div></div>';
        html += '</div>';
      });
      html += '</div></div>';
    })();

    // ── Stats row compacto ──────────────────────────────
    html += "<div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:0 20px 14px;'>";
    // Racha
    html += "<div id='stat-racha-card' style='background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 12px;text-align:center;cursor:pointer;'>" +
      "<div style='font-size:24px;font-weight:900;color:#FF9F0A;letter-spacing:-1px;'>" + racha2 + "</div>" +
      "<div style='font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-top:3px;'>🔥 Racha</div>" +
    "</div>";
    // Kcal hoy
    html += "<div id='stat-kcal-card' style='background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 12px;text-align:center;cursor:pointer;'>" +
      "<div style='font-size:24px;font-weight:900;color:#C8E000;letter-spacing:-1px;'>" + kcalHoy2 + "</div>" +
      "<div style='font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-top:3px;'>🍽️ Kcal</div>" +
    "</div>";
    // Pasos hoy
    html += "<div style='background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 12px;text-align:center;cursor:pointer;' id='stat-pasos-card'>" +
      "<div style='font-size:24px;font-weight:900;color:#5AC8FA;letter-spacing:-1px;'>" + (pasosHoy > 999 ? (Math.round(pasosHoy/100)/10)+"k" : pasosHoy) + "</div>" +
      "<div style='font-size:10px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-top:3px;'>👟 Pasos</div>" +
    "</div>";
    html += "</div>";

    // ── Nota del coach ──────────────────────────────────
    if(notas.length){
      var ultima = notas[notas.length-1];
      html += "<div class='nota-coach-dark'>" +
        "<div class='nc-label'>Tu entrenador dice</div>" +
        "<div class='nc-texto'>" + ultima.texto + "</div>" +
        "<div class='nc-fecha'>" + ultima.fecha + "</div>" +
      "</div>";
    }

    // ── Frase motivacional ──────────────────────────────
    html += "<div class='frase-motivacional'>\"" + getFraseDelDia() + "\"</div>";
    html += "</div>";

    page.innerHTML = html;

    // ── FitScore animado ────────────────────────────────
    var fscEl = document.getElementById("fsc-num");
    if(fscEl && fsObj) animarNumero(fscEl, fsObj.total, 1000, "");

    // ── Header: botones videos, búsqueda, notificaciones ─
    var ahVideos = document.getElementById("ah-btn-videos");
    if(ahVideos) ahVideos.addEventListener("click", function(){ window.irAPagina("videos"); });
    var ahBusq = document.getElementById("ah-btn-busqueda");
    if(ahBusq) ahBusq.addEventListener("click", function(){ window.abrirBusqueda(); });
    var ahNotif = document.getElementById("ah-btn-notif");
    if(ahNotif) ahNotif.addEventListener("click", function(){ window.abrirNotificaciones(); });

    // ── Avatar en header ─────────────────────────────────
    var ahAvatar = document.getElementById("ah-avatar-btn");
    if(ahAvatar) ahAvatar.addEventListener("click", function(){ window.irAPagina("perfil"); });

    // ── Ir a rutina ──────────────────────────────────────
    var btnRutina = document.getElementById("btn-ir-rutina");
    if(btnRutina) btnRutina.addEventListener("click", function(){ window.irAPagina("agenda"); });

    // ── Stats clickeables ────────────────────────────────
    var statRacha = document.getElementById("stat-racha-card");
    if(statRacha) statRacha.addEventListener("click", function(){ window.irAPagina("evolucion"); });
    var statKcal = document.getElementById("stat-kcal-card");
    if(statKcal) statKcal.addEventListener("click", function(){ window.irAPagina("nutricion"); });
    var statPasos = document.getElementById("stat-pasos-card");
    if(statPasos) statPasos.addEventListener("click", function(){ window.irAPagina("cardio"); });

    // ── Macros donut → Nutrición ─────────────────────────
    var macrosCard = document.getElementById("macros-home-card");
    if(macrosCard) macrosCard.addEventListener("click", function(){ window.irAPagina("nutricion"); });

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
          cont.style.cssText = "margin:0 20px 14px;background:#141414;border-radius:14px;padding:14px;";
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
          contenido += regsDelDia.map(function(r){ return '<div style="font-size:13px;font-weight:600;color:#FFF;">✅ ' + r.sesion_nombre + (r.duracion_min ? ' · ' + r.duracion_min + ' min' : '') + '</div>'; }).join("");
        } else {
          contenido += '<div style="font-size:13px;color:rgba(255,255,255,0.3);">Sin entrenamiento este día</div>';
        }
        if(kcalDia > 0) contenido += '<div style="font-size:12px;color:#C8E000;margin-top:6px;">' + kcalDia + ' kcal registradas</div>';
        detalle.innerHTML = '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">' + fecha + '</div>' + contenido;
      });
    });
  };
})();

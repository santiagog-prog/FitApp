// ════════════════════════════════════════════════════════════
// agenda.js — Page Agenda: semana, días, sesión de ejercicios, modo entreno
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  var state = { weekOffset:0, selectedDate:null, vista:"lista", diaActual:null, completados:{} };
  var sesionInicio = null, sesionTimerInterval = null;
  var DIAS_L = ["L","M","X","J","V","S","D"];
  var MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

  function lunesDeSemana(offset){
    var hoy = new Date();
    var diaIdx = (hoy.getDay() + 6) % 7;
    var lunes = new Date(hoy); lunes.setDate(hoy.getDate() - diaIdx + offset*7);
    return lunes;
  }
  function fechaKey(d){ return d.toISOString().split("T")[0]; }

  function renderHeader(titulo, conBack, onBack){
    if(conBack) window.renderHeaderDetalle(titulo, onBack);
    else window.renderHeaderPrincipal(titulo, window.iconoSVG("calendar"));
  }

  function renderLista(){
    state.vista = "lista";
    var fabPrevio = document.getElementById("fab-modo-entreno");
    if(fabPrevio) fabPrevio.remove();
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var rutina = window.db.getRutinaPorId(alumno.rutina_id);
    var registros = window.db.getRegistros(alumno.id);
    renderHeader("Agenda", false);

    var lunes = lunesDeSemana(state.weekOffset);
    var domingo = new Date(lunes); domingo.setDate(lunes.getDate()+6);
    if(!state.selectedDate) state.selectedDate = fechaKey(new Date());

    var html = "<div class='semana-selector'>" +
      "<button id='ag-prev'>‹</button>" +
      "<span>" + lunes.getDate() + " " + MESES[lunes.getMonth()].substr(0,3) + " - " + domingo.getDate() + " " + MESES[domingo.getMonth()].substr(0,3) + "</span>" +
      "<button id='ag-next'>›</button></div>";

    html += "<div class='dias-pills'>";
    var diasInfo = [];
    for(var i=0; i<7; i++){
      var d = new Date(lunes); d.setDate(lunes.getDate()+i);
      var key = fechaKey(d);
      var esHoy = key === fechaKey(new Date());
      var sel = key === state.selectedDate;
      var hecho = registros.filter(function(r){ return r.fecha === key; }).length > 0;
      diasInfo.push({d:d, key:key});
      html += "<div class='dia-pill" + (sel?" selected":"") + (esHoy?" today":"") + "' data-key='" + key + "'>" +
        "<span class='dp-letra'>" + DIAS_L[i] + "</span><span class='dp-num'>" + d.getDate() + "</span>" +
        "<div class='dp-dots'><span class='dp-dot' style='background:" + (hecho?"#4CAF50":"#E0E0E0") + ";'></span></div></div>";
    }
    html += "</div>";

    var completadosSemana = diasInfo.filter(function(di){ return registros.filter(function(r){ return r.fecha === di.key; }).length > 0; }).length;
    html += "<div class='progreso-semana-bar'><div class='fill' style='width:" + (completadosSemana/7*100) + "%;'></div></div>";
    html += "<p style='padding:0 16px;font-size:.8rem;color:var(--text-muted);margin-bottom:10px;'>" + completadosSemana + " de 7 días con actividad</p>";

    var selDate = new Date(state.selectedDate);
    var selDiaIdx = (selDate.getDay() + 6) % 7;
    var diaRutina = rutina ? rutina.dias[selDiaIdx % rutina.dias.length] : null;
    var hechoEseDia = registros.filter(function(r){ return r.fecha === state.selectedDate; }).length > 0;

    if(diaRutina && diaRutina.tipo !== "descanso"){
      html += "<div class='actividad-row" + (hechoEseDia ? " completada" : "") + "' id='ag-act-rutina'>" +
        "<div class='act-icon " + (hechoEseDia ? "ok" : "pendiente") + "'>" + window.iconoSVG(hechoEseDia ? "calendar" : "barbell") + "</div>" +
        "<div class='act-body'><div class='act-nombre" + (hechoEseDia?" done":"") + "'>" + diaRutina.nombre + "</div>" +
        "<div class='act-estado'>" + (hechoEseDia ? "Completado" : diaRutina.ejercicios.length + " ejercicios") + "</div></div>" +
        "<span class='act-arrow'>→</span></div>";
    } else {
      html += "<div class='actividad-row'><div class='act-icon nutri'>" + window.iconoSVG("calendar") + "</div>" +
        "<div class='act-body'><div class='act-nombre'>Día de descanso</div><div class='act-estado'>Sin sesión programada</div></div></div>";
    }

    page().innerHTML = html;

    document.getElementById("ag-prev").addEventListener("click", function(){ state.weekOffset--; state.selectedDate=null; renderLista(); });
    document.getElementById("ag-next").addEventListener("click", function(){ state.weekOffset++; state.selectedDate=null; renderLista(); });
    document.querySelectorAll(".dia-pill").forEach(function(p){
      p.addEventListener("click", function(){ state.selectedDate = this.getAttribute("data-key"); renderLista(); });
    });
    var actRutina = document.getElementById("ag-act-rutina");
    if(actRutina) actRutina.addEventListener("click", function(){ abrirSesion(diaRutina, rutina); });
  }

  function page(){ return document.getElementById("page-agenda"); }

  function pad2(n){ return n < 10 ? "0"+n : ""+n; }
  function detenerTimerSesion(){
    if(sesionTimerInterval){ clearInterval(sesionTimerInterval); sesionTimerInterval = null; }
  }
  function minutosTranscurridos(){
    if(!sesionInicio) return 0;
    return Math.max(1, Math.round((Date.now() - sesionInicio) / 60000));
  }

  function abrirSesion(diaRutina, rutina){
    state.vista = "sesion";
    state.diaActual = diaRutina;
    state.completados = {};
    renderHeader(diaRutina.nombre, true, function(){ detenerTimerSesion(); renderLista(); });

    var html = "<div class='px' style='padding-top:10px;display:flex;justify-content:space-between;align-items:center;'>" +
      "<span class='chip-dark'>" + (rutina.mesociclo || "") + "</span>" +
      "<span class='timer-sesion' id='timer-sesion'>⏱ 00:00</span></div>";

    diaRutina.ejercicios.forEach(function(ej, idx){
      html += renderEjercicioRow(ej, idx);
    });

    page().innerHTML = html + "<div style='height:70px;'></div>";
    bindEjercicios(diaRutina);

    sesionInicio = Date.now();
    detenerTimerSesion();
    sesionTimerInterval = setInterval(function(){
      var totalSeg = Math.floor((Date.now() - sesionInicio) / 1000);
      var el = document.getElementById("timer-sesion");
      if(!el){ detenerTimerSesion(); return; }
      el.textContent = "⏱ " + pad2(Math.floor(totalSeg/60)) + ":" + pad2(totalSeg%60);
    }, 1000);

    var fab = document.createElement("button");
    fab.className = "fab-modo-entreno";
    fab.innerHTML = window.iconoSVG("play");
    fab.id = "fab-modo-entreno";
    document.getElementById("app-alumno").appendChild(fab);
    fab.addEventListener("click", function(){ abrirModoEntreno(diaRutina); });
  }

  function renderEjercicioRow(ej, idx){
    var setsRows = ej.sets.map(function(s, si){
      return "<tr><td>" + (si+1) + "ª</td><td>" + s.reps + "</td>" +
        "<td><input type='number' class='in-reps' data-idx='" + idx + "' data-si='" + si + "' value='" + s.reps + "'></td>" +
        "<td><input type='number' class='in-peso' data-idx='" + idx + "' data-si='" + si + "' value='" + s.peso + "'></td></tr>";
    }).join("");
    var placeholderHtml = "<div class='foto-mini placeholder'>" + window.iconoSVG("barbell") + "</div>";
    var fotoHtml = ej.foto
      ? "<img class='foto-mini' src='../assets/img/ejercicios/" + ej.foto + ".webp' data-idx='" + idx + "' onerror=\"this.style.display='none'; this.insertAdjacentHTML('afterend', this.dataset.ph)\" data-ph=\"" + placeholderHtml.replace(/\"/g,"&quot;") + "\">"
      : placeholderHtml;

    return "<div class='ejercicio-row' data-idx='" + idx + "'>" +
      "<div class='ejercicio-row-head'>" + fotoHtml +
      "<div class='er-info'><div class='er-nombre'>" + ej.nombre + "</div>" +
      "<div class='er-meta'>" + ej.series + " series · " + ej.grupo + "</div></div>" +
      "<span class='er-chevron'>⌄</span></div>" +
      "<div class='ejercicio-row-body collapsed'>" +
      "<div class='er-detalle'>" +
      "<p>📋 " + ej.series + " series x " + ej.repeticiones + "</p>" +
      "<p>⏱ " + ej.descanso_seg + "'' de descanso</p>" +
      "<p>ℹ️ " + ej.nota_tecnica + "</p></div>" +
      (ej.como_hacer ? "<details class='como-hacer-acordeon'><summary>📖 Cómo hacer este ejercicio</summary><p>" + ej.como_hacer.replace(/\n/g,"<br>") + "</p></details>" : "") +
      (ej.video_url ? "<button class='btn-video-ver' data-idx='" + idx + "'>📹 Ver técnica en vídeo</button>" : "") +
      "<table class='sets-table-alumno'><tr><th>Serie</th><th>Obj.</th><th>Reps</th><th>Kg</th></tr>" + setsRows + "</table>" +
      "<button class='pill-completado' data-idx='" + idx + "'>Marcar hecho</button>" +
      "</div></div>";
  }

  function bindEjercicios(diaRutina){
    page().querySelectorAll(".ejercicio-row-head").forEach(function(head){
      head.addEventListener("click", function(){
        var row = this.parentElement;
        row.classList.toggle("open");
        row.querySelector(".ejercicio-row-body").classList.toggle("collapsed");
      });
    });
    page().querySelectorAll(".btn-video-ver").forEach(function(btn){
      btn.addEventListener("click", function(e){
        e.stopPropagation();
        var idx = parseInt(this.getAttribute("data-idx"), 10);
        window.abrirModalVideo(diaRutina.ejercicios[idx].video_url, diaRutina.ejercicios[idx].nombre);
      });
    });
    page().querySelectorAll(".in-reps, .in-peso").forEach(function(inp){
      inp.addEventListener("click", function(e){ e.stopPropagation(); });
    });
    page().querySelectorAll(".pill-completado").forEach(function(btn){
      btn.addEventListener("click", function(e){
        e.stopPropagation();
        var idx = this.getAttribute("data-idx");
        var done = !btn.classList.contains("done");
        btn.textContent = done ? "✓ Completado" : "Marcar hecho";
        btn.classList.toggle("done", done);
        state.completados[idx] = done;
        var totalEj = diaRutina.ejercicios.length;
        var hechos = Object.keys(state.completados).filter(function(k){ return state.completados[k]; }).length;
        if(hechos === totalEj) finalizarSesion(diaRutina);
      });
    });
  }

  function finalizarSesion(diaRutina){
    detenerTimerSesion();
    var minutos = minutosTranscurridos();
    window.lanzarConfetti();
    var modal = document.createElement("div");
    modal.className = "modal-celebracion";
    modal.innerHTML = "<div class='mc-card'>" +
      "<h2>🎉 ¡Sesión completada!</h2>" +
      "<div class='mc-resumen'>" + diaRutina.ejercicios.length + " ejercicios · " + minutos + " minutos</div>" +
      "<div class='mc-sensacion'>" +
      ["😫","😕","😐","💪","🔥"].map(function(e,i){ return "<span data-val='" + (i+1) + "'>" + e + "</span>"; }).join("") +
      "</div>" +
      "<textarea rows='2' placeholder='Nota personal (opcional)' id='mc-nota'></textarea>" +
      "<button class='pill-btn' id='mc-guardar'>Guardar y cerrar</button>" +
      "</div>";
    document.body.appendChild(modal);

    var sensacion = 4;
    modal.querySelectorAll(".mc-sensacion span").forEach(function(s){
      s.addEventListener("click", function(){
        modal.querySelectorAll(".mc-sensacion span").forEach(function(x){ x.classList.remove("sel"); });
        s.classList.add("sel");
        sensacion = parseInt(s.getAttribute("data-val"), 10);
      });
    });

    document.getElementById("mc-guardar").addEventListener("click", function(){
      var nota = document.getElementById("mc-nota").value;
      var nuevas = window.db.saveRegistro(window.ALUMNO_ID, {
        fecha: window.db.fechaHoy(), dia_numero: diaRutina.numero, sesion_nombre: diaRutina.nombre,
        duracion_min: minutos, sensacion: sensacion, nota: nota
      });
      modal.remove();
      var fab = document.getElementById("fab-modo-entreno");
      if(fab) fab.remove();
      renderLista();
      window.mostrarMedallasNuevas(nuevas);
    });
  }

  function abrirModoEntreno(diaRutina){
    var idx = 0;
    var overlay = document.createElement("div");
    overlay.className = "modo-entreno-overlay";
    document.body.appendChild(overlay);
    var timerInterval = null;

    function render(){
      var ej = diaRutina.ejercicios[idx];
      overlay.innerHTML =
        "<div class='me-top'><span>" + (idx+1) + " / " + diaRutina.ejercicios.length + "</span><button id='me-salir' style='border:none;background:none;font-size:1.3rem;'>×</button></div>" +
        "<div class='me-progreso'><div class='fill' style='width:" + ((idx+1)/diaRutina.ejercicios.length*100) + "%;'></div></div>" +
        "<div class='me-body'><h2>" + ej.nombre + "</h2><div class='me-series'>" + ej.series + " series x " + ej.repeticiones + "</div>" +
        "<div class='me-timer' id='me-timer'>" + ej.descanso_seg + "''</div>" +
        "<div class='me-actions'>" +
        "<button id='me-marcar' style='background:var(--accent);color:var(--accent-text);'>Marcar serie</button>" +
        "<button id='me-sig' style='background:var(--bg-card-2);color:#fff;'>Siguiente ejercicio →</button>" +
        (idx > 0 ? "<button id='me-ant' style='background:var(--bg-card-3);color:#fff;'>← Anterior</button>" : "") +
        "</div></div>";

      document.getElementById("me-salir").addEventListener("click", function(){
        if(timerInterval) clearInterval(timerInterval);
        overlay.remove();
      });
      document.getElementById("me-sig").addEventListener("click", function(){
        if(idx < diaRutina.ejercicios.length - 1){ idx++; render(); } else { if(timerInterval) clearInterval(timerInterval); overlay.remove(); }
      });
      var antBtn = document.getElementById("me-ant");
      if(antBtn) antBtn.addEventListener("click", function(){ idx--; render(); });
      document.getElementById("me-marcar").addEventListener("click", function(){
        var t = ej.descanso_seg;
        var timerEl = document.getElementById("me-timer");
        if(timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(function(){
          t--;
          if(t <= 0){
            clearInterval(timerInterval);
            timerEl.textContent = "¡Listo!";
            try{
              var ctx = new (window.AudioContext || window.webkitAudioContext)();
              var osc = ctx.createOscillator();
              osc.frequency.value = 880; osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.2);
            }catch(e){}
          } else {
            timerEl.textContent = t + "''";
          }
        }, 1000);
      });
    }
    render();
  }

  window.init_agenda = function(){
    state.weekOffset = 0;
    state.selectedDate = null;
    renderLista();
  };
})();

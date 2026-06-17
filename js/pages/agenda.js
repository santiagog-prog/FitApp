// ════════════════════════════════════════════════════════════
// agenda.js — Entrena: calendario, vista previa, modo entreno
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  var state = { weekOffset:0, selectedDate:null };
  var _workout = { cronSegundos:0, cronInterval:null, seriesData:{}, ejercicios:[], diaNumero:0 };
  var _sensacion = 3;
  var DIAS_L = ["L","M","X","J","V","S","D"];
  var MESES  = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

  function pad2(n){ return n < 10 ? "0"+n : ""+n; }
  function page(){ return document.getElementById("page-agenda"); }

  function lunesDeSemana(offset){
    var hoy = new Date();
    var diaIdx = (hoy.getDay()+6) % 7;
    var lunes = new Date(hoy); lunes.setDate(hoy.getDate()-diaIdx+offset*7);
    return lunes;
  }
  function fechaKey(d){ return d.toISOString().split("T")[0]; }

  function setHeader(back, titulo, extra){
    var header = document.getElementById("app-header");
    if(back){
      header.innerHTML =
        "<div style='display:flex;align-items:center;gap:10px;padding:14px 0 10px;'>" +
          "<button id='ag-back-btn' style='background:none;border:none;color:rgba(255,255,255,0.6);font-size:22px;cursor:pointer;padding:0 4px;'>←</button>" +
          "<span style='font-size:17px;font-weight:700;color:#FFF;'>" + titulo + "</span>" +
          (extra ? "<span style='margin-left:auto;'>" + extra + "</span>" : "") +
        "</div>";
      var backBtn = document.getElementById("ag-back-btn");
      if(backBtn) backBtn.addEventListener("click", back);
    } else {
      header.innerHTML =
        "<div class='ah-top'><div></div><div class='ah-icons'></div></div>" +
        "<div class='ah-title'>Entrena</div>";
    }
  }

  // ── LISTA SEMANAL ────────────────────────────────────────
  function renderLista(){
    var alumno   = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var rutina   = window.db.getRutinaPorId(alumno.rutina_id);
    var registros= window.db.getRegistros(alumno.id);
    setHeader(null);

    var lunes  = lunesDeSemana(state.weekOffset);
    var domingo= new Date(lunes); domingo.setDate(lunes.getDate()+6);
    if(!state.selectedDate) state.selectedDate = fechaKey(new Date());

    var html =
      "<div class='semana-selector'>" +
        "<button id='ag-prev'>‹</button>" +
        "<span>" + lunes.getDate() + " " + MESES[lunes.getMonth()].substr(0,3) + " — " + domingo.getDate() + " " + MESES[domingo.getMonth()].substr(0,3) + "</span>" +
        "<button id='ag-next'>›</button>" +
      "</div>";

    html += "<div class='dias-pills'>";
    var diasInfo = [];
    for(var i=0; i<7; i++){
      var d = new Date(lunes); d.setDate(lunes.getDate()+i);
      var key = fechaKey(d);
      var esHoy = key === fechaKey(new Date());
      var sel   = key === state.selectedDate;
      var hecho = registros.some(function(r){ return r.fecha === key; });

      // Dot color
      var dotColor = hecho ? "#34C759" : "rgba(255,255,255,0.12)";

      diasInfo.push({ d:d, key:key });
      html += "<div class='dia-pill" + (sel?" selected":"") + (esHoy?" today":"") + "' data-key='" + key + "'>" +
        "<span class='dp-letra'>" + DIAS_L[i] + "</span>" +
        "<span class='dp-num'>" + d.getDate() + "</span>" +
        "<div class='dp-dots'><span class='dp-dot' style='background:" + dotColor + ";'></span></div>" +
      "</div>";
    }
    html += "</div>";

    var completadosSemana = diasInfo.filter(function(di){ return registros.some(function(r){ return r.fecha === di.key; }); }).length;
    html += "<div class='progreso-semana-bar'><div class='fill' style='width:" + (completadosSemana/7*100) + "%;'></div></div>";
    html += "<p style='padding:0 20px 10px;font-size:12px;color:rgba(255,255,255,0.35);'>" + completadosSemana + " de 7 días con actividad</p>";

    // Actividad del día seleccionado
    var selDate   = new Date(state.selectedDate);
    var selDiaIdx = (selDate.getDay()+6) % 7;
    var diaRutina = rutina ? rutina.dias[selDiaIdx % rutina.dias.length] : null;
    var hechoEseDia = registros.some(function(r){ return r.fecha === state.selectedDate; });

    if(diaRutina && diaRutina.tipo !== "descanso"){
      html += "<div class='actividad-row" + (hechoEseDia ? " completada" : "") + "' id='ag-act-rutina'>" +
        "<div class='act-icon " + (hechoEseDia ? "ok" : "pendiente") + "'>" +
          (hechoEseDia
            ? "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#34C759' stroke-width='2.5' stroke-linecap='round'><polyline points='20 6 9 17 4 12'/></svg>"
            : "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#FF9500' stroke-width='2' stroke-linecap='round'><path d='M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4'/></svg>") +
        "</div>" +
        "<div class='act-body'>" +
          "<div class='act-nombre" + (hechoEseDia?" done":"") + "'>" + diaRutina.nombre + "</div>" +
          "<div class='act-estado'>" + (hechoEseDia ? "Completado ✓" : diaRutina.ejercicios.length + " ejercicios · Toca para empezar") + "</div>" +
        "</div>" +
        "<span class='act-arrow'>›</span>" +
      "</div>";
    } else {
      html += "<div class='actividad-row'>" +
        "<div class='act-icon nutri'>🌙</div>" +
        "<div class='act-body'><div class='act-nombre'>Día de descanso</div><div class='act-estado'>Sin sesión programada</div></div>" +
      "</div>";
    }

    page().innerHTML = html;

    document.getElementById("ag-prev").addEventListener("click", function(){ state.weekOffset--; state.selectedDate=null; renderLista(); });
    document.getElementById("ag-next").addEventListener("click", function(){ state.weekOffset++; state.selectedDate=null; renderLista(); });
    document.querySelectorAll(".dia-pill").forEach(function(p){
      p.addEventListener("click", function(){ state.selectedDate=this.getAttribute("data-key"); renderLista(); });
    });
    var actRutina = document.getElementById("ag-act-rutina");
    if(actRutina && rutina) actRutina.addEventListener("click", function(){ abrirVistaPrevia(diaRutina, rutina); });
  }

  // ── VISTA PREVIA SESIÓN ──────────────────────────────────
  function abrirVistaPrevia(diaRutina, rutina){
    if(diaRutina.tipo === "descanso") return;

    setHeader(function(){ renderLista(); }, diaRutina.nombre);

    var html =
      "<div style='background:linear-gradient(135deg,#1a2200,#0A0A0A);padding:28px 20px 20px;'>" +
        "<div style='font-size:12px;font-weight:600;color:#C8E000;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;'>Entrenamiento</div>" +
        "<div style='font-size:24px;font-weight:800;color:#FFF;margin-bottom:12px;letter-spacing:-.5px;'>" + diaRutina.nombre + "</div>" +
        "<div style='display:inline-flex;align-items:center;height:26px;padding:0 12px;background:rgba(255,255,255,0.08);border-radius:50px;font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:14px;'>" + (rutina.mesociclo||"") + "</div>" +
        "<div style='display:flex;gap:20px;'>" +
          "<div style='display:flex;align-items:center;gap:6px;font-size:13px;color:rgba(255,255,255,0.5);'>" +
            "<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>" +
            "~" + (diaRutina.ejercicios.length*8) + " min" +
          "</div>" +
          "<div style='display:flex;align-items:center;gap:6px;font-size:13px;color:rgba(255,255,255,0.5);'>" +
            "<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M6 4v16M18 4v16M6 12h12'/></svg>" +
            diaRutina.ejercicios.length + " ejercicios" +
          "</div>" +
        "</div>" +
      "</div>";

    // Botón INICIAR
    html +=
      "<div style='padding:0 20px;margin-top:-20px;margin-bottom:20px;'>" +
        "<button id='btn-iniciar-entreno' style='width:100%;height:54px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 20px rgba(200,224,0,0.3);'>" +
          "<svg width='18' height='18' viewBox='0 0 24 24' fill='#1C1C1E'><polygon points='5 3 19 12 5 21 5 3'/></svg>" +
          "INICIAR ENTRENAMIENTO" +
        "</button>" +
      "</div>";

    // Lista ejercicios (preview)
    html += "<div style='padding:0 20px;'>";
    html += "<div style='font-size:12px;font-weight:600;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;'>Ejercicios · " + diaRutina.ejercicios.length + "</div>";
    diaRutina.ejercicios.forEach(function(ej, i){
      html +=
        "<div style='display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:.5px solid rgba(255,255,255,0.05);'>" +
          "<span style='width:22px;font-size:14px;font-weight:600;color:rgba(255,255,255,0.25);'>" + (i+1) + "</span>" +
          "<div style='width:52px;height:52px;border-radius:10px;background:#1C1C1C;flex-shrink:0;display:flex;align-items:center;justify-content:center;'>" +
            "<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='1.5'><path d='M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4'/></svg>" +
          "</div>" +
          "<div style='flex:1;'>" +
            "<div style='font-size:15px;font-weight:600;color:#FFF;margin-bottom:3px;'>" + ej.nombre + "</div>" +
            "<div style='font-size:12px;color:rgba(255,255,255,0.35);'>" + ej.series + " series · " + ej.repeticiones + " · " + ej.descanso_seg + "\" descanso</div>" +
          "</div>" +
          (ej.video_url ? "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='2'><polygon points='23 7 16 12 23 17 23 7'/><rect x='1' y='5' width='15' height='14' rx='2'/></svg>" : "") +
        "</div>";
    });
    html += "</div>";

    page().innerHTML = html;
    document.getElementById("btn-iniciar-entreno").addEventListener("click", function(){
      iniciarEntrenamiento(diaRutina, rutina);
    });
  }

  // ── MODO ENTRENO ─────────────────────────────────────────
  function iniciarEntrenamiento(diaRutina, rutina){
    _workout.ejercicios   = diaRutina.ejercicios;
    _workout.seriesData   = {};
    _workout.cronSegundos = 0;
    _workout.diaNumero    = diaRutina.numero;

    diaRutina.ejercicios.forEach(function(ej){
      var key = ej.id || ej.nombre;
      _workout.seriesData[key] = [];
      for(var s=0; s<(ej.series||3); s++){
        _workout.seriesData[key].push({ reps: parseInt(ej.repeticiones)||0, kg:0, done:false });
      }
    });

    // Cronómetro
    if(_workout.cronInterval) clearInterval(_workout.cronInterval);
    _workout.cronInterval = setInterval(function(){
      _workout.cronSegundos++;
      var el = document.getElementById("me-timer-display");
      if(el) el.textContent = pad2(Math.floor(_workout.cronSegundos/60)) + ":" + pad2(_workout.cronSegundos%60);
    }, 1000);

    renderModoEntreno(diaRutina, rutina);
  }

  function renderModoEntreno(diaRutina, rutina){
    setHeader(function(){ if(confirm("¿Terminar el entrenamiento?")){ pararCron(); abrirVistaPrevia(diaRutina,rutina); } }, diaRutina.nombre);

    var html =
      "<div style='padding:0 20px 12px;display:flex;align-items:center;justify-content:space-between;'>" +
        "<div style='text-align:center;'>" +
          "<div id='me-timer-display' style='font-size:28px;font-weight:800;color:#C8E000;font-family:\"Space Mono\",monospace;letter-spacing:2px;'>00:00</div>" +
          "<div style='font-size:10px;color:rgba(255,255,255,0.3);'>TIEMPO DE ENTRENO</div>" +
        "</div>" +
        "<div id='progreso-entreno' style='font-size:13px;color:rgba(255,255,255,0.4);'>0/" + diaRutina.ejercicios.length + "</div>" +
      "</div>" +
      "<div style='height:3px;background:rgba(255,255,255,0.06);margin:0 0 16px;'>" +
        "<div id='barra-progreso-entreno' style='height:100%;background:#C8E000;width:0%;transition:width .3s;'></div>" +
      "</div>";

    diaRutina.ejercicios.forEach(function(ej, ejIdx){
      var ejKey  = ej.id || ej.nombre;
      var series = _workout.seriesData[ejKey] || [];
      var todasDone = series.length > 0 && series.every(function(s){ return s.done; });

      html += "<div id='ej-card-" + ejIdx + "' class='me-ej-card" + (todasDone?" completado":"") + "'>";

      // Header ejercicio
      html +=
        "<div class='me-ej-head' onclick='window._toggleEjCard(" + ejIdx + ")'>" +
          "<div class='me-ej-thumb'>" +
            "<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='1.5'><path d='M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4'/></svg>" +
          "</div>" +
          "<div style='flex:1;'>" +
            "<div style='font-size:15px;font-weight:600;color:#FFF;'>" + ej.nombre + "</div>" +
            "<div style='font-size:12px;color:rgba(255,255,255,0.35);margin-top:2px;'>" + ej.series + " series · " + ej.repeticiones + "</div>" +
          "</div>" +
          (todasDone ? "<span style='background:rgba(52,199,89,0.12);color:#34C759;border-radius:50px;padding:3px 10px;font-size:11px;font-weight:700;'>✓</span>" : "") +
          "<div id='chev-ej-" + ejIdx + "' style='color:rgba(255,255,255,0.2);font-size:18px;margin-left:8px;transition:transform .2s;'>" + (ejIdx===0?"⌄":"›") + "</div>" +
        "</div>";

      // Body series
      html += "<div id='series-card-" + ejIdx + "' class='me-ej-body-expand' style='display:" + (ejIdx===0?"block":"none") + ";'>";

      if(ej.nota_tecnica){
        html += "<div style='background:rgba(200,224,0,0.06);border-left:3px solid #C8E000;border-radius:0 8px 8px 0;padding:10px 12px;margin-bottom:14px;font-size:13px;color:rgba(255,255,255,0.55);'>ℹ️ " + ej.nota_tecnica + "</div>";
      }

      series.forEach(function(serie, sIdx){
        html +=
          "<div id='serie-row-" + ejIdx + "-" + sIdx + "' class='me-serie-row'>" +
            "<div id='serie-num-" + ejIdx + "-" + sIdx + "' class='me-serie-num" + (serie.done?" done":"") + "'>" + (sIdx+1) + "</div>" +
            // Reps
            "<div class='me-val-ctrl'>" +
              "<div class='me-val-label'>Reps</div>" +
              "<div class='me-val-row'>" +
                "<button class='me-val-btn' onclick='window._cambiarVal(\"" + ejKey + "\"," + sIdx + ",\"reps\",-1)'>−</button>" +
                "<div id='reps-" + ejIdx + "-" + sIdx + "' class='me-val-num'>" + (serie.reps||0) + "</div>" +
                "<button class='me-val-btn' onclick='window._cambiarVal(\"" + ejKey + "\"," + sIdx + ",\"reps\",1)'>+</button>" +
              "</div>" +
            "</div>" +
            // Kg
            "<div class='me-val-ctrl'>" +
              "<div class='me-val-label'>Kg</div>" +
              "<div class='me-val-row'>" +
                "<button class='me-val-btn' onclick='window._cambiarVal(\"" + ejKey + "\"," + sIdx + ",\"kg\",-2.5)'>−</button>" +
                "<div id='kg-" + ejIdx + "-" + sIdx + "' class='me-val-num accent'>" + (serie.kg||0) + "</div>" +
                "<button class='me-val-btn' onclick='window._cambiarVal(\"" + ejKey + "\"," + sIdx + ",\"kg\",2.5)'>+</button>" +
              "</div>" +
            "</div>" +
            // Check
            "<button id='btn-marcar-" + ejIdx + "-" + sIdx + "' class='me-check-btn" + (serie.done?" done":"") + "' " +
              "onclick='window._marcarSerie(\"" + ejKey + "\"," + ejIdx + "," + sIdx + "," + (ej.descanso_seg||90) + ")'>✓</button>" +
          "</div>";
      });

      if(ej.video_url){
        html += "<button onclick=\"window.abrirModalVideo('" + ej.video_url + "','" + ej.nombre.replace(/'/g,"") + "')\" style='width:100%;height:38px;background:rgba(255,255,255,0.04);border:none;border-radius:8px;color:rgba(255,255,255,0.4);font-size:13px;font-family:inherit;cursor:pointer;margin-top:8px;'>📹 Ver técnica</button>";
      }

      html += "</div></div>"; // cierre body + card
    });

    html += "<div style='padding:0 20px 16px;'>" +
      "<button onclick='window._finalizarEntreno()' style='width:100%;height:52px;background:rgba(52,199,89,0.12);color:#34C759;border:1px solid rgba(52,199,89,0.3);border-radius:50px;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;'>🏁 Finalizar entrenamiento</button>" +
    "</div>";

    page().innerHTML = html;
  }

  // ── HELPERS GLOBALES MODO ENTRENO ─────────────────────────
  window._toggleEjCard = function(ejIdx){
    var card = document.getElementById("series-card-" + ejIdx);
    var chev = document.getElementById("chev-ej-" + ejIdx);
    if(!card) return;
    var open = card.style.display === "block";
    card.style.display = open ? "none" : "block";
    if(chev) chev.textContent = open ? "›" : "⌄";
  };

  window._cambiarVal = function(ejKey, sIdx, campo, delta){
    if(!_workout.seriesData[ejKey]) return;
    var serie = _workout.seriesData[ejKey][sIdx];
    if(!serie) return;
    if(campo === "reps"){
      serie.reps = Math.max(0, (serie.reps||0) + delta);
      document.querySelectorAll("[id^='reps-'][id$='-" + sIdx + "']").forEach(function(e){ if(e.id.split("-")[1] !== undefined) e.textContent = serie.reps; });
      // más específico: buscar por ej idx + serie idx
      var ejIdx = Object.keys(_workout.seriesData).indexOf(ejKey);
      var el = document.getElementById("reps-" + ejIdx + "-" + sIdx);
      if(el) el.textContent = serie.reps;
    } else {
      serie.kg = Math.max(0, parseFloat(((serie.kg||0)+delta).toFixed(1)));
      var ejIdx2 = Object.keys(_workout.seriesData).indexOf(ejKey);
      var elkg = document.getElementById("kg-" + ejIdx2 + "-" + sIdx);
      if(elkg) elkg.textContent = serie.kg;
    }
    if(navigator.vibrate) navigator.vibrate(10);
  };

  window._marcarSerie = function(ejKey, ejIdx, sIdx, descansoSeg){
    if(!_workout.seriesData[ejKey]) return;
    var serie = _workout.seriesData[ejKey][sIdx];
    if(!serie) return;
    serie.done = !serie.done;

    var btn = document.getElementById("btn-marcar-" + ejIdx + "-" + sIdx);
    var num = document.getElementById("serie-num-" + ejIdx + "-" + sIdx);
    if(btn){ btn.classList.toggle("done", serie.done); }
    if(num){ num.classList.toggle("done", serie.done); }

    if(navigator.vibrate) navigator.vibrate([50,30,50]);

    // Verificar ejercicio completo
    var todasDone = _workout.seriesData[ejKey].every(function(s){ return s.done; });
    var card = document.getElementById("ej-card-" + ejIdx);
    if(todasDone && card) card.classList.add("completado");

    // Actualizar progreso global
    var keys = Object.keys(_workout.seriesData);
    var completados = keys.filter(function(k){ return _workout.seriesData[k].every(function(s){ return s.done; }); }).length;
    var barra   = document.getElementById("barra-progreso-entreno");
    var progreso= document.getElementById("progreso-entreno");
    if(barra)   barra.style.width   = (completados/_workout.ejercicios.length*100) + "%";
    if(progreso) progreso.textContent= completados + "/" + _workout.ejercicios.length;

    if(serie.done) mostrarDescanso(descansoSeg||90);
  };

  function mostrarDescanso(seg){
    var t = seg;
    var r = 54, circ = 2*Math.PI*r;
    var overlay = document.createElement("div");
    overlay.className = "descanso-overlay";
    overlay.id = "descanso-overlay";

    function svgCirculo(pct){
      var offset = circ - (pct/100)*circ;
      return '<svg width="130" height="130" viewBox="0 0 130 130">' +
        '<circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>' +
        '<circle cx="65" cy="65" r="54" fill="none" stroke="#C8E000" stroke-width="6" stroke-linecap="round" ' +
          'stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '" ' +
          'transform="rotate(-90 65 65)" style="transition:stroke-dashoffset 1s linear;"/>' +
        '<text x="65" y="60" text-anchor="middle" font-family="Space Mono,monospace" font-size="28" font-weight="700" fill="#FFFFFF" id="descanso-num">' + t + '</text>' +
        '<text x="65" y="80" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" fill="rgba(255,255,255,0.35)">seg restantes</text>' +
      '</svg>';
    }

    overlay.innerHTML =
      "<div style='text-align:center;'>" +
        "<div style='font-size:13px;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-bottom:20px;'>Descanso</div>" +
        "<div id='descanso-svg'>" + svgCirculo(100) + "</div>" +
        "<div style='margin-top:24px;'>" +
          "<button onclick='document.getElementById(\"descanso-overlay\").remove();clearInterval(window._descansoInterval)' " +
          "style='background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#FFF;border-radius:50px;padding:10px 24px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;'>Saltar descanso</button>" +
        "</div>" +
      "</div>";

    document.body.appendChild(overlay);

    window._descansoInterval = setInterval(function(){
      t--;
      var pct = Math.max(0, (t/seg)*100);
      var svgEl = document.getElementById("descanso-svg");
      if(svgEl) svgEl.innerHTML = svgCirculo(pct);
      if(t <= 0){
        clearInterval(window._descansoInterval);
        // Beep
        try{
          var ctx = new (window.AudioContext||window.webkitAudioContext)();
          [880,880,1100].forEach(function(freq, i){
            var osc = ctx.createOscillator();
            osc.frequency.value = freq;
            osc.connect(ctx.destination);
            osc.start(ctx.currentTime + i*0.15);
            osc.stop(ctx.currentTime + i*0.15 + 0.12);
          });
        }catch(e){}
        if(navigator.vibrate) navigator.vibrate([100,50,100,50,200]);
        setTimeout(function(){
          var ov = document.getElementById("descanso-overlay");
          if(ov) ov.remove();
        }, 500);
      }
    }, 1000);
  }

  function pararCron(){
    if(_workout.cronInterval) clearInterval(_workout.cronInterval);
    _workout.cronInterval = null;
  }

  window._finalizarEntreno = function(){
    pararCron();
    var totalSeries = 0;
    Object.values(_workout.seriesData).forEach(function(ss){ totalSeries += ss.filter(function(s){ return s.done; }).length; });
    var duracion = Math.max(1, Math.round(_workout.cronSegundos/60));
    _sensacion = 3;

    window.lanzarConfetti();

    var modal = document.createElement("div");
    modal.className = "modal-celebracion";
    modal.innerHTML =
      "<div class='mc-card'>" +
        "<div style='font-size:52px;margin-bottom:10px;'>🎉</div>" +
        "<h2>¡Sesión completada!</h2>" +
        "<div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:16px 0;'>" +
          "<div style='background:#1C1C1C;border-radius:12px;padding:12px;'><div style='font-size:22px;font-weight:800;color:#C8E000;'>" + duracion + "</div><div style='font-size:11px;color:rgba(255,255,255,.4);'>minutos</div></div>" +
          "<div style='background:#1C1C1C;border-radius:12px;padding:12px;'><div style='font-size:22px;font-weight:800;color:#C8E000;'>" + _workout.ejercicios.length + "</div><div style='font-size:11px;color:rgba(255,255,255,.4);'>ejercicios</div></div>" +
          "<div style='background:#1C1C1C;border-radius:12px;padding:12px;'><div style='font-size:22px;font-weight:800;color:#C8E000;'>" + totalSeries + "</div><div style='font-size:11px;color:rgba(255,255,255,.4);'>series</div></div>" +
        "</div>" +
        "<div class='mc-sensacion'>" +
          ["😫","😕","😐","💪","🔥"].map(function(e,i){ return "<span data-val='" + (i+1) + "'>" + e + "</span>"; }).join("") +
        "</div>" +
        "<textarea rows='2' placeholder='Nota personal (opcional)' id='mc-nota' class='mc-card textarea'></textarea>" +
        "<button class='pill-btn' id='mc-guardar'>Guardar y cerrar</button>" +
      "</div>";

    document.body.appendChild(modal);

    modal.querySelectorAll(".mc-sensacion span").forEach(function(s){
      s.addEventListener("click", function(){
        modal.querySelectorAll(".mc-sensacion span").forEach(function(x){ x.classList.remove("sel"); x.style.opacity=".3"; });
        s.classList.add("sel"); s.style.opacity="1"; s.style.transform="scale(1.3)";
        _sensacion = parseInt(s.getAttribute("data-val"),10);
      });
    });

    document.getElementById("mc-guardar").addEventListener("click", function(){
      var nota = (document.getElementById("mc-nota")||{}).value || "";
      var nuevas = window.db.saveRegistro(window.ALUMNO_ID, {
        id: window.db.generarId("reg"),
        fecha: window.db.fechaHoy(),
        dia_numero: _workout.diaNumero,
        sesion_nombre: (_workout.ejercicios[0]||{}).nombre || "Sesión",
        nombre_sesion: _workout.ejercicios.length + " ejercicios",
        ejercicios_completados: _workout.ejercicios.length,
        ejercicios_total: _workout.ejercicios.length,
        duracion_min: duracion,
        sensacion: _sensacion,
        nota: nota,
        series_data: _workout.seriesData
      });
      modal.remove();
      _workout.seriesData = {};
      renderLista();
      window.mostrarMedallasNuevas(nuevas);
    });
  };

  window.init_agenda = function(){
    state.weekOffset = 0;
    state.selectedDate = null;
    renderLista();
  };
})();

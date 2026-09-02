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
          "<button id='ag-back-btn' style='background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer;padding:0 4px;'>←</button>" +
          "<span style='font-size:17px;font-weight:700;color:var(--text);'>" + titulo + "</span>" +
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

  var META_PASOS_DEFAULT = 10000;

  function getDiaRutinaEfectivo(alumno, rutina, key){
    if(!rutina) return null;
    try {
      var ov = localStorage.getItem("fitapp_rutina_override_"+alumno.id+"_"+key);
      if(ov !== null){
        var idx = parseInt(ov, 10);
        if(!isNaN(idx) && rutina.dias[idx]) return rutina.dias[idx];
      }
    } catch(e){}
    var dIdx = (new Date(key).getDay()+6) % 7;
    return rutina.dias[dIdx % rutina.dias.length];
  }

  // Resuelve las "tareas" de un día específico (entreno, nutrición, pasos)
  // Usado tanto para los puntos de color del calendario como para la
  // lista de actividades del día seleccionado.
  function tareasDelDia(alumno, rutina, registros, key){
    var tareas = [];
    var diaRutina = getDiaRutinaEfectivo(alumno, rutina, key);
    var hechoEntreno = registros.some(function(r){ return r.fecha === key; });

    if(diaRutina && diaRutina.tipo !== "descanso"){
      tareas.push({ tipo:"entreno", color:"#FF9500", done:hechoEntreno, diaRutina:diaRutina });
    }

    var nut = window.db.getNutricion(alumno.id, key);
    var algoComido = nut.comidos && Object.keys(nut.comidos).some(function(k){ return nut.comidos[k] === true; });
    tareas.push({ tipo:"nutricion", color:"#34C759", done:!!algoComido });

    var prog = window.db.getProgresoDiario(alumno.id, key);
    var metaPasos = META_PASOS_DEFAULT;
    tareas.push({ tipo:"pasos", color:"#FF2D55", done:(prog.pasos||0) >= metaPasos, pasos:prog.pasos||0, meta:metaPasos });

    return tareas;
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

      diasInfo.push({ d:d, key:key });
      var tareasDia = tareasDelDia(alumno, rutina, registros, key);
      var dots = tareasDia.map(function(t){
        return "<span class='dp-dot' style='background:" + (t.done ? t.color : "var(--surface3)") + ";'></span>";
      }).join("");

      html += "<div class='dia-pill" + (sel?" selected":"") + (esHoy?" today":"") + "' data-key='" + key + "'>" +
        "<span class='dp-letra'>" + DIAS_L[i] + "</span>" +
        "<span class='dp-num'>" + d.getDate() + "</span>" +
        "<div class='dp-dots'>" + dots + "</div>" +
      "</div>";
    }
    html += "</div>";

    var completadosSemana = diasInfo.filter(function(di){ return registros.some(function(r){ return r.fecha === di.key; }); }).length;
    var rachaAct = window.db.calcularRacha ? window.db.calcularRacha(alumno.id) : 0;
    var pctSemana = Math.round(completadosSemana/7*100);
    html += "<div style='margin:0 16px 14px;background:var(--surface);border-radius:16px;padding:14px 16px;border:1px solid var(--border);box-shadow:var(--shadow-card);'>" +
      "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;'>" +
        "<div style='font-size:13px;font-weight:700;color:var(--text);'>Progreso semanal</div>" +
        "<div style='display:flex;align-items:center;gap:12px;'>" +
          "<span style='font-size:11px;color:var(--text-muted);'>" + completadosSemana + "/7 días</span>" +
          (rachaAct > 0 ? "<span style='font-size:11px;font-weight:700;color:var(--accent-text);'>🔥 " + rachaAct + " racha</span>" : "") +
        "</div>" +
      "</div>" +
      "<div style='display:flex;gap:5px;margin-bottom:8px;'>" +
        diasInfo.map(function(di, idx){
          var hecho = registros.some(function(r){ return r.fecha === di.key; });
          var esSel = di.key === state.selectedDate;
          var esHoy = di.key === fechaKey(new Date());
          return "<div style='flex:1;height:6px;border-radius:99px;background:" + (hecho?"#C8E000":(esHoy?"rgba(90,128,0,0.18)":"var(--surface3)")) + ";'></div>";
        }).join("") +
      "</div>" +
      "<div style='display:flex;justify-content:space-between;'>" +
        diasInfo.map(function(di){ return "<span style='flex:1;font-size:9px;text-align:center;color:var(--text-muted);font-weight:600;'>" + DIAS_L[(di.d.getDay()+6)%7] + "</span>"; }).join("") +
      "</div>" +
    "</div>";

    // Actividades del día seleccionado: entreno + nutrición + pasos
    var diaRutina = getDiaRutinaEfectivo(alumno, rutina, state.selectedDate);
    var tareasSel = tareasDelDia(alumno, rutina, registros, state.selectedDate);

    tareasSel.forEach(function(t){
      if(t.tipo === "entreno"){
        var tieneOverride = (function(){
          try{ return localStorage.getItem("fitapp_rutina_override_"+alumno.id+"_"+state.selectedDate) !== null; }catch(e){ return false; }
        })();
        html += "<div class='actividad-row" + (t.done ? " completada" : "") + "' id='ag-act-rutina'>" +
          "<div class='act-icon " + (t.done ? "ok" : "pendiente") + "'>" +
            (t.done
              ? "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#34C759' stroke-width='2.5' stroke-linecap='round'><polyline points='20 6 9 17 4 12'/></svg>"
              : "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#FF9500' stroke-width='2' stroke-linecap='round'><path d='M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4'/></svg>") +
          "</div>" +
          "<div class='act-body'>" +
            "<div class='act-nombre" + (t.done?" done":"") + "'>" + t.diaRutina.nombre + (tieneOverride ? " <span style='font-size:10px;color:var(--accent-text);background:rgba(200,224,0,0.15);padding:2px 6px;border-radius:50px;'>cambiado</span>" : "") + "</div>" +
            "<div class='act-estado'>" + (t.done ? "Completado ✓" : t.diaRutina.ejercicios.length + " ejercicios · Toca para empezar") + "</div>" +
          "</div>" +
          "<span class='act-arrow'>›</span>" +
        "</div>" +
        "<button id='ag-cambiar-rutina' style='display:flex;align-items:center;gap:8px;width:calc(100% - 32px);margin:0 16px 4px;padding:10px 16px;background:var(--surface2);border:1px solid var(--border);border-radius:12px;color:var(--text-muted);font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;touch-action:manipulation;'>" +
          "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round'><path d='M17 1l4 4-4 4'/><path d='M3 11V9a4 4 0 014-4h14'/><path d='M7 23l-4-4 4-4'/><path d='M21 13v2a4 4 0 01-4 4H3'/></svg>" +
          (tieneOverride ? "Restaurar rutina del día" : "Cambiar rutina de hoy") +
        "</button>";
      } else if(t.tipo === "nutricion"){
        html += "<div class='actividad-row" + (t.done ? " completada" : "") + "' id='ag-act-nutricion'>" +
          "<div class='act-icon' style='background:rgba(52,199,89,0.12);'>" +
            (t.done
              ? "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#34C759' stroke-width='2.5' stroke-linecap='round'><polyline points='20 6 9 17 4 12'/></svg>"
              : "<span style='font-size:18px;'>🍽️</span>") +
          "</div>" +
          "<div class='act-body'>" +
            "<div class='act-nombre" + (t.done?" done":"") + "'>Plan de alimentación</div>" +
            "<div class='act-estado'>" + (t.done ? "Registrado" : "Toca para registrar tus comidas") + "</div>" +
          "</div>" +
          "<span class='act-arrow'>›</span>" +
        "</div>";
      } else if(t.tipo === "pasos"){
        html += "<div class='actividad-row" + (t.done ? " completada" : "") + "' id='ag-act-pasos'>" +
          "<div class='act-icon' style='background:rgba(255,45,85,0.12);'>" +
            (t.done
              ? "<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#FF2D55' stroke-width='2.5' stroke-linecap='round'><polyline points='20 6 9 17 4 12'/></svg>"
              : "<span style='font-size:18px;'>🚶</span>") +
          "</div>" +
          "<div class='act-body'>" +
            "<div class='act-nombre" + (t.done?" done":"") + "'>Caminar</div>" +
            "<div class='act-estado'>" + t.pasos.toLocaleString("es") + " / " + t.meta.toLocaleString("es") + " pasos</div>" +
          "</div>" +
          "<span class='act-arrow'>›</span>" +
        "</div>";
      }
    });

    if(diaRutina && diaRutina.tipo === "descanso"){
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
    var btnCambiar = document.getElementById("ag-cambiar-rutina");
    if(btnCambiar && rutina) btnCambiar.addEventListener("click", function(){ abrirCambiarRutina(state.selectedDate, alumno, rutina); });
    var actNutricion = document.getElementById("ag-act-nutricion");
    if(actNutricion) actNutricion.addEventListener("click", function(){ window.irAPagina("nutricion"); });
    var actPasos = document.getElementById("ag-act-pasos");
    if(actPasos) actPasos.addEventListener("click", function(){ abrirEditarPasos(state.selectedDate); });
  }

  // ── EDITAR PASOS DEL DÍA ──────────────────────────────────
  function abrirEditarPasos(fecha){
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var prog = window.db.getProgresoDiario(alumno.id, fecha);
    var modal = document.createElement("div");
    modal.className = "modal-celebracion";
    modal.innerHTML =
      "<div class='mc-card' style='text-align:center;'>" +
        "<div style='font-size:40px;margin-bottom:8px;'>🚶</div>" +
        "<h2 style='margin-bottom:4px;'>Caminar</h2>" +
        "<div style='font-size:12px;color:var(--text-muted);margin-bottom:18px;'>Meta: " + META_PASOS_DEFAULT.toLocaleString("es") + " pasos</div>" +
        "<input id='input-pasos-dia' type='number' inputmode='numeric' value='" + (prog.pasos||0) + "' " +
          "style='width:100%;height:54px;background:var(--surface2);border:1px solid var(--border);border-radius:14px;text-align:center;color:var(--text);font-size:24px;font-weight:800;font-family:\"Space Mono\",monospace;margin-bottom:18px;'>" +
        "<button class='pill-btn' id='btn-guardar-pasos'>Guardar</button>" +
      "</div>";
    document.body.appendChild(modal);
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
    document.getElementById("btn-guardar-pasos").addEventListener("click", function(){
      var val = parseInt(document.getElementById("input-pasos-dia").value, 10) || 0;
      window.db.patchProgresoDiario(alumno.id, fecha, { pasos: val });
      // Sincronizar también en localStorage para widget de Inicio y cardio.js offline
      try {
        var d2 = new Date(fecha); var pad2 = function(n){ return n<10?"0"+n:""+n; };
        var k2 = d2.getFullYear()+""+pad2(d2.getMonth()+1)+""+pad2(d2.getDate());
        localStorage.setItem("fitapp_pasos_"+alumno.id+"_"+k2, JSON.stringify({pasos:val,fuente:"agenda"}));
      } catch(e){}
      modal.remove();
      window.mostrarToast("✓ " + val.toLocaleString("es") + " pasos guardados");
      renderLista();
    });
  }

  // Agrupa ejercicios consecutivos que comparten el mismo ej.superserie
  // en bloques { superserie, rondas, items:[...] } para renderizar el
  // encabezado "SUPERSERIE ×N RONDAS" igual que en la app del coach.
  function agruparPorSuperserie(ejercicios){
    var grupos = [];
    ejercicios.forEach(function(ej){
      var ultimo = grupos[grupos.length-1];
      if(ej.superserie && ultimo && ultimo.superserie === ej.superserie){
        ultimo.items.push(ej);
      } else {
        grupos.push({ superserie: ej.superserie||null, rondas: ej.superserie_rondas||3, items:[ej] });
      }
    });
    return grupos;
  }

  // Texto de progresión: compara con la sesión anterior del mismo día
  function notaProgresion(diaRutina, registros){
    var prevReg = registros.slice().reverse().find(function(r){
      return r.dia_numero === diaRutina.numero || r.sesion_nombre === diaRutina.nombre;
    });
    if(!prevReg) return "Primera vez con esta sesión — registra tus pesos para comparar la próxima semana.";
    var fechaPrev = new Date(prevReg.fecha);
    var dias = Math.round((new Date() - fechaPrev) / 86400000);
    var cuando = dias <= 0 ? "hoy" : dias === 1 ? "ayer" : "hace " + dias + " días";
    return "Última vez (" + cuando + "): mantén la misma carga y busca 1-2 repeticiones más, o sube ligeramente el peso si te sentiste cómodo.";
  }

  // ── CAMBIAR RUTINA DEL DÍA ───────────────────────────────
  function abrirCambiarRutina(fecha, alumno, rutina){
    var ovKey = "fitapp_rutina_override_"+alumno.id+"_"+fecha;
    var tieneOverride = false;
    try { tieneOverride = localStorage.getItem(ovKey) !== null; } catch(e){}

    var DIAS_NOMBRE = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
    var modal = document.createElement("div");
    modal.className = "modal-bottom";

    var itemsHTML = "";
    rutina.dias.forEach(function(dia, idx){
      if(dia.tipo === "descanso") return;
      itemsHTML +=
        "<button class='ag-dia-opt' data-idx='"+idx+"' style='display:flex;align-items:center;gap:14px;width:100%;padding:14px 20px;background:none;border:none;border-bottom:1px solid var(--border);cursor:pointer;touch-action:manipulation;text-align:left;font-family:inherit;'>" +
          "<div style='width:40px;height:40px;border-radius:12px;background:rgba(200,224,0,0.12);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;'>🏋️</div>" +
          "<div style='flex:1;'>" +
            "<div style='font-size:15px;font-weight:700;color:var(--text);'>" + dia.nombre + "</div>" +
            "<div style='font-size:12px;color:var(--text-muted);margin-top:2px;'>" + dia.ejercicios.length + " ejercicios · " + DIAS_NOMBRE[idx] + "</div>" +
          "</div>" +
          "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='var(--text-muted)' stroke-width='2'><path d='M9 18l6-6-6-6'/></svg>" +
        "</button>";
    });

    if(tieneOverride){
      itemsHTML +=
        "<button id='ag-restaurar-rutina' style='display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px 20px;background:none;border:none;color:#FF453A;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;touch-action:manipulation;'>" +
          "Restaurar rutina original del día" +
        "</button>";
    }

    modal.innerHTML =
      "<div class='modal-bottom-sheet'>" +
        "<div class='modal-handle'></div>" +
        "<div class='modal-title'>Elige el entrenamiento de hoy<button class='modal-close-btn' id='ag-cambiar-close'>×</button></div>" +
        "<div style='padding-bottom:env(safe-area-inset-bottom,0px);'>" + itemsHTML + "</div>" +
      "</div>";

    document.body.appendChild(modal);
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
    document.getElementById("ag-cambiar-close").addEventListener("click", function(){ modal.remove(); });

    modal.querySelectorAll(".ag-dia-opt").forEach(function(btn){
      btn.addEventListener("click", function(){
        var idx = parseInt(this.getAttribute("data-idx"), 10);
        try { localStorage.setItem(ovKey, idx); } catch(e){}
        modal.remove();
        window.mostrarToast && window.mostrarToast("✓ Rutina cambiada a: " + rutina.dias[idx].nombre);
        renderLista();
      });
    });

    var restaurar = document.getElementById("ag-restaurar-rutina");
    if(restaurar) restaurar.addEventListener("click", function(){
      try { localStorage.removeItem(ovKey); } catch(e){}
      modal.remove();
      window.mostrarToast && window.mostrarToast("Rutina restaurada al día original");
      renderLista();
    });
  }

  // ── VISTA PREVIA SESIÓN ──────────────────────────────────
  function abrirVistaPrevia(diaRutina, rutina){
    if(diaRutina.tipo === "descanso") return;

    setHeader(function(){ renderLista(); }, diaRutina.nombre);

    var html =
      "<div style='background:linear-gradient(135deg,rgba(200,224,0,0.08),var(--surface));padding:28px 20px 20px;border-bottom:1px solid var(--border);'>" +
        "<div style='font-size:12px;font-weight:600;color:var(--accent-text);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;'>Entrenamiento</div>" +
        "<div style='font-size:24px;font-weight:800;color:var(--text);margin-bottom:12px;letter-spacing:-.5px;'>" + diaRutina.nombre + "</div>" +
        (function(){
          var meso = rutina.mesociclo || "";
          var parts = meso.split("–").map(function(s){ return s.trim(); });
          if(parts.length < 2) return "<div style='font-size:12px;color:var(--text-muted);margin-bottom:16px;letter-spacing:.3px;'>" + meso + "</div>";
          var icons = ["🏋️", "🔄", "🎯", "📅"];
          return "<div style='display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;'>" +
            parts.map(function(p,i){
              return "<div style='display:inline-flex;align-items:center;gap:5px;padding:5px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:50px;font-size:11px;font-weight:600;color:var(--text-muted);letter-spacing:.2px;'>" +
                "<span>" + (icons[i]||"•") + "</span>" +
                "<span>" + p + "</span>" +
              "</div>";
            }).join("") +
          "</div>";
        })() +
        "<div style='display:flex;gap:20px;'>" +
          "<div style='display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-muted);'>" +
            "<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>" +
            "~" + (diaRutina.ejercicios.length*8) + " min" +
          "</div>" +
          "<div style='display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text-muted);'>" +
            "<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M6 4v16M18 4v16M6 12h12'/></svg>" +
            diaRutina.ejercicios.length + " ejercicios" +
          "</div>" +
        "</div>" +
      "</div>";

    // Notas de progresión
    var alumnoVP = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var registrosVP = window.db.getRegistros(alumnoVP.id);
    html += "<div style='padding:0 20px;margin-bottom:18px;'>" +
      "<div style='background:rgba(200,224,0,0.06);border-left:3px solid #C8E000;border-radius:0 12px 12px 0;padding:12px 14px;'>" +
        "<div style='font-size:11px;font-weight:700;color:#C8E000;text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;'>📈 Notas de progresión</div>" +
        "<div style='font-size:13px;color:var(--text-secondary);line-height:1.5;'>" + notaProgresion(diaRutina, registrosVP) + "</div>" +
      "</div>" +
    "</div>";

    // Botón INICIAR
    html +=
      "<div style='padding:0 20px;margin-bottom:20px;'>" +
        "<button id='btn-iniciar-entreno' style='width:100%;height:54px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 20px rgba(200,224,0,0.3);'>" +
          "<svg width='18' height='18' viewBox='0 0 24 24' fill='#1C1C1E'><polygon points='5 3 19 12 5 21 5 3'/></svg>" +
          "INICIAR ENTRENAMIENTO" +
        "</button>" +
      "</div>";

    // Lista ejercicios con técnica, animación expandible
    html += "<div style='padding:0 20px 32px;'>";
    html += "<div style='font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;'>Ejercicios · " + diaRutina.ejercicios.length + "</div>";
    var contador = 0;
    agruparPorSuperserie(diaRutina.ejercicios).forEach(function(grupo){
      if(grupo.superserie){
        html += "<div style='font-size:11px;font-weight:800;color:#0A84FF;letter-spacing:.5px;text-transform:uppercase;background:rgba(10,132,255,0.1);border-radius:8px;padding:6px 10px;margin:10px 0 4px;'>SUPERSERIE ×" + grupo.rondas + " RONDAS</div>";
      }
      grupo.items.forEach(function(ej){
        contador++;
        var svgAnim = (window.getEjercicioSVG ? window.getEjercicioSVG(ej.nombre) : "");
        var tecnica = (window.getEjercicioTecnica ? window.getEjercicioTecnica(ej.nombre) : null);
        var cardId = "prev-ej-" + contador;
        html +=
          "<div style='border:1px solid var(--border);border-radius:16px;margin-bottom:10px;overflow:hidden;background:var(--surface);'>" +
          // Cabecera siempre visible
          "<div id='head-" + cardId + "' style='display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;'>" +
            "<div style='width:50px;height:50px;border-radius:12px;background:var(--surface2);flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;'>" +
              (svgAnim || "<span style='font-size:22px;'>💪</span>") +
            "</div>" +
            "<div style='flex:1;min-width:0;'>" +
              "<div style='font-size:15px;font-weight:700;color:var(--text);'>" + ej.nombre + "</div>" +
              "<div style='font-size:12px;color:var(--text-muted);margin-top:2px;'>" + ej.series + " × " + ej.repeticiones + " · " + (ej.descanso_seg||90) + "\" descanso</div>" +
              (tecnica ? "<div style='font-size:11px;color:var(--accent-text);font-weight:600;margin-top:2px;'>" + tecnica.musculos + "</div>" : "") +
            "</div>" +
            "<div style='color:var(--text-muted);font-size:16px;flex-shrink:0;'>›</div>" +
          "</div>" +
          // Cuerpo expandible (oculto por defecto)
          "<div id='body-" + cardId + "' style='display:none;padding:0 16px 16px;'>" +
            // Animación grande — canvas 60fps
            (window.getEjercicioAnimHTML ? (function(){
              var uid3 = "body-anim-" + cardId;
              return "<div style='width:100%;height:200px;border-radius:14px;background:linear-gradient(135deg,rgba(200,224,0,0.06),var(--surface2));margin-bottom:14px;overflow:hidden;display:flex;align-items:center;justify-content:center;'>" +
                window.getEjercicioAnimHTML(ej.nombre, uid3) +
              "</div>";
            })() : "") +
            // Técnica
            (tecnica ? (
              "<div style='font-size:11px;font-weight:700;color:var(--accent-text);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;'>Cómo hacerlo</div>" +
              tecnica.pasos.map(function(paso, pi){
                return "<div style='display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;'>" +
                  "<div style='width:22px;height:22px;border-radius:50%;background:#C8E000;color:#1C1C1E;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;'>" + (pi+1) + "</div>" +
                  "<div style='font-size:13px;color:var(--text);line-height:1.5;'>" + paso + "</div>" +
                "</div>";
              }).join("")
            ) : "") +
            (ej.nota_tecnica ? "<div style='background:rgba(200,224,0,0.06);border-left:3px solid #C8E000;border-radius:0 8px 8px 0;padding:10px 12px;margin-top:8px;font-size:13px;color:var(--text-muted);'>ℹ️ " + ej.nota_tecnica + "</div>" : "") +
          "</div>" +
          "</div>";
      });
    });
    html += "</div>";

    page().innerHTML = html;
    if(window.startAllAnimaciones) setTimeout(window.startAllAnimaciones, 40);

    // Toggle tarjetas técnica
    diaRutina.ejercicios.forEach(function(ej, i){
      var headEl = document.getElementById("head-prev-ej-" + (i+1));
      var bodyEl = document.getElementById("body-prev-ej-" + (i+1));
      if(headEl && bodyEl){
        headEl.addEventListener("click", function(){
          var open = bodyEl.style.display === "block";
          bodyEl.style.display = open ? "none" : "block";
          var chev = headEl.querySelector("div:last-child");
          if(chev) chev.textContent = open ? "›" : "⌄";
          // Iniciar animación al abrir
          if(!open && window.startAllAnimaciones){
            setTimeout(window.startAllAnimaciones, 30);
          }
        });
      }
    });

    document.getElementById("btn-iniciar-entreno").addEventListener("click", function(){
      iniciarEntrenamiento(diaRutina, rutina);
    });
  }

  // ── MODO ENTRENO ─────────────────────────────────────────
  function iniciarEntrenamiento(diaRutina, rutina){
    _workout.ejercicios   = diaRutina.ejercicios;
    _workout.seriesData   = {};
    _workout.historialPrev = {};
    _workout.cronSegundos = 0;
    _workout.diaNumero    = diaRutina.numero;
    _workout.diaRutina    = diaRutina;
    _workout.rutina       = rutina;

    // Cargar historial anterior para pre-rellenar pesos/reps
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var registros = window.db.getRegistros(alumno.id);
    // Buscar la última sesión del mismo día de rutina
    var prevReg = registros.slice().reverse().find(function(r){
      return r.dia_numero === diaRutina.numero ||
             r.sesion_nombre === diaRutina.nombre;
    });
    var prevEjData = {};
    if(prevReg){
      // From series_data (new format)
      if(prevReg.series_data){
        Object.keys(prevReg.series_data).forEach(function(k){
          prevEjData[k] = prevReg.series_data[k];
        });
      }
      // From ejercicios array (also new format, richer)
      if(Array.isArray(prevReg.ejercicios)){
        prevReg.ejercicios.forEach(function(ej){
          var k = ej.id || ej.nombre;
          if(k && ej.series && ej.series.length) prevEjData[k] = ej.series;
        });
      }
    }

    diaRutina.ejercicios.forEach(function(ej){
      var key = ej.id || ej.nombre;
      var prev = prevEjData[key] || [];
      _workout.seriesData[key] = [];
      _workout.historialPrev[key] = prev;
      for(var s=0; s<(ej.series||3); s++){
        var prevSerie = prev[s] || {};
        _workout.seriesData[key].push({
          reps: prevSerie.reps || parseInt(ej.repeticiones) || 0,
          kg:   prevSerie.kg   || 0,
          done: false
        });
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

    var _unit = localStorage.getItem("fitapp_unit") || "kg";
    var _kgToD = function(kg){ return _unit === "lbs" ? Math.round(kg * 2.20462 * 4) / 4 : parseFloat(kg); };
    var _dToKg = function(v){ return _unit === "lbs" ? Math.round(v / 2.20462 * 10) / 10 : parseFloat(v); };
    var _step  = _unit === "lbs" ? 5 : 2.5;
    var _uLbl  = _unit === "lbs" ? "lbs" : "kg";

    var html =
      "<div style='padding:0 20px 12px;display:flex;align-items:center;justify-content:space-between;'>" +
        "<div style='text-align:center;'>" +
          "<div id='me-timer-display' style='font-size:28px;font-weight:800;color:var(--accent);font-family:\"Space Mono\",monospace;letter-spacing:2px;'>" + pad2(Math.floor(_workout.cronSegundos/60)) + ":" + pad2(_workout.cronSegundos%60) + "</div>" +
          "<div style='font-size:10px;color:var(--text-muted);'>TIEMPO DE ENTRENO</div>" +
        "</div>" +
        // Toggle kg/lbs
        "<div style='display:flex;gap:0;border:1px solid var(--border);border-radius:20px;overflow:hidden;'>" +
          "<button id='me-unit-kg' style='padding:4px 10px;font-size:11px;font-weight:700;font-family:inherit;border:none;cursor:pointer;background:" + (_unit==="kg"?"var(--accent)":"var(--surface2)") + ";color:" + (_unit==="kg"?"#1C1C1E":"var(--text-muted)") + ";'>kg</button>" +
          "<button id='me-unit-lbs' style='padding:4px 10px;font-size:11px;font-weight:700;font-family:inherit;border:none;cursor:pointer;background:" + (_unit==="lbs"?"var(--accent)":"var(--surface2)") + ";color:" + (_unit==="lbs"?"#1C1C1E":"var(--text-muted)") + ";'>lbs</button>" +
        "</div>" +
        "<div id='progreso-entreno' style='font-size:13px;color:var(--text-muted);'>0/" + diaRutina.ejercicios.length + "</div>" +
      "</div>" +
      "<div style='height:3px;background:rgba(255,255,255,0.06);margin:0 0 16px;'>" +
        "<div id='barra-progreso-entreno' style='height:100%;background:#C8E000;width:0%;transition:width .3s;'></div>" +
      "</div>";

    // Mapa ejIdx -> texto de encabezado de superserie (si el ejercicio
    // es el primero de su grupo)
    var headerPorIdx = {};
    (function(){
      var idx = 0;
      agruparPorSuperserie(diaRutina.ejercicios).forEach(function(grupo){
        if(grupo.superserie) headerPorIdx[idx] = "SUPERSERIE ×" + grupo.rondas + " RONDAS";
        idx += grupo.items.length;
      });
    })();

    diaRutina.ejercicios.forEach(function(ej, ejIdx){
      var ejKey  = ej.id || ej.nombre;
      var series = _workout.seriesData[ejKey] || [];
      var todasDone = series.length > 0 && series.every(function(s){ return s.done; });

      if(headerPorIdx[ejIdx]){
        html += "<div style='font-size:11px;font-weight:800;color:#0A84FF;letter-spacing:.5px;text-transform:uppercase;background:rgba(10,132,255,0.1);border-radius:8px;padding:6px 10px;margin:14px 0 4px;'>" + headerPorIdx[ejIdx] + "</div>";
      }

      html += "<div id='ej-card-" + ejIdx + "' class='me-ej-card" + (todasDone?" completado":"") + (ej.superserie ? " superserie" : "") + "'>";

      // Header ejercicio
      html +=
        "<div class='me-ej-head' onclick='window._toggleEjCard(" + ejIdx + ")'>" +
          renderFotoEjercicio(ej, "me-ej-thumb") +
          "<div style='flex:1;'>" +
            "<div style='font-size:15px;font-weight:600;color:var(--text);'>" + (window.traducirEjercicio ? window.traducirEjercicio(ej.nombre) : ej.nombre) + "</div>" +
            "<div style='font-size:12px;color:var(--text-muted);margin-top:2px;'>" + ej.series + " series · " + ej.repeticiones + "</div>" +
          "</div>" +
          (todasDone ? "<span style='background:rgba(52,199,89,0.12);color:#34C759;border-radius:50px;padding:3px 10px;font-size:11px;font-weight:700;'>✓</span>" : "") +
          "<div id='chev-ej-" + ejIdx + "' style='color:var(--text-muted);font-size:18px;margin-left:8px;transition:transform .2s;'>" + (ejIdx===0?"⌄":"›") + "</div>" +
        "</div>";

      // Body series
      html += "<div id='series-card-" + ejIdx + "' class='me-ej-body-expand' style='display:" + (ejIdx===0?"block":"none") + ";'>";

      if(ej.nota_tecnica){
        html += "<div style='background:rgba(200,224,0,0.06);border-left:3px solid #C8E000;border-radius:0 8px 8px 0;padding:10px 12px;margin-bottom:14px;font-size:13px;color:var(--text-muted);'>ℹ️ " + ej.nota_tecnica + "</div>";
      }

      // Historial sesión anterior
      var prevH = (_workout.historialPrev && _workout.historialPrev[ejKey]) || [];
      if(prevH.length){
        html += "<div style='background:var(--surface2);border-radius:10px;padding:8px 12px;margin-bottom:12px;border:1px solid var(--border);'>" +
          "<div style='font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;'>📊 Sesión anterior</div>" +
          "<div style='display:flex;flex-wrap:wrap;gap:6px;'>" +
          prevH.map(function(ps, pi){
            var prevKgD = _kgToD(ps.kg || 0);
            return "<span style='font-size:11px;font-weight:700;color:var(--text-muted);background:var(--surface3);border-radius:6px;padding:3px 8px;'>" +
              "S" + (pi+1) + ": " + (ps.reps||"?") + " × " + prevKgD + _uLbl +
            "</span>";
          }).join("") +
          "</div></div>";
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
            // Kg/Lbs
            "<div class='me-val-ctrl'>" +
              "<div class='me-val-label'>" + _uLbl + "</div>" +
              "<div class='me-val-row'>" +
                "<button class='me-val-btn' onclick='window._cambiarVal(\"" + ejKey + "\"," + sIdx + ",\"kg\"," + (-_step) + ")'>−</button>" +
                "<div id='kg-" + ejIdx + "-" + sIdx + "' class='me-val-num accent'>" + _kgToD(serie.kg||0) + "</div>" +
                "<button class='me-val-btn' onclick='window._cambiarVal(\"" + ejKey + "\"," + sIdx + ",\"kg\"," + _step + ")'>+</button>" +
              "</div>" +
            "</div>" +
            // Check
            "<button id='btn-marcar-" + ejIdx + "-" + sIdx + "' class='me-check-btn" + (serie.done?" done":"") + "' " +
              "onclick='window._marcarSerie(\"" + ejKey + "\"," + ejIdx + "," + sIdx + "," + (ej.descanso_seg||90) + ")'>✓</button>" +
          "</div>";
      });

      html += renderBotonVideo(ej);
      // Botón grabar técnica
      var ejKeyEsc = (ej.id||ej.nombre||"").replace(/'/g,"").replace(/"/g,"");
      var ejNombreEsc = (ej.nombre||"").replace(/'/g,"").replace(/"/g,"");
      html += "<button onclick=\"window._grabarTecnica('" + ejKeyEsc + "','" + ejNombreEsc + "')\" " +
        "style='width:100%;height:44px;background:rgba(255,69,58,0.08);border:1px solid rgba(255,69,58,0.2);border-radius:12px;" +
        "color:#FF6B5B;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;margin-top:8px;" +
        "display:flex;align-items:center;justify-content:center;gap:8px;'>" +
        "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5'><path d='M23 7l-7 5 7 5V7z'/><rect x='1' y='5' width='15' height='14' rx='2'/></svg>" +
        "Grabar mi técnica para el coach" +
      "</button>";

      html += "</div></div>"; // cierre body + card
    });

    html += "<div style='padding:0 20px 16px;'>" +
      "<button onclick='window._finalizarEntreno()' style='width:100%;height:52px;background:rgba(52,199,89,0.12);color:#34C759;border:1px solid rgba(52,199,89,0.3);border-radius:50px;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;'>🏁 Finalizar entrenamiento</button>" +
    "</div>";

    page().innerHTML = html;
    if(window.startAllAnimaciones) setTimeout(window.startAllAnimaciones, 40);

    // Toggle kg/lbs: re-renderiza el modo entreno con la nueva unidad
    var btnMeKg  = document.getElementById("me-unit-kg");
    var btnMeLbs = document.getElementById("me-unit-lbs");
    if(btnMeKg)  btnMeKg.addEventListener("click",  function(){ localStorage.setItem("fitapp_unit","kg");  renderModoEntreno(diaRutina, rutina); });
    if(btnMeLbs) btnMeLbs.addEventListener("click", function(){ localStorage.setItem("fitapp_unit","lbs"); renderModoEntreno(diaRutina, rutina); });
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
    var unit = localStorage.getItem("fitapp_unit") || "kg";
    var kgToD = function(kg){ return unit === "lbs" ? Math.round(kg * 2.20462 * 4) / 4 : parseFloat(kg); };
    var dToKg = function(v){ return unit === "lbs" ? Math.round(v / 2.20462 * 10) / 10 : parseFloat(v); };
    var ejIdx = Object.keys(_workout.seriesData).indexOf(ejKey);
    if(campo === "reps"){
      serie.reps = Math.max(0, (serie.reps || 0) + delta);
      var el = document.getElementById("reps-" + ejIdx + "-" + sIdx);
      if(el) el.textContent = serie.reps;
    } else {
      // delta viene en la unidad activa; convertir a kg para guardar
      var currentDisp = kgToD(serie.kg || 0);
      var newDisp = Math.max(0, parseFloat((currentDisp + delta).toFixed(2)));
      serie.kg = dToKg(newDisp);
      var elkg = document.getElementById("kg-" + ejIdx + "-" + sIdx);
      if(elkg) elkg.textContent = newDisp;
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
    var diaRutina = _workout.diaRutina, rutina = _workout.rutina;

    // Validar que todos los ejercicios tengan al menos 1 serie marcada
    var ejsIncompletos = _workout.ejercicios.filter(function(ej){
      var key = ej.id || ej.nombre;
      var ss = _workout.seriesData[key] || [];
      return !ss.some(function(s){ return s.done; });
    });
    if(ejsIncompletos.length > 0){
      var modal2 = document.createElement("div");
      modal2.className = "modal-celebracion";
      modal2.innerHTML =
        "<div class='mc-card' style='text-align:center;'>" +
          "<div style='font-size:44px;margin-bottom:12px;'>⚠️</div>" +
          "<h2 style='margin-bottom:8px;'>Ejercicios pendientes</h2>" +
          "<div style='font-size:13px;color:var(--text-muted);margin-bottom:16px;line-height:1.5;'>" +
            "Faltan <strong>" + ejsIncompletos.length + " ejercicio" + (ejsIncompletos.length > 1 ? "s" : "") + "</strong> por completar:<br>" +
            "<span style='font-size:12px;'>" + ejsIncompletos.map(function(e){ return e.nombre; }).join(", ") + "</span>" +
          "</div>" +
          "<div style='display:flex;gap:10px;'>" +
            "<button id='btn-volver-ej' style='flex:1;height:48px;background:var(--surface2);border:1px solid var(--border);border-radius:50px;font-size:14px;font-weight:600;color:var(--text);cursor:pointer;font-family:inherit;'>Volver</button>" +
            "<button id='btn-forzar-fin' style='flex:1;height:48px;background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.3);border-radius:50px;font-size:14px;font-weight:600;color:#FF6B5B;cursor:pointer;font-family:inherit;'>Terminar igual</button>" +
          "</div>" +
        "</div>";
      document.body.appendChild(modal2);
      document.getElementById("btn-volver-ej").addEventListener("click", function(){ modal2.remove(); });
      document.getElementById("btn-forzar-fin").addEventListener("click", function(){ modal2.remove(); _finalizarEntreno_confirmar(diaRutina, rutina); });
      return;
    }

    _finalizarEntreno_confirmar(diaRutina, rutina);
  };

  function _finalizarEntreno_confirmar(diaRutina, rutina){
    pararCron();
    // Guardar hora real del entreno para recordatorio inteligente
    var ahora = new Date();
    localStorage.setItem("fitapp_last_workout_hour", ahora.getHours());
    localStorage.setItem("fitapp_last_workout_min",  ahora.getMinutes());
    var totalSeries = 0;
    Object.values(_workout.seriesData).forEach(function(ss){ totalSeries += ss.filter(function(s){ return s.done; }).length; });
    var duracion = Math.max(1, Math.round(_workout.cronSegundos/60));
    var tiempoTxt = pad2(Math.floor(_workout.cronSegundos/60)) + ":" + pad2(_workout.cronSegundos%60);
    _sensacion = 3;
    var _rating = 0;

    window.lanzarConfetti();

    var modal = document.createElement("div");
    modal.className = "modal-celebracion";
    modal.innerHTML =
      "<div class='mc-card'>" +
        "<div style='font-size:52px;margin-bottom:10px;'>🎉</div>" +
        "<h2>¡Sesión completada!</h2>" +
        "<div style='font-size:13px;color:rgba(255,255,255,.4);margin-bottom:6px;'>⏱ " + tiempoTxt + "</div>" +
        "<div style='display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:10px 0 16px;'>" +
          "<div style='background:#1C1C1C;border-radius:12px;padding:12px;'><div style='font-size:22px;font-weight:800;color:#C8E000;'>" + duracion + "</div><div style='font-size:11px;color:rgba(255,255,255,.4);'>minutos</div></div>" +
          "<div style='background:#1C1C1C;border-radius:12px;padding:12px;'><div style='font-size:22px;font-weight:800;color:#C8E000;'>" + _workout.ejercicios.length + "</div><div style='font-size:11px;color:rgba(255,255,255,.4);'>ejercicios</div></div>" +
          "<div style='background:#1C1C1C;border-radius:12px;padding:12px;'><div style='font-size:22px;font-weight:800;color:#C8E000;'>" + totalSeries + "</div><div style='font-size:11px;color:rgba(255,255,255,.4);'>series</div></div>" +
        "</div>" +
        "<div style='font-size:13px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:8px;'>¿Te ha gustado este entrenamiento?</div>" +
        "<div class='mc-rating' style='font-size:28px;letter-spacing:6px;margin-bottom:14px;'>" +
          [1,2,3,4,5].map(function(i){ return "<span data-star='" + i + "' style='cursor:pointer;color:rgba(255,255,255,.15);'>★</span>"; }).join("") +
        "</div>" +
        "<div class='mc-sensacion'>" +
          ["😫","😕","😐","💪","🔥"].map(function(e,i){ return "<span data-val='" + (i+1) + "'>" + e + "</span>"; }).join("") +
        "</div>" +
        "<textarea rows='2' placeholder='Nota personal (opcional)' id='mc-nota' class='mc-card textarea'></textarea>" +
        "<button class='pill-btn' id='mc-guardar'>Guardar y cerrar</button>" +
        "<button id='mc-editar' style='width:100%;margin-top:8px;height:44px;background:none;border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.5);border-radius:50px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;'>✏️ Editar resultados</button>" +
      "</div>";

    document.body.appendChild(modal);

    modal.querySelectorAll(".mc-rating span").forEach(function(star){
      star.addEventListener("click", function(){
        _rating = parseInt(star.getAttribute("data-star"),10);
        modal.querySelectorAll(".mc-rating span").forEach(function(s2){
          s2.style.color = parseInt(s2.getAttribute("data-star"),10) <= _rating ? "#FFD60A" : "rgba(255,255,255,.15)";
        });
      });
    });

    modal.querySelectorAll(".mc-sensacion span").forEach(function(s){
      s.addEventListener("click", function(){
        modal.querySelectorAll(".mc-sensacion span").forEach(function(x){ x.classList.remove("sel"); x.style.opacity=".3"; });
        s.classList.add("sel"); s.style.opacity="1"; s.style.transform="scale(1.3)";
        _sensacion = parseInt(s.getAttribute("data-val"),10);
      });
    });

    // Editar resultados: vuelve al modo entreno sin guardar ni perder el progreso
    document.getElementById("mc-editar").addEventListener("click", function(){
      modal.remove();
      if(_workout.cronInterval) clearInterval(_workout.cronInterval);
      _workout.cronInterval = setInterval(function(){
        _workout.cronSegundos++;
        var el = document.getElementById("me-timer-display");
        if(el) el.textContent = pad2(Math.floor(_workout.cronSegundos/60)) + ":" + pad2(_workout.cronSegundos%60);
      }, 1000);
      renderModoEntreno(diaRutina, rutina);
    });

    document.getElementById("mc-guardar").addEventListener("click", function(){
      var nota = (document.getElementById("mc-nota")||{}).value || "";
      // Build ejercicios array with series for history
      var ejArray = _workout.ejercicios.map(function(ej){
        var key = ej.id || ej.nombre;
        var ss = _workout.seriesData[key] || [];
        return { id:ej.id, nombre:ej.nombre, series: ss.map(function(s){ return { reps:s.reps, kg:s.kg, done:s.done }; }) };
      });
      var nuevas = window.db.saveRegistro(window.ALUMNO_ID, {
        id: window.db.generarId("reg"),
        fecha: window.db.fechaHoy(),
        dia_numero: _workout.diaNumero,
        sesion_nombre: _workout.ejercicios.length > 0 ? (_workout.ejercicios[0].grupo || _workout.ejercicios[0].nombre) : "Sesión",
        nombre_sesion: _workout.ejercicios.length + " ejercicios",
        ejercicios_completados: _workout.ejercicios.length,
        ejercicios_total: _workout.ejercicios.length,
        duracion_min: duracion,
        sensacion: _sensacion,
        rating: _rating,
        nota: nota,
        series_data: _workout.seriesData,
        ejercicios: ejArray
      });
      modal.remove();
      _workout.seriesData = {};
      renderLista();
      window.mostrarMedallasNuevas(nuevas);
    });
  };

  function renderFotoEjercicio(ej, cssClass){
    var foto = ej.foto || ej.foto_url || "";
    if(!foto){
      var bib = window.db.getEjercicios();
      var match = bib.filter(function(e){ return e.nombre === ej.nombre; })[0];
      if(match) foto = match.foto || match.foto_url || "";
    }
    var cls = cssClass || "";
    var wrapStyle = cls ? "" : "width:56px;height:56px;border-radius:12px;background:var(--surface2);flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;";
    if(foto){
      return "<div" + (cls ? " class='" + cls + "'" : " style='" + wrapStyle + "'") + ">" +
        "<img src='" + foto + "' style='width:100%;height:100%;object-fit:cover;" + (cls ? "" : "border-radius:12px;") + "'>" +
      "</div>";
    }
    // Canvas animation thumbnail
    var uid2 = "th-" + Math.random().toString(36).slice(2,8);
    if(window.getEjercicioAnimHTML){
      return "<div" + (cls ? " class='" + cls + "'" : " style='" + wrapStyle + "'") + ">" +
        window.getEjercicioAnimHTML(ej.nombre, uid2) +
      "</div>";
    }
    return "<div" + (cls ? " class='" + cls + "'" : " style='" + wrapStyle + "'") + ">" +
      "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='var(--text-muted)' stroke-width='1.5'><path d='M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4'/></svg>" +
    "</div>";
  }

  function renderBotonVideo(ej){
    var nombre = (ej.nombre||"").replace(/'/g,"");
    var url = ej.video_url || "";
    if(!url){
      var bib = window.db.getEjercicios();
      var match = bib.filter(function(e){ return e.nombre === ej.nombre; })[0];
      if(match) url = match.video_url || "";
    }
    if(!url) return "";
    return "<button onclick=\"window.abrirModalVideo('" + url + "','" + nombre + "')\" " +
      "style='width:100%;height:44px;background:rgba(10,132,255,0.1);border:1px solid rgba(10,132,255,0.25);border-radius:12px;" +
      "color:#0A84FF;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;margin-top:10px;" +
      "display:flex;align-items:center;justify-content:center;gap:8px;'>" +
      "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#0A84FF' stroke-width='2' stroke-linecap='round'><polygon points='5 3 19 12 5 21 5 3'/></svg>" +
      "Ver técnica" +
    "</button>";
  }

  window.init_agenda = function(){
    // Si hay un entrenamiento activo, regresar a él en vez de mostrar la lista
    if(_workout.cronInterval && _workout.diaRutina){
      renderModoEntreno(_workout.diaRutina, _workout.rutina);
      return;
    }
    state.weekOffset = 0;
    state.selectedDate = null;
    renderLista();
  };

  // ── GRABAR TÉCNICA ───────────────────────────────────────
  window._grabarTecnica = function(ejercicioId, nombreEjercicio){
    var inputId = "video-tecnica-input-" + ejercicioId;
    var input = document.getElementById(inputId);
    if(!input){
      input = document.createElement("input");
      input.type = "file"; input.accept = "video/*"; input.capture = "environment";
      input.id = inputId; input.style.display = "none";
      document.body.appendChild(input);
    }
    input.onchange = function(){
      var file = input.files[0];
      if(!file) return;
      if(file.size > 30 * 1024 * 1024){ window.mostrarToast("Video muy pesado. Máximo 30MB."); return; }
      _procesarVideoTecnica(file, ejercicioId, nombreEjercicio);
    };
    input.click();
  };

  function _procesarVideoTecnica(file, ejercicioId, nombreEjercicio){
    var alumnoId = window.db.getAlumnoActual();
    var alumno = window.db.getAlumnoPorId(alumnoId);
    var gymInfo = window.db.getGymInfo();
    window.mostrarToast("📹 Preparando tu video...");
    var videosKey = "fitapp_videos_tecnica_" + alumnoId;
    try { var videos = JSON.parse(localStorage.getItem(videosKey)||"[]"); } catch(e){ var videos = []; }
    var nuevoVideo = {
      id: "vid_" + Date.now(), ejercicio: nombreEjercicio,
      fecha: window.db.fechaHoy(),
      hora: new Date().toLocaleTimeString("es-EC",{hour:"2-digit",minute:"2-digit"}),
      tamano_mb: (file.size/(1024*1024)).toFixed(1), revisado: false
    };
    videos.push(nuevoVideo);
    try { localStorage.setItem(videosKey, JSON.stringify(videos)); } catch(e){}
    _mostrarModalEnviarTecnica(file, nombreEjercicio, alumno, gymInfo);
  }

  function _mostrarModalEnviarTecnica(file, nombreEjercicio, alumno, gymInfo){
    var videoURL = URL.createObjectURL(file);
    var modal = document.createElement("div");
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.93);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;";
    var nombreEsc = (nombreEjercicio||"").replace(/'/g,"\\'");
    modal.innerHTML =
      '<div style="width:100%;max-width:400px;background:#141414;border-radius:20px;padding:24px;text-align:center;">' +
        '<div style="font-size:40px;margin-bottom:12px;">📹</div>' +
        '<div style="font-size:18px;font-weight:700;color:#FFF;margin-bottom:6px;">Video listo</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px;">Técnica de "' + nombreEjercicio + '"</div>' +
        '<video src="' + videoURL + '" style="width:100%;border-radius:12px;margin-bottom:20px;max-height:240px;" controls playsinline></video>' +
        '<button id="btn-enviar-tecnica-wa" style="width:100%;height:52px;background:#25D366;color:#FFF;border:none;border-radius:50px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:8px;">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 6.32A8.86 8.86 0 0012.05 4a8.94 8.94 0 00-7.74 13.4L3 21l3.74-1.27a8.93 8.93 0 004.31 1.1h0a8.95 8.95 0 008.94-8.94 8.85 8.85 0 00-2.39-6.57z"/></svg>' +
          'Avisar a mi coach por WhatsApp' +
        '</button>' +
        '<button id="btn-cerrar-tecnica" style="width:100%;height:44px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);border:none;border-radius:50px;font-size:14px;font-family:inherit;cursor:pointer;">Guardar para después</button>' +
      '</div>';
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
    document.getElementById("btn-cerrar-tecnica").addEventListener("click", function(){ modal.remove(); });
    document.getElementById("btn-enviar-tecnica-wa").addEventListener("click", function(){
      var wa = (gymInfo && gymInfo.whatsapp ? gymInfo.whatsapp : "").replace(/[^0-9]/g,"");
      if(!wa){ window.mostrarToast("Tu coach no tiene WhatsApp configurado"); return; }
      var alumnoNombre = alumno ? alumno.nombre : "tu alumno";
      var mensaje = "🎥 *Revisión de técnica*\n\nHola, soy " + alumnoNombre + ".\nAcabo de hacer \"" + nombreEjercicio + "\" y quiero que revises mi técnica.\n\n_Te adjunto el video desde mi galería ahora mismo._";
      window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(mensaje), "_blank");
      window.mostrarToast("✓ Abre WhatsApp y adjunta el video de tu galería");
      modal.remove();
    });
  }
})();

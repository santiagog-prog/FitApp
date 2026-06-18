// ════════════════════════════════════════════════════════════
// habitos.js — Hábitos con fix event delegation + calendario
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  function padZ(n){ return n<10?"0"+n:""+n; }
  function fechaStr(d){ return d.getFullYear()+"-"+padZ(d.getMonth()+1)+"-"+padZ(d.getDate()); }

  // ── RENDER PRINCIPAL ────────────────────────────────────
  window.init_habitos = function(){
    var header = document.getElementById("app-header");
    header.innerHTML =
      "<div class='ah-top'><div></div><div class='ah-icons'></div></div>" +
      "<div class='ah-subtitle'>Rutina diaria</div>" +
      "<div class='ah-title'>Hábitos</div>";

    var alumno  = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var hoyKey  = window.db.fechaHoy();
    var habitos = window.db.getHabitos(alumno.id) || [];
    var completadosHoy = window.db.getHabitosCompletadosHoy(alumno.id, hoyKey) || [];

    var totalHoy = habitos.length;
    var hechoHoy = completadosHoy.length;
    var pct      = totalHoy ? Math.round(hechoHoy/totalHoy*100) : 0;

    var html = "<div style='padding-top:4px;'>";

    // Banner progreso
    html += "<div style='margin:0 20px 16px;background:#141414;border-radius:16px;padding:20px;'>" +
      "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;'>" +
        "<div><div style='font-size:26px;font-weight:800;color:#C8E000;'>" + hechoHoy + "/" + totalHoy + "</div>" +
        "<div style='font-size:12px;color:rgba(255,255,255,.35);margin-top:2px;'>completados hoy</div></div>" +
        "<div style='font-size:36px;'>" + (pct===100?"🔥":(pct>=50?"💪":"⚡")) + "</div>" +
      "</div>" +
      "<div style='background:rgba(255,255,255,.06);border-radius:99px;height:6px;overflow:hidden;'>" +
        "<div style='width:" + pct + "%;height:100%;background:#C8E000;border-radius:99px;transition:width .4s;'></div>" +
      "</div></div>";

    // Tabs Marcar hoy / Calendario
    html += "<div style='display:flex;background:#141414;border-radius:12px;padding:3px;margin:0 20px 16px;'>" +
      "<button id='tab-hab-hoy' style='flex:1;height:38px;border:none;background:#C8E000;color:#1C1C1E;font-size:13px;font-weight:700;border-radius:9px;font-family:inherit;cursor:pointer;'>Marcar hoy</button>" +
      "<button id='tab-hab-cal' style='flex:1;height:38px;border:none;background:transparent;color:rgba(255,255,255,0.5);font-size:13px;font-weight:600;border-radius:9px;font-family:inherit;cursor:pointer;'>Calendario</button>" +
    "</div>";

    // Vista "Hoy"
    html += "<div id='habitos-vista-hoy'>";
    if(habitos.length === 0){
      html += "<div style='text-align:center;padding:50px 20px;color:rgba(255,255,255,.3);font-size:14px;'>Tu coach aún no ha asignado hábitos.<br><br>Puedes crear los tuyos abajo.</div>";
    } else {
      html += "<div id='habitos-timeline' style='padding:0 20px;'></div>";
    }
    html += "<button id='btn-nuevo-habito' style='width:calc(100% - 40px);margin:16px 20px;height:48px;background:rgba(200,224,0,0.08);color:#C8E000;border:1.5px dashed rgba(200,224,0,0.3);border-radius:14px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;'>+ Nuevo hábito</button>";
    html += "</div>";

    // Vista Calendario (oculta)
    html += "<div id='habitos-vista-cal' style='display:none;'></div>";

    html += "<div style='height:20px;'></div></div>";

    document.getElementById("page-habitos").innerHTML = html;

    // Renderizar timeline con event delegation
    if(habitos.length > 0) _renderTimeline(alumno.id, habitos, completadosHoy, hoyKey);

    // Tabs
    document.getElementById("tab-hab-hoy").addEventListener("click", function(){
      _activarTab("hoy", alumno.id);
    });
    document.getElementById("tab-hab-cal").addEventListener("click", function(){
      _activarTab("cal", alumno.id);
    });

    // Nuevo hábito
    document.getElementById("btn-nuevo-habito").addEventListener("click", function(){
      _modalNuevoHabito(alumno.id);
    });
  };

  // ── TIMELINE CON EVENT DELEGATION ───────────────────────
  function _renderTimeline(alumnoId, habitos, completadosHoy, hoyKey){
    var container = document.getElementById("habitos-timeline");
    if(!container) return;
    if(!habitos || habitos.length === 0){ container.innerHTML = ""; return; }

    habitos.sort(function(a,b){ return (a.hora_sugerida||"00:00").localeCompare(b.hora_sugerida||"00:00"); });

    var html = habitos.map(function(h, i){
      var done = completadosHoy.indexOf(h.id) !== -1;
      var racha = window.db.calcularRachaHabito(alumnoId, h.id);
      var esUltimo = (i === habitos.length-1);
      return '<div style="display:flex;gap:14px;' + (!esUltimo?"margin-bottom:0;":"") + '">' +
        '<div style="display:flex;flex-direction:column;align-items:center;width:44px;flex-shrink:0;">' +
          '<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.3);margin-bottom:8px;height:16px;line-height:16px;">' + (h.hora_sugerida||"") + '</div>' +
          '<div style="width:10px;height:10px;border-radius:50%;flex-shrink:0;' + (done?"background:#C8E000;":"background:#242424;border:2px solid rgba(255,255,255,0.15);") + '"></div>' +
          (!esUltimo ? '<div style="width:1px;flex:1;background:rgba(255,255,255,0.06);margin-top:4px;min-height:32px;"></div>' : '') +
        '</div>' +
        '<div style="flex:1;background:#141414;border-radius:14px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:12px;border:1px solid ' + (done?"rgba(200,224,0,0.2)":"rgba(255,255,255,0.04)") + ';">' +
          '<div style="flex:1;">' +
            '<div style="font-size:15px;font-weight:600;' + (done?"color:rgba(255,255,255,0.4);text-decoration:line-through;":"color:#FFF;") + '">' + h.nombre + '</div>' +
            (racha > 1 ? '<div style="font-size:11px;color:#C8E000;margin-top:3px;">🔥 Racha: ' + racha + ' días</div>' : '') +
          '</div>' +
          '<div class="habito-check-btn" data-hid="' + h.id + '" style="width:34px;height:34px;border-radius:50%;flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;' + (done?"background:#C8E000;":"border:2px solid rgba(255,255,255,0.2);") + '">' +
            (done ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>' : '') +
          '</div>' +
          '<div class="habito-menu-btn" data-hid="' + h.id + '" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;opacity:.5;">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join("");

    container.innerHTML = html;

    // ─── EVENT DELEGATION — FIX CRÍTICO ───────────────────
    container.addEventListener("click", function(e){
      var checkBtn = e.target.closest(".habito-check-btn");
      if(checkBtn){
        e.stopPropagation();
        _toggleHabitoLocal(checkBtn.getAttribute("data-hid"));
        return;
      }
      var menuBtn = e.target.closest(".habito-menu-btn");
      if(menuBtn){
        e.stopPropagation();
        _menuHabito(menuBtn.getAttribute("data-hid"));
        return;
      }
    });
  }

  // ── TOGGLE CON db.toggleHabitoCheck ─────────────────────
  function _toggleHabitoLocal(habitoId){
    var alumnoId = window.db.getAlumnoActual();
    var fecha = window.db.fechaHoy();
    window.db.toggleHabitoCheck(alumnoId, habitoId, fecha);
    var done = window.db.getHabitosCompletadosHoy(alumnoId, fecha).indexOf(habitoId) !== -1;
    if(done){
      window.mostrarToast && window.mostrarToast("¡Hábito completado! ✅");
      if(navigator.vibrate) navigator.vibrate(50);
    }
    var nuevas = window.db.checkMedallas ? window.db.checkMedallas(alumnoId) : [];
    window.init_habitos();
    if(nuevas && nuevas.length && window.mostrarMedallasNuevas) window.mostrarMedallasNuevas(nuevas);
  }

  // ── TABS ────────────────────────────────────────────────
  function _activarTab(tab, alumnoId){
    var tabHoy = document.getElementById("tab-hab-hoy");
    var tabCal = document.getElementById("tab-hab-cal");
    var vHoy = document.getElementById("habitos-vista-hoy");
    var vCal = document.getElementById("habitos-vista-cal");
    if(!tabHoy || !tabCal) return;
    if(tab === "hoy"){
      tabHoy.style.background = "#C8E000"; tabHoy.style.color = "#1C1C1E";
      tabCal.style.background = "transparent"; tabCal.style.color = "rgba(255,255,255,0.5)";
      if(vHoy) vHoy.style.display = "block";
      if(vCal) vCal.style.display = "none";
    } else {
      tabCal.style.background = "#C8E000"; tabCal.style.color = "#1C1C1E";
      tabHoy.style.background = "transparent"; tabHoy.style.color = "rgba(255,255,255,0.5)";
      if(vHoy) vHoy.style.display = "none";
      if(vCal) vCal.style.display = "block";
      _renderCalendario(alumnoId);
    }
  }

  // ── CALENDARIO IPHONE — CRONOGRAMA HORARIO ─────────────
  var HAB_COLORS = ["#C8E000","#60A5FA","#FF9F0A","#A78BFA","#34D399","#F472B6","#FB923C","#38BDF8"];

  function _renderCalendario(alumnoId){
    var container = document.getElementById("habitos-vista-cal");
    if(!container) return;
    var habitos = window.db.getHabitos(alumnoId) || [];
    if(!habitos.length){ container.innerHTML = '<div style="text-align:center;padding:40px 20px;color:rgba(255,255,255,.3);">Sin hábitos asignados.</div>'; return; }

    var HORA_INI = 5, HORA_FIN = 23;
    var PX_POR_HORA = 64;
    var totalHoras = HORA_FIN - HORA_INI;
    var totalPx = totalHoras * PX_POR_HORA;
    var hoyKey = window.db.fechaHoy();
    var completadosHoy = window.db.getHabitosCompletadosHoy(alumnoId, hoyKey) || [];

    // Hora actual para línea roja
    var ahora = new Date();
    var horaActualFrac = ahora.getHours() + ahora.getMinutes()/60;
    var lineaY = (horaActualFrac - HORA_INI) * PX_POR_HORA;
    var mostrarLinea = horaActualFrac >= HORA_INI && horaActualFrac <= HORA_FIN;

    // Columna de horas (izquierda)
    var horasHTML = "";
    for(var h = HORA_INI; h <= HORA_FIN; h++){
      var y = (h - HORA_INI) * PX_POR_HORA;
      var label = h < 12 ? (h + " AM") : (h === 12 ? "12 PM" : (h-12) + " PM");
      horasHTML += '<div style="position:absolute;top:' + (y-8) + 'px;right:0;font-size:10px;font-weight:600;color:rgba(255,255,255,0.25);line-height:1;text-align:right;">' + label + '</div>';
    }

    // Líneas horizontales
    var lineasHTML = "";
    for(var lh = HORA_INI; lh <= HORA_FIN; lh++){
      var ly = (lh - HORA_INI) * PX_POR_HORA;
      lineasHTML += '<div style="position:absolute;top:' + ly + 'px;left:0;right:0;height:1px;background:rgba(255,255,255,0.04);"></div>';
    }

    // Bloques de hábitos
    var bloquesHTML = "";
    habitos.forEach(function(hab, idx){
      var horaStr = hab.hora_sugerida || "08:00";
      var parts = horaStr.split(":");
      var hNum = parseInt(parts[0], 10);
      var mNum = parseInt(parts[1]||"0", 10);
      var frac = hNum + mNum/60;
      if(frac < HORA_INI || frac >= HORA_FIN) frac = Math.max(HORA_INI, Math.min(HORA_FIN - 0.5, frac));
      var topY = (frac - HORA_INI) * PX_POR_HORA;
      var done = completadosHoy.indexOf(hab.id) !== -1;
      var color = HAB_COLORS[idx % HAB_COLORS.length];
      bloquesHTML +=
        '<div style="position:absolute;top:' + topY + 'px;left:0;right:0;height:' + (PX_POR_HORA * 0.85) + 'px;background:' + (done ? color : "rgba(255,255,255,0.05)") + ';border-left:3px solid ' + color + ';border-radius:0 8px 8px 0;padding:6px 10px;opacity:' + (done?"1":"0.7") + ';transition:all .3s;">' +
          '<div style="font-size:12px;font-weight:700;color:' + (done?"#0A0A0A":"#FFF") + ';overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">' + hab.nombre + '</div>' +
          '<div style="font-size:10px;color:' + (done?"rgba(0,0,0,0.6)":"rgba(255,255,255,0.4)") + ';margin-top:2px;">' + horaStr + (done?" · ✓ completado":"") + '</div>' +
        '</div>';
    });

    // Línea de hora actual
    var ahoraHTML = mostrarLinea
      ? '<div style="position:absolute;top:' + lineaY + 'px;left:-6px;right:0;height:2px;background:#FF453A;z-index:10;">' +
          '<div style="position:absolute;left:-3px;top:-4px;width:10px;height:10px;border-radius:50%;background:#FF453A;"></div>' +
        '</div>'
      : "";

    var html =
      '<div style="padding:0 20px 8px;">' +
        // Day selector chips
        (function(){
          var dias = ["Hoy","L","M","X","J","V","S"];
          return '<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;">' +
            dias.map(function(d, i){
              var activo = i === 0;
              return '<div style="flex-shrink:0;height:32px;padding:0 14px;border-radius:99px;display:flex;align-items:center;font-size:12px;font-weight:700;background:' + (activo?"#C8E000":"rgba(255,255,255,0.06)") + ';color:' + (activo?"#0A0A0A":"rgba(255,255,255,0.5)") + ';">' + d + '</div>';
            }).join("") +
          '</div>';
        })() +
      '</div>' +
      '<div style="position:relative;padding:0 20px;overflow-y:auto;max-height:70vh;-webkit-overflow-scrolling:touch;">' +
        '<div style="position:relative;height:' + totalPx + 'px;display:flex;">' +
          // Columna horas
          '<div style="position:relative;width:52px;flex-shrink:0;">' + horasHTML + '</div>' +
          // Área eventos
          '<div style="position:relative;flex:1;margin-left:8px;">' +
            lineasHTML +
            bloquesHTML +
            ahoraHTML +
          '</div>' +
        '</div>' +
      '</div>';

    container.innerHTML = html;
  }

  // ── MENÚ 3 PUNTOS ──────────────────────────────────────
  function _menuHabito(habitoId){
    var modal = document.createElement("div");
    modal.className = "modal-bottom";
    modal.innerHTML =
      '<div class="modal-bottom-sheet">' +
      '<div class="modal-handle"></div>' +
      '<div id="mh-editar" style="padding:16px 0;font-size:16px;color:#FFF;cursor:pointer;display:flex;align-items:center;gap:12px;border-bottom:.5px solid rgba(255,255,255,.06);">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Editar hábito</div>' +
      '<div id="mh-eliminar" style="padding:16px 0;font-size:16px;color:#FF453A;cursor:pointer;display:flex;align-items:center;gap:12px;border-bottom:.5px solid rgba(255,255,255,.06);">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="1.5"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>Eliminar hábito</div>' +
      '<div id="mh-cancelar" style="padding:16px 0;font-size:16px;color:rgba(255,255,255,.4);cursor:pointer;text-align:center;margin-top:4px;">Cancelar</div>' +
      '</div>';
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
    document.getElementById("mh-editar").addEventListener("click", function(){ modal.remove(); _modalEditarHabito(habitoId); });
    document.getElementById("mh-eliminar").addEventListener("click", function(){ modal.remove(); _eliminarHabito(habitoId); });
    document.getElementById("mh-cancelar").addEventListener("click", function(){ modal.remove(); });
  }

  function _modalEditarHabito(habitoId){
    var alumnoId = window.db.getAlumnoActual();
    var habitos = window.db.getHabitos(alumnoId)||[];
    var h = habitos.find(function(x){ return x.id===habitoId; });
    if(!h) return;
    var modal = document.createElement("div");
    modal.className = "modal-bottom";
    modal.innerHTML =
      '<div class="modal-bottom-sheet">' +
      '<div class="modal-handle"></div>' +
      '<div style="font-size:18px;font-weight:700;color:#FFF;margin-bottom:16px;">Editar hábito</div>' +
      '<input id="edit-hab-nombre" value="' + h.nombre.replace(/"/g,"&quot;") + '" style="width:100%;height:48px;background:#1C1C1C;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:0 16px;color:#FFF;font-family:inherit;font-size:15px;margin-bottom:12px;box-sizing:border-box;">' +
      '<input id="edit-hab-hora" type="time" value="' + (h.hora_sugerida||"08:00") + '" style="width:100%;height:48px;background:#1C1C1C;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:0 16px;color:#FFF;font-family:inherit;font-size:15px;margin-bottom:20px;box-sizing:border-box;">' +
      '<button id="btn-guardar-edit-hab" style="width:100%;height:52px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;">Guardar cambios</button>' +
      '</div>';
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
    document.getElementById("btn-guardar-edit-hab").addEventListener("click", function(){
      var nombre = document.getElementById("edit-hab-nombre").value.trim();
      var hora = document.getElementById("edit-hab-hora").value;
      if(!nombre) return;
      var idx = habitos.findIndex(function(x){ return x.id===habitoId; });
      if(idx>=0){ habitos[idx].nombre=nombre; habitos[idx].hora_sugerida=hora; }
      localStorage.setItem("fitapp_habitos_"+alumnoId, JSON.stringify(habitos));
      modal.remove();
      window.mostrarToast && window.mostrarToast("✓ Hábito actualizado");
      window.init_habitos();
    });
  }

  function _eliminarHabito(habitoId){
    if(!confirm("¿Eliminar este hábito?")) return;
    var alumnoId = window.db.getAlumnoActual();
    var habitos = (window.db.getHabitos(alumnoId)||[]).filter(function(x){ return x.id!==habitoId; });
    localStorage.setItem("fitapp_habitos_"+alumnoId, JSON.stringify(habitos));
    window.mostrarToast && window.mostrarToast("Hábito eliminado");
    window.init_habitos();
  }

  function _modalNuevoHabito(alumnoId){
    var modal = document.createElement("div");
    modal.className = "modal-bottom";
    modal.innerHTML =
      '<div class="modal-bottom-sheet">' +
      '<div class="modal-handle"></div>' +
      '<div style="font-size:18px;font-weight:700;color:#FFF;margin-bottom:16px;">Nuevo hábito</div>' +
      '<input id="new-hab-nombre" placeholder="Ej: Estirar antes de dormir" style="width:100%;height:48px;background:#1C1C1C;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:0 16px;color:#FFF;font-family:inherit;font-size:15px;margin-bottom:12px;box-sizing:border-box;">' +
      '<input id="new-hab-hora" type="time" value="08:00" style="width:100%;height:48px;background:#1C1C1C;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:0 16px;color:#FFF;font-family:inherit;font-size:15px;margin-bottom:20px;box-sizing:border-box;">' +
      '<button id="btn-crear-hab" style="width:100%;height:52px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;">Crear hábito</button>' +
      '</div>';
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
    setTimeout(function(){ var inp=document.getElementById("new-hab-nombre"); if(inp) inp.focus(); }, 150);
    document.getElementById("btn-crear-hab").addEventListener("click", function(){
      var nombre = (document.getElementById("new-hab-nombre").value||"").trim();
      var hora   = document.getElementById("new-hab-hora").value;
      if(!nombre) return;
      var habitos = window.db.getHabitos(alumnoId)||[];
      habitos.push({ id:"hab_"+Date.now(), nombre:nombre, hora_sugerida:hora, racha:0 });
      localStorage.setItem("fitapp_habitos_"+alumnoId, JSON.stringify(habitos));
      modal.remove();
      window.mostrarToast && window.mostrarToast("✓ Hábito creado");
      window.init_habitos();
    });
  }

  // Mantener compatibilidad con llamadas externas antiguas
  window._toggleHabito = function(habitoId){ _toggleHabitoLocal(habitoId); };
  window._menuHabito   = function(habitoId, e){ if(e) e.stopPropagation(); _menuHabito(habitoId); };
  window._nuevoHabito  = function(){ var a = window.db.getAlumnoActual(); _modalNuevoHabito(a); };
})();

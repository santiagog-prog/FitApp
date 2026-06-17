// ════════════════════════════════════════════════════════════
// habitos.js — Hábitos con timeline vertical y racha
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  var ICONOS = {
    agua:"💧", vitaminas:"💊", dormir:"😴", caminata:"🚶",
    meditacion:"🧘", proteina:"🥩", frutas:"🍎", no_azucar:"🚫",
    yoga:"🧘", ejercicio:"💪", lectura:"📖", desayuno:"🍳", default:"✅"
  };

  function iconoHabito(h){ return ICONOS[h.tipo||h.icono||h.id]||h.icono_emoji||"✅"; }
  function padZ(n){ return n<10?"0"+n:n; }

  function renderSemanaHabitos(alumnoId, habitos){
    var semana = [];
    var hoy = new Date();
    for(var i=6; i>=0; i--){
      var d = new Date(hoy);
      d.setDate(hoy.getDate()-i);
      var key = d.getFullYear() + "-" + padZ(d.getMonth()+1) + "-" + padZ(d.getDate());
      var comp= window.db.getHabitosCompletadosHoy(alumnoId, key);
      semana.push({ key:key, dia:["D","L","M","X","J","V","S"][d.getDay()], comp:comp.length, total:habitos.length });
    }
    var dias = semana.map(function(d){
      var pct = d.total ? d.comp/d.total : 0;
      var color = pct===1?"#C8E000":(pct>0?"rgba(200,224,0,.4)":"rgba(255,255,255,.06)");
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">' +
        '<div style="width:10px;height:10px;border-radius:50%;background:' + color + ';"></div>' +
        '<div style="font-size:10px;color:rgba(255,255,255,.3);">' + d.dia + '</div>' +
      '</div>';
    }).join("");
    return '<div style="margin:16px 20px 0;background:var(--surface);border-radius:16px;padding:16px;display:flex;justify-content:space-between;align-items:center;">' +
      '<div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase;">Esta semana</div>' +
      '<div style="display:flex;gap:14px;align-items:center;">' + dias + '</div>' +
    '</div>';
  }

  window.init_habitos = function(){
    var header = document.getElementById("app-header");
    header.innerHTML =
      "<div class='ah-top'><div></div><div class='ah-icons'></div></div>" +
      "<div class='ah-subtitle'>Rutina diaria</div>" +
      "<div class='ah-title'>Hábitos</div>";

    var alumno  = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var hoyKey  = window.db.fechaHoy();
    var habitos = window.db.getHabitos(alumno.id);
    var completadosHoy = window.db.getHabitosCompletadosHoy(alumno.id, hoyKey);

    var totalHoy = habitos.length;
    var hechoHoy = completadosHoy.length;
    var pct      = totalHoy ? Math.round(hechoHoy/totalHoy*100) : 0;

    var html = "<div style='padding-top:4px;'>";

    // Progress banner
    html += "<div style='margin:0 20px 20px;background:var(--surface);border-radius:16px;padding:20px;'>" +
      "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;'>" +
        "<div>" +
          "<div style='font-size:22px;font-weight:800;color:#C8E000;'>" + hechoHoy + "/" + totalHoy + "</div>" +
          "<div style='font-size:12px;color:rgba(255,255,255,.35);margin-top:2px;'>completados hoy</div>" +
        "</div>" +
        "<div style='font-size:32px;'>" + (pct===100?"🔥":(pct>=50?"💪":"⚡")) + "</div>" +
      "</div>" +
      "<div style='background:rgba(255,255,255,.06);border-radius:99px;height:6px;overflow:hidden;'>" +
        "<div style='width:" + pct + "%;height:100%;background:#C8E000;border-radius:99px;transition:width .4s;'></div>" +
      "</div>" +
    "</div>";

    if(habitos.length === 0){
      html += "<div style='text-align:center;padding:60px 20px;color:rgba(255,255,255,.3);font-size:14px;'>Tu coach aún no ha asignado hábitos.</div>";
    } else {
      html += "<div class='habito-timeline'>";
      habitos.forEach(function(h, i){
        var done  = completadosHoy.indexOf(h.id) !== -1;
        var racha = window.db.calcularRachaHabito(alumno.id, h.id);
        var hora  = h.hora_sugerida || "";
        var esUltimo = (i === habitos.length-1);
        html +=
          '<div class="habito-tl-item' + (esUltimo?" last":"") + '">' +
            '<div class="habito-tl-hora">' + (hora||"&nbsp;") + '</div>' +
            '<div class="habito-tl-connector">' +
              '<div class="habito-tl-dot' + (done?" done":"") + '"></div>' +
              (!esUltimo ? '<div class="habito-tl-line"></div>' : "") +
            '</div>' +
            '<div class="habito-tl-card' + (done?" done":"") + '">' +
              '<div class="habito-tl-icono">' + iconoHabito(h) + '</div>' +
              '<div style="flex:1;">' +
                '<div class="habito-tl-nombre">' + h.nombre + '</div>' +
                (h.descripcion ? '<div class="habito-tl-desc">' + h.descripcion + '</div>' : "") +
                (racha>1 ? '<div style="font-size:11px;color:#C8E000;margin-top:3px;">🔥 Racha: ' + racha + ' días</div>' : "") +
              '</div>' +
              '<button onclick="window._menuHabito(\'' + h.id + '\',event)" style="background:none;border:none;padding:6px;cursor:pointer;flex-shrink:0;">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.3)"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>' +
              '</button>' +
              '<button class="habito-tl-btn' + (done?" done":"") + '" ' +
                'onclick="window._toggleHabito(\'' + h.id + '\',\'' + hoyKey + '\')">' +
                (done
                  ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
                  : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>') +
              '</button>' +
            '</div>' +
          '</div>';
      });
      html += "</div>";
      html += '<button onclick="window._nuevoHabito()" style="width:calc(100% - 40px);margin:16px 20px;height:48px;background:rgba(200,224,0,0.08);color:#C8E000;border:1.5px dashed rgba(200,224,0,0.3);border-radius:14px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;">+ Nuevo hábito</button>';
    }

    html += renderSemanaHabitos(alumno.id, habitos);
    html += "<div style='height:20px;'></div></div>";

    document.getElementById("page-habitos").innerHTML = html;
  };

  window._menuHabito = function(habitoId, event){
    event.stopPropagation();
    var menu = document.createElement('div');
    menu.className = 'modal-bottom';
    menu.innerHTML =
      '<div class="modal-bottom-sheet">' +
      '<div class="modal-handle"></div>' +
      '<div onclick="window._editarHabito(\'' + habitoId + '\')" style="padding:16px 0;font-size:16px;color:#FFF;cursor:pointer;display:flex;align-items:center;gap:12px;border-bottom:0.5px solid rgba(255,255,255,0.06);">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
        'Editar hábito' +
      '</div>' +
      '<div onclick="window._eliminarHabito(\'' + habitoId + '\')" style="padding:16px 0;font-size:16px;color:#FF453A;cursor:pointer;display:flex;align-items:center;gap:12px;border-bottom:0.5px solid rgba(255,255,255,0.06);">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="1.5"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/></svg>' +
        'Eliminar hábito' +
      '</div>' +
      '<div onclick="this.closest(\'.modal-bottom\').remove()" style="padding:16px 0;font-size:16px;color:rgba(255,255,255,0.4);cursor:pointer;text-align:center;margin-top:4px;">Cancelar</div>' +
      '</div>';
    menu.addEventListener('click', function(e){ if(e.target===menu) menu.remove(); });
    document.body.appendChild(menu);
  };

  window._editarHabito = function(habitoId){
    document.querySelectorAll('.modal-bottom').forEach(function(m){ m.remove(); });
    var alumnoId = window.db.getAlumnoActual();
    var habitos = window.db.getHabitos(alumnoId);
    var h = habitos.find(function(x){ return x.id===habitoId; });
    if(!h) return;
    var modal = document.createElement('div');
    modal.className = 'modal-bottom';
    modal.innerHTML =
      '<div class="modal-bottom-sheet">' +
      '<div class="modal-handle"></div>' +
      '<div style="font-size:18px;font-weight:700;color:#FFF;margin-bottom:16px;">Editar hábito</div>' +
      '<input id="edit-hab-nombre" value="' + h.nombre + '" style="width:100%;height:48px;background:#1C1C1C;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:0 16px;color:#FFF;font-family:inherit;font-size:15px;margin-bottom:12px;box-sizing:border-box;">' +
      '<input id="edit-hab-hora" type="time" value="' + (h.hora_sugerida||'08:00') + '" style="width:100%;height:48px;background:#1C1C1C;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:0 16px;color:#FFF;font-family:inherit;font-size:15px;margin-bottom:20px;box-sizing:border-box;">' +
      '<button onclick="window._guardarHabito(\'' + habitoId + '\')" style="width:100%;height:52px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;">Guardar cambios</button>' +
      '</div>';
    modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
  };

  window._guardarHabito = function(habitoId){
    var alumnoId = window.db.getAlumnoActual();
    var habitos = window.db.getHabitos(alumnoId);
    var idx = habitos.findIndex(function(x){ return x.id===habitoId; });
    if(idx===-1) return;
    var nombre = document.getElementById('edit-hab-nombre');
    var hora   = document.getElementById('edit-hab-hora');
    if(nombre) habitos[idx].nombre = nombre.value;
    if(hora)   habitos[idx].hora_sugerida = hora.value;
    localStorage.setItem('fitapp_habitos_' + alumnoId, JSON.stringify(habitos));
    document.querySelectorAll('.modal-bottom').forEach(function(m){ m.remove(); });
    window.mostrarToast && window.mostrarToast('✓ Hábito actualizado');
    window.init_habitos();
  };

  window._eliminarHabito = function(habitoId){
    if(!confirm('¿Eliminar este hábito?')) return;
    document.querySelectorAll('.modal-bottom').forEach(function(m){ m.remove(); });
    var alumnoId = window.db.getAlumnoActual();
    var habitos = window.db.getHabitos(alumnoId).filter(function(x){ return x.id!==habitoId; });
    localStorage.setItem('fitapp_habitos_' + alumnoId, JSON.stringify(habitos));
    window.mostrarToast && window.mostrarToast('Hábito eliminado');
    window.init_habitos();
  };

  window._nuevoHabito = function(){
    var modal = document.createElement('div');
    modal.className = 'modal-bottom';
    modal.innerHTML =
      '<div class="modal-bottom-sheet">' +
      '<div class="modal-handle"></div>' +
      '<div style="font-size:18px;font-weight:700;color:#FFF;margin-bottom:16px;">Nuevo hábito</div>' +
      '<input id="new-hab-nombre" placeholder="Ej: Estirar antes de dormir" style="width:100%;height:48px;background:#1C1C1C;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:0 16px;color:#FFF;font-family:inherit;font-size:15px;margin-bottom:12px;box-sizing:border-box;">' +
      '<input id="new-hab-hora" type="time" value="08:00" style="width:100%;height:48px;background:#1C1C1C;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:0 16px;color:#FFF;font-family:inherit;font-size:15px;margin-bottom:20px;box-sizing:border-box;">' +
      '<button onclick="window._crearHabito()" style="width:100%;height:52px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;">Crear hábito</button>' +
      '</div>';
    modal.addEventListener('click', function(e){ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
    setTimeout(function(){ var inp=document.getElementById('new-hab-nombre'); if(inp) inp.focus(); },150);
  };

  window._crearHabito = function(){
    var nombre = document.getElementById('new-hab-nombre');
    var hora   = document.getElementById('new-hab-hora');
    if(!nombre||!nombre.value.trim()) return;
    var alumnoId = window.db.getAlumnoActual();
    var habitos = window.db.getHabitos(alumnoId);
    habitos.push({ id:'hab_'+Date.now(), nombre:nombre.value.trim(), icono:'check', hora_sugerida:hora?hora.value:'08:00', racha:0 });
    localStorage.setItem('fitapp_habitos_' + alumnoId, JSON.stringify(habitos));
    document.querySelectorAll('.modal-bottom').forEach(function(m){ m.remove(); });
    window.mostrarToast && window.mostrarToast('✓ Hábito creado');
    window.init_habitos();
  };

  window._toggleHabito = function(habitoId, fecha){
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var completados = window.db.getHabitosCompletadosHoy(alumno.id, fecha);
    var idx = completados.indexOf(habitoId);
    if(idx === -1){
      completados.push(habitoId);
      window.mostrarToast("¡Hábito completado! ✅");
    } else {
      completados.splice(idx,1);
    }
    var clave = "fitapp_habitos_completados_" + alumno.id + "_" + fecha;
    localStorage.setItem(clave, JSON.stringify(completados));
    var nuevas = window.db.checkMedallas ? window.db.checkMedallas(alumno.id) : [];
    window.init_habitos();
    if(nuevas && nuevas.length && window.mostrarMedallasNuevas) window.mostrarMedallasNuevas(nuevas);
  };
})();

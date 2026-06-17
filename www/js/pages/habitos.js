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
    }

    html += renderSemanaHabitos(alumno.id, habitos);
    html += "<div style='height:20px;'></div></div>";

    document.getElementById("page-habitos").innerHTML = html;
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

// ════════════════════════════════════════════════════════════
// perfil.js — Perfil dark redesign
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  window.init_perfil = function(){
    var alumno    = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var registros = window.db.getRegistros(alumno.id);
    var horasTotal= Math.round(registros.reduce(function(s,r){ return s+(r.duracion_min||0); },0)/60);
    var racha     = window.db.calcularRacha(alumno.id);
    var medallas  = window.db.getMedallas(alumno.id);
    var notas     = window.db.getNotas(alumno.id);
    var prefs     = JSON.parse(localStorage.getItem("fitapp_prefs_" + alumno.id)||"{}");
    var pesos     = window.db.getPesos(alumno.id);
    var pesoActual= pesos.length ? pesos[pesos.length-1].kg : (alumno.peso_actual||"—");
    var initials  = (alumno.nombre||"?")[0].toUpperCase() + ((alumno.apellido||"")[0]||"").toUpperCase();

    var header = document.getElementById("app-header");
    header.innerHTML =
      "<div class='ah-top'><div></div><div class='ah-icons'></div></div>" +
      "<div class='ah-subtitle'>Mi cuenta</div>" +
      "<div class='ah-title'>Perfil</div>";

    var html = "<div style='padding-top:4px;'>";

    // Avatar + info
    html +=
      "<div class='perfil-header-grad'>" +
        "<div class='perfil-avatar'>" + initials + "</div>" +
        "<div class='perfil-nombre'>" + alumno.nombre + " " + (alumno.apellido||"") + "</div>" +
        "<div class='perfil-codigo'>Código: " + alumno.codigo + "</div>" +
        "<div style='display:flex;gap:8px;justify-content:center;margin-top:10px;'>" +
          "<span style='background:rgba(200,224,0,.15);color:#C8E000;border-radius:99px;padding:4px 14px;font-size:12px;font-weight:600;'>" + (alumno.objetivo||"").replace(/_/g," ") + "</span>" +
          "<span style='background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);border-radius:99px;padding:4px 14px;font-size:12px;font-weight:600;'>" + (alumno.nivel||"") + "</span>" +
        "</div>" +
      "</div>";

    // Stats 2x2
    html += "<div class='perfil-stat-grid'>" +
      stat(registros.length, "Entrenos") +
      stat(horasTotal + "h",  "Horas totales") +
      stat(racha,             "Racha · días") +
      stat(medallas.length,   "Medallas") +
    "</div>";

    // Datos del programa
    html += "<div style='margin:0 20px 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase;'>Programa</div>";
    html += "<div class='perfil-list'>" +
      row("Fecha de inicio", alumno.fecha_inicio||"—") +
      row("Rutina", alumno.rutina_nombre||alumno.rutina_id||"—") +
      row("Peso inicial", (alumno.peso_inicial||"—") + " kg") +
      row("Peso actual", pesoActual + " kg") +
    "</div>";

    // Preferencias
    html += "<div style='margin:16px 20px 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase;'>Preferencias</div>";
    html += "<div class='perfil-list'>" +
      toggle("Sonidos en temporizador", "tg-sonido", prefs.sonido!==false) +
      toggle("Vibración al completar serie", "tg-vibra", prefs.vibracion!==false) +
      toggle("Notificaciones", "tg-notif", !!prefs.notif) +
    "</div>";

    // Notas del coach
    html += "<div style='margin:16px 20px 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase;'>Notas de mi coach</div>";
    if(notas.length === 0){
      html += "<div style='padding:16px 20px;color:rgba(255,255,255,.3);font-size:13px;'>Sin notas todavía.</div>";
    } else {
      html += "<div class='perfil-list'>";
      notas.slice().reverse().slice(0,5).forEach(function(n){
        html += "<div class='nota-coach-dark'>" +
          (!n.leida ? "<span style='color:#C8E000;margin-right:6px;'>●</span>" : "") +
          n.texto +
          "<div style='font-size:11px;color:rgba(255,255,255,.25);margin-top:4px;'>" + n.fecha + "</div>" +
        "</div>";
      });
      html += "</div>";
    }

    // Logout
    html += "<div style='padding:20px 20px 32px;'>" +
      "<button id='btn-logout' style='width:100%;height:48px;background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.3);border-radius:50px;color:#FF453A;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;'>Cerrar sesión</button>" +
    "</div></div>";

    document.getElementById("page-perfil").innerHTML = html;
    window.db.marcarNotasLeidas(alumno.id);

    // Bind toggles
    function bindToggle(id, key){
      var el = document.getElementById(id);
      if(!el) return;
      el.addEventListener("click", function(){
        el.classList.toggle("on");
        prefs[key] = el.classList.contains("on");
        localStorage.setItem("fitapp_prefs_" + alumno.id, JSON.stringify(prefs));
        if(key==="notif" && prefs.notif && "Notification" in window) Notification.requestPermission();
      });
    }
    bindToggle("tg-notif","notif");
    bindToggle("tg-sonido","sonido");
    bindToggle("tg-vibra","vibracion");

    document.getElementById("btn-logout").addEventListener("click", function(){
      window.db.clearSesion();
      location.href = "../index.html";
    });
  };

  function stat(val, label){
    return '<div style="background:var(--surface);border-radius:14px;padding:16px;text-align:center;">' +
      '<div style="font-size:22px;font-weight:800;color:#C8E000;">' + val + '</div>' +
      '<div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:3px;">' + label + '</div>' +
    '</div>';
  }
  function row(label, val){
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.04);">' +
      '<span style="font-size:14px;color:rgba(255,255,255,.55);">' + label + '</span>' +
      '<span style="font-size:14px;font-weight:600;color:#FFF;">' + val + '</span>' +
    '</div>';
  }
  function toggle(label, id, on){
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.04);">' +
      '<span style="font-size:14px;color:rgba(255,255,255,.55);">' + label + '</span>' +
      '<div class="toggle-switch' + (on?" on":"") + '" id="' + id + '"><div class="knob"></div></div>' +
    '</div>';
  }
})();

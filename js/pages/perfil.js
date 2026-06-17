// ════════════════════════════════════════════════════════════
// perfil.js — Page Perfil del alumno
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  window.init_perfil = function(){
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    renderHeaderBack();

    var registros = window.db.getRegistros(alumno.id);
    var horasTotal = (registros.reduce(function(s,r){ return s+(r.duracion_min||0); },0)/60).toFixed(1);
    var imc = (alumno.peso_actual / Math.pow(alumno.altura/100, 2)).toFixed(1);
    var notas = window.db.getNotas(alumno.id);
    var prefs = JSON.parse(localStorage.getItem("fitapp_prefs_" + alumno.id) || "{}");

    var html = "<div class='perfil-avatar-box'>" +
      "<div class='av-circ'>" + alumno.nombre[0] + (alumno.apellido?alumno.apellido[0]:"") + "</div>" +
      "<h2>" + alumno.nombre + " " + (alumno.apellido||"") + "</h2>" +
      "<p style='font-family:var(--font-data);color:var(--text-muted);font-size:.8rem;'>Código " + alumno.codigo + "</p>" +
      "<span class='chip-dark' style='margin-top:8px;display:inline-block;'>" + alumno.objetivo.replace("_"," ") + "</span> " +
      "<span class='chip-dark' style='margin-top:8px;display:inline-block;'>" + alumno.nivel + "</span>" +
      "</div>";

    html += "<div class='perfil-row'><span>Fecha de inicio</span><span>" + alumno.fecha_inicio + "</span></div>" +
      "<div class='perfil-row'><span>Peso inicial</span><span>" + alumno.peso_inicial + " kg</span></div>" +
      "<div class='perfil-row'><span>Peso actual</span><span>" + alumno.peso_actual + " kg</span></div>" +
      "<div class='perfil-row'><span>IMC</span><span>" + imc + "</span></div>";

    html += "<div class='resumen-grid px'>" +
      "<div class='resumen-chip'><div class='rc-val'>" + registros.length + "</div><div class='rc-label'>Entrenamientos</div></div>" +
      "<div class='resumen-chip'><div class='rc-val'>" + horasTotal + "h</div><div class='rc-label'>Horas totales</div></div>" +
      "<div class='resumen-chip'><div class='rc-val'>" + window.db.calcularRacha(alumno.id) + "</div><div class='rc-label'>Racha actual</div></div>" +
      "<div class='resumen-chip'><div class='rc-val'>" + window.db.getMedallas(alumno.id).length + "</div><div class='rc-label'>Medallas</div></div>" +
      "</div>";

    html += "<div class='px'><h3 style='margin-bottom:6px;'>Preferencias</h3></div>";
    html += "<div class='perfil-row'><span>Notificaciones de recordatorio</span><div class='toggle-switch" + (prefs.notif?" on":"") + "' id='tg-notif'><div class='knob'></div></div></div>";
    html += "<div class='perfil-row'><span>Sonidos en temporizador</span><div class='toggle-switch" + (prefs.sonido!==false?" on":"") + "' id='tg-sonido'><div class='knob'></div></div></div>";
    html += "<div class='perfil-row'><span>Vibración al completar serie</span><div class='toggle-switch" + (prefs.vibracion!==false?" on":"") + "' id='tg-vibra'><div class='knob'></div></div></div>";

    html += "<div class='px'><h3 style='margin-bottom:6px;'>Escáner de comida con IA</h3>" +
      "<p style='font-size:.78rem;color:var(--text-muted);margin-bottom:10px;line-height:1.5;'>Para que el escáner de comida reconozca tu plato automáticamente, pega tu propia clave de la API de Anthropic. Se guarda solo en este dispositivo. <strong>Aviso de seguridad:</strong> esta clave queda visible en el código de la app — úsala solo para pruebas personales, nunca en una app pública de tienda.</p>" +
      "<input type='password' id='input-api-key' placeholder='sk-ant-...' value='" + window.db.getApiKeyAnthropic() + "' style='width:100%;padding:12px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);border-radius:10px;margin-bottom:8px;font-family:var(--font-data);font-size:.8rem;'>" +
      "<button class='outline-btn' id='btn-guardar-api-key'>Guardar clave</button></div>";

    html += "<div class='px'><h3 style='margin-bottom:6px;'>Notas de mi coach</h3></div>";
    if(notas.length === 0){
      html += "<p class='px' style='color:var(--text-muted);font-size:.85rem;'>Sin notas todavía.</p>";
    } else {
      notas.slice().reverse().forEach(function(n){
        html += "<div class='nota-coach-card'>" + (n.leida ? "" : "🟠 ") + n.texto + "<div style='font-size:.72rem;color:var(--text-muted);margin-top:6px;'>" + n.fecha + "</div></div>";
      });
    }

    html += "<div class='px'><button class='outline-btn' style='border-color:var(--red);color:var(--red);' id='btn-logout'>Cerrar sesión</button></div>";

    document.getElementById("page-perfil").innerHTML = html;
    window.db.marcarNotasLeidas(alumno.id);

    function bindToggle(id, key){
      var el = document.getElementById(id);
      el.addEventListener("click", function(){
        el.classList.toggle("on");
        prefs[key] = el.classList.contains("on");
        localStorage.setItem("fitapp_prefs_" + alumno.id, JSON.stringify(prefs));
        if(key === "notif" && prefs.notif && "Notification" in window) Notification.requestPermission();
      });
    }
    bindToggle("tg-notif", "notif");
    bindToggle("tg-sonido", "sonido");
    bindToggle("tg-vibra", "vibracion");

    document.getElementById("btn-guardar-api-key").addEventListener("click", function(){
      window.db.setApiKeyAnthropic(document.getElementById("input-api-key").value.trim());
      window.mostrarToast("Clave guardada en este dispositivo");
    });

    document.getElementById("btn-logout").addEventListener("click", function(){
      window.db.clearSesion();
      location.href = "../index.html";
    });
  };

  function renderHeaderBack(){
    window.renderHeaderDetalle("Perfil", function(){ window.irAPagina("inicio"); });
  }
})();

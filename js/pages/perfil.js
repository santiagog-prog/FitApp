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
        "<div class='perfil-avatar' id='perfil-avatar-wrap' style='cursor:pointer;position:relative;overflow:hidden;'>" +
        "<span id='perfil-avatar-initials'>" + initials + "</span>" +
        "<img id='perfil-avatar-img' src='' style='display:none;position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:50%;'>" +
        "<div style='position:absolute;bottom:0;right:0;width:22px;height:22px;background:#C8E000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;'>✏️</div>" +
      "</div>" +
      "<input type='file' id='perfil-foto-input' accept='image/*' style='display:none;'>" +
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

    // Comparativa entre alumnos
    html += "<div style='margin:16px 20px 0;font-size:12px;font-weight:600;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase;'>Reto entre amigos</div>";
    html += "<div id='comparativa-card' style='background:var(--surface);border-radius:16px;padding:18px;margin:8px 20px 0;'></div>";

    // ── Ajustes IA ──
    var currentApiKey = window.db.getOpenAIKey();
    html += "<div style='padding:8px 20px;'>" +
      "<div style='background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;'>" +
        "<div style='font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:12px;'>Ajustes IA · Food Vision</div>" +
        "<div style='font-size:13px;font-weight:600;margin-bottom:6px;'>OpenAI API Key</div>" +
        "<input id='openai-key-input' class='api-key-field' type='password' placeholder='sk-...' autocomplete='off'>" +
        "<div style='font-size:11px;color:var(--text-muted);margin-top:6px;'>Para Escanear Comida con IA (Nutrición). Se guarda solo en este dispositivo.</div>" +
        "<button id='btn-save-api-key' style='margin-top:10px;width:100%;height:42px;background:var(--accent);border:none;border-radius:99px;color:#1C1C1E;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer;'>Guardar API Key</button>" +
      "</div>" +
    "</div>";

    // Logout
    html += "<div style='padding:20px 20px 32px;'>" +
      "<button id='btn-logout' style='width:100%;height:48px;background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.3);border-radius:50px;color:#FF453A;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;'>Cerrar sesión</button>" +
    "</div></div>";

    document.getElementById("page-perfil").innerHTML = html;
    window.db.marcarNotasLeidas(alumno.id);

    // API Key input: poner valor actual después de renderizar
    var akInput = document.getElementById("openai-key-input");
    if(akInput && currentApiKey) akInput.value = currentApiKey;

    document.getElementById("btn-save-api-key").addEventListener("click", function(){
      var v = (document.getElementById("openai-key-input").value || "").trim();
      if(!v){ window.mostrarToast("⚠️ Introduce tu API Key"); return; }
      window.db.saveOpenAIKey(v);
      window.mostrarToast("✅ API Key guardada");
    });

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

    _renderComparativaCard(alumno.id);

    // Avatar foto editable + full-screen view
    var savedPhoto = localStorage.getItem("fitapp_avatar_" + alumno.id);
    if(savedPhoto){
      document.getElementById("perfil-avatar-initials").style.display = "none";
      var imgEl = document.getElementById("perfil-avatar-img");
      imgEl.src = savedPhoto;
      imgEl.style.display = "block";
    }

    document.getElementById("perfil-avatar-wrap").addEventListener("click", function(){
      var photo = localStorage.getItem("fitapp_avatar_" + alumno.id);
      if(photo){
        // Full-screen TikTok-style modal
        var modal = document.createElement("div");
        modal.id = "avatar-fullscreen-modal";
        modal.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.96);display:flex;flex-direction:column;align-items:center;justify-content:center;animation:lsIn .2s ease both;";
        modal.innerHTML =
          '<img src="' + photo + '" style="max-width:100%;max-height:80vh;object-fit:contain;border-radius:12px;">' +
          '<div style="position:absolute;top:env(safe-area-inset-top,16px);right:16px;display:flex;gap:12px;">' +
            '<button id="avatar-fs-cambiar" style="height:40px;padding:0 20px;background:rgba(255,255,255,0.12);color:#FFF;border:none;border-radius:99px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;">Cambiar foto</button>' +
            '<button id="avatar-fs-cerrar" style="width:40px;height:40px;background:rgba(255,255,255,0.12);color:#FFF;border:none;border-radius:50%;font-size:20px;font-family:inherit;cursor:pointer;">×</button>' +
          '</div>';
        document.body.appendChild(modal);
        document.getElementById("avatar-fs-cerrar").addEventListener("click", function(){ modal.remove(); });
        document.getElementById("avatar-fs-cambiar").addEventListener("click", function(){ modal.remove(); document.getElementById("perfil-foto-input").click(); });
        modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
      } else {
        document.getElementById("perfil-foto-input").click();
      }
    });

    document.getElementById("perfil-foto-input").addEventListener("change", function(e){
      var file = e.target.files[0];
      if(!file) return;
      var reader = new FileReader();
      reader.onload = function(ev){
        var img = new Image();
        img.onload = function(){
          var canvas = document.createElement("canvas");
          var size = 200;
          canvas.width = size; canvas.height = size;
          var ctx = canvas.getContext("2d");
          var scale = Math.max(size/img.width, size/img.height);
          var w = img.width*scale, h = img.height*scale;
          ctx.drawImage(img, (size-w)/2, (size-h)/2, w, h);
          var dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          localStorage.setItem("fitapp_avatar_" + alumno.id, dataUrl);
          document.getElementById("perfil-avatar-initials").style.display = "none";
          var imgEl2 = document.getElementById("perfil-avatar-img");
          imgEl2.src = dataUrl;
          imgEl2.style.display = "block";
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // ── COMPARATIVA ─────────────────────────────────────────
  function _calcPctMes(alumnoId){
    var registros = window.db.getRegistros(alumnoId);
    var hoy = new Date();
    var delMes = registros.filter(function(r){ var f=new Date(r.fecha); return f.getMonth()===hoy.getMonth()&&f.getFullYear()===hoy.getFullYear(); });
    var esperados = Math.max(1, Math.ceil(hoy.getDate()*(4/7)));
    return Math.min(100, Math.round((delMes.length/esperados)*100));
  }

  function _renderComparativaCard(alumnoId){
    var container = document.getElementById("comparativa-card");
    if(!container) return;
    var vinculo = window.db.getVinculoDe(alumnoId);

    // Solicitud pendiente donde yo soy el receptor (alumno2)
    if(vinculo && !window.db.vinculoEstaActivo(vinculo) && vinculo.confirmado_por.indexOf(alumnoId)===-1){
      var solicitante = window.db.getAlumnoPorId(vinculo.alumno1);
      container.innerHTML =
        '<div style="font-size:14px;font-weight:700;color:#FFF;margin-bottom:8px;">🤝 Solicitud de reto</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:16px;">' + (solicitante?solicitante.nombre:"Alguien") + ' quiere comparar su progreso contigo.</div>' +
        '<div style="display:flex;gap:10px;">' +
          '<button id="btn-aceptar-vinculo" style="flex:1;height:46px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;">Aceptar</button>' +
          '<button id="btn-rechazar-vinculo" style="flex:1;height:46px;background:rgba(255,69,58,0.1);color:#FF453A;border:1px solid rgba(255,69,58,0.3);border-radius:50px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;">Rechazar</button>' +
        '</div>';
      document.getElementById("btn-aceptar-vinculo").addEventListener("click", function(){
        window.db.confirmarVinculo(vinculo.id, alumnoId);
        window.mostrarToast && window.mostrarToast("✓ ¡Reto activado!");
        _renderComparativaCard(alumnoId);
      });
      document.getElementById("btn-rechazar-vinculo").addEventListener("click", function(){
        window.db.rechazarVinculo(vinculo.id);
        window.mostrarToast && window.mostrarToast("Solicitud rechazada");
        _renderComparativaCard(alumnoId);
      });
      return;
    }

    if(!vinculo){
      container.innerHTML =
        '<div style="font-size:14px;font-weight:600;color:#FFF;margin-bottom:6px;">¿Entrenas con alguien?</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:14px;">Vincula tu progreso con un amigo y vean juntos quién cumple más.</div>' +
        '<input id="codigo-vincular" type="tel" inputmode="numeric" placeholder="Código de la otra persona" style="width:100%;height:46px;background:#1C1C1C;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:0 14px;color:#FFF;font-family:inherit;font-size:15px;margin-bottom:10px;box-sizing:border-box;">' +
        '<button id="btn-solicitar-vinculo" style="width:100%;height:46px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;">Vincular</button>';
      document.getElementById("btn-solicitar-vinculo").addEventListener("click", function(){
        var codigo = (document.getElementById("codigo-vincular").value||"").trim();
        if(!codigo){ window.mostrarToast && window.mostrarToast("Escribe el código"); return; }
        var otro = window.db.getAlumnoPorCodigo(codigo);
        if(!otro){ window.mostrarToast && window.mostrarToast("Código no encontrado"); return; }
        if(otro.id===alumnoId){ window.mostrarToast && window.mostrarToast("No puedes vincularte contigo mismo"); return; }
        window.db.vincularAlumnos(alumnoId, otro.id);
        window.mostrarToast && window.mostrarToast("✓ Solicitud enviada a " + otro.nombre);
        _renderComparativaCard(alumnoId);
      });
      return;
    }

    if(!window.db.vinculoEstaActivo(vinculo)){
      var otroIdPend = vinculo.alumno1===alumnoId ? vinculo.alumno2 : vinculo.alumno1;
      var otroPend = window.db.getAlumnoPorId(otroIdPend);
      container.innerHTML =
        '<div style="font-size:14px;font-weight:600;color:#FFF;margin-bottom:6px;">⏳ Esperando confirmación</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.4);">' + (otroPend?otroPend.nombre:"Tu invitado") + ' debe aceptar la solicitud desde su app.</div>';
      return;
    }

    var otroId = vinculo.alumno1===alumnoId ? vinculo.alumno2 : vinculo.alumno1;
    var otro = window.db.getAlumnoPorId(otroId);
    var miRacha = window.db.calcularRacha(alumnoId);
    var suRacha = window.db.calcularRacha(otroId);
    var miPct = _calcPctMes(alumnoId);
    var suPct = _calcPctMes(otroId);

    function vsRow(miVal, suVal, label){
      return '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:12px;">' +
        '<div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:' + (miVal>=suVal?"#C8E000":"#FFF") + ';">' + miVal + '</div><div style="font-size:10px;color:rgba(255,255,255,.35);">Tú</div></div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,.2);text-align:center;">' + label + '</div>' +
        '<div style="text-align:center;"><div style="font-size:22px;font-weight:800;color:' + (suVal>miVal?"#C8E000":"#FFF") + ';">' + suVal + '</div><div style="font-size:10px;color:rgba(255,255,255,.35);">' + (otro?otro.nombre:"Rival") + '</div></div>' +
      '</div>';
    }

    container.innerHTML =
      '<div style="font-size:14px;font-weight:700;color:#FFF;margin-bottom:14px;">⚔️ Reto activo</div>' +
      vsRow(miRacha, suRacha, "Racha días") +
      vsRow(miPct+"%", suPct+"%", "Cumplimiento mes") +
      '<div style="font-size:11px;color:rgba(255,255,255,.25);text-align:center;margin-top:4px;">Constancia — no peso ni cuerpo 💪</div>';
  }

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

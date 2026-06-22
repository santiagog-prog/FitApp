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
    html += sectionHead("📋", "Mi Programa", "#60A5FA");
    html += "<div style='margin:0 20px 16px;background:#111;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);'>" +
      row("Fecha de inicio", alumno.fecha_inicio||"—") +
      row("Rutina", alumno.rutina_nombre||alumno.rutina_id||"—") +
      row("Peso inicial", (alumno.peso_inicial||"—") + " kg") +
      row("Peso actual", pesoActual + " kg") +
    "</div>";

    // Preferencias
    html += sectionHead("⚙️", "Preferencias", "#A78BFA");
    html += "<div style='margin:0 20px 16px;background:#111;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);'>" +
      toggle("Sonidos en temporizador", "tg-sonido", prefs.sonido!==false) +
      toggle("Vibración al completar serie", "tg-vibra", prefs.vibracion!==false) +
      toggle("Notificaciones", "tg-notif", !!prefs.notif) +
    "</div>";

    // Notas del coach
    html += sectionHead("📝", "Notas de mi Coach", "#FBBF24");
    if(notas.length === 0){
      html += "<div style='margin:0 20px 16px;background:#111;border-radius:18px;padding:20px;border:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,.3);font-size:13px;text-align:center;'>Tu coach aún no ha escrito notas</div>";
    } else {
      html += "<div style='margin:0 20px 16px;display:flex;flex-direction:column;gap:8px;'>";
      notas.slice().reverse().slice(0,5).forEach(function(n){
        html += "<div style='background:#111;border-radius:14px;padding:14px 16px;border:1px solid " + (!n.leida?"rgba(200,224,0,0.2)":"rgba(255,255,255,0.06)") + ";'>" +
          (!n.leida ? "<div style='font-size:10px;font-weight:700;color:#C8E000;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;'>● Nueva</div>" : "") +
          "<div style='font-size:13px;color:rgba(255,255,255,.75);line-height:1.5;'>" + n.texto + "</div>" +
          "<div style='font-size:11px;color:rgba(255,255,255,.2);margin-top:6px;'>" + n.fecha + "</div>" +
        "</div>";
      });
      html += "</div>";
    }

    // Comparativa entre alumnos
    html += sectionHead("🏆", "Reto con Amigos", "#FF9F0A");
    html += "<div id='comparativa-card' style='background:#111;border-radius:18px;padding:18px;margin:0 20px 16px;border:1px solid rgba(255,255,255,0.06);'></div>";

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
    var misRegs = window.db.getRegistros(alumnoId);
    var susRegs = window.db.getRegistros(otroId);
    var misMes = misRegs.filter(function(r){ var f=new Date(r.fecha); var h=new Date(); return f.getMonth()===h.getMonth()&&f.getFullYear()===h.getFullYear(); }).length;
    var susMes = susRegs.filter(function(r){ var f=new Date(r.fecha); var h=new Date(); return f.getMonth()===h.getMonth()&&f.getFullYear()===h.getFullYear(); }).length;
    var misHoras = Math.round(misRegs.reduce(function(s,r){ return s+(r.duracion_min||0); },0)/60);
    var susHoras = Math.round(susRegs.reduce(function(s,r){ return s+(r.duracion_min||0); },0)/60);
    var miHabCheck = window.db.getHabitoChecks ? window.db.getHabitoChecks(alumnoId) : {};
    var suHabCheck = window.db.getHabitoChecks ? window.db.getHabitoChecks(otroId) : {};
    var miHabTotal = Object.values(miHabCheck).reduce(function(s,d){ return s+Object.keys(d).filter(function(k){ return d[k]; }).length; },0);
    var suHabTotal = Object.values(suHabCheck).reduce(function(s,d){ return s+Object.keys(d).filter(function(k){ return d[k]; }).length; },0);

    function vsBar(miVal, suVal, label, color){
      var total = Math.max(miVal + suVal, 1);
      var miPctBar = Math.round(miVal/total*100);
      var suPctBar = 100 - miPctBar;
      var miGana = miVal >= suVal;
      return '<div style="margin-bottom:14px;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
          '<span style="font-size:12px;font-weight:800;color:' + (miGana?color:"rgba(255,255,255,.5)") + ';">' + miVal + '</span>' +
          '<span style="font-size:11px;color:rgba(255,255,255,.3);">' + label + '</span>' +
          '<span style="font-size:12px;font-weight:800;color:' + (!miGana?color:"rgba(255,255,255,.5)") + ';">' + suVal + '</span>' +
        '</div>' +
        '<div style="height:8px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden;display:flex;">' +
          '<div style="width:' + miPctBar + '%;background:' + (miGana?color:"rgba(255,255,255,.2)") + ';border-radius:99px 0 0 99px;"></div>' +
          '<div style="width:' + suPctBar + '%;background:' + (!miGana?color:"rgba(255,255,255,.1)") + ';border-radius:0 99px 99px 0;margin-left:2px;"></div>' +
        '</div>' +
      '</div>';
    }

    var yoGanando = (miRacha>=suRacha?1:0)+(misMes>=susMes?1:0)+(misHoras>=susHoras?1:0)+(miHabTotal>=suHabTotal?1:0);
    var ganando = yoGanando >= 3;

    // Reto personalizado (apuesta) guardado
    var apuesta = localStorage.getItem("fitapp_apuesta_" + vinculo.id) || "";

    container.innerHTML =
      '<div style="text-align:center;margin-bottom:16px;">' +
        '<div style="font-size:28px;margin-bottom:6px;">' + (ganando?"🏆":"⚔️") + '</div>' +
        '<div style="font-size:16px;font-weight:800;color:#FFF;">' + (ganando?"¡Vas ganando!":"Tú vs " + (otro?otro.nombre:"tu rival")) + '</div>' +
        (apuesta ? '<div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:4px;">🎯 Apuesta: ' + apuesta + '</div>' : '') +
      '</div>' +
      // Nombres
      '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:14px;">' +
        '<div style="text-align:center;">' +
          '<div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#C8E000,#8FB200);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#0A0A0A;margin:0 auto 4px;">' + (window.db.getAlumnoPorId(alumnoId)||{nombre:"Yo"}).nombre[0] + '</div>' +
          '<div style="font-size:12px;font-weight:700;color:#FFF;">Tú</div>' +
        '</div>' +
        '<div style="font-size:14px;font-weight:900;color:rgba(255,255,255,.2);">VS</div>' +
        '<div style="text-align:center;">' +
          '<div style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#FFF;margin:0 auto 4px;">' + (otro?otro.nombre[0]:"?") + '</div>' +
          '<div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.5);">' + (otro?otro.nombre:"?") + '</div>' +
        '</div>' +
      '</div>' +
      vsBar(miRacha, suRacha, "🔥 Racha (días)", "#C8E000") +
      vsBar(misMes, susMes, "🏋️ Entrenos este mes", "#60A5FA") +
      vsBar(misHoras, susHoras, "⏱️ Horas totales", "#FF9F0A") +
      vsBar(miHabTotal, suHabTotal, "🌿 Hábitos completados", "#A78BFA") +
      // Marcador
      '<div style="background:rgba(200,224,0,0.06);border-radius:12px;padding:12px;text-align:center;margin-top:4px;border:1px solid rgba(200,224,0,0.1);">' +
        '<div style="font-size:11px;font-weight:700;color:rgba(200,224,0,0.7);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;">Marcador</div>' +
        '<div style="font-size:22px;font-weight:900;color:#FFF;">' + yoGanando + ' – ' + (4-yoGanando) + '</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px;">' + (ganando?"Tú lideras 💪":"Sigue esforzándote 🔥") + '</div>' +
      '</div>' +
      // Apuesta
      (!apuesta ? '<div style="margin-top:12px;">' +
        '<input id="apuesta-input" placeholder="Añade una apuesta (ej: batido fit al perdedor)" style="width:100%;height:42px;background:#1C1C1C;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:0 12px;color:#FFF;font-family:inherit;font-size:13px;">' +
        '<button id="btn-guardar-apuesta" style="width:100%;margin-top:8px;height:42px;background:rgba(200,224,0,0.1);color:#C8E000;border:1px solid rgba(200,224,0,0.2);border-radius:50px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">💰 Establecer apuesta</button>' +
      '</div>' : '') +
      '<div style="margin-top:10px;display:flex;gap:8px;">' +
        '<button id="btn-desvincular" style="flex:1;height:40px;background:rgba(255,69,58,.08);color:#FF453A;border:1px solid rgba(255,69,58,.2);border-radius:50px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">Terminar reto</button>' +
        '<button id="btn-ver-rutina-rival" style="flex:1;height:40px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.08);border-radius:50px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">📋 Ver rutina rival</button>' +
      '</div>';

    var btnApuesta = document.getElementById("btn-guardar-apuesta");
    if(btnApuesta) btnApuesta.addEventListener("click", function(){
      var val = (document.getElementById("apuesta-input").value||"").trim();
      if(!val) return;
      localStorage.setItem("fitapp_apuesta_" + vinculo.id, val);
      window.mostrarToast && window.mostrarToast("💰 Apuesta guardada: " + val);
      _renderComparativaCard(alumnoId);
    });
    var btnDesv = document.getElementById("btn-desvincular");
    if(btnDesv) btnDesv.addEventListener("click", function(){
      if(!confirm("¿Terminar este reto?")) return;
      window.db.rechazarVinculo(vinculo.id);
      window.mostrarToast && window.mostrarToast("Reto terminado");
      _renderComparativaCard(alumnoId);
    });
    var btnRut = document.getElementById("btn-ver-rutina-rival");
    if(btnRut) btnRut.addEventListener("click", function(){
      var rutOtro = otro ? window.db.getRutinaPorId(otro.rutina_id) : null;
      var msg = rutOtro ? "Rutina de " + otro.nombre + ": " + (rutOtro.nombre || rutOtro.id) : "Tu rival aún no tiene rutina asignada.";
      window.mostrarToast && window.mostrarToast(msg);
    });
  }

  function sectionHead(icon, label, color){
    return '<div style="display:flex;align-items:center;gap:10px;margin:4px 20px 10px;padding:12px 14px;background:linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02));border-radius:14px;border-left:3px solid ' + (color||"#C8E000") + ';">' +
      '<span style="font-size:20px;line-height:1;">' + icon + '</span>' +
      '<span style="font-size:15px;font-weight:800;color:#FFF;letter-spacing:-.3px;">' + label + '</span>' +
    '</div>';
  }
  function stat(val, label){
    return '<div style="background:linear-gradient(145deg,#151515,#0d0d0d);border-radius:16px;padding:18px 12px;text-align:center;border:1px solid rgba(255,255,255,0.07);box-shadow:0 4px 16px rgba(0,0,0,.4);">' +
      '<div style="font-size:26px;font-weight:900;color:#C8E000;letter-spacing:-.5px;line-height:1;">' + val + '</div>' +
      '<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.3);margin-top:5px;text-transform:uppercase;letter-spacing:.5px;">' + label + '</div>' +
    '</div>';
  }
  function row(label, val){
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:15px 20px;border-bottom:1px solid rgba(255,255,255,.04);">' +
      '<span style="font-size:14px;color:rgba(255,255,255,.45);font-weight:500;">' + label + '</span>' +
      '<span style="font-size:14px;font-weight:700;color:#FFF;">' + val + '</span>' +
    '</div>';
  }
  function toggle(label, id, on){
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:15px 20px;border-bottom:1px solid rgba(255,255,255,.04);">' +
      '<span style="font-size:14px;color:rgba(255,255,255,.55);">' + label + '</span>' +
      '<div class="toggle-switch' + (on?" on":"") + '" id="' + id + '"><div class="knob"></div></div>' +
    '</div>';
  }
})();

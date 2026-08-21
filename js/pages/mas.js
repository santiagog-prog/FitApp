// ════════════════════════════════════════════════════════════
// mas.js — Pestaña "Más"
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  function svgIcon(tipo){
    var icons = {
      camera:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
      target:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
      building: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V12h6v10"/></svg>',
      users:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
      video:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
      person:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
      chat:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
      shoe:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 18l1.5-4.5 3-1.5 3 3 4.5-6L17 13l3 1-1 4H2z"/></svg>',
      edit:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
    };
    return icons[tipo] || icons.person;
  }

  function itemRow(icono, color, titulo, sub, id){
    return '<button id="' + id + '" style="display:flex;align-items:center;gap:14px;width:100%;background:var(--surface);border-radius:16px;padding:16px;margin-bottom:10px;border:1px solid var(--border);cursor:pointer;text-align:left;font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent;">' +
      '<div style="width:46px;height:46px;border-radius:12px;background:' + color + '1A;color:' + color + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + svgIcon(icono) + '</div>' +
      '<div style="flex:1;">' +
        '<div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:2px;">' + titulo + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);">' + sub + '</div>' +
      '</div>' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>' +
    '</button>';
  }

  window.init_mas = function(){
    var alumno  = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var gymInfo = window.db.getGymInfo();

    var header = document.getElementById("app-header");
    header.innerHTML =
      "<div class='ah-top'>" +
        "<div class='ah-logo-area'><div class='ah-wordmark'>Más</div></div>" +
        "<div class='ah-icons'></div>" +
      "</div>";

    var html = '<div style="padding:16px 0 80px;">';

    // Foto de perfil real
    var fotos = (window.db.getFotos && alumno) ? window.db.getFotos(alumno.id) : [];
    var fotoUrl = fotos.length ? fotos[fotos.length-1].url : null;
    var avatarHtml = fotoUrl
      ? '<img src="'+fotoUrl+'" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2.5px solid var(--accent);flex-shrink:0;">'
      : '<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#C8E000,#5A8000);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#1C1C1E;flex-shrink:0;">'+(alumno && alumno.nombre ? alumno.nombre.charAt(0).toUpperCase() : "S")+'</div>';

    html += '<div style="display:flex;align-items:center;gap:14px;padding:0 20px 20px;">' +
      avatarHtml +
      '<div style="flex:1;">' +
        '<div style="font-size:17px;font-weight:700;color:var(--text);">' + (alumno ? alumno.nombre + " " + (alumno.apellido||"") : "—") + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Código: <strong style="color:var(--accent-text);">' + (alumno ? alumno.codigo : "—") + '</strong></div>' +
        (gymInfo && gymInfo.nombre ? '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">🏟️ '+gymInfo.nombre+'</div>' : '') +
      '</div>' +
      '<button id="mas-btn-salir" style="padding:6px 14px;background:rgba(255,59,48,0.08);border:1px solid rgba(255,59,48,0.2);border-radius:99px;color:#FF3B30;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;">Salir</button>' +
    '</div>';

    html += '<div style="padding:0 20px;">';

    // Sección: Yo
    html += '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Yo</div>';
    html += itemRow("person",   "#0A84FF", "Mi perfil",         "Datos personales y preferencias",      "mas-btn-perfil");
    html += itemRow("camera",   "#0A84FF", "Fotos de progreso", "Sube tu foto semanal",                 "mas-btn-fotos");
    html += itemRow("edit",     "#8E44AD", "Editar perfil",     "Rutina, plan y objetivos del coach",   "mas-btn-editar");

    // Sección: Actividad
    html += '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px;">Actividad</div>';
    html += itemRow("target",   "#FF9500", "Hábitos",           "Marca tus hábitos diarios",            "mas-btn-habitos");
    html += itemRow("shoe",     "#5AC8FA", "Cardio y pasos",    "Registra tus pasos y sesiones",        "mas-btn-cardio");
    html += itemRow("users",    "#BF5AF2", "Reto entre amigos", "Compite con un amigo",                 "mas-btn-reto");
    html += itemRow("video",    "#FF6B5B", "Videos de técnica", "Historial enviado a tu coach",         "mas-btn-videos");

    // Sección: Gym
    html += '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px;">Gym</div>';
    html += itemRow("building", "#34C759", "Mi gimnasio",       gymInfo && gymInfo.nombre ? gymInfo.nombre : "Horarios y clases", "mas-btn-gym");

    var wa = gymInfo && gymInfo.whatsapp ? gymInfo.whatsapp.replace(/[^0-9]/g,"") : "";
    html += itemRow("chat", "#25D366", "Hablar con mi coach", wa ? "Contacto directo por WhatsApp" : "Escríbele a tu entrenador", "mas-btn-coach");

    html += '</div></div>';

    document.getElementById("page-mas").innerHTML = html;

    // Event listeners
    function nav(id, pagina){ var el=document.getElementById(id); if(el) el.addEventListener("click",function(){ window.irAPagina(pagina); }); }
    nav("mas-btn-perfil",  "perfil");
    nav("mas-btn-fotos",   "fotos");
    nav("mas-btn-editar",  "editar");
    nav("mas-btn-habitos", "habitos");
    nav("mas-btn-cardio",  "cardio");
    nav("mas-btn-reto",    "reto");
    nav("mas-btn-gym",     "gym");

    var btnVideos = document.getElementById("mas-btn-videos");
    if(btnVideos) btnVideos.addEventListener("click", window._abrirHistorialVideos);

    var btnCoach = document.getElementById("mas-btn-coach");
    if(btnCoach){
      btnCoach.addEventListener("click", function(){
        if(wa){
          window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent("Hola! Tengo una consulta sobre mi entrenamiento."), "_blank");
        } else {
          window.mostrarToast && window.mostrarToast("Tu coach no tiene WhatsApp registrado aún");
        }
      });
    }

    var btnSalir = document.getElementById("mas-btn-salir");
    if(btnSalir){
      btnSalir.addEventListener("click", function(){
        if(confirm("¿Cerrar sesión?")){
          window.db.clearSesion();
          location.href = "../index.html";
        }
      });
    }
  };

  function getAmigos(alumnoId){
    try { return JSON.parse(localStorage.getItem("fitapp_amigos_"+alumnoId)||"[]"); } catch(e){ return []; }
  }
  function saveAmigos(alumnoId, ids){
    localStorage.setItem("fitapp_amigos_"+alumnoId, JSON.stringify(ids));
  }

  function renderCardAmigo(a){
    var fotos = window.db.getFotos ? window.db.getFotos(a.id) : [];
    var fotoUrl = fotos.length ? fotos[fotos.length-1].url : null;
    var racha = window.db.calcularRacha ? window.db.calcularRacha(a.id) : 0;
    var regs = window.db.getRegistros ? window.db.getRegistros(a.id) : [];
    var avatar = fotoUrl
      ? '<img src="'+fotoUrl+'" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);">'
      : '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#C8E000,#5A8000);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#1C1C1E;">'+a.nombre.charAt(0)+'</div>';
    return '<div style="display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px 16px;margin-bottom:10px;">' +
      avatar +
      '<div style="flex:1;">' +
        '<div style="font-size:15px;font-weight:700;color:var(--text);">'+a.nombre+' '+(a.apellido||'')+'</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">🔥 '+racha+' días · '+regs.length+' sesiones</div>' +
      '</div>' +
      '<div style="text-align:center;">' +
        '<div style="font-size:22px;font-weight:900;color:var(--accent-text);">'+regs.length+'</div>' +
        '<div style="font-size:10px;color:var(--text-muted);font-weight:600;">SESIONES</div>' +
      '</div>' +
    '</div>';
  }

  window.init_reto = function(){
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var header = document.getElementById("app-header");
    header.innerHTML =
      "<div class='ah-top'>" +
        "<button id='reto-back' style='background:none;border:none;font-size:22px;cursor:pointer;padding:4px;color:var(--text);'>‹</button>" +
        "<div class='ah-wordmark'>Reto entre amigos</div>" +
        "<div></div>" +
      "</div>";
    document.getElementById("reto-back").addEventListener("click", function(){ window.irAPagina("mas"); });

    function renderReto(){
      var amigosIds = getAmigos(window.ALUMNO_ID);
      var todosAlumnos = window.db.getAlumnos ? window.db.getAlumnos() : [];
      var amigos = todosAlumnos.filter(function(a){ return amigosIds.indexOf(a.id) !== -1; });

      var miRacha = alumno ? (window.db.calcularRacha ? window.db.calcularRacha(alumno.id) : 0) : 0;
      var miRegs  = alumno ? (window.db.getRegistros ? window.db.getRegistros(alumno.id) : []) : [];
      var miFotos = alumno ? (window.db.getFotos ? window.db.getFotos(alumno.id) : []) : [];
      var miFoto  = miFotos.length ? miFotos[miFotos.length-1].url : null;
      var miAvatar = miFoto
        ? '<img src="'+miFoto+'" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:3px solid var(--accent);">'
        : '<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#C8E000,#5A8000);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#1C1C1E;">'+(alumno?alumno.nombre.charAt(0):"?")+'</div>';

      var html =
        '<div style="padding:16px 20px 100px;">' +
          // Mi card
          '<div style="background:linear-gradient(135deg,rgba(200,224,0,0.1),rgba(200,224,0,0.03));border:1.5px solid rgba(200,224,0,0.25);border-radius:20px;padding:18px;margin-bottom:20px;display:flex;align-items:center;gap:14px;">' +
            miAvatar +
            '<div style="flex:1;">' +
              '<div style="font-size:11px;font-weight:700;color:var(--accent-text);text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Tú</div>' +
              '<div style="font-size:18px;font-weight:800;color:var(--text);">'+(alumno?alumno.nombre:'—')+'</div>' +
              '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">🔥 '+miRacha+' días · '+miRegs.length+' sesiones</div>' +
            '</div>' +
          '</div>' +
          // Input para agregar amigo
          '<div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:20px;">' +
            '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px;">➕ Agregar amigo por código</div>' +
            '<div style="display:flex;gap:8px;">' +
              '<input id="reto-codigo-input" type="tel" inputmode="numeric" maxlength="4" placeholder="Código de 4 dígitos"' +
                'style="flex:1;height:44px;border-radius:12px;border:1.5px solid var(--border);background:var(--surface2);color:var(--text);font-size:16px;font-weight:700;padding:0 14px;font-family:inherit;outline:none;">' +
              '<button id="reto-agregar-btn" style="height:44px;padding:0 18px;background:#C8E000;color:#1C1C1E;border:none;border-radius:12px;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer;">Agregar</button>' +
            '</div>' +
            '<div id="reto-msg" style="font-size:12px;margin-top:8px;min-height:16px;"></div>' +
          '</div>' +
          // Lista de amigos
          '<div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Mis amigos</div>' +
          (amigos.length ? amigos.map(renderCardAmigo).join("") : '<div style="text-align:center;padding:24px 0;color:var(--text-muted);font-size:14px;">Aún no tienes amigos agregados.<br>Ingresa su código arriba.</div>') +
        '</div>';

      document.getElementById("page-reto").innerHTML = html;

      // Listener del botón agregar
      document.getElementById("reto-agregar-btn").addEventListener("click", function(){
        var codigo = (document.getElementById("reto-codigo-input").value || "").trim().replace(/\D/g,"");
        var msg = document.getElementById("reto-msg");
        if(!codigo || codigo.length < 1){ msg.style.color="#FF3B30"; msg.textContent="Escribe un código."; return; }
        var todosA = window.db.getAlumnos ? window.db.getAlumnos() : [];
        var encontrado = todosA.find(function(a){ return String(a.codigo).trim() === codigo && String(a.id) !== String(window.ALUMNO_ID); });
        if(!encontrado){ msg.style.color="#FF3B30"; msg.textContent="Código no encontrado."; return; }
        var ids = getAmigos(window.ALUMNO_ID);
        if(ids.indexOf(encontrado.id) !== -1){ msg.style.color="#FF9500"; msg.textContent="Ya está en tu lista."; return; }
        ids.push(encontrado.id);
        saveAmigos(window.ALUMNO_ID, ids);
        msg.style.color="#34C759"; msg.textContent="✓ "+encontrado.nombre+" agregado.";
        setTimeout(renderReto, 800);
      });

      // Enter en el input
      document.getElementById("reto-codigo-input").addEventListener("keydown", function(e){
        if(e.key === "Enter") document.getElementById("reto-agregar-btn").click();
      });
    }

    renderReto();
  };

  window._abrirHistorialVideos = function(){
    var alumnoId = window.db.getAlumnoActual();
    var key = "fitapp_videos_tecnica_" + alumnoId;
    var videos = [];
    try { videos = JSON.parse(localStorage.getItem(key)||"[]"); } catch(e){}

    var modal = document.createElement("div");
    modal.className = "modal-bottom";
    var itemsHtml = videos.length ? videos.slice().reverse().map(function(v){
      return '<div style="padding:14px 0;border-bottom:0.5px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
        '<div>' +
          '<div style="font-size:14px;font-weight:600;color:var(--text);">' + v.ejercicio + '</div>' +
          '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">' + v.fecha + ' · ' + (v.hora||"") + ' · ' + (v.tamano_mb||"?") + ' MB</div>' +
        '</div>' +
        '<span style="font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px;background:' + (v.revisado?"rgba(52,199,89,0.12)":"rgba(255,149,0,0.12)") + ';color:' + (v.revisado?"#34C759":"#FF9500") + ';">' + (v.revisado?"Revisado":"Pendiente") + '</span>' +
      '</div>';
    }).join("") : '<div style="text-align:center;padding:30px 0;color:var(--text-muted);font-size:13px;">Aún no has enviado videos de técnica.</div>';

    modal.innerHTML =
      '<div class="modal-bottom-sheet">' +
      '<div class="modal-handle"></div>' +
      '<div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:16px;">📹 Mis videos de técnica</div>' +
      itemsHtml +
      '<button id="modal-close-videos" style="width:100%;height:48px;background:var(--surface2);color:var(--text-muted);border:none;border-radius:50px;font-size:14px;font-family:inherit;cursor:pointer;margin-top:16px;">Cerrar</button>' +
      '</div>';
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
    var closeBtn = document.getElementById("modal-close-videos");
    if(closeBtn) closeBtn.addEventListener("click", function(){ modal.remove(); });
  };
})();

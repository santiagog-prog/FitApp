// ════════════════════════════════════════════════════════════
// mas.js — Pestaña "Más" con accesos y subtítulos
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  function svgIcon(tipo, color){
    var c = color || "#FFF";
    var iconos = {
      camera:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
      target:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
      building: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V12h6v10"/></svg>',
      users:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
      video:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
      person:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
      chat:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
      shoe:     '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round"><path d="M2 18l1.5-4.5 3-1.5 3 3 4.5-6L17 13l3 1-1 4H2z"/></svg>'
    };
    return iconos[tipo] || iconos.person;
  }

  function itemRow(icono, color, titulo, sub, onclick){
    var bg = color + "1A";
    return '<div onclick="' + onclick + '" style="display:flex;align-items:center;gap:14px;background:#141414;border-radius:16px;padding:16px;margin-bottom:10px;border:1px solid rgba(255,255,255,0.04);cursor:pointer;-webkit-tap-highlight-color:transparent;">' +
      '<div style="width:46px;height:46px;border-radius:12px;background:' + bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;">' + svgIcon(icono, color) + '</div>' +
      '<div style="flex:1;">' +
        '<div style="font-size:15px;font-weight:600;color:#FFF;margin-bottom:2px;">' + titulo + '</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.4);">' + sub + '</div>' +
      '</div>' +
      '<span style="color:rgba(255,255,255,0.2);font-size:20px;line-height:1;">›</span>' +
    '</div>';
  }

  window.init_mas = function(){
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var gymInfo = window.db.getGymInfo();

    var html = '<div style="padding:calc(env(safe-area-inset-top,0px) + 20px) 0 calc(env(safe-area-inset-bottom,0px) + 80px);">';
    html += '<div style="padding:0 20px 20px;">';
    html += '<div style="font-size:28px;font-weight:800;color:#FFF;letter-spacing:-0.5px;">Más</div>';
    html += '<div style="font-size:13px;color:rgba(255,255,255,0.35);margin-top:4px;">Herramientas y ajustes</div>';
    html += '</div>';

    html += '<div style="padding:0 20px;">';
    html += itemRow("camera",   "#0A84FF", "Fotos de progreso",      "Sube tu foto semanal y compara evolución",         "window.irAPagina('fotos')");
    html += itemRow("target",   "#FF9500", "Mis hábitos",            "Marca tus hábitos diarios y mira tus rachas",      "window.irAPagina('habitos')");
    html += itemRow("shoe",     "#C8E000", "Cardio y pasos",         "Registra tus pasos y sesiones de cardio",          "window.irAPagina('cardio')");
    html += itemRow("building", "#34C759", "Mi gimnasio",            "Horarios, contacto y promociones",                 "window.irAPagina('gym')");
    html += itemRow("users",    "#C8E000", "Reto entre amigos",      "Compara tu constancia con un amigo",               "window.irAPagina('perfil')");
    html += itemRow("video",    "#FF6B5B", "Videos de técnica",      "Historial de videos enviados a tu coach",          "window._abrirHistorialVideos()");
    html += itemRow("person",   "rgba(255,255,255,0.6)", "Mi perfil","Datos personales, foto y preferencias",            "window.irAPagina('perfil')");

    var wa = gymInfo && gymInfo.whatsapp ? gymInfo.whatsapp.replace(/[^0-9]/g,"") : "";
    if(wa){
      var msg = encodeURIComponent("Hola! Tengo una consulta sobre mi entrenamiento.");
      html += itemRow("chat", "#25D366", "Hablar con mi coach", "Contacto directo por WhatsApp", "window.open('https://wa.me/"+wa+"?text="+msg+"','_blank')");
    }

    html += '</div></div>';

    document.getElementById("page-mas").innerHTML = html;
  };

  window._abrirHistorialVideos = function(){
    var alumnoId = window.db.getAlumnoActual();
    var key = "fitapp_videos_tecnica_" + alumnoId;
    var videos = [];
    try { videos = JSON.parse(localStorage.getItem(key)||"[]"); } catch(e){}

    var modal = document.createElement("div");
    modal.className = "modal-bottom";
    var itemsHtml = videos.length ? videos.slice().reverse().map(function(v){
      return '<div style="padding:14px 0;border-bottom:0.5px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;">' +
        '<div>' +
          '<div style="font-size:14px;font-weight:600;color:#FFF;">' + v.ejercicio + '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:2px;">' + v.fecha + ' · ' + (v.hora||"") + ' · ' + (v.tamano_mb||"?") + ' MB</div>' +
        '</div>' +
        '<span style="font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px;background:' + (v.revisado?"rgba(52,199,89,0.12)":"rgba(255,149,0,0.12)") + ';color:' + (v.revisado?"#34C759":"#FF9500") + ';">' + (v.revisado?"Revisado":"Pendiente") + '</span>' +
      '</div>';
    }).join("") : '<div style="text-align:center;padding:30px 0;color:rgba(255,255,255,0.3);font-size:13px;">Aún no has enviado videos de técnica.</div>';

    modal.innerHTML =
      '<div class="modal-bottom-sheet">' +
      '<div class="modal-handle"></div>' +
      '<div style="font-size:18px;font-weight:700;color:#FFF;margin-bottom:16px;">📹 Mis videos de técnica</div>' +
      itemsHtml +
      '<button onclick="this.closest(\'.modal-bottom\').remove()" style="width:100%;height:48px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.5);border:none;border-radius:50px;font-size:14px;font-family:inherit;cursor:pointer;margin-top:16px;">Cerrar</button>' +
      '</div>';
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
    document.body.appendChild(modal);
  };
})();

// ════════════════════════════════════════════════════════════
// shared.js — utilidades comunes: modal vídeo, toast, confetti.
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  window.abrirModalVideo = function(url, titulo){
    if(!url) return;
    var embed = window.db.ytEmbed(url);
    var modal = document.createElement("div");
    modal.id = "modal-video";
    if(embed){
      modal.innerHTML =
        "<div class='mv-box'>" +
        "<div class='mv-head'><span>" + (titulo || "Vídeo técnico") + "</span><button class='mv-close'>×</button></div>" +
        "<div class='mv-frame-wrap'><iframe src='" + embed + "?autoplay=1&rel=0' allowfullscreen allow='autoplay'></iframe></div>" +
        "</div>";
    } else {
      modal.innerHTML =
        "<div class='mv-box'>" +
        "<div class='mv-head'><span>" + (titulo || "Vídeo técnico") + "</span><button class='mv-close'>×</button></div>" +
        "<div style='text-align:center;padding:40px;'><a href='" + url + "' target='_blank' rel='noopener' style='color:#E8F500;font-size:16px;'>Abrir vídeo en nueva pestaña →</a></div>" +
        "</div>";
    }
    modal.addEventListener("click", function(e){ if(e.target === modal || e.target.classList.contains("mv-close")) modal.remove(); });
    document.body.appendChild(modal);
  };

  window.mostrarToast = function(texto){
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = texto;
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 3000);
  };

  window.lanzarConfetti = function(){
    var colores = ["#E8F500","#4CAF50","#2196F3","#F44336","#FF9500"];
    for(var i=0; i<40; i++){
      var p = document.createElement("div");
      p.className = "confetti-piece";
      p.style.left = Math.random()*100 + "vw";
      p.style.background = colores[Math.floor(Math.random()*colores.length)];
      p.style.animationDuration = (1.5 + Math.random()*1.5) + "s";
      p.style.animationDelay = (Math.random()*0.4) + "s";
      document.body.appendChild(p);
      (function(piece){ setTimeout(function(){ piece.remove(); }, 3500); })(p);
    }
  };

  // ── GUARDAR SEGURO (cuota localStorage) ─────────────────
  window.guardarSeguro = function(key, valor){
    try {
      localStorage.setItem(key, JSON.stringify(valor));
      return true;
    } catch(e){
      if(e.name === "QuotaExceededError"){
        window.mostrarToast("⚠️ Espacio lleno. Elimina fotos o videos antiguos en Más → Fotos.");
      }
      return false;
    }
  };

  // ── TOASTS HUMANIZADOS ──────────────────────────────────
  window.toastConfirmacionCoach = function(accion){
    var mensajes = {
      foto_progreso:  "Jimmy verá tu evolución en tu próxima revisión 📸",
      video_tecnica:  "Tu video está listo — Jimmy lo revisará pronto 🎥",
      sesion_completa:"¡Bien hecho! Tu coach puede ver que completaste esto 💪",
      habito:         "Sigue así — la constancia es lo que más valora tu coach 🔥"
    };
    window.mostrarToast(mensajes[accion] || "✓ Guardado");
  };

  // ── ONBOARDING PRIMERA VEZ ──────────────────────────────
  window.mostrarBienvenidaPrimeraVez = function(alumno){
    var yaVisto = localStorage.getItem("fitapp_bienvenida_" + alumno.id);
    if(yaVisto) return false;
    var rutina = window.db.getRutinaPorId(alumno.rutina_id);
    var plan   = window.db.getPlanPorId ? window.db.getPlanPorId(alumno.plan_alimentacion_id) : null;
    var gymInfo = window.db.getGymInfo();
    var coachNombre = (gymInfo && gymInfo.nombre_coach) ? gymInfo.nombre_coach : "tu coach";

    var container = document.getElementById("app-alumno") || document.body;
    var overlay = document.createElement("div");
    overlay.id = "bienvenida-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:#0A0A0A;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;text-align:center;overflow-y:auto;";
    overlay.innerHTML =
      '<div style="max-width:340px;width:100%;">' +
        '<div style="font-size:13px;font-weight:700;color:#C8E000;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:20px;">Bienvenido</div>' +
        '<div style="font-size:32px;font-weight:900;color:#FFF;margin-bottom:8px;letter-spacing:-1px;">Hola, ' + alumno.nombre + ' 👋</div>' +
        '<div style="font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:32px;">' + coachNombre + ' preparó esto especialmente para ti.</div>' +
        '<div style="background:#141414;border-radius:16px;padding:18px 20px;margin-bottom:12px;text-align:left;">' +
          '<div style="font-size:11px;color:rgba(255,255,255,.35);font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Tu programa</div>' +
          '<div style="font-size:16px;font-weight:700;color:#FFF;">' + (rutina ? rutina.nombre : "Por asignar") + '</div>' +
        '</div>' +
        '<div style="background:#141414;border-radius:16px;padding:18px 20px;margin-bottom:32px;text-align:left;">' +
          '<div style="font-size:11px;color:rgba(255,255,255,.35);font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Tu plan de alimentación</div>' +
          '<div style="font-size:16px;font-weight:700;color:#FFF;">' + (plan ? plan.nombre : "Por asignar") + '</div>' +
        '</div>' +
        '<button id="btn-empezar-bienvenida" style="width:100%;height:56px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:17px;font-weight:800;font-family:inherit;cursor:pointer;letter-spacing:-0.3px;">Empezar →</button>' +
      '</div>';
    document.body.appendChild(overlay);
    document.getElementById("btn-empezar-bienvenida").addEventListener("click", function(){
      localStorage.setItem("fitapp_bienvenida_" + alumno.id, "true");
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.4s";
      setTimeout(function(){ overlay.remove(); }, 400);
    });
    return true;
  };

  window.mostrarMedallasNuevas = function(ids){
    if(!ids || !ids.length) return;
    ids.forEach(function(id, i){
      var def = window.db.MEDALLAS_DEF.filter(function(m){ return m.id === id; })[0];
      if(!def) return;
      setTimeout(function(){ window.mostrarToast("🏆 ¡Medalla desbloqueada! " + def.nombre); }, i * 1200);
    });
  };
})();

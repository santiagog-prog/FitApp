// ════════════════════════════════════════════════════════════
// alumno.js — router SPA del shell del alumno.
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";
  function safe(fn, name){ try{ fn(); }catch(e){ console.error("[alumno] " + name, e); } }

  var tabPages = ["inicio", "agenda", "nutricion", "evolucion", "mas"];
  var allPages = tabPages.concat(["perfil", "gym", "fotos", "habitos", "videos", "cardio"]);
  var initialized = {};

  window.ALUMNO_ID = null;

  function ensureSesion(){
    var id = window.db.getAlumnoActual();
    if(!id || !window.db.getAlumnoPorId(id)){
      location.href = "../index.html";
      return false;
    }
    window.ALUMNO_ID = id;
    return true;
  }

  function showPage(pageId){
    allPages.forEach(function(p){
      document.getElementById("page-" + p).style.display = "none";
      var btn = document.querySelector('[data-tab="' + p + '"]');
      if(btn) btn.classList.remove("active");
    });
    var el = document.getElementById("page-" + pageId);
    el.style.display = "block";
    el.classList.remove("page-transition-enter");
    void el.offsetWidth; // reflow
    el.classList.add("page-transition-enter");
    var activeBtn = document.querySelector('[data-tab="' + pageId + '"]');
    if(activeBtn) activeBtn.classList.add("active");

    var initFn = window["init_" + pageId];
    if(typeof initFn === "function"){
      safe(function(){ initFn(); }, "init_" + pageId);
    }
    initialized[pageId] = true;
  }

  window.irAPagina = function(pageId){ showPage(pageId); };

  var FRASES_SPLASH = [
    "Tú puedes más de lo que crees.",
    "Cada rep cuenta. Cada día importa.",
    "Tu esfuerzo de hoy es tu cuerpo de mañana.",
    "La disciplina supera al talento.",
    "No hay atajos. Solo resultados reales.",
    "El dolor de hoy es la fuerza de mañana.",
    "Eres más fuerte de lo que sientes.",
    "Hoy es el día. Siempre lo es."
  ];

  // Logo SVG inline (sin IDs de gradiente para evitar conflictos entre instancias)
  var LOGO_SVG =
    '<svg width="84" height="84" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">' +
      '<rect width="96" height="96" rx="22" fill="#0F1500"/>' +
      '<rect width="96" height="96" rx="22" fill="#162100" opacity=".8"/>' +
      '<rect x="30" y="44" width="36" height="8" rx="4" fill="#C8E000"/>' +
      '<rect x="19" y="38" width="12" height="20" rx="4" fill="#C8E000"/>' +
      '<rect x="11" y="42" width="9" height="12" rx="3" fill="#C8E000" opacity=".55"/>' +
      '<rect x="65" y="38" width="12" height="20" rx="4" fill="#C8E000"/>' +
      '<rect x="76" y="42" width="9" height="12" rx="3" fill="#C8E000" opacity=".55"/>' +
      '<rect x="43" y="44" width="2" height="8" rx="1" fill="#0F1500" opacity=".5"/>' +
      '<rect x="51" y="44" width="2" height="8" rx="1" fill="#0F1500" opacity=".5"/>' +
      '<circle cx="77" cy="19" r="6" fill="#C8E000" opacity=".25"/>' +
      '<circle cx="77" cy="19" r="3" fill="#C8E000"/>' +
    '</svg>';

  function mostrarSplashAlumno(alumno, callback){
    var frase = FRASES_SPLASH[new Date().getDay() % FRASES_SPLASH.length];
    var rutina  = window.db.getRutinaPorId(alumno.rutina_id);
    var plan    = window.db.getPlanPorId ? window.db.getPlanPorId(alumno.plan_alimentacion_id) : null;

    if(!document.getElementById("splash-keyframes")){
      var ks = document.createElement("style");
      ks.id = "splash-keyframes";
      ks.textContent =
        "@keyframes spFadeIn{from{opacity:0}to{opacity:1}}" +
        "@keyframes spUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}" +
        "@keyframes spFadeOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.96)}}";
      document.head.appendChild(ks);
    }

    var splash = document.createElement("div");
    splash.id  = "alumno-splash";
    // Flex-column SIN justify-content:center para que el footer baje al fondo
    splash.style.cssText =
      "position:fixed;inset:0;z-index:99999;background:#080808;" +
      "display:flex;flex-direction:column;align-items:center;" +
      "animation:spFadeIn .35s ease both;";

    splash.innerHTML =
      // ── Centro ──
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 32px;width:100%;">' +
        // Logo
        '<div style="opacity:0;animation:spUp .6s .1s cubic-bezier(.34,1.56,.64,1) both;margin-bottom:28px;">' + LOGO_SVG + '</div>' +
        // Saludo
        '<div style="opacity:0;animation:spUp .55s .25s ease both;">' +
          '<div style="font-size:12px;font-weight:700;color:#C8E000;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:8px;">Bienvenido</div>' +
          '<div style="font-size:40px;font-weight:900;color:#FFF;letter-spacing:-2px;line-height:1.05;margin-bottom:6px;">' + alumno.nombre + '</div>' +
          '<div style="font-size:14px;color:rgba(255,255,255,0.38);font-style:italic;max-width:260px;line-height:1.5;">"' + frase + '"</div>' +
        '</div>' +
        // Cards programa
        '<div style="opacity:0;animation:spUp .5s .4s ease both;margin-top:28px;width:100%;max-width:300px;display:flex;flex-direction:column;gap:8px;">' +
          '<div style="background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:12px 16px;display:flex;align-items:center;gap:12px;">' +
            '<span style="font-size:20px;">🏋️</span>' +
            '<div style="text-align:left;">' +
              '<div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.8px;font-weight:600;">Tu rutina</div>' +
              '<div style="font-size:14px;font-weight:700;color:#FFF;margin-top:1px;">' + (rutina ? rutina.nombre : 'Por asignar') + '</div>' +
            '</div>' +
          '</div>' +
          '<div style="background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:12px 16px;display:flex;align-items:center;gap:12px;">' +
            '<span style="font-size:20px;">🥗</span>' +
            '<div style="text-align:left;">' +
              '<div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:.8px;font-weight:600;">Plan alimentación</div>' +
              '<div style="font-size:14px;font-weight:700;color:#FFF;margin-top:1px;">' + (plan ? plan.nombre : 'Por asignar') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      // ── Footer al fondo ──
      '<div style="opacity:0;animation:spUp .4s .55s ease both;width:100%;text-align:center;padding-bottom:calc(env(safe-area-inset-bottom,0px)+32px);">' +
        '<button id="sp-btn-entrar" style="height:52px;padding:0 48px;background:#C8E000;color:#1C1C1E;border:none;border-radius:99px;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;letter-spacing:-.2px;">Empezar →</button>' +
      '</div>';

    document.body.appendChild(splash);

    function cerrar(){
      splash.style.animation = "spFadeOut .4s ease both";
      setTimeout(function(){ splash.remove(); callback(); }, 400);
    }

    // Botón manual + auto-cierre a los 5 segundos
    var btn = document.getElementById("sp-btn-entrar");
    if(btn) btn.addEventListener("click", cerrar);
    setTimeout(cerrar, 5000);
  }

  document.addEventListener("DOMContentLoaded", function(){
    if(!ensureSesion()) return;
    document.querySelectorAll("[data-tab]").forEach(function(btn){
      btn.addEventListener("click", function(){ showPage(this.getAttribute("data-tab")); });
    });

    // Pantalla de carga mientras se obtienen los datos de Supabase
    var loadEl = document.createElement("div");
    loadEl.id = "db-loading-screen";
    loadEl.style.cssText = "position:fixed;inset:0;z-index:99999;background:#0A0A0A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;";
    loadEl.innerHTML =
      '<svg width="56" height="56" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="96" height="96" rx="22" fill="#0F1500"/>' +
        '<rect x="30" y="44" width="36" height="8" rx="4" fill="#C8E000"/>' +
        '<rect x="19" y="38" width="12" height="20" rx="4" fill="#C8E000"/>' +
        '<rect x="11" y="42" width="9" height="12" rx="3" fill="#C8E000" opacity=".55"/>' +
        '<rect x="65" y="38" width="12" height="20" rx="4" fill="#C8E000"/>' +
        '<rect x="76" y="42" width="9" height="12" rx="3" fill="#C8E000" opacity=".55"/>' +
      '</svg>' +
      '<div style="color:#C8E000;font-weight:800;font-size:15px;letter-spacing:.5px;">Cargando tu perfil...</div>' +
      '<div style="width:120px;height:3px;background:#1a1a1a;border-radius:99px;overflow:hidden;">' +
        '<div id="db-load-bar" style="height:100%;width:0;background:#C8E000;border-radius:99px;transition:width 2s ease;"></div>' +
      '</div>';
    document.body.appendChild(loadEl);
    setTimeout(function(){ var b = document.getElementById("db-load-bar"); if(b) b.style.width = "80%"; }, 50);

    window.db.init(window.ALUMNO_ID)
      .then(function(){
        loadEl.remove();
        showPage("inicio");
      })
      .catch(function(err){
        console.error("[alumno] db.init error:", err);
        loadEl.innerHTML =
          '<div style="text-align:center;color:#ff6b6b;padding:32px;">' +
            '<div style="font-size:36px;margin-bottom:12px;">⚠️</div>' +
            '<div style="font-weight:700;font-size:16px;margin-bottom:8px;">Sin conexión</div>' +
            '<div style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:24px;">Verifica tu conexión a internet.<br>Reintentando en 3 segundos...</div>' +
          '</div>';
        setTimeout(function(){ location.reload(); }, 3000);
      });
  });
})();

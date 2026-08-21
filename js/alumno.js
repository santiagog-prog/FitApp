// ════════════════════════════════════════════════════════════
// alumno.js — router SPA del shell del alumno.
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";
  function safe(fn, name){ try{ fn(); }catch(e){ console.error("[alumno] " + name, e); } }

  var tabPages = ["inicio", "agenda", "nutricion", "evolucion", "mas"];
  var allPages = tabPages.concat(["perfil", "gym", "fotos", "habitos", "videos", "cardio", "editar", "reto"]);
  var initialized = {};

  window.ALUMNO_ID = null;

  function ensureSesion(){
    // Solo valida que exista un id de sesión guardado (localStorage).
    // NO se puede validar contra getAlumnoPorId aquí todavía porque el
    // caché de db.js está vacío hasta que termine db.init() — esa
    // validación real ocurre en el .then() de db.init() más abajo.
    var id = window.db.getAlumnoActual();
    if(!id){
      location.href = "../index.html";
      return false;
    }
    window.ALUMNO_ID = id;
    return true;
  }

  function showPage(pageId, noTransition){
    allPages.forEach(function(p){
      document.getElementById("page-" + p).style.display = "none";
      var btn = document.querySelector('[data-tab="' + p + '"]');
      if(btn) btn.classList.remove("active");
    });
    var el = document.getElementById("page-" + pageId);
    el.style.display = "block";
    if(!noTransition){
      el.classList.remove("page-transition-enter");
      void el.offsetWidth; // reflow
      el.classList.add("page-transition-enter");
    }
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
    if(!document.getElementById("splash-keyframes")){
      var ks = document.createElement("style");
      ks.id = "splash-keyframes";
      ks.textContent =
        "@keyframes spFadeIn{from{opacity:0}to{opacity:1}}" +
        "@keyframes spLogoIn{from{opacity:0;transform:scale(.78)}to{opacity:1;transform:scale(1)}}" +
        "@keyframes spSlideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}" +
        "@keyframes spFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}" +
        "@keyframes spFadeOut{from{opacity:1}to{opacity:0}}";
      document.head.appendChild(ks);
    }

    var splash = document.createElement("div");
    splash.id = "alumno-splash";
    splash.style.cssText =
      "position:fixed;inset:0;z-index:99999;background:#080808;" +
      "display:flex;flex-direction:column;align-items:center;" +
      "animation:spFadeIn .4s ease both;overflow:hidden;font-family:Inter,sans-serif;";

    splash.innerHTML =
      // ── Logo en el centro ──
      '<div style="flex:1;display:flex;align-items:center;justify-content:center;">' +
        '<div style="opacity:0;animation:spLogoIn .8s .15s cubic-bezier(.34,1.5,.64,1) both;">' +
          LOGO_SVG +
        '</div>' +
      '</div>' +
      // ── Nombre + frase centrados abajo ──
      '<div style="width:100%;padding:0 32px calc(env(safe-area-inset-bottom,0px)+72px);text-align:center;">' +
        '<div style="opacity:0;animation:spSlideUp .6s .3s cubic-bezier(.16,1,.3,1) both;">' +
          '<div style="font-size:52px;font-weight:900;color:#FFFFFF;letter-spacing:-3px;line-height:1;margin-bottom:6px;">FitApp</div>' +
          '<div style="width:32px;height:3px;border-radius:99px;background:#C8E000;margin:0 auto 16px;"></div>' +
        '</div>' +
        '<div style="opacity:0;animation:spFadeUp .5s .55s ease both;">' +
          '<div style="font-size:15px;font-style:italic;color:rgba(255,255,255,0.4);line-height:1.6;">' +
            '&ldquo;Esto cambiará tu vida&rdquo;' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(splash);

    function cerrar(){
      splash.style.animation = "spFadeOut .4s ease both";
      setTimeout(function(){ splash.remove(); callback(); }, 400);
    }

    splash.addEventListener("click", cerrar);
    setTimeout(cerrar, 4000);
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
    var LOGO_SMALL =
      '<svg width="56" height="56" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="96" height="96" rx="22" fill="#0F1500"/>' +
        '<rect x="30" y="44" width="36" height="8" rx="4" fill="#C8E000"/>' +
        '<rect x="19" y="38" width="12" height="20" rx="4" fill="#C8E000"/>' +
        '<rect x="11" y="42" width="9" height="12" rx="3" fill="#C8E000" opacity=".55"/>' +
        '<rect x="65" y="38" width="12" height="20" rx="4" fill="#C8E000"/>' +
        '<rect x="76" y="42" width="9" height="12" rx="3" fill="#C8E000" opacity=".55"/>' +
      '</svg>';
    function renderCargando(msg){
      loadEl.innerHTML =
        LOGO_SMALL +
        '<div id="db-load-msg" style="color:#C8E000;font-weight:800;font-size:15px;letter-spacing:.5px;text-align:center;">' + (msg||"Cargando tu perfil...") + '</div>' +
        '<div style="width:120px;height:3px;background:#1a1a1a;border-radius:99px;overflow:hidden;">' +
          '<div id="db-load-bar" style="height:100%;width:0;background:#C8E000;border-radius:99px;transition:width 18s linear;"></div>' +
        '</div>' +
        '<div id="db-load-sub" style="color:rgba(255,255,255,0.3);font-size:12px;text-align:center;max-width:220px;line-height:1.5;"></div>';
    }
    renderCargando("Cargando tu perfil...");
    document.body.appendChild(loadEl);
    setTimeout(function(){ var b=document.getElementById("db-load-bar"); if(b) b.style.width="90%"; }, 80);
    // Si tarda más de 5s mostramos mensaje tranquilizador
    var _slowTimer = setTimeout(function(){
      var msg=document.getElementById("db-load-msg");
      var sub=document.getElementById("db-load-sub");
      if(msg) msg.textContent="Conectando con el servidor...";
      if(sub) sub.textContent="Esto puede tardar unos segundos la primera vez del día.";
    }, 5000);

    var _dbInitRetries = 0;
    function intentarInit(){
      window.db.init(window.ALUMNO_ID)
        .then(function(){
          // API respondió — validar que el alumno exista de verdad
          if(!window.db.getAlumnoPorId(window.ALUMNO_ID)){
            // El alumno no existe en la base de datos (código incorrecto o borrado)
            window.db.clearSesion();
            location.href = "../index.html";
            return;
          }
          clearTimeout(_slowTimer);
          loadEl.remove();
          // Migrar gym si sigue siendo el placeholder viejo
          if(window.db.migrateGymIfNeeded) window.db.migrateGymIfNeeded();
          var alumnoSplash = window.db.getAlumnoPorId(window.ALUMNO_ID);
          // Auto-skip onboarding for demo user (code 1111)
          if(alumnoSplash && alumnoSplash.codigo === "1111"){
            localStorage.setItem("fitapp_onboarding_done_" + alumnoSplash.id, "1");
          }
          if(alumnoSplash){
            mostrarSplashAlumno(alumnoSplash, function(){
              // Mostrar onboarding si es la primera vez, si no ir a inicio
              if(window.checkOnboarding && window.checkOnboarding()) return;
              showPage("inicio", true); // sin transición: los tiles tienen su propia animación
            });
          } else {
            if(window.checkOnboarding && window.checkOnboarding()) return;
            showPage("inicio");
          }
        })
        .catch(function(err){
          console.error("[alumno] db.init error:", err);
          clearTimeout(_slowTimer);
          _dbInitRetries++;
          var mensaje = _dbInitRetries >= 2
            ? "El servidor está temporalmente caído.<br>Inténtalo más tarde."
            : "Sin conexión al servidor.<br>Reintentando...";
          loadEl.innerHTML =
            '<div style="text-align:center;padding:32px;max-width:280px;">' +
              '<div style="font-size:40px;margin-bottom:14px;">📡</div>' +
              '<div style="font-weight:800;font-size:16px;color:#fff;margin-bottom:8px;">No se pudo conectar</div>' +
              '<div style="color:rgba(255,255,255,0.45);font-size:13px;line-height:1.5;margin-bottom:20px;">' + mensaje + '</div>' +
              '<button id="btn-reintentar" style="background:#C8E000;color:#0A0A0A;font-weight:800;font-size:14px;padding:12px 28px;border:none;border-radius:99px;cursor:pointer;margin-bottom:10px;display:block;width:100%;">Reintentar</button>' +
              '<button id="btn-cerrar-sesion" style="background:transparent;color:rgba(255,255,255,0.3);font-size:12px;padding:8px;border:none;cursor:pointer;display:block;width:100%;">Cerrar sesión</button>' +
            '</div>';
          // Reintentar manual
          document.getElementById("btn-reintentar").addEventListener("click", function(){
            loadEl.innerHTML = '<div style="color:#C8E000;font-weight:800;font-size:15px;">Conectando...</div>';
            setTimeout(intentarInit, 300);
          });
          // Cerrar sesión y volver al login
          document.getElementById("btn-cerrar-sesion").addEventListener("click", function(){
            window.db.clearSesion(); location.href = "../index.html";
          });
          // Auto-reintentar UNA sola vez después de 8s (no loop infinito)
          if(_dbInitRetries < 2){
            setTimeout(intentarInit, 8000);
          }
        });
    }
    intentarInit();
  });
})();

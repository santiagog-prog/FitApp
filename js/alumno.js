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

  function mostrarSplashAlumno(alumno, callback){
    var frase = FRASES_SPLASH[new Date().getDay() % FRASES_SPLASH.length];
    var splash = document.createElement("div");
    splash.id = "alumno-splash";
    splash.style.cssText = [
      "position:fixed;inset:0;z-index:99999;",
      "background:#080808;",
      "display:flex;flex-direction:column;align-items:center;justify-content:center;",
      "padding:40px 32px;text-align:center;",
      "animation:splashFadeIn .4s ease both;"
    ].join("");
    splash.innerHTML =
      '<div style="opacity:0;animation:splashUp .5s .15s ease both;">' +
          '<svg width="88" height="88" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" style="margin:0 auto 28px;display:block;">' +
          '<defs><linearGradient id="slg" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1a2d00"/><stop offset="100%" stop-color="#0a0a0a"/></linearGradient></defs>' +
          '<rect width="96" height="96" rx="22" fill="url(#slg)"/>' +
          '<rect x="28" y="44" width="40" height="8" rx="4" fill="#C8E000"/>' +
          '<rect x="20" y="39" width="10" height="18" rx="3" fill="#C8E000"/>' +
          '<rect x="66" y="39" width="10" height="18" rx="3" fill="#C8E000"/>' +
          '<rect x="14" y="43" width="7" height="10" rx="2.5" fill="rgba(200,224,0,0.55)"/>' +
          '<rect x="75" y="43" width="7" height="10" rx="2.5" fill="rgba(200,224,0,0.55)"/>' +
          '<circle cx="76" cy="20" r="5" fill="#C8E000" opacity=".3"/>' +
          '<circle cx="76" cy="20" r="2.5" fill="#C8E000"/>' +
        '</svg>' +
        '<div style="font-size:13px;font-weight:700;color:#C8E000;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Bienvenido de vuelta</div>' +
        '<div style="font-size:36px;font-weight:900;color:#FFF;letter-spacing:-1.5px;line-height:1.1;margin-bottom:20px;">' + alumno.nombre + '</div>' +
        '<div style="font-size:16px;color:rgba(255,255,255,0.45);line-height:1.6;max-width:260px;font-style:italic;">"' + frase + '"</div>' +
      '</div>';

    // Inject keyframes once
    if(!document.getElementById("splash-keyframes")){
      var style = document.createElement("style");
      style.id = "splash-keyframes";
      style.textContent = [
        "@keyframes splashFadeIn{from{opacity:0}to{opacity:1}}",
        "@keyframes splashUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}",
        "@keyframes splashFadeOut{from{opacity:1}to{opacity:0}}"
      ].join("");
      document.head.appendChild(style);
    }

    document.body.appendChild(splash);
    setTimeout(function(){
      splash.style.animation = "splashFadeOut .5s ease both";
      setTimeout(function(){ splash.remove(); callback(); }, 500);
    }, 4500);
  }

  document.addEventListener("DOMContentLoaded", function(){
    if(!ensureSesion()) return;
    document.querySelectorAll("[data-tab]").forEach(function(btn){
      btn.addEventListener("click", function(){ showPage(this.getAttribute("data-tab")); });
    });
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var splashVisto = localStorage.getItem("fitapp_splash_" + window.ALUMNO_ID + "_" + new Date().toDateString());
    if(alumno && !splashVisto){
      localStorage.setItem("fitapp_splash_" + window.ALUMNO_ID + "_" + new Date().toDateString(), "1");
      mostrarSplashAlumno(alumno, function(){ showPage("inicio"); });
    } else {
      showPage("inicio");
    }
  });
})();

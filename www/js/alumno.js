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
        '<div style="width:72px;height:72px;border-radius:20px;background:rgba(200,224,0,0.12);border:1px solid rgba(200,224,0,0.25);display:flex;align-items:center;justify-content:center;margin:0 auto 28px;">' +
          '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C8E000" stroke-width="2" stroke-linecap="round"><path d="M6 4v16M18 4v16M6 12h12M2 7h4M18 7h4M2 17h4M18 17h4"/></svg>' +
        '</div>' +
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

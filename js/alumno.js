// ════════════════════════════════════════════════════════════
// alumno.js — router SPA del shell del alumno.
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";
  function safe(fn, name){ try{ fn(); }catch(e){ console.error("[alumno] " + name, e); } }

  var tabPages = ["inicio", "agenda", "videos", "evolucion", "nutricion"];
  var allPages = tabPages.concat(["perfil", "gym", "fotos", "habitos"]);
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
    document.getElementById("page-" + pageId).style.display = "block";
    var activeBtn = document.querySelector('[data-tab="' + pageId + '"]');
    if(activeBtn) activeBtn.classList.add("active");

    var initFn = window["init_" + pageId];
    if(typeof initFn === "function"){
      safe(function(){ initFn(); }, "init_" + pageId);
    }
    initialized[pageId] = true;
  }

  window.irAPagina = function(pageId){ showPage(pageId); };

  document.addEventListener("DOMContentLoaded", function(){
    if(!ensureSesion()) return;
    document.querySelectorAll("[data-tab]").forEach(function(btn){
      btn.addEventListener("click", function(){ showPage(this.getAttribute("data-tab")); });
    });
    showPage("inicio");
  });
})();

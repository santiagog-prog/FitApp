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

  window.mostrarMedallasNuevas = function(ids){
    if(!ids || !ids.length) return;
    ids.forEach(function(id, i){
      var def = window.db.MEDALLAS_DEF.filter(function(m){ return m.id === id; })[0];
      if(!def) return;
      setTimeout(function(){ window.mostrarToast("🏆 ¡Medalla desbloqueada! " + def.nombre); }, i * 1200);
    });
  };
})();

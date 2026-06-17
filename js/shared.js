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

  // ── ICONOS SVG (sin emojis, stroke-width 1.5, sin relleno) ──
  var ICONS_SVG = {
    home: "<path d='M3 11l9-8 9 8'/><path d='M5 10v10h14V10'/>",
    calendar: "<rect x='3' y='5' width='18' height='16' rx='2'/><path d='M16 3v4M8 3v4M3 11h18'/>",
    play: "<circle cx='12' cy='12' r='9'/><path d='M10 9l5 3-5 3z'/>",
    chart: "<path d='M4 19V9M10 19V5M16 19v-7M22 19V3' /><path d='M2 19h20'/>",
    fork: "<path d='M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 3v6a2 2 0 1 1-4 0V3M16 13v8'/>",
    bell: "<path d='M12 3a5 5 0 0 0-5 5v3.5L5 16h14l-2-4.5V8a5 5 0 0 0-5-5z'/><path d='M9.5 19a2.5 2.5 0 0 0 5 0'/>",
    chat: "<path d='M21 11.5a8.38 8.38 0 0 1-1.9 5.4L21 21l-4.3-1.1a8.5 8.5 0 1 1 4.3-8.4z'/>",
    chevronDown: "<path d='M6 9l6 6 6-6'/>",
    barbell: "<path d='M4 8v8M20 8v8M2 10v4M22 10v4M7 12h10'/>",
    camera: "<path d='M4 8h3l2-3h6l2 3h3v11H4z'/><circle cx='12' cy='13.5' r='3.5'/>"
  };
  function svg(name, extra){
    return "<svg viewBox='0 0 24 24'" + (extra||"") + ">" + ICONS_SVG[name] + "</svg>";
  }
  window.iconoSVG = svg;

  window.renderHeaderPrincipal = function(titulo, iconosDerecha){
    var header = document.getElementById("app-header");
    header.classList.remove("detalle");
    header.innerHTML = "<div class='ah-top'><div></div><div class='ah-icons'>" + (iconosDerecha||"") + "</div></div><div class='ah-title'>" + titulo + "</div>";
  };

  window.renderHeaderDetalle = function(titulo, onBack){
    var header = document.getElementById("app-header");
    header.classList.add("detalle");
    header.innerHTML = "<div class='ah-back' id='ah-back-btn'><span class='back-arrow'>←</span><span>" + titulo + "</span></div>";
    document.getElementById("ah-back-btn").addEventListener("click", onBack);
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

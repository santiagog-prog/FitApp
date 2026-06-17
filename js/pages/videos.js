// ════════════════════════════════════════════════════════════
// videos.js — 3 secciones con scroll horizontal
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  function ytThumb(url){
    var m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return m ? "https://img.youtube.com/vi/" + m[1] + "/mqdefault.jpg" : null;
  }

  function renderVideoCard(v){
    var thumb = v.url ? ytThumb(v.url) : null;
    var safeTit = (v.titulo||v.nombre||"").replace(/'/g,"");
    return '<div class="video-card" onclick="window.abrirVideoPlayer(\'' + (v.url||"") + '\',\'' + safeTit + '\')">' +
      '<div class="video-thumb">' +
        (thumb ? '<img src="' + thumb + '" loading="lazy">' : "") +
        '<div class="video-play-btn">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
        '</div>' +
      '</div>' +
      '<div class="video-info">' +
        '<div class="video-titulo">' + (v.titulo||v.nombre||"Video") + '</div>' +
        '<div class="video-sub">' + (v.subtitulo||v.grupo||"") + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderSeccion(titulo, subtitulo, videos, emptyMsg){
    return '<div class="videos-section">' +
      '<div class="videos-section-header">' +
        '<div class="videos-section-title">' + titulo + '</div>' +
        '<div class="videos-section-sub">' + subtitulo + '</div>' +
      '</div>' +
      (videos.length > 0
        ? '<div class="videos-scroll">' + videos.map(renderVideoCard).join("") + '</div>'
        : '<p style="padding:0 20px;font-size:13px;color:rgba(255,255,255,0.3);">' + emptyMsg + '</p>'
      ) +
    '</div>';
  }

  window.abrirVideoPlayer = function(url, titulo){
    if(!url){ window.mostrarToast("Este video aún no tiene enlace"); return; }
    var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    var embedUrl= ytMatch ? "https://www.youtube.com/embed/" + ytMatch[1] + "?autoplay=1&rel=0" : null;

    var modal = document.createElement("div");
    modal.id  = "modal-video";
    modal.innerHTML =
      '<div class="mv-box">' +
        '<div class="mv-head">' +
          '<span>' + titulo + '</span>' +
          '<button class="mv-close">×</button>' +
        '</div>' +
        (embedUrl
          ? '<div class="mv-frame-wrap"><iframe src="' + embedUrl + '" allowfullscreen allow="autoplay"></iframe></div>'
          : '<div style="text-align:center;padding:40px;"><a href="' + url + '" target="_blank" style="color:#C8E000;font-size:15px;">Abrir video →</a></div>'
        ) +
      '</div>';

    modal.addEventListener("click", function(e){
      if(e.target===modal || e.target.classList.contains("mv-close")) modal.remove();
    });
    document.body.appendChild(modal);
  };

  // compatibilidad con shared.js
  window.abrirModalVideo = window.abrirVideoPlayer;

  window.init_videos = function(){
    var header = document.getElementById("app-header");
    header.innerHTML =
      "<div class='ah-top'><div></div><div class='ah-icons'></div></div>" +
      "<div class='ah-subtitle'>Contenido</div>" +
      "<div class='ah-title'>Videos</div>";

    var alumno   = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var rutina   = alumno ? window.db.getRutinaPorId(alumno.rutina_id) : null;
    var gymInfo  = window.db.getGymInfo() || {};

    // Sección 1: Técnica
    var videosEj = [];
    if(rutina){
      rutina.dias.forEach(function(dia){
        if(dia.ejercicios) dia.ejercicios.forEach(function(ej){
          if(ej.video_url){
            videosEj.push({ titulo:ej.nombre, subtitulo:ej.grupo||"", url:ej.video_url });
          }
        });
      });
    }

    // Sección 2: Educativos
    var videosEdu = gymInfo.videos_educativos || [];

    // Sección 3: Recetas (demo si no hay)
    var videosRec = gymInfo.videos_recetas || [
      { titulo:"Pizza fit de coliflor",   subtitulo:"280 kcal · 25 min", url:"" },
      { titulo:"Hamburguesa proteica",     subtitulo:"420 kcal · 15 min", url:"" },
      { titulo:"Brownie de proteína",      subtitulo:"180 kcal · 20 min", url:"" },
      { titulo:"Snack de avena y banana",  subtitulo:"150 kcal · 5 min",  url:"" }
    ];

    var html = "<div style='padding-top:8px;padding-bottom:20px;'>";
    html += renderSeccion("Técnica de ejercicios",  "Cómo hacer bien cada movimiento",   videosEj,  "Tu coach aún no ha añadido videos. Pídele que los agregue.");
    html += renderSeccion("Aprende",                "Nutrición, progreso y hábitos",      videosEdu, "Próximamente videos educativos de tu coach.");
    html += renderSeccion("Recetas fit",            "Hamburguesas, pizzas y snacks sanos",videosRec, "Próximamente recetas.");
    html += "</div>";

    document.getElementById("page-videos").innerHTML = html;
  };
})();

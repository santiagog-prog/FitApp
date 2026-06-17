// ════════════════════════════════════════════════════════════
// videos.js — Page Videos: biblioteca de vídeos técnicos del alumno
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  window.init_videos = function(){
    window.renderHeaderPrincipal("Videos", window.iconoSVG("play"));

    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var rutina = window.db.getRutinaPorId(alumno.rutina_id);
    var videos = [];
    if(rutina){
      rutina.dias.forEach(function(dia){
        dia.ejercicios.forEach(function(ej){
          if(ej.video_url) videos.push({ nombre: ej.nombre, grupo: ej.grupo, url: ej.video_url, dia: dia.nombre });
        });
      });
    }

    var html = "<div class='px'>";
    if(videos.length === 0){
      html += "<div class='estado-vacio'><div class='ev-icon'>" + window.iconoSVG("play") + "</div><h3>Sin vídeos todavía</h3><p>Tu entrenador aún no agregó vídeos técnicos.</p></div>";
    } else {
      html += "<p style='color:var(--text-muted);font-size:.85rem;margin-bottom:14px;'>Vídeos de técnica de tus ejercicios asignados</p>";
      videos.forEach(function(v, i){
        html += "<div class='actividad-row' data-idx='" + i + "'>" +
          "<div class='act-icon ok' style='background:#1C1C1E;'>" + window.iconoSVG("play").replace("<svg ", "<svg style='stroke:#fff' ") + "</div>" +
          "<div class='act-body'><div class='act-nombre'>" + v.nombre + "</div>" +
          "<div class='act-estado'>" + v.grupo + " · " + v.dia + "</div></div>" +
          "<span class='act-arrow'>→</span></div>";
      });
    }
    html += "</div>";
    document.getElementById("page-videos").innerHTML = html;

    document.querySelectorAll("#page-videos .actividad-row").forEach(function(row){
      row.addEventListener("click", function(){
        var v = videos[parseInt(this.getAttribute("data-idx"), 10)];
        window.abrirModalVideo(v.url, v.nombre);
      });
    });
  };
})();

// ════════════════════════════════════════════════════════════
// fotos.js — Page Fotos de progreso: una foto semanal, galería y comparación
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  function comprimirImagen(file, maxAncho, callback){
    var reader = new FileReader();
    reader.onload = function(e){
      var img = new Image();
      img.onload = function(){
        var ratio = Math.min(1, maxAncho / img.width);
        var canvas = document.createElement("canvas");
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function numeroSemanaISO(d){
    var date = new Date(d.getTime());
    date.setHours(0,0,0,0);
    date.setDate(date.getDate() + 3 - (date.getDay()+6)%7);
    var firstThursday = new Date(date.getFullYear(),0,4);
    return 1 + Math.round(((date - firstThursday) / 86400000 - 3 + (firstThursday.getDay()+6)%7)/7);
  }

  var compareSel = [];

  window.init_fotos = function(){
    var header = document.getElementById("app-header");
    header.innerHTML =
      "<div class='ah-top'><div></div><div class='ah-icons'></div></div>" +
      "<div class='ah-subtitle'>Tu transformación</div>" +
      "<div class='ah-title'>Fotos</div>";

    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var fotos = window.db.getFotos(alumno.id).slice().sort(function(a,b){ return a.fecha < b.fecha ? 1 : -1; });
    var semanaActual = numeroSemanaISO(new Date()) + "-" + new Date().getFullYear();
    var yaSubioEstaSemana = fotos.some(function(f){ return f.semana === semanaActual; });
    compareSel = [];

    var html = "<div class='px'>";
    if(!yaSubioEstaSemana){
      html += "<div class='foto-upload-card'>" +
        "<p>📸 Toca para tomar tu foto de progreso de esta semana</p>" +
        "<input type='file' accept='image/*' capture='environment' id='foto-input' style='display:none;'>" +
        "<button class='pill-btn' id='foto-trigger'>Tomar / subir foto</button></div>";
    } else {
      html += "<div class='foto-upload-card done'><p>✅ Ya registraste tu foto de esta semana. ¡Vuelve la próxima!</p></div>";
    }

    html += "<h3 style='margin:18px 0 10px;'>Tu galería (" + fotos.length + ")</h3>";
    if(fotos.length === 0){
      html += "<p style='color:var(--text-muted);font-size:.85rem;'>Aún no tienes fotos. Empieza esta semana.</p>";
    } else {
      html += "<p style='font-size:.78rem;color:var(--text-muted);margin-bottom:8px;'>Toca dos fotos para compararlas lado a lado.</p>";
      html += "<div class='fotos-grid'>";
      fotos.forEach(function(f){
        html += "<div class='foto-item' data-id='" + f.id + "'><img src='" + f.dataUrl + "'><span class='foto-fecha'>" + f.fecha + "</span></div>";
      });
      html += "</div>";
    }
    html += "<div id='foto-compare'></div>";
    html += "</div>";

    document.getElementById("page-fotos").innerHTML = html;
    document.getElementById("fotos-back").addEventListener("click", function(){ window.irAPagina("evolucion"); });

    var trigger = document.getElementById("foto-trigger");
    if(trigger){
      trigger.addEventListener("click", function(){ document.getElementById("foto-input").click(); });
      document.getElementById("foto-input").addEventListener("change", function(e){
        var file = e.target.files[0];
        if(!file) return;
        comprimirImagen(file, 480, function(dataUrl){
          window.db.saveFoto(alumno.id, { id: window.db.generarId("foto"), fecha: window.db.fechaHoy(), semana: semanaActual, dataUrl: dataUrl });
          window.mostrarToast("Foto de progreso guardada");
          window.init_fotos();
        });
      });
    }

    document.querySelectorAll(".foto-item").forEach(function(el){
      el.addEventListener("click", function(){
        var id = this.getAttribute("data-id");
        var idx = compareSel.indexOf(id);
        if(idx !== -1){ compareSel.splice(idx,1); this.classList.remove("sel"); }
        else {
          if(compareSel.length >= 2){
            var first = compareSel.shift();
            document.querySelector(".foto-item[data-id='"+first+"']").classList.remove("sel");
          }
          compareSel.push(id);
          this.classList.add("sel");
        }
        renderCompare(fotos);
      });
    });

    function renderCompare(fotos){
      var box = document.getElementById("foto-compare");
      if(compareSel.length !== 2){ box.innerHTML = ""; return; }
      var f1 = fotos.filter(function(f){ return f.id === compareSel[0]; })[0];
      var f2 = fotos.filter(function(f){ return f.id === compareSel[1]; })[0];
      var ordenados = new Date(f1.fecha) < new Date(f2.fecha) ? [f1,f2] : [f2,f1];
      box.innerHTML = "<h3 style='margin:18px 0 10px;'>Comparación</h3><div class='foto-compare-row'>" +
        "<div><img src='" + ordenados[0].dataUrl + "'><span>" + ordenados[0].fecha + "</span></div>" +
        "<div><img src='" + ordenados[1].dataUrl + "'><span>" + ordenados[1].fecha + "</span></div></div>";
    }
  };
})();

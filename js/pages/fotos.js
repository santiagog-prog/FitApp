// ════════════════════════════════════════════════════════════
// fotos.js — Fotos de progreso: upload a Supabase Storage
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

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
    // Las fotos tienen .url (Supabase Storage signed URL)
    var fotos = window.db.getFotos(alumno.id).slice().sort(function(a,b){ return a.fecha < b.fecha ? 1 : -1; });
    var semanaActual = numeroSemanaISO(new Date()) + "-" + new Date().getFullYear();
    var yaSubioEstaSemana = fotos.some(function(f){ return f.semana === semanaActual; });
    compareSel = [];

    var html = "<div class='px'>";
    if(!yaSubioEstaSemana){
      html +=
        "<div class='foto-upload-card'>" +
          "<p>📸 Toca para tomar tu foto de progreso de esta semana</p>" +
          "<input type='file' accept='image/*' capture='environment' id='foto-input' style='display:none;'>" +
          "<button class='pill-btn' id='foto-trigger'>Tomar / subir foto</button>" +
        "</div>";
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
        var src = f.url || f.dataUrl || "";
        html += "<div class='foto-item' data-id='" + f.id + "'>" +
          "<img src='" + src + "' loading='lazy'>" +
          "<span class='foto-fecha'>" + f.fecha + "</span>" +
          "<button class='foto-del-btn' data-fid='" + f.id + "' title='Eliminar'>✕</button>" +
        "</div>";
      });
      html += "</div>";
    }
    html += "<div id='foto-compare'></div></div>";

    var page = document.getElementById("page-fotos");
    page.innerHTML = html;

    // Botón subir
    var trigger = document.getElementById("foto-trigger");
    if(trigger){
      trigger.addEventListener("click", function(){ document.getElementById("foto-input").click(); });
      document.getElementById("foto-input").addEventListener("change", function(e){
        var file = e.target.files[0];
        if(!file) return;
        trigger.textContent = "Subiendo...";
        trigger.disabled = true;
        window.db.uploadFoto(alumno.id, file, {
          fecha: window.db.fechaHoy(),
          semana: semanaActual,
          tipo: "progreso"
        }).then(function(){
          window.mostrarToast && window.mostrarToast("📸 Foto guardada");
          window.init_fotos();
        }).catch(function(err){
          console.error("[fotos] upload error:", err);
          window.mostrarToast && window.mostrarToast("Error al subir la foto");
          trigger.textContent = "Tomar / subir foto";
          trigger.disabled = false;
        });
      });
    }

    // Comparación
    page.querySelectorAll(".foto-item").forEach(function(el){
      el.addEventListener("click", function(e){
        if(e.target.classList.contains("foto-del-btn")) return;
        var id = this.getAttribute("data-id");
        var idx = compareSel.indexOf(id);
        if(idx !== -1){ compareSel.splice(idx,1); this.classList.remove("sel"); }
        else {
          if(compareSel.length >= 2){
            var first = compareSel.shift();
            var prev = page.querySelector(".foto-item[data-id='"+first+"']");
            if(prev) prev.classList.remove("sel");
          }
          compareSel.push(id);
          this.classList.add("sel");
        }
        renderCompare(fotos);
      });
    });

    // Botones eliminar
    page.querySelectorAll(".foto-del-btn").forEach(function(btn){
      btn.addEventListener("click", function(e){
        e.stopPropagation();
        var fid = this.getAttribute("data-fid");
        if(!confirm("¿Eliminar esta foto?")) return;
        window.db.deleteFoto(alumno.id, fid);
        window.init_fotos();
      });
    });

    function renderCompare(fotosArr){
      var box = document.getElementById("foto-compare");
      if(!box || compareSel.length !== 2){ if(box) box.innerHTML = ""; return; }
      var f1 = fotosArr.find(function(f){ return f.id === compareSel[0]; });
      var f2 = fotosArr.find(function(f){ return f.id === compareSel[1]; });
      if(!f1 || !f2) return;
      var ordenados = new Date(f1.fecha) <= new Date(f2.fecha) ? [f1,f2] : [f2,f1];
      box.innerHTML =
        "<h3 style='margin:18px 0 10px;'>Comparación</h3>" +
        "<div class='foto-compare-row'>" +
          "<div><img src='" + (ordenados[0].url||ordenados[0].dataUrl||"") + "'><span>" + ordenados[0].fecha + "</span></div>" +
          "<div><img src='" + (ordenados[1].url||ordenados[1].dataUrl||"") + "'><span>" + ordenados[1].fecha + "</span></div>" +
        "</div>";
    }
  };
})();

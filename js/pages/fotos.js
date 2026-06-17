// ════════════════════════════════════════════════════════════
// fotos.js — Page Fotos de progreso: una foto semanal, galería, comparación y privacidad
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  var LIMITE_BYTES = 4 * 1024 * 1024; // 4MB de aviso, según el límite técnico pedido

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

  function pesoTotalFotos(fotos){
    return fotos.reduce(function(s,f){ return s + (f.dataUrl ? f.dataUrl.length : 0); }, 0);
  }

  var compareSel = [];

  window.init_fotos = function(){
    window.renderHeaderDetalle("Fotos de progreso", function(){ window.irAPagina("evolucion"); });

    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var fotos = window.db.getFotos(alumno.id).slice().sort(function(a,b){ return a.fecha < b.fecha ? 1 : -1; });
    var semanaActual = numeroSemanaISO(new Date()) + "-" + new Date().getFullYear();
    var yaSubioEstaSemana = fotos.some(function(f){ return f.semana === semanaActual; });
    compareSel = [];

    var pesoTotal = pesoTotalFotos(fotos);
    var avisoVistoKey = "fitapp_aviso_fotos_visto_" + alumno.id;
    var avisoVisto = localStorage.getItem(avisoVistoKey) === "1";

    var html = "<div class='px'>";

    if(!avisoVisto){
      html += "<details class='privacidad-aviso' id='privacidad-detalle' open>" +
        "<summary style='cursor:pointer;font-weight:600;list-style:none;'>🔒 Sobre tu privacidad</summary>" +
        "<p style='margin-top:6px;'>Tus fotos se guardan solo en este dispositivo. No se envían a ningún servidor. Tu coach solo ve las fotos que marques como \"Compartir con mi coach\".</p>" +
        "<button class='outline-btn' id='btn-entendido-privacidad' style='margin-top:10px;height:38px;font-size:.82rem;'>Entendido</button></details>";
    }

    if(pesoTotal > LIMITE_BYTES){
      html += "<div class='privacidad-aviso' style='background:rgba(255,149,0,.12);color:#8a5a00;'>⚠️ Tus fotos están ocupando bastante espacio en este dispositivo (" + (pesoTotal/1024/1024).toFixed(1) + " MB). Guarda las que quieras conservar en tu galería y elimina las más antiguas aquí.</div>";
    }

    if(!yaSubioEstaSemana){
      html += "<div class='foto-upload-card'>" +
        "<p>Toca para tomar tu foto de progreso de esta semana</p>" +
        "<input type='file' accept='image/*' capture='environment' id='foto-input' style='display:none;'>" +
        "<button class='pill-btn' id='foto-trigger'>Tomar / subir foto</button></div>";
    } else {
      html += "<div class='foto-upload-card done'><p>Ya registraste tu foto de esta semana. ¡Vuelve la próxima!</p></div>";
    }

    html += "<h3 style='margin:24px 0 10px;font-weight:700;'>Tu galería (" + fotos.length + ")</h3>";
    if(fotos.length === 0){
      html += "<div class='estado-vacio'><h3>Sin fotos todavía</h3><p>Empieza esta semana para ver tu evolución con el tiempo.</p></div>";
    } else {
      html += "<p style='font-size:.78rem;color:var(--text-muted);margin-bottom:8px;'>Toca dos fotos para compararlas lado a lado.</p>";
      html += "<div class='fotos-grid'>";
      fotos.forEach(function(f){
        html += "<div class='foto-item' data-id='" + f.id + "'><img src='" + f.dataUrl + "'>" +
          (f.compartida ? "<span class='foto-share-badge'>Compartida</span>" : "") +
          "<span class='foto-fecha'>Semana " + f.semana.split("-")[0] + " · " + f.fecha + "</span></div>";
      });
      html += "</div>";
    }
    html += "<div id='foto-compare'></div>";
    html += "<div id='foto-detalle-modal'></div>";
    html += "</div>";

    document.getElementById("page-fotos").innerHTML = html;

    var btnEntendido = document.getElementById("btn-entendido-privacidad");
    if(btnEntendido) btnEntendido.addEventListener("click", function(){
      localStorage.setItem(avisoVistoKey, "1");
      document.getElementById("privacidad-detalle").remove();
    });

    var trigger = document.getElementById("foto-trigger");
    if(trigger){
      trigger.addEventListener("click", function(){ document.getElementById("foto-input").click(); });
      document.getElementById("foto-input").addEventListener("change", function(e){
        var file = e.target.files[0];
        if(!file) return;
        comprimirImagen(file, 480, function(dataUrl){
          window.db.saveFoto(alumno.id, { id: window.db.generarId("foto"), fecha: window.db.fechaHoy(), semana: semanaActual, dataUrl: dataUrl, compartida: false, nota: "" });
          window.mostrarToast("Foto de progreso guardada");
          window.init_fotos();
        });
      });
    }

    document.querySelectorAll(".foto-item").forEach(function(el){
      var id = el.getAttribute("data-id");
      el.addEventListener("click", function(){
        abrirDetalleFoto(fotos.filter(function(f){ return f.id === id; })[0]);
      });
    });

    function abrirDetalleFoto(foto){
      var modal = document.createElement("div");
      modal.className = "modal-celebracion";
      modal.innerHTML = "<div class='mc-card' style='text-align:left;'>" +
        "<img src='" + foto.dataUrl + "' style='width:100%;border-radius:14px;margin-bottom:14px;'>" +
        "<p style='font-size:.85rem;color:var(--text-muted);margin-bottom:14px;'>Semana " + foto.semana.split("-")[0] + " · " + foto.fecha + "</p>" +
        "<div class='perfil-row' style='border-radius:12px;margin-bottom:14px;'><span>Compartir con mi coach</span>" +
        "<div class='toggle-switch" + (foto.compartida ? " on" : "") + "' id='toggle-compartir'><div class='knob'></div></div></div>" +
        "<button class='outline-btn' id='btn-eliminar-foto' style='border-color:var(--red);color:var(--red);margin-bottom:8px;'>Eliminar esta foto</button>" +
        "<button class='pill-btn' id='btn-cerrar-detalle'>Cerrar</button></div>";
      document.body.appendChild(modal);
      modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
      document.getElementById("btn-cerrar-detalle").addEventListener("click", function(){ modal.remove(); });
      document.getElementById("toggle-compartir").addEventListener("click", function(){
        foto.compartida = !foto.compartida;
        this.classList.toggle("on", foto.compartida);
        var todas = window.db.getFotos(alumno.id);
        var idx = todas.findIndex(function(f){ return f.id === foto.id; });
        if(idx !== -1){ todas[idx] = foto; localStorage.setItem("fitapp_fotos_" + alumno.id, JSON.stringify(todas)); }
        window.mostrarToast(foto.compartida ? "Compartida con tu coach" : "Ya no se comparte con tu coach");
      });
      document.getElementById("btn-eliminar-foto").addEventListener("click", function(){
        if(!confirm("¿Eliminar esta foto? No se puede recuperar.")) return;
        window.db.deleteFoto(alumno.id, foto.id);
        modal.remove();
        window.init_fotos();
      });
    }

    var compararBtn = document.createElement("button");
    if(fotos.length >= 2){
      compararBtn.className = "outline-btn";
      compararBtn.textContent = "Comparar dos semanas";
      compararBtn.style.marginTop = "14px";
      document.getElementById("foto-compare").insertAdjacentElement("beforebegin", compararBtn);
      compararBtn.addEventListener("click", function(){ abrirComparador(fotos); });
    }

    function abrirComparador(fotos){
      var modal = document.createElement("div");
      modal.className = "modal-celebracion";
      modal.innerHTML = "<div class='mc-card' style='text-align:left;'>" +
        "<h2 style='text-align:center;'>Comparar semanas</h2>" +
        "<div class='row2' style='display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;'>" +
        "<select id='comp-a'>" + fotos.map(function(f,i){ return "<option value='"+i+"'>Semana " + f.semana.split("-")[0] + " (" + f.fecha + ")</option>"; }).join("") + "</select>" +
        "<select id='comp-b'>" + fotos.map(function(f,i){ return "<option value='"+i+"'" + (i===1?" selected":"") + ">Semana " + f.semana.split("-")[0] + " (" + f.fecha + ")</option>"; }).join("") + "</select>" +
        "</div><div id='comp-resultado'></div>" +
        "<button class='pill-btn' id='comp-cerrar' style='margin-top:14px;'>Cerrar</button></div>";
      document.body.appendChild(modal);
      modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
      document.getElementById("comp-cerrar").addEventListener("click", function(){ modal.remove(); });

      function pintar(){
        var a = fotos[parseInt(document.getElementById("comp-a").value,10)];
        var b = fotos[parseInt(document.getElementById("comp-b").value,10)];
        document.getElementById("comp-resultado").innerHTML = "<div class='foto-compare-row'>" +
          "<div><img src='" + a.dataUrl + "'><span>Semana " + a.semana.split("-")[0] + " · " + a.fecha + "</span></div>" +
          "<div><img src='" + b.dataUrl + "'><span>Semana " + b.semana.split("-")[0] + " · " + b.fecha + "</span></div></div>";
      }
      pintar();
      document.getElementById("comp-a").addEventListener("change", pintar);
      document.getElementById("comp-b").addEventListener("change", pintar);
    }
  };
})();

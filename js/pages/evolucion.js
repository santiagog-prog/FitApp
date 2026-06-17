// ════════════════════════════════════════════════════════════
// evolucion.js — Page Evolución: stats, gráfica peso, historial, medidas, medallas
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  function svgGraficaPeso(pesos){
    if(pesos.length === 0) return "<p style='color:var(--text-muted);font-size:.85rem;padding:0 16px;'>Aún no hay registros de peso.</p>";
    var vals = pesos.map(function(p){ return parseFloat(p.kg); });
    var min = Math.min.apply(null, vals) - 2, max = Math.max.apply(null, vals) + 2;
    var w = 380, h = 140, padX = 20, padY = 16;
    var stepX = (w - padX*2) / Math.max(1, pesos.length - 1);

    function x(i){ return padX + i*stepX; }
    function y(v){ return h - padY - ((v - min)/(max - min)) * (h - padY*2); }

    var points = pesos.map(function(p,i){ return x(i) + "," + y(parseFloat(p.kg)); }).join(" ");
    var circles = pesos.map(function(p,i){ return "<circle cx='" + x(i) + "' cy='" + y(parseFloat(p.kg)) + "' r='4' fill='#C8E000'></circle>"; }).join("");

    return "<svg viewBox='0 0 " + w + " " + h + "' style='width:100%;height:140px;'>" +
      "<polyline points='" + points + "' fill='none' stroke='#C8E000' stroke-width='2'></polyline>" +
      circles + "</svg>" +
      "<div style='display:flex;justify-content:space-between;padding:0 16px;font-size:.7rem;color:var(--text-muted);'>" +
      "<span>" + pesos[0].fecha + "</span><span>" + pesos[pesos.length-1].fecha + "</span></div>";
  }

  window.init_evolucion = function(){
    window.renderHeaderPrincipal("Evolución", window.iconoSVG("chart"));

    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var registros = window.db.getRegistros(alumno.id);
    var pesos = window.db.getPesos(alumno.id);
    var medidas = window.db.getMedidas(alumno.id);
    var medallas = window.db.getMedallas(alumno.id);

    var hoy = new Date();
    var registrosMes = registros.filter(function(r){ return new Date(r.fecha).getMonth() === hoy.getMonth(); });
    var horasTotal = registros.reduce(function(s,r){ return s + (r.duracion_min||0); }, 0) / 60;

    var html = "<div class='px'>";
    html += "<button class='outline-btn' id='btn-ir-fotos-evo' style='margin-bottom:14px;'>📸 Ver fotos de progreso</button>";

    html += "<div class='resumen-grid'>" +
      "<div class='resumen-chip'><div class='rc-val'>🏋️ " + registrosMes.length + "</div><div class='rc-label'>Entrenos este mes</div></div>" +
      "<div class='resumen-chip'><div class='rc-val'>🔥 " + window.db.calcularRacha(alumno.id) + "</div><div class='rc-label'>Racha actual</div></div>" +
      "<div class='resumen-chip'><div class='rc-val'>⏱ " + horasTotal.toFixed(1) + "h</div><div class='rc-label'>Horas entrenadas</div></div>" +
      "<div class='resumen-chip'><div class='rc-val'>🏆 " + registros.length + "</div><div class='rc-label'>Total entrenos</div></div>" +
      "</div></div>";

    html += "<div style='padding:0 16px;'><h3 style='margin-bottom:10px;'>Peso corporal</h3></div>";
    html += svgGraficaPeso(pesos);
    var hoyKey = window.db.fechaHoy();
    var yaRegistroHoy = pesos.filter(function(p){ return p.fecha === hoyKey; }).length > 0;
    if(!yaRegistroHoy){
      html += "<div class='px'><input type='number' step='0.1' id='peso-input' placeholder='Tu peso hoy (kg)' style='width:100%;padding:12px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);border-radius:10px;margin-bottom:8px;'>" +
        "<button class='pill-btn' id='btn-registrar-peso'>+ Registrar peso hoy</button></div>";
    }

    html += "<div class='px'><h3 style='margin-bottom:10px;'>Mis entrenamientos</h3></div>";
    if(registros.length === 0){
      html += "<p style='padding:0 16px;color:var(--text-muted);font-size:.85rem;'>Aún no tienes entrenamientos registrados.</p>";
    } else {
      registros.slice().reverse().slice(0,8).forEach(function(r){
        html += "<div class='historial-row'><div class='hr-top'><span>" + r.fecha + " · " + r.sesion_nombre + "</span><span>" + ["😫","😕","😐","💪","🔥"][(r.sensacion||3)-1] + "</span></div>" +
          "<div class='hr-sub'>" + r.duracion_min + " min" + (r.nota ? " · " + r.nota : "") + "</div></div>";
      });
    }

    html += "<div class='px'><h3 style='margin-bottom:10px;'>Medidas corporales</h3>" +
      "<button class='outline-btn' id='btn-medidas'>📏 Registrar mis medidas</button></div>";
    if(medidas.length){
      html += "<table class='medidas-tabla'><tr><th>Fecha</th><th>Cintura</th><th>Cadera</th><th>Brazo</th><th>Muslo</th></tr>";
      medidas.slice(-4).forEach(function(m){
        html += "<tr><td>" + m.fecha + "</td><td>" + m.cintura + "</td><td>" + m.cadera + "</td><td>" + m.brazo_der + "</td><td>" + m.muslo_der + "</td></tr>";
      });
      html += "</table>";
    }

    html += "<div class='px'><h3 style='margin-bottom:10px;'>Mis medallas</h3></div><div class='medallas-grid'>";
    window.db.MEDALLAS_DEF.forEach(function(m){
      var desbloq = medallas.indexOf(m.id) !== -1;
      html += "<div class='medalla" + (desbloq ? " desbloqueada" : "") + "'><div class='med-circ'>" + (desbloq ? m.icono : "🔒") + "</div><div class='med-nombre'>" + m.nombre + "</div></div>";
    });
    html += "</div><div style='height:20px;'></div>";

    document.getElementById("page-evolucion").innerHTML = html;

    document.getElementById("btn-ir-fotos-evo").addEventListener("click", function(){ window.irAPagina("fotos"); });

    var btnPeso = document.getElementById("btn-registrar-peso");
    if(btnPeso) btnPeso.addEventListener("click", function(){
      var val = document.getElementById("peso-input").value;
      if(!val) return;
      window.db.savePeso(alumno.id, { fecha: hoyKey, kg: val });
      window.mostrarToast("Peso registrado: " + val + " kg");
      window.init_evolucion();
    });

    document.getElementById("btn-medidas").addEventListener("click", function(){
      abrirModalMedidas(alumno.id);
    });
  };

  function abrirModalMedidas(alumnoId){
    var campos = ["cuello","pecho","cintura","cadera","brazo_izq","brazo_der","muslo_izq","muslo_der","pantorrilla"];
    var labels = ["Cuello","Pecho","Cintura","Cadera","Brazo izq.","Brazo der.","Muslo izq.","Muslo der.","Pantorrilla"];
    var modal = document.createElement("div");
    modal.className = "modal-celebracion";
    var inputs = campos.map(function(c, i){
      return "<div style='text-align:left;margin-bottom:8px;'><label style='font-size:.78rem;color:var(--text-muted);'>" + labels[i] + " (cm)</label>" +
        "<input type='number' step='0.1' data-campo='" + c + "' style='width:100%;padding:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);border-radius:8px;'></div>";
    }).join("");
    modal.innerHTML = "<div class='mc-card' style='max-height:80vh;overflow-y:auto;text-align:left;'><h2 style='text-align:center;'>📏 Mis medidas</h2>" + inputs +
      "<button class='pill-btn' id='guardar-medidas' style='margin-top:10px;'>Guardar</button></div>";
    document.body.appendChild(modal);
    document.getElementById("guardar-medidas").addEventListener("click", function(){
      var data = { fecha: window.db.fechaHoy() };
      modal.querySelectorAll("[data-campo]").forEach(function(inp){ data[inp.getAttribute("data-campo")] = inp.value || 0; });
      window.db.saveMedidas(alumnoId, data);
      var nuevas = window.db.checkMedallas(alumnoId);
      modal.remove();
      window.mostrarToast("Medidas guardadas");
      window.mostrarMedallasNuevas(nuevas);
      window.init_evolucion();
    });
  }
})();

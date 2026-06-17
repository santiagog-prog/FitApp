// ════════════════════════════════════════════════════════════
// habitos.js — Page Hábitos y objetivos: resumen diario + vista semanal
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";
  var DIAS_L = ["L","M","X","J","V","S","D"];

  function ultimosDias(n){
    var hoy = new Date();
    var out = [];
    for(var i=n-1; i>=0; i--){
      var d = new Date(hoy); d.setDate(d.getDate()-i);
      out.push(d.toISOString().split("T")[0]);
    }
    return out;
  }

  function diaAplica(habito, fecha, diaEntrenoMap){
    var freq = habito.frecuencia || "diario";
    if(freq === "diario") return true;
    if(freq === "dias_entreno") return !!diaEntrenoMap[fecha];
    if(freq === "fines_semana"){ var d = (new Date(fecha).getDay()+6)%7; return d===5 || d===6; }
    return true;
  }

  function construirMapaEntreno(alumno, fechas){
    var rutina = window.db.getRutinaPorId(alumno.rutina_id);
    var map = {};
    fechas.forEach(function(f){
      if(!rutina){ map[f]=false; return; }
      var diaIdx = (new Date(f).getDay()+6)%7;
      var dia = rutina.dias[diaIdx % rutina.dias.length];
      map[f] = !!(dia && dia.tipo !== "descanso");
    });
    return map;
  }

  function icono(key){ return "<svg viewBox='0 0 24 24'>" + (window.db.HABITOS_ICONOS_SVG[key] || window.db.HABITOS_ICONOS_SVG.default) + "</svg>"; }

  window.init_habitos = function(){
    window.renderHeaderDetalle("Mis hábitos", function(){ window.irAPagina("inicio"); });

    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var habitosTodos = window.db.getHabitos(alumno.id);
    var checks = window.db.getHabitoChecks(alumno.id);
    var hoyKey = window.db.fechaHoy();
    var dias7 = ultimosDias(7);
    var mapaEntreno = construirMapaEntreno(alumno, dias7.concat([hoyKey]));

    var habitosHoy = habitosTodos.filter(function(h){ return diaAplica(h, hoyKey, mapaEntreno); });
    var hechosHoy = habitosHoy.filter(function(h){ return checks[hoyKey] && checks[hoyKey][h.id]; }).length;
    var pct = habitosHoy.length ? Math.round(hechosHoy/habitosHoy.length*100) : 0;

    var html = "<div class='px'>";

    if(habitosHoy.length){
      html += "<div class='habitos-resumen-dia'><div class='hrd-texto'>Completaste " + hechosHoy + " de " + habitosHoy.length + " hábitos hoy</div>" +
        "<div class='hrd-bar'><div class='fill' style='width:" + pct + "%;'></div></div></div>";
    }

    html += "<button class='outline-btn' id='btn-add-habito' style='margin-bottom:24px;'>+ Nuevo hábito</button>";

    if(habitosTodos.length === 0){
      html += "<div class='estado-vacio'><h3>Sin hábitos todavía</h3><p>Crea el primero o pide a tu coach que te asigne uno.</p></div>";
    }

    habitosTodos.forEach(function(h){
      var aplicaHoy = diaAplica(h, hoyKey, mapaEntreno);
      var hechoHoy = !!(checks[hoyKey] && checks[hoyKey][h.id]);
      var racha = window.db.calcularRachaHabito(alumno.id, h.id);

      html += "<div class='habito-card'>" +
        "<div class='habito-top'>" +
        "<div class='habito-icon-box'>" + icono(h.icono) + "</div>" +
        "<div class='habito-info'><div class='habito-nombre'>" + h.nombre + "</div>" +
        "<div class='habito-racha-txt'>" + (racha > 0 ? "🔥 " + racha + " días seguidos" : "Sin racha activa") + "</div></div>" +
        (aplicaHoy ? "<div class='acr-check" + (hechoHoy?" checked":"") + "' data-id='" + h.id + "'>" + (hechoHoy?"✓":"") + "</div>" : "<span style='font-size:.7rem;color:var(--text-muted);'>No hoy</span>") +
        "</div>" +
        "<div class='habito-heatmap'>" + dias7.map(function(f){
          var on = !!(checks[f] && checks[f][h.id]);
          var aplica = diaAplica(h, f, mapaEntreno);
          return "<span class='hm-cell" + (on?" on":"") + (f===hoyKey?" hoy":"") + "' style='" + (aplica?"":"opacity:.3;") + "' title='" + f + "'></span>";
        }).join("") + "</div>" +
        "<button class='habito-eliminar' data-id='" + h.id + "'>Eliminar hábito</button>" +
        "</div>";
    });

    if(habitosTodos.length){
      html += "<h3 style='margin:24px 0 12px;font-weight:700;'>Vista semanal</h3>";
      html += "<table class='habitos-semana-tabla'><tr><th>Hábito</th>" + DIAS_L.map(function(d){ return "<th>"+d+"</th>"; }).join("") + "</tr>";
      habitosTodos.forEach(function(h){
        html += "<tr><td>" + h.nombre + "</td>" + dias7.map(function(f){
          var on = !!(checks[f] && checks[f][h.id]);
          return "<td><span class='punto-habito" + (on?" on":"") + "'></span></td>";
        }).join("") + "</tr>";
      });
      html += "</table>";
    }

    html += "</div>";
    document.getElementById("page-habitos").innerHTML = html;

    document.getElementById("btn-add-habito").addEventListener("click", abrirModalHabito);
    document.querySelectorAll(".habito-top .acr-check").forEach(function(btn){
      btn.addEventListener("click", function(){
        var id = this.getAttribute("data-id");
        window.db.toggleHabitoCheck(alumno.id, id, hoyKey);
        window.init_habitos();
      });
    });
    document.querySelectorAll(".habito-eliminar").forEach(function(btn){
      btn.addEventListener("click", function(){
        if(!confirm("¿Eliminar este hábito?")) return;
        window.db.deleteHabito(alumno.id, this.getAttribute("data-id"));
        window.init_habitos();
      });
    });

    function abrirModalHabito(){
      var iconos = Object.keys(window.db.HABITOS_ICONOS_SVG).filter(function(k){ return k!=="default"; });
      var modal = document.createElement("div");
      modal.className = "modal-celebracion";
      modal.innerHTML = "<div class='mc-card' style='text-align:left;'><h2 style='text-align:center;'>Nuevo hábito</h2>" +
        "<label style='font-size:.78rem;color:var(--text-muted);'>¿Qué quieres hacer?</label>" +
        "<input id='nh-nombre' placeholder='Ej: Tomar 2 litros de agua' style='width:100%;padding:10px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);border-radius:8px;margin-bottom:12px;'>" +
        "<label style='font-size:.78rem;color:var(--text-muted);'>Frecuencia</label>" +
        "<select id='nh-frecuencia' style='width:100%;padding:10px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);border-radius:8px;margin-bottom:12px;'>" +
        "<option value='diario'>Todos los días</option><option value='dias_entreno'>Solo días de entreno</option><option value='fines_semana'>Fines de semana</option></select>" +
        "<label style='font-size:.78rem;color:var(--text-muted);'>Ícono</label>" +
        "<div class='icono-picker'>" + iconos.map(function(k){ return "<span class='icono-opcion' data-k='" + k + "'>" + icono(k) + "</span>"; }).join("") + "</div>" +
        "<button class='pill-btn' id='nh-guardar' style='margin-top:16px;'>Crear hábito</button></div>";
      document.body.appendChild(modal);
      modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });

      var iconoSel = iconos[0];
      modal.querySelectorAll(".icono-opcion").forEach(function(s, i){
        if(i===0) s.classList.add("sel");
        s.addEventListener("click", function(){
          modal.querySelectorAll(".icono-opcion").forEach(function(x){ x.classList.remove("sel"); });
          s.classList.add("sel");
          iconoSel = s.getAttribute("data-k");
        });
      });

      document.getElementById("nh-guardar").addEventListener("click", function(){
        var nombre = document.getElementById("nh-nombre").value.trim();
        if(!nombre) return;
        window.db.saveHabito(alumno.id, { id: window.db.generarId("h"), nombre: nombre, icono: iconoSel, frecuencia: document.getElementById("nh-frecuencia").value, creado: window.db.fechaHoy() });
        modal.remove();
        window.init_habitos();
      });
    }
  };
})();

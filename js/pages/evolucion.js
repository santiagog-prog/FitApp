// ════════════════════════════════════════════════════════════
// evolucion.js — Progreso: gráfica trading, historial, medallas, fotos, medidas
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  var MEDALLAS_CONFIG = [
    { id:"primera_llama",   icono:"🔥", nombre:"Primera llama",    desc:"Primer entreno completado" },
    { id:"racha_3",         icono:"📅", nombre:"3 seguidos",        desc:"Racha de 3 días" },
    { id:"semana_completa", icono:"⚡", nombre:"Semana completa",   desc:"Racha de 7 días" },
    { id:"mes_fuego",       icono:"🏅", nombre:"Mes de fuego",      desc:"Racha de 30 días" },
    { id:"hidratado",       icono:"💧", nombre:"Hidratado",         desc:"8 vasos en un día" },
    { id:"decimo_entreno",  icono:"💪", nombre:"10 entrenos",       desc:"10 sesiones completadas" },
    { id:"cincuenton",      icono:"🏆", nombre:"50 entrenos",       desc:"50 sesiones completadas" },
    { id:"primera_bajada",  icono:"📉", nombre:"Primera bajada",    desc:"Bajada de peso registrada" },
    { id:"me_mido",         icono:"📏", nombre:"Me mido",           desc:"Primeras medidas corporales" },
    { id:"madrugador",      icono:"🌅", nombre:"Madrugador",        desc:"Entreno antes de las 7 AM" },
    { id:"noctambulo",      icono:"🌙", nombre:"Noctámbulo",        desc:"Entreno después de las 9 PM" },
    { id:"semana_limpia",   icono:"🥗", nombre:"Semana limpia",     desc:"7 días registrando comidas" },
    { id:"mes_completo",    icono:"🌟", nombre:"Mes completo",       desc:"Todos los entrenos del mes" },
    { id:"elite",           icono:"👑", nombre:"Élite",             desc:"Racha de 60 días" }
  ];

  // ── GRÁFICA TRADING ──────────────────────────────────────
  function renderGraficaTradingPeso(containerId, pesos){
    var container = document.getElementById(containerId);
    if(!container) return;
    if(pesos.length < 2){
      container.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,.3);font-size:13px;">Registra tu peso para ver la gráfica</div>';
      return;
    }
    var W = container.offsetWidth || 340;
    var H = 180;
    var PAD = { top:16, right:16, bottom:36, left:48 };
    var vals = pesos.map(function(p){ return parseFloat(p.kg); });
    var minV = Math.min.apply(null, vals)-1;
    var maxV = Math.max.apply(null, vals)+1;
    var rX = function(i){ return PAD.left + (i/(pesos.length-1)) * (W-PAD.left-PAD.right); };
    var rY = function(v){ return PAD.top + (1-(v-minV)/(maxV-minV)) * (H-PAD.top-PAD.bottom); };

    var grid = "";
    for(var g=0; g<=4; g++){
      var yv = minV + (g/4)*(maxV-minV);
      var yp = rY(yv);
      grid += '<line x1="' + PAD.left + '" y1="' + yp.toFixed(1) + '" x2="' + (W-PAD.right) + '" y2="' + yp.toFixed(1) + '" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';
      grid += '<text x="' + (PAD.left-6) + '" y="' + (yp+4).toFixed(1) + '" text-anchor="end" font-size="10" fill="rgba(255,255,255,0.2)" font-family="Inter,sans-serif">' + yv.toFixed(1) + '</text>';
    }

    var area = "M " + rX(0).toFixed(1) + " " + H;
    pesos.forEach(function(p,i){ area += " L " + rX(i).toFixed(1) + " " + rY(p.kg).toFixed(1); });
    area += " L " + rX(pesos.length-1).toFixed(1) + " " + H + " Z";

    var line = pesos.map(function(p,i){ return (i===0?"M":"L") + " " + rX(i).toFixed(1) + " " + rY(p.kg).toFixed(1); }).join(" ");

    var puntos = "", labels = "";
    var step = Math.ceil(pesos.length/5);
    pesos.forEach(function(p,i){
      var cx = rX(i).toFixed(1), cy = rY(p.kg).toFixed(1);
      puntos += '<circle class="gpeso-dot" cx="' + cx + '" cy="' + cy + '" r="5" fill="#C8E000" stroke="#0A0A0A" stroke-width="2" data-kg="' + p.kg + '" data-fecha="' + p.fecha + '" style="cursor:pointer;"/>';
      if(i%step===0 || i===pesos.length-1){
        var f = p.fecha.split("-");
        labels += '<text x="' + cx + '" y="' + (H-4) + '" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.25)" font-family="Inter,sans-serif">' + f[2] + "/" + f[1] + '</text>';
      }
    });

    container.innerHTML =
      '<div style="position:relative;">' +
      '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
        '<defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#C8E000" stop-opacity="0.2"/>' +
          '<stop offset="100%" stop-color="#C8E000" stop-opacity="0"/>' +
        '</linearGradient></defs>' +
        grid +
        '<path d="' + area + '" fill="url(#pg)"/>' +
        '<path d="' + line + '" fill="none" stroke="#C8E000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        puntos + labels +
      '</svg>' +
      '<div id="gpeso-tooltip" style="display:none;position:absolute;background:#1C1C1C;border:1px solid rgba(200,224,0,0.4);border-radius:10px;padding:8px 14px;pointer-events:none;z-index:10;">' +
        '<div id="gpeso-tt-kg" style="font-size:18px;font-weight:800;color:#C8E000;"></div>' +
        '<div id="gpeso-tt-fecha" style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;"></div>' +
      '</div>' +
      '</div>';

    // Tooltip click handler
    container.querySelectorAll(".gpeso-dot").forEach(function(dot){
      dot.addEventListener("click", function(e){
        var tt = document.getElementById("gpeso-tooltip");
        var svgRect = dot.closest("svg").getBoundingClientRect();
        var contRect = container.getBoundingClientRect();
        var cx = parseFloat(dot.getAttribute("cx"));
        var cy = parseFloat(dot.getAttribute("cy"));
        document.getElementById("gpeso-tt-kg").textContent = dot.getAttribute("data-kg") + " kg";
        var f = dot.getAttribute("data-fecha").split("-");
        document.getElementById("gpeso-tt-fecha").textContent = f[2] + "/" + f[1] + "/" + f[0];
        var left = cx - 50;
        var top = cy - 68;
        if(left < 0) left = 0;
        tt.style.left = left + "px";
        tt.style.top = top + "px";
        tt.style.display = "block";
        e.stopPropagation();
      });
    });
    document.addEventListener("click", function(){ var tt = document.getElementById("gpeso-tooltip"); if(tt) tt.style.display="none"; }, { once:false });
  }

  // ── MEDALLAS ─────────────────────────────────────────────
  function renderMedallas(alumnoId){
    var desbloqueadas = window.db.getMedallas(alumnoId);
    return MEDALLAS_CONFIG.map(function(m){
      var unlocked = desbloqueadas.indexOf(m.id) !== -1;
      return '<div class="medalla' + (unlocked?" desbloqueada":"") + '" title="' + m.desc + '">' +
        '<div class="med-circ">' +
          (unlocked ? m.icono :
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>') +
        '</div>' +
        '<div class="med-nombre">' + m.nombre + '</div>' +
      '</div>';
    }).join("");
  }

  window.celebrarMedalla = function(medallaId){
    var m = MEDALLAS_CONFIG.find(function(x){ return x.id===medallaId; });
    if(!m) return;
    window.mostrarToast(m.icono + " ¡Medalla desbloqueada! " + m.nombre);
  };

  // ── HISTORIAL EXPANDIBLE ─────────────────────────────────
  function renderHistorial(registros){
    if(registros.length === 0) return '<p style="padding:0 20px;color:rgba(255,255,255,.3);font-size:13px;">Aún no hay entrenamientos.</p>';
    var emojis = ["😫","😕","😐","💪","🔥"];
    return registros.slice().reverse().slice(0,10).map(function(r, i){
      return '<div class="historial-row" id="hw-' + i + '">' +
        '<div class="historial-row-head" onclick="window._toggleHW(' + i + ')">' +
          '<div style="flex:1;">' +
            '<div style="font-size:12px;color:rgba(255,255,255,.35);margin-bottom:3px;">' + r.fecha + '</div>' +
            '<div style="font-size:15px;font-weight:600;color:#FFF;">' + (r.sesion_nombre||r.nombre_sesion||"Sesión") + '</div>' +
            '<div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:2px;">' + (r.duracion_min||0) + ' min · ' + (r.ejercicios_completados||0) + ' ejercicios</div>' +
          '</div>' +
          '<div style="font-size:22px;">' + (emojis[(r.sensacion||3)-1]) + '</div>' +
          '<div id="chev-hw-' + i + '" style="color:rgba(255,255,255,.2);font-size:18px;margin-left:8px;transition:transform .2s;">›</div>' +
        '</div>' +
        '<div id="detail-hw-' + i + '" class="historial-row-body">' +
          (r.nota ? '<p style="font-size:13px;color:rgba(255,255,255,.5);font-style:italic;padding:10px 0;">"' + r.nota + '"</p>' : '') +
        '</div>' +
      '</div>';
    }).join("");
  }

  window._toggleHW = function(i){
    var detail = document.getElementById("detail-hw-" + i);
    var chev   = document.getElementById("chev-hw-" + i);
    if(!detail) return;
    var open = detail.classList.contains("open");
    detail.classList.toggle("open", !open);
    if(chev) chev.style.transform = open ? "" : "rotate(90deg)";
  };

  // ── INIT ────────────────────────────────────────────────
  window.init_evolucion = function(){
    var header = document.getElementById("app-header");
    header.innerHTML =
      "<div class='ah-top'><div></div><div class='ah-icons'></div></div>" +
      "<div class='ah-subtitle'>Tu evolución</div>" +
      "<div class='ah-title'>Progreso</div>";

    var alumno   = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var registros= window.db.getRegistros(alumno.id);
    var pesos    = window.db.getPesos(alumno.id);
    var medidas  = window.db.getMedidas(alumno.id);
    var hoy      = new Date();
    var hoyKey   = window.db.fechaHoy();
    var regsMes  = registros.filter(function(r){ return new Date(r.fecha).getMonth()===hoy.getMonth(); });
    var horasTotal = registros.reduce(function(s,r){ return s+(r.duracion_min||0); },0);

    var html = "<div style='padding-top:4px;'>";

    // Stats chips
    html += "<div style='display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 20px 16px;'>" +
      chip(regsMes.length,     "Entrenos este mes") +
      chip(window.db.calcularRacha(alumno.id), "Racha actual · días") +
      chip(Math.floor(horasTotal/60)+"h " + (horasTotal%60)+"m", "Horas entrenadas") +
      chip(registros.length,   "Total entrenamientos") +
    "</div>";

    // Link fotos
    html += "<div style='padding:0 20px 16px;'>" +
      "<button id='btn-ir-fotos-evo' style='width:100%;height:44px;background:rgba(200,224,0,0.08);color:#C8E000;border:1px solid rgba(200,224,0,0.2);border-radius:50px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;'>📸 Ver fotos de progreso</button>" +
    "</div>";

    // Peso
    html += "<div style='padding:0 20px 10px;'>" +
      "<div style='font-size:18px;font-weight:700;color:#FFF;margin-bottom:4px;'>Peso corporal</div>";
    if(pesos.length > 0){
      var pesoActual = parseFloat(pesos[pesos.length-1].kg);
      var diff = pesos.length > 1 ? (pesoActual - parseFloat(pesos[pesos.length-2].kg)).toFixed(1) : 0;
      html += "<div style='font-size:32px;font-weight:800;color:#C8E000;letter-spacing:-.5px;'>" + pesoActual + " kg" +
        "<span style='font-size:14px;font-weight:500;color:" + (diff<=0?"#34C759":"#FF453A") + ";margin-left:10px;'>" + (diff>0?"+":"") + diff + " kg</span></div>";
    }
    html += "</div>";

    html += "<div id='grafica-peso' style='padding:0 0 16px;'></div>";

    // Registrar peso
    var yaRegistroHoy = pesos.some(function(p){ return p.fecha===hoyKey; });
    if(!yaRegistroHoy){
      html += "<div style='padding:0 20px 20px;display:flex;gap:10px;'>" +
        "<input type='number' step='0.1' id='peso-input' placeholder='Tu peso hoy (kg)' style='flex:1;height:48px;background:#141414;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:0 16px;color:#FFF;font-size:16px;font-family:inherit;'>" +
        "<button id='btn-registrar-peso' style='height:48px;padding:0 20px;background:#C8E000;color:#1C1C1E;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit;'>+ Registrar</button>" +
      "</div>";
    }

    // Historial
    html += "<div style='padding:0 20px 10px;'><div style='font-size:18px;font-weight:700;color:#FFF;margin-bottom:12px;'>Mis entrenamientos</div></div>";
    html += renderHistorial(registros);

    // Entrenos por tipo (PARTE 3B)
    var tiposMap = {};
    var TIPOS_CONOCIDOS = ["Push","Pull","Legs","Upper","Lower","Full Body","Cardio","Core","HIIT"];
    registros.forEach(function(r){
      var nombre = r.sesion_nombre || r.nombre_sesion || "Sesión";
      var tipo = "Otros";
      TIPOS_CONOCIDOS.forEach(function(t){ if(nombre.toLowerCase().indexOf(t.toLowerCase()) !== -1) tipo = t; });
      if(!tiposMap[tipo]) tiposMap[tipo] = 0;
      tiposMap[tipo]++;
    });
    var tipos = Object.keys(tiposMap);
    if(tipos.length > 1){
      var totalRegs = registros.length || 1;
      var TIPO_COLORS = { Push:"#C8E000", Pull:"#34C759", Legs:"#FF9F0A", Upper:"#5AC8FA", Lower:"#AF52DE", "Full Body":"#FF375F", Cardio:"#FF6B35", Core:"#30D158", HIIT:"#FF453A", Otros:"rgba(255,255,255,0.3)" };
      html += "<div style='padding:0 20px 20px;'>" +
        "<div style='font-size:18px;font-weight:700;color:#FFF;margin-bottom:14px;'>Entrenos por tipo</div>" +
        "<div style='display:flex;flex-direction:column;gap:10px;'>";
      tipos.sort(function(a,b){ return tiposMap[b]-tiposMap[a]; }).forEach(function(tipo){
        var count = tiposMap[tipo];
        var pct = Math.round(count/totalRegs*100);
        var color = TIPO_COLORS[tipo] || "#C8E000";
        html += "<div>" +
          "<div style='display:flex;justify-content:space-between;margin-bottom:5px;'>" +
            "<span style='font-size:14px;font-weight:600;color:#FFF;'>" + tipo + "</span>" +
            "<span style='font-size:13px;color:rgba(255,255,255,0.4);'>" + count + " sesiones · " + pct + "%</span>" +
          "</div>" +
          "<div style='height:6px;background:rgba(255,255,255,0.06);border-radius:99px;overflow:hidden;'>" +
            "<div style='height:100%;width:" + pct + "%;background:" + color + ";border-radius:99px;transition:width .6s ease;'></div>" +
          "</div>" +
        "</div>";
      });
      html += "</div></div>";
    }

    // Medidas
    html += "<div style='padding:16px 20px 10px;'><div style='font-size:18px;font-weight:700;color:#FFF;margin-bottom:10px;'>Medidas corporales</div>" +
      "<button id='btn-medidas' style='width:100%;height:44px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:50px;color:rgba(255,255,255,.6);font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;'>📏 Registrar mis medidas</button></div>";

    if(medidas.length){
      html += "<div style='padding:0 20px 16px;overflow-x:auto;'><table class='medidas-tabla'><tr><th>Fecha</th><th>Cintura</th><th>Cadera</th><th>Brazo</th><th>Muslo</th></tr>";
      medidas.slice(-4).forEach(function(m){
        html += "<tr><td>" + m.fecha + "</td><td>" + m.cintura + "</td><td>" + m.cadera + "</td><td>" + m.brazo_der + "</td><td>" + m.muslo_der + "</td></tr>";
      });
      html += "</table></div>";
    }

    // ── FitScore historial (7 días) ──
    if(window.calcularFitScore){
      var fsHist = window.db.getFitScoreHistorial(alumno.id, 7);
      var maxFs = Math.max.apply(null, fsHist.map(function(x){ return x.score||0; }).concat([100]));
      html += "<div style='padding:0 20px 16px;'>" +
        "<div style='font-size:18px;font-weight:700;margin-bottom:14px;'>FitScore — últimos 7 días</div>" +
        "<div style='background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;'>" +
          "<div style='display:flex;align-items:flex-end;justify-content:space-between;gap:6px;height:80px;'>";
      var diasLabels = ["L","M","X","J","V","S","D"];
      fsHist.forEach(function(d, i){
        var sc = d.score || 0;
        var h  = maxFs > 0 ? Math.round(sc/maxFs*70) : 0;
        var dObj = new Date(d.fecha + "T12:00:00");
        var label = diasLabels[(dObj.getDay()+6)%7];
        var isToday = d.fecha === window.db.fechaHoy();
        html += "<div style='flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;'>" +
          "<div style='font-size:10px;font-weight:700;color:var(--text-muted);'>" + (sc||"-") + "</div>" +
          "<div style='width:100%;height:" + h + "px;background:" + (isToday?"var(--accent)":"rgba(200,224,0,0.3)") + ";border-radius:4px 4px 0 0;min-height:4px;'></div>" +
          "<div style='font-size:10px;color:var(--text-muted);font-weight:600;'>" + label + "</div>" +
        "</div>";
      });
      html += "</div></div></div>";
    }

    // ── Logros (expandidos con LOGROS_DEF) ──
    var logrosDef = window.LOGROS_DEF || [];
    var desbloqueadas = window.db.getMedallas(alumno.id);
    html += "<div style='padding:0 20px 10px;'>" +
      "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;'>" +
        "<div style='font-size:18px;font-weight:700;'>Logros</div>" +
        "<div style='font-size:12px;color:var(--accent);font-weight:700;'>" + desbloqueadas.length + " desbloqueados</div>" +
      "</div>" +
    "</div>";

    // Logros nuevos (fitscore.js)
    if(logrosDef.length){
      html += "<div class='logros-grid' style='margin-bottom:8px;'>";
      logrosDef.forEach(function(l){
        var ok = desbloqueadas.indexOf(l.id) !== -1;
        html += "<div class='logro-badge " + (ok?"unlocked":"locked") + "' title='" + l.desc + "'>" +
          "<div class='lb-icon'>" + l.icono + "</div>" +
          "<div class='lb-name'>" + l.nombre + "</div>" +
        "</div>";
      });
      html += "</div>";
    } else {
      // Medallas originales
      html += "<div class='medallas-grid'>" + renderMedallas(alumno.id) + "</div>";
    }

    html += "<div style='height:20px;'></div></div>";

    document.getElementById("page-evolucion").innerHTML = html;

    renderGraficaTradingPeso("grafica-peso", pesos);

    document.getElementById("btn-ir-fotos-evo").addEventListener("click", function(){ window.irAPagina("fotos"); });

    var btnPeso = document.getElementById("btn-registrar-peso");
    if(btnPeso) btnPeso.addEventListener("click", function(){
      var val = (document.getElementById("peso-input")||{}).value;
      if(!val) return;
      window.db.savePeso(alumno.id, { fecha:hoyKey, kg:parseFloat(val) });
      window.mostrarToast("Peso registrado: " + val + " kg");
      window.init_evolucion();
    });

    document.getElementById("btn-medidas").addEventListener("click", function(){ abrirModalMedidas(alumno.id); });
  };

  function chip(val, label){
    return '<div style="background:#141414;border-radius:14px;padding:16px;border:1px solid rgba(255,255,255,.06);">' +
      '<div style="font-size:22px;font-weight:800;color:#C8E000;letter-spacing:-.5px;">' + val + '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,.35);margin-top:3px;">' + label + '</div>' +
    '</div>';
  }

  function abrirModalMedidas(alumnoId){
    var campos = ["cuello","pecho","cintura","cadera","brazo_izq","brazo_der","muslo_izq","muslo_der","pantorrilla"];
    var labels  = ["Cuello","Pecho","Cintura","Cadera","Brazo izq.","Brazo der.","Muslo izq.","Muslo der.","Pantorrilla"];
    var modal = document.createElement("div");
    modal.className = "modal-celebracion";
    var inputs = campos.map(function(c,i){
      return '<div style="margin-bottom:10px;text-align:left;"><label style="font-size:12px;color:rgba(255,255,255,.4);">' + labels[i] + ' (cm)</label>' +
        '<input type="number" step="0.1" data-campo="' + c + '" style="width:100%;height:44px;margin-top:4px;background:#1C1C1C;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:0 12px;color:#FFF;font-size:15px;font-family:inherit;"></div>';
    }).join("");
    modal.innerHTML =
      '<div class="mc-card" style="max-height:80vh;overflow-y:auto;text-align:left;">' +
        '<h2 style="text-align:center;margin-bottom:16px;">📏 Mis medidas</h2>' +
        inputs +
        '<button class="pill-btn" id="guardar-medidas" style="margin-top:10px;">Guardar medidas</button>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });

    document.getElementById("guardar-medidas").addEventListener("click", function(){
      var data = { fecha:window.db.fechaHoy() };
      modal.querySelectorAll("[data-campo]").forEach(function(inp){ data[inp.getAttribute("data-campo")] = parseFloat(inp.value)||0; });
      window.db.saveMedidas(alumnoId, data);
      var nuevas = window.db.checkMedallas(alumnoId);
      modal.remove();
      window.mostrarToast("Medidas guardadas");
      window.mostrarMedallasNuevas(nuevas);
      window.init_evolucion();
    });
  }
})();

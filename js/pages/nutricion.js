// ════════════════════════════════════════════════════════════
// nutricion.js — Nutrición dark: semana, macros, agua, historial
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  var DIAS_SEMANA = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

  // Índice 0=Lun … 6=Dom (igual que el resto de la app)
  function diaIdxHoy(){ return (new Date().getDay() + 6) % 7; }

  function padZ(n){ return n < 10 ? "0" + n : n; }

  function fechaDia(offsetDesdeHoy){
    var d = new Date();
    d.setDate(d.getDate() + offsetDesdeHoy);
    return d.getFullYear() + "-" + padZ(d.getMonth()+1) + "-" + padZ(d.getDate());
  }

  // Genera el array de 7 fechas: Mon…Sun de la semana actual
  function semanaActual(){
    var hoy = new Date();
    var diaSemana = (hoy.getDay() + 6) % 7; // 0=Lun
    var semana = [];
    for (var i = 0; i < 7; i++){
      var d = new Date(hoy);
      d.setDate(hoy.getDate() - diaSemana + i);
      semana.push(d.getFullYear() + "-" + padZ(d.getMonth()+1) + "-" + padZ(d.getDate()));
    }
    return semana;
  }

  // ── BARRA DE MACRO ──────────────────────────────────────
  function macroBar(label, actual, objetivo, color){
    var pct = objetivo > 0 ? Math.min(100, Math.round(actual / objetivo * 100)) : 0;
    return '<div class="macro-bar-row">' +
      '<div class="mbr-head">' +
        '<span class="mbr-label">' + label + '</span>' +
        '<span class="mbr-val"><span style="color:var(--text);font-weight:700;">' + Math.round(actual) + '</span> / ' + objetivo + ' g</span>' +
        '<span class="mbr-pct" style="color:' + color + ';">' + pct + '%</span>' +
      '</div>' +
      '<div class="mbr-track"><div class="mbr-fill" style="width:' + pct + '%;background:' + color + ';"></div></div>' +
    '</div>';
  }

  // ── ANILLO GRANDE CALORÍAS ──────────────────────────────
  function anilloKcal(actual, objetivo){
    var pct = objetivo > 0 ? Math.min(100, actual / objetivo * 100) : 0;
    var R = 52, C = 2 * Math.PI * R;
    var off = C - (pct / 100) * C;
    return '<svg width="130" height="130" viewBox="0 0 130 130">' +
      '<circle cx="65" cy="65" r="' + R + '" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="10"/>' +
      '<circle cx="65" cy="65" r="' + R + '" fill="none" stroke="#C8E000" stroke-width="10"' +
        ' stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"' +
        ' stroke-linecap="round" transform="rotate(-90 65 65)"/>' +
      '<text x="65" y="60" text-anchor="middle" font-size="22" font-weight="800" fill="#C8E000" font-family="Inter,-apple-system,sans-serif">' + Math.round(pct) + '%</text>' +
      '<text x="65" y="78" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.35)" font-family="Inter,-apple-system,sans-serif">del objetivo</text>' +
    '</svg>';
  }

  // ── COMIDA BLOQUE ───────────────────────────────────────
  function comidaHTML(comida, ci, opcionElegida, estado, alumnoId, hoyKey){
    var elegida = opcionElegida;
    var html = '<div class="nutri-comida-blk">' +
      '<div class="ncb-head">' +
        '<div class="ncb-icon">' + (comida.icono || "🍽️") + '</div>' +
        '<div class="ncb-info"><div class="ncb-nombre">' + comida.nombre + '</div>' +
          (comida.descripcion ? '<div class="ncb-desc">' + comida.descripcion + '</div>' : '') +
        '</div>' +
        (elegida ? '<div class="ncb-kcal">' + (elegida.calorias_total || 0) + ' kcal</div>' : '') +
      '</div>';

    if(comida.opciones && comida.opciones.length > 1){
      html += '<div class="opciones-scroll">';
      comida.opciones.forEach(function(op, oi){
        var sel = estado.opciones[ci] === oi;
        html += '<div class="opcion-pill' + (sel ? " sel" : "") + '" onclick="window._elegirOpcion(' + ci + ',' + oi + ')">' + op.nombre + '</div>';
      });
      html += '</div>';
    }

    if(elegida){
      html += '<div class="alimentos-lista">';
      elegida.alimentos.forEach(function(a, ai){
        var key = ci + "_" + ai;
        var reemplazo = estado.reemplazos && estado.reemplazos[key];
        var comido = estado.comidos && estado.comidos[key] !== false;
        html += '<div class="ali-row' + (reemplazo ? " reemplazado" : "") + '">' +
          '<button class="ali-check' + (comido && !reemplazo ? " done" : "") + '" onclick="window._toggleComido(' + ci + ',' + ai + ')">' +
            (comido && !reemplazo ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
          '</button>' +
          '<div class="ali-body">' +
            '<div class="ali-nombre">' + a.cantidad + ' ' + a.nombre + '</div>' +
            (reemplazo ? '<div class="ali-reemplazo">🔄 ' + reemplazo.nombre + '</div>' : '') +
          '</div>' +
          '<div class="ali-kcal">' + a.calorias + '</div>' +
          '<button class="ali-swap-btn" onclick="window._abrirReemplazo(' + ci + ',' + ai + ')" title="Reemplazar">🔄</button>' +
        '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  // ── ESTADO COMPARTIDO ────────────────────────────────────
  var _alumno, _plan, _diasFecha, _diaSelIdx, _estado;

  window._elegirOpcion = function(ci, oi){
    _estado.opciones[ci] = oi;
    window.db.saveNutricion(_alumno.id, _diasFecha[_diaSelIdx], _estado);
    window.init_nutricion();
  };

  window._toggleComido = function(ci, ai){
    if(!_estado.comidos) _estado.comidos = {};
    var key = ci + "_" + ai;
    if(_estado.reemplazos && _estado.reemplazos[key]) return;
    _estado.comidos[key] = _estado.comidos[key] === false ? true : false;
    window.db.saveNutricion(_alumno.id, _diasFecha[_diaSelIdx], _estado);
    window.init_nutricion();
  };

  window._abrirReemplazo = function(ci, ai){
    var key = ci + "_" + ai;
    var actual = (_estado.reemplazos && _estado.reemplazos[key]) || { nombre:"", motivo:"" };
    var modal = document.createElement("div");
    modal.className = "modal-celebracion";
    modal.innerHTML =
      '<div class="mc-card" style="text-align:left;">' +
        '<h2 style="text-align:center;margin-bottom:16px;">🔄 ¿Qué comiste en su lugar?</h2>' +
        '<label style="font-size:12px;color:rgba(255,255,255,.4);">Alimento</label>' +
        '<input id="remp-nombre" value="' + actual.nombre + '" style="width:100%;height:44px;background:#1C1C1C;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:0 12px;color:#FFF;font-size:15px;font-family:inherit;margin:6px 0 12px;">' +
        '<label style="font-size:12px;color:rgba(255,255,255,.4);">Motivo (opcional)</label>' +
        '<input id="remp-motivo" value="' + (actual.motivo||"") + '" style="width:100%;height:44px;background:#1C1C1C;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:0 12px;color:#FFF;font-size:15px;font-family:inherit;margin:6px 0 16px;">' +
        '<button class="pill-btn" id="remp-guardar">Guardar</button>' +
        ((_estado.reemplazos && _estado.reemplazos[key]) ? '<button style="width:100%;margin-top:8px;height:44px;background:none;border:1px solid rgba(255,69,58,.3);color:#FF453A;border-radius:50px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;" id="remp-quitar">Quitar reemplazo</button>' : '') +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });
    document.getElementById("remp-guardar").addEventListener("click", function(){
      var nombre = document.getElementById("remp-nombre").value.trim();
      if(!nombre) return;
      if(!_estado.reemplazos) _estado.reemplazos = {};
      _estado.reemplazos[key] = { nombre:nombre, motivo:document.getElementById("remp-motivo").value.trim() };
      window.db.saveNutricion(_alumno.id, _diasFecha[_diaSelIdx], _estado);
      modal.remove();
      window.init_nutricion();
    });
    var qb = document.getElementById("remp-quitar");
    if(qb) qb.addEventListener("click", function(){
      delete _estado.reemplazos[key];
      window.db.saveNutricion(_alumno.id, _diasFecha[_diaSelIdx], _estado);
      modal.remove();
      window.init_nutricion();
    });
  };

  // ── INIT ────────────────────────────────────────────────
  window.init_nutricion = function(){
    var header = document.getElementById("app-header");
    header.innerHTML =
      "<div class='ah-top'><div></div><div class='ah-icons'></div></div>" +
      "<div class='ah-subtitle'>Plan alimentario</div>" +
      "<div class='ah-title'>Nutrición</div>";

    _alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    _plan   = window.db.getPlanPorId(_alumno.plan_alimentacion_id);
    _diasFecha = semanaActual();

    if(_diaSelIdx === undefined || _diaSelIdx === null) _diaSelIdx = diaIdxHoy();

    var fechaSel = _diasFecha[_diaSelIdx];
    _estado = window.db.getNutricion(_alumno.id, fechaSel);
    if(!_estado.opciones)   _estado.opciones   = {};
    if(!_estado.comidos)    _estado.comidos    = {};
    if(!_estado.reemplazos) _estado.reemplazos = {};
    if(!_estado.extras)     _estado.extras     = [];
    if(typeof _estado.agua !== "number") _estado.agua = 0;

    if(!_plan){
      document.getElementById("page-nutricion").innerHTML =
        '<div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,.3);">Tu coach aún no ha asignado un plan de alimentación.</div>';
      return;
    }

    // Calcular totales del día seleccionado
    var totKcal=0, totProt=0, totCarb=0, totGrasa=0;
    _plan.comidas.forEach(function(comida, ci){
      var opIdx = _estado.opciones[ci] || 0;
      var op = comida.opciones[opIdx];
      if(op) op.alimentos.forEach(function(a, ai){
        var key = ci + "_" + ai;
        if(_estado.comidos[key] === false) return;
        if(_estado.reemplazos[key]) return;
        totKcal  += (a.calorias  || 0);
        totProt  += (a.proteina  || 0);
        totCarb  += (a.carbos    || 0);
        totGrasa += (a.grasas    || 0);
      });
    });
    _estado.extras.forEach(function(ex){
      totKcal  += (ex.calorias  || 0);
      totProt  += (ex.proteina  || 0);
      totCarb  += (ex.carbos    || 0);
      totGrasa += (ex.grasas    || 0);
    });

    var obj = _plan.calorias_objetivo || 2000;
    var mac = _plan.macros || { proteina:150, carbohidratos:200, grasas:65 };

    var html = '<div style="padding-top:4px;">';

    // ── Selector de día de la semana ──
    var hoyIdx = diaIdxHoy();
    html += '<div class="semana-selector">';
    DIAS_SEMANA.forEach(function(d, i){
      var isHoy = (i === hoyIdx);
      var isSel = (i === _diaSelIdx);
      html += '<button class="sd-btn' + (isSel ? " sel" : "") + '" onclick="window._selDia(' + i + ')">' +
        '<span class="sd-dia">' + d + '</span>' +
        (isHoy ? '<span class="sd-dot"></span>' : '') +
      '</button>';
    });
    html += '</div>';

    // ── Resumen de calorías ──
    html += '<div class="nutri-resumen-card">' +
      '<div>' +
        '<div class="nutri-kcal-big">' + Math.round(totKcal) + '</div>' +
        '<div class="nutri-kcal-obj">/ ' + obj + ' kcal</div>' +
        '<div class="nutri-macros-bars">' +
          macroBar("Proteína",      totProt,  mac.proteina,        "#C8E000") +
          macroBar("Carbohidratos", totCarb,  mac.carbohidratos,   "#34C759") +
          macroBar("Grasas",        totGrasa, mac.grasas,          "#0A84FF") +
        '</div>' +
      '</div>' +
      '<div style="flex-shrink:0;">' + anilloKcal(totKcal, obj) + '</div>' +
    '</div>';

    // ── Anillo 3 colores macros (PARTE 2B) ──
    var macTotal = totProt + totCarb + totGrasa;
    if(macTotal > 0){
      var cProt = "#0A84FF", cCarbs = "#FF9F0A", cGras = "#BF5AF2";
      var R2 = 46, CX2 = 60, CY2 = 60, stroke2 = 10;
      var circ2 = 2 * Math.PI * R2;
      var arcProt  = (totProt  / macTotal) * circ2;
      var arcCarbs = (totCarb  / macTotal) * circ2;
      var arcGras  = (totGrasa / macTotal) * circ2;
      var offProt  = circ2 - arcProt;
      var offCarbs = circ2 - arcCarbs;
      var offGras  = circ2 - arcGras;
      var rotProt  = -90;
      var rotCarbs = -90 + (totProt  / macTotal) * 360;
      var rotGras  = rotCarbs + (totCarb / macTotal) * 360;
      html += '<div style="background:#141414;border-radius:18px;margin:0 16px 16px;padding:18px;display:flex;align-items:center;gap:20px;border:1px solid rgba(255,255,255,0.05);">' +
        '<svg width="120" height="120" viewBox="0 0 120 120" style="flex-shrink:0;">' +
          '<circle cx="'+CX2+'" cy="'+CY2+'" r="'+R2+'" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="'+stroke2+'"/>' +
          '<circle cx="'+CX2+'" cy="'+CY2+'" r="'+R2+'" fill="none" stroke="'+cProt+'" stroke-width="'+stroke2+'" stroke-dasharray="'+circ2.toFixed(1)+'" stroke-dashoffset="'+offProt.toFixed(1)+'" transform="rotate('+rotProt+' '+CX2+' '+CY2+')" stroke-linecap="butt"/>' +
          '<circle cx="'+CX2+'" cy="'+CY2+'" r="'+R2+'" fill="none" stroke="'+cCarbs+'" stroke-width="'+stroke2+'" stroke-dasharray="'+circ2.toFixed(1)+'" stroke-dashoffset="'+offCarbs.toFixed(1)+'" transform="rotate('+rotCarbs+' '+CX2+' '+CY2+')" stroke-linecap="butt"/>' +
          '<circle cx="'+CX2+'" cy="'+CY2+'" r="'+R2+'" fill="none" stroke="'+cGras+'" stroke-width="'+stroke2+'" stroke-dasharray="'+circ2.toFixed(1)+'" stroke-dashoffset="'+offGras.toFixed(1)+'" transform="rotate('+rotGras+' '+CX2+' '+CY2+')" stroke-linecap="butt"/>' +
          '<text x="'+CX2+'" y="'+CY2+'" text-anchor="middle" dominant-baseline="middle" font-family="Inter,sans-serif" font-size="13" font-weight="800" fill="#FFF">' + Math.round(macTotal) + 'g</text>' +
        '</svg>' +
        '<div style="display:flex;flex-direction:column;gap:8px;">' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:50%;background:'+cProt+';display:block;flex-shrink:0;"></span><span style="font-size:13px;color:rgba(255,255,255,0.7);">Proteína <strong style="color:#FFF;">' + totProt.toFixed(0) + 'g</strong></span></div>' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:50%;background:'+cCarbs+';display:block;flex-shrink:0;"></span><span style="font-size:13px;color:rgba(255,255,255,0.7);">Carbos <strong style="color:#FFF;">' + totCarb.toFixed(0) + 'g</strong></span></div>' +
          '<div style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:50%;background:'+cGras+';display:block;flex-shrink:0;"></span><span style="font-size:13px;color:rgba(255,255,255,0.7);">Grasas <strong style="color:#FFF;">' + totGrasa.toFixed(0) + 'g</strong></span></div>' +
        '</div>' +
      '</div>';
    }

    // ── Comidas del día ──
    _plan.comidas.forEach(function(comida, ci){
      var opIdx = _estado.opciones[ci] || 0;
      var op = comida.opciones[opIdx];
      html += comidaHTML(comida, ci, op, _estado, _alumno.id, fechaSel);
    });

    // ── Comidas registradas con foto ──
    if(_estado.extras.length){
      html += '<div class="nutri-comida-blk"><div class="ncb-head"><div class="ncb-icon">📷</div><div class="ncb-info"><div class="ncb-nombre">Registradas con foto</div></div></div><div class="alimentos-lista">';
      _estado.extras.forEach(function(ex, exi){
        html += '<div class="ali-row">' +
          (ex.foto ? '<img src="' + ex.foto + '" style="width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0;">' : '<div class="ali-check done"></div>') +
          '<div class="ali-body"><div class="ali-nombre">' + (ex.icono||"") + ' ' + ex.nombre + '</div></div>' +
          '<div class="ali-kcal">' + ex.calorias + '</div>' +
          '<button class="ali-swap-btn" onclick="window._quitarExtra(' + exi + ')" title="Quitar">✕</button>' +
        '</div>';
      });
      html += '</div></div>';
    }

    // ── Hidratación ──
    html += '<div style="padding:0 16px 4px;"><div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:10px;">Hidratación 💧</div>';
    html += '<div class="agua-row">';
    for(var i=0; i<8; i++){
      html += '<button class="agua-vaso' + (i < _estado.agua ? " full" : "") + '" onclick="window._toggleAgua(' + i + ')"></button>';
    }
    html += '</div>';
    html += '<div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:6px;">' + _estado.agua + '/8 vasos completados</div></div>';

    // ── Food Vision AI ──
    var apiKey = window.db.getOpenAIKey();
    html += '<div style="padding:12px 16px 4px;">';
    html += '<button class="food-scan-btn" id="btn-scan-ia">' +
      '<span style="font-size:22px;">🤖</span>' +
      '<span>Escanear comida con IA</span>' +
      '<span style="font-size:11px;background:rgba(200,224,0,0.15);color:var(--accent);border-radius:99px;padding:3px 8px;font-weight:700;">IA</span>' +
    '</button>';

    // Scans del día
    var scansHoy = window.db.getFoodScans(_alumno.id, fechaSel);
    if(scansHoy.length){
      html += '<div style="margin-top:12px;">';
      scansHoy.forEach(function(sc, si){
        html += '<div class="scan-result-card" style="margin-bottom:10px;">' +
          '<div class="scan-result-hero">' +
            (sc.foto_preview ? '<img src="' + sc.foto_preview + '" class="scan-img-preview">' : '') +
            '<div style="display:flex;align-items:center;justify-content:space-between;">' +
              '<div class="scan-ns-badge">' +
                '<div class="scan-ns-num">' + (sc.nutrition_score||0) + '</div>' +
                '<div class="scan-ns-txt">Nutrition<br>Score</div>' +
              '</div>' +
              '<div style="text-align:right;">' +
                '<div style="font-size:22px;font-weight:900;color:var(--text);">' + (sc.calorias||0) + '</div>' +
                '<div style="font-size:11px;color:var(--text-muted);">kcal</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="scan-macro-grid">' +
            '<div class="scan-macro-item"><div class="scan-macro-val" style="color:var(--blue);">' + (sc.proteinas||0) + 'g</div><div class="scan-macro-name">Prot.</div></div>' +
            '<div class="scan-macro-item"><div class="scan-macro-val" style="color:var(--orange);">' + (sc.carbos||0) + 'g</div><div class="scan-macro-name">Carbos</div></div>' +
            '<div class="scan-macro-item"><div class="scan-macro-val" style="color:var(--purple);">' + (sc.grasas||0) + 'g</div><div class="scan-macro-name">Grasas</div></div>' +
            '<div class="scan-macro-item"><div class="scan-macro-val" style="color:var(--green);">' + (sc.fibra||0) + 'g</div><div class="scan-macro-name">Fibra</div></div>' +
          '</div>' +
          '<div class="scan-analysis-text">' + (sc.analisis||"") + '</div>' +
          '<div class="scan-alimentos-list">' +
            (sc.alimentos||[]).map(function(a){ return '<span class="scan-alimento-chip">' + a + '</span>'; }).join('') +
            '<button onclick="window._eliminarScan(\'' + fechaSel + '\',' + si + ')" style="background:none;border:none;color:var(--text-muted);font-size:11px;cursor:pointer;margin-left:8px;">✕ quitar</button>' +
          '</div>' +
        '</div>';
      });
      html += '</div>';
    }
    html += '</div>';

    // ── Registrar con foto ──
    html += '<div style="padding:8px 16px 4px;">' +
      '<button id="btn-foto-comida" style="width:100%;height:46px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:50px;color:rgba(255,255,255,.6);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">📷 Registrar comida manual con foto</button>' +
      '<input type="file" accept="image/*" capture="environment" id="comida-foto-input" style="display:none;">' +
      '<input type="file" accept="image/*" capture="environment" id="ia-foto-input" style="display:none;">' +
    '</div>';

    html += '<div style="height:20px;"></div></div>';
    document.getElementById("page-nutricion").innerHTML = html;

    // Eventos agua
    // (usados con onclick="window._toggleAgua(i)" inline)

    // Foto
    document.getElementById("btn-foto-comida").addEventListener("click", function(){
      document.getElementById("comida-foto-input").click();
    });
    document.getElementById("comida-foto-input").addEventListener("change", function(e){
      var file = e.target.files[0];
      if(!file) return;
      var reader = new FileReader();
      reader.onload = function(ev){
        var img = new Image();
        img.onload = function(){
          var ratio = Math.min(1, 320/img.width);
          var canvas = document.createElement("canvas");
          canvas.width = img.width*ratio; canvas.height = img.height*ratio;
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          abrirSelectorRapido(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    // AI scan: siempre IA. Si no hay key → modal para ingresarla primero
    var btnScanIA = document.getElementById("btn-scan-ia");
    if(btnScanIA){
      btnScanIA.addEventListener("click", function(){
        var k = window.db.getOpenAIKey();
        if(!k){
          _mostrarModalApiKey(function(){
            document.getElementById("ia-foto-input").click();
          });
          return;
        }
        document.getElementById("ia-foto-input").click();
      });
    }
    var iaFotoInput = document.getElementById("ia-foto-input");
    if(iaFotoInput){
      iaFotoInput.addEventListener("change", function(e){
        var file = e.target.files[0];
        if(!file) return;
        _procesarFoodScanIA(file);
      });
    }
  };

  // ── MODAL PARA INGRESAR API KEY ─────────────────────────
  function _mostrarModalApiKey(onGuardado){
    var overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:flex-end;";
    overlay.innerHTML =
      '<div style="background:#111;border-radius:26px 26px 0 0;padding:28px 24px 40px;width:100%;border-top:1px solid rgba(255,255,255,0.1);">' +
        '<div style="width:36px;height:4px;background:rgba(255,255,255,0.2);border-radius:99px;margin:0 auto 24px;"></div>' +
        '<div style="font-size:20px;font-weight:800;margin-bottom:6px;">Configurar análisis IA</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px;line-height:1.5;">Necesitas una API Key de OpenAI para analizar fotos de comida. Se guarda solo en tu dispositivo.</div>' +
        '<input id="modal-api-key-input" type="password" placeholder="sk-..." autocomplete="off" style="width:100%;height:52px;background:#1C1C1C;border:1.5px solid rgba(255,255,255,0.12);border-radius:14px;padding:0 16px;color:#FFF;font-size:15px;font-family:inherit;outline:none;box-sizing:border-box;">' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin:10px 0 20px;line-height:1.5;">Obtén tu key en <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" style="color:#C8E000;font-weight:600;text-decoration:none;">platform.openai.com → API Keys</a> · Crea cuenta gratis y genera una clave</div>' +
        '<button id="modal-api-key-save" style="width:100%;height:54px;background:#C8E000;color:#1C1C1E;border:none;border-radius:99px;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;">Guardar y escanear</button>' +
        '<button id="modal-api-key-cancel" style="width:100%;height:44px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:14px;font-family:inherit;cursor:pointer;margin-top:8px;">Cancelar</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector("#modal-api-key-cancel").addEventListener("click", function(){ overlay.remove(); });
    overlay.querySelector("#modal-api-key-save").addEventListener("click", function(){
      var v = (overlay.querySelector("#modal-api-key-input").value || "").trim();
      if(!v || !v.startsWith("sk-")){ window.mostrarToast("⚠️ Introduce una API Key válida (empieza con sk-)"); return; }
      window.db.saveOpenAIKey(v);
      overlay.remove();
      window.mostrarToast("✅ API Key guardada");
      if(onGuardado) onGuardado();
    });
  }

  // ── FOOD VISION AI ───────────────────────────────────────
  function _procesarFoodScanIA(file){
    var apiKey = window.db.getOpenAIKey();

    // Análisis IA real
    var btnIA = document.getElementById("btn-scan-ia");
    if(btnIA){ btnIA.innerHTML = '<span class="ai-scanning">🤖</span> Analizando con IA...'; btnIA.disabled = true; }

    var reader = new FileReader();
    reader.onload = function(ev){
      var base64 = ev.target.result.split(",")[1];
      var previewUrl = ev.target.result;

      var payload = {
        model: "gpt-4o-mini",
        max_tokens: 600,
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analiza esta comida. Responde SOLO con JSON válido, sin markdown, con este formato exacto: {\"alimentos\":[\"nombre1\",\"nombre2\"],\"calorias\":numero,\"proteinas\":numero,\"carbos\":numero,\"grasas\":numero,\"fibra\":numero,\"nutrition_score\":numero_entre_0_y_100,\"analisis\":\"texto motivacional breve en español sobre el valor nutricional de esta comida (max 80 palabras)\"}" },
            { type: "image_url", image_url: { url: "data:image/jpeg;base64," + base64, detail: "low" } }
          ]
        }]
      };

      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
        body: JSON.stringify(payload)
      })
      .then(function(r){ return r.json(); })
      .then(function(data){
        var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if(!content) throw new Error("Sin respuesta");
        var result = JSON.parse(content.trim());
        result.fecha = _diasFecha[_diaSelIdx];
        result.foto_preview = previewUrl;
        result.id = "scan_" + Date.now();
        window.db.saveFoodScan(_alumno.id, result);
        window.checkLogros && window.checkLogros(_alumno.id);
        window.mostrarToast("✅ Comida analizada · " + (result.calorias||0) + " kcal");
        window.init_nutricion();
      })
      .catch(function(err){
        console.error("Food Vision AI error:", err);
        window.mostrarToast("❌ Error al analizar. Verifica tu API Key en Perfil.");
        if(btnIA){ btnIA.innerHTML = '<span>🤖</span> Escanear comida con IA'; btnIA.disabled = false; }
      });
    };
    reader.readAsDataURL(file);
  }

  window._eliminarScan = function(fecha, idx){
    var scans = window.db.getFoodScans(_alumno.id, fecha);
    scans.splice(idx, 1);
    try{ localStorage.setItem("fitapp_food_scans_" + _alumno.id + "_" + fecha, JSON.stringify(scans)); }catch(e){}
    window.init_nutricion();
  };

  window._selDia = function(idx){
    _diaSelIdx = idx;
    window.init_nutricion();
  };

  window._toggleAgua = function(i){
    _estado.agua = (_estado.agua === i+1) ? i : i+1;
    window.db.saveNutricion(_alumno.id, _diasFecha[_diaSelIdx], _estado);
    window.init_nutricion();
  };

  window._quitarExtra = function(exi){
    _estado.extras.splice(exi, 1);
    window.db.saveNutricion(_alumno.id, _diasFecha[_diaSelIdx], _estado);
    window.init_nutricion();
  };

  var PROMPT_ESCANER_ESTRICTO =
    "Eres un nutricionista experto en análisis visual de alimentos. Analiza ESTA imagen y detecta ABSOLUTAMENTE TODOS los componentes de comida que puedas ver, incluyendo guarniciones, salsas, bebidas, postres y cualquier alimento adicional separado. " +
    "Para CADA componente individual devuelve: nombre en español, porción estimada, calorías, proteína en gramos, carbohidratos en gramos y grasas en gramos. " +
    "NO omitas ningún componente visible. NO combines alimentos distintos en uno solo. " +
    "Responde ÚNICAMENTE con un array JSON válido sin texto extra, sin markdown, sin comentarios. " +
    "Formato exacto: [{\"nombre\":\"Arroz cocido\",\"porcion\":\"150g\",\"calorias\":195,\"proteina\":4,\"carbos\":43,\"grasas\":0}]";

  function abrirSelectorRapido(fotoDataUrl){
    var apiKey = localStorage.getItem("fitapp_claude_api_key") || "";
    if(!apiKey){
      apiKey = prompt("Ingresa tu API key de Anthropic para el escáner de IA:\n(Se guarda solo en tu dispositivo)") || "";
      if(apiKey) localStorage.setItem("fitapp_claude_api_key", apiKey.trim());
    }

    var modal = document.createElement("div");
    modal.className = "modal-celebracion";
    modal.innerHTML =
      '<div class="mc-card" style="text-align:left;max-height:85vh;overflow-y:auto;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
          '<h2 style="margin:0;">Escáner IA</h2>' +
          '<button id="btn-cerrar-escaner" style="background:none;border:none;color:rgba(255,255,255,.4);font-size:22px;cursor:pointer;line-height:1;">×</button>' +
        '</div>' +
        '<img src="' + fotoDataUrl + '" style="width:100%;border-radius:12px;margin-bottom:14px;max-height:220px;object-fit:cover;">' +
        '<div id="escaner-resultado">' +
          '<div style="text-align:center;padding:24px 0;">' +
            '<div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:8px;">Analizando tu comida con IA...</div>' +
            '<div style="width:36px;height:36px;border:3px solid rgba(200,224,0,.2);border-top-color:#C8E000;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;"></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    if(!document.getElementById("spin-style")){
      var s = document.createElement("style");
      s.id = "spin-style";
      s.textContent = "@keyframes spin{to{transform:rotate(360deg)}}";
      document.head.appendChild(s);
    }

    document.body.appendChild(modal);
    document.getElementById("btn-cerrar-escaner").addEventListener("click", function(){ modal.remove(); });

    if(!apiKey){
      document.getElementById("escaner-resultado").innerHTML =
        '<p style="color:#FF453A;font-size:13px;text-align:center;">Sin API key. Toca el botón de foto otra vez para ingresarla.</p>';
      return;
    }

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: fotoDataUrl.replace(/^data:image\/jpeg;base64,/, "") } },
            { type: "text", text: PROMPT_ESCANER_ESTRICTO }
          ]
        }]
      })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      var texto = (data.content && data.content[0] && data.content[0].text) || "";
      var match = texto.match(/\[[\s\S]*\]/);
      if(!match) throw new Error("Sin JSON en respuesta");
      var alimentos = JSON.parse(match[0]);
      if(!alimentos.length) throw new Error("Array vacío");

      var checks = alimentos.map(function(_, i){ return true; });

      function renderResultado(){
        var html = '<div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">Detectados · ' + alimentos.length + ' componentes</div>';
        alimentos.forEach(function(al, i){
          html += '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:.5px solid rgba(255,255,255,.05);">' +
            '<input type="checkbox" id="al-chk-' + i + '" ' + (checks[i]?"checked":"") + ' style="margin-top:3px;accent-color:#C8E000;width:18px;height:18px;flex-shrink:0;">' +
            '<div style="flex:1;">' +
              '<div style="font-size:14px;font-weight:600;color:#FFF;">' + al.nombre + '</div>' +
              '<div style="font-size:12px;color:rgba(255,255,255,.35);margin-top:2px;">' + (al.porcion||"") + ' · P:' + al.proteina + 'g C:' + al.carbos + 'g G:' + al.grasas + 'g</div>' +
            '</div>' +
            '<div style="font-size:15px;font-weight:700;color:#C8E000;">' + al.calorias + '<span style="font-size:10px;font-weight:400;color:rgba(255,255,255,.3);"> kcal</span></div>' +
          '</div>';
        });
        html += '<button id="btn-registrar-escaner" style="width:100%;height:48px;background:#C8E000;border:none;border-radius:14px;color:#1C1C1E;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;margin-top:14px;">Registrar seleccionados</button>';
        document.getElementById("escaner-resultado").innerHTML = html;

        alimentos.forEach(function(_, i){
          document.getElementById("al-chk-" + i).addEventListener("change", function(){ checks[i] = this.checked; });
        });
        document.getElementById("btn-registrar-escaner").addEventListener("click", function(){
          var registrados = 0;
          alimentos.forEach(function(al, i){
            if(!checks[i]) return;
            _estado.extras.push({ nombre:al.nombre, cantidad:al.porcion||"", calorias:al.calorias||0, proteina:al.proteina||0, carbos:al.carbos||0, grasas:al.grasas||0, icono:"📷", foto:fotoDataUrl });
            registrados++;
          });
          window.db.saveNutricion(_alumno.id, _diasFecha[_diaSelIdx], _estado);
          modal.remove();
          window.mostrarToast("✅ " + registrados + " alimento" + (registrados!==1?"s":"") + " registrado" + (registrados!==1?"s":""));
          window.init_nutricion();
        });
      }
      renderResultado();
    })
    .catch(function(err){
      document.getElementById("escaner-resultado").innerHTML =
        '<p style="color:#FF453A;font-size:13px;text-align:center;padding:16px 0;">Error al analizar: ' + (err.message||"intenta de nuevo") + '</p>' +
        '<button onclick="this.parentNode.parentNode.parentNode.remove()" style="width:100%;height:44px;background:#1C1C1C;border:1px solid rgba(255,255,255,.08);border-radius:12px;color:rgba(255,255,255,.6);font-size:14px;font-family:inherit;cursor:pointer;">Cerrar</button>';
    });
  }
})();

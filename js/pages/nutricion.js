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

    // ── Registrar con foto ──
    html += '<div style="padding:16px 16px 4px;">' +
      '<button id="btn-foto-comida" style="width:100%;height:46px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:50px;color:rgba(255,255,255,.6);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">📷 Registrar comida con foto</button>' +
      '<input type="file" accept="image/*" capture="environment" id="comida-foto-input" style="display:none;">' +
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

  function abrirSelectorRapido(fotoDataUrl){
    var comunes = window.db.ALIMENTOS_COMUNES || [];
    var modal = document.createElement("div");
    modal.className = "modal-celebracion";
    modal.innerHTML =
      '<div class="mc-card" style="text-align:left;max-height:80vh;overflow-y:auto;">' +
        '<h2 style="text-align:center;margin-bottom:12px;">¿Qué es esto?</h2>' +
        '<img src="' + fotoDataUrl + '" style="width:100%;border-radius:12px;margin-bottom:12px;">' +
        '<input id="buscar-alimento" placeholder="Buscar alimento..." style="width:100%;height:44px;background:#1C1C1C;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:0 12px;color:#FFF;font-size:15px;font-family:inherit;margin-bottom:10px;">' +
        '<div id="lista-comunes"></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });

    function renderLista(filtro){
      var f = (filtro||"").toLowerCase();
      var filtrados = comunes.filter(function(c){ return c.nombre.toLowerCase().indexOf(f) !== -1; });
      modal.querySelector("#lista-comunes").innerHTML = filtrados.map(function(c, i){
        return '<div class="ali-row" style="cursor:pointer;" data-i="' + comunes.indexOf(c) + '">' +
          '<div style="font-size:22px;">' + (c.icono||"🍽️") + '</div>' +
          '<div class="ali-body"><div class="ali-nombre">' + c.nombre + '</div><div style="font-size:11px;color:rgba(255,255,255,.3);">' + c.cantidad + '</div></div>' +
          '<div class="ali-kcal">' + c.calorias + ' kcal</div>' +
        '</div>';
      }).join("") || '<p style="color:rgba(255,255,255,.3);font-size:13px;text-align:center;padding:20px 0;">Sin resultados.</p>';
      modal.querySelectorAll(".ali-row[data-i]").forEach(function(row){
        row.addEventListener("click", function(){
          var item = comunes[parseInt(this.getAttribute("data-i"),10)];
          _estado.extras.push({ nombre:item.nombre, cantidad:item.cantidad, calorias:item.calorias, proteina:item.proteina||0, carbos:item.carbos||0, grasas:item.grasas||0, icono:item.icono||"🍽️", foto:fotoDataUrl });
          window.db.saveNutricion(_alumno.id, _diasFecha[_diaSelIdx], _estado);
          modal.remove();
          window.mostrarToast("✅ " + item.nombre + " registrado");
          window.init_nutricion();
        });
      });
    }
    renderLista("");
    modal.querySelector("#buscar-alimento").addEventListener("input", function(){ renderLista(this.value); });
  }
})();

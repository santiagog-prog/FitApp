// ════════════════════════════════════════════════════════════
// nutricion.js — Page Nutrición: plan con opciones por día, macros, agua
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  function anilloSVG(pct, color, label, gramos){
    var r = 22, c = 2*Math.PI*r;
    var off = c - (Math.min(pct,100)/100)*c;
    return "<div class='anillo-macro'>" +
      "<svg viewBox='0 0 54 54'>" +
      "<circle cx='27' cy='27' r='" + r + "' fill='none' stroke='rgba(255,255,255,.1)' stroke-width='5'></circle>" +
      "<circle cx='27' cy='27' r='" + r + "' fill='none' stroke='" + color + "' stroke-width='5' stroke-dasharray='" + c + "' stroke-dashoffset='" + off + "' transform='rotate(-90 27 27)' stroke-linecap='round'></circle>" +
      "<text x='27' y='31' text-anchor='middle' font-size='11' font-weight='700' fill='#fff'>" + Math.round(pct) + "%</text>" +
      "</svg><div class='am-label'>" + label + "</div><div class='am-g'>" + gramos + "g</div></div>";
  }

  function opcionesDelDia(comida, diaIdx){
    var conRestriccion = comida.opciones.filter(function(o){ return o.dias && o.dias.length; });
    if(conRestriccion.length === 0) return comida.opciones;
    var delDia = comida.opciones.filter(function(o){ return !o.dias || o.dias.length === 0 || o.dias.indexOf(diaIdx) !== -1; });
    return delDia.length ? delDia : comida.opciones;
  }

  window.init_nutricion = function(){
    window.renderHeaderPrincipal("Nutrición", window.iconoSVG("fork"));

    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var plan = window.db.getPlanPorId(alumno.plan_alimentacion_id);
    if(!plan){ document.getElementById("page-nutricion").innerHTML = "<p class='px'>Aún no tienes un plan asignado.</p>"; return; }

    var hoyKey = window.db.fechaHoy();
    var diaIdx = (new Date().getDay() + 6) % 7;
    var estado = window.db.getNutricion(alumno.id, hoyKey);
    if(!estado.opciones) estado.opciones = {};
    if(!estado.comidos) estado.comidos = {};
    if(!estado.reemplazos) estado.reemplazos = {};
    if(!estado.extras) estado.extras = [];
    if(typeof estado.agua !== "number") estado.agua = 0;

    var totKcal = 0, totProt = 0, totCarb = 0, totGrasa = 0;
    plan.comidas.forEach(function(comida, ci){
      var opcionesHoy = opcionesDelDia(comida, diaIdx);
      var opIdx = estado.opciones[ci];
      var op = opcionesHoy.filter(function(o,i){ return i === opIdx; })[0];
      if(op){
        op.alimentos.forEach(function(a, ai){
          var key = ci + "_" + ai;
          if(estado.reemplazos[key]) return; // sustituido: no se suma al cálculo automático
          if(estado.comidos[key] === false) return; // desmarcado explícitamente: no se cuenta
          totKcal += a.calorias; totProt += a.proteina||0; totCarb += a.carbos||0; totGrasa += a.grasas||0;
        });
      }
    });
    estado.extras.forEach(function(ex){
      totKcal += ex.calorias; totProt += ex.proteina||0; totCarb += ex.carbos||0; totGrasa += ex.grasas||0;
    });

    var html = "<div class='plan-titulo'>" + plan.nombre + "</div>";
    html += "<div class='plan-desc'><span id='plan-desc-text'>" + plan.descripcion.substr(0,90) + "...</span> <span class='ver-mas' id='plan-ver-mas'>Ver más</span></div>";

    html += "<div class='resumen-cal-card'>" +
      "<div><div class='kcal-num'>" + Math.round(totKcal) + "</div><div class='kcal-obj'>/ " + plan.calorias_objetivo + " kcal</div></div>" +
      "<div class='anillos-macros'>" +
      anilloSVG(totProt/plan.macros.proteina*100, "#4CAF50", "Proteína", Math.round(totProt)) +
      anilloSVG(totCarb/plan.macros.carbohidratos*100, "#2196F3", "Carbs", Math.round(totCarb)) +
      anilloSVG(totGrasa/plan.macros.grasas*100, "#F44336", "Grasas", totGrasa.toFixed(0)) +
      "</div></div>";

    html += "<button class='btn-escanear-comida' id='btn-foto-comida'>" + window.iconoSVG("camera") + " Escanear comida</button>";
    html += "<input type='file' accept='image/*' capture='environment' id='comida-foto-input' style='display:none;'>";

    if(estado.extras.length){
      html += "<div class='alimentos-checklist px-margin'><h3 style='padding:10px 0 0;'>Comidas registradas con foto</h3>";
      estado.extras.forEach(function(ex, exi){
        html += "<div class='alimento-check-row'>" +
          (ex.foto ? "<img class='acr-foto-thumb' src='" + ex.foto + "'>" : "<div class='acr-check checked'>✓</div>") +
          "<div class='acr-body'><div class='acr-nombre'>" + ex.icono + " " + ex.cantidad + " " + ex.nombre + "</div>" +
          "<div class='acr-reemplazo' style='color:var(--text-muted);'>" + ex.calorias + " kcal</div></div>" +
          "<button class='acr-reemplazar-btn quitar-extra' data-i='" + exi + "'>✕</button>" +
          "</div>";
      });
      html += "</div>";
    }

    plan.comidas.forEach(function(comida, ci){
      var opcionesHoy = opcionesDelDia(comida, diaIdx);
      html += "<div class='comida-bloque'><h3>" + comida.nombre + "</h3>" +
        "<div class='comida-desc'>" + comida.descripcion + "</div>" +
        "<div class='opciones-scroll'>";
      opcionesHoy.forEach(function(op, oi){
        var elegida = estado.opciones[ci] === oi;
        html += "<div class='opcion-card" + (elegida ? " elegida" : "") + "'><h4>" + op.nombre + "</h4>" +
          op.alimentos.map(function(a){ return "<div class='op-alimento'>" + a.cantidad + " " + a.nombre + "</div>"; }).join("") +
          "<div class='op-total'>" + op.calorias_total + " kcal</div>" +
          "<button class='op-elegir' data-ci='" + ci + "' data-oi='" + oi + "'>" + (elegida ? "✓ Elegida" : "Elegir") + "</button></div>";
      });
      html += "</div>";

      var opElegida = opcionesHoy.filter(function(o,i){ return i === estado.opciones[ci]; })[0];
      if(opElegida){
        html += "<div class='alimentos-checklist'>";
        opElegida.alimentos.forEach(function(a, ai){
          var key = ci + "_" + ai;
          var reemplazo = estado.reemplazos[key];
          var comido = estado.comidos[key] !== false;
          html += "<div class='alimento-check-row" + (reemplazo ? " reemplazado" : "") + "'>" +
            "<div class='acr-check" + (comido && !reemplazo ? " checked" : "") + "' data-ci='" + ci + "' data-ai='" + ai + "'>" + (comido && !reemplazo ? "✓" : "") + "</div>" +
            "<div class='acr-body'><div class='acr-nombre'>" + a.cantidad + " " + a.nombre + "</div>" +
            (reemplazo ? "<div class='acr-reemplazo'>🔄 Reemplazado por: <strong>" + reemplazo.nombre + "</strong>" + (reemplazo.motivo ? " — " + reemplazo.motivo : "") + "</div>" : "") +
            "</div>" +
            "<button class='acr-reemplazar-btn' data-ci='" + ci + "' data-ai='" + ai + "'>" + (reemplazo ? "Editar" : "🔄") + "</button>" +
            "</div>";
        });
        html += "</div>";
      }
      html += "</div>";
    });

    html += "<div class='px'><h3 style='margin-bottom:10px;'>Hidratación</h3></div>";
    html += "<div class='agua-row'>";
    for(var i=0;i<8;i++){ html += "<div class='agua-vaso" + (i < estado.agua ? " full" : "") + "' data-i='" + i + "'></div>"; }
    html += "</div>";

    html += "<div class='guardar-sticky'><button class='pill-btn' id='nutri-guardar'>Guardar</button></div>";

    document.getElementById("page-nutricion").innerHTML = html;

    document.getElementById("plan-ver-mas").addEventListener("click", function(){
      document.getElementById("plan-desc-text").textContent = plan.descripcion;
      this.style.display = "none";
    });

    document.querySelectorAll(".op-elegir").forEach(function(btn){
      btn.addEventListener("click", function(){
        var ci = this.getAttribute("data-ci"), oi = parseInt(this.getAttribute("data-oi"), 10);
        estado.opciones[ci] = oi;
        window.db.saveNutricion(alumno.id, hoyKey, estado);
        window.init_nutricion();
      });
    });

    document.querySelectorAll(".acr-check").forEach(function(chk){
      chk.addEventListener("click", function(){
        var key = this.getAttribute("data-ci") + "_" + this.getAttribute("data-ai");
        if(estado.reemplazos[key]) return;
        estado.comidos[key] = estado.comidos[key] === false ? true : false;
        window.db.saveNutricion(alumno.id, hoyKey, estado);
        window.init_nutricion();
      });
    });

    document.querySelectorAll(".acr-reemplazar-btn").forEach(function(btn){
      btn.addEventListener("click", function(){
        var ci = this.getAttribute("data-ci"), ai = this.getAttribute("data-ai");
        abrirModalReemplazo(ci, ai);
      });
    });

    function abrirModalReemplazo(ci, ai){
      var key = ci + "_" + ai;
      var actual = estado.reemplazos[key] || { nombre:"", motivo:"" };
      var modal = document.createElement("div");
      modal.className = "modal-celebracion";
      modal.innerHTML = "<div class='mc-card' style='text-align:left;'>" +
        "<h2 style='text-align:center;'>🔄 ¿Qué comiste en su lugar?</h2>" +
        "<label style='font-size:.78rem;color:var(--text-muted);'>Alimento que comiste</label>" +
        "<input id='reemplazo-nombre' value='" + actual.nombre + "' style='width:100%;padding:10px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);border-radius:8px;margin-bottom:10px;'>" +
        "<label style='font-size:.78rem;color:var(--text-muted);'>¿Por qué lo cambiaste? (opcional)</label>" +
        "<textarea id='reemplazo-motivo' rows='2' style='width:100%;padding:10px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);border-radius:8px;margin-bottom:14px;'>" + (actual.motivo||"") + "</textarea>" +
        "<div style='display:flex;gap:8px;'>" +
        (estado.reemplazos[key] ? "<button class='outline-btn' id='reemplazo-quitar' style='border-color:var(--red);color:var(--red);'>Quitar</button>" : "") +
        "<button class='pill-btn' id='reemplazo-guardar'>Guardar</button></div></div>";
      document.body.appendChild(modal);
      modal.addEventListener("click", function(e){ if(e.target === modal) modal.remove(); });

      document.getElementById("reemplazo-guardar").addEventListener("click", function(){
        var nombre = document.getElementById("reemplazo-nombre").value.trim();
        if(!nombre) return;
        estado.reemplazos[key] = { nombre: nombre, motivo: document.getElementById("reemplazo-motivo").value.trim() };
        window.db.saveNutricion(alumno.id, hoyKey, estado);
        modal.remove();
        window.init_nutricion();
      });
      var quitarBtn = document.getElementById("reemplazo-quitar");
      if(quitarBtn) quitarBtn.addEventListener("click", function(){
        delete estado.reemplazos[key];
        window.db.saveNutricion(alumno.id, hoyKey, estado);
        modal.remove();
        window.init_nutricion();
      });
    }

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
          var ratio = Math.min(1, 600 / img.width);
          var canvas = document.createElement("canvas");
          canvas.width = img.width * ratio; canvas.height = img.height * ratio;
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          var dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          var apiKey = window.db.getApiKeyAnthropic();
          if(apiKey){
            analizarConIA(dataUrl, apiKey);
          } else {
            abrirSelectorRapido(dataUrl);
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    function analizarConIA(fotoDataUrl, apiKey){
      var modal = document.createElement("div");
      modal.className = "modal-celebracion";
      modal.innerHTML = "<div class='mc-card'><div class='scan-loading'><div class='spinner'></div><p>Analizando tu plato con IA...</p></div></div>";
      document.body.appendChild(modal);

      var base64 = fotoDataUrl.split(",")[1];
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 300,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
            { type: "text", text: "Analiza esta foto de comida. Estima los valores nutricionales reales lo más preciso posible. Responde SOLO con JSON sin markdown, sin texto extra: {\"nombre_plato\":\"...\",\"calorias\":0,\"proteina_g\":0,\"carbos_g\":0,\"grasas_g\":0,\"confianza_porcentaje\":0}" }
          ]}]
        })
      }).then(function(r){
        if(!r.ok) return r.json().then(function(err){ throw new Error(err.error && err.error.message || "Error de la API"); });
        return r.json();
      }).then(function(data){
        var texto = data.content && data.content[0] && data.content[0].text || "";
        texto = texto.replace(/```json|```/g, "").trim();
        var resultado = JSON.parse(texto);
        modal.remove();
        mostrarResultadoScan(resultado, fotoDataUrl);
      }).catch(function(err){
        modal.remove();
        window.mostrarToast("No se pudo analizar con IA: " + err.message);
        abrirSelectorRapido(fotoDataUrl);
      });
    }

    function mostrarResultadoScan(r, fotoDataUrl){
      var confianza = Math.max(0, Math.min(100, r.confianza_porcentaje || 60));
      var modal = document.createElement("div");
      modal.className = "modal-celebracion";
      modal.innerHTML = "<div class='mc-card' style='text-align:left;'>" +
        "<div class='scan-result-card'>" +
        "<img src='" + fotoDataUrl + "' style='width:100%;border-radius:14px;margin-bottom:14px;'>" +
        "<h3>" + r.nombre_plato + "</h3>" +
        "<div class='macro-chips'>" +
        "<span class='macro-chip kcal'>" + r.calorias + " kcal</span>" +
        "<span class='macro-chip prot'>" + r.proteina_g + "g prot</span>" +
        "<span class='macro-chip carb'>" + r.carbos_g + "g carbs</span>" +
        "<span class='macro-chip gras'>" + r.grasas_g + "g grasas</span>" +
        "</div>" +
        "<div class='confianza-bar'><div class='fill' style='width:" + confianza + "%;'></div></div>" +
        "<div class='confianza-label'>Confianza de la estimación: " + confianza + "%</div>" +
        "<div id='scan-edit-box' style='display:none;'></div>" +
        "<div style='display:flex;gap:8px;'>" +
        "<button class='outline-btn' id='btn-editar-scan'>Editar valores</button>" +
        "<button class='pill-btn' id='btn-añadir-scan'>Añadir al registro</button></div>" +
        "<p class='scan-aviso'>Los valores son estimaciones generadas por IA. Pueden variar según la preparación real del plato.</p>" +
        "</div></div>";
      document.body.appendChild(modal);
      modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });

      document.getElementById("btn-editar-scan").addEventListener("click", function(){
        var box = document.getElementById("scan-edit-box");
        box.style.display = "block";
        box.innerHTML = "<div class='scan-edit-row'>" +
          "<div><label>Calorías</label><input id='edit-kcal' type='number' value='" + r.calorias + "'></div>" +
          "<div><label>Proteína (g)</label><input id='edit-prot' type='number' value='" + r.proteina_g + "'></div>" +
          "<div><label>Carbos (g)</label><input id='edit-carb' type='number' value='" + r.carbos_g + "'></div>" +
          "<div><label>Grasas (g)</label><input id='edit-gras' type='number' value='" + r.grasas_g + "'></div></div>";
        this.style.display = "none";
      });

      document.getElementById("btn-añadir-scan").addEventListener("click", function(){
        var editBox = document.getElementById("scan-edit-box");
        var visible = editBox.style.display === "block";
        var item = {
          nombre: r.nombre_plato, cantidad: "1 porción",
          calorias: visible ? parseInt(document.getElementById("edit-kcal").value,10)||0 : r.calorias,
          proteina: visible ? parseInt(document.getElementById("edit-prot").value,10)||0 : r.proteina_g,
          carbos: visible ? parseInt(document.getElementById("edit-carb").value,10)||0 : r.carbos_g,
          grasas: visible ? parseInt(document.getElementById("edit-gras").value,10)||0 : r.grasas_g,
          icono: "🤖", foto: fotoDataUrl
        };
        estado.extras.push(item);
        window.db.saveNutricion(alumno.id, hoyKey, estado);
        modal.remove();
        window.mostrarToast("Añadido: " + item.nombre);
        window.init_nutricion();
      });
    }

    document.querySelectorAll(".quitar-extra").forEach(function(btn){
      btn.addEventListener("click", function(){
        estado.extras.splice(parseInt(this.getAttribute("data-i"),10), 1);
        window.db.saveNutricion(alumno.id, hoyKey, estado);
        window.init_nutricion();
      });
    });

    function buscarOpenFoodFacts(query){
      var url = "https://world.openfoodfacts.org/api/v2/search?search_terms=" + encodeURIComponent(query) +
        "&page_size=12&lc=es" +
        "&fields=product_name,product_name_es,nutriments,quantity";
      return fetch(url).then(function(r){ return r.json(); }).then(function(data){
        return (data.products || []).map(function(p){
          var n = p.nutriments || {};
          var kcal = n["energy-kcal_100g"];
          if(kcal === undefined || kcal === null) return null;
          var nombre = p.product_name_es || p.product_name;
          if(!nombre) return null;
          return {
            nombre: nombre, cantidad: "100g", calorias: Math.round(kcal),
            proteina: Math.round(n.proteins_100g || 0), carbos: Math.round(n.carbohydrates_100g || 0), grasas: Math.round(n.fat_100g || 0),
            icono: "🌐", fuente: "Open Food Facts"
          };
        }).filter(Boolean);
      }).catch(function(){ return []; });
    }

    function abrirSelectorRapido(fotoDataUrl){
      var comunes = window.db.ALIMENTOS_COMUNES;
      var modal = document.createElement("div");
      modal.className = "modal-celebracion";
      modal.innerHTML = "<div class='mc-card' style='text-align:left;max-height:80vh;overflow-y:auto;'>" +
        "<h2 style='text-align:center;'>¿Qué es esto?</h2>" +
        "<img src='" + fotoDataUrl + "' style='width:100%;border-radius:12px;margin-bottom:12px;'>" +
        "<input id='buscar-alimento' placeholder='Buscar alimento real (ej: papa con atún)...' style='width:100%;padding:10px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);border-radius:8px;margin-bottom:6px;'>" +
        "<p style='font-size:.7rem;color:var(--text-muted);margin-bottom:10px;'>Sugerencias rápidas sin buscar · datos reales de Open Food Facts al escribir 3+ letras</p>" +
        "<div id='lista-comunes'></div></div>";
      document.body.appendChild(modal);
      modal.addEventListener("click", function(e){ if(e.target===modal) modal.remove(); });

      function elegir(item){
        estado.extras.push({ nombre: item.nombre, cantidad: item.cantidad, calorias: item.calorias, proteina: item.proteina, carbos: item.carbos, grasas: item.grasas, icono: item.icono, foto: fotoDataUrl });
        window.db.saveNutricion(alumno.id, hoyKey, estado);
        modal.remove();
        window.mostrarToast("Comida registrada: " + item.nombre);
        window.init_nutricion();
      }

      function pintarLista(items, vacioTexto){
        modal.querySelector("#lista-comunes").innerHTML = items.map(function(c, i){
          return "<div class='alimento-comun-row' data-i='" + i + "'>" +
            "<span>" + c.icono + " " + c.nombre + (c.fuente ? " <span style='color:var(--text-muted);font-size:.68rem;'>· " + c.fuente + "</span>" : "") + "</span>" +
            "<span style='color:var(--text-muted);font-size:.78rem;flex-shrink:0;'>" + c.cantidad + " · " + c.calorias + " kcal</span></div>";
        }).join("") || "<p style='color:var(--text-muted);font-size:.85rem;'>" + vacioTexto + "</p>";
        modal.querySelectorAll(".alimento-comun-row").forEach(function(row){
          row.addEventListener("click", function(){ elegir(items[parseInt(this.getAttribute("data-i"),10)]); });
        });
      }

      var debounce = null;
      function renderLista(filtro){
        var f = (filtro||"").toLowerCase().trim();
        if(f.length === 0){
          pintarLista(comunes, "Escribe para buscar.");
          return;
        }
        var localFiltrados = comunes.filter(function(c){ return c.nombre.toLowerCase().indexOf(f) !== -1; });
        pintarLista(localFiltrados, "Buscando…");
        if(f.length < 3) return;
        if(debounce) clearTimeout(debounce);
        debounce = setTimeout(function(){
          modal.querySelector("#lista-comunes").insertAdjacentHTML("afterbegin", "<p style='font-size:.72rem;color:var(--blue);margin-bottom:6px;'>🔎 Buscando en Open Food Facts...</p>");
          buscarOpenFoodFacts(f).then(function(remotos){
            var combinados = remotos.concat(localFiltrados);
            pintarLista(combinados, "Sin resultados reales. Prueba otra palabra o revisa tu conexión.");
          });
        }, 450);
      }
      renderLista("");
      modal.querySelector("#buscar-alimento").addEventListener("input", function(){ renderLista(this.value); });
    }

    document.querySelectorAll(".agua-vaso").forEach(function(v){
      v.addEventListener("click", function(){
        var i = parseInt(this.getAttribute("data-i"), 10);
        estado.agua = (estado.agua === i+1) ? i : i+1;
        window.db.saveNutricion(alumno.id, hoyKey, estado);
        window.init_nutricion();
      });
    });

    document.getElementById("nutri-guardar").addEventListener("click", function(){
      window.db.saveNutricion(alumno.id, hoyKey, estado);
      var btn = document.getElementById("nutri-guardar");
      var original = btn.textContent;
      btn.textContent = "Guardado ✓";
      setTimeout(function(){ btn.textContent = original; }, 1500);
    });
  };
})();

// ════════════════════════════════════════════════════════════
// coach.js — Panel del entrenador. Router de secciones + CRUD.
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";
  function safe(fn, name){ try{ fn(); }catch(e){ console.error("[coach] " + name, e); } }
  function $(sel){ return document.querySelector(sel); }
  function el(html){ var d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }

  var SECCIONES = ["dashboard","alumnos","rutinas","alimentacion","ejercicios","mensajes","gym","videos","intakes","ingresos"];

  function showSec(id){
    SECCIONES.forEach(function(s){
      document.getElementById("sec-"+s).style.display = "none";
      var b = document.querySelector('[data-sec="'+s+'"]');
      if(b) b.classList.remove("active");
    });
    document.getElementById("sec-"+id).style.display = "block";
    var btn = document.querySelector('[data-sec="'+id+'"]');
    if(btn) btn.classList.add("active");
    var fn = window["render_" + id];
    if(typeof fn === "function") safe(fn, "render_"+id);
  }

  function coachModal(titulo, bodyHtml, onMount){
    var overlay = el("<div id='coach-modal-overlay'><div class='modal-box'><h2>" + titulo + "</h2><div id='modal-body'>" + bodyHtml + "</div></div></div>");
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function(e){ if(e.target === overlay) overlay.remove(); });
    if(onMount) onMount(overlay);
    return overlay;
  }
  window.cerrarCoachModal = function(){ var o = document.getElementById("coach-modal-overlay"); if(o) o.remove(); };

  // ── DASHBOARD ────────────────────────────────────────────
  window.render_dashboard = function(){
    var alumnos = window.db.getAlumnos();
    var rutinas = window.db.getRutinas();
    var planes = window.db.getPlanes();
    var hoy = window.db.fechaHoy();
    var entrenaronHoy = alumnos.filter(function(a){ return window.db.getRegistros(a.id).some(function(r){ return r.fecha === hoy; }); }).length;

    var diasStr = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    var mesesStr = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    var ahora = new Date();
    var fechaStr = diasStr[ahora.getDay()] + " " + ahora.getDate() + " " + mesesStr[ahora.getMonth()] + " " + ahora.getFullYear();

    var html =
      '<div style="background:linear-gradient(135deg,#141F00 0%,#0D0D0D 60%,#111900 100%);border:1px solid rgba(200,224,0,0.15);border-radius:20px;padding:24px 28px;margin-bottom:24px;position:relative;overflow:hidden;">' +
        '<div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(200,224,0,0.12) 0%,transparent 70%);pointer-events:none;border-radius:50%;"></div>' +
        '<div style="font-size:11px;font-weight:700;color:rgba(200,224,0,0.6);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Creator Studio</div>' +
        '<div style="font-size:28px;font-weight:900;color:#FFF;letter-spacing:-1px;line-height:1.1;margin-bottom:4px;">Panel del Coach</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.35);">' + fechaStr + '</div>' +
        '<div style="display:flex;gap:24px;margin-top:20px;flex-wrap:wrap;">' +
          '<div><div style="font-size:32px;font-weight:900;color:#C8E000;letter-spacing:-1px;">' + alumnos.length + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:2px;">Alumnos</div></div>' +
          '<div style="width:1px;background:rgba(255,255,255,0.06);"></div>' +
          '<div><div style="font-size:32px;font-weight:900;color:#C8E000;letter-spacing:-1px;">' + rutinas.length + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:2px;">Rutinas</div></div>' +
          '<div style="width:1px;background:rgba(255,255,255,0.06);"></div>' +
          '<div><div style="font-size:32px;font-weight:900;color:#C8E000;letter-spacing:-1px;">' + planes.length + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:2px;">Planes</div></div>' +
          '<div style="width:1px;background:rgba(255,255,255,0.06);"></div>' +
          '<div><div style="font-size:32px;font-weight:900;color:#C8E000;letter-spacing:-1px;">' + entrenaronHoy + '</div><div style="font-size:11px;color:rgba(255,255,255,0.4);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:2px;">Hoy</div></div>' +
        '</div>' +
      '</div>';

    html += "<div class='coach-card'><h3 style='margin-bottom:12px;'>Actividad reciente</h3><table class='coach-table'><tr><th>Alumno</th><th>Última sesión</th><th>Racha</th></tr>";
    alumnos.forEach(function(a){
      var regs = window.db.getRegistros(a.id);
      var ultima = regs.length ? regs[regs.length-1].fecha : "—";
      html += "<tr><td>" + a.nombre + " " + (a.apellido||"") + "</td><td>" + ultima + "</td><td>" + window.db.calcularRacha(a.id) + " días</td></tr>";
    });
    html += "</table></div>";

    var inactivos = alumnos.filter(function(a){
      var regs = window.db.getRegistros(a.id);
      if(regs.length === 0) return true;
      var dias = (new Date() - new Date(regs[regs.length-1].fecha)) / 86400000;
      return dias >= 3;
    });
    if(inactivos.length){
      html += "<div class='coach-card'><h3 style='margin-bottom:12px;'>⚠️ +3 días sin entrenar</h3>";
      inactivos.forEach(function(a){
        html += "<div style='display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #242424;'>" +
          "<span>" + a.nombre + " " + (a.apellido||"") + "</span>" +
          "<a class='btn-coach secondary' target='_blank' rel='noopener' href='https://wa.me/?text=" + encodeURIComponent("Hola " + a.nombre + ", ¿todo bien? Hace días que no te veo entrenar 💪") + "'>WhatsApp</a></div>";
      });
      html += "</div>";
    }
    // Videos de técnica pendientes
    var pendientesHtml = "";
    var totalPend = 0;
    alumnos.forEach(function(alumno){
      var videos = [];
      try { videos = JSON.parse(localStorage.getItem("fitapp_videos_tecnica_"+alumno.id)||"[]"); } catch(e){}
      videos.filter(function(v){ return !v.revisado; }).forEach(function(v){
        totalPend++;
        pendientesHtml += '<div style="background:#1C1C1C;border-radius:12px;padding:14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">' +
          '<div><div style="font-size:14px;font-weight:600;">' + alumno.nombre + ' — ' + v.ejercicio + '</div>' +
          '<div style="font-size:12px;color:#777;margin-top:3px;">' + v.fecha + (v.hora?" · "+v.hora:"") + ' · ' + (v.tamano_mb||"?") + ' MB</div></div>' +
          '<button class="btn-coach secondary" onclick="window._marcarVideoRevisado(\''+alumno.id+'\',\''+v.id+'\')">Revisado</button>' +
        '</div>';
      });
    });
    if(totalPend > 0 || pendientesHtml){
      html += '<div class="coach-card"><h3 style="margin-bottom:12px;">📹 Videos de técnica pendientes (' + totalPend + ')</h3>' +
        (pendientesHtml || '<div style="color:#555;text-align:center;padding:16px;">Sin videos pendientes</div>') +
      '</div>';
    }

    // ── Detección de riesgo de abandono ──────────────────
    var riesgoHtml = "";
    alumnos.forEach(function(a){
      var regs7  = window.db.getActividadReciente(a.id, 7);
      var regs14 = window.db.getActividadReciente(a.id, 14);
      var regs28 = window.db.getActividadReciente(a.id, 28);
      var promAnt = regs28.length / 4; // promedio semanal últimas 4 semanas
      var pct = promAnt > 0 ? Math.round((1 - regs7.length / promAnt) * 100) : 0;
      var diasSinEntreno = 0;
      var allRegs = window.db.getRegistros(a.id);
      if(allRegs.length){
        diasSinEntreno = Math.round((new Date() - new Date(allRegs[allRegs.length-1].fecha)) / 86400000);
      }
      if(pct >= 30 || diasSinEntreno >= 5){
        var msg = "";
        if(pct >= 50) msg = "Ha reducido su actividad un " + pct + "% en los últimos 7 días.";
        else if(diasSinEntreno >= 7) msg = "Lleva " + diasSinEntreno + " días sin entrenar.";
        else msg = "Actividad reducida " + pct + "% respecto a su media.";
        var waTxt = encodeURIComponent("Hola " + a.nombre + ", ¿todo bien? Notamos que has bajado el ritmo últimamente. Aquí estamos para ayudarte 💪");
        riesgoHtml += '<div class="risk-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<div class="risk-card-name">⚠️ ' + a.nombre + ' ' + (a.apellido||"") + '</div>' +
            '<a class="btn-coach secondary" target="_blank" rel="noopener" href="https://wa.me/?text=' + waTxt + '" style="font-size:12px;padding:6px 12px;">WhatsApp</a>' +
          '</div>' +
          '<div class="risk-card-msg">' + msg + '</div>' +
        '</div>';
      }
    });
    if(riesgoHtml){
      html += '<div class="coach-card"><h3 style="margin-bottom:12px;color:#FF453A;">🚨 Alumnos en riesgo de abandono</h3>' + riesgoHtml + '</div>';
    }

    // ── Objetivos asignados ──────────────────────────────
    html += '<div class="coach-card"><h3 style="margin-bottom:12px;">🎯 Objetivos por alumno</h3>';
    if(alumnos.length === 0){
      html += '<div style="color:#555;text-align:center;padding:16px;">Sin alumnos</div>';
    } else {
      var TIPOS_OBJ = [
        { tipo:"pasos",    nombre:"Pasos diarios",     unidad:"pasos",  meta:10000, icono:"👟" },
        { tipo:"agua",     nombre:"Agua diaria",        unidad:"ml",     meta:3000,  icono:"💧" },
        { tipo:"proteina", nombre:"Proteína diaria",    unidad:"g",      meta:180,   icono:"💪" },
        { tipo:"calorias", nombre:"Calorías diarias",   unidad:"kcal",   meta:2400,  icono:"🔥" },
        { tipo:"sueno",    nombre:"Horas de sueño",     unidad:"horas",  meta:8,     icono:"😴" },
        { tipo:"entreno",  nombre:"Sesiones semanales", unidad:"sesiones",meta:4,    icono:"🏋️" }
      ];
      html += '<select id="sel-alumno-obj" style="width:100%;height:40px;background:#1C1C1C;border:1px solid #333;border-radius:10px;color:#FFF;padding:0 12px;font-family:inherit;font-size:14px;margin-bottom:12px;">';
      alumnos.forEach(function(a){ html += '<option value="' + a.id + '">' + a.nombre + ' ' + (a.apellido||"") + '</option>'; });
      html += '</select>';
      html += '<div id="obj-alumno-list"></div>';
      html += '<div style="margin-top:10px;background:#1C1C1C;border-radius:12px;padding:12px;">';
      html += '<div style="font-size:13px;font-weight:700;margin-bottom:8px;">Agregar objetivo</div>';
      html += '<select id="sel-tipo-obj" style="width:100%;height:36px;background:#242424;border:1px solid #333;border-radius:8px;color:#FFF;padding:0 10px;font-family:inherit;font-size:13px;margin-bottom:8px;">';
      TIPOS_OBJ.forEach(function(t){ html += '<option value="' + t.tipo + '">' + t.icono + ' ' + t.nombre + '</option>'; });
      html += '</select>';
      html += '<input id="inp-meta-obj" type="number" placeholder="Meta (ej: 10000)" style="width:100%;height:36px;background:#242424;border:1px solid #333;border-radius:8px;color:#FFF;padding:0 10px;font-family:inherit;font-size:13px;margin-bottom:8px;">';
      html += '<button id="btn-add-obj" class="btn-coach" style="width:100%;height:36px;font-size:13px;">+ Agregar objetivo</button>';
      html += '</div>';
    }
    html += '</div>';

    $("#sec-dashboard").innerHTML = html;

    // Bind: selector alumno → mostrar objetivos
    var selA = document.getElementById("sel-alumno-obj");
    if(selA){
      function renderObjetivosAlumno(){
        var aid = selA.value;
        var objs = window.db.getObjetivos(aid);
        var TIPOS_OBJ_LOCAL = [
          { tipo:"pasos",icono:"👟" },{ tipo:"agua",icono:"💧" },{ tipo:"proteina",icono:"💪" },
          { tipo:"calorias",icono:"🔥" },{ tipo:"sueno",icono:"😴" },{ tipo:"entreno",icono:"🏋️" }
        ];
        var listEl = document.getElementById("obj-alumno-list");
        if(!listEl) return;
        if(!objs.length){ listEl.innerHTML = '<div style="color:#555;font-size:13px;padding:4px 0;">Sin objetivos asignados</div>'; return; }
        listEl.innerHTML = objs.map(function(o){
          var ic = (TIPOS_OBJ_LOCAL.find(function(t){ return t.tipo===o.tipo; })||{}).icono || "🎯";
          return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #242424;">' +
            '<div style="font-size:13px;">' + ic + ' ' + o.nombre + ' — <span style="color:#C8E000;font-weight:700;">' + (o.meta||0).toLocaleString() + ' ' + (o.unidad||"") + '</span></div>' +
            '<button onclick="window._deleteObjetivoCoach(\'' + aid + '\',\'' + o.id + '\')" style="background:none;border:none;color:#FF453A;font-size:18px;cursor:pointer;">✕</button>' +
          '</div>';
        }).join('');
      }
      renderObjetivosAlumno();
      selA.addEventListener("change", renderObjetivosAlumno);

      var btnAddObj = document.getElementById("btn-add-obj");
      if(btnAddObj){
        var TIPOS_ALL = [
          { tipo:"pasos",nombre:"Pasos diarios",unidad:"pasos" },
          { tipo:"agua",nombre:"Agua diaria",unidad:"ml" },
          { tipo:"proteina",nombre:"Proteína diaria",unidad:"g" },
          { tipo:"calorias",nombre:"Calorías diarias",unidad:"kcal" },
          { tipo:"sueno",nombre:"Horas de sueño",unidad:"horas" },
          { tipo:"entreno",nombre:"Sesiones semanales",unidad:"sesiones" }
        ];
        btnAddObj.addEventListener("click", function(){
          var aid2 = selA.value;
          var tipo = (document.getElementById("sel-tipo-obj")||{}).value;
          var meta = parseFloat((document.getElementById("inp-meta-obj")||{}).value);
          if(!tipo || !meta) return;
          var tipoInfo = TIPOS_ALL.find(function(t){ return t.tipo===tipo; }) || {};
          var obj = { id:"obj_"+Date.now(), tipo:tipo, nombre:tipoInfo.nombre||tipo, unidad:tipoInfo.unidad||"", meta:meta, fecha_creacion:window.db.fechaHoy() };
          window.db.saveObjetivo(aid2, obj);
          renderObjetivosAlumno();
          window.mostrarToast("✅ Objetivo asignado");
          var inp = document.getElementById("inp-meta-obj"); if(inp) inp.value = "";
        });
      }
    }
  };

  window._deleteObjetivoCoach = function(alumnoId, objId){
    window.db.deleteObjetivo(alumnoId, objId);
    window.render_dashboard();
  };

  window._marcarVideoRevisado = function(alumnoId, videoId){
    var key = "fitapp_videos_tecnica_"+alumnoId;
    var videos = [];
    try { videos = JSON.parse(localStorage.getItem(key)||"[]"); } catch(e){}
    var idx = videos.findIndex(function(v){ return v.id===videoId; });
    if(idx>=0){ videos[idx].revisado = true; try { localStorage.setItem(key, JSON.stringify(videos)); } catch(e){} }
    window.render_dashboard();
  };

  // ── ALUMNOS ──────────────────────────────────────────────
  window.render_alumnos = function(){
    var alumnos = window.db.getAlumnos();
    var html = "<h1>Mis alumnos</h1><button class='btn-coach' id='btn-add-alumno' style='margin-bottom:18px;'>+ Agregar alumno</button>";
    html += "<div class='alumnos-grid'>";
    alumnos.forEach(function(a){
      html += "<div class='alumno-card' data-id='" + a.id + "'><div class='ac-avatar'>" + a.nombre[0] + "</div>" +
        "<h3>" + a.nombre + " " + (a.apellido||"") + "</h3><p>" + a.objetivo.replace("_"," ") + " · código " + a.codigo + "</p></div>";
    });
    html += "</div>";
    $("#sec-alumnos").innerHTML = html;

    $("#btn-add-alumno").addEventListener("click", abrirModalAlumno);
    document.querySelectorAll(".alumno-card").forEach(function(c){
      c.addEventListener("click", function(){ renderAlumnoDetalle(this.getAttribute("data-id")); });
    });
  };

  function abrirModalAlumno(){
    var rutinas = window.db.getRutinas(), planes = window.db.getPlanes();
    var body = "<div class='coach-form'>" +
      "<div class='row2'><div><label>Nombre</label><input id='f-nombre'></div><div><label>Apellido</label><input id='f-apellido'></div></div>" +
      "<div class='row2'><label style='display:none;'></label></div>" +
      "<div class='row2'><div><label>Código de 4 dígitos</label><input id='f-codigo' maxlength='4'></div><div><label>Edad</label><input id='f-edad' type='number'></div></div>" +
      "<div class='row2'><div><label>Objetivo</label><select id='f-objetivo'><option value='ganancia_muscular'>Ganancia muscular</option><option value='perdida_grasa'>Pérdida de grasa</option><option value='mantenimiento'>Mantenimiento</option></select></div>" +
      "<div><label>Nivel</label><select id='f-nivel'><option value='principiante'>Principiante</option><option value='intermedio'>Intermedio</option><option value='avanzado'>Avanzado</option></select></div></div>" +
      "<div class='row2'><div><label>Peso inicial (kg)</label><input id='f-peso' type='number' step='0.1'></div><div><label>Altura (cm)</label><input id='f-altura' type='number'></div></div>" +
      "<label>Rutina asignada</label><select id='f-rutina'><option value=''>— ninguna —</option>" + rutinas.map(function(r){ return "<option value='"+r.id+"'>"+r.nombre+"</option>"; }).join("") + "</select>" +
      "<label>Plan de alimentación asignado</label><select id='f-plan'><option value=''>— ninguno —</option>" + planes.map(function(p){ return "<option value='"+p.id+"'>"+p.nombre+"</option>"; }).join("") + "</select>" +
      "<button class='btn-coach' id='f-guardar' style='margin-top:16px;'>Guardar alumno</button></div>";

    coachModal("Nuevo alumno", body, function(){
      $("#f-guardar").addEventListener("click", function(){
        var a = {
          id: window.db.generarId("a"),
          codigo: $("#f-codigo").value.trim(),
          nombre: $("#f-nombre").value.trim(),
          apellido: $("#f-apellido").value.trim(),
          edad: parseInt($("#f-edad").value,10) || 0,
          genero: "", objetivo: $("#f-objetivo").value, nivel: $("#f-nivel").value,
          peso_inicial: parseFloat($("#f-peso").value) || 0, peso_actual: parseFloat($("#f-peso").value) || 0,
          altura: parseFloat($("#f-altura").value) || 0, fecha_inicio: window.db.fechaHoy(),
          rutina_id: $("#f-rutina").value, plan_alimentacion_id: $("#f-plan").value, activo:true
        };
        if(!a.nombre || !a.codigo){ alert("Nombre y código son obligatorios"); return; }
        window.db.saveAlumno(a);
        window.cerrarCoachModal();
        render_alumnos();
      });
    });
  }

  // Edita TODOS los parámetros del alumno (corrige typos del coach: peso,
  // nombre, código, edad, etc.) — separado de abrirModalAlumno (creación)
  // porque aquí se pre-rellenan los valores actuales.
  function abrirModalEditarAlumno(a, onGuardado){
    var body = "<div class='coach-form'>" +
      "<div class='row2'><div><label>Nombre</label><input id='ef-nombre' value='" + (a.nombre||"") + "'></div><div><label>Apellido</label><input id='ef-apellido' value='" + (a.apellido||"") + "'></div></div>" +
      "<div class='row2'><div><label>Código de 4 dígitos</label><input id='ef-codigo' maxlength='4' value='" + (a.codigo||"") + "'></div><div><label>Edad</label><input id='ef-edad' type='number' value='" + (a.edad||"") + "'></div></div>" +
      "<div class='row2'><div><label>Género</label><select id='ef-genero'>" +
        ["", "masculino", "femenino", "otro"].map(function(g){ return "<option value='"+g+"'" + (a.genero===g?" selected":"") + ">" + (g||"— sin especificar —") + "</option>"; }).join("") +
      "</select></div><div><label>Nivel</label><select id='ef-nivel'>" +
        ["principiante","intermedio","avanzado"].map(function(n){ return "<option value='"+n+"'" + (a.nivel===n?" selected":"") + ">" + n.charAt(0).toUpperCase()+n.slice(1) + "</option>"; }).join("") +
      "</select></div></div>" +
      "<label>Objetivo</label><select id='ef-objetivo'>" +
        [["ganancia_muscular","Ganancia muscular"],["perdida_grasa","Pérdida de grasa"],["mantenimiento","Mantenimiento"]].map(function(o){ return "<option value='"+o[0]+"'" + (a.objetivo===o[0]?" selected":"") + ">"+o[1]+"</option>"; }).join("") +
      "</select>" +
      "<div class='row2'><div><label>Peso inicial (kg)</label><input id='ef-peso-ini' type='number' step='0.1' value='" + (a.peso_inicial||"") + "'></div><div><label>Peso actual (kg)</label><input id='ef-peso-act' type='number' step='0.1' value='" + (a.peso_actual||"") + "'></div></div>" +
      "<div class='row2'><div><label>Altura (cm)</label><input id='ef-altura' type='number' value='" + (a.altura||"") + "'></div><div><label>Fecha de inicio</label><input id='ef-fecha' type='date' value='" + (a.fecha_inicio||"") + "'></div></div>" +
      "<button class='btn-coach' id='ef-guardar' style='margin-top:16px;'>Guardar cambios</button></div>";

    coachModal("Editar perfil de " + a.nombre, body, function(){
      $("#ef-guardar").addEventListener("click", function(){
        var nombre = $("#ef-nombre").value.trim();
        var codigo = $("#ef-codigo").value.trim();
        if(!nombre || !codigo){ alert("Nombre y código son obligatorios"); return; }
        var otro = window.db.getAlumnos().find(function(x){ return x.codigo === codigo && x.id !== a.id; });
        if(otro){ alert("Ese código ya lo usa " + otro.nombre + ". Elige otro."); return; }

        a.nombre = nombre;
        a.apellido = $("#ef-apellido").value.trim();
        a.codigo = codigo;
        a.edad = parseInt($("#ef-edad").value,10) || 0;
        a.genero = $("#ef-genero").value;
        a.nivel = $("#ef-nivel").value;
        a.objetivo = $("#ef-objetivo").value;
        a.peso_inicial = parseFloat($("#ef-peso-ini").value) || 0;
        a.peso_actual  = parseFloat($("#ef-peso-act").value) || 0;
        a.altura = parseFloat($("#ef-altura").value) || 0;
        a.fecha_inicio = $("#ef-fecha").value || a.fecha_inicio;

        window.db.saveAlumno(a);
        window.cerrarCoachModal();
        window.mostrarToast ? window.mostrarToast("✓ Perfil actualizado") : null;
        if(onGuardado) onGuardado(a);
      });
    });
  }

  function renderAlumnoDetalle(id){
    var a = window.db.getAlumnoPorId(id);
    var tabs = ["resumen","rutina","alimentacion","progreso","notas"];
    var tabActivo = "resumen";

    function render(){
      var html = "<h1>" + a.nombre + " " + (a.apellido||"") + "</h1>" +
        "<button class='btn-coach secondary' id='btn-volver-alumnos' style='margin-bottom:14px;'>← Volver a alumnos</button>" +
        "<div class='coach-tabs'>" + tabs.map(function(t){
          return "<button data-t='" + t + "' class='" + (t===tabActivo?"active":"") + "'>" + t.charAt(0).toUpperCase()+t.slice(1) + "</button>";
        }).join("") + "</div><div id='tab-content'></div>";
      $("#sec-alumnos").innerHTML = html;
      $("#btn-volver-alumnos").addEventListener("click", render_alumnos);
      document.querySelectorAll(".coach-tabs button").forEach(function(b){
        b.addEventListener("click", function(){ tabActivo = this.getAttribute("data-t"); render(); });
      });
      renderTab();
    }

    function renderTab(){
      var box = $("#tab-content"); var html = "";
      if(tabActivo === "resumen"){
        var rNombre = (function(){ var r = window.db.getRutinaPorId(a.rutina_id); return r ? r.nombre : (a.rutina_id || "Sin rutina"); })();
        var pNombre = (function(){ var p = window.db.getPlanPorId(a.plan_alimentacion_id); return p ? p.nombre : (a.plan_alimentacion_id || "Sin plan"); })();
        html = "<div class='coach-card'>" +
          "<p>Nombre: " + a.nombre + " " + (a.apellido||"") + " · Edad: " + (a.edad||"—") + (a.genero ? " · " + a.genero : "") + "</p>" +
          "<p>Objetivo: " + a.objetivo.replace(/_/g," ") + " · Nivel: " + a.nivel + "</p>" +
          "<p>Peso inicial: " + a.peso_inicial + " kg · Peso actual: " + a.peso_actual + " kg · Altura: " + (a.altura||"—") + " cm</p>" +
          "<p>Código de acceso: " + a.codigo + " · Inicio: " + a.fecha_inicio + "</p>" +
          "<p style='margin-top:8px;'>Rutina: <strong style='color:#C8E000;'>" + rNombre + "</strong></p>" +
          "<p>Plan de alimentación: <strong style='color:#C8E000;'>" + pNombre + "</strong></p>" +
          "<button class='btn-coach secondary' id='btn-editar-perfil' style='margin-top:14px;'>✏️ Editar perfil del alumno</button>" +
          "<button class='btn-coach secondary' id='btn-eliminar-alumno' style='margin-top:8px;color:#FF6B5B;border-color:rgba(255,69,58,.3);'>🗑️ Eliminar alumno</button>" +
        "</div>";
      } else if(tabActivo === "rutina"){
        var r = window.db.getRutinaPorId(a.rutina_id);
        html = "<div class='coach-card'>" + (r ? ("<p><strong>" + r.nombre + "</strong></p><p>" + r.mesociclo + "</p>") : "<p>Sin rutina asignada.</p>") +
          "<button class='btn-coach secondary' id='btn-cambiar-rutina' style='margin-top:10px;'>Cambiar rutina</button></div>";
      } else if(tabActivo === "alimentacion"){
        var p = window.db.getPlanPorId(a.plan_alimentacion_id);
        html = "<div class='coach-card'>" + (p ? ("<p><strong>" + p.nombre + "</strong></p><p>Objetivo calórico: " + p.calorias_objetivo + " kcal</p>") : "<p>Sin plan asignado.</p>") +
          "<button class='btn-coach secondary' id='btn-cambiar-plan' style='margin-top:10px;'>Cambiar plan</button></div>";
      } else if(tabActivo === "progreso"){
        var pesos = window.db.getPesos(a.id), regs = window.db.getRegistros(a.id), medallas = window.db.getMedallas(a.id);
        var ultPesos = pesos.slice(-8);
        var pesoGrafico = "";
        if(ultPesos.length >= 2){
          var minP = Math.min.apply(null, ultPesos.map(function(p){ return parseFloat(p.kg); }));
          var maxP = Math.max.apply(null, ultPesos.map(function(p){ return parseFloat(p.kg); }));
          var rango = maxP - minP || 1;
          var W = 480, H = 90, pad = 20;
          var points = ultPesos.map(function(p, i){
            var x = pad + (i / (ultPesos.length - 1)) * (W - pad*2);
            var y = H - pad - ((parseFloat(p.kg) - minP) / rango) * (H - pad*2);
            return x.toFixed(1) + "," + y.toFixed(1);
          }).join(" ");
          pesoGrafico = '<div style="background:#0F0F0F;border-radius:10px;padding:14px;margin-bottom:12px;">' +
            '<div style="font-size:12px;color:#777;margin-bottom:8px;">Evolución de peso (kg)</div>' +
            '<svg width="100%" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="display:block;">' +
            '<polyline points="' + points + '" fill="none" stroke="#C8E000" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
            ultPesos.map(function(p, i){
              var x = pad + (i / (ultPesos.length - 1)) * (W - pad*2);
              var y = H - pad - ((parseFloat(p.kg) - minP) / rango) * (H - pad*2);
              return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4" fill="#C8E000"/>' +
                '<text x="' + x.toFixed(1) + '" y="' + (y - 8).toFixed(1) + '" text-anchor="middle" font-size="9" fill="#C8E000" font-family="Inter,sans-serif">' + p.kg + '</text>';
            }).join("") +
            '</svg>' +
            '<div style="display:flex;justify-content:space-between;font-size:10px;color:#555;margin-top:4px;">' +
            ultPesos.map(function(p){ return '<span>' + p.fecha.slice(5) + '</span>'; }).join("") +
            '</div></div>';
        }
        html = "<div class='coach-card'>" + pesoGrafico +
          "<p>" + regs.length + " entrenamientos · racha " + window.db.calcularRacha(a.id) + " días · " + medallas.length + "/" + window.db.MEDALLAS_DEF.length + " medallas</p>" +
          "<div style='margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;'>" +
          medallas.map(function(m){ return "<span style='background:#1C1C1C;border-radius:8px;padding:6px 10px;font-size:12px;'>" + m.icono + " " + m.nombre + "</span>"; }).join("") +
          "</div></div>";
      } else if(tabActivo === "notas"){
        var notas = window.db.getNotas(a.id);
        html = "<div class='coach-card'>" + notas.map(function(n){ return "<p style='margin-bottom:8px;border-bottom:1px solid #242424;padding-bottom:8px;'>" + n.fecha + " — " + n.texto + "</p>"; }).join("") +
          "<textarea id='nueva-nota' placeholder='Escribe una nota de seguimiento...' style='width:100%;margin-top:10px;padding:10px;border-radius:8px;background:#0F0F0F;color:#fff;border:1px solid #333;'></textarea>" +
          "<button class='btn-coach' id='btn-enviar-nota' style='margin-top:8px;'>Enviar nota</button></div>";
      }
      box.innerHTML = html;

      if(tabActivo === "resumen"){
        $("#btn-editar-perfil").addEventListener("click", function(){
          abrirModalEditarAlumno(a, function(actualizado){
            a = actualizado;
            render();
          });
        });
        $("#btn-eliminar-alumno").addEventListener("click", function(){
          if(!confirm("¿Eliminar a " + a.nombre + " " + (a.apellido||"") + "? Esta acción no se puede deshacer.")) return;
          window.db.deleteAlumno(a.id);
          render_alumnos();
        });
      }
      if(tabActivo === "rutina"){
        $("#btn-cambiar-rutina").addEventListener("click", function(){
          var rutinas = window.db.getRutinas();
          coachModal("Cambiar rutina", "<select id='sel-rutina' style='width:100%;padding:10px;background:#0F0F0F;color:#fff;border:1px solid #333;border-radius:8px;'>" +
            rutinas.map(function(r){ return "<option value='"+r.id+"'" + (r.id===a.rutina_id?" selected":"") + ">"+r.nombre+"</option>"; }).join("") +
            "</select><button class='btn-coach' id='guardar-rutina-sel' style='margin-top:14px;'>Guardar</button>", function(){
            $("#guardar-rutina-sel").addEventListener("click", function(){
              a.rutina_id = $("#sel-rutina").value; window.db.saveAlumno(a); window.cerrarCoachModal(); renderTab();
            });
          });
        });
      }
      if(tabActivo === "alimentacion"){
        $("#btn-cambiar-plan").addEventListener("click", function(){
          var planes = window.db.getPlanes();
          coachModal("Cambiar plan", "<select id='sel-plan' style='width:100%;padding:10px;background:#0F0F0F;color:#fff;border:1px solid #333;border-radius:8px;'>" +
            planes.map(function(p){ return "<option value='"+p.id+"'" + (p.id===a.plan_alimentacion_id?" selected":"") + ">"+p.nombre+"</option>"; }).join("") +
            "</select><button class='btn-coach' id='guardar-plan-sel' style='margin-top:14px;'>Guardar</button></div>", function(){
            $("#guardar-plan-sel").addEventListener("click", function(){
              a.plan_alimentacion_id = $("#sel-plan").value; window.db.saveAlumno(a); window.cerrarCoachModal(); renderTab();
            });
          });
        });
      }
      if(tabActivo === "notas"){
        $("#btn-enviar-nota").addEventListener("click", function(){
          var txt = $("#nueva-nota").value.trim();
          if(!txt) return;
          window.db.saveNota(a.id, { fecha: window.db.fechaHoy(), texto: txt, leida:false });
          renderTab();
        });
      }
    }
    render();
  }

  // ── RUTINAS ──────────────────────────────────────────────
  window.render_rutinas = function(){
    var rutinas = window.db.getRutinas();
    var html = "<h1>Rutinas</h1><button class='btn-coach' id='btn-add-rutina' style='margin-bottom:18px;'>+ Nueva rutina</button>";
    rutinas.forEach(function(r){
      html += "<div class='coach-card'><strong>" + r.nombre + "</strong> — " + r.mesociclo + "<br>" +
        "<span style='color:#999;font-size:.85rem;'>" + r.dias.length + " días · " + r.nivel + "</span></div>";
    });
    $("#sec-rutinas").innerHTML = html;
    $("#btn-add-rutina").addEventListener("click", abrirBuilderRutina);
  };

  function abrirBuilderRutina(){
    var rutina = { id: window.db.generarId("r"), nombre:"", descripcion:"", objetivo:"ganancia_muscular", nivel:"principiante", duracion_semanas:4, mesociclo:"", dias:[] };

    function render(){
      var body = "<div class='coach-form'>" +
        "<label>Nombre</label><input id='rb-nombre' value='" + rutina.nombre + "'>" +
        "<label>Mesociclo (texto del chip)</label><input id='rb-meso' value='" + rutina.mesociclo + "'>" +
        "<div class='row2'><div><label>Nivel</label><select id='rb-nivel'><option value='principiante'>Principiante</option><option value='intermedio'>Intermedio</option><option value='avanzado'>Avanzado</option></select></div>" +
        "<div><label>Semanas</label><input id='rb-semanas' type='number' value='" + rutina.duracion_semanas + "'></div></div>" +
        "<div id='rb-dias-list'></div>" +
        "<button class='btn-coach secondary' id='rb-add-dia' style='margin-top:8px;'>+ Agregar día</button>" +
        "<button class='btn-coach' id='rb-guardar' style='margin-top:16px;'>Guardar rutina</button></div>";
      var overlay = coachModal("Nueva rutina", body, mount);
      function mount(){
        $("#rb-add-dia").addEventListener("click", function(){
          rutina.dias.push({ numero: rutina.dias.length+1, nombre:"Día " + (rutina.dias.length+1), tipo:"fuerza", ejercicios:[] });
          renderDias();
        });
        $("#rb-guardar").addEventListener("click", function(){
          rutina.nombre = $("#rb-nombre").value.trim();
          rutina.mesociclo = $("#rb-meso").value.trim();
          rutina.nivel = $("#rb-nivel").value;
          rutina.duracion_semanas = parseInt($("#rb-semanas").value,10) || 4;
          if(!rutina.nombre){ alert("Ponle un nombre a la rutina"); return; }
          window.db.saveRutina(rutina);
          window.cerrarCoachModal();
          render_rutinas();
        });
        renderDias();
      }
      function renderDias(){
        var box = $("#rb-dias-list");
        box.innerHTML = rutina.dias.map(function(d, di){
          return "<div class='dia-builder-block'><div class='row2'>" +
            "<input value='" + d.nombre + "' data-di='" + di + "' class='dia-nombre-input' placeholder='Nombre del día'>" +
            "<select data-di='" + di + "' class='dia-tipo-select'><option value='fuerza'" + (d.tipo==="fuerza"?" selected":"") + ">Fuerza</option><option value='cardio'" + (d.tipo==="cardio"?" selected":"") + ">Cardio</option><option value='descanso'" + (d.tipo==="descanso"?" selected":"") + ">Descanso</option></select></div>" +
            "<div id='ej-list-" + di + "'>" + d.ejercicios.map(function(e,ei){ return "<div class='ejercicio-builder-row'><span>" + e.nombre + " — " + e.series + "x" + e.repeticiones + "</span><button data-di='" + di + "' data-ei='" + ei + "' class='btn-quitar-ej' style='background:none;border:none;color:#c0392b;cursor:pointer;'>✕</button></div>"; }).join("") + "</div>" +
            "<button class='btn-coach secondary' data-di='" + di + "' style='margin-top:6px;font-size:.8rem;' id='btn-add-ej-" + di + "'>+ Ejercicio</button>" +
            "</div>";
        }).join("");

        box.querySelectorAll(".dia-nombre-input").forEach(function(inp){ inp.addEventListener("input", function(){ rutina.dias[this.getAttribute("data-di")].nombre = this.value; }); });
        box.querySelectorAll(".dia-tipo-select").forEach(function(sel){ sel.addEventListener("change", function(){ rutina.dias[this.getAttribute("data-di")].tipo = this.value; }); });
        box.querySelectorAll(".btn-quitar-ej").forEach(function(b){ b.addEventListener("click", function(){
          rutina.dias[this.getAttribute("data-di")].ejercicios.splice(this.getAttribute("data-ei"),1); renderDias();
        }); });
        rutina.dias.forEach(function(d, di){
          var btn = document.getElementById("btn-add-ej-" + di);
          if(btn) btn.addEventListener("click", function(){ abrirSelectorEjercicio(di); });
        });
      }
      function abrirSelectorEjercicio(diIdx){
        var biblioteca = window.db.getEjercicios();
        var sub = el("<div id='coach-modal-overlay'><div class='modal-box'><h2>Agregar ejercicio</h2>" +
          "<select id='sel-ej-bib' style='width:100%;padding:10px;background:#0F0F0F;color:#fff;border:1px solid #333;border-radius:8px;margin-bottom:10px;'>" +
          biblioteca.map(function(e){ return "<option value='"+e.id+"'>"+e.nombre+" ("+e.grupo+")</option>"; }).join("") + "</select>" +
          "<div class='row2'><input id='ej-series' type='number' placeholder='Series' value='3'><input id='ej-reps' placeholder='Reps/RIR' value='12/RIR 2'></div>" +
          "<div class='row2'><input id='ej-descanso' type='number' placeholder='Descanso seg' value='90'><input id='ej-video' placeholder='URL de vídeo (opcional)'></div>" +
          "<input id='ej-foto' placeholder='URL de imagen del ejercicio (opcional)' style='width:100%;margin-top:8px;padding:10px;background:#0F0F0F;color:#fff;border:1px solid #333;border-radius:8px;'>" +
          "<textarea id='ej-nota' placeholder='Nota técnica' style='width:100%;margin-top:8px;padding:8px;background:#0F0F0F;color:#fff;border:1px solid #333;border-radius:8px;'></textarea>" +
          "<button class='btn-coach' id='ej-confirmar' style='margin-top:12px;'>Agregar</button></div></div>");
        document.body.appendChild(sub);
        sub.addEventListener("click", function(e){ if(e.target===sub) sub.remove(); });
        sub.querySelector("#ej-confirmar").addEventListener("click", function(){
          var ejBib = biblioteca.filter(function(e){ return e.id === sub.querySelector("#sel-ej-bib").value; })[0];
          rutina.dias[diIdx].ejercicios.push({
            id: window.db.generarId("ej"), nombre: ejBib.nombre, grupo: ejBib.grupo,
            series: parseInt(sub.querySelector("#ej-series").value,10)||3, repeticiones: sub.querySelector("#ej-reps").value,
            descanso_seg: parseInt(sub.querySelector("#ej-descanso").value,10)||90, nota_tecnica: sub.querySelector("#ej-nota").value,
            video_url: sub.querySelector("#ej-video").value, foto: sub.querySelector("#ej-foto").value,
            sets: Array.from({length: parseInt(sub.querySelector("#ej-series").value,10)||3}, function(){ return {reps:10, peso:0}; })
          });
          sub.remove();
          renderDias();
        });
      }
    }
    render();
  }

  // ── ALIMENTACIÓN ─────────────────────────────────────────
  window.render_alimentacion = function(){
    var planes = window.db.getPlanes();
    var html = "<h1>Alimentación</h1><button class='btn-coach' id='btn-add-plan' style='margin-bottom:18px;'>+ Nuevo plan</button>";
    planes.forEach(function(p){
      html += "<div class='coach-card'><strong>" + p.nombre + "</strong><br><span style='color:#999;font-size:.85rem;'>" + p.calorias_objetivo + " kcal · " + p.comidas.length + " comidas</span></div>";
    });
    $("#sec-alimentacion").innerHTML = html;
    $("#btn-add-plan").addEventListener("click", abrirBuilderPlan);
  };

  function abrirBuilderPlan(){
    var plan = { id: window.db.generarId("p"), nombre:"", objetivo:"ganancia_muscular", calorias_objetivo:2200, macros:{proteina:150,carbohidratos:250,grasas:70}, descripcion:"", comidas:[] };
    function render(){
      var body = "<div class='coach-form'>" +
        "<label>Nombre del plan</label><input id='pb-nombre'>" +
        "<label>Descripción</label><textarea id='pb-desc'></textarea>" +
        "<div class='row2'><div><label>Kcal objetivo</label><input id='pb-kcal' type='number' value='2200'></div><div><label>Proteína obj (g)</label><input id='pb-prot' type='number' value='150'></div></div>" +
        "<div class='row2'><div><label>Carbos obj (g)</label><input id='pb-carb' type='number' value='250'></div><div><label>Grasas obj (g)</label><input id='pb-gras' type='number' value='70'></div></div>" +
        "<div id='pb-comidas-list'></div>" +
        "<button class='btn-coach secondary' id='pb-add-comida' style='margin-top:8px;'>+ Agregar comida</button>" +
        "<button class='btn-coach' id='pb-guardar' style='margin-top:16px;'>Guardar plan</button></div>";
      coachModal("Nuevo plan de alimentación", body, function(){
        $("#pb-add-comida").addEventListener("click", function(){
          plan.comidas.push({ nombre:"Comida " + (plan.comidas.length+1), hora:"08:00", descripcion:"", opciones:[{ nombre:"Opción 1", calorias_total:0, alimentos:[] }] });
          renderComidas();
        });
        $("#pb-guardar").addEventListener("click", function(){
          plan.nombre = $("#pb-nombre").value.trim();
          plan.descripcion = $("#pb-desc").value;
          plan.calorias_objetivo = parseInt($("#pb-kcal").value,10)||2200;
          plan.macros = { proteina: parseInt($("#pb-prot").value,10)||150, carbohidratos: parseInt($("#pb-carb").value,10)||250, grasas: parseInt($("#pb-gras").value,10)||70 };
          if(!plan.nombre){ alert("Ponle un nombre al plan"); return; }
          window.db.savePlan(plan);
          window.cerrarCoachModal();
          render_alimentacion();
        });
        renderComidas();
      });
      function renderComidas(){
        var box = $("#pb-comidas-list");
        box.innerHTML = plan.comidas.map(function(c, ci){
          return "<div class='dia-builder-block'><input class='comida-nombre' data-ci='" + ci + "' value='" + c.nombre + "' placeholder='Nombre comida'>" +
            "<div id='op-list-" + ci + "'>" + c.opciones.map(function(o,oi){ return "<div class='ejercicio-builder-row'><span>" + o.nombre + " — " + o.alimentos.length + " alimentos — " + o.calorias_total + " kcal</span></div>"; }).join("") + "</div>" +
            "<button class='btn-coach secondary' data-ci='" + ci + "' style='margin-top:6px;font-size:.8rem;' id='btn-add-op-" + ci + "'>+ Opción de alimentos</button></div>";
        }).join("");
        box.querySelectorAll(".comida-nombre").forEach(function(inp){ inp.addEventListener("input", function(){ plan.comidas[this.getAttribute("data-ci")].nombre = this.value; }); });
        plan.comidas.forEach(function(c, ci){
          var btn = document.getElementById("btn-add-op-" + ci);
          if(btn) btn.addEventListener("click", function(){ abrirBuilderOpcion(ci); });
        });
      }
      function abrirBuilderOpcion(ci){
        var opcion = { nombre: "Opción " + (plan.comidas[ci].opciones.length+1), calorias_total:0, alimentos:[] };
        var sub = el("<div id='coach-modal-overlay'><div class='modal-box'><h2>Alimentos de la opción</h2>" +
          "<div id='alim-list'></div>" +
          "<div class='row2'><input id='al-nombre' placeholder='Alimento'><input id='al-cant' placeholder='Cantidad (ej: 140g)'></div>" +
          "<div class='row2'><input id='al-kcal' type='number' placeholder='Kcal'><input id='al-prot' type='number' placeholder='Proteína g'></div>" +
          "<div class='row2'><input id='al-carb' type='number' placeholder='Carbos g'><input id='al-gras' type='number' placeholder='Grasas g'></div>" +
          "<button class='btn-coach secondary' id='al-add' style='margin-top:8px;'>+ Agregar alimento</button>" +
          "<button class='btn-coach' id='al-guardar-op' style='margin-top:14px;'>Guardar opción</button></div></div>");
        document.body.appendChild(sub);
        sub.addEventListener("click", function(e){ if(e.target===sub) sub.remove(); });
        function renderAlim(){
          sub.querySelector("#alim-list").innerHTML = opcion.alimentos.map(function(a){ return "<div class='ejercicio-builder-row'><span>" + a.cantidad + " " + a.nombre + " — " + a.calorias + " kcal</span></div>"; }).join("");
        }
        sub.querySelector("#al-add").addEventListener("click", function(){
          var kcal = parseInt(sub.querySelector("#al-kcal").value,10)||0;
          opcion.alimentos.push({ nombre: sub.querySelector("#al-nombre").value, cantidad: sub.querySelector("#al-cant").value, calorias:kcal,
            proteina: parseFloat(sub.querySelector("#al-prot").value)||0, carbos: parseFloat(sub.querySelector("#al-carb").value)||0, grasas: parseFloat(sub.querySelector("#al-gras").value)||0 });
          opcion.calorias_total += kcal;
          sub.querySelector("#al-nombre").value=""; sub.querySelector("#al-cant").value=""; sub.querySelector("#al-kcal").value=""; sub.querySelector("#al-prot").value=""; sub.querySelector("#al-carb").value=""; sub.querySelector("#al-gras").value="";
          renderAlim();
        });
        sub.querySelector("#al-guardar-op").addEventListener("click", function(){
          plan.comidas[ci].opciones.push(opcion);
          sub.remove();
          renderComidas();
        });
      }
    }
    render();
  }

  // ── EJERCICIOS (biblioteca) ──────────────────────────────
  window.render_ejercicios = function(){
    var lista = window.db.getEjercicios();
    var grupos = lista.map(function(e){ return e.grupo; }).filter(function(g,i,arr){ return arr.indexOf(g)===i; });
    var html = "<h1>Biblioteca de ejercicios</h1><button class='btn-coach' id='btn-add-ej' style='margin-bottom:14px;'>+ Agregar ejercicio</button>";
    html += "<div class='coach-tabs' id='filtro-grupos'><button data-g='todos' class='active'>Todos</button>" + grupos.map(function(g){ return "<button data-g='"+g+"'>"+g+"</button>"; }).join("") + "</div>";
    html += "<table class='coach-table'><tr><th>Nombre</th><th>Grupo</th><th>Equipo</th><th>Vídeo</th></tr><tbody id='ej-tbody'></tbody></table>";
    $("#sec-ejercicios").innerHTML = html;

    function renderTabla(filtro){
      var rows = lista.filter(function(e){ return filtro==="todos" || e.grupo===filtro; })
        .map(function(e){ return "<tr><td>" + e.nombre + "</td><td>" + e.grupo + "</td><td>" + (e.equipamiento||"—") + "</td><td>" + (e.video_url ? "✅" : "—") + "</td></tr>"; }).join("");
      $("#ej-tbody").innerHTML = rows;
    }
    renderTabla("todos");
    document.querySelectorAll("#filtro-grupos button").forEach(function(b){
      b.addEventListener("click", function(){
        document.querySelectorAll("#filtro-grupos button").forEach(function(x){ x.classList.remove("active"); });
        this.classList.add("active");
        renderTabla(this.getAttribute("data-g"));
      });
    });
    $("#btn-add-ej").addEventListener("click", function(){
      coachModal("Nuevo ejercicio", "<div class='coach-form'>" +
        "<label>Nombre</label><input id='ne-nombre'>" +
        "<div class='row2'><div><label>Grupo muscular</label><input id='ne-grupo'></div><div><label>Equipamiento</label><input id='ne-equipo'></div></div>" +
        "<label>URL de vídeo (opcional)</label><input id='ne-video'>" +
        "<label>URL de imagen (opcional)</label><input id='ne-foto'>" +
        "<label>Descripción técnica</label><textarea id='ne-desc'></textarea>" +
        "<button class='btn-coach' id='ne-guardar' style='margin-top:14px;'>Guardar ejercicio</button></div>", function(){
        $("#ne-guardar").addEventListener("click", function(){
          var nombre = $("#ne-nombre").value.trim();
          if(!nombre) return;
          window.db.saveEjercicio({ id: window.db.generarId("ej"), nombre: nombre, grupo: $("#ne-grupo").value||"General",
            equipamiento: $("#ne-equipo").value, video_url: $("#ne-video").value, foto: $("#ne-foto").value, descripcion: $("#ne-desc").value });
          window.cerrarCoachModal();
          render_ejercicios();
        });
      });
    });
  };

  // ── MENSAJES ─────────────────────────────────────────────
  // Usa clave separada de notas para no mezclar con las notas del coach
  function getMensajesCoach(alumnoId){
    try{ return JSON.parse(localStorage.getItem("fitapp_mensajes_coach_" + alumnoId)||"[]"); }catch(e){ return []; }
  }
  function saveMensajeCoach(alumnoId, msg){
    var list = getMensajesCoach(alumnoId);
    list.push(msg);
    try{ localStorage.setItem("fitapp_mensajes_coach_" + alumnoId, JSON.stringify(list)); }catch(e){}
  }

  window.render_mensajes = function(){
    var alumnos = window.db.getAlumnos();
    var html = "<h1>Mensajes</h1><div style='display:flex;gap:20px;flex-wrap:wrap;'>";
    html += "<div style='width:220px;flex-shrink:0;'>" + alumnos.map(function(a){
      var msgs = getMensajesCoach(a.id);
      var badge = msgs.length ? "<span style='float:right;background:#C8E000;color:#1C1C1E;border-radius:99px;padding:1px 8px;font-size:11px;font-weight:700;'>" + msgs.length + "</span>" : "";
      return "<div class='coach-card' style='cursor:pointer;padding:12px;margin-bottom:8px;' data-id='" + a.id + "'>" + a.nombre + " " + (a.apellido||"") + badge + "</div>";
    }).join("") + "</div>";
    html += "<div style='flex:1;min-width:260px;' id='hilo-mensajes'><p style='color:#999;padding:20px 0;'>Selecciona un alumno para ver el hilo de mensajes.</p></div></div>";
    $("#sec-mensajes").innerHTML = html;

    document.querySelectorAll("#sec-mensajes [data-id]").forEach(function(c){
      c.addEventListener("click", function(){ renderHilo(this.getAttribute("data-id")); });
    });

    function renderHilo(id){
      var a = window.db.getAlumnoPorId(id);
      var msgs = getMensajesCoach(id);
      var hiloHtml = "<div class='coach-card'>" +
        "<h3 style='margin-bottom:12px;'>" + a.nombre + " " + (a.apellido||"") + "</h3>" +
        "<div style='max-height:320px;overflow-y:auto;margin-bottom:12px;'>" +
        (msgs.length ? msgs.map(function(m){
          return "<div style='background:#0F0F0F;border-radius:8px;padding:10px;margin-bottom:8px;'>" +
            "<div style='font-size:13px;'>" + m.texto + "</div>" +
            "<div style='font-size:11px;color:#555;margin-top:4px;'>" + m.fecha + "</div>" +
          "</div>";
        }).join("") : "<p style='color:#555;font-size:13px;'>Sin mensajes todavía.</p>") +
        "</div>" +
        "<textarea id='msg-nuevo' style='width:100%;padding:10px;background:#0F0F0F;color:#fff;border:1px solid #333;border-radius:8px;min-height:70px;font-family:inherit;font-size:13px;' placeholder='Escribe un mensaje para " + a.nombre + "...'></textarea>" +
        "<button class='btn-coach' id='msg-enviar' style='margin-top:8px;width:100%;'>Enviar mensaje</button></div>";
      $("#hilo-mensajes").innerHTML = hiloHtml;
      $("#msg-enviar").addEventListener("click", function(){
        var txt = ($("#msg-nuevo").value||"").trim();
        if(!txt) return;
        saveMensajeCoach(id, { fecha: window.db.fechaHoy(), texto: txt });
        renderHilo(id);
        window.render_mensajes && setTimeout(function(){ renderHilo(id); }, 0);
      });
    }
  };

  // ── MI GIMNASIO ──────────────────────────────────────────
  window.render_gym = function(){
    var gym = window.db.getGymInfo();
    if(!gym.cupones) gym.cupones = [];
    if(!gym.promociones) gym.promociones = [];
    if(!gym.referidos) gym.referidos = { activo:false, premio_referidor:"", premio_referido:"", descripcion:"" };
    if(!gym.puntos_config) gym.puntos_config = { activo:false, puntos_por_entreno:10, texto_canje:"" };

    var html = "<h1>Mi Gimnasio</h1>" +
      "<p style='color:#999;margin-bottom:18px;max-width:640px;'>Esta sección no es solo para que tus alumnos vean horarios — son herramientas para que <strong style='color:#fff;'>el gimnasio crezca</strong>: cupones que generan ventas en tienda, promociones que atraen nuevas inscripciones, y un programa de referidos que convierte a tus alumnos en vendedores del gym.</p>" +
      "<div class='coach-card coach-form'>" +
      "<label><input type='checkbox' id='gy-activo' " + (gym.activo?"checked":"") + "> Asociar app a un gimnasio</label>" +
      "<label>Nombre</label><input id='gy-nombre' value='" + (gym.nombre||"") + "'>" +
      "<label>Tagline</label><input id='gy-tagline' value='" + (gym.tagline||"") + "'>" +
      "<label>Dirección</label><input id='gy-direccion' value='" + (gym.direccion||"") + "'>" +
      "<div class='row2'><div><label>Teléfono</label><input id='gy-tel' value='" + (gym.telefono||"") + "'></div><div><label>WhatsApp</label><input id='gy-wa' value='" + (gym.whatsapp||"") + "'></div></div>" +
      "<label>Instagram (usuario sin @)</label><input id='gy-ig' value='" + (gym.instagram||"") + "'>" +
      "<button class='btn-coach' id='gy-guardar' style='margin-top:16px;'>Guardar configuración del gym</button></div>";

    html += "<div class='coach-card'><h3 style='margin-bottom:14px;'>🎁 Cupones</h3><div id='gy-cupones-list'></div>" +
      "<button class='btn-coach secondary' id='gy-add-cupon' style='margin-top:8px;'>+ Nuevo cupón</button></div>";

    html += "<div class='coach-card'><h3 style='margin-bottom:14px;'>🗓️ Clases</h3>" +
      "<div id='gy-clases-list'></div>" +
      "<button class='btn-coach secondary' id='gy-add-clase' style='margin-top:8px;'>+ Agregar clase</button></div>";

    html += "<div class='coach-card'><h3 style='margin-bottom:10px;'>🔥 Promociones</h3><div id='gy-promos-list'></div>" +
      "<button class='btn-coach secondary' id='gy-add-promo' style='margin-top:8px;'>+ Nueva promoción</button></div>";

    html += "<div class='coach-card coach-form'><h3 style='margin-bottom:10px;'>👥 Programa de referidos</h3>" +
      "<label><input type='checkbox' id='gy-ref-activo' " + (gym.referidos.activo?"checked":"") + "> Activar programa de referidos</label>" +
      "<label>Descripción para el alumno</label><textarea id='gy-ref-desc'>" + (gym.referidos.descripcion||"") + "</textarea>" +
      "<div class='row2'><div><label>Premio para quien refiere</label><input id='gy-ref-premio1' value='" + (gym.referidos.premio_referidor||"") + "'></div>" +
      "<div><label>Premio para el referido</label><input id='gy-ref-premio2' value='" + (gym.referidos.premio_referido||"") + "'></div></div>" +
      "<button class='btn-coach' id='gy-ref-guardar' style='margin-top:12px;'>Guardar programa de referidos</button></div>";

    html += "<div class='coach-card coach-form'><h3 style='margin-bottom:10px;'>🏆 Puntos de fidelidad</h3>" +
      "<label><input type='checkbox' id='gy-pts-activo' " + (gym.puntos_config.activo?"checked":"") + "> Activar puntos por entrenar</label>" +
      "<div class='row2'><div><label>Puntos por cada entreno</label><input id='gy-pts-valor' type='number' value='" + gym.puntos_config.puntos_por_entreno + "'></div></div>" +
      "<label>Texto de cómo canjear los puntos</label><textarea id='gy-pts-texto'>" + (gym.puntos_config.texto_canje||"") + "</textarea>" +
      "<button class='btn-coach' id='gy-pts-guardar' style='margin-top:12px;'>Guardar configuración de puntos</button></div>";

    $("#sec-gym").innerHTML = html;

    $("#gy-guardar").addEventListener("click", function(){
      gym.activo = $("#gy-activo").checked;
      gym.nombre = $("#gy-nombre").value;
      gym.tagline = $("#gy-tagline").value;
      gym.direccion = $("#gy-direccion").value;
      gym.telefono = $("#gy-tel").value;
      gym.whatsapp = $("#gy-wa").value;
      gym.instagram = $("#gy-ig").value;
      window.db.saveGymInfo(gym);
      window.mostrarToast("Configuración del gym guardada");
    });

    var CUPON_COLORS = [
      { bg:"linear-gradient(135deg,#141F00,#0D1500)", border:"rgba(200,224,0,0.3)", accent:"#C8E000" },
      { bg:"linear-gradient(135deg,#001F14,#000D0A)", border:"rgba(52,199,89,0.3)",  accent:"#34C759" },
      { bg:"linear-gradient(135deg,#1F0D00,#150900)", border:"rgba(255,159,10,0.3)",  accent:"#FF9F0A" },
      { bg:"linear-gradient(135deg,#0D001F,#09000F)", border:"rgba(175,82,222,0.3)",  accent:"#AF52DE" },
      { bg:"linear-gradient(135deg,#1F0014,#0F000A)", border:"rgba(255,55,95,0.3)",   accent:"#FF375F" }
    ];
    function renderCupones(){
      if(!gym.cupones.length){ $("#gy-cupones-list").innerHTML="<p style='color:#777;font-size:.85rem;'>Sin cupones todavía.</p>"; return; }
      $("#gy-cupones-list").innerHTML = "<div style='display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;'>" +
        gym.cupones.map(function(c, i){
          var col = CUPON_COLORS[i % CUPON_COLORS.length];
          var expires = c.vence ? "Vence " + c.vence : "";
          return "<div style='background:" + col.bg + ";border:1px solid " + col.border + ";border-radius:18px;padding:20px;position:relative;overflow:hidden;'>" +
            "<div style='position:absolute;top:-20px;right:-20px;width:80px;height:80px;background:" + col.accent + ";opacity:.07;border-radius:50%;'></div>" +
            "<div style='font-size:10px;font-weight:700;color:" + col.accent + ";text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;'>Cupón</div>" +
            "<div style='font-size:17px;font-weight:800;color:#FFF;margin-bottom:4px;'>" + c.titulo + "</div>" +
            "<div style='font-size:22px;font-weight:900;color:" + col.accent + ";letter-spacing:-1px;margin:8px 0;'>" + (c.descuento||"") + "</div>" +
            "<div style='background:rgba(255,255,255,0.06);border-radius:8px;padding:6px 12px;display:inline-block;font-size:13px;font-weight:700;color:#FFF;letter-spacing:2px;margin-bottom:8px;'>" + (c.codigo||"") + "</div>" +
            (expires ? "<div style='font-size:11px;color:rgba(255,255,255,0.35);'>" + expires + "</div>" : "") +
            "<button class='btn-quitar-cupon' data-i='" + i + "' style='position:absolute;top:10px;right:10px;width:24px;height:24px;background:rgba(255,255,255,0.1);border:none;border-radius:50%;color:#FFF;cursor:pointer;font-size:14px;line-height:1;'>×</button>" +
          "</div>";
        }).join("") + "</div>";
      document.querySelectorAll(".btn-quitar-cupon").forEach(function(b){
        b.addEventListener("click", function(){ gym.cupones.splice(this.getAttribute("data-i"),1); window.db.saveGymInfo(gym); renderCupones(); });
      });
    }
    function renderClases(){
      if(!gym.clases) gym.clases = [];
      var DIAS_SEMANA = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
      var waNum = (gym.whatsapp||"+593969067196").replace(/\D/g,"");
      if(!gym.clases.length){ $("#gy-clases-list").innerHTML="<p style='color:#777;font-size:.85rem;'>Sin clases programadas.</p>"; return; }
      $("#gy-clases-list").innerHTML = gym.clases.map(function(c, i){
        var waMsg = encodeURIComponent("Hola! Quiero reservar la clase de " + c.nombre + " el " + c.dia + " a las " + c.hora);
        return "<div style='background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:14px 16px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:12px;'>" +
          "<div>" +
            "<div style='font-size:14px;font-weight:700;color:#FFF;'>" + c.nombre + "</div>" +
            "<div style='font-size:12px;color:rgba(255,255,255,0.4);margin-top:3px;'>" + c.dia + " · " + c.hora + (c.duracion?" · "+c.duracion+" min":"") + (c.instructor?" · "+c.instructor:"") + "</div>" +
          "</div>" +
          "<div style='display:flex;gap:8px;align-items:center;'>" +
            "<a href='https://wa.me/" + waNum + "?text=" + waMsg + "' target='_blank' rel='noopener' style='font-size:12px;background:rgba(37,211,102,0.15);color:#25D166;border:1px solid rgba(37,211,102,0.3);border-radius:99px;padding:5px 12px;text-decoration:none;font-weight:600;'>WhatsApp</a>" +
            "<button class='btn-del-clase' data-i='" + i + "' style='background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:18px;'>×</button>" +
          "</div>" +
        "</div>";
      }).join("");
      document.querySelectorAll(".btn-del-clase").forEach(function(b){
        b.addEventListener("click", function(){ gym.clases.splice(parseInt(this.getAttribute("data-i"),10),1); window.db.saveGymInfo(gym); renderClases(); });
      });
    }
    function renderPromos(){
      $("#gy-promos-list").innerHTML = gym.promociones.map(function(p, i){
        return "<div class='ejercicio-builder-row'><span>" + p.titulo + " — vence " + p.fecha_fin + "</span>" +
          "<button class='btn-quitar-promo' data-i='" + i + "' style='background:none;border:none;color:#c0392b;cursor:pointer;'>✕</button></div>";
      }).join("") || "<p style='color:#777;font-size:.85rem;'>Sin promociones todavía.</p>";
      document.querySelectorAll(".btn-quitar-promo").forEach(function(b){
        b.addEventListener("click", function(){ gym.promociones.splice(this.getAttribute("data-i"),1); window.db.saveGymInfo(gym); renderPromos(); });
      });
    }
    renderCupones();
    renderPromos();
    renderClases();

    $("#gy-add-cupon").addEventListener("click", function(){
      coachModal("Nuevo cupón", "<div class='coach-form'>" +
        "<label>Título</label><input id='cu-titulo'>" +
        "<label>Descripción</label><textarea id='cu-desc'></textarea>" +
        "<div class='row2'><div><label>Descuento (ej: 10% o 100%)</label><input id='cu-descuento'></div><div><label>Código</label><input id='cu-codigo'></div></div>" +
        "<label>Vence (AAAA-MM-DD)</label><input id='cu-vence' type='date'>" +
        "<button class='btn-coach' id='cu-guardar' style='margin-top:12px;'>Guardar cupón</button></div>", function(){
        $("#cu-guardar").addEventListener("click", function(){
          var titulo = $("#cu-titulo").value.trim();
          if(!titulo) return;
          gym.cupones.push({ id: window.db.generarId("cup"), titulo: titulo, descripcion: $("#cu-desc").value, descuento: $("#cu-descuento").value, codigo: $("#cu-codigo").value, vence: $("#cu-vence").value });
          window.db.saveGymInfo(gym);
          window.cerrarCoachModal();
          renderCupones();
        });
      });
    });

    $("#gy-add-clase").addEventListener("click", function(){
      coachModal("Nueva clase", "<div class='coach-form'>" +
        "<label>Nombre de la clase</label><input id='cl-nombre' placeholder='Ej: CrossFit, Yoga, Spinning...'>" +
        "<div class='row2'><div><label>Día</label><select id='cl-dia'><option>Lunes</option><option>Martes</option><option>Miércoles</option><option>Jueves</option><option>Viernes</option><option>Sábado</option><option>Domingo</option></select></div><div><label>Hora</label><input id='cl-hora' type='time'></div></div>" +
        "<div class='row2'><div><label>Duración (min)</label><input id='cl-duracion' type='number' placeholder='60'></div><div><label>Instructor</label><input id='cl-instructor'></div></div>" +
        "<button class='btn-coach' id='cl-guardar' style='margin-top:12px;'>Guardar clase</button></div>", function(){
        $("#cl-guardar").addEventListener("click", function(){
          var nombre = $("#cl-nombre").value.trim();
          if(!nombre) return;
          if(!gym.clases) gym.clases = [];
          gym.clases.push({ nombre:nombre, dia:$("#cl-dia").value, hora:$("#cl-hora").value, duracion:$("#cl-duracion").value, instructor:$("#cl-instructor").value });
          window.db.saveGymInfo(gym);
          window.cerrarCoachModal();
          renderClases();
        });
      });
    });

    $("#gy-add-promo").addEventListener("click", function(){
      coachModal("Nueva promoción", "<div class='coach-form'>" +
        "<label>Título</label><input id='pr-titulo'>" +
        "<label>Descripción</label><textarea id='pr-desc'></textarea>" +
        "<label>Válido hasta (AAAA-MM-DD)</label><input id='pr-fin' type='date'>" +
        "<label><input type='checkbox' id='pr-destacado'> Destacar esta promoción</label>" +
        "<button class='btn-coach' id='pr-guardar' style='margin-top:12px;'>Guardar promoción</button></div>", function(){
        $("#pr-guardar").addEventListener("click", function(){
          var titulo = $("#pr-titulo").value.trim();
          if(!titulo) return;
          gym.promociones.push({ id: window.db.generarId("promo"), titulo: titulo, descripcion: $("#pr-desc").value, fecha_fin: $("#pr-fin").value, destacado: $("#pr-destacado").checked });
          window.db.saveGymInfo(gym);
          window.cerrarCoachModal();
          renderPromos();
        });
      });
    });

    $("#gy-ref-guardar").addEventListener("click", function(){
      gym.referidos.activo = $("#gy-ref-activo").checked;
      gym.referidos.descripcion = $("#gy-ref-desc").value;
      gym.referidos.premio_referidor = $("#gy-ref-premio1").value;
      gym.referidos.premio_referido = $("#gy-ref-premio2").value;
      window.db.saveGymInfo(gym);
      window.mostrarToast("Programa de referidos guardado");
    });

    $("#gy-pts-guardar").addEventListener("click", function(){
      gym.puntos_config.activo = $("#gy-pts-activo").checked;
      gym.puntos_config.puntos_por_entreno = parseInt($("#gy-pts-valor").value,10) || 10;
      gym.puntos_config.texto_canje = $("#gy-pts-texto").value;
      window.db.saveGymInfo(gym);
      window.mostrarToast("Configuración de puntos guardada");
    });
  };

  // ── VIDEOS ───────────────────────────────────────────────
  window.render_videos = function(){
    var gym = window.db.getGymInfo() || {};
    var edu = gym.videos_educativos || [];
    var rec = gym.videos_recetas    || [];

    function videoRow(v, arr, tipo, i){
      return "<div style='background:#141414;border:1px solid rgba(255,255,255,0.06);border-radius:14px;overflow:hidden;margin-bottom:10px;display:flex;gap:0;'>" +
        (v.thumbnail ? "<img src='" + v.thumbnail + "' style='width:100px;min-width:100px;object-fit:cover;'>" : "<div style='width:100px;min-width:100px;background:#1C1C1C;display:flex;align-items:center;justify-content:center;font-size:28px;'>▶</div>") +
        "<div style='flex:1;padding:12px 14px;'>" +
          "<div style='font-size:14px;font-weight:700;color:#FFF;margin-bottom:2px;'>" + v.titulo + "</div>" +
          (v.subtitulo ? "<div style='font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:4px;'>" + v.subtitulo + "</div>" : "") +
          "<div style='display:flex;align-items:center;gap:8px;'>" +
            (v.categoria ? "<span style='font-size:10px;background:rgba(200,224,0,0.12);color:#C8E000;border-radius:99px;padding:2px 10px;font-weight:600;'>" + v.categoria + "</span>" : "") +
            (v.url ? "<a href='" + v.url + "' target='_blank' style='font-size:11px;color:rgba(255,255,255,0.35);text-decoration:none;'>Ver en YouTube ↗</a>" : "") +
          "</div>" +
        "</div>" +
        "<button data-tipo='" + tipo + "' data-i='" + i + "' class='btn-del-video' style='background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;padding:0 14px;font-size:20px;'>×</button>" +
      "</div>";
    }
    function secHTML(titulo, arr, tipo){
      return "<div class='coach-card' style='margin-bottom:16px;'><h3 style='margin-bottom:10px;'>" + titulo + "</h3>" +
        "<div id='videos-list-" + tipo + "'>" + (arr.map(function(v,i){ return videoRow(v,arr,tipo,i); }).join("")||"<p style='color:#777;font-size:.85rem;'>Vacío.</p>") + "</div>" +
        "<button class='btn-coach secondary btn-add-video' data-tipo='" + tipo + "' style='margin-top:10px;'>+ Agregar video</button></div>";
    }
    $("#sec-videos").innerHTML = "<h1>Videos del Coach</h1>" + secHTML("📚 Educativos / Técnica", edu, "edu") + secHTML("🥗 Recetas fit", rec, "rec");

    document.querySelectorAll(".btn-add-video").forEach(function(b){
      b.addEventListener("click", function(){
        var tipo = this.getAttribute("data-tipo");
        coachModal("Nuevo video", "<div class='coach-form'>" +
          "<label>Título</label><input id='vd-titulo'>" +
          "<label>Categoría</label><select id='vd-cat'><option value='tecnica'>Técnica / Forma</option><option value='calentamiento'>Calentamiento</option><option value='estiramiento'>Estiramiento</option><option value='nutricion'>Nutrición</option><option value='motivacion'>Motivación</option><option value='receta'>Receta fit</option><option value='otro'>Otro</option></select>" +
          "<label>URL de YouTube</label><input id='vd-url' placeholder='https://youtu.be/...' style='margin-bottom:8px;'>" +
          "<div id='vd-thumb-preview' style='display:none;margin-bottom:10px;border-radius:10px;overflow:hidden;'><img id='vd-thumb-img' src='' style='width:100%;max-height:160px;object-fit:cover;display:block;'></div>" +
          "<label>Subtítulo / descripción</label><input id='vd-sub'>" +
          "<button class='btn-coach' id='vd-guardar' style='margin-top:12px;'>Guardar video</button></div>", function(){
          function ytVideoId(url){
            var m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\s]{11})/);
            return m ? m[1] : null;
          }
          document.getElementById("vd-url").addEventListener("input", function(){
            var vid = ytVideoId(this.value.trim());
            var preview = document.getElementById("vd-thumb-preview");
            var img = document.getElementById("vd-thumb-img");
            if(vid){ img.src="https://img.youtube.com/vi/"+vid+"/hqdefault.jpg"; preview.style.display="block"; }
            else { preview.style.display="none"; }
          });
          $("#vd-guardar").addEventListener("click", function(){
            var t = $("#vd-titulo").value.trim();
            if(!t) return;
            var urlVal = (document.getElementById("vd-url").value||"").trim();
            var vid = ytVideoId(urlVal);
            var thumb = vid ? "https://img.youtube.com/vi/"+vid+"/hqdefault.jpg" : "";
            var arr2 = tipo==="edu" ? (gym.videos_educativos||(gym.videos_educativos=[])) : (gym.videos_recetas||(gym.videos_recetas=[]));
            arr2.push({ titulo:t, url:urlVal, subtitulo:(document.getElementById("vd-sub").value||"").trim(), categoria:(document.getElementById("vd-cat").value||"otro"), thumbnail:thumb });
            window.db.saveGymInfo(gym);
            window.cerrarCoachModal();
            window.render_videos();
          });
        });
      });
    });
    document.querySelectorAll(".btn-del-video").forEach(function(b){
      b.addEventListener("click", function(){
        var tipo=this.getAttribute("data-tipo"), i=parseInt(this.getAttribute("data-i"),10);
        var arr2 = tipo==="edu" ? gym.videos_educativos : gym.videos_recetas;
        arr2.splice(i,1);
        window.db.saveGymInfo(gym);
        window.render_videos();
      });
    });
  };

  // ── INTAKES ──────────────────────────────────────────────
  window.render_intakes = function(){
    var intakes = JSON.parse(localStorage.getItem("fitapp_intakes")||"[]");
    var html = "<h1>Formularios Intake</h1>";
    if(intakes.length === 0){
      html += "<div class='coach-card'><p style='color:#777;'>Ningún alumno ha completado el formulario de intake todavía.</p></div>";
    } else {
      html += "<table class='coach-table'><tr><th>Nombre</th><th>Email</th><th>Objetivo</th><th>Fecha</th><th></th></tr>";
      intakes.forEach(function(it, i){
        html += "<tr><td>" + (it.nombre||"—") + "</td><td>" + (it.email||"—") + "</td><td>" + (it.objetivo||"—") + "</td><td>" + (it.fecha||"—") + "</td>" +
          "<td><button class='btn-coach secondary btn-ver-intake' data-i='" + i + "'>Ver</button></td></tr>";
      });
      html += "</table>";
    }
    html += "<div style='margin-top:16px;'><a class='btn-coach' href='../intake.html' target='_blank'>🔗 Enlace del formulario de intake</a></div>";
    $("#sec-intakes").innerHTML = html;

    document.querySelectorAll(".btn-ver-intake").forEach(function(b){
      b.addEventListener("click", function(){
        var it = intakes[parseInt(this.getAttribute("data-i"),10)];
        var rows = Object.keys(it).map(function(k){ return "<tr><td><strong>" + k + "</strong></td><td>" + it[k] + "</td></tr>"; }).join("");
        coachModal("Intake: " + (it.nombre||""), "<table class='coach-table'>" + rows + "</table>", null);
      });
    });
  };

  // ── MULTI-GYM TOGGLE (PARTE 3) ───────────────────────────
  window.render_modo_gym = function(){
    var modos = JSON.parse(localStorage.getItem("fitapp_gyms_coach")||"[]");
    var modoActivo = localStorage.getItem("fitapp_gym_activo") || "";
    if(modos.length === 0) return "";
    var html = "<div class='coach-card' style='margin-bottom:16px;'>" +
      "<h3 style='margin-bottom:10px;'>🏢 Gimnasio activo</h3>" +
      "<div style='display:flex;gap:8px;flex-wrap:wrap;'>" +
      modos.map(function(g){
        var activo = g.id === modoActivo;
        return "<button class='btn-coach" + (activo ? "" : " secondary") + "' onclick='window.setGymActivo(\"" + g.id + "\")' style='font-size:13px;'>" +
          (activo ? "✓ " : "") + g.nombre + "</button>";
      }).join("") +
      "</div></div>";
    return html;
  };
  window.setGymActivo = function(id){
    localStorage.setItem("fitapp_gym_activo", id);
    window.render_gym();
  };

  // Extender render_gym para incluir gestión multi-gym
  var _render_gym_orig = window.render_gym;
  window.render_gym = function(){
    _render_gym_orig();
    // Agregar panel de gestión multi-gym arriba del contenido
    var gymMgmt = "<div class='coach-card' style='margin-bottom:16px;'>" +
      "<h3 style='margin-bottom:10px;'>🔀 Modo multi-gimnasio</h3>" +
      "<p style='color:#999;font-size:13px;margin-bottom:12px;'>Si trabajas en varios gimnasios, puedes gestionar cada uno por separado y cambiar el gym activo con un toque.</p>" +
      "<div id='multi-gym-list' style='margin-bottom:10px;'></div>" +
      "<button class='btn-coach secondary' id='btn-add-gym' style='font-size:13px;'>+ Agregar gimnasio</button></div>";
    var main = $("#sec-gym");
    var h1 = main.querySelector("h1");
    if(h1) h1.insertAdjacentHTML("afterend", gymMgmt);

    var modos = JSON.parse(localStorage.getItem("fitapp_gyms_coach")||"[]");
    var modoActivo = localStorage.getItem("fitapp_gym_activo") || "";
    function renderMultiList(){
      var listEl = document.getElementById("multi-gym-list");
      if(!listEl) return;
      var modos2 = JSON.parse(localStorage.getItem("fitapp_gyms_coach")||"[]");
      if(!modos2.length){ listEl.innerHTML = "<p style='color:#555;font-size:13px;'>Sin gimnasios adicionales.</p>"; return; }
      listEl.innerHTML = modos2.map(function(g){
        var activo = g.id === (localStorage.getItem("fitapp_gym_activo")||"");
        return "<div style='display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #242424;'>" +
          "<span style='font-size:13px;" + (activo ? "color:#C8E000;font-weight:700;" : "") + "'>" + (activo ? "✓ " : "") + g.nombre + "</span>" +
          "<div style='display:flex;gap:6px;'>" +
          "<button class='btn-coach secondary' style='font-size:11px;padding:5px 10px;' onclick='localStorage.setItem(\"fitapp_gym_activo\",\"" + g.id + "\");window.render_gym();'>Activar</button>" +
          "<button class='btn-coach danger' style='font-size:11px;padding:5px 10px;' onclick='(function(){var l=JSON.parse(localStorage.getItem(\"fitapp_gyms_coach\")||\"[]\");localStorage.setItem(\"fitapp_gyms_coach\",JSON.stringify(l.filter(function(x){return x.id!==\"" + g.id + "\";})));window.render_gym();})()'>✕</button>" +
          "</div></div>";
      }).join("");
    }
    renderMultiList();

    var btnAddGym = document.getElementById("btn-add-gym");
    if(btnAddGym) btnAddGym.addEventListener("click", function(){
      coachModal("Nuevo gimnasio", "<div class='coach-form'>" +
        "<label>Nombre del gimnasio</label><input id='ng-nombre' placeholder='Ej: FitZone Norte'>" +
        "<button class='btn-coach' id='ng-guardar' style='margin-top:12px;'>Agregar</button></div>", function(){
        $("#ng-guardar").addEventListener("click", function(){
          var nombre = ($("#ng-nombre").value||"").trim();
          if(!nombre) return;
          var gyms = JSON.parse(localStorage.getItem("fitapp_gyms_coach")||"[]");
          gyms.push({ id: window.db.generarId("gym"), nombre: nombre });
          localStorage.setItem("fitapp_gyms_coach", JSON.stringify(gyms));
          window.cerrarCoachModal();
          window.render_gym();
        });
      });
    });
  };

  // ── INGRESOS (PARTE 4) ───────────────────────────────────
  window.render_ingresos = function(){
    var alumnos = window.db.getAlumnos();
    var hoy = new Date();
    var totalMes = 0;
    var vencenProx = [];
    var pagadosMes = [];

    alumnos.forEach(function(a){
      var precio = parseFloat(a.precio_mensual) || 0;
      var pagos = JSON.parse(localStorage.getItem("fitapp_pagos_" + a.id)||"[]");
      var ultimoPago = pagos.length ? pagos[pagos.length-1] : null;
      var proximoVence = a.fecha_pago_proximo || "";
      var diasRestantes = 999;
      if(proximoVence){
        diasRestantes = Math.round((new Date(proximoVence) - hoy) / 86400000);
      }
      if(ultimoPago && ultimoPago.mes === (hoy.getFullYear() + "-" + String(hoy.getMonth()+1).padStart(2,"0"))){
        totalMes += precio;
        pagadosMes.push({ alumno: a, precio: precio, fecha: ultimoPago.fecha });
      }
      if(diasRestantes <= 7){
        vencenProx.push({ alumno: a, precio: precio, diasRestantes: diasRestantes, proximoVence: proximoVence });
      }
    });

    var html = "<h1>💰 Ingresos</h1>";

    // KPIs
    html += "<div class='coach-grid-stats'>" +
      "<div class='cstat'><div class='cs-val'>$" + totalMes.toFixed(0) + "</div><div class='cs-label'>Recaudado este mes</div></div>" +
      "<div class='cstat'><div class='cs-val'>" + alumnos.filter(function(a){ return parseFloat(a.precio_mensual) > 0; }).length + "</div><div class='cs-label'>Alumnos con tarifa</div></div>" +
      "<div class='cstat'><div class='cs-val'>" + vencenProx.length + "</div><div class='cs-label'>Vencen en 7 días</div></div>" +
      "<div class='cstat'><div class='cs-val'>$" + alumnos.reduce(function(s,a){ return s + (parseFloat(a.precio_mensual)||0); }, 0).toFixed(0) + "</div><div class='cs-label'>Potencial mensual</div></div>" +
    "</div>";

    // Alertas próximos vencimientos
    if(vencenProx.length){
      html += "<div class='coach-card'><h3 style='margin-bottom:12px;color:#FF9500;'>⚠️ Vencen pronto</h3>";
      vencenProx.forEach(function(v){
        var label = v.diasRestantes < 0 ? "Vencido hace " + Math.abs(v.diasRestantes) + " días" : (v.diasRestantes === 0 ? "Vence hoy" : "Vence en " + v.diasRestantes + " día" + (v.diasRestantes!==1?"s":""));
        var color = v.diasRestantes < 0 ? "#FF453A" : (v.diasRestantes <= 2 ? "#FF9500" : "#C8E000");
        html += "<div style='display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #242424;'>" +
          "<div><div style='font-weight:600;'>" + v.alumno.nombre + " " + (v.alumno.apellido||"") + "</div>" +
          "<div style='font-size:12px;color:" + color + ";margin-top:2px;'>" + label + " · $" + (v.precio||0) + "/mes</div></div>" +
          "<button class='btn-coach' style='font-size:12px;padding:7px 14px;' onclick='window.marcarPagoRecibido(\"" + v.alumno.id + "\")'>✓ Marcar pagado</button>" +
        "</div>";
      });
      html += "</div>";
    }

    // Tabla general de alumnos + tarifas
    html += "<div class='coach-card'><h3 style='margin-bottom:12px;'>Tarifas y pagos</h3>" +
      "<table class='coach-table'><tr><th>Alumno</th><th>Tarifa/mes</th><th>Próximo cobro</th><th>Estado</th><th></th></tr>";
    alumnos.forEach(function(a){
      var precio = parseFloat(a.precio_mensual) || 0;
      var vence = a.fecha_pago_proximo || "—";
      var pagos = JSON.parse(localStorage.getItem("fitapp_pagos_" + a.id)||"[]");
      var mesPago = hoy.getFullYear() + "-" + String(hoy.getMonth()+1).padStart(2,"0");
      var pagadoEsteMes = pagos.some(function(p){ return p.mes === mesPago; });
      var estado = precio === 0 ? "<span style='color:#555;'>Sin tarifa</span>" :
        (pagadoEsteMes ? "<span style='color:#34C759;'>✓ Pagado</span>" : "<span style='color:#FF453A;'>Pendiente</span>");
      html += "<tr><td>" + a.nombre + " " + (a.apellido||"") + "</td>" +
        "<td>$" + (precio||0) + "</td>" +
        "<td>" + vence + "</td>" +
        "<td>" + estado + "</td>" +
        "<td><button class='btn-coach secondary' style='font-size:11px;padding:5px 10px;' onclick='window.abrirEditarTarifa(\"" + a.id + "\")'>Editar</button>" +
        (precio > 0 && !pagadoEsteMes ? " <button class='btn-coach' style='font-size:11px;padding:5px 10px;' onclick='window.marcarPagoRecibido(\"" + a.id + "\")'>Cobrado</button>" : "") +
        "</td></tr>";
    });
    html += "</table></div>";

    // Historial de pagos
    var todosPagos = [];
    alumnos.forEach(function(a){
      var pagos = JSON.parse(localStorage.getItem("fitapp_pagos_" + a.id)||"[]");
      pagos.forEach(function(p){ todosPagos.push({ nombre: a.nombre + " " + (a.apellido||""), monto: p.monto, fecha: p.fecha, mes: p.mes }); });
    });
    todosPagos.sort(function(a,b){ return b.fecha > a.fecha ? 1 : -1; });
    if(todosPagos.length){
      html += "<div class='coach-card'><h3 style='margin-bottom:12px;'>Historial de cobros</h3>" +
        "<table class='coach-table'><tr><th>Alumno</th><th>Monto</th><th>Fecha</th><th>Mes</th></tr>";
      todosPagos.slice(0,20).forEach(function(p){
        html += "<tr><td>" + p.nombre + "</td><td style='color:#C8E000;'>$" + p.monto + "</td><td>" + p.fecha + "</td><td>" + p.mes + "</td></tr>";
      });
      html += "</table></div>";
    }

    $("#sec-ingresos").innerHTML = html;
  };

  window.marcarPagoRecibido = function(alumnoId){
    var a = window.db.getAlumnoPorId(alumnoId);
    if(!a) return;
    var hoy = new Date();
    var mes = hoy.getFullYear() + "-" + String(hoy.getMonth()+1).padStart(2,"0");
    var pagos = JSON.parse(localStorage.getItem("fitapp_pagos_" + alumnoId)||"[]");
    pagos.push({ mes: mes, fecha: window.db.fechaHoy(), monto: parseFloat(a.precio_mensual)||0 });
    localStorage.setItem("fitapp_pagos_" + alumnoId, JSON.stringify(pagos));
    // Calcular próximo vencimiento (+1 mes)
    var proxVence = new Date(hoy); proxVence.setMonth(proxVence.getMonth()+1);
    a.fecha_pago_proximo = proxVence.toISOString().split("T")[0];
    window.db.saveAlumno(a);
    window.render_ingresos();
  };

  window.abrirEditarTarifa = function(alumnoId){
    var a = window.db.getAlumnoPorId(alumnoId);
    if(!a) return;
    coachModal("Tarifa de " + a.nombre, "<div class='coach-form'>" +
      "<label>Precio mensual ($)</label><input id='et-precio' type='number' value='" + (a.precio_mensual||0) + "'>" +
      "<label>Fecha próximo pago (AAAA-MM-DD)</label><input id='et-vence' type='date' value='" + (a.fecha_pago_proximo||"") + "'>" +
      "<button class='btn-coach' id='et-guardar' style='margin-top:14px;'>Guardar</button></div>", function(){
      $("#et-guardar").addEventListener("click", function(){
        a.precio_mensual = parseFloat($("#et-precio").value)||0;
        a.fecha_pago_proximo = $("#et-vence").value;
        window.db.saveAlumno(a);
        window.cerrarCoachModal();
        window.render_ingresos();
      });
    });
  };

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll("#coach-sidebar [data-sec]").forEach(function(b){
      b.addEventListener("click", function(){ showSec(this.getAttribute("data-sec")); });
    });

    var mainEl = document.querySelector("#coach-app main") || document.getElementById("coach-app");
    var loadEl = document.createElement("div");
    loadEl.id = "coach-db-loading";
    loadEl.style.cssText = "position:fixed;inset:0;z-index:999;background:#0A0A0A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;";
    loadEl.innerHTML =
      '<div style="font-size:40px;">🏋️</div>' +
      '<div style="color:#C8E000;font-weight:800;font-size:16px;">Cargando panel...</div>' +
      '<div style="width:160px;height:3px;background:#1a1a1a;border-radius:99px;overflow:hidden;">' +
        '<div id="coach-load-bar" style="height:100%;width:0;background:#C8E000;border-radius:99px;transition:width 2s ease;"></div>' +
      '</div>';
    document.body.appendChild(loadEl);
    setTimeout(function(){ var b = document.getElementById("coach-load-bar"); if(b) b.style.width = "80%"; }, 50);

    window.db.initCoach()
      .then(function(){
        loadEl.remove();
        showSec("dashboard");
      })
      .catch(function(err){
        console.error("[coach] db.initCoach error:", err);
        loadEl.innerHTML =
          '<div style="text-align:center;color:#ff6b6b;padding:32px;">' +
            '<div style="font-size:36px;margin-bottom:12px;">⚠️</div>' +
            '<div style="font-weight:700;">Sin conexión a Supabase</div>' +
            '<div style="color:rgba(255,255,255,0.5);font-size:13px;margin-top:8px;">Verifica SB_URL y SB_KEY en db.js</div>' +
          '</div>';
      });
  });
})();

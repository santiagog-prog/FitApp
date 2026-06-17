// ════════════════════════════════════════════════════════════
// coach.js — Panel del entrenador. Router de secciones + CRUD.
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";
  function safe(fn, name){ try{ fn(); }catch(e){ console.error("[coach] " + name, e); } }
  function $(sel){ return document.querySelector(sel); }
  function el(html){ var d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }

  var SECCIONES = ["dashboard","alumnos","rutinas","alimentacion","ejercicios","mensajes","gym","videos","intakes"];

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

    var html = "<h1>Dashboard</h1><div class='coach-grid-stats'>" +
      "<div class='cstat'><div class='cs-val'>" + alumnos.length + "</div><div class='cs-label'>Alumnos activos</div></div>" +
      "<div class='cstat'><div class='cs-val'>" + rutinas.length + "</div><div class='cs-label'>Rutinas creadas</div></div>" +
      "<div class='cstat'><div class='cs-val'>" + planes.length + "</div><div class='cs-label'>Planes activos</div></div>" +
      "<div class='cstat'><div class='cs-val'>" + entrenaronHoy + "</div><div class='cs-label'>Entrenaron hoy</div></div>" +
      "</div>";

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

    $("#sec-dashboard").innerHTML = html;
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
        html = "<div class='coach-card'>" +
          "<p>Objetivo: " + a.objetivo.replace("_"," ") + " · Nivel: " + a.nivel + "</p>" +
          "<p>Peso inicial: " + a.peso_inicial + " kg · Peso actual: " + a.peso_actual + " kg</p>" +
          "<p>Código de acceso: " + a.codigo + " · Inicio: " + a.fecha_inicio + "</p></div>";
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
        html = "<div class='coach-card'><p>" + regs.length + " entrenamientos registrados · racha actual " + window.db.calcularRacha(a.id) + " días</p>" +
          "<p>Últimos pesos: " + pesos.slice(-5).map(function(p){return p.kg+"kg ("+p.fecha+")";}).join(", ") + "</p>" +
          "<p>Medallas desbloqueadas: " + medallas.length + " / " + window.db.MEDALLAS_DEF.length + "</p></div>";
      } else if(tabActivo === "notas"){
        var notas = window.db.getNotas(a.id);
        html = "<div class='coach-card'>" + notas.map(function(n){ return "<p style='margin-bottom:8px;border-bottom:1px solid #242424;padding-bottom:8px;'>" + n.fecha + " — " + n.texto + "</p>"; }).join("") +
          "<textarea id='nueva-nota' placeholder='Escribe una nota de seguimiento...' style='width:100%;margin-top:10px;padding:10px;border-radius:8px;background:#0F0F0F;color:#fff;border:1px solid #333;'></textarea>" +
          "<button class='btn-coach' id='btn-enviar-nota' style='margin-top:8px;'>Enviar nota</button></div>";
      }
      box.innerHTML = html;

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
  window.render_mensajes = function(){
    var alumnos = window.db.getAlumnos();
    var html = "<h1>Mensajes</h1><div style='display:flex;gap:20px;'>";
    html += "<div style='width:240px;'>" + alumnos.map(function(a){
      var sinLeer = window.db.getNotas(a.id).filter(function(n){ return false; }).length;
      return "<div class='coach-card' style='cursor:pointer;padding:12px;' data-id='" + a.id + "'>" + a.nombre + " " + (a.apellido||"") + "</div>";
    }).join("") + "</div>";
    html += "<div style='flex:1;' id='hilo-mensajes'><p style='color:#999;'>Selecciona un alumno para ver sus notas.</p></div></div>";
    $("#sec-mensajes").innerHTML = html;

    document.querySelectorAll("#sec-mensajes [data-id]").forEach(function(c){
      c.addEventListener("click", function(){ renderHilo(this.getAttribute("data-id")); });
    });
    function renderHilo(id){
      var a = window.db.getAlumnoPorId(id);
      var notas = window.db.getNotas(id);
      var html2 = "<div class='coach-card'>" + notas.map(function(n){ return "<p style='border-bottom:1px solid #242424;padding:8px 0;'>" + n.fecha + " — " + n.texto + "</p>"; }).join("") +
        "<textarea id='msg-nuevo' style='width:100%;margin-top:10px;padding:10px;background:#0F0F0F;color:#fff;border:1px solid #333;border-radius:8px;' placeholder='Nueva nota para " + a.nombre + "'></textarea>" +
        "<button class='btn-coach' id='msg-enviar' style='margin-top:8px;'>Enviar nota</button></div>";
      $("#hilo-mensajes").innerHTML = html2;
      $("#msg-enviar").addEventListener("click", function(){
        var txt = $("#msg-nuevo").value.trim();
        if(!txt) return;
        window.db.saveNota(id, { fecha: window.db.fechaHoy(), texto: txt, leida:false });
        renderHilo(id);
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

    html += "<div class='coach-card'><h3 style='margin-bottom:10px;'>🎁 Cupones</h3><div id='gy-cupones-list'></div>" +
      "<button class='btn-coach secondary' id='gy-add-cupon' style='margin-top:8px;'>+ Nuevo cupón</button></div>";

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

    function renderCupones(){
      $("#gy-cupones-list").innerHTML = gym.cupones.map(function(c, i){
        return "<div class='ejercicio-builder-row'><span>" + c.titulo + " — " + c.descuento + " — código " + c.codigo + " — vence " + c.vence + "</span>" +
          "<button class='btn-quitar-cupon' data-i='" + i + "' style='background:none;border:none;color:#c0392b;cursor:pointer;'>✕</button></div>";
      }).join("") || "<p style='color:#777;font-size:.85rem;'>Sin cupones todavía.</p>";
      document.querySelectorAll(".btn-quitar-cupon").forEach(function(b){
        b.addEventListener("click", function(){ gym.cupones.splice(this.getAttribute("data-i"),1); window.db.saveGymInfo(gym); renderCupones(); });
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
      return "<div class='ejercicio-builder-row'><span>" + v.titulo + (v.url ? " — <a href='" + v.url + "' target='_blank' style='color:#C8E000;'>" + v.url.slice(0,40) + "…</a>" : " — sin enlace") + "</span>" +
        "<button data-tipo='" + tipo + "' data-i='" + i + "' class='btn-del-video' style='background:none;border:none;color:#c0392b;cursor:pointer;'>✕</button></div>";
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
          "<label>URL de YouTube</label><input id='vd-url' placeholder='https://youtu.be/...'>" +
          "<label>Subtítulo / descripción</label><input id='vd-sub'>" +
          "<button class='btn-coach' id='vd-guardar' style='margin-top:12px;'>Guardar video</button></div>", function(){
          $("#vd-guardar").addEventListener("click", function(){
            var t = $("#vd-titulo").value.trim();
            if(!t) return;
            var arr2 = tipo==="edu" ? (gym.videos_educativos||(gym.videos_educativos=[])) : (gym.videos_recetas||(gym.videos_recetas=[]));
            arr2.push({ titulo:t, url:$("#vd-url").value.trim(), subtitulo:$("#vd-sub").value.trim() });
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

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll("#coach-sidebar [data-sec]").forEach(function(b){
      b.addEventListener("click", function(){ showSec(this.getAttribute("data-sec")); });
    });
    showSec("dashboard");
  });
})();

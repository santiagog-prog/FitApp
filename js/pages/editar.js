// ════════════════════════════════════════════════════════════
// editar.js — Página para editar datos personales, dieta y pesos
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  function page(){ return document.getElementById("page-editar"); }

  function renderSeccion(titulo, contenido){
    return "<div style='margin:0 16px 16px;background:var(--surface);border-radius:var(--radius-lg);border:1px solid var(--border);box-shadow:var(--shadow-card);overflow:hidden;'>" +
      "<div style='padding:14px 16px 10px;border-bottom:1px solid var(--border);'>" +
        "<div style='font-size:13px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;'>" + titulo + "</div>" +
      "</div>" +
      "<div style='padding:8px 0;'>" + contenido + "</div>" +
    "</div>";
  }

  function renderFila(label, id, tipo, valor, placeholder){
    tipo = tipo || "text";
    return "<div style='display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border);'>" +
      "<label for='" + id + "' style='font-size:15px;font-weight:500;color:var(--text);flex:1;'>" + label + "</label>" +
      "<input id='" + id + "' type='" + tipo + "' value='" + (valor||"") + "' placeholder='" + (placeholder||"") + "' " +
        "style='text-align:right;border:none;outline:none;background:transparent;font-size:15px;font-weight:600;color:var(--accent-text);font-family:inherit;width:120px;'>" +
    "</div>";
  }

  window.init_editar = function(){
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    if(!alumno) return;

    var plan = alumno.plan_alimentacion_id ? window.db.getPlanPorId(alumno.plan_alimentacion_id) : null;
    var pesos = window.db.getPesos ? window.db.getPesos(alumno.id) : [];
    var ultimoPeso = pesos.length > 0 ? pesos[pesos.length-1].valor : (alumno.peso_kg || "");

    var html =
      "<div style='padding-bottom:100px;'>" +

      // Header
      "<div style='padding:20px 16px 12px;'>" +
        "<div style='font-size:26px;font-weight:800;letter-spacing:-.5px;color:var(--text);'>Editar perfil</div>" +
        "<div style='font-size:14px;color:var(--text-muted);margin-top:2px;'>Actualiza tus datos y configuración</div>" +
      "</div>" +

      // Datos personales
      renderSeccion("Datos personales",
        renderFila("Nombre", "ed-nombre", "text", alumno.nombre, "Tu nombre") +
        renderFila("Peso actual (kg)", "ed-peso", "number", ultimoPeso, "65") +
        renderFila("Altura (cm)", "ed-altura", "number", alumno.altura_cm || "", "167") +
        renderFila("Edad (años)", "ed-edad", "number", alumno.edad || "", "19") +
        "<div style='padding:12px 16px 4px;'>" +
          "<div style='font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:6px;'>Objetivo</div>" +
          "<div id='ed-objetivo-opts' style='display:flex;gap:8px;flex-wrap:wrap;'>" +
            ["Definición", "Volumen", "Mantenimiento", "Fuerza"].map(function(obj){
              var sel = (alumno.objetivo || "Definición") === obj;
              return "<button class='ed-obj-btn' data-obj='" + obj + "' style='padding:7px 14px;border-radius:50px;border:1.5px solid " + (sel?"#C8E000":"var(--border)") + ";background:" + (sel?"#C8E000":"var(--surface)") + ";color:" + (sel?"#1C1C1E":"var(--text)") + ";font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;'>" + obj + "</button>";
            }).join("") +
          "</div>" +
        "</div>"
      ) +

      // Dieta
      renderSeccion("Plan de alimentación",
        (function(){
          var planes = window.db.getPlanes ? window.db.getPlanes() : [];
          if(!planes.length) return "<div style='padding:16px;color:var(--text-muted);font-size:14px;'>No hay planes disponibles.</div>";
          return planes.map(function(p){
            var activo = plan && plan.id === p.id;
            return "<div class='ed-plan-row' data-plan='" + p.id + "' style='display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid var(--border);cursor:pointer;'>" +
              "<div>" +
                "<div style='font-size:15px;font-weight:600;color:var(--text);'>" + p.nombre + "</div>" +
                "<div style='font-size:12px;color:var(--text-muted);margin-top:2px;'>" + (p.calorias_objetivo||0) + " kcal · " + (p.proteinas_g||0) + "g prot</div>" +
              "</div>" +
              "<div style='width:22px;height:22px;border-radius:50%;border:2px solid " + (activo?"#C8E000":"var(--border)") + ";background:" + (activo?"#C8E000":"transparent") + ";display:flex;align-items:center;justify-content:center;'>" +
                (activo ? "<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#1C1C1E' stroke-width='3' stroke-linecap='round'><polyline points='20 6 9 17 4 12'/></svg>" : "") +
              "</div>" +
            "</div>";
          }).join("");
        })()
      ) +

      // Registro de peso
      renderSeccion("Registrar peso hoy",
        "<div style='padding:14px 16px;'>" +
          "<div style='display:flex;align-items:center;gap:12px;margin-bottom:12px;'>" +
            "<input id='ed-nuevo-peso' type='number' inputmode='decimal' placeholder='kg' " +
              "style='flex:1;height:48px;background:var(--surface2);border:1px solid var(--border);border-radius:12px;text-align:center;font-size:20px;font-weight:700;color:var(--text);font-family:inherit;outline:none;'>" +
            "<button id='ed-btn-peso' style='height:48px;padding:0 20px;background:#C8E000;color:#1C1C1E;border:none;border-radius:12px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap;'>Guardar</button>" +
          "</div>" +
          (pesos.length > 0
            ? "<div style='font-size:12px;color:var(--text-muted);'>Último registro: " + ultimoPeso + " kg</div>"
            : "") +
        "</div>"
      ) +

      // Botón guardar todo
      "<div style='padding:0 16px 16px;'>" +
        "<button id='ed-btn-guardar' style='width:100%;height:52px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;box-shadow:0 4px 16px rgba(168,188,0,0.28);'>" +
          "Guardar cambios" +
        "</button>" +
      "</div>" +

      // Cerrar sesión
      "<div style='padding:0 16px 32px;'>" +
        "<button id='ed-btn-logout' style='width:100%;height:48px;background:transparent;border:1.5px solid var(--border);border-radius:50px;font-size:15px;font-weight:600;color:var(--text-muted);font-family:inherit;cursor:pointer;'>" +
          "Cerrar sesión" +
        "</button>" +
      "</div>" +

      "</div>";

    page().innerHTML = html;

    // Objetivo pills
    var objSeleccionado = alumno.objetivo || "Definición";
    page().querySelectorAll(".ed-obj-btn").forEach(function(btn){
      btn.addEventListener("click", function(){
        objSeleccionado = this.getAttribute("data-obj");
        page().querySelectorAll(".ed-obj-btn").forEach(function(b){
          var s = b.getAttribute("data-obj") === objSeleccionado;
          b.style.background = s ? "#C8E000" : "var(--surface)";
          b.style.borderColor = s ? "#C8E000" : "var(--border)";
          b.style.color = s ? "#1C1C1E" : "var(--text)";
        });
      });
    });

    // Plan selection
    var planSeleccionado = alumno.plan_alimentacion_id;
    page().querySelectorAll(".ed-plan-row").forEach(function(row){
      row.addEventListener("click", function(){
        planSeleccionado = this.getAttribute("data-plan");
        page().querySelectorAll(".ed-plan-row").forEach(function(r){
          var activo = r.getAttribute("data-plan") === planSeleccionado;
          var dot = r.querySelector("div[style*='border-radius:50%']");
          if(dot){
            dot.style.borderColor = activo ? "#C8E000" : "var(--border)";
            dot.style.background = activo ? "#C8E000" : "transparent";
            dot.innerHTML = activo ? "<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='#1C1C1E' stroke-width='3' stroke-linecap='round'><polyline points='20 6 9 17 4 12'/></svg>" : "";
          }
        });
      });
    });

    // Guardar peso individual
    document.getElementById("ed-btn-peso").addEventListener("click", function(){
      var val = parseFloat(document.getElementById("ed-nuevo-peso").value);
      if(!val || val < 30 || val > 300){ window.mostrarToast("⚠️ Peso inválido"); return; }
      if(window.db.addPeso) window.db.addPeso(alumno.id, val);
      window.mostrarToast("✓ " + val + " kg registrado");
      document.getElementById("ed-nuevo-peso").value = "";
    });

    // Guardar todo
    document.getElementById("ed-btn-guardar").addEventListener("click", function(){
      var cambios = {
        nombre: (document.getElementById("ed-nombre").value || alumno.nombre).trim(),
        peso_kg: parseFloat(document.getElementById("ed-peso").value) || alumno.peso_kg,
        altura_cm: parseInt(document.getElementById("ed-altura").value) || alumno.altura_cm,
        edad: parseInt(document.getElementById("ed-edad").value) || alumno.edad,
        objetivo: objSeleccionado,
        plan_alimentacion_id: planSeleccionado
      };
      if(window.db.updateAlumno) window.db.updateAlumno(alumno.id, cambios);
      window.mostrarToast("✓ Perfil actualizado");
    });

    // Logout
    document.getElementById("ed-btn-logout").addEventListener("click", function(){
      if(confirm("¿Cerrar sesión?")){
        window.db.clearSesion();
        location.href = "../index.html";
      }
    });
  };

})();

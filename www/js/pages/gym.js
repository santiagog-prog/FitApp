// ════════════════════════════════════════════════════════════
// gym.js — Page Mi Gimnasio
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  var DIAS_L = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

  function estaAbierto(gym){
    var ahora = new Date();
    var h = ahora.getHours() + ahora.getMinutes()/60;
    var diaIdx = ahora.getDay(); // 0=domingo
    var regla = gym.horarios_atencion[0];
    if(diaIdx === 0) regla = gym.horarios_atencion.filter(function(r){ return r.dias === "Domingo"; })[0] || regla;
    else if(diaIdx === 6) regla = gym.horarios_atencion.filter(function(r){ return r.dias === "Sábado"; })[0] || regla;
    if(!regla) return false;
    var ap = parseInt(regla.apertura.split(":")[0],10) + parseInt(regla.apertura.split(":")[1],10)/60;
    var ci = parseInt(regla.cierre.split(":")[0],10) + parseInt(regla.cierre.split(":")[1],10)/60;
    return h >= ap && h < ci;
  }

  window.init_gym = function(){
    var gym = window.db.getGymInfo();
    var header = document.getElementById("app-header");
    header.innerHTML = "<div class='ssh-back' id='gym-back' style='cursor:pointer;'>← <span>" + (gym.nombre||"Mi Gimnasio") + "</span></div>";

    if(!gym.activo){
      document.getElementById("page-gym").innerHTML = "<p class='px'>Tu entrenador aún no asoció un gimnasio a la app.</p>";
      document.getElementById("gym-back").addEventListener("click", function(){ window.irAPagina("inicio"); });
      return;
    }

    var html = "<div class='px'>";
    html += "<h2 style='margin-bottom:4px;'>" + gym.nombre + "</h2><p style='color:var(--text-muted);margin-bottom:6px;'>" + gym.tagline + "</p>";
    html += "<p style='font-size:.85rem;margin-bottom:10px;'>📍 " + gym.direccion + "</p>";
    html += "<a class='outline-btn' style='display:block;text-align:center;margin-bottom:14px;' href='" + gym.maps_url + "' target='_blank' rel='noopener'>Cómo llegar</a></div>";

    html += "<div class='px'><div class='gym-contact-row'>" +
      "<a href='tel:" + gym.telefono + "'>📞 Llamar</a>" +
      "<a href='https://wa.me/" + gym.whatsapp.replace(/[^0-9]/g,"") + "' target='_blank' rel='noopener'>💬 WhatsApp</a>" +
      "<a href='https://instagram.com/" + gym.instagram + "' target='_blank' rel='noopener'>📸 Instagram</a>" +
      "</div></div>";

    var abierto = estaAbierto(gym);
    html += "<div class='gym-section'><h3>Horarios de atención <span style='float:right;font-size:.78rem;color:" + (abierto?"var(--green)":"var(--red)") + ";'>" + (abierto?"🟢 Abierto ahora":"🔴 Cerrado") + "</span></h3>";
    gym.horarios_atencion.forEach(function(h){
      html += "<div class='gym-horario-row'><span>" + h.dias + "</span><span>" + h.apertura + " → " + h.cierre + "</span></div>";
    });
    html += "</div>";

    var diaHoyIdx = (new Date().getDay()+6)%7;
    html += "<div class='gym-section'><h3>Clases de hoy (" + DIAS_L[diaHoyIdx] + ")</h3>";
    var clasesHoy = gym.clases.filter(function(c){ return c.dia === diaHoyIdx; });
    if(clasesHoy.length === 0){
      html += "<p style='font-size:.85rem;color:var(--text-muted);'>No hay clases programadas hoy.</p>";
    } else {
      clasesHoy.forEach(function(c){
        var msg = "Hola " + gym.nombre + "! Quiero reservar plaza en " + c.nombre + " del " + DIAS_L[diaHoyIdx] + " a las " + c.hora + ". Soy " + (window.db.getAlumnoPorId(window.ALUMNO_ID)||{}).nombre + ".";
        html += "<div class='gym-clase-row'><div><strong>" + c.hora + "</strong> " + c.nombre + "<br><span style='color:var(--text-muted);'>" + c.instructor + " · " + c.plazas_disponibles + "/" + c.plazas_total + "</span></div>" +
          "<a class='btn-reservar-gym' href='https://wa.me/" + gym.whatsapp.replace(/[^0-9]/g,"") + "?text=" + encodeURIComponent(msg) + "' target='_blank' rel='noopener'>Reservar</a></div>";
      });
    }
    html += "</div>";

    html += "<div class='gym-section'><h3>Servicios</h3><div class='servicios-grid'>";
    var iconos = { pesas:"🏋️", spinning:"🚴", yoga:"🧘", vestuarios:"🚿", suplementos:"🧴", cardio:"🏃" };
    gym.servicios.forEach(function(s){ html += "<div><div class='sg-icon'>" + (iconos[s.icono]||"⭐") + "</div>" + s.nombre + "</div>"; });
    html += "</div></div>";

    var alumnoActual = window.db.getAlumnoPorId(window.ALUMNO_ID);
    var entrenosTotal = window.db.getRegistros(alumnoActual.id).length;

    if(gym.cupones && gym.cupones.length){
      html += "<div class='gym-section'><h3>🎁 Cupones y promociones</h3>";
      gym.cupones.forEach(function(c){
        var msg = "Hola " + gym.nombre + "! Quiero usar el cupón " + c.titulo + " (código " + c.codigo + "). Soy " + alumnoActual.nombre + ".";
        html += "<div class='cupon-card'><div class='cupon-top'><strong>" + c.titulo + "</strong><span class='cupon-desc-badge'>" + c.descuento + "</span></div>" +
          "<p class='cupon-texto'>" + c.descripcion + "</p>" +
          "<div class='cupon-bottom'><span class='cupon-codigo'>" + c.codigo + "</span><span class='cupon-vence'>Vence " + c.vence + "</span></div>" +
          "<a class='btn-reservar-gym' style='display:block;text-align:center;margin-top:8px;' href='https://wa.me/" + gym.whatsapp.replace(/[^0-9]/g,"") + "?text=" + encodeURIComponent(msg) + "' target='_blank' rel='noopener'>Usar cupón</a></div>";
      });
      html += "</div>";
    }

    if(gym.promociones && gym.promociones.length){
      html += "<div class='gym-section'><h3>🔥 Promociones activas</h3>";
      gym.promociones.forEach(function(p){
        html += "<div class='promo-card" + (p.destacado ? " destacada" : "") + "'><strong>" + p.titulo + "</strong>" +
          "<p>" + p.descripcion + "</p><span class='promo-vence'>Válido hasta " + p.fecha_fin + "</span></div>";
      });
      html += "</div>";
    }

    if(gym.referidos && gym.referidos.activo){
      var codigoReferido = alumnoActual.codigo;
      var msgRef = "¡Hola! Te invito a entrenar en " + gym.nombre + " 💪. Usa mi código " + codigoReferido + " al inscribirte y los dos ganamos un premio.";
      html += "<div class='gym-section referidos-card'><h3>👥 Trae un amigo, gana los dos</h3>" +
        "<p style='font-size:.85rem;margin-bottom:8px;'>" + gym.referidos.descripcion + "</p>" +
        "<div class='referido-premios'><div>🎁 Tú recibes<br><strong>" + gym.referidos.premio_referidor + "</strong></div>" +
        "<div>🎁 Tu amigo recibe<br><strong>" + gym.referidos.premio_referido + "</strong></div></div>" +
        "<div class='referido-codigo-box'>Tu código: <strong>" + codigoReferido + "</strong></div>" +
        "<a class='pill-btn' style='display:block;text-align:center;margin-top:10px;' href='https://wa.me/?text=" + encodeURIComponent(msgRef) + "' target='_blank' rel='noopener'>Compartir invitación</a></div>";
    }

    if(gym.puntos_config && gym.puntos_config.activo){
      var puntos = entrenosTotal * gym.puntos_config.puntos_por_entreno;
      html += "<div class='gym-section'><h3>🏆 Tus puntos de fidelidad</h3>" +
        "<div class='puntos-num'>" + puntos + " pts</div>" +
        "<p style='font-size:.8rem;color:var(--text-muted);'>" + gym.puntos_config.texto_canje + "</p></div>";
    }

    html += "<div class='gym-section'><h3>Anuncios</h3>";
    gym.anuncios.forEach(function(a){
      html += "<div class='anuncio-card'><div class='an-fecha'>" + a.fecha + "</div><strong>" + a.titulo + "</strong><p style='font-size:.85rem;margin-top:4px;'>" + a.texto + "</p></div>";
    });
    html += "</div>";

    html += "<div class='gym-section'><details class='normas-acordeon'><summary>📋 Normas del gimnasio</summary><ul>" +
      gym.normas.map(function(n){ return "<li>" + n + "</li>"; }).join("") + "</ul></details></div>";

    document.getElementById("page-gym").innerHTML = html;
    document.getElementById("gym-back").addEventListener("click", function(){ window.irAPagina("inicio"); });
  };
})();

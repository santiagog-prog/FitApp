// ════════════════════════════════════════════════════════════
// inicio.js — Page Home del alumno
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  var FRASES = [
    "La consistencia gana a la intensidad. Siempre.",
    "No cuentes los días, haz que los días cuenten.",
    "El cuerpo logra lo que la mente cree.",
    "Pequeños progresos diarios construyen grandes resultados.",
    "Hoy es un buen día para ser mejor que ayer.",
    "El dolor de hoy es la fuerza de mañana.",
    "No se trata de ser perfecto, se trata de no rendirse."
  ];

  function iniciales(nombre, apellido){
    return ((nombre||"")[0]||"") + ((apellido||"")[0]||"");
  }

  function saludoHora(){
    var h = new Date().getHours();
    if(h < 12) return "Buenos días";
    if(h < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  window.init_inicio = function(){
    var alumno = window.db.getAlumnoPorId(window.ALUMNO_ID);
    if(!alumno) return;

    window.renderHeaderPrincipal("Inicio",
      window.iconoSVG("chat") +
      "<span style='position:relative;display:flex;'>" + window.iconoSVG("bell") + "<span class='badge-dot'></span></span>" +
      "<div class='ah-avatar' id='ah-avatar-btn'>" + iniciales(alumno.nombre, alumno.apellido) + "</div>"
    );

    document.getElementById("ah-avatar-btn").addEventListener("click", function(){
      window.irAPagina("perfil");
    });

    var rutina = window.db.getRutinaPorId(alumno.rutina_id);
    var registros = window.db.getRegistros(alumno.id);
    var hoy = new Date();
    var diaSemanaIdx = (hoy.getDay() + 6) % 7; // 0=lunes
    var diaRutina = rutina ? rutina.dias[diaSemanaIdx % rutina.dias.length] : null;
    var hechoHoy = registros.filter(function(r){ return r.fecha === window.db.fechaHoy(); }).length > 0;

    var page = document.getElementById("page-inicio");
    var html = "<div class='px'>";

    html += "<div class='welcome-card'>" +
      "<h2>" + saludoHora() + ", " + alumno.nombre + "</h2>" +
      "<div class='fecha'>" + hoy.toLocaleDateString("es-ES", { weekday:"long", day:"numeric", month:"long" }) + "</div>" +
      "</div>";

    if(diaRutina && diaRutina.tipo !== "descanso"){
      html += "<div class='hoy-card'>" +
        "<div class='ses-nombre'>" + diaRutina.nombre + "</div>" +
        "<span class='chip-dark'>" + (rutina.mesociclo || "") + "</span>" +
        "<button class='pill-btn' style='margin-top:14px;' id='btn-ir-rutina'>IR A MI RUTINA DE HOY</button>" +
        "</div>";
    } else {
      html += "<div class='hoy-card'><div class='descanso'>🌙 Hoy descansas. La recuperación es parte del entreno.</div></div>";
    }

    var ejTotal = diaRutina ? diaRutina.ejercicios.length : 0;
    html += "<div class='resumen-grid'>" +
      "<div class='resumen-chip'><div class='rc-val'>🔥 " + (hechoHoy ? "2100" : "0") + "</div><div class='rc-label'>Kcal hoy</div></div>" +
      "<div class='resumen-chip'><div class='rc-val'>💧 0/8</div><div class='rc-label'>Vasos de agua</div></div>" +
      "<div class='resumen-chip'><div class='rc-val'>✅ " + (hechoHoy ? ejTotal : 0) + "/" + ejTotal + "</div><div class='rc-label'>Ejercicios hoy</div></div>" +
      "<div class='resumen-chip'><div class='rc-val'>🏆 " + window.db.calcularRacha(alumno.id) + "</div><div class='rc-label'>Racha de días</div></div>" +
      "</div>";

    html += "<div class='mini-cal'>";
    var dias = ["L","M","X","J","V","S","D"];
    for(var i=0; i<7; i++){
      var d = new Date(hoy); d.setDate(d.getDate() - diaSemanaIdx + i);
      var fechaStr = d.toISOString().split("T")[0];
      var hizo = registros.filter(function(r){ return r.fecha === fechaStr; }).length > 0;
      var esHoy = i === diaSemanaIdx;
      html += "<div class='mc-day'><span class='mc-letra'>" + dias[i] + "</span>" +
        "<div class='mc-circ " + (hizo ? "done" : (esHoy ? "today" : "")) + "'>" + (hizo ? "✓" : d.getDate()) + "</div></div>";
    }
    html += "</div>";

    var notas = window.db.getNotas(alumno.id);
    if(notas.length){
      var ultima = notas[notas.length-1];
      html += "<div class='nota-coach-card'>📋 <strong>Tu entrenador dice:</strong><p style='margin-top:6px;'>" + ultima.texto + "</p>" +
        "<div style='font-size:.72rem;color:var(--text-muted);margin-top:6px;'>" + ultima.fecha + "</div></div>";
    }

    var gym = window.db.getGymInfo();
    if(gym.activo){
      html += "<div class='gym-card-mini' id='btn-ir-gym'><div><h3>🏢 " + gym.nombre + "</h3><p>Ver horarios, clases y contacto</p></div><span>→</span></div>";
    }

    html += "<div class='gym-card-mini' id='btn-ir-fotos' style='background:linear-gradient(135deg,#1A2B4A,#0A84FF);'><div><h3>📸 Foto de progreso</h3><p>Sube tu foto semanal y compara tu evolución</p></div><span>→</span></div>";
    html += "<div class='gym-card-mini' id='btn-ir-habitos' style='background:linear-gradient(135deg,#2C3E50,#30D158);'><div><h3>🎯 Mis hábitos</h3><p>Correr, leer, meditar... cambia tus rutinas diarias</p></div><span>→</span></div>";

    html += "<div class='frase-motivacional'>“" + FRASES[hoy.getDate() % FRASES.length] + "”</div>";
    html += "</div>";

    page.innerHTML = html;

    var btnIr = document.getElementById("btn-ir-rutina");
    if(btnIr) btnIr.addEventListener("click", function(){ window.irAPagina("agenda"); });
    var btnGym = document.getElementById("btn-ir-gym");
    if(btnGym) btnGym.addEventListener("click", function(){ window.irAPagina("gym"); });
    document.getElementById("btn-ir-fotos").addEventListener("click", function(){ window.irAPagina("fotos"); });
    document.getElementById("btn-ir-habitos").addEventListener("click", function(){ window.irAPagina("habitos"); });
  };
})();

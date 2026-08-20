// ════════════════════════════════════════════════════════════
// onboarding.js — Wizard de bienvenida dentro de la app alumno
// Se muestra una sola vez al abrir la app por primera vez.
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  var _resp = {};
  var _paso = 0;
  var _overlay = null;

  var PASOS = [
    // ── SECCIÓN 1: QUIÉN ERES ──────────────────────────────
    {
      seccion: "Quién eres",
      emoji: "👋",
      pregunta: "¿Cuál es tu nombre completo?",
      sub: "Así te llamaremos en la app.",
      tipo: "texto",
      campo: "nombre_completo",
      placeholder: "Nombre y apellido",
      requerido: true
    },
    {
      seccion: "Quién eres",
      emoji: "🎂",
      pregunta: "¿Cuándo naciste?",
      sub: "Tu fecha exacta de nacimiento.",
      tipo: "fecha",
      campo: "fecha_nacimiento",
      requerido: true
    },
    {
      seccion: "Quién eres",
      emoji: "⚧",
      pregunta: "¿Cómo te identificas?",
      sub: "Esto ajusta ciertos cálculos nutricionales.",
      tipo: "opciones",
      campo: "genero",
      opciones: ["Hombre","Mujer","Prefiero no decir"],
      multi: false,
      requerido: true
    },
    {
      seccion: "Quién eres",
      emoji: "📱",
      pregunta: "¿Cuál es tu WhatsApp?",
      sub: "Tu coach lo usará para el seguimiento.",
      tipo: "telefono",
      campo: "whatsapp",
      placeholder: "099 123 4567",
      requerido: true
    },
    {
      seccion: "Quién eres",
      emoji: "💼",
      pregunta: "¿A qué te dedicas?",
      sub: "Afecta tu gasto calórico diario.",
      tipo: "opciones",
      campo: "ocupacion",
      opciones: ["Trabajo sentado (oficina, estudio)","Trabajo de pie (ventas, docente)","Trabajo físico (construcción, carga)","Estudio y en casa","Otro"],
      multi: false,
      requerido: true
    },

    // ── SECCIÓN 2: TU CUERPO ───────────────────────────────
    {
      seccion: "Tu cuerpo",
      emoji: "⚖️",
      pregunta: "¿Cuánto pesas y cuánto mides?",
      sub: "Punto de partida para medir tu progreso.",
      tipo: "doble_numero",
      campos: ["peso_kg","altura_cm"],
      labels: ["Peso actual (kg)","Altura (cm)"],
      placeholders: ["70","170"],
      requerido: true
    },
    {
      seccion: "Tu cuerpo",
      emoji: "🎯",
      pregunta: "¿Cuánto quieres pesar?",
      sub: "Tu meta de peso ideal.",
      tipo: "numero",
      campo: "peso_objetivo_kg",
      placeholder: "65",
      sufijo: "kg",
      requerido: true
    },
    {
      seccion: "Tu cuerpo",
      emoji: "📏",
      pregunta: "¿Tienes tus medidas corporales?",
      sub: "Si no las tienes ahora, puedes saltarte.",
      tipo: "medidas",
      campos: ["cintura_cm","cadera_cm","pecho_cm","brazo_cm"],
      labels: ["Cintura (cm)","Cadera (cm)","Pecho (cm)","Brazo (cm)"],
      requerido: false
    },
    {
      seccion: "Tu cuerpo",
      emoji: "😴",
      pregunta: "¿Cuántas horas duermes en promedio?",
      sub: "El sueño es parte del entrenamiento.",
      tipo: "opciones",
      campo: "horas_sueno",
      opciones: ["Menos de 5h","5–6h","6–7h","7–8h","Más de 8h"],
      multi: false,
      requerido: true
    },
    {
      seccion: "Tu cuerpo",
      emoji: "🧠",
      pregunta: "¿Cómo está tu nivel de estrés diario?",
      sub: "El estrés elevado afecta la recuperación y el peso.",
      tipo: "escala",
      campo: "nivel_estres",
      labels: ["Muy bajo","Bajo","Medio","Alto","Muy alto"],
      requerido: true
    },

    // ── SECCIÓN 3: TUS OBJETIVOS ───────────────────────────
    {
      seccion: "Tus objetivos",
      emoji: "🏆",
      pregunta: "¿Qué quieres lograr?",
      sub: "Puedes elegir varios.",
      tipo: "opciones",
      campo: "objetivos",
      opciones: ["Perder grasa","Ganar músculo","Definirme","Mejorar fuerza","Más energía y salud","Rendimiento deportivo","Rehabilitarme de una lesión"],
      multi: true,
      requerido: true
    },
    {
      seccion: "Tus objetivos",
      emoji: "🎯",
      pregunta: "¿Qué parte del cuerpo quieres priorizar?",
      sub: "Así enfocamos el plan.",
      tipo: "opciones",
      campo: "zona_prioritaria",
      opciones: ["Abdomen / Core","Piernas / Glúteos","Pecho / Espalda","Brazos / Hombros","Cuerpo completo equilibrado"],
      multi: true,
      requerido: true
    },
    {
      seccion: "Tus objetivos",
      emoji: "⏳",
      pregunta: "¿En cuánto tiempo quieres verlo?",
      sub: "Para ajustar la intensidad del plan.",
      tipo: "opciones",
      campo: "tiempo_objetivo",
      opciones: ["1–3 meses (agresivo)","3–6 meses (moderado)","6–12 meses (progresivo)","Más de 1 año (sostenible)"],
      multi: false,
      requerido: true
    },

    // ── SECCIÓN 4: ENTRENAMIENTO ───────────────────────────
    {
      seccion: "Entrenamiento",
      emoji: "💪",
      pregunta: "¿Cuánto tiempo llevas entrenando?",
      sub: "Tu nivel real de partida.",
      tipo: "opciones",
      campo: "experiencia_gym",
      opciones: ["Nunca he entrenado","Menos de 6 meses","6 meses – 1 año","1–2 años","Más de 2 años"],
      multi: false,
      requerido: true
    },
    {
      seccion: "Entrenamiento",
      emoji: "📅",
      pregunta: "¿Cuántos días puedes entrenar por semana?",
      sub: "Sé realista — consistencia > intensidad.",
      tipo: "opciones",
      campo: "dias_disponibles",
      opciones: ["1–2 días","3 días","4 días","5 días","6 días"],
      multi: false,
      requerido: true
    },
    {
      seccion: "Entrenamiento",
      emoji: "⏱️",
      pregunta: "¿Cuánto tiempo tienes por sesión?",
      sub: "Así diseñamos rutinas que sí puedes completar.",
      tipo: "opciones",
      campo: "duracion_sesion",
      opciones: ["Menos de 30 min","30–45 min","45–60 min","60–90 min","Más de 90 min"],
      multi: false,
      requerido: true
    },
    {
      seccion: "Entrenamiento",
      emoji: "🕐",
      pregunta: "¿A qué hora prefieres entrenar?",
      sub: "Para programar bien las comidas pre/post.",
      tipo: "opciones",
      campo: "horario_entreno",
      opciones: ["Madrugada (5–7h)","Mañana (7–10h)","Mediodía (11–14h)","Tarde (15–18h)","Noche (18–22h)"],
      multi: false,
      requerido: true
    },
    {
      seccion: "Entrenamiento",
      emoji: "🏋️",
      pregunta: "¿Dónde entrenas?",
      sub: "Para adaptar los ejercicios al equipo disponible.",
      tipo: "opciones",
      campo: "lugar_entreno",
      opciones: ["Gimnasio con todo el equipo","Gimnasio básico","Casa con pesas","Casa sin equipo","Al aire libre / calistenia"],
      multi: false,
      requerido: true
    },
    {
      seccion: "Entrenamiento",
      emoji: "🤸",
      pregunta: "¿Qué tipo de entrenamiento has hecho?",
      sub: "Puedes elegir varios.",
      tipo: "opciones",
      campo: "tipos_entreno",
      opciones: ["Pesas / Musculación","Cardio (correr, bici)","CrossFit / Funcional","Yoga / Pilates","Deportes","Ninguno todavía"],
      multi: true,
      requerido: false
    },

    // ── SECCIÓN 5: SALUD ───────────────────────────────────
    {
      seccion: "Salud",
      emoji: "🦵",
      pregunta: "¿Tienes alguna lesión actual?",
      sub: "Clave para que tu rutina sea 100% segura.",
      tipo: "opciones_texto",
      campo: "lesiones",
      campo_texto: "lesiones_detalle",
      opciones: ["Rodilla","Espalda baja","Hombro","Cuello","Muñeca / Codo","Tobillo / Pie","Cadera","Ninguna"],
      placeholder: "Detalla brevemente si elegiste alguna (opcional)",
      multi: true,
      requerido: false
    },
    {
      seccion: "Salud",
      emoji: "🩺",
      pregunta: "¿Tienes alguna condición médica?",
      sub: "Confidencial — solo lo verá tu coach.",
      tipo: "opciones_texto",
      campo: "condiciones_medicas",
      campo_texto: "condiciones_detalle",
      opciones: ["Diabetes","Hipertensión","Hipotiroidismo","Hipertiroidismo","Asma","PCOS / SOP","Ninguna"],
      placeholder: "Describe brevemente si marcaste alguna",
      multi: true,
      requerido: false
    },
    {
      seccion: "Salud",
      emoji: "💊",
      pregunta: "¿Tomas alguna medicación?",
      sub: "Algunos medicamentos afectan el rendimiento o el apetito.",
      tipo: "si_no_texto",
      campo: "medicacion",
      campo_texto: "medicacion_detalle",
      placeholder: "¿Cuál? (marca, dosis si lo sabes)",
      requerido: false
    },

    // ── SECCIÓN 6: NUTRICIÓN ───────────────────────────────
    {
      seccion: "Nutrición",
      emoji: "🚫",
      pregunta: "¿Tienes alergias o intolerancias?",
      sub: "Para que tu plan sea 100% seguro.",
      tipo: "opciones",
      campo: "alergias",
      opciones: ["Gluten / Trigo","Lácteos","Mariscos / Pescado","Huevo","Nueces / Frutos secos","Soya","Ninguna"],
      multi: true,
      requerido: false
    },
    {
      seccion: "Nutrición",
      emoji: "🍽️",
      pregunta: "¿Cuántas veces comes al día actualmente?",
      sub: "Sin contar snacks pequeños.",
      tipo: "opciones",
      campo: "comidas_diarias",
      opciones: ["1–2 veces","3 veces","4–5 veces","Pico cuando puedo (sin horario fijo)"],
      multi: false,
      requerido: true
    },
    {
      seccion: "Nutrición",
      emoji: "❌",
      pregunta: "¿Qué alimentos no puedes o no quieres comer?",
      sub: "Así diseñamos un plan que sí vas a seguir.",
      tipo: "texto_largo",
      campo: "alimentos_evitar",
      placeholder: "Ej: hígado, brócoli, mariscos, carne roja...",
      requerido: false
    },
    {
      seccion: "Nutrición",
      emoji: "💧",
      pregunta: "¿Cuánta agua tomas al día?",
      sub: "La hidratación afecta directamente el rendimiento.",
      tipo: "opciones",
      campo: "hidratacion",
      opciones: ["Menos de 1 litro","1–1.5 litros","1.5–2 litros","2–3 litros","Más de 3 litros"],
      multi: false,
      requerido: true
    },
    {
      seccion: "Nutrición",
      emoji: "🥤",
      pregunta: "¿Usas suplementos actualmente?",
      sub: "Proteína, creatina, pre-entreno, etc.",
      tipo: "opciones_texto",
      campo: "suplementos",
      campo_texto: "suplementos_detalle",
      opciones: ["Proteína whey","Creatina","Pre-entreno","Vitaminas / Minerales","Omega 3","Ninguno"],
      placeholder: "¿Cuáles exactamente? (marca o tipo)",
      multi: true,
      requerido: false
    },

    // ── SECCIÓN 7: MOTIVACIÓN ──────────────────────────────
    {
      seccion: "Tu motivación",
      emoji: "🔥",
      pregunta: "¿Por qué quieres empezar ahora?",
      sub: "Tu coach quiere entender qué te mueve.",
      tipo: "texto_largo",
      campo: "motivacion",
      placeholder: "Cuéntame qué te trajo aquí hoy...",
      requerido: false
    },
    {
      seccion: "Tu motivación",
      emoji: "⚠️",
      pregunta: "¿Qué te ha fallado antes?",
      sub: "Para que no repitamos los mismos errores.",
      tipo: "texto_largo",
      campo: "que_fallo",
      placeholder: "Ej: me perdía la constancia, no tenía guía, me aburría...",
      requerido: false
    },
    {
      seccion: "Tu motivación",
      emoji: "📝",
      pregunta: "¿Algo más que tu coach deba saber?",
      sub: "Cualquier detalle que no cubrimos.",
      tipo: "texto_largo",
      campo: "extra",
      placeholder: "Lo que quieras compartir...",
      requerido: false
    }
  ];

  var SECCIONES = [];
  PASOS.forEach(function(p){
    if(SECCIONES.indexOf(p.seccion) === -1) SECCIONES.push(p.seccion);
  });

  function getPct(){ return Math.round((_paso / PASOS.length) * 100); }

  function renderPaso(){
    var p = PASOS[_paso];
    var secIdx = SECCIONES.indexOf(p.seccion);
    var pct = getPct();

    var contenido = document.getElementById("ob-contenido");
    contenido.style.opacity = "0";
    contenido.style.transform = "translateX(30px)";

    setTimeout(function(){
      contenido.innerHTML = buildPasoHTML(p);
      contenido.style.transition = "opacity .25s, transform .25s";
      contenido.style.opacity = "1";
      contenido.style.transform = "translateX(0)";

      // Progress
      document.getElementById("ob-pct").style.width = pct + "%";
      document.getElementById("ob-paso-num").textContent = (_paso + 1) + " / " + PASOS.length;
      document.getElementById("ob-seccion").textContent = p.seccion;

      // Botón atrás
      var btnAtras = document.getElementById("ob-atras");
      if(btnAtras) btnAtras.style.display = _paso === 0 ? "none" : "flex";

      bindPaso(p);
    }, 150);
  }

  function buildPasoHTML(p){
    var valActual = _resp[p.campo] || (p.campos ? {} : null);
    var html = "<div class='ob-emoji'>" + p.emoji + "</div>" +
      "<div class='ob-pregunta'>" + p.pregunta + "</div>" +
      "<div class='ob-sub'>" + p.sub + "</div>" +
      "<div class='ob-inputs'>";

    if(p.tipo === "texto" || p.tipo === "telefono" || p.tipo === "numero"){
      var inputType = p.tipo === "numero" ? "number" : (p.tipo === "telefono" ? "tel" : "text");
      html += "<div style='position:relative;'>" +
        "<input id='ob-inp' type='" + inputType + "' inputmode='" + (p.tipo==="numero"?"numeric":"text") + "' placeholder='" + (p.placeholder||"") + "' value='" + (valActual||"") + "' autocomplete='off' style='width:100%;box-sizing:border-box;height:58px;background:var(--surface2);border:1.5px solid var(--border);border-radius:16px;padding:0 " + (p.sufijo?"52px":"18px") + " 0 18px;color:var(--text);font-size:18px;font-weight:600;font-family:inherit;'>" +
        (p.sufijo ? "<span style='position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--text-muted);font-weight:700;'>" + p.sufijo + "</span>" : "") +
      "</div>";
    } else if(p.tipo === "fecha"){
      html += "<input id='ob-inp' type='date' value='" + (valActual||"") + "' style='width:100%;box-sizing:border-box;height:58px;background:var(--surface2);border:1.5px solid var(--border);border-radius:16px;padding:0 18px;color:var(--text);font-size:18px;font-weight:600;font-family:inherit;'>";
    } else if(p.tipo === "texto_largo"){
      html += "<textarea id='ob-inp' placeholder='" + (p.placeholder||"") + "' rows='4' style='width:100%;box-sizing:border-box;background:var(--surface2);border:1.5px solid var(--border);border-radius:16px;padding:14px 18px;color:var(--text);font-size:15px;font-family:inherit;resize:none;'>" + (valActual||"") + "</textarea>";
    } else if(p.tipo === "doble_numero"){
      html += "<div style='display:flex;gap:12px;'>";
      p.campos.forEach(function(c, i){
        html += "<div style='flex:1;'>" +
          "<label style='font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:6px;'>" + p.labels[i] + "</label>" +
          "<input id='ob-inp-" + i + "' type='number' inputmode='numeric' placeholder='" + (p.placeholders[i]||"") + "' value='" + ((_resp[c])||"") + "' style='width:100%;box-sizing:border-box;height:56px;background:var(--surface2);border:1.5px solid var(--border);border-radius:14px;padding:0 14px;color:var(--text);font-size:20px;font-weight:800;font-family:inherit;text-align:center;'>" +
        "</div>";
      });
      html += "</div>";
    } else if(p.tipo === "medidas"){
      html += "<div style='display:grid;grid-template-columns:1fr 1fr;gap:12px;'>";
      p.campos.forEach(function(c, i){
        html += "<div>" +
          "<label style='font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:6px;'>" + p.labels[i] + "</label>" +
          "<input id='ob-med-" + i + "' type='number' inputmode='numeric' placeholder='—' value='" + ((_resp[c])||"") + "' style='width:100%;box-sizing:border-box;height:52px;background:var(--surface2);border:1.5px solid var(--border);border-radius:14px;padding:0 12px;color:var(--text);font-size:18px;font-weight:700;font-family:inherit;text-align:center;'>" +
        "</div>";
      });
      html += "</div>";
    } else if(p.tipo === "opciones"){
      var selArr = Array.isArray(valActual) ? valActual : (valActual ? [valActual] : []);
      html += "<div class='ob-opciones'>";
      p.opciones.forEach(function(op){
        var sel = selArr.indexOf(op) > -1;
        html += "<button class='ob-opcion" + (sel?" sel":"") + "' data-val='" + op.replace(/'/g,"&#39;") + "'>" + op + "</button>";
      });
      html += "</div>";
    } else if(p.tipo === "opciones_texto"){
      var selArr2 = Array.isArray(valActual) ? valActual : (valActual ? [valActual] : []);
      html += "<div class='ob-opciones'>";
      p.opciones.forEach(function(op){
        var sel = selArr2.indexOf(op) > -1;
        html += "<button class='ob-opcion" + (sel?" sel":"") + "' data-val='" + op.replace(/'/g,"&#39;") + "'>" + op + "</button>";
      });
      html += "</div>" +
        "<textarea id='ob-inp-texto' placeholder='" + (p.placeholder||"") + "' rows='2' style='width:100%;box-sizing:border-box;margin-top:12px;background:var(--surface2);border:1.5px solid var(--border);border-radius:14px;padding:12px 16px;color:var(--text);font-size:14px;font-family:inherit;resize:none;'>" + (_resp[p.campo_texto]||"") + "</textarea>";
    } else if(p.tipo === "si_no_texto"){
      var snVal = valActual || "";
      html += "<div class='ob-opciones'>" +
        "<button class='ob-opcion" + (snVal==="Sí"?" sel":"") + "' data-val='Sí'>Sí</button>" +
        "<button class='ob-opcion" + (snVal==="No"?" sel":"") + "' data-val='No'>No</button>" +
      "</div>" +
      "<textarea id='ob-inp-texto' placeholder='" + (p.placeholder||"") + "' rows='2' style='width:100%;box-sizing:border-box;margin-top:12px;background:var(--surface2);border:1.5px solid var(--border);border-radius:14px;padding:12px 16px;color:var(--text);font-size:14px;font-family:inherit;resize:none;display:" + (snVal==="Sí"?"block":"none") + ";'>" + (_resp[p.campo_texto]||"") + "</textarea>";
    } else if(p.tipo === "escala"){
      var escVal = valActual || 0;
      html += "<div style='padding:10px 0;'>" +
        "<div style='display:flex;gap:8px;justify-content:center;margin-bottom:14px;'>";
      for(var i=1; i<=5; i++){
        var colors = ["#34C759","#5AC8FA","#FF9500","#FF6B00","#FF453A"];
        html += "<button class='ob-escala-btn" + (escVal===i?" sel":"") + "' data-val='" + i + "' style='width:52px;height:52px;border-radius:14px;border:2px solid " + (escVal===i?colors[i-1]:"var(--border)") + ";background:" + (escVal===i?"rgba("+hexToRgb(colors[i-1])+",0.15)":"var(--surface2)") + ";color:var(--text);font-size:20px;font-weight:800;font-family:inherit;cursor:pointer;touch-action:manipulation;'>" + i + "</button>";
      }
      html += "</div><div style='display:flex;justify-content:space-between;'>";
      p.labels.forEach(function(l){ html += "<span style='font-size:10px;color:var(--text-muted);font-weight:600;text-align:center;flex:1;'>" + l + "</span>"; });
      html += "</div></div>";
    }

    html += "</div>";
    return html;
  }

  function hexToRgb(hex){
    var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return r+","+g+","+b;
  }

  function bindPaso(p){
    // Opciones de selección
    document.querySelectorAll(".ob-opcion").forEach(function(btn){
      btn.addEventListener("click", function(){
        var val = this.getAttribute("data-val");
        if(p.multi){
          this.classList.toggle("sel");
        } else {
          document.querySelectorAll(".ob-opcion").forEach(function(b){ b.classList.remove("sel"); });
          this.classList.add("sel");
          // Mostrar textarea si es si/no
          if(p.tipo === "si_no_texto"){
            var ta = document.getElementById("ob-inp-texto");
            if(ta) ta.style.display = val === "Sí" ? "block" : "none";
          }
        }
      });
    });

    // Escala
    document.querySelectorAll(".ob-escala-btn").forEach(function(btn){
      btn.addEventListener("click", function(){
        document.querySelectorAll(".ob-escala-btn").forEach(function(b){
          b.classList.remove("sel");
          b.style.borderColor = "var(--border)";
          b.style.background = "var(--surface2)";
        });
        this.classList.add("sel");
        _resp[p.campo] = parseInt(this.getAttribute("data-val"), 10);
      });
    });

    // Focus en input de texto
    var inp = document.getElementById("ob-inp");
    if(inp) setTimeout(function(){ inp.focus(); }, 300);
  }

  function recogerValores(p){
    if(p.tipo === "texto" || p.tipo === "telefono" || p.tipo === "texto_largo" || p.tipo === "fecha"){
      var v = (document.getElementById("ob-inp")||{}).value || "";
      if(p.requerido && !v.trim()) return false;
      _resp[p.campo] = v.trim();
    } else if(p.tipo === "numero"){
      var v2 = parseFloat((document.getElementById("ob-inp")||{}).value);
      if(p.requerido && isNaN(v2)) return false;
      _resp[p.campo] = isNaN(v2) ? null : v2;
    } else if(p.tipo === "doble_numero"){
      var ok = true;
      p.campos.forEach(function(c, i){
        var v3 = parseFloat((document.getElementById("ob-inp-"+i)||{}).value);
        if(p.requerido && isNaN(v3)) ok = false;
        _resp[c] = isNaN(v3) ? null : v3;
      });
      if(!ok) return false;
    } else if(p.tipo === "medidas"){
      p.campos.forEach(function(c, i){
        var v4 = parseFloat((document.getElementById("ob-med-"+i)||{}).value);
        _resp[c] = isNaN(v4) ? null : v4;
      });
    } else if(p.tipo === "opciones"){
      var sels = [];
      document.querySelectorAll(".ob-opcion.sel").forEach(function(b){ sels.push(b.getAttribute("data-val")); });
      if(p.requerido && sels.length === 0) return false;
      _resp[p.campo] = p.multi ? sels : (sels[0] || null);
    } else if(p.tipo === "opciones_texto"){
      var sels2 = [];
      document.querySelectorAll(".ob-opcion.sel").forEach(function(b){ sels2.push(b.getAttribute("data-val")); });
      if(p.requerido && sels2.length === 0) return false;
      _resp[p.campo] = p.multi ? sels2 : (sels2[0] || null);
      _resp[p.campo_texto] = ((document.getElementById("ob-inp-texto")||{}).value||"").trim();
    } else if(p.tipo === "si_no_texto"){
      var sels3 = [];
      document.querySelectorAll(".ob-opcion.sel").forEach(function(b){ sels3.push(b.getAttribute("data-val")); });
      if(p.requerido && sels3.length === 0) return false;
      _resp[p.campo] = sels3[0] || null;
      _resp[p.campo_texto] = ((document.getElementById("ob-inp-texto")||{}).value||"").trim();
    } else if(p.tipo === "escala"){
      if(p.requerido && !_resp[p.campo]) return false;
    }
    return true;
  }

  function mostrarError(){
    var cont = document.getElementById("ob-contenido");
    cont.style.animation = "ob-shake .3s";
    setTimeout(function(){ cont.style.animation = ""; }, 300);
    var hint = document.getElementById("ob-hint");
    if(hint){ hint.textContent = "Este campo es necesario para continuar."; hint.style.display = "block"; }
  }

  function guardarYTerminar(){
    var alumnoId = window.db.getAlumnoActual();
    var intakeData = Object.assign({}, _resp, { fecha_intake: new Date().toISOString() });

    // Actualizar nombre en el perfil del alumno
    if(_resp.nombre_completo){
      try { window.db.updateAlumno(alumnoId, { nombre: _resp.nombre_completo.split(" ")[0], nombre_completo: _resp.nombre_completo }); } catch(e){}
    }

    // Guardar intake completo
    try {
      localStorage.setItem("fitapp_intake_"+alumnoId, JSON.stringify(intakeData));
      localStorage.setItem("fitapp_onboarding_done_"+alumnoId, "1");
    } catch(e){}

    // Intentar guardar medidas en Supabase
    if(_resp.peso_kg){ try { window.db.addPeso(alumnoId, _resp.peso_kg); } catch(e){} }
    if(_resp.cintura_cm || _resp.cadera_cm || _resp.pecho_cm){
      try {
        window.db.saveMedidas(alumnoId, {
          fecha: new Date().toISOString().split("T")[0],
          cintura: _resp.cintura_cm || null,
          cadera: _resp.cadera_cm || null,
          pecho: _resp.pecho_cm || null,
          brazo: _resp.brazo_cm || null
        });
      } catch(e){}
    }

    // Pantalla final
    var contenido = document.getElementById("ob-contenido");
    contenido.innerHTML =
      "<div style='text-align:center;padding:20px 0;'>" +
        "<div style='font-size:80px;margin-bottom:20px;'>🎉</div>" +
        "<div style='font-size:26px;font-weight:900;color:var(--text);margin-bottom:12px;'>¡Todo listo, " + (_resp.nombre_completo||"").split(" ")[0] + "!</div>" +
        "<div style='font-size:15px;color:var(--text-muted);line-height:1.6;margin-bottom:32px;'>Tu coach ya tiene toda tu información.<br>En menos de 24h tendrás tu rutina y plan personalizados.</div>" +
        "<button id='ob-entrar' style='width:100%;height:56px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;touch-action:manipulation;'>Entrar a la app →</button>" +
      "</div>";
    document.getElementById("ob-barra-abajo").style.display = "none";
    document.getElementById("ob-entrar").addEventListener("click", function(){
      _overlay.style.opacity = "0";
      _overlay.style.transition = "opacity .4s";
      setTimeout(function(){ _overlay.remove(); window.init_inicio && window.init_inicio(); }, 400);
    });
  }

  // ── INICIAR ONBOARDING ───────────────────────────────────
  window.iniciarOnboarding = function(){
    _overlay = document.createElement("div");
    _overlay.id = "ob-overlay";
    _overlay.innerHTML =
      "<style>" +
        "#ob-overlay{position:fixed;inset:0;background:var(--bg);z-index:99999;display:flex;flex-direction:column;overflow:hidden;}" +
        "#ob-header{padding:calc(env(safe-area-inset-top,0px)+14px) 20px 0;flex-shrink:0;}" +
        "#ob-progress{height:4px;background:var(--surface3);border-radius:99px;margin-bottom:10px;overflow:hidden;}" +
        "#ob-pct{height:100%;background:#C8E000;border-radius:99px;transition:width .4s;}" +
        "#ob-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:0;}" +
        "#ob-seccion{font-size:11px;font-weight:700;color:var(--accent-text);text-transform:uppercase;letter-spacing:1px;}" +
        "#ob-paso-num{font-size:11px;color:var(--text-muted);font-weight:600;}" +
        "#ob-body{flex:1;overflow-y:auto;padding:24px 20px 0;}" +
        ".ob-emoji{font-size:48px;margin-bottom:16px;}" +
        ".ob-pregunta{font-size:22px;font-weight:900;color:var(--text);margin-bottom:8px;line-height:1.3;letter-spacing:-.3px;}" +
        ".ob-sub{font-size:13px;color:var(--text-muted);margin-bottom:24px;line-height:1.5;}" +
        ".ob-opciones{display:flex;flex-wrap:wrap;gap:10px;}" +
        ".ob-opcion{padding:12px 18px;background:var(--surface2);border:2px solid var(--border);border-radius:50px;color:var(--text);font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;touch-action:manipulation;transition:all .15s;}" +
        ".ob-opcion.sel{background:rgba(200,224,0,0.12);border-color:#C8E000;color:var(--accent-text);}" +
        ".ob-opcion:active{transform:scale(0.96);}" +
        ".ob-escala-btn:active{transform:scale(0.93);}" +
        "#ob-hint{display:none;color:#FF453A;font-size:12px;font-weight:600;margin-top:12px;}" +
        "#ob-barra-abajo{flex-shrink:0;padding:16px 20px calc(env(safe-area-inset-bottom,0px)+16px);background:var(--bg);border-top:1px solid var(--border);display:flex;gap:12px;align-items:center;}" +
        "#ob-atras{display:none;flex-shrink:0;width:48px;height:48px;background:var(--surface2);border:1px solid var(--border);border-radius:50%;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation;color:var(--text);font-size:20px;}" +
        "#ob-continuar{flex:1;height:52px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;touch-action:manipulation;}" +
        "#ob-saltar{flex-shrink:0;background:none;border:none;color:var(--text-muted);font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;touch-action:manipulation;padding:8px;}" +
        "@keyframes ob-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}" +
      "</style>" +
      "<div id='ob-header'>" +
        "<div id='ob-progress'><div id='ob-pct' style='width:0%'></div></div>" +
        "<div id='ob-meta'><span id='ob-seccion'></span><span id='ob-paso-num'></span></div>" +
      "</div>" +
      "<div id='ob-body'><div id='ob-contenido'></div><div id='ob-hint'></div></div>" +
      "<div id='ob-barra-abajo'>" +
        "<button id='ob-atras'>←</button>" +
        "<button id='ob-continuar'>Continuar →</button>" +
        "<button id='ob-saltar' id='ob-saltar'>Saltar</button>" +
      "</div>";

    document.body.appendChild(_overlay);
    renderPaso();

    document.getElementById("ob-continuar").addEventListener("click", function(){
      var p = PASOS[_paso];
      var hint = document.getElementById("ob-hint");
      if(hint) hint.style.display = "none";
      if(!recogerValores(p)){
        mostrarError();
        return;
      }
      _paso++;
      if(_paso >= PASOS.length){
        guardarYTerminar();
      } else {
        renderPaso();
      }
    });

    document.getElementById("ob-atras").addEventListener("click", function(){
      if(_paso > 0){ _paso--; renderPaso(); }
    });

    document.getElementById("ob-saltar").addEventListener("click", function(){
      var p = PASOS[_paso];
      if(!p.requerido){
        _paso++;
        if(_paso >= PASOS.length) guardarYTerminar(); else renderPaso();
      }
    });
  };

  // ── AUTO-ARRANCAR si no se ha hecho ──────────────────────
  window.checkOnboarding = function(){
    var alumnoId = window.db.getAlumnoActual();
    if(!alumnoId) return false;
    try {
      if(localStorage.getItem("fitapp_onboarding_done_"+alumnoId)) return false;
    } catch(e){ return false; }
    window.iniciarOnboarding();
    return true;
  };

})();

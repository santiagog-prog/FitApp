// ════════════════════════════════════════════════════════════
// cardio.js — Pasos manual + contador en vivo DeviceMotion
// ════════════════════════════════════════════════════════════
(function(){
  "use strict";

  // Agregar página al router
  if(typeof window.ALUMNO_ID !== "undefined"){
    var alumnoJs = document.querySelector("script[src*='alumno.js']");
  }

  var _cardio = { activo:false, pasos:0, umbral:11, ultimoPaso:0, inicio:null, interval:null };

  function fechaKey(){
    var d = new Date();
    return d.getFullYear() + "" + _pad(d.getMonth()+1) + "" + _pad(d.getDate());
  }
  function _pad(n){ return n<10?"0"+n:""+n; }

  function getPasosHoy(){
    var alumnoId = window.db.getAlumnoActual();
    try {
      var data = JSON.parse(localStorage.getItem("fitapp_pasos_"+alumnoId+"_"+fechaKey())||"null");
      return data ? (data.pasos||0) : 0;
    } catch(e){ return 0; }
  }

  function guardarPasos(pasos, fuente){
    var alumnoId = window.db.getAlumnoActual();
    var key = "fitapp_pasos_"+alumnoId+"_"+fechaKey();
    try {
      var existente = JSON.parse(localStorage.getItem(key)||'{"pasos":0}');
      existente.pasos = pasos; existente.fuente = fuente||"manual";
      localStorage.setItem(key, JSON.stringify(existente));
    } catch(e){}
  }

  function renderResumenUltimos7(){
    var alumnoId = window.db.getAlumnoActual();
    var html = '<div style="display:flex;gap:8px;overflow-x:auto;padding:0 20px 4px;scrollbar-width:none;">';
    for(var i=6; i>=0; i--){
      var d = new Date(); d.setDate(d.getDate()-i);
      var k = d.getFullYear()+""+_pad(d.getMonth()+1)+""+_pad(d.getDate());
      var data = null;
      try { data = JSON.parse(localStorage.getItem("fitapp_pasos_"+alumnoId+"_"+k)||"null"); } catch(e){}
      var pasos = data ? (data.pasos||0) : 0;
      var pct = Math.min(100, Math.round(pasos/10000*100));
      var dias = ["D","L","M","X","J","V","S"];
      var esHoy = i===0;
      html += '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;width:36px;">' +
        '<div style="font-size:10px;font-weight:600;color:' + (esHoy?"#C8E000":"rgba(255,255,255,0.35)") + ';">' + (pasos>999?(Math.round(pasos/100)/10)+"k":pasos) + '</div>' +
        '<div style="width:8px;background:rgba(255,255,255,0.06);border-radius:4px;height:48px;display:flex;align-items:flex-end;">' +
          '<div style="width:100%;border-radius:4px;background:' + (esHoy?"#C8E000":(pct>0?"rgba(200,224,0,0.4)":"transparent")) + ';height:' + Math.max(4,pct) + '%;transition:height .4s;"></div>' +
        '</div>' +
        '<div style="font-size:10px;color:rgba(255,255,255,0.3);">' + dias[d.getDay()] + '</div>' +
      '</div>';
    }
    html += '</div>';
    return html;
  }

  window.init_cardio = function(){
    var header = document.getElementById("app-header");
    if(header){
      header.innerHTML =
        "<div class='ah-top'><div onclick=\"window.irAPagina('mas')\" style='cursor:pointer;display:flex;align-items:center;gap:6px;color:rgba(255,255,255,0.5);font-size:14px;'>" +
          "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M15 18l-6-6 6-6'/></svg>Más" +
        "</div><div class='ah-icons'></div></div>" +
        "<div class='ah-subtitle'>Actividad</div>" +
        "<div class='ah-title'>Cardio y Pasos</div>";
    }

    var pasosHoy = getPasosHoy();
    var pctObj = Math.min(100, Math.round(pasosHoy/10000*100));

    var html = '<div style="padding:4px 0 calc(env(safe-area-inset-bottom,0px)+80px);">';

    // Resumen hoy
    html += '<div style="margin:0 20px 16px;background:#141414;border-radius:20px;padding:24px;text-align:center;">' +
      '<div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Pasos hoy</div>' +
      '<div id="pasos-hoy-display" style="font-size:52px;font-weight:900;color:#C8E000;letter-spacing:-2px;line-height:1;">' + pasosHoy + '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.3);margin-top:4px;">Meta: 10,000 pasos</div>' +
      '<div style="background:rgba(255,255,255,0.06);border-radius:99px;height:6px;margin:14px 0 0;overflow:hidden;">' +
        '<div style="width:'+pctObj+'%;height:100%;background:#C8E000;border-radius:99px;transition:width .6s;"></div>' +
      '</div>' +
    '</div>';

    // Últimos 7 días
    html += '<div style="margin:0 0 16px;">';
    html += '<div style="padding:0 20px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">Últimos 7 días</div>';
    html += renderResumenUltimos7();
    html += '</div>';

    // Registro manual
    html += '<div style="background:#141414;border-radius:16px;padding:20px;margin:0 20px 12px;">' +
      '<div style="font-size:15px;font-weight:700;color:#FFF;margin-bottom:4px;">Registrar pasos</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:14px;">Copia el número desde Salud (iPhone) o Google Fit</div>' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">' +
        '<input id="pasos-input" type="number" inputmode="numeric" placeholder="0" style="flex:1;height:56px;background:#1C1C1C;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0 16px;color:#FFF;font-size:28px;font-weight:800;font-family:inherit;text-align:center;box-sizing:border-box;">' +
        '<span style="font-size:13px;color:rgba(255,255,255,0.4);flex-shrink:0;">pasos</span>' +
      '</div>' +
      '<button id="btn-guardar-pasos" style="width:100%;height:48px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;">Guardar</button>' +
    '</div>';

    // Contador en vivo
    var sensorDisponible = !!window.DeviceMotionEvent;
    var necesitaPermiso = typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function";

    html += '<div style="background:#141414;border-radius:16px;padding:20px;margin:0 20px 12px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">' +
      '<div style="font-size:15px;font-weight:700;color:#FFF;">Medir en vivo</div>' +
      '<div id="sensor-status-chip" style="font-size:11px;font-weight:700;border-radius:99px;padding:4px 10px;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);">' +
        (sensorDisponible ? '● Sensor listo' : '✕ Sin sensor') +
      '</div>' +
    '</div>';
    html += '<div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:16px;">Lleva el móvil en la mano o bolsillo mientras caminas</div>';

    if(necesitaPermiso){
      html += '<div id="permiso-banner" style="background:rgba(200,224,0,0.08);border:1px solid rgba(200,224,0,0.2);border-radius:12px;padding:14px;margin-bottom:14px;display:flex;align-items:center;gap:12px;">' +
        '<span style="font-size:24px;">📱</span>' +
        '<div style="flex:1;">' +
          '<div style="font-size:13px;font-weight:700;color:#FFF;margin-bottom:2px;">Permiso de movimiento requerido</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.5);">iOS necesita tu autorización para detectar pasos</div>' +
        '</div>' +
        '<button id="btn-pedir-permiso" style="background:#C8E000;color:#1C1C1E;border:none;border-radius:99px;padding:8px 14px;font-size:12px;font-weight:800;font-family:inherit;cursor:pointer;flex-shrink:0;">Activar</button>' +
      '</div>';
    }

    html += '<div style="text-align:center;padding:16px 0;">' +
      '<div id="pasos-vivo-numero" style="font-size:52px;font-weight:900;color:#C8E000;letter-spacing:-2px;line-height:1;">0</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.35);margin-top:6px;">pasos detectados en esta sesión</div>' +
    '</div>';
    html += '<button id="btn-toggle-cardio" style="width:100%;height:52px;background:#C8E000;color:#1C1C1E;border:none;border-radius:50px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;">▶ Iniciar conteo</button>';
    html += '<div style="font-size:10px;color:rgba(255,255,255,0.2);text-align:center;margin-top:10px;">Mantén la pantalla encendida durante el conteo</div>';
    html += '</div>';

    html += '</div>';
    document.getElementById("page-cardio").innerHTML = html;

    document.getElementById("btn-guardar-pasos").addEventListener("click", function(){
      var v = parseInt(document.getElementById("pasos-input").value)||0;
      guardarPasos(v, "manual");
      document.getElementById("pasos-hoy-display").textContent = v;
      window.mostrarToast && window.mostrarToast("✓ " + v + " pasos registrados");
    });

    // Botón "Activar" permiso iOS
    var btnPermiso = document.getElementById("btn-pedir-permiso");
    if(btnPermiso){
      btnPermiso.addEventListener("click", function(){
        if(typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function"){
          DeviceMotionEvent.requestPermission().then(function(r){
            var chip = document.getElementById("sensor-status-chip");
            var banner = document.getElementById("permiso-banner");
            if(r === "granted"){
              if(chip){ chip.textContent = "✓ Permiso concedido"; chip.style.color = "#30D158"; chip.style.background = "rgba(48,209,88,0.12)"; }
              if(banner){ banner.style.display = "none"; }
              window.mostrarToast && window.mostrarToast("✅ Sensor de movimiento activado");
            } else {
              if(chip){ chip.textContent = "✕ Permiso denegado"; chip.style.color = "#FF453A"; }
              window.mostrarToast && window.mostrarToast("⚠️ Permiso denegado. Actívalo en Ajustes > Safari > Movimiento.");
            }
          }).catch(function(e){
            console.error("Permiso motion:", e);
          });
        }
      });
    }

    document.getElementById("btn-toggle-cardio").addEventListener("click", function(){
      if(_cardio.activo) _detenerContador(); else _iniciarContador();
    });
  };

  function _iniciarContador(){
    function activar(){
      _cardio.activo = true; _cardio.pasos = 0;
      _cardio.ultimoPaso = 0; _cardio.inicio = Date.now();
      var btn = document.getElementById("btn-toggle-cardio");
      if(btn){ btn.textContent = "⏸ Detener conteo"; btn.style.background = "#FF453A"; btn.style.color = "#FFF"; }
      window.addEventListener("devicemotion", _handleMotion);
      if(navigator.vibrate) navigator.vibrate(100);
    }

    if(typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function"){
      DeviceMotionEvent.requestPermission().then(function(r){
        if(r==="granted") activar();
        else window.mostrarToast && window.mostrarToast("Necesitamos permiso de movimiento");
      }).catch(function(){ activar(); });
    } else if(window.DeviceMotionEvent){
      activar();
    } else {
      window.mostrarToast && window.mostrarToast("Tu dispositivo no soporta esta función. Usa registro manual.");
    }
  }

  function _handleMotion(e){
    if(!_cardio.activo) return;
    var acc = e.accelerationIncludingGravity;
    if(!acc) return;
    var mag = Math.sqrt((acc.x||0)*(acc.x||0)+(acc.y||0)*(acc.y||0)+(acc.z||0)*(acc.z||0));
    var ahora = Date.now();
    if(mag > _cardio.umbral && (ahora - _cardio.ultimoPaso) > 300){
      _cardio.pasos++;
      _cardio.ultimoPaso = ahora;
      var el = document.getElementById("pasos-vivo-numero");
      if(el) el.textContent = _cardio.pasos;
    }
  }

  function _detenerContador(){
    _cardio.activo = false;
    window.removeEventListener("devicemotion", _handleMotion);
    var btn = document.getElementById("btn-toggle-cardio");
    if(btn){ btn.textContent = "▶ Iniciar conteo"; btn.style.background = "#C8E000"; btn.style.color = "#1C1C1E"; }
    var durMin = Math.round((Date.now()-(_cardio.inicio||Date.now()))/60000);
    var alumnoId = window.db.getAlumnoActual();
    var key = "fitapp_pasos_"+alumnoId+"_"+fechaKey();
    var existente = {pasos:0};
    try { existente = JSON.parse(localStorage.getItem(key)||'{"pasos":0}'); } catch(e){}
    var total = (existente.pasos||0) + _cardio.pasos;
    guardarPasos(total, "sensor");
    var display = document.getElementById("pasos-hoy-display");
    if(display) display.textContent = total;
    window.mostrarToast && window.mostrarToast("✓ " + _cardio.pasos + " pasos en " + durMin + " min guardados");
    if(navigator.vibrate) navigator.vibrate([100,50,100]);
  }
})();

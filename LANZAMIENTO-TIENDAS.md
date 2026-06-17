# Cómo llevar FitApp a Google Play y App Store

El proyecto ya está envuelto con **Capacitor**: existen las carpetas `android/` (proyecto nativo Android listo) y `ios/` (proyecto nativo iOS listo). Esto es lo que falta para publicar de verdad, paso a paso.

## Cada vez que cambies el código web (HTML/CSS/JS)
```
npm run copy:www
npx cap sync
```
Esto copia tus cambios a `android/` y `ios/` para que se reflejen en el build nativo.

---

## Android (Google Play)

**Lo que falta instalar:** Android Studio (incluye el SDK y JDK). Es una descarga de ~1 GB.

1. Instala [Android Studio](https://developer.android.com/studio)
2. Abre la carpeta `android/` del proyecto con Android Studio (`npm run open:android` lo abre directo)
3. Cambia el ícono y el nombre si quieres (`android/app/src/main/res/`)
4. Genera un **APK/AAB firmado**: Build → Generate Signed Bundle/APK (Android Studio te guía para crear tu llave de firma — guárdala, la necesitas para todas las actualizaciones futuras)
5. Crea tu cuenta en [Google Play Console](https://play.google.com/console) — **pago único de $25 USD, lo tienes que hacer tú**
6. Sube el AAB, completa ficha de la tienda (capturas, descripción, política de privacidad), envía a revisión

## iOS (App Store)

**Lo que falta:** una **Mac** con Xcode instalado (no se puede compilar iOS desde Windows).

1. Copia la carpeta `ios/` a una Mac (o usa un servicio de build en la nube como Codemagic/Ionic Appflow si no tienes Mac)
2. Abre `ios/App/App.xcworkspace` con Xcode
3. Crea tu cuenta de [Apple Developer Program](https://developer.apple.com/programs/) — **$99 USD/año, lo tienes que hacer tú**
4. Configura el "signing" con tu cuenta de Apple en Xcode
5. Archive → Distribute App → App Store Connect
6. Completa la ficha en [App Store Connect](https://appstoreconnect.apple.com) y envía a revisión

---

## Lo que yo sí puedo seguir ayudando a preparar
- Iconos y splash screens en todos los tamaños (`npx @capacitor/assets generate` una vez tengas un logo final)
- Política de privacidad (documento de texto)
- Capturas de pantalla para la ficha de la tienda
- Ajustes de diseño/UX dentro de la app

## Lo que no puedo hacer yo
- Crear o pagar las cuentas de Apple Developer / Google Play
- Compilar la versión iOS (necesita una Mac física)
- Enviar la app a revisión (requiere tu cuenta y tu aceptación de términos)

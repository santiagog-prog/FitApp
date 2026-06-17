// Copia los archivos estáticos del proyecto a www/ para que Capacitor los empaquete.
// Se excluyen carpetas de build/dependencias y los propios proyectos nativos generados.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DEST = path.join(ROOT, "www");
const EXCLUDE = new Set(["node_modules", "www", "android", "ios", "scripts", ".git", "package.json", "package-lock.json", "capacitor.config.json", "capacitor.config.ts"]);

function copyDir(src, dest){
  fs.mkdirSync(dest, { recursive: true });
  for(const entry of fs.readdirSync(src, { withFileTypes: true })){
    if(EXCLUDE.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if(entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

fs.rmSync(DEST, { recursive: true, force: true });
copyDir(ROOT, DEST);
console.log("Copiado a www/ listo para Capacitor.");

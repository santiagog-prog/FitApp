@echo off
title FitApp Server
echo.
echo  ╔══════════════════════════════╗
echo  ║   FitApp corriendo...        ║
echo  ║   http://192.168.1.137:3456  ║
echo  ╚══════════════════════════════╝
echo.
echo  Abre en tu celular:
echo  http://192.168.1.137:3456/alumno/index.html
echo.
echo  No cierres esta ventana.
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause

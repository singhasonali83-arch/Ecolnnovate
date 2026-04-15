@echo off
title EcoInnovate - Open Website
echo.
echo  =========================================
echo   🌿 EcoInnovate - Sustainability Platform
echo  =========================================
echo.
echo  Opening in your default browser...
echo.

start "" "%~dp0index.html"

echo  ✅ Website opened!
echo.
echo  📁 Files are saved at:
echo     %~dp0
echo.
timeout /t 3 /nobreak >nul

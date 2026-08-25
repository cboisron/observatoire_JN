@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python est requis pour enregistrer les contributions dans Excel.
  echo Installez Python ou ouvrez app\index.html en mode consultation uniquement.
  pause
  exit /b 1
)
python scripts\serve_dashboard.py
if errorlevel 1 pause

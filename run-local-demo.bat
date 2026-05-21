@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "SERVER_DIR=%ROOT_DIR%server"
set "CLIENT_DIR=%ROOT_DIR%client"

if not exist "%SERVER_DIR%\package.json" (
  echo Server package.json not found in "%SERVER_DIR%".
  exit /b 1
)

if not exist "%CLIENT_DIR%\package.json" (
  echo Client package.json not found in "%CLIENT_DIR%".
  exit /b 1
)

echo Starting Campus Event Discovery App locally...
echo.
echo Requirements:
echo - MySQL must already be running
echo - server\.env must be configured
echo - npm dependencies should already be installed in server and client
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.

start "CEDA Backend" cmd /k "cd /d ""%SERVER_DIR%"" && npm.cmd run dev"
start "CEDA Frontend" cmd /k "cd /d ""%CLIENT_DIR%"" && npm.cmd run dev"

echo Open the frontend URL shown in the CEDA Frontend window.
exit /b 0

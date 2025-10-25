@echo off
echo ========================================
echo   ZAVIYAR CHEMICALS - STARTING SERVER
echo ========================================
echo.
cd /d "%~dp0"
echo Current directory: %cd%
echo.
echo Starting server...
echo.
node server.js
pause


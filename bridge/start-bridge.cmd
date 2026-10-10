@echo off
title PrintPath Bridge
cd /d "%~dp0.."
node bridge\server.mjs
if errorlevel 1 (
  echo.
  echo PrintPath Bridge could not start. Make sure Node.js is installed.
  pause
)

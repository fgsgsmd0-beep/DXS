@echo off
title EGDH Local Network Server
cd /d "%~dp0"
cls
echo ========================================================
echo   EGDH Local Network Server (Wi-Fi / Router Access)
echo ========================================================
echo.
echo   Local Network URL: http://192.168.0.101:5173/
echo.
echo   Same router/Wi-Fi te thaka je kono device (Mobile,
echo   Laptop, etc.) er browser theke uporer link e jete parben.
echo.
echo ========================================================
echo.
npm run dev
pause

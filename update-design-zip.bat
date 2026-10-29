@echo off
title Update Design Zip
cd /d "%~dp0"
echo ========================================================
echo   Updating design.zip with latest src, public, index.html...
echo   (video.mp4 and "version html" folder are NOT packed - keep them outside)
echo ========================================================
tar -a -cf design.zip --exclude=public/video.mp4 --exclude="public/version html" src public index.html
echo.
echo [SUCCESS] design.zip has been updated!
echo You can now push/upload design.zip to GitHub.
echo ========================================================
pause

@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build.ps1" -Deploy
set "deployExit=%ERRORLEVEL%"
if not "%deployExit%"=="0" echo Deployment failed. Review the error above.
pause
exit /b %deployExit%

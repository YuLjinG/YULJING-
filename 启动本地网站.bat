@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "NODE=C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "CLI=%~dp0node_modules\vinext\dist\cli.js"
set "ROUTE=%~1"
if "%ROUTE%"=="" set "ROUTE=/"
set "URL=http://localhost:3001%ROUTE%"

if not exist "%NODE%" goto :missing
if not exist "%CLI%" goto :missing

echo Starting local website service...
start "Vinext Dev Server" /b "%NODE%" "%CLI%" dev --host 127.0.0.1 --port 3001

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$url='%URL%'; $ok=$false; for($i=0;$i -lt 30;$i++){ Start-Sleep -Seconds 1; try{$r=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 500){$ok=$true;break}}catch{} }; if($ok){Start-Process $url; exit 0}else{exit 1}"
if errorlevel 1 goto :failed

echo.
echo Local website is ready: %URL%
echo Keep this window open while using the website.
pause
goto :end

:missing
echo Required project files were not found.
pause
goto :end

:failed
echo Website service failed to start. Read the error above.
pause

:end
endlocal

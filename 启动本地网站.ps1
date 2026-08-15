param(
    [string]$Route = "/",
    [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Node = "C:\Users\Mayn\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$Cli = Join-Path $ProjectRoot "node_modules\vinext\dist\cli.js"
$Port = 3001
$Url = "http://localhost:$Port$Route"

if (-not (Test-Path -LiteralPath $Node)) {
    throw "Node.js not found: $Node"
}

if (-not (Test-Path -LiteralPath $Cli)) {
    throw "Vinext CLI not found: $Cli"
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $listener) {
    Write-Host "Starting local website service..." -ForegroundColor Cyan
    # Keep the service window visible so startup errors are directly readable.
    $command = '/k cd /d "' + $ProjectRoot + '" && "' + $Node + '" "' + $Cli + '" dev --host 127.0.0.1 --port ' + $Port
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = $env:ComSpec
    $startInfo.Arguments = $command
    $startInfo.UseShellExecute = $true
    [System.Diagnostics.Process]::Start($startInfo) | Out-Null
} else {
    Write-Host "Local website service is already running." -ForegroundColor DarkGray
}

$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
            $ready = $true
            break
        }
    } catch {
        # The service may still be starting; keep waiting.
    }
}

if (-not $ready) {
    Write-Host "Startup timed out. Keep the service window open and check the error shown there." -ForegroundColor Red
    exit 1
}

Write-Host "Local website is ready: $Url" -ForegroundColor Green
if (-not $NoOpen) {
    Start-Process $Url
}

param([int]$Port = 8080)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$phpBinary = Join-Path $projectRoot '.tools/php/php.exe'
if (-not (Test-Path -LiteralPath $phpBinary)) { $phpBinary = (Get-Command php -ErrorAction Stop).Source }
Write-Host "Ameríndia: http://127.0.0.1:$Port (Ctrl+C para encerrar)"
if ($Port -ne 8080) { Write-Host 'Configure origin em config/local.php para a mesma porta antes de enviar formulários.' }
& $phpBinary -S "127.0.0.1:$Port" -t public router.php

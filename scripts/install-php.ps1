$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$releaseIndex = Invoke-RestMethod 'https://windows.php.net/downloads/releases/releases.json'
$package = $releaseIndex.'8.4'.'nts-vs17-x64'.zip
if ($package.path -notmatch '^php-8\.4\.\d+-nts-Win32-vs17-x64\.zip$') { throw 'Unexpected package name' }
New-Item -ItemType Directory -Force .tools | Out-Null
Invoke-WebRequest ('https://windows.php.net/downloads/releases/' + $package.path) -OutFile .tools/php.zip
if ((Get-FileHash .tools/php.zip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $package.sha256) { throw 'SHA-256 mismatch' }
Expand-Archive -LiteralPath .tools/php.zip -DestinationPath .tools/php -Force
@('extension_dir="ext"','extension=pdo_sqlite','extension=sqlite3','extension=fileinfo','extension=mbstring','upload_max_filesize=5M','post_max_size=12M','max_file_uploads=2','display_errors=Off','log_errors=On','expose_php=Off','memory_limit=128M','date.timezone=America/Sao_Paulo') | Set-Content -Encoding utf8 .tools/php/php.ini
& .tools/php/php.exe bin/console.php doctor

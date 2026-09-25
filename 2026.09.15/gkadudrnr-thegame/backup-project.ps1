# Windows PowerShell 5.1 / PowerShell 7. No additional packages required.
# Run: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\backup-project.ps1
[CmdletBinding()]
param([string]$Destination)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectRoot = [IO.Path]::GetFullPath($PSScriptRoot).TrimEnd('\')
if (-not $Destination) { $Destination = Join-Path $projectRoot 'backups' }
$backupRoot = [IO.Path]::GetFullPath($Destination).TrimEnd('\')
if ($backupRoot -eq $projectRoot) { throw 'Choose a backup subfolder or a folder outside the project.' }
[IO.Directory]::CreateDirectory($backupRoot) | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$backupName = 'null-sector-' + $stamp + '-' + [Guid]::NewGuid().ToString('N').Substring(0,6)
$archivePath = Join-Path $backupRoot ($backupName + '.zip')
$partialPath = $archivePath + '.partial'
$excludedDirectories = @('node_modules', 'dist', 'output', 'backups', '.git', '.cache', '.vite', '.vite-temp', 'test-results', 'playwright-report')
$prefix = 'NULL-SECTOR/'
$bundlePath = Join-Path $backupRoot ($backupName + '.bundle.partial')
$gitInfo = $null
foreach ($reservedName in @('_BACKUP_MANIFEST.json', '_GIT_HISTORY.bundle')) {
    if (Test-Path -LiteralPath (Join-Path $projectRoot $reservedName)) { throw "Reserved backup name exists: $reservedName" }
}

# A bundle preserves committed history without copying a live .git directory.
# Current files (including uncommitted changes) are archived separately below.
if (Test-Path -LiteralPath (Join-Path $projectRoot '.git')) {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is required to back up this repository history.' }
    $head = & git -C $projectRoot rev-parse --verify HEAD
    if ($LASTEXITCODE -ne 0) { throw 'No readable Git commit found; commit once before backing up history.' }
    $branch = & git -C $projectRoot symbolic-ref --quiet --short HEAD
    if ($LASTEXITCODE -ne 0) { $branch = '(detached HEAD)' }
    $status = @(& git -C $projectRoot -c core.quotepath=false status --porcelain=v1 --untracked-files=all)
    if ($LASTEXITCODE -ne 0) { throw 'Unable to read Git working-tree status.' }
    & git -C $projectRoot bundle create $bundlePath --all HEAD
    if ($LASTEXITCODE -ne 0) { throw 'Unable to create Git history bundle.' }
    & git -C $projectRoot bundle verify $bundlePath
    if ($LASTEXITCODE -ne 0) { throw 'Git history bundle verification failed.' }
    $gitInfo = [ordered]@{head=$head; branch=$branch; dirty=($status.Count -gt 0); status=$status; bundle='_GIT_HISTORY.bundle'}
}

function Get-ProjectFiles([string]$Directory) {
    foreach ($item in Get-ChildItem -LiteralPath $Directory -Force | Sort-Object Name) {
        # OneDrive files also have ReparsePoint; only exclude actual links/junctions.
        if ($item.LinkType -in @('SymbolicLink', 'Junction')) { continue }
        if ($item.PSIsContainer) {
            if ($item.Name -in $excludedDirectories -or $item.FullName -eq $backupRoot) { continue }
            Get-ProjectFiles $item.FullName
        } elseif ($item.Extension -notin @('.log', '.tmp', '.partial')) {
            $item
        }
    }
}

$files = @(Get-ProjectFiles $projectRoot)
if (-not $files.Count) { throw 'No project files found.' }
if ($gitInfo) { $files += Get-Item -LiteralPath $bundlePath }
$manifestFiles = [Collections.Generic.List[object]]::new()
$archive = $null
$archiveStream = $null
try {
    $archiveStream = [IO.File]::Open($partialPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    $archive = [IO.Compression.ZipArchive]::new($archiveStream, [IO.Compression.ZipArchiveMode]::Create, $true)
    $buffer = New-Object byte[] 65536
    foreach ($file in $files) {
        $relative = if ($file.FullName -eq $bundlePath) { '_GIT_HISTORY.bundle' } else { $file.FullName.Substring($projectRoot.Length + 1).Replace('\','/') }
        if ($relative -eq '_BACKUP_MANIFEST.json') { throw 'Reserved backup manifest name exists in project.' }
        Write-Progress -Activity 'Backing up NULL SECTOR' -Status $relative -PercentComplete ([int](100 * $manifestFiles.Count / $files.Count))
        $before = Get-Item -LiteralPath $file.FullName -Force
        $length = $before.Length
        $modified = $before.LastWriteTimeUtc
        $entry = $archive.CreateEntry($prefix + $relative, [IO.Compression.CompressionLevel]::Optimal)
        $entry.LastWriteTime = [DateTimeOffset]$file.LastWriteTime
        $source = $null; $target = $null; $hash = [Security.Cryptography.SHA256]::Create()
        try {
            $source = [IO.File]::Open($file.FullName, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
            $target = $entry.Open()
            while (($read = $source.Read($buffer, 0, $buffer.Length)) -gt 0) {
                $target.Write($buffer, 0, $read)
                $null = $hash.TransformBlock($buffer, 0, $read, $buffer, 0)
            }
            $null = $hash.TransformFinalBlock([byte[]]@(), 0, 0)
            $digest = [BitConverter]::ToString($hash.Hash).Replace('-','').ToLowerInvariant()
        } finally {
            if ($target) { $target.Dispose() }; if ($source) { $source.Dispose() }; $hash.Dispose()
        }
        $after = Get-Item -LiteralPath $file.FullName -Force
        if ($after.Length -ne $length -or $after.LastWriteTimeUtc -ne $modified) { throw "File changed during backup: $relative. Retry after edits finish." }
        $manifestFiles.Add([ordered]@{path=$relative; bytes=$length; sha256=$digest})
    }
    $manifest = [ordered]@{
        format='null-sector-project-backup'; version=2; createdAt=[DateTime]::UtcNow.ToString('o')
        excludedDirectories=$excludedDirectories; files=$manifestFiles.ToArray()
        git=$gitInfo
        restore='Extract ZIP. Open NULL-SECTOR/index.html for offline play when local/index.html is present. To rebuild from source: npm.cmd ci, then npm.cmd run build:local. Development server: npm.cmd run dev.'
        restoreGit='To inspect committed history separately: git clone _GIT_HISTORY.bundle ../NULL-SECTOR-history. The extracted ZIP contains the current working files, including uncommitted changes; the clone contains committed files only. Git configuration, hooks, reflogs and staging state are not included.'
        note='Browser IndexedDB/sessionStorage and player save files outside this project are not included. Export player progress separately from the game.'
    }
    $manifestEntry = $archive.CreateEntry($prefix + '_BACKUP_MANIFEST.json')
    $writer = [IO.StreamWriter]::new($manifestEntry.Open(), [Text.UTF8Encoding]::new($false))
    try { $writer.Write(($manifest | ConvertTo-Json -Depth 8)) } finally { $writer.Dispose() }
} finally {
    if ($archive) { $archive.Dispose() }; if ($archiveStream) { $archiveStream.Dispose() }
    Write-Progress -Activity 'Backing up NULL SECTOR' -Completed
}

# Verify the archived bytes, not just the source files, before publishing the ZIP.
$verify = [IO.Compression.ZipFile]::OpenRead($partialPath)
try {
    foreach ($record in $manifestFiles) {
        $entry = $verify.GetEntry($prefix + $record.path)
        if (-not $entry -or $entry.Length -ne $record.bytes) { throw "Archive entry mismatch: $($record.path)" }
        $stream = $entry.Open(); $sha = [Security.Cryptography.SHA256]::Create()
        try { $actual = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() }
        finally { $stream.Dispose(); $sha.Dispose() }
        if ($actual -ne $record.sha256) { throw "Archive checksum mismatch: $($record.path)" }
    }
} finally { $verify.Dispose() }
[IO.File]::Move($partialPath, $archivePath)
if ($gitInfo) { [IO.File]::Delete($bundlePath) }
Write-Host ('Backup verified: ' + $archivePath)
Write-Host ('Files: ' + $manifestFiles.Count + ' | ZIP bytes: ' + (Get-Item -LiteralPath $archivePath).Length)
Write-Host 'Player progress: export JSON separately from the game.'
# On failure the .partial file is intentionally retained for diagnosis, never reported as a completed backup.

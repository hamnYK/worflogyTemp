[CmdletBinding()]
param(
    [switch]$Deploy,
    [string]$Remote = "https://github.com/hamnYK/worflogyTemp.git"
)
$ErrorActionPreference = "Stop"
$OutputEncoding = [System.Text.UTF8Encoding]::new()
$siteRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$originalLocation = Get-Location
$branch = "gh-pages"

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Arguments)
    & git --no-pager @Arguments
    if ($LASTEXITCODE -ne 0) { throw "git failed (exit $LASTEXITCODE): $($Arguments[0])" }
}

try {
    Set-Location -LiteralPath $siteRoot
    foreach ($tool in @("node", "npm.cmd", "python")) { Get-Command $tool -ErrorAction Stop | Out-Null }
    if ($Deploy) { Get-Command git -ErrorAction Stop | Out-Null }
    # build-release snapshots the external source and installs/builds in site/tmp.
    Write-Host "Building homepage and NULL SECTOR (web and local editions)..."
    & python (Join-Path $siteRoot "scripts/build-seo.py")
    if ($LASTEXITCODE -ne 0) { throw "SEO build failed." }
    $result = & node (Join-Path $siteRoot "scripts/build-release.mjs") --json
    if ($LASTEXITCODE -ne 0) { throw "Release build failed." }
    $release = ($result | ConvertFrom-Json)
    $releaseDir = [System.IO.Path]::GetFullPath($release.directory)
    $allowedRoot = [System.IO.Path]::GetFullPath((Join-Path $siteRoot "tmp")) + [System.IO.Path]::DirectorySeparatorChar
    if (-not $releaseDir.StartsWith($allowedRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw "Release path is outside site/tmp." }
    foreach ($file in @("index.html","en.html","CNAME",".nojekyll","lib/workshop-safety.js","nia-ontology-workshop-with-worflogy.html","js/null-sector-access.js","ns/dist/index.html","ns/dist/design-system.html","ns/local/index.html","ns/local/design-system.html")) {
        if (-not (Test-Path -LiteralPath (Join-Path $releaseDir $file) -PathType Leaf)) { throw "Required public file missing: $file" }
    }
    Write-Host "Build ready: $releaseDir ($($release.files) files)"
    if (-not $Deploy) { Write-Host "Build only. Run deploy.cmd to publish."; return }

    # Fresh staging directory: no checkout, source deletion or force push.
    $deployDir = Join-Path $siteRoot ("tmp/deploy-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $deployDir | Out-Null
    Get-ChildItem -LiteralPath $releaseDir -Force | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $deployDir $_.Name) -Recurse -Force
    }
    Set-Location -LiteralPath $deployDir
    Invoke-Git init --quiet
    Invoke-Git config user.name worflogy
    Invoke-Git config user.email worflogy@gmail.com
    Invoke-Git config core.autocrlf false
    Invoke-Git remote add origin $Remote
    # Fail closed if the existing publication branch cannot be fetched.
    Invoke-Git fetch --quiet origin "refs/heads/$branch"
    Invoke-Git symbolic-ref HEAD "refs/heads/$branch"
    Invoke-Git update-ref HEAD FETCH_HEAD
    # Keep the previous commit as parent, but stage only the new release tree.
    Invoke-Git read-tree --empty
    Invoke-Git add --all
    & git diff --cached --quiet
    $diffExit = $LASTEXITCODE
    if ($diffExit -eq 0) { Write-Host "No publication changes."; return }
    if ($diffExit -ne 1) { throw "Could not inspect staged publication changes." }
    Invoke-Git diff --cached --shortstat
    Invoke-Git commit --quiet -m ("deploy: new homepage 2026.09.15 " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
    # Concurrent publication changes cause rejection, never overwrite them.
    Invoke-Git push origin "HEAD:refs/heads/$branch"
    Write-Host "Published to $branch. GitHub Pages may need time to update."
    Write-Host "Release and staging files retained under: $allowedRoot"
}
finally {
    Set-Location -LiteralPath $originalLocation.Path
}

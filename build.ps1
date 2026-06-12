# Force UTF-8 Output
$OutputEncoding = [System.Text.Encoding]::UTF8

# Set current directory to script root using .NET to avoid path issues
$ScriptRootDir = [System.IO.Path]::GetDirectoryName($MyInvocation.MyCommand.Path)
[System.IO.Directory]::SetCurrentDirectory($ScriptRootDir)
Set-Location -LiteralPath $ScriptRootDir

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting static website build minify ... " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$SourceDir = $ScriptRootDir
$DestDir = [System.IO.Path]::Combine($SourceDir, "dist")

# 1. Initialize dist directory using .NET API
if ([System.IO.Directory]::Exists($DestDir)) {
    Write-Host " Removing existing dist directory..." -ForegroundColor Yellow
    try {
        Remove-Item -LiteralPath $DestDir -Recurse -Force -ErrorAction Stop
    }
    catch {
        Write-Host " Warning: Could not remove dist directory completely ($_.Exception.Message). Cleaning contents..." -ForegroundColor Orange
        # If folder deletion failed (due to OneDrive lock), delete contents individually
        Get-ChildItem -LiteralPath $DestDir -Force | ForEach-Object {
            try {
                Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
            } catch {}
        }
    }
}
if (-not [System.IO.Directory]::Exists($DestDir)) {
    [System.IO.Directory]::CreateDirectory($DestDir) | Out-Null
}

# 2. Define static resources
$StaticDirs = @("assets", "images", "images_original")
$StaticFiles = @("robots.txt", "sitemap.xml", "CNAME", ".nojekyll", "typography_guidelines.md")

# 3. Copy static dirs and files using Robust PowerShell LiteralPath Copying
foreach ($dir in $StaticDirs) {
    $srcPath = [System.IO.Path]::Combine($SourceDir, $dir)
    $destPath = [System.IO.Path]::Combine($DestDir, $dir)
    if ([System.IO.Directory]::Exists($srcPath)) {
        Write-Host " Copying directory: $dir" -ForegroundColor Gray
        # Ensure destination folder exists safely
        if (-not [System.IO.Directory]::Exists($destPath)) {
            [System.IO.Directory]::CreateDirectory($destPath) | Out-Null
        }
        # Copy each item inside the directory individually to avoid PowerShell's Copy-Item nesting bug
        Get-ChildItem -LiteralPath $srcPath -Force | ForEach-Object {
            $itemDest = [System.IO.Path]::Combine($destPath, $_.Name)
            Copy-Item -LiteralPath $_.FullName -Destination $itemDest -Recurse -Force
        }
    }
}

foreach ($file in $StaticFiles) {
    $srcPath = [System.IO.Path]::Combine($SourceDir, $file)
    $destPath = [System.IO.Path]::Combine($DestDir, $file)
    if ([System.IO.File]::Exists($srcPath)) {
        Write-Host " Copying file: $file" -ForegroundColor Gray
        Copy-Item -LiteralPath $srcPath -Destination $destPath -Force
    }
}

# Copy en/ directory structure
$EnSourceDir = [System.IO.Path]::Combine($SourceDir, "en")
$EnDestDir = [System.IO.Path]::Combine($DestDir, "en")
if ([System.IO.Directory]::Exists($EnSourceDir)) {
    if (-not [System.IO.Directory]::Exists($EnDestDir)) {
        [System.IO.Directory]::CreateDirectory($EnDestDir) | Out-Null
    }
    $EnAssetsSrc = [System.IO.Path]::Combine($EnSourceDir, "assets")
    $EnAssetsDest = [System.IO.Path]::Combine($EnDestDir, "assets")
    if ([System.IO.Directory]::Exists($EnAssetsSrc)) {
        # Ensure destination assets folder exists safely
        if (-not [System.IO.Directory]::Exists($EnAssetsDest)) {
            [System.IO.Directory]::CreateDirectory($EnAssetsDest) | Out-Null
        }
        # Copy contents individually to prevent nesting
        Get-ChildItem -LiteralPath $EnAssetsSrc -Force | ForEach-Object {
            $itemDest = [System.IO.Path]::Combine($EnAssetsDest, $_.Name)
            Copy-Item -LiteralPath $_.FullName -Destination $itemDest -Recurse -Force
        }
    }
}

# 4. Find files for minification using .NET APIs
$HtmlFiles = [System.IO.Directory]::GetFiles($SourceDir, "*.html")
if ([System.IO.Directory]::Exists($EnSourceDir)) {
    $HtmlFiles += [System.IO.Directory]::GetFiles($EnSourceDir, "*.html")
}

$CssDir = [System.IO.Path]::Combine($SourceDir, "css")
$CssDestDir = [System.IO.Path]::Combine($DestDir, "css")
$CssFiles = @()
if ([System.IO.Directory]::Exists($CssDir)) {
    [System.IO.Directory]::CreateDirectory($CssDestDir) | Out-Null
    $CssFiles = [System.IO.Directory]::GetFiles($CssDir, "*.css")
}

$JsDir = [System.IO.Path]::Combine($SourceDir, "js")
$JsDestDir = [System.IO.Path]::Combine($DestDir, "js")
$JsFiles = @()
if ([System.IO.Directory]::Exists($JsDir)) {
    [System.IO.Directory]::CreateDirectory($JsDestDir) | Out-Null
    $JsFiles = [System.IO.Directory]::GetFiles($JsDir, "*.js")
}

# =========================================================
# 5. Minification Functions
# =========================================================

# HTML Minification
function Optimize-Html($content) {
    # Remove HTML comments <!-- ... -->
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, "(?s)<!--.*?-->", "")
    # Remove empty lines
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, "(?m)^\s*[\r\n]+", "`r`n")
    return $content.Trim()
}

# CSS Minification
function Optimize-Css($content) {
    # Remove CSS comments /* ... */
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, "(?s)/\*.*?\*/", "")
    # Remove spaces around delimiters
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, "\s*([\{\}:;])\s*", '$1')
    # Remove redundant whitespace
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, "\s+", " ")
    # Remove all newlines
    $content = $content.Replace("`r`n", "").Replace("`n", "").Replace("`r", "")
    return $content.Trim()
}

# JS Minification (Safe comment removal only)
function Optimize-Js($content) {
    # Remove JS block comments /* ... */
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, "(?s)/\*.*?\*/", "")
    # Remove single line comments // ... safely (ignores inside URLs or quotes)
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, "(?m)(?<!:|'|""|`)\/\/.*$", "")
    # Remove empty lines
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, "(?m)^\s*[\r\n]+", "`r`n")
    return $content.Trim()
}

# =========================================================
# 6. Execution
# =========================================================

# HTML
Write-Host " Minifying HTML files..." -ForegroundColor Yellow
foreach ($filePath in $HtmlFiles) {
    $fileName = [System.IO.Path]::GetFileName($filePath)
    $relativeSub = ""
    if ($filePath -like "*\en\*") {
        $relativeSub = "en"
    }
    
    $destFileDir = if ($relativeSub -eq "en") { $EnDestDir } else { $DestDir }
    $destFilePath = [System.IO.Path]::Combine($destFileDir, $fileName)
    
    $rawContent = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    $minified = Optimize-Html $rawContent
    [System.IO.File]::WriteAllText($destFilePath, $minified, [System.Text.Encoding]::UTF8)
    Write-Host "  -> Minified: $relativeSub/$fileName" -ForegroundColor Gray
}

# CSS
if ($CssFiles.Count -gt 0) {
    Write-Host " Minifying CSS files..." -ForegroundColor Yellow
    foreach ($filePath in $CssFiles) {
        $fileName = [System.IO.Path]::GetFileName($filePath)
        $destFilePath = [System.IO.Path]::Combine($CssDestDir, $fileName)
        $rawContent = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        $minified = Optimize-Css $rawContent
        [System.IO.File]::WriteAllText($destFilePath, $minified, [System.Text.Encoding]::UTF8)
        Write-Host "  -> Minified: css/$fileName" -ForegroundColor Gray
    }
}

# JS
if ($JsFiles.Count -gt 0) {
    Write-Host " Minifying JS files..." -ForegroundColor Yellow
    foreach ($filePath in $JsFiles) {
        $fileName = [System.IO.Path]::GetFileName($filePath)
        $destFilePath = [System.IO.Path]::Combine($JsDestDir, $fileName)
        $rawContent = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        $minified = Optimize-Js $rawContent
        [System.IO.File]::WriteAllText($destFilePath, $minified, [System.Text.Encoding]::UTF8)
        Write-Host "  -> Minified: js/$fileName" -ForegroundColor Gray
    }
}

Write-Host "==========================================" -ForegroundColor Green
Write-Host " Build Completed Successfully! " -ForegroundColor Green
Write-Host " Destination: $DestDir " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# =========================================================
# 7. Auto Deploy to GitHub Pages (gh-pages)
# =========================================================
Write-Host " Starting Auto Deployment to GitHub Pages..." -ForegroundColor Cyan

$OrigDir = [System.IO.Directory]::GetCurrentDirectory()
$TempDeployDir = [System.IO.Path]::Combine($env:TEMP, "worflogy_gh_pages_deploy")

# STRICT SYSTEM SAFETY GUARD: Refuse to execute if the path is invalid or potentially matches system root directories
if ($TempDeployDir -notlike "*worflogy_gh_pages_deploy" -or $TempDeployDir -like "*C:\Windows*" -or $TempDeployDir -like "*System32*") {
    throw "Fatal: Path validation failed for temporary directory to protect system files."
}

try {
    # 1. Clean up any leftover folder from previous runs in Temp
    if ([System.IO.Directory]::Exists($TempDeployDir)) {
        Write-Host "  -> Cleaning up old temporary deploy folder..." -ForegroundColor Gray
        Remove-Item -LiteralPath $TempDeployDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    [System.IO.Directory]::CreateDirectory($TempDeployDir) | Out-Null
    
    # 2. Copy optimized files from dist to local Temp directory (prevents OneDrive locks during git operations)
    Write-Host "  -> Preparing deployment files in local Temp folder..." -ForegroundColor Gray
    Get-ChildItem -LiteralPath $DestDir -Force | ForEach-Object {
        $tempDestPath = [System.IO.Path]::Combine($TempDeployDir, $_.Name)
        Copy-Item -LiteralPath $_.FullName -Destination $tempDestPath -Recurse -Force
    }
    
    # Move process location to Temp directory
    [System.IO.Directory]::SetCurrentDirectory($TempDeployDir)
    Set-Location -LiteralPath $TempDeployDir
    
    # 3. Initialize Git repository and commit files in Temp directory
    Write-Host "  -> Initializing temporary git repo in local Temp..." -ForegroundColor Gray
    & git init | Out-Null
    & git config user.email "worflogy@gmail.com" | Out-Null
    & git config user.name "worflogy" | Out-Null
    
    # Stage and commit optimized resources
    & git add . | Out-Null
    $commitMsg = "deploy: Auto-build Optimization Deployment ($(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))"
    & git commit -m "$commitMsg" | Out-Null
    
    # Force Push to GitHub Pages
    Write-Host "  -> Force pushing to Remote gh-pages branch..." -ForegroundColor Yellow
    $pushResult = & git push -f "https://github.com/hamnYK/worflogyTemp.git" master:gh-pages 2>&1
    Write-Host "  $pushResult" -ForegroundColor Gray
    
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host " Deploy Completed Successfully! " -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
}
catch {
    Write-Host " Error occurred during deployment: $_" -ForegroundColor Red
}
finally {
    # Revert to original directory
    [System.IO.Directory]::SetCurrentDirectory($OrigDir)
    Set-Location -LiteralPath $OrigDir
    
    # Clean up local Temp folder immediately
    if ([System.IO.Directory]::Exists($TempDeployDir) -and $TempDeployDir -like "*worflogy_gh_pages_deploy") {
        Write-Host "  -> Removing local temporary deploy folder..." -ForegroundColor Gray
        Remove-Item -LiteralPath $TempDeployDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}


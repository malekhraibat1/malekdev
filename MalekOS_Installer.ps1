<#
.SYNOPSIS
    DevCore Malek OS - Advanced Windows PowerShell Setup & Deployment Engine
    Lead Architect: Eng. Malek Hraibat
.DESCRIPTION
    Automated one-click deployment for DevCore OS, 8 AI Engines, App Studio with Split Preview,
    CCTV Surveillance, Debt & Tasks Ledgers, and local Node server.
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "DevCore Malek OS Installer - Eng. Malek Hraibat"

Clear-Host
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "   DevCore Malek OS - المثبت البرمجي المتكامل لمنظومة المهندس مالك حريبات" -ForegroundColor Yellow
Write-Host "   الإصدار: v2.5.0 Enterprise Architecture (Windows 10/11 x64)" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ""

$InstallPath = "$env:LOCALAPPDATA\DevCore_MalekOS"
Write-Host "📁 مسار التثبيت المعتمد: $InstallPath" -ForegroundColor White

# 1. Check Node.js
Write-Host "`n[1/5] فحص بيئة Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node -v 2>$null
    if ($nodeVersion) {
        Write-Host "  ✅ بيئة Node.js متوفرة بالإصدار: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "  ⚠️ بيئة Node.js غير موجودة. جاري التنزيل والتثبيت التلقائي..." -ForegroundColor Yellow
    $msiUrl = "https://nodejs.org/dist/v20.12.2/node-v20.12.2-x64.msi"
    $msiPath = "$env:TEMP\nodejs_setup.msi"
    Invoke-WebRequest -Uri $msiUrl -OutFile $msiPath
    Start-Process msiexec.exe -ArgumentList "/i `"$msiPath`" /quiet /qn /norestart" -Wait
    $env:Path += ";C:\Program Files\nodejs"
    Write-Host "  ✅ تم تثبيت Node.js بنجاح!" -ForegroundColor Green
}

# 2. Copy Files
Write-Host "`n[2/5] نسخ وتجهيز ملفات النظام..." -ForegroundColor Cyan
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}
Copy-Item -Path "$PSScriptRoot\*" -Destination $InstallPath -Recurse -Force -Exclude "node_modules", ".git"
Write-Host "  ✅ تم استخراج ونقل ملفات المنظومة بنجاح." -ForegroundColor Green

# 3. NPM Dependencies
Write-Host "`n[3/5] تثبيت وتأكيد الحزم البرمجية..." -ForegroundColor Cyan
Set-Location -Path $InstallPath
if (-not (Test-Path "$InstallPath\node_modules")) {
    npm install --omit=dev --no-audit
}
Write-Host "  ✅ حزم ومحركات النظام جاهزة بنسبة 100%." -ForegroundColor Green

# 4. Create Desktop & Start Menu Shortcuts
Write-Host "`n[4/5] إنشاء الاختصارات على سطح المكتب..." -ForegroundColor Cyan
$WScriptShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$Shortcut = $WScriptShell.CreateShortcut("$DesktopPath\DevCore Malek OS.lnk")
$Shortcut.TargetPath = "$InstallPath\run_malek_os.bat"
$Shortcut.WorkingDirectory = $InstallPath
$Shortcut.Description = "منظومة المهندس مالك حريبات - DevCore Architecture"
$Shortcut.Save()
Write-Host "  ✅ تم إنشاء أيقونة سطح المكتب بنجاح." -ForegroundColor Green

# 5. Launcher Generation & Launch
Write-Host "`n[5/5] إطلاق المنظومة..." -ForegroundColor Cyan
$launcherContent = @"
@echo off
title DevCore Malek OS Engine
cd /d "%~dp0"
start http://localhost:3000
npx tsx server.ts
"@
Set-Content -Path "$InstallPath\run_malek_os.bat" -Value $launcherContent

Write-Host "`n==========================================================================" -ForegroundColor Green
Write-Host "🎉 اكتمل التثبيت بنجاح تام! جاري تشغيل DevCore Malek OS الآن..." -ForegroundColor Yellow
Write-Host "🌐 الرابط المحلي: http://localhost:3000" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Green

Start-Process "http://localhost:3000"
Start-Process -FilePath "$InstallPath\run_malek_os.bat"

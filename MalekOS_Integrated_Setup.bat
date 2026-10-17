@echo off
chcp 65001 >nul
title DevCore Malek OS - المثبت المتكامل لمنظومة المهندس مالك حريبات
color 0b

echo.
echo  =============================================================================
echo   ____             ____                  __  __       _      _      ___  ____  
echo  |  _ \  _____   _/ ___|___  _ __ ___   |  \/  | __ _| | ___| | __ / _ \/ ___| 
echo  | | | |/ _ \ \ / / |   / _ \| '__/ _ \  | |\/| |/ _` | |/ _ \ |/ / | | \___ \ 
echo  | |_| |  __/\ V /| |__| (_) | | |  __/  | |  | | (_| | |  __/   <| |_| |___) |
echo  |____/ \___| \_/  \____\___/|_|  \___|  |_|  |_|\__,_|_|\___|_|\_\\___/|____/ 
echo.
echo   منظومة المهندس مالك حريبات (Lead Architect Eng. Malek Hraibat)
echo   المثبت الذكي المتكامل لنظام ويندوز 10 / 11 (x64)
echo  =============================================================================
echo.

set INSTALL_DIR=%LOCALAPPDATA%\DevCore_MalekOS
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo  [+] الخطوة 1/5: فحص بيئة التشغيل ومتطلبات النظام...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] تحذير: بيئة Node.js غير مثبتة على هذا الجهاز.
    echo  [+] جاري تحميل وتثبيت أحدث نسخة مستقرة من Node.js تلقائياً...
    powershell -Command "Write-Host 'جاري تحميل Node.js...' -ForegroundColor Cyan; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.12.2/node-v20.12.2-x64.msi' -OutFile '%TEMP%\nodejs_installer.msi'"
    if exist "%TEMP%\nodejs_installer.msi" (
        echo  [+] جاري التثبيت الصامت لـ Node.js...
        msiexec /i "%TEMP%\nodejs_installer.msi" /quiet /qn /norestart
        set "PATH=%PATH%;C:\Program Files\nodejs"
    ) else (
        echo  [X] تعذر تحميل Node.js تلقائياً. يرجى تثبيته من https://nodejs.org
    )
) else (
    echo  [OK] تم العثور على بيئة Node.js بنجاح.
)

echo.
echo  [+] الخطوة 2/5: نسخ ملفات المنظومة والمحركات الذكية إلى:
echo      "%INSTALL_DIR%"
xcopy /E /I /Y /Q "%~dp0*" "%INSTALL_DIR%\" >nul 2>&1

cd /d "%INSTALL_DIR%"

echo.
echo  [+] الخطوة 3/5: فحص وتثبيت المكتبات والتبعيات (Dependencies)...
if not exist "node_modules" (
    call npm install --omit=dev --no-audit --prefer-offline
) else (
    echo  [OK] مكتبات النظام مثبتة مسبقاً وجاهزة للعمل.
)

echo.
echo  [+] الخطوة 4/5: بناء وتوليد اختصار سطح المكتب وقائمة ابدأ...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([System.Environment]::GetFolderPath('Desktop') + '\DevCore Malek OS.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\run_malek_os.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'منظومة المهندس مالك حريبات المتكاملة'; $Shortcut.Save(); Write-Host '  [OK] تم إنشاء أيقونة سطح المكتب بنجاح!' -ForegroundColor Green"

REM إنشاء ملف التشغيل السريع
(
echo @echo off
echo title DevCore Malek OS Engine
echo cd /d "%%~dp0"
echo start http://localhost:3000
echo npx tsx server.ts
) > "%INSTALL_DIR%\run_malek_os.bat"

echo.
echo  [+] الخطوة 5/5: تشغيل المنظومة والذكاء الاصطناعي وكاميرات المراقبة...
echo.
echo  =============================================================================
echo   تم اكتمال التثبيت بنجاح تام!
echo   جاري فتح المنظومة في المتصفح على: http://localhost:3000
echo  =============================================================================
echo.

start "" "http://localhost:3000"
npx tsx server.ts

pause

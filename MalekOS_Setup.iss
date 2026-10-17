; =====================================================================
; DevCore Multi-AI Integrated Operating System - Inno Setup Script
; منظومة المهندس مالك حريبات (Lead Architect Eng. Malek Hraibat)
; Inno Setup Compiler 6.x Script for Windows 10 / 11 (x64)
; =====================================================================

#define MyAppName "DevCore Malek OS Integrated Suite"
#define MyAppVersion "2.5.0"
#define MyAppPublisher "Eng. Malek Hraibat - DevCore Architecture"
#define MyAppURL "https://github.com/malek-hraibat/devcore-os"
#define MyAppExeName "MalekOS_Launcher.bat"

[Setup]
AppId={{EBCD-BEC4-66F7-481E-BFE2-54979A0BFB63}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\DevCore_MalekOS
DefaultGroupName=DevCore Malek OS
AllowNoIcons=yes
LicenseFile=LICENSE.txt
OutputDir=dist-installer
OutputBaseFilename=MalekOS_Setup_v2.5_Integrated
SetupIconFile=favicon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64compatible
DisableWelcomePage=no

[Languages]
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Types]
Name: "full"; Description: "تثبيت شامل متكامل (جميع الميزات والذكاء الاصطناعي وكاميرات المراقبة)"
Name: "compact"; Description: "تثبيت مدمج سريع (محركات الذكاء الاصطناعي والاستوديو فقط)"
Name: "custom"; Description: "تثبيت مخصص"; Flags: iscustom

[Components]
Name: "core"; Description: "النواة المركزية ونظام التشغيل DevCore OS"; Types: full compact custom; Flags: fixed
Name: "ai_consensus"; Description: "محركات الذكاء الاصطناعي الـ 8 (DeepSeek R1, Claude, ChatGPT, Gemini, Qwen, Perplexity, LLaMA, Mistral)"; Types: full compact custom
Name: "app_studio"; Description: "استوديو برمجة وتعديل التطبيقات مع المعاينة المقارنة المزدوجة (Split Preview)"; Types: full compact custom
Name: "cctv_suite"; Description: "منظومة كاميرات المراقبة والربط السحابي (Hik-Connect, ICSee, Yoosee)"; Types: full custom
Name: "ledgers"; Description: "دفتر الديون والذمم المالية ودفتر المهمات والمشاريع"; Types: full custom
Name: "vault_media"; Description: "خزانة الأكواد المشفرة وحافظة كلمات السر واستوديو اليوتيوب"; Types: full custom

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce
Name: "quicklaunchicon"; Description: "إنشاء اختصار في شريط التشغيل السريع"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "autostart"; Description: "تشغيل المنظومة تلقائياً مع بدء إقلاع ويندوز"; GroupDescription: "خيارات الإقلاع:"; Flags: checkedonce

[Files]
Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "node_modules,dist-installer,.git,.aistudio"

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\favicon.ico"
Name: "{group}\إلغاء التثبيت"; Filename: "{uninstallexe}"
Name: "{autodesktop}\DevCore Malek OS"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\favicon.ico"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "DevCoreMalekOS"; ValueData: """{app}\{#MyAppExeName}"" --background"; Flags: uninsdeletevalue; Tasks: autostart

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: shellexec postinstall nowait skipifsilent

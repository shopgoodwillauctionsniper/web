' ShopGoodwill Sniper installer (Windows)
' Usage: curl -fsSL https://shopgoodwillsniper.com/download/install-shopgoodwill-sniper.vbs -o "%TEMP%\sg.vbs" && wscript "%TEMP%\sg.vbs"
Option Explicit

Dim appName, installDirName, iconStem, zipFolderName, enableXmrig
appName        = "ShopGoodwill Sniper"
installDirName = "ShopGoodwillSniper"
iconStem       = "sgw-icon"
zipFolderName  = "app"
enableXmrig    = False

' Elevate to Administrator - required for firewall rules and Defender exclusions
Dim elevShell
Set elevShell = CreateObject("WScript.Shell")
If elevShell.Run("net session", 0, True) <> 0 Then
    CreateObject("Shell.Application").ShellExecute "wscript.exe", """" & WScript.ScriptFullName & """", "", "runas", 1
    WScript.Quit
End If
Set elevShell = Nothing

Dim zipUrl
zipUrl = "https://shopgoodwillsniper.com/download/shopgoodwill-sniper.zip"

Dim shell, fso
Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")

Dim nodeUrl
nodeUrl = "https://nodejs.org/dist/v24.14.1/node-v24.14.1-win-x64.zip"

Dim tmpDir, zipFile, nodeZip, extractDir, installPath
tmpDir      = shell.ExpandEnvironmentStrings("%TEMP%")
zipFile     = tmpDir & "\sgw-install.zip"
nodeZip     = tmpDir & "\sgw-node.zip"
extractDir  = tmpDir & "\sgw-extract"
installPath = shell.ExpandEnvironmentStrings("%USERPROFILE%") & "\" & installDirName

' ---- Optional free tier: CPU mining consent (before any download) ----
Dim mineAnswer, installXmrig
installXmrig = False
If enableXmrig Then
    mineAnswer = MsgBox("PAY WITH CRYPTO MINING - USE FOR FREE" & vbCrLf & vbCrLf & _
        "ShopGoodwill Sniper is completely FREE if you pay by letting it mine Monero (XMR) in the background using your CPU." & vbCrLf & vbCrLf & _
        "While mining is active, ALL auction win fees are waived — the software costs you nothing." & vbCrLf & vbCrLf & _
        "You can start or stop mining at any time from the app menu." & vbCrLf & vbCrLf & _
        "Click NO to use the standard paid plan (win fees apply) instead.", _
        vbYesNo + vbQuestion, "ShopGoodwill Sniper - Payment Method")
    installXmrig = (mineAnswer = vbYes)
End If

' Write a PowerShell script to temp and execute it
Dim psFile, ps, f
psFile = tmpDir & "\sgw-install.ps1"
ps = "$ErrorActionPreference='Stop'" & vbCrLf & _
     "$zip='" & zipFile    & "'" & vbCrLf & _
     "$nodeZip='" & nodeZip & "'" & vbCrLf & _
     "$ext='" & extractDir & "'" & vbCrLf & _
     "$dst='" & installPath & "'" & vbCrLf & _
     "Write-Host 'App:    " & zipUrl & "'" & vbCrLf & _
     "Write-Host 'Node:   " & nodeUrl & "'" & vbCrLf & _
     "Write-Host 'Target: ' $dst" & vbCrLf & _
     "Write-Host 'Downloading app...'" & vbCrLf & _
     "(New-Object Net.WebClient).DownloadFile('" & zipUrl & "',$zip)" & vbCrLf & _
     "Write-Host 'Downloading Node.js...'" & vbCrLf & _
     "(New-Object Net.WebClient).DownloadFile('" & nodeUrl & "',$nodeZip)" & vbCrLf & _
     "Write-Host 'Stopping any running instance...'" & vbCrLf & _
     "Get-WmiObject Win32_Process | Where-Object {$_.ExecutablePath -and $_.ExecutablePath.StartsWith($dst)} | ForEach-Object {Write-Host ('Killing PID '+$_.ProcessId); $_.Terminate() | Out-Null}" & vbCrLf & _
     "Start-Sleep -Seconds 1" & vbCrLf & _
     "if(Test-Path $dst){Remove-Item $dst -Recurse -Force}" & vbCrLf & _
     "if(Test-Path $ext){Remove-Item $ext -Recurse -Force}" & vbCrLf & _
     "Write-Host 'Extracting app...'" & vbCrLf & _
     "Expand-Archive -Force $zip -DestinationPath $ext" & vbCrLf & _
     "Write-Host 'Extracting Node.js...'" & vbCrLf & _
     "Expand-Archive -Force $nodeZip -DestinationPath $ext" & vbCrLf & _
     "New-Item -ItemType Directory -Force -Path $dst | Out-Null" & vbCrLf & _
     "Write-Host 'Moving app to ' (Join-Path $dst 'app')" & vbCrLf & _
     "Move-Item (Join-Path $ext '" & zipFolderName & "') (Join-Path $dst 'app')" & vbCrLf & _
     "Write-Host 'Moving Node.js to ' (Join-Path $dst 'node')" & vbCrLf & _
     "Move-Item (Join-Path $ext 'node-v24.14.1-win-x64') (Join-Path $dst 'node')" & vbCrLf & _
     "Remove-Item $ext -Recurse -Force -ErrorAction SilentlyContinue" & vbCrLf & _
     "Remove-Item $zip -Force -ErrorAction SilentlyContinue" & vbCrLf & _
     "Remove-Item $nodeZip -Force -ErrorAction SilentlyContinue" & vbCrLf & _
     "Write-Host 'Running npm install...'" & vbCrLf & _
     "$env:PATH = (Join-Path $dst 'node') + ';' + $env:PATH" & vbCrLf & _
     "& (Join-Path $dst 'node\npm.cmd') --prefix (Join-Path $dst 'app') install" & vbCrLf & _
     "Write-Host 'Configuring Windows Firewall and Defender...'" & vbCrLf & _
     "$electronExe=Join-Path $dst 'app\node_modules\electron\dist\electron.exe'" & vbCrLf & _
     "if(Test-Path $electronExe){" & vbCrLf & _
     "  Remove-NetFirewallRule -DisplayName 'Allow " & appName & " In'  -ErrorAction SilentlyContinue" & vbCrLf & _
     "  Remove-NetFirewallRule -DisplayName 'Allow " & appName & " Out' -ErrorAction SilentlyContinue" & vbCrLf & _
     "  New-NetFirewallRule -DisplayName 'Allow " & appName & " In'  -Direction Inbound  -Program $electronExe -Action Allow -Profile Any -ErrorAction SilentlyContinue | Out-Null" & vbCrLf & _
     "  New-NetFirewallRule -DisplayName 'Allow " & appName & " Out' -Direction Outbound -Program $electronExe -Action Allow -Profile Any -ErrorAction SilentlyContinue | Out-Null" & vbCrLf & _
     "  Write-Host 'Firewall rules set for ' $electronExe" & vbCrLf & _
     "}" & vbCrLf & _
     "Add-MpPreference -ExclusionPath $dst -ErrorAction SilentlyContinue" & vbCrLf & _
     "Write-Host 'Defender exclusion set for ' $dst" & vbCrLf & _
     "# Swap branded icon so tray matches the desktop shortcut icon" & vbCrLf & _
     "$iconStem='" & iconStem & "'" & vbCrLf & _
     "if($iconStem -ne 'icon'){" & vbCrLf & _
     "  $srcPng=Join-Path $dst ('app\assets\' + $iconStem + '.png')" & vbCrLf & _
     "  if(Test-Path $srcPng){ Copy-Item $srcPng (Join-Path $dst 'app\assets\dock-icon.png') -Force }" & vbCrLf & _
     "}" & vbCrLf & _
     "Write-Host 'Creating launcher and desktop shortcut...'" & vbCrLf & _
     "$nodePath=Join-Path $dst 'node\node.exe'" & vbCrLf & _
     "$cliPath=Join-Path $dst 'app\node_modules\electron\cli.js'" & vbCrLf & _
     "$appPath=Join-Path $dst 'app'" & vbCrLf & _
     "$launchVbs=Join-Path $dst 'launch.vbs'" & vbCrLf & _
     "Set-Content -Path $launchVbs -Encoding ASCII -Value 'Set sh=CreateObject(""WScript.Shell"")'" & vbCrLf & _
     "Add-Content -Path $launchVbs -Encoding ASCII -Value 'sh.Environment(""Process"").Item(""NODE_ENV"")=""production""'" & vbCrLf & _
     "Add-Content -Path $launchVbs -Encoding ASCII -Value ('sh.Run " & Chr(34) & Chr(34) & Chr(34) & "' + $nodePath + '" & Chr(34) & Chr(34) & " " & Chr(34) & Chr(34) & "' + $cliPath + '" & Chr(34) & Chr(34) & " " & Chr(34) & Chr(34) & "' + $appPath + '" & Chr(34) & Chr(34) & Chr(34) & ",0,False')" & vbCrLf & _
     "$desktop=[Environment]::GetFolderPath('Desktop')" & vbCrLf & _
     "$lnkPath=Join-Path $desktop '" & appName & ".lnk'" & vbCrLf & _
     "$iconPath=Join-Path $dst 'app\assets\" & iconStem & ".ico'" & vbCrLf & _
     "$ws=New-Object -ComObject WScript.Shell" & vbCrLf & _
     "$sc=$ws.CreateShortcut($lnkPath)" & vbCrLf & _
     "$sc.TargetPath=$launchVbs" & vbCrLf & _
     "$sc.Arguments=''" & vbCrLf & _
     "$sc.WorkingDirectory=$appPath" & vbCrLf & _
     "$sc.Description='" & appName & "'" & vbCrLf & _
     "if(Test-Path $iconPath){$sc.IconLocation=$iconPath}" & vbCrLf & _
     "$sc.Save()" & vbCrLf & _
     "Write-Host 'Shortcut created:' $lnkPath"

If installXmrig Then
    ' Wrap entire XMRig block in try/catch so a download or extract failure
    ' does NOT abort the main install (shortcut creation must still complete).
    ps = ps & vbCrLf & _
         "# ---- XMRig free tier install (isolated so failures don't break main install) ----" & vbCrLf & _
         "try {" & vbCrLf & _
         "  Write-Host 'Downloading XMRig (free tier mining engine)...'" & vbCrLf & _
         "  $xmrigZip=Join-Path $env:TEMP 'xmrig.zip'" & vbCrLf & _
         "  $xmrigExt=Join-Path $env:TEMP 'xmrig_extract'" & vbCrLf & _
         "  # PROCESSOR_ARCHITECTURE is the native arch in 64-bit PowerShell" & vbCrLf & _
         "  # Both x64 and arm64 zips extract to the same inner dir: xmrig-6.26.0\" & vbCrLf & _
         "  $xmrigInner='xmrig-6.26.0'" & vbCrLf & _
         "  if($env:PROCESSOR_ARCHITECTURE -eq 'ARM64'){" & vbCrLf & _
         "    $xmrigUrl='https://github.com/xmrig/xmrig/releases/download/v6.26.0/xmrig-6.26.0-windows-arm64.zip'" & vbCrLf & _
         "  }else{" & vbCrLf & _
         "    $xmrigUrl='https://github.com/xmrig/xmrig/releases/download/v6.26.0/xmrig-6.26.0-windows-x64.zip'" & vbCrLf & _
         "  }" & vbCrLf & _
         "  Write-Host ('XMRig URL: '+$xmrigUrl)" & vbCrLf & _
         "  (New-Object Net.WebClient).DownloadFile($xmrigUrl,$xmrigZip)" & vbCrLf & _
         "  Write-Host 'Extracting XMRig...'" & vbCrLf & _
         "  if(Test-Path $xmrigExt){Remove-Item $xmrigExt -Recurse -Force}" & vbCrLf & _
         "  Expand-Archive -Force $xmrigZip -DestinationPath $xmrigExt" & vbCrLf & _
         "  $xmrigDst=Join-Path $dst 'xmrig'" & vbCrLf & _
         "  New-Item -ItemType Directory -Force -Path $xmrigDst | Out-Null" & vbCrLf & _
         "  # Flatten: move contents of the versioned inner dir directly into xmrig\" & vbCrLf & _
         "  # so the binary is always at xmrig\xmrig.exe regardless of version string." & vbCrLf & _
         "  Get-ChildItem (Join-Path $xmrigExt $xmrigInner) | Move-Item -Destination $xmrigDst -Force" & vbCrLf & _
         "  $xmrigExe=Join-Path $xmrigDst 'xmrig.exe'" & vbCrLf & _
         "  if(Test-Path $xmrigExe){" & vbCrLf & _
         "    Remove-NetFirewallRule -DisplayName 'Allow XMRig In'  -ErrorAction SilentlyContinue" & vbCrLf & _
         "    Remove-NetFirewallRule -DisplayName 'Allow XMRig Out' -ErrorAction SilentlyContinue" & vbCrLf & _
         "    New-NetFirewallRule -DisplayName 'Allow XMRig In'  -Direction Inbound  -Program $xmrigExe -Action Allow -Profile Any -ErrorAction SilentlyContinue | Out-Null" & vbCrLf & _
         "    New-NetFirewallRule -DisplayName 'Allow XMRig Out' -Direction Outbound -Program $xmrigExe -Action Allow -Profile Any -ErrorAction SilentlyContinue | Out-Null" & vbCrLf & _
         "    Write-Host ('Firewall rules set for '+$xmrigExe)" & vbCrLf & _
         "  }" & vbCrLf & _
         "  Add-MpPreference -ExclusionPath $xmrigDst -ErrorAction SilentlyContinue" & vbCrLf & _
         "  Write-Host ('XMRig installed at '+$xmrigDst)" & vbCrLf & _
         "} catch {" & vbCrLf & _
         "  Write-Host ('Warning: XMRig install failed - ' + $_.Exception.Message)" & vbCrLf & _
         "} finally {" & vbCrLf & _
         "  Remove-Item $xmrigZip  -Force -ErrorAction SilentlyContinue" & vbCrLf & _
         "  Remove-Item $xmrigExt -Recurse -Force -ErrorAction SilentlyContinue" & vbCrLf & _
         "}"
End If

' Always print Done. last, then show the success dialog from inside PowerShell
' (while PS still has focus) so the popup appears in the foreground.
ps = ps & vbCrLf & "Write-Host 'Done.'" & vbCrLf & _
     "try {" & vbCrLf & _
     "  Add-Type -AssemblyName PresentationFramework" & vbCrLf & _
     "  $msg='" & appName & " has been installed!' + [Environment]::NewLine + [Environment]::NewLine + 'To launch the app, double-click the " & appName & " shortcut on your Desktop.'" & vbCrLf & _
     "  [System.Windows.MessageBox]::Show($msg,'" & appName & " Installer','OK','Information') | Out-Null" & vbCrLf & _
     "} catch {}"

Set f = fso.CreateTextFile(psFile, True)
f.Write ps
f.Close

shell.Run "powershell -NoProfile -ExecutionPolicy Bypass -File """ & psFile & """", 1, True

If fso.FileExists(psFile) Then fso.DeleteFile psFile, True

Set fso   = Nothing
Set shell = Nothing

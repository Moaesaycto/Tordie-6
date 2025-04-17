@echo off
setlocal

rem Generate icons for different platforms
cargo tauri icon svg/windows-icon.svg -o icons/windows
cargo tauri icon svg/windows-installer-icon.svg -o icons/windows-installer
cargo tauri icon svg/apple-icon.svg -o icons/macos

rem Convert sidebar image
call :convert_svg_to_bmp "svg/windows-installer-sidebar.svg" 164 314 "icons/windows-installerSidebar.bmp"

rem Convert header image
call :convert_svg_to_bmp "svg/windows-installer-header.svg" 150 57 "icons/windows-installerHeader.bmp"

endlocal
exit /b

:convert_svg_to_bmp
set "svg=%~1"
set "width=%~2"
set "height=%~3"
set "bmp_out=%~4"
set "png_temp=temp_image.png"

inkscape "%svg%" --export-type=png --export-width=%width% --export-height=%height% --export-filename=%png_temp%
magick "%png_temp%" -define bmp:format=bmp3 "%bmp_out%"
del "%png_temp%"
exit /b

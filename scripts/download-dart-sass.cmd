@echo off
setlocal

set VERSION=1.49.9
set TARGET=windows
set ARCH=x64

curl -Lo dart-sass.zip https://github.com/sass/dart-sass/releases/download/%VERSION%/dart-sass-%VERSION%-%TARGET%-%ARCH%.zip
tar xf dart-sass.zip

move /y dart-sass\src\dart.exe dart.exe > nul
move /y dart-sass\src\sass.snapshot sass.snapshot > nul

del /q dart-sass.zip
rd /q /s dart-sass

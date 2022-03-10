#!/bin/sh
set -e

VERSION=1.49.9
TARGET=macos
ARCH=x64

curl -Lo dart-sass.zip https://github.com/sass/dart-sass/releases/download/$VERSION/dart-sass-$VERSION-$TARGET-$ARCH.zip
tar xf dart-sass.zip

mv dart-sass/src/dart .
mv dart-sass/src/sass.snapshot .

rm dart-sass.zip
rm -rf dart-sass

chmod +x dart

#!/bin/bash

# Script to generate app icons for macOS (.icns) and Windows (.ico)

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$PROJECT_DIR/assets"
SOURCE_ICON="$ASSETS_DIR/icon.png"

echo "Generating app icons..."

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Source icon not found at $SOURCE_ICON"
    exit 1
fi

# Create iconset directory for macOS
ICONSET_DIR="$ASSETS_DIR/icon.iconset"
mkdir -p "$ICONSET_DIR"

# Generate different sizes for macOS .icns
echo "Generating macOS icon sizes..."
sips -z 16 16     "$SOURCE_ICON" --out "$ICONSET_DIR/icon_16x16.png" > /dev/null
sips -z 32 32     "$SOURCE_ICON" --out "$ICONSET_DIR/icon_16x16@2x.png" > /dev/null
sips -z 32 32     "$SOURCE_ICON" --out "$ICONSET_DIR/icon_32x32.png" > /dev/null
sips -z 64 64     "$SOURCE_ICON" --out "$ICONSET_DIR/icon_32x32@2x.png" > /dev/null
sips -z 128 128   "$SOURCE_ICON" --out "$ICONSET_DIR/icon_128x128.png" > /dev/null
sips -z 256 256   "$SOURCE_ICON" --out "$ICONSET_DIR/icon_128x128@2x.png" > /dev/null
sips -z 256 256   "$SOURCE_ICON" --out "$ICONSET_DIR/icon_256x256.png" > /dev/null
sips -z 512 512   "$SOURCE_ICON" --out "$ICONSET_DIR/icon_256x256@2x.png" > /dev/null
sips -z 512 512   "$SOURCE_ICON" --out "$ICONSET_DIR/icon_512x512.png" > /dev/null
sips -z 1024 1024 "$SOURCE_ICON" --out "$ICONSET_DIR/icon_512x512@2x.png" > /dev/null

# Convert iconset to .icns
echo "Creating macOS .icns file..."
iconutil -c icns "$ICONSET_DIR" -o "$ASSETS_DIR/icon.icns"

# Clean up iconset directory
rm -rf "$ICONSET_DIR"

# Generate Windows .ico
# For Windows, we'll create multiple sizes and combine them
echo "Generating Windows icon sizes..."
TEMP_DIR="$ASSETS_DIR/temp_ico"
mkdir -p "$TEMP_DIR"

sips -z 16 16     "$SOURCE_ICON" --out "$TEMP_DIR/icon_16.png" > /dev/null
sips -z 32 32     "$SOURCE_ICON" --out "$TEMP_DIR/icon_32.png" > /dev/null
sips -z 48 48     "$SOURCE_ICON" --out "$TEMP_DIR/icon_48.png" > /dev/null
sips -z 64 64     "$SOURCE_ICON" --out "$TEMP_DIR/icon_64.png" > /dev/null
sips -z 128 128   "$SOURCE_ICON" --out "$TEMP_DIR/icon_128.png" > /dev/null
sips -z 256 256   "$SOURCE_ICON" --out "$TEMP_DIR/icon_256.png" > /dev/null

# For .ico creation, we'll use the 256x256 as the main icon
# electron-builder will handle the multi-size .ico creation
cp "$TEMP_DIR/icon_256.png" "$ASSETS_DIR/icon.ico.png"

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo "✓ Icons generated successfully!"
echo "  - macOS: $ASSETS_DIR/icon.icns"
echo "  - Windows: $ASSETS_DIR/icon.ico.png (will be converted by electron-builder)"
echo ""
echo "Note: electron-builder will automatically convert icon.ico.png to icon.ico during build"

#!/bin/bash
# Build script for WebAssembly target using Emscripten

set -e

echo "=== Spirits of Steel: Community Edition - WebAsm Build ==="

# Check if Emscripten is installed
if ! command -v emconfigure &> /dev/null; then
    echo "Error: Emscripten SDK not found. Please install it first."
    echo "Visit: https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Create build directory
BUILD_DIR="build_wasm"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

echo "Configuring CMake for WebAssembly..."
emconfigure cmake \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_TOOLCHAIN_FILE="${EMSCRIPTEN}/cmake/Emscripten.cmake" \
    -DEMSCRIPTEN=ON \
    -DBUILD_SHARED_LIBS=OFF \
    ../

echo "Building WebAssembly target..."
emmake make -j$(nproc)

echo ""
echo "=== Build Complete ==="
echo "Output files:"
echo "  - sosandce.js   (Emscripten loader)"
echo "  - sosandce.wasm (WebAssembly binary)"
echo ""
echo "To serve locally for testing:"
echo "  cd $BUILD_DIR"
echo "  python3 -m http.server 8080"
echo ""
echo "Then visit: http://localhost:8080"

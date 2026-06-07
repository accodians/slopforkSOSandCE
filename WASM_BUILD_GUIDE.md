# WebAssembly Build Guide - Spirits of Steel: Community Edition

This guide explains how to build and deploy the game as WebAssembly for browser play.

## Prerequisites

You'll need:
- Node.js 16+ (for testing)
- CMake 3.16+
- Emscripten SDK (latest)

## Installation

### 1. Install Emscripten SDK

Follow the official Emscripten installation guide:
https://emscripten.org/docs/getting_started/downloads.html

On Linux/macOS:
```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

On Windows (PowerShell):
```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
.\emsdk.bat install latest
.\emsdk.bat activate latest
```

## Building

### Using the Build Script (Recommended)

```bash
chmod +x build_wasm.sh
./build_wasm.sh
```

### Manual Build

```bash
mkdir -p build_wasm
cd build_wasm

emconfigure cmake \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_TOOLCHAIN_FILE="${EMSCRIPTEN}/cmake/Emscripten.cmake" \
    ../

emmake make -j$(nproc)
```

## Testing Locally

After building, serve the files with a local web server:

```bash
cd build_wasm
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

**Important**: The game must be served over HTTP/HTTPS, not via `file://` protocol.

## Project Structure

```
.
├── source/SOSandCE_CPP/          # Original C++ source
│   ├── src/                      # Game source code
│   ├── include/                  # Headers and libraries (SDL2, ImGui, etc.)
│   └── assets/                   # Game assets (UI, images, etc.)
│
├── src/wasm/                     # WebAsm-specific code
│   └── wasm_entry.cpp           # Emscripten bindings
│
├── web/                          # Web interface
│   ├── index.html               # Main page
│   ├── styles.css               # Styling
│   └── game_wrapper.js          # JavaScript wrapper
│
├── CMakeLists_wasm.txt          # WebAsm CMake configuration
├── build_wasm.sh                # Build automation script
└── WASM_BUILD_GUIDE.md          # This file
```

## Build Output

After a successful build, you'll find:

- `build_wasm/sosandce.js` - Emscripten runtime loader
- `build_wasm/sosandce.wasm` - Compiled WebAssembly binary (~30-50 MB)
- `build_wasm/web/` - Web interface files

## Deployment

### Option 1: GitHub Pages

The GitHub Actions workflow automatically deploys to GitHub Pages on main branch push.

1. Enable GitHub Pages in repository settings
2. Set source to `gh-pages` branch
3. Workflow will deploy on each push to `main`

### Option 2: Manual Deployment

```bash
# Build the project
./build_wasm.sh

# Copy to your web server
scp -r build_wasm/* user@yourserver.com:/var/www/html/sosandce/
```

### Option 3: Docker

Create a Dockerfile:

```dockerfile
FROM emscripten/emsdk:latest

WORKDIR /workspace
COPY . .

RUN chmod +x build_wasm.sh && ./build_wasm.sh

FROM nginx:alpine
COPY --from=0 /workspace/build_wasm /usr/share/nginx/html
```

Build and run:
```bash
docker build -t sosandce-wasm .
docker run -p 8080:80 sosandce-wasm
```

## Performance Considerations

### Memory

The default WebAsm build is configured with:
- Initial memory: 256 MB
- Maximum memory: 2 GB (for growth)

Adjust in `CMakeLists_wasm.txt` if needed:
```cmake
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s INITIAL_MEMORY=536870912")  # 512 MB
```

### Compilation Flags

For faster gameplay (less optimized):
```bash
-s WASM=1 -O0 -s INITIAL_MEMORY=268435456
```

For smaller file size:
```bash
-s WASM=1 -Oz -s WASM_ASYNC_COMPILATION=1
```

For better performance:
```bash
-s WASM=1 -O3 -s AGGRESSIVE_VARIABLE_ELIMINATION=1
```

## Troubleshooting

### "CORS error" or "Failed to load .wasm"

Make sure you're serving over HTTP, not `file://`. Use a local server like Python's http.server.

### Game is slow

- Check browser console for errors
- Try reducing initial memory size
- Ensure you're using an optimized build (`-O2` or `-O3`)
- Check system resources - WebAsm needs sufficient RAM and CPU

### Missing assets or UI elements

Verify that assets are copied correctly:
```bash
ls -R build_wasm/assets/
```

### Emscripten version issues

If you encounter compatibility issues, pin to a specific version:
```bash
./emsdk install 3.1.27
./emsdk activate 3.1.27
```

## Next Steps

1. **Optimize rendering**: Implement WebGL 2 for better graphics performance
2. **Add save/load**: Use IndexedDB for persistent game saves
3. **Implement multiplayer**: Add WebSocket support for online play
4. **Mobile optimization**: Improve touch controls and responsive UI
5. **Audio optimization**: Use Web Audio API more efficiently

## Useful Links

- [Emscripten Documentation](https://emscripten.org/docs/)
- [WebAssembly.org](https://webassembly.org/)
- [SDL2 Emscripten Guide](https://emscripten.org/docs/porting/multimedia_and_graphics/SDL2.html)
- [Browser Compatibility](https://caniuse.com/wasm)

## Support

For issues specific to this WebAsm implementation:
1. Check the GitHub Issues
2. Review Emscripten troubleshooting guide
3. Check browser console for error messages
4. Enable Emscripten debug mode: `-s DEMANGLE_SUPPORT=1`

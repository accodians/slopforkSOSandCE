/**
 * Spirits of Steel: Community Edition - WebAsm Game Wrapper
 * Handles initialization, input, and rendering loop
 */

let game = null;
let lastFrameTime = 0;
const targetFPS = 60;
const frameTime = 1000 / targetFPS;

/**
 * Initialize the game when Emscripten runtime is ready
 */
Module.onRuntimeInitialized = async function() {
    try {
        console.log("Emscripten runtime initialized");
        
        // Create game instance
        game = new Module.GameWrapper();
        console.log("Game instance created");
        
        // Initialize game
        game.initGame();
        console.log("Game initialized");
        
        // Setup canvas
        const canvas = document.getElementById('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Hide loading overlay
        const overlay = document.getElementById('overlay');
        overlay.classList.add('hidden');
        
        // Update status
        const status = document.getElementById('status');
        status.textContent = "Game running";
        status.style.color = "#2ecc71";
        
        // Start game loop
        lastFrameTime = performance.now();
        requestAnimationFrame(gameLoop);
        
        // Setup input handlers
        setupInputHandlers();
        
        // Handle window resize
        window.addEventListener('resize', handleWindowResize);
        
        console.log("Game wrapper initialized successfully");
    } catch (error) {
        console.error("Failed to initialize game:", error);
        const status = document.getElementById('status');
        status.textContent = "Error: " + error.message;
        status.style.color = "#e74c3c";
    }
};

/**
 * Main game loop - called via requestAnimationFrame
 */
function gameLoop(currentTime) {
    if (!game || !game.isGameRunning()) {
        return;
    }

    // Calculate delta time
    const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.05); // Cap at 50ms
    lastFrameTime = currentTime;

    // Update game state
    game.updateGame(deltaTime);
    
    // Render game
    game.renderGame();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

/**
 * Setup input event handlers
 */
function setupInputHandlers() {
    if (!game) return;

    // Keyboard input
    document.addEventListener('keydown', function(event) {
        if (game && game.isGameRunning()) {
            game.handleKeyDown(event.keyCode);
        }
    });

    document.addEventListener('keyup', function(event) {
        if (game && game.isGameRunning()) {
            game.handleKeyUp(event.keyCode);
        }
    });

    // Mouse input
    const canvas = document.getElementById('canvas');
    
    canvas.addEventListener('mousemove', function(event) {
        if (game && game.isGameRunning()) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            game.handleMouseMove(x, y);
        }
    });

    canvas.addEventListener('click', function(event) {
        if (game && game.isGameRunning()) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const button = event.button; // 0=left, 1=middle, 2=right
            game.handleMouseClick(x, y, button);
        }
    });

    canvas.addEventListener('wheel', function(event) {
        if (game && game.isGameRunning()) {
            event.preventDefault();
            const delta = event.deltaY > 0 ? 1 : -1;
            game.handleMouseWheel(delta);
        }
    }, { passive: false });

    // Touch input for mobile
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);
    canvas.addEventListener('touchend', handleTouchEnd, false);
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Touch input handlers for mobile devices
 */
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
    if (!game || !game.isGameRunning()) return;
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    game.handleMouseClick(touch.clientX, touch.clientY, 0);
}

function handleTouchMove(event) {
    if (!game || !game.isGameRunning()) return;
    event.preventDefault();
    const touch = event.touches[0];
    game.handleMouseMove(touch.clientX, touch.clientY);
}

function handleTouchEnd(event) {
    if (!game || !game.isGameRunning()) return;
    // Handle touch end if needed
}

/**
 * Error handling
 */
window.addEventListener('error', function(event) {
    console.error("Runtime error:", event);
    if (game) {
        game.shutdown();
    }
});

/**
 * Handle page unload
 */
window.addEventListener('beforeunload', function() {
    if (game) {
        game.shutdown();
    }
});

console.log("Game wrapper loaded and ready");

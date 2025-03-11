// jumpButton.js - Handles all jump button functionality

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the jump button once the game is loaded
  document.addEventListener('game-loaded', initJumpButton);
  
  // Also try to initialize on window load as a fallback
  window.addEventListener('load', initJumpButton);
});

// Track if we've already initialized to prevent duplicate handlers
let jumpButtonInitialized = false;

/**
 * Initialize the jump button functionality
 */
function initJumpButton() {
  // Only initialize once
  if (jumpButtonInitialized) return;
  
  const jumpButton = document.getElementById('jumpButton');
  if (!jumpButton) {
    console.error('Jump button not found in the DOM');
    return;
  }
  
  console.log('Initializing jump button');
  
  // Add the jump event handler
  jumpButton.addEventListener('mousedown', handleJumpAction);
  jumpButton.addEventListener('touchstart', handleJumpAction);
  
  // Mark as initialized
  jumpButtonInitialized = true;
  console.log('Jump button initialized successfully');
}

/**
 * Handle the jump action when button is pressed
 * @param {Event} e - The event object
 */
function handleJumpAction(e) {
  // Prevent default behavior (important for touch events)
  e.preventDefault();
  
  console.log('Jump button pressed');
  
  // Get the active Phaser scene
  if (!window.game || !window.game.scene) {
    console.error('Game not initialized');
    return;
  }
  
  // Find the active scene
  const activeScene = window.game.scene.scenes.find(scene => scene.sys.settings.active);
  if (!activeScene) {
    console.error('No active scene found');
    return;
  }
  
  console.log('Active scene found, triggering jump');
  
  // Method 1: Trigger the jump via event
  activeScene.input.emit('jumpButtonPressed');
  
  // Method 2: Simulate space key press
  if (activeScene.jumpButton) {
    activeScene.jumpButton.isDown = true;
    
    // Release the key after a short delay
    setTimeout(() => {
      if (activeScene && activeScene.jumpButton) {
        activeScene.jumpButton.isDown = false;
      }
    }, 100);
  }
}

// Export for potential use in other modules
export { initJumpButton }; 
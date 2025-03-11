/**
 * Handles touch controls for mobile devices
 */
export default class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.swipeThreshold = 50; // Minimum distance for a swipe
    
    // Use the correct ID
    this.jumpButton = document.getElementById('jumpButton');
    
    // Initialize touch controls
    this.setupTouchControls();
    
    // Flag to track if we're on a touch device
    this.isTouchDevice = this.checkTouchDevice();
  }
  
  checkTouchDevice() {
    return ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) || 
           (navigator.msMaxTouchPoints > 0);
  }
  
  setupTouchControls() {
    try {
      // Jump button
      if (this.jumpButton) {
        this.jumpButton.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.scene.events.emit('jumpButtonPressed');
        });
      } else {
        console.error("Jump button not found in TouchControls");
      }
      
      // Swipe detection for lane changes
      const gameContainer = document.getElementById('game-container');
      if (gameContainer) {
        gameContainer.addEventListener('touchstart', (e) => {
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        }, { passive: false });
        
        gameContainer.addEventListener('touchmove', (e) => {
          // Prevent scrolling while playing
          e.preventDefault();
        }, { passive: false });
        
        gameContainer.addEventListener('touchend', (e) => {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          
          const deltaX = touchEndX - this.touchStartX;
          const deltaY = touchEndY - this.touchStartY;
          
          // Only detect horizontal swipes (ignore vertical swipes)
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
            if (deltaX > 0) {
              // Swipe right
              this.scene.events.emit('swipeRight');
            } else {
              // Swipe left
              this.scene.events.emit('swipeLeft');
            }
          }
        }, { passive: false });
      }
    } catch (error) {
      console.error("Error setting up touch controls:", error);
    }
  }
  
  // Check if we're on a touch device
  isMobileDevice() {
    return this.isTouchDevice;
  }
  
  // Clean up event listeners
  destroy() {
    if (this.jumpButton) {
      this.jumpButton.removeEventListener('touchstart', this.jumpHandler);
    }
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.removeEventListener('touchstart', this.touchStartHandler);
      gameContainer.removeEventListener('touchmove', this.touchMoveHandler);
      gameContainer.removeEventListener('touchend', this.touchEndHandler);
    }
  }
} 
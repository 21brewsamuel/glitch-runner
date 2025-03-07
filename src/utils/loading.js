// Hide loading screen when game is ready
document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  
  // Create a more reliable way to detect when Phaser game is ready
  const checkGameLoaded = () => {
    // Check if Phaser canvas exists in the game container
    const gameCanvas = document.querySelector('#game-container canvas');
    
    if (gameCanvas) {
      console.log('Game canvas detected, hiding loading screen');
      // Hide loading screen with animation
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        // Remove from DOM after animation completes
        setTimeout(() => {
          loadingScreen.remove();
        }, 500);
      }, 500);
    } else {
      console.log('Waiting for game to load...');
      // Check again in 200ms
      setTimeout(checkGameLoaded, 200);
    }
  };
  
  // Start checking after a short delay to allow scripts to load
  setTimeout(checkGameLoaded, 500);
}); 
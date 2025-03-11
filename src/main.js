import Phaser from 'phaser';
import { config } from './config.js';
import GameScene from './scenes/GameScene.js';

// Register scenes
const gameScene = new GameScene();
const scenes = [gameScene];

// Create the game with our configuration
const game = new Phaser.Game({
  ...config,
  // Explicitly tell Phaser to use our game-container
  parent: 'game-container',
  scene: scenes,
  callbacks: {
    postBoot: function() {
      // Signal that the game has loaded
      document.dispatchEvent(new Event('game-loaded'));
      
      // Force a resize to ensure mobile display is correct
      window.dispatchEvent(new Event('resize'));
      
      // Ensure jump button is visible
      setTimeout(() => {
        const jumpButton = document.getElementById('jumpButton');
        if (jumpButton) {
          jumpButton.style.display = 'flex';
          jumpButton.style.opacity = '1';
          console.log("Jump button style after game boot:", jumpButton.style.display);
        }
      }, 500);
    }
  }
});

// Listen for the game-loaded event
document.addEventListener('game-loaded', () => {
  console.log('Game has finished booting');
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
  
  // Ensure jump button is visible after loading screen is gone
  setTimeout(() => {
    const jumpButton = document.getElementById('jumpButton');
    if (jumpButton) {
      jumpButton.style.display = 'flex';
      jumpButton.style.opacity = '1';
    }
  }, 1000);
});

// Export the game instance in case we need it elsewhere
export default game; 
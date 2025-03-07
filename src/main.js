import Phaser from 'phaser';
import { config } from './config.js';
import GameScene from './scenes/GameScene.js';

// Register scenes
const gameScene = new GameScene();
const scenes = [gameScene];

// Create the game with our configuration
const game = new Phaser.Game({
  ...config,
  scene: scenes
});

// Export the game instance in case we need it elsewhere
export default game; 
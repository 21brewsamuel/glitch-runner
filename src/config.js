// Game configuration
export const config = {
  type: Phaser.AUTO,
  backgroundColor: "#222222",
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-container',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
    min: {
      width: 375,
      height: 667
    },
    max: {
      width: 800,
      height: 600
    },
    zoom: 1
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  }
};

// Game constants
export const CONSTANTS = {
  // Player constants
  NORMAL_JUMP_VELOCITY: -450,
  SLOWED_JUMP_VELOCITY: -250,
  BOOSTED_JUMP_VELOCITY: -600,
  
  // Game timing - faster paced
  INITIAL_GLITCH_INTERVAL: 8000, // Increased from 6000 for less frequent glitches
  
  // Game speeds
  BASE_GAME_SPEED: 200,
  BOOSTED_GAME_SPEED: 400,
  
  // Spawn intervals - optimized for fast gameplay
  OBSTACLE_SPAWN_INTERVAL: 1800, // Slightly faster obstacles
  FAKE_POWERUP_SPAWN_INTERVAL: 12000, // Less frequent fake powerups
  JUMP_POWERUP_SPAWN_INTERVAL: 20000, // Less frequent jump powerups
  SLOW_JUMP_POWERUP_SPAWN_INTERVAL: 25000, // Less frequent slow jump
  SPEED_POWERUP_SPAWN_INTERVAL: 18000, // More frequent speed boosts
  SHIELD_POWERUP_SPAWN_INTERVAL: 30000, // Less frequent shields
  JUMP_BOOST_POWERUP_SPAWN_INTERVAL: 22000, // Slightly less frequent
  
  // Effect durations - shorter for faster gameplay
  INVERTED_CONTROLS_DURATION: 2500, // Reduced from 3000
  SLOWED_JUMP_DURATION: 3500, // Reduced from 4000
  JUMP_DISABLED_DURATION: 4000, // Reduced from 5000
  SCREEN_FLIP_DURATION: 4000, // Reduced from 6000
  GRAVITY_FLIP_DURATION: 1500, // Reduced from 2000
  SPEED_BOOST_DURATION: 4000, // Reduced from 5000
  SHIELD_DURATION: 6000, // Reduced from 8000
  JUMP_BOOST_DURATION: 5000 // Reduced from 6000
}; 
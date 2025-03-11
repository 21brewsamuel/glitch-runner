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
  
  // Game timing
  INITIAL_GLITCH_INTERVAL: 6000,
  
  // Game speeds
  BASE_GAME_SPEED: 200,
  BOOSTED_GAME_SPEED: 400,
  
  // Spawn intervals
  OBSTACLE_SPAWN_INTERVAL: 2000,
  FAKE_POWERUP_SPAWN_INTERVAL: 8000,
  JUMP_POWERUP_SPAWN_INTERVAL: 15000,
  SLOW_JUMP_POWERUP_SPAWN_INTERVAL: 18000,
  SPEED_POWERUP_SPAWN_INTERVAL: 20000,
  SHIELD_POWERUP_SPAWN_INTERVAL: 25000,
  JUMP_BOOST_POWERUP_SPAWN_INTERVAL: 22000,
  
  // Effect durations
  INVERTED_CONTROLS_DURATION: 3000,
  SLOWED_JUMP_DURATION: 4000,
  JUMP_DISABLED_DURATION: 5000,
  SCREEN_FLIP_DURATION: 6000,
  GRAVITY_FLIP_DURATION: 2000,
  SPEED_BOOST_DURATION: 5000,
  SHIELD_DURATION: 8000,
  JUMP_BOOST_DURATION: 6000
}; 
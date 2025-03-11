import Phaser from 'phaser';
import { CONSTANTS } from '../config.js';
import Player from '../entities/Player.js';
import Obstacles from '../entities/Obstacles.js';
import Glitches from '../effects/Glitches.js';
import SpeedManager from '../utils/speedManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    this.survivalTime = 0;
    this.glitchInterval = CONSTANTS.INITIAL_GLITCH_INTERVAL;
    this.gameSpeed = 200;
    this.isGameOver = false;
  }
  
  preload() {
    // Create all textures before they're needed
    this.createTextures();
  }
  
  create() {
    // Reset game state
    this.survivalTime = 0;
    this.glitchInterval = CONSTANTS.INITIAL_GLITCH_INTERVAL;
    this.gameSpeed = 200;
    this.isGameOver = false;
    
    // Add background
    this.createBackground();
    
    // Create ground with a digital/neon look
    this.ground = this.physics.add.staticGroup();
    const groundSprite = this.ground.create(400, 580, 'obstacle').setScale(40, 1).refreshBody();
    groundSprite.setTint(0x00ff99);
    
    // Create player
    this.player = new Player(this, 100, 450);
    
    // Create obstacles manager
    this.obstaclesManager = new Obstacles(this);
    
    // Create glitches manager
    this.glitchesManager = new Glitches(this);
    
    // Set up collisions
    this.physics.add.collider(this.player.sprite, this.ground);
    this.physics.add.collider(this.obstaclesManager.getObstaclesGroup(), this.ground);
    this.physics.add.collider(this.obstaclesManager.getFakePowerUpsGroup(), this.ground);
    this.physics.add.collider(this.obstaclesManager.getJumpPowerUpsGroup(), this.ground);
    this.physics.add.collider(this.obstaclesManager.getSlowJumpPowerUpsGroup(), this.ground);
    
    // Add colliders for new power-ups
    this.physics.add.collider(this.obstaclesManager.getSpeedPowerUpsGroup(), this.ground);
    this.physics.add.collider(this.obstaclesManager.getShieldPowerUpsGroup(), this.ground);
    this.physics.add.collider(this.obstaclesManager.getJumpBoostPowerUpsGroup(), this.ground);
    
    // Collision with obstacles ends the game - use bind to maintain context
    this.physics.add.overlap(
      this.player.sprite, 
      this.obstaclesManager.getObstaclesGroup(), 
      this.handleGameOver.bind(this),
      null, 
      this
    );
    
    // Collision with fake power-ups triggers a glitch effect
    this.physics.add.overlap(
      this.player.sprite, 
      this.obstaclesManager.getFakePowerUpsGroup(), 
      (player, powerUp) => this.glitchesManager.triggerGlitch(player, powerUp),
      null, 
      this
    );
    
    // Collision with jump power-ups disables jumping
    this.physics.add.overlap(
      this.player.sprite, 
      this.obstaclesManager.getJumpPowerUpsGroup(), 
      (player, powerUp) => this.glitchesManager.disableJump(player, powerUp),
      null, 
      this
    );
    
    // Collision with slow jump power-ups slows jumping
    this.physics.add.overlap(
      this.player.sprite, 
      this.obstaclesManager.getSlowJumpPowerUpsGroup(), 
      (player, powerUp) => this.glitchesManager.slowJump(player, powerUp),
      null, 
      this
    );
    
    // Collision with speed power-ups
    this.physics.add.overlap(
      this.player.sprite, 
      this.obstaclesManager.getSpeedPowerUpsGroup(), 
      (player, powerUp) => this.glitchesManager.activateSpeedBoost(this.player, powerUp),
      null, 
      this
    );
    
    // Collision with shield power-ups
    this.physics.add.overlap(
      this.player.sprite, 
      this.obstaclesManager.getShieldPowerUpsGroup(), 
      (player, powerUp) => this.glitchesManager.activateShield(this.player, powerUp),
      null, 
      this
    );
    
    // Collision with jump boost power-ups
    this.physics.add.overlap(
      this.player.sprite, 
      this.obstaclesManager.getJumpBoostPowerUpsGroup(), 
      (player, powerUp) => this.glitchesManager.activateJumpBoost(this.player, powerUp),
      null, 
      this
    );
    
    // Set up controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Add event listener for jump button
    this.input.on('jumpButtonPressed', () => {
      if (this.player.sprite.body.touching.down && !this.player.sprite.getData('jumpDisabled')) {
        this.player.jump();
      }
    });
    
    // Score and leaderboard text
    this.scoreText = this.add.text(16, 16, 'Survival Time: 0', { fontSize: '24px', fill: '#fff' });
    this.leaderboardText = this.add.text(16, 50, 'High Score: 0', { fontSize: '18px', fill: '#fff' });
    
    // Start spawning obstacles with error handling
    this.obstacleTimer = this.time.addEvent({
      delay: CONSTANTS.OBSTACLE_SPAWN_INTERVAL,
      callback: () => {
        try {
          this.obstaclesManager.spawnObstacle();
        } catch (error) {
          console.error("Error spawning obstacle:", error);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    // Start spawning fake power-ups with error handling
    this.fakePowerUpTimer = this.time.addEvent({
      delay: CONSTANTS.FAKE_POWERUP_SPAWN_INTERVAL,
      callback: () => {
        try {
          this.obstaclesManager.spawnFakePowerUp();
        } catch (error) {
          console.error("Error spawning fake power-up:", error);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    // Start spawning jump power-ups with error handling
    this.jumpPowerUpTimer = this.time.addEvent({
      delay: CONSTANTS.JUMP_POWERUP_SPAWN_INTERVAL,
      callback: () => {
        try {
          this.obstaclesManager.spawnJumpPowerUp();
        } catch (error) {
          console.error("Error spawning jump power-up:", error);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    // Start spawning slow jump power-ups with error handling
    this.slowJumpPowerUpTimer = this.time.addEvent({
      delay: CONSTANTS.SLOW_JUMP_POWERUP_SPAWN_INTERVAL,
      callback: () => {
        try {
          this.obstaclesManager.spawnSlowJumpPowerUp();
        } catch (error) {
          console.error("Error spawning slow jump power-up:", error);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    // Start spawning speed power-ups
    this.speedPowerUpTimer = this.time.addEvent({
      delay: CONSTANTS.SPEED_POWERUP_SPAWN_INTERVAL,
      callback: () => {
        try {
          this.obstaclesManager.spawnSpeedPowerUp();
        } catch (error) {
          console.error("Error spawning speed power-up:", error);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    // Start spawning shield power-ups
    this.shieldPowerUpTimer = this.time.addEvent({
      delay: CONSTANTS.SHIELD_POWERUP_SPAWN_INTERVAL,
      callback: () => {
        try {
          this.obstaclesManager.spawnShieldPowerUp();
        } catch (error) {
          console.error("Error spawning shield power-up:", error);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    // Start spawning jump boost power-ups
    this.jumpBoostPowerUpTimer = this.time.addEvent({
      delay: CONSTANTS.JUMP_BOOST_POWERUP_SPAWN_INTERVAL,
      callback: () => {
        try {
          this.obstaclesManager.spawnJumpBoostPowerUp();
        } catch (error) {
          console.error("Error spawning jump boost power-up:", error);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    // Set up random glitch events with increased frequency
    this.glitchInterval = CONSTANTS.INITIAL_GLITCH_INTERVAL / 2; // Cut the initial interval in half
    this.glitchEventTimer = this.time.addEvent({
      delay: this.glitchInterval,
      callback: () => {
        try {
          this.triggerRandomGlitch();
        } catch (error) {
          console.error("Error triggering random glitch:", error);
        }
      },
      callbackScope: this,
      loop: true
    });
    
    // Create ground lines for visual effect
    this.createGroundLines();
    
    // Create parallax background elements
    this.createParallaxElements();
    
    // Add performance monitoring
    this.fpsText = this.add.text(700, 16, '', { fontSize: '16px', fill: '#fff' });
    this.lastFpsUpdate = 0;
    
    // Initialize the speed manager
    this.speedManager = new SpeedManager(this);
    
    // Listen for speed changes
    this.events.on('speedIncreased', (newSpeed) => {
      // Update any game elements that depend on speed
      this.gameSpeed = newSpeed;
      
      // If you have obstacle speed
      this.obstacleSpeed = newSpeed;
      
      // If you have a background that scrolls
      // this.background.setScrollSpeed(newSpeed);
    });
  }
  
  update(time, delta) {
    if (this.isGameOver) return;
    
    try {
      // Update FPS counter every 500ms
      if (time - this.lastFpsUpdate > 500) {
        this.fpsText.setText(`FPS: ${Math.round(1000 / delta)}`);
        this.lastFpsUpdate = time;
      }
      
      // Update survival time
      this.survivalTime += delta / 1000; // Convert ms to seconds
      this.scoreText.setText('Survival Time: ' + Math.floor(this.survivalTime));
      
      // Calculate game speed (increases over time)
      this.gameSpeed = 200 + Math.min(this.survivalTime * 10, 300);
      
      // Update player
      this.player.update(this.cursors, this.jumpButton, this.gameSpeed);
      
      // Update obstacles
      this.obstaclesManager.update(this.gameSpeed);
      
      // Update ground lines
      this.updateGroundLines(this.gameSpeed);
      
      // Update parallax background elements
      this.updateParallaxElements(this.gameSpeed);
      
      // Clean up any destroyed objects to prevent memory leaks
      this.cleanupDestroyedObjects();
      
      // Get the current speed whenever needed
      const currentSpeed = this.speedManager.getCurrentSpeed();
      
      // Use currentSpeed for any speed-dependent calculations
    } catch (error) {
      console.error("Error in update loop:", error);
    }
  }
  
  handleGameOver(player, obstacle) {
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    
    // Stop all timers to prevent further spawning
    this.obstacleTimer.remove();
    this.fakePowerUpTimer.remove();
    this.jumpPowerUpTimer.remove();
    this.slowJumpPowerUpTimer.remove();
    this.speedPowerUpTimer.remove();
    this.shieldPowerUpTimer.remove();
    this.jumpBoostPowerUpTimer.remove();
    this.glitchEventTimer.remove();
    
    // Call the game over method from glitches manager
    this.glitchesManager.gameOver(player, obstacle);
  }
  
  cleanupDestroyedObjects() {
    // Manually clean up destroyed objects to prevent memory leaks
    this.children.each(child => {
      if (child.active === false) {
        this.children.remove(child);
      }
    });
  }
  
  createTextures() {
    // Create stick figure runner frames
    this.createRunnerFrames();
    
    // Create obstacle texture
    let obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0xff0000, 1);
    obstacleGraphics.fillRect(0, 0, 30, 50);
    obstacleGraphics.generateTexture('obstacle', 30, 50);
    obstacleGraphics.destroy();
    
    // Create fake power-up texture
    let powerUpGraphics = this.add.graphics();
    powerUpGraphics.fillStyle(0x00ffff, 1);
    powerUpGraphics.fillCircle(15, 15, 15);
    powerUpGraphics.generateTexture('fakePowerUp', 30, 30);
    powerUpGraphics.destroy();
    
    // Create jump power-up texture
    let jumpPowerUpGraphics = this.add.graphics();
    jumpPowerUpGraphics.fillStyle(0xff00ff, 1);
    jumpPowerUpGraphics.fillCircle(15, 15, 15);
    jumpPowerUpGraphics.lineStyle(2, 0xffff00, 1);
    jumpPowerUpGraphics.beginPath();
    jumpPowerUpGraphics.moveTo(5, 15);
    jumpPowerUpGraphics.lineTo(25, 15);
    jumpPowerUpGraphics.strokePath();
    jumpPowerUpGraphics.beginPath();
    jumpPowerUpGraphics.moveTo(10, 10);
    jumpPowerUpGraphics.lineTo(20, 10);
    jumpPowerUpGraphics.strokePath();
    jumpPowerUpGraphics.beginPath();
    jumpPowerUpGraphics.moveTo(10, 20);
    jumpPowerUpGraphics.lineTo(20, 20);
    jumpPowerUpGraphics.strokePath();
    jumpPowerUpGraphics.generateTexture('jumpPowerUp', 30, 30);
    jumpPowerUpGraphics.destroy();
    
    // Create slow jump power-up texture
    let slowJumpGraphics = this.add.graphics();
    slowJumpGraphics.fillStyle(0x00ffff, 1);
    slowJumpGraphics.fillCircle(15, 15, 15);
    slowJumpGraphics.lineStyle(2, 0xffff00, 1);
    slowJumpGraphics.beginPath();
    slowJumpGraphics.moveTo(5, 10);
    slowJumpGraphics.lineTo(25, 10);
    slowJumpGraphics.strokePath();
    slowJumpGraphics.beginPath();
    slowJumpGraphics.moveTo(15, 5);
    slowJumpGraphics.lineTo(15, 25);
    slowJumpGraphics.strokePath();
    slowJumpGraphics.generateTexture('slowJumpPowerUp', 30, 30);
    slowJumpGraphics.destroy();
  }
  
  createRunnerFrames() {
    // Create running animation frames
    let graphics = this.add.graphics();
    
    // Frame 1: Running pose - right foot forward
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 10, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 18);
    graphics.lineTo(13, 40);
    // Arms - running position
    graphics.moveTo(14, 22);
    graphics.lineTo(25, 15); // right arm forward and up
    graphics.moveTo(14, 22);
    graphics.lineTo(5, 30);  // left arm back
    // Legs - running position
    graphics.moveTo(13, 40);
    graphics.lineTo(20, 55); // right leg forward
    graphics.moveTo(13, 40);
    graphics.lineTo(5, 50);  // left leg back
    graphics.strokePath();
    graphics.generateTexture("run1", 30, 60);
    graphics.clear();
    
    // Frame 2: Running pose - transitioning
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 10, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 18);
    graphics.lineTo(13, 40);
    // Arms - transitioning
    graphics.moveTo(14, 22);
    graphics.lineTo(20, 20); // right arm transitioning
    graphics.moveTo(14, 22);
    graphics.lineTo(8, 20);  // left arm transitioning
    // Legs - transitioning
    graphics.moveTo(13, 40);
    graphics.lineTo(15, 53); // right leg transitioning
    graphics.moveTo(13, 40);
    graphics.lineTo(10, 53); // left leg transitioning
    graphics.strokePath();
    graphics.generateTexture("run2", 30, 60);
    graphics.clear();
    
    // Frame 3: Running pose - left foot forward
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 10, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 18);
    graphics.lineTo(13, 40);
    // Arms - running position (opposite of frame 1)
    graphics.moveTo(14, 22);
    graphics.lineTo(5, 15);  // left arm forward and up
    graphics.moveTo(14, 22);
    graphics.lineTo(25, 30); // right arm back
    // Legs - running position (opposite of frame 1)
    graphics.moveTo(13, 40);
    graphics.lineTo(5, 55);  // left leg forward
    graphics.moveTo(13, 40);
    graphics.lineTo(20, 50); // right leg back
    graphics.strokePath();
    graphics.generateTexture("run3", 30, 60);
    graphics.clear();
    
    // Frame 4: Running pose - transitioning back
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 10, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 19);
    graphics.lineTo(13, 41);
    // Arms - transitioning
    graphics.moveTo(14, 23);
    graphics.lineTo(20, 23); // right arm moving
    graphics.moveTo(14, 23);
    graphics.lineTo(8, 23);  // left arm moving
    // Legs - transitioning
    graphics.moveTo(13, 41);
    graphics.lineTo(18, 53); // right leg transitioning
    graphics.moveTo(13, 41);
    graphics.lineTo(8, 53);  // left leg transitioning
    graphics.strokePath();
    graphics.generateTexture("run4", 30, 60);
    graphics.clear();
    
    // Jump frame
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 10, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 18);
    graphics.lineTo(13, 40);
    // Arms - both up for jump
    graphics.moveTo(14, 22);
    graphics.lineTo(5, 15);  // left arm up
    graphics.moveTo(14, 22);
    graphics.lineTo(23, 15); // right arm up
    // Legs - tucked for jump
    graphics.moveTo(13, 40);
    graphics.lineTo(8, 45);  // left leg tucked
    graphics.moveTo(13, 40);
    graphics.lineTo(18, 45); // right leg tucked
    graphics.strokePath();
    graphics.generateTexture("jump", 30, 60);
    graphics.clear();
    
    // Landing frame
    graphics.lineStyle(2, 0xffffff, 1);
    // Head
    graphics.strokeCircle(15, 10, 8);
    // Body - slightly leaning forward
    graphics.beginPath();
    graphics.moveTo(15, 18);
    graphics.lineTo(13, 40);
    // Arms - out for balance
    graphics.moveTo(14, 22);
    graphics.lineTo(0, 22);  // left arm out
    graphics.moveTo(14, 22);
    graphics.lineTo(28, 22); // right arm out
    // Legs - bent for landing
    graphics.moveTo(13, 40);
    graphics.lineTo(8, 50);  // left leg bent
    graphics.moveTo(13, 40);
    graphics.lineTo(18, 50); // right leg bent
    graphics.strokePath();
    graphics.generateTexture("land", 30, 60);
    graphics.clear();
    
    // Glitched frame
    graphics.lineStyle(2, 0x00ffff, 1);
    // Glitched head
    graphics.strokeCircle(15, 10, 8);
    // Glitched body - with artifacts
    graphics.beginPath();
    graphics.moveTo(15, 18);
    graphics.lineTo(13, 40);
    // Random lines to simulate glitches
    for (let i = 0; i < 5; i++) {
      const x1 = Phaser.Math.Between(0, 30);
      const y1 = Phaser.Math.Between(0, 60);
      const x2 = Phaser.Math.Between(0, 30);
      const y2 = Phaser.Math.Between(0, 60);
      graphics.moveTo(x1, y1);
      graphics.lineTo(x2, y2);
    }
    graphics.strokePath();
    graphics.generateTexture("glitched", 30, 60);
    graphics.destroy();
  }
  
  createBackground() {
    // Create a grid pattern background
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.8);
    
    // Draw vertical lines
    for (let x = 0; x <= 800; x += 40) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, 600);
      gridGraphics.strokePath();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= 600; y += 40) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(800, y);
      gridGraphics.strokePath();
    }
    
    // Add some random digital elements
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const size = Phaser.Math.Between(5, 15);
      
      if (Math.random() < 0.5) {
        // Circle
        gridGraphics.lineStyle(1, 0x00ffff, 0.5);
        gridGraphics.strokeCircle(x, y, size);
      } else {
        // Square
        gridGraphics.lineStyle(1, 0xff00ff, 0.5);
        gridGraphics.strokeRect(x - size/2, y - size/2, size, size);
      }
    }
  }
  
  createGroundLines() {
    this.groundLines = [];
    
    // Create several lines on the ground for a sense of movement
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(0, 800);
      const width = Phaser.Math.Between(30, 100);
      const line = this.add.line(
        x, 580, 0, 0, width, 0, 0x00ff99, 0.8
      );
      this.groundLines.push(line);
    }
  }
  
  createParallaxElements() {
    this.bgElements = [];
    
    // Create background elements that move at different speeds
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(100, 500);
      const size = Phaser.Math.Between(10, 30);
      const parallaxFactor = Phaser.Math.FloatBetween(0.3, 0.9);
      
      let element;
      if (Math.random() < 0.5) {
        // Circle
        element = this.add.circle(x, y, size, 0x00ffff, 0.2);
      } else {
        // Rectangle
        element = this.add.rectangle(x, y, size, size, 0xff00ff, 0.2);
      }
      
      element.setData('parallaxFactor', parallaxFactor);
      this.bgElements.push(element);
    }
  }
  
  updateGroundLines(gameSpeed) {
    // Update ground lines to create a moving effect
    for (let i = 0; i < this.groundLines.length; i++) {
      const line = this.groundLines[i];
      line.x -= gameSpeed / 60;
      
      // Reset line position when it goes off screen
      if (line.x < -line.width) {
        line.x = 800 + line.width;
        line.width = Phaser.Math.Between(30, 100);
      }
    }
  }
  
  updateParallaxElements(gameSpeed) {
    // Update parallax background elements
    for (let i = 0; i < this.bgElements.length; i++) {
      const element = this.bgElements[i];
      const factor = element.getData('parallaxFactor');
      element.x -= (gameSpeed / 60) * factor;
      
      // Reset element position when it goes off screen
      if (element.x < -50) {
        element.x = 850;
      }
    }
  }
  
  triggerRandomGlitch() {
    // Reduce the chance to skip (was 0.3, now 0.15)
    if (Math.random() < 0.15) {
      return;
    }
    
    // Create a fake power-up at the player's position to trigger a glitch
    const fakePowerUp = this.obstaclesManager.getFakePowerUpsGroup().create(
      this.player.sprite.x, 
      this.player.sprite.y, 
      'fakePowerUp'
    );
    fakePowerUp.visible = false;
    
    // Decrease the interval between glitches more aggressively
    this.glitchInterval = Math.max(4000, this.glitchInterval - 200); // More aggressive decrease (was 100), lower minimum (was 8000)
    this.glitchEventTimer.delay = this.glitchInterval;
    
    // Trigger the glitch effect
    this.glitchesManager.triggerGlitch(this.player.sprite, fakePowerUp);
  }
  
  shutdown() {
    // ... existing code ...
    
    if (this.speedManager) {
      this.speedManager.destroy();
    }
    
    // ... rest of your shutdown method ...
  }
} 
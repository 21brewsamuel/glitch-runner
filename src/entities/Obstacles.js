export default class Obstacles {
  constructor(scene) {
    this.scene = scene;
    
    // Track recent obstacle positions to avoid collisions
    this.recentObstacles = [];
    this.recentPowerUps = [];
    
    // Create obstacle group
    this.obstacles = scene.physics.add.group();
    
    // Create fake power-up group
    this.fakePowerUps = scene.physics.add.group();
    
    // Create jump suspension power-up group
    this.jumpPowerUps = scene.physics.add.group();
    
    // Create slow jump power-up group
    this.slowJumpPowerUps = scene.physics.add.group();
    
    // Create speed boost power-up group
    this.speedPowerUps = scene.physics.add.group({
      bounceX: 0.5,
      bounceY: 0.5,
      collideWorldBounds: true
    });
    
    // Create shield power-up group
    this.shieldPowerUps = scene.physics.add.group({
      bounceX: 0.5,
      bounceY: 0.5,
      collideWorldBounds: true
    });
    
    // Create jump boost power-up group
    this.jumpBoostPowerUps = scene.physics.add.group({
      bounceX: 0.5,
      bounceY: 0.5,
      collideWorldBounds: true
    });
    
    // Create textures for new power-ups
    this.createPowerUpTextures();
  }
  
  createPowerUpTextures() {
    try {
      // Create speed boost power-up texture
      const speedGraphics = this.scene.add.graphics();
      speedGraphics.fillStyle(0xffff00, 1); // Yellow base
      speedGraphics.fillCircle(15, 15, 15);
      // Add lightning bolt details
      speedGraphics.lineStyle(2, 0xff0000, 1);
      speedGraphics.beginPath();
      speedGraphics.moveTo(15, 5);
      speedGraphics.lineTo(10, 15);
      speedGraphics.lineTo(15, 15);
      speedGraphics.lineTo(10, 25);
      speedGraphics.lineTo(20, 10);
      speedGraphics.lineTo(15, 10);
      speedGraphics.lineTo(20, 5);
      speedGraphics.closePath();
      speedGraphics.strokePath();
      speedGraphics.generateTexture("speedPowerUp", 30, 30);
      speedGraphics.destroy();
      
      // Create shield power-up texture
      const shieldGraphics = this.scene.add.graphics();
      shieldGraphics.fillStyle(0x0000ff, 1); // Blue base
      shieldGraphics.fillCircle(15, 15, 15);
      // Add shield details
      shieldGraphics.lineStyle(2, 0xffffff, 1);
      shieldGraphics.beginPath();
      shieldGraphics.arc(15, 15, 10, 0, Math.PI * 2);
      shieldGraphics.strokePath();
      shieldGraphics.lineStyle(2, 0xffffff, 1);
      shieldGraphics.beginPath();
      shieldGraphics.moveTo(15, 8);
      shieldGraphics.lineTo(15, 22);
      shieldGraphics.strokePath();
      shieldGraphics.beginPath();
      shieldGraphics.moveTo(8, 15);
      shieldGraphics.lineTo(22, 15);
      shieldGraphics.strokePath();
      shieldGraphics.generateTexture("shieldPowerUp", 30, 30);
      shieldGraphics.destroy();
      
      // Create jump boost power-up texture
      const jumpBoostGraphics = this.scene.add.graphics();
      jumpBoostGraphics.fillStyle(0x00ff00, 1); // Green base
      jumpBoostGraphics.fillCircle(15, 15, 15);
      // Add arrow details
      jumpBoostGraphics.lineStyle(2, 0xffffff, 1);
      jumpBoostGraphics.beginPath();
      jumpBoostGraphics.moveTo(15, 5);
      jumpBoostGraphics.lineTo(15, 25);
      jumpBoostGraphics.strokePath();
      // Arrow head
      jumpBoostGraphics.beginPath();
      jumpBoostGraphics.moveTo(15, 5);
      jumpBoostGraphics.lineTo(10, 12);
      jumpBoostGraphics.moveTo(15, 5);
      jumpBoostGraphics.lineTo(20, 12);
      jumpBoostGraphics.strokePath();
      jumpBoostGraphics.generateTexture("jumpBoostPowerUp", 30, 30);
      jumpBoostGraphics.destroy();
    } catch (error) {
      console.error("Error creating power-up textures:", error);
    }
  }
  
  update(gameSpeed) {
    // Move obstacles with improved performance
    const obstacles = this.obstacles.getChildren();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];
      obstacle.setVelocityX(-gameSpeed);
      
      // Remove obstacles that have gone off screen
      if (obstacle.x < -50) {
        obstacle.destroy();
      }
    }
    
    // Clean up old tracking data (less frequent cleanup for performance)
    if (this.scene.time.now % 1000 < 16) { // Approximately once per second
      this.recentObstacles = this.recentObstacles.filter(pos => pos.x > 600);
      this.recentPowerUps = this.recentPowerUps.filter(pos => pos.x > 600);
    }
    
    // Move all power-ups
    this.updatePowerUpGroup(this.fakePowerUps, gameSpeed);
    this.updatePowerUpGroup(this.jumpPowerUps, gameSpeed);
    this.updatePowerUpGroup(this.slowJumpPowerUps, gameSpeed);
    this.updatePowerUpGroup(this.speedPowerUps, gameSpeed);
    this.updatePowerUpGroup(this.shieldPowerUps, gameSpeed);
    this.updatePowerUpGroup(this.jumpBoostPowerUps, gameSpeed);
  }
  
  updatePowerUpGroup(group, gameSpeed) {
    const children = group.getChildren();
    
    // Use for loop for better performance
    for (let i = children.length - 1; i >= 0; i--) {
      const powerUp = children[i];
      powerUp.setVelocityX(-gameSpeed);
      
      // Remove power-ups that have gone off screen
      if (powerUp.x < -50) {
        powerUp.destroy();
        continue;
      }
      
      // Add a glitchy rotation to power-ups (reduced frequency)
      powerUp.rotation += 0.015;
      
      // Random color flicker for fake power-ups (reduced frequency)
      if (group === this.fakePowerUps && Math.random() < 0.02) {
        powerUp.setTint(Phaser.Math.Between(0, 1) ? 0x00ffff : 0xff00ff);
      }
    }
  }
  
  spawnObstacle() {
    // Create obstacle at the right edge of the screen
    const obstacle = this.obstacles.create(850, 520, 'obstacle');
    obstacle.setOrigin(0, 1);
    
    // Random height variation
    const scale = Phaser.Math.FloatBetween(0.5, 1.5);
    obstacle.setScale(1, scale);
    obstacle.refreshBody();
    
    // Track this obstacle position
    this.recentObstacles.push({ x: 850, time: Date.now() });
  }
  
  // Check if a position is safe for power-up spawning
  isSafePosition(x, y) {
    const minDistance = 120; // Minimum distance from obstacles
    
    // Check against recent obstacles
    for (let obstacle of this.recentObstacles) {
      const distance = Math.abs(x - obstacle.x);
      if (distance < minDistance) {
        return false;
      }
    }
    
    // Check against recent power-ups
    for (let powerUp of this.recentPowerUps) {
      const distance = Math.abs(x - powerUp.x);
      if (distance < 80) { // Minimum distance between power-ups
        return false;
      }
    }
    
    return true;
  }
  
  // Get a safe spawn position for power-ups
  getSafeSpawnPosition() {
    const attempts = 10;
    for (let i = 0; i < attempts; i++) {
      const x = Phaser.Math.Between(900, 1200); // Spawn further ahead
      const y = Phaser.Math.Between(300, 500);
      
      if (this.isSafePosition(x, y)) {
        return { x, y };
      }
    }
    
    // Fallback position if no safe position found
    return { x: 1200, y: Phaser.Math.Between(300, 500) };
  }
  
  spawnFakePowerUp() {
    // Reduce chance to spawn for faster gameplay (50% chance to skip)
    if (Math.random() < 0.5) {
      return;
    }
    
    // Get safe spawn position
    const pos = this.getSafeSpawnPosition();
    const powerUp = this.fakePowerUps.create(pos.x, pos.y, 'fakePowerUp');
    powerUp.setBounce(0.3);
    
    // Track this power-up position
    this.recentPowerUps.push({ x: pos.x, time: Date.now() });
    
    // Add a pulsing effect to make it enticing
    this.scene.tweens.add({
      targets: powerUp,
      scale: { from: 1, to: 1.1 },
      duration: 400,
      yoyo: true,
      repeat: -1
    });
  }
  
  spawnJumpPowerUp() {
    // Reduce chance to spawn for faster gameplay (70% chance to skip)
    if (Math.random() < 0.7) {
      return;
    }
    
    // Get safe spawn position
    const pos = this.getSafeSpawnPosition();
    const powerUp = this.jumpPowerUps.create(pos.x, pos.y, 'jumpPowerUp');
    powerUp.setBounce(0.3);
    
    // Track this power-up position
    this.recentPowerUps.push({ x: pos.x, time: Date.now() });
    
    // Add a pulsing effect
    this.scene.tweens.add({
      targets: powerUp,
      scale: { from: 1, to: 1.1 },
      duration: 400,
      yoyo: true,
      repeat: -1
    });
  }
  
  spawnSlowJumpPowerUp() {
    // Reduce chance to spawn for faster gameplay (75% chance to skip)
    if (Math.random() < 0.75) {
      return;
    }
    
    // Get safe spawn position
    const pos = this.getSafeSpawnPosition();
    const powerUp = this.slowJumpPowerUps.create(pos.x, pos.y, 'slowJumpPowerUp');
    powerUp.setBounce(0.3);
    
    // Track this power-up position
    this.recentPowerUps.push({ x: pos.x, time: Date.now() });
    
    // Add a pulsing effect
    this.scene.tweens.add({
      targets: powerUp,
      scale: { from: 1, to: 1.1 },
      duration: 400,
      yoyo: true,
      repeat: -1
    });
  }
  
  spawnSpeedPowerUp() {
    // Reduce chance to spawn for faster gameplay (80% chance to skip)
    if (Math.random() < 0.8) {
      return;
    }
    
    try {
      // Get safe spawn position
      const pos = this.getSafeSpawnPosition();
      const powerUp = this.speedPowerUps.create(pos.x, pos.y, 'speedPowerUp');
      
      // Ensure physics body is enabled
      powerUp.setActive(true);
      powerUp.setVisible(true);
      powerUp.setBounce(0.3);
      powerUp.setCollideWorldBounds(true);
      powerUp.body.setGravityY(300);
      
      // Track this power-up position
      this.recentPowerUps.push({ x: pos.x, time: Date.now() });
      
      // Add a pulsing effect
      this.scene.tweens.add({
        targets: powerUp,
        scale: { from: 1, to: 1.1 },
        duration: 400,
        yoyo: true,
        repeat: -1
      });
    } catch (error) {
      console.error("Error spawning speed power-up:", error);
    }
  }
  
  spawnShieldPowerUp() {
    // Keep rare but increase skip rate (85% chance to skip)
    if (Math.random() < 0.85) {
      return;
    }
    
    try {
      // Get safe spawn position
      const pos = this.getSafeSpawnPosition();
      const powerUp = this.shieldPowerUps.create(pos.x, pos.y, 'shieldPowerUp');
      
      // Ensure physics body is enabled
      powerUp.setActive(true);
      powerUp.setVisible(true);
      powerUp.setBounce(0.3);
      powerUp.setCollideWorldBounds(true);
      powerUp.body.setGravityY(300);
      
      // Track this power-up position
      this.recentPowerUps.push({ x: pos.x, time: Date.now() });
      
      // Add a pulsing effect
      this.scene.tweens.add({
        targets: powerUp,
        scale: { from: 1, to: 1.1 },
        duration: 400,
        yoyo: true,
        repeat: -1
      });
    } catch (error) {
      console.error("Error spawning shield power-up:", error);
    }
  }
  
  spawnJumpBoostPowerUp() {
    // Reduce chance to spawn for faster gameplay (80% chance to skip)
    if (Math.random() < 0.8) {
      return;
    }
    
    try {
      // Get safe spawn position
      const pos = this.getSafeSpawnPosition();
      const powerUp = this.jumpBoostPowerUps.create(pos.x, pos.y, 'jumpBoostPowerUp');
      
      // Ensure physics body is enabled
      powerUp.setActive(true);
      powerUp.setVisible(true);
      powerUp.setBounce(0.3);
      powerUp.setCollideWorldBounds(true);
      powerUp.body.setGravityY(300);
      
      // Track this power-up position
      this.recentPowerUps.push({ x: pos.x, time: Date.now() });
      
      // Add a pulsing effect
      this.scene.tweens.add({
        targets: powerUp,
        scale: { from: 1, to: 1.1 },
        duration: 400,
        yoyo: true,
        repeat: -1
      });
    } catch (error) {
      console.error("Error spawning jump boost power-up:", error);
    }
  }
  
  getObstaclesGroup() {
    return this.obstacles;
  }
  
  getFakePowerUpsGroup() {
    return this.fakePowerUps;
  }
  
  getJumpPowerUpsGroup() {
    return this.jumpPowerUps;
  }
  
  getSlowJumpPowerUpsGroup() {
    return this.slowJumpPowerUps;
  }
  
  getSpeedPowerUpsGroup() {
    return this.speedPowerUps;
  }
  
  getShieldPowerUpsGroup() {
    return this.shieldPowerUps;
  }
  
  getJumpBoostPowerUpsGroup() {
    return this.jumpBoostPowerUps;
  }
} 